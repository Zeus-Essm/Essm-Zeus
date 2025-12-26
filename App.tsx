import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, AppNotification, SubCategory } from './types';
import { INITIAL_POSTS, MALE_CLOTHING_SUBCATEGORIES, CATEGORIES } from './constants';
import { toast } from './utils/toast';
import { generateTryOnImage } from './services/geminiService';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import HomeScreen from './components/HomeScreen';
import FeedScreen from './components/FeedScreen';
import CartScreen from './components/CartScreen';
import BottomNavBar from './components/BottomNavBar';
import VendorDashboard from './components/VendorDashboard';
import VendorMenuModal from './components/VendorMenuModal';
import VendorProductsScreen from './components/VendorProductsScreen';
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import SearchScreen from './components/SearchScreen';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CameraScreen from './components/CameraScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import CaptionModal from './components/CaptionModal';

const App: React.FC = () => {
    // --- ESTADOS CORE ---
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    // --- VTO ESTADOS ---
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // --- UI AUX ---
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [realBusinesses, setRealBusinesses] = useState<Category[]>(CATEGORIES);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [notifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // --- LÓGICA DE AUTENTICAÇÃO SUPABASE (ATUALIZADA PARA INICIAR NA SELEÇÃO) ---

    const handleAuthState = async (session: Session | null) => {
        setAuthLoading(true);
        setSession(session);

        // SE NÃO HOUVER SESSÃO, INICIA NA TELA DE SELEÇÃO DE USUÁRIO
        if (!session?.user) {
            setProfile({
                user_id: 'guest_user',
                username: 'visitante',
                full_name: 'Visitante PUMP',
                bio: 'Explorando as tendências de Angola.',
                avatar_url: null,
                account_type: null, // Mantém null para forçar a tela de seleção
                reward_points: 0
            });
            setBusinessProfile(null);
            setCurrentScreen(Screen.AccountTypeSelection); // Inicia aqui
            setAuthLoading(false);
            return;
        }

        const user = session.user;

        // 1️⃣ tentar buscar profile real
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        let profileData = existingProfile;

        // 2️⃣ se não existir, criar automaticamente
        if (!profileData) {
            const username =
                user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
                `user_${user.id.slice(0, 6)}`;

            const { data: createdProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    username,
                    full_name: user.user_metadata?.full_name ?? null,
                    avatar_url: user.user_metadata?.avatar_url ?? null,
                    account_type: null
                })
                .select()
                .single();

            if (insertError) {
                console.error('[PROFILE INSERT ERROR]', insertError);
                setCurrentScreen(Screen.AccountTypeSelection); // Fallback seguro
                setAuthLoading(false);
                return;
            }

            profileData = createdProfile;
        }

        // 3️⃣ carregar dados dependentes
        setProfile(profileData);

        if (profileData.account_type === 'business') {
            setBusinessProfile({
                id: user.id,
                business_name: profileData.full_name || profileData.username || 'Loja',
                business_category: 'fashion',
                description: profileData.bio || '',
                logo_url: profileData.avatar_url || ''
            });

            const [foldersRes, productsRes] = await Promise.all([
                supabase.from('folders').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
                supabase.from('products').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
            ]);

            setFolders(foldersRes.data || []);
            setProducts(productsRes.data || []);
            setCurrentScreen(Screen.VendorDashboard);
        } 
        else if (profileData.account_type === 'personal') {
            setCurrentScreen(Screen.Feed);
        } 
        else {
            setCurrentScreen(Screen.AccountTypeSelection);
        }

        setAuthLoading(false);
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthState(session);
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthState(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- AÇÕES DO BANCO ---

    const handleCreateFolder = async (title: string) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('folders')
                .insert({ title, owner_id: session.user.id })
                .select()
                .single();
            if (error) throw error;
            setFolders(prev => [data, ...prev]);
            toast.success('Coleção criada!');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToFolder = async (folderId: string | null, details: any) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const imageUrl = details.file ? URL.createObjectURL(details.file) : 'https://i.postimg.cc/LXmdq4H2/D.jpg';
            
            const { data, error } = await supabase
                .from('products')
                .insert({
                    owner_id: session.user.id,
                    folder_id: folderId,
                    title: details.title,
                    description: details.description,
                    price: details.price,
                    image_url: imageUrl,
                    category: 'fashion',
                    is_try_on: true
                })
                .select()
                .single();

            if (error) throw error;
            
            setProducts(prev => [data, ...prev]);

            if (folderId) {
                const targetFolder = folders.find(f => f.id === folderId);
                if (targetFolder && !targetFolder.cover_image) {
                    await supabase.from('folders').update({ cover_image: imageUrl }).eq('id', folderId);
                    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, cover_image: imageUrl } : f));
                }
            }

            toast.success("Produto adicionado!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: any) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ 
                    full_name: updates.name, 
                    bio: updates.bio, 
                    username: updates.username 
                })
                .eq('user_id', session.user.id)
                .select()
                .single();
            if (error) throw error;
            setProfile(data);
            toast.success("Perfil atualizado!");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccountTypeSelection = async (type: 'personal' | 'business') => {
        if (!session?.user) {
            // Se for visitante, apenas simulamos a mudança local
            setProfile(prev => prev ? {...prev, account_type: type} : null);
            
            if (type === 'business') {
                setBusinessProfile({
                    id: 'guest_business',
                    business_name: 'Minha Loja',
                    business_category: 'fashion',
                    description: 'Loja de teste (Visitante)',
                    logo_url: 'https://i.postimg.cc/LXmdq4H2/D.jpg'
                });
                setCurrentScreen(Screen.VendorDashboard);
            } else {
                setCurrentScreen(Screen.Feed);
            }
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ account_type: type })
                .eq('user_id', session.user.id);
            if (error) throw error;
            await handleAuthState(session);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const startTryOn = (item: Item) => {
        if (!userImage) setCurrentScreen(Screen.ImageSourceSelection);
        else handleGenerateLook(userImage, item, vtoItems);
    };

    const handleGenerateLook = async (image: string, item: Item, existing: Item[]) => {
        setCurrentScreen(Screen.Generating);
        try {
            const result = await generateTryOnImage(image, item, existing);
            setGeneratedImage(result);
            setVtoItems(prev => [...prev, item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            toast.error(err.message);
            setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home);
        }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onSuccess={() => {}} />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleAccountTypeSelection} />;
            case Screen.VendorDashboard: 
                return businessProfile && profile && (
                    <VendorDashboard 
                        businessProfile={businessProfile} profile={profile} folders={folders} products={products} posts={posts}
                        onCreateFolder={handleCreateFolder} onDeleteFolder={async (id) => {
                            if (!confirm('Excluir coleção?')) return;
                            await supabase.from('folders').delete().eq('id', id);
                            setFolders(prev => prev.filter(f => f.id !== id));
                        }} 
                        onCreateProductInFolder={handleAddProductToFolder} onDeleteProduct={async (id) => {
                            if (!confirm('Remover produto?')) return;
                            await supabase.from('products').delete().eq('id', id);
                            setProducts(prev => prev.filter(p => p.id !== id));
                        }}
                        onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}}
                        onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)}
                        onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadCount} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)}
                        onOpenPromotionModal={() => {}} followersCount={0} followingCount={0}
                        onMoveProductToFolder={async () => {}} onLikePost={(id) => setPosts(p => p.map(x => x.id === id ? {...x, isLiked: !x.isLiked} : x))} onAddComment={() => {}} 
                        onItemClick={startTryOn} onViewProfile={() => {}}
                    />
                );
            case Screen.VendorProducts: 
                return businessProfile && <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} products={products} folders={folders} onCreateProduct={handleAddProductToFolder} onDeleteProduct={() => {}} />;
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} onViewProfile={() => {}} onSelectCategory={() => {}} onLikePost={(id) => setPosts(p => p.map(x => x.id === id ? {...x, isLiked: !x.isLiked} : x))} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} unreadNotificationCount={unreadCount} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onSelectCategory={() => {}} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} onViewProfile={() => {}} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => setPosts(p => p.map(x => x.id === id ? {...x, isLiked: !x.isLiked} : x))} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={(url) => { setUserImage(url); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={(url) => { setUserImage(url); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => { setCartItems(p => [...p, ...vtoItems]); setCurrentScreen(Screen.Cart); }} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.SubCategorySelection)} onGenerateVideo={() => {}} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Pedido finalizado!"); setCartItems([]); }} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} posts={posts} items={[]} onViewProfile={() => {}} onLikePost={() => {}} onItemClick={startTryOn} onItemAction={startTryOn} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className={`h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showCaptionModal && generatedImage && (
                <CaptionModal 
                    image={generatedImage} 
                    onClose={() => setShowCaptionModal(false)} 
                    onPublish={(caption) => {
                        const newPost: Post = {
                            id: `post_${Date.now()}`,
                            user_id: profile?.user_id!,
                            user: { id: profile?.user_id!, full_name: profile?.full_name || profile?.username || 'Usuário', avatar_url: profile?.avatar_url || null },
                            image: generatedImage,
                            caption,
                            likes: 0,
                            isLiked: false,
                            created_at: new Date().toISOString(),
                            comments: [],
                            commentCount: 0,
                            items: [...vtoItems]
                        };
                        setPosts(prev => [newPost, ...prev]);
                        setShowCaptionModal(false);
                        setCurrentScreen(Screen.Confirmation);
                    }} 
                />
            )}
            
            {profile?.account_type === 'personal' && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search].includes(currentScreen) && (
                <BottomNavBar activeScreen={currentScreen} accountType="personal" onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => setCurrentScreen(Screen.Home)} onNavigateToVendorAnalytics={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} />
            )}
             {profile?.account_type === 'business' && [Screen.VendorDashboard, Screen.VendorProducts, Screen.VendorAnalytics, Screen.Feed, Screen.Search].includes(currentScreen) && (
                <BottomNavBar activeScreen={currentScreen} accountType="business" onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => {}} onNavigateToPromotion={() => {}} onNavigateToProfile={() => setCurrentScreen(Screen.VendorDashboard)} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} />
            )}
            {currentScreen === Screen.Confirmation && <ConfirmationScreen message="Look publicado no feed!" onHome={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} />}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={handleSignOut} />}
        </div>
    );
};

export default App;