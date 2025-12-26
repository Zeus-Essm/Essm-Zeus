
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, Comment } from './types';
import { CATEGORIES } from './constants';
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
import VendorProductsScreen from './components/VendorProductsScreen';
// Fix: Import missing Vendor components to resolve "Cannot find name" errors
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import VendorMenuModal from './components/VendorMenuModal';
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
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [allMarketplaceProducts, setAllMarketplaceProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // --- CARREGAMENTO GLOBAL DE DADOS ---

    const fetchGlobalFeed = async () => {
        try {
            const { data: postsData, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (user_id, full_name, avatar_url, username),
                    comments:comments (
                        id, text, created_at, 
                        user:user_id (user_id, full_name, avatar_url)
                    ),
                    likes:likes (user_id)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (postsData) {
                const currentUserId = session?.user.id;
                const formattedPosts: Post[] = postsData.map(p => ({
                    id: p.id,
                    user_id: p.user_id,
                    user: { 
                        id: p.profiles.user_id, 
                        full_name: p.profiles.full_name || p.profiles.username, 
                        avatar_url: p.profiles.avatar_url 
                    },
                    image: p.image_url,
                    caption: p.caption,
                    likes: p.likes?.length || 0,
                    isLiked: p.likes?.some((l: any) => l.user_id === currentUserId),
                    created_at: p.created_at,
                    comments: p.comments.map((c: any) => ({
                        id: c.id,
                        text: c.text,
                        timestamp: c.created_at,
                        user: { id: c.user.user_id, full_name: c.user.full_name, avatar_url: c.user.avatar_url }
                    })),
                    commentCount: p.comments?.length || 0,
                    items: [] // Em uma versão futura, linkaríamos produtos aqui
                }));
                setPosts(formattedPosts);
            }
        } catch (err) {
            console.error("Erro ao carregar feed global:", err);
        }
    };

    const fetchMarketplace = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAllMarketplaceProducts(data || []);
        } catch (err) {
            console.error("Erro ao carregar mercado:", err);
        }
    };

    const fetchData = async (userId: string, isBusiness: boolean) => {
        setIsLoading(true);
        await Promise.all([
            fetchGlobalFeed(),
            fetchMarketplace()
        ]);

        if (isBusiness) {
            try {
                const [fRes, pRes] = await Promise.all([
                    supabase.from('folders').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
                    supabase.from('products').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
                ]);
                setFolders(fRes.data || []);
                setProducts(pRes.data || []);
            } catch (err) {
                console.error("Erro ao carregar dados do lojista:", err);
            }
        }
        setIsLoading(false);
    };

    const processAuth = async (currentSession: Session | null) => {
        setSession(currentSession);
        if (!currentSession) {
            setProfile(null);
            setBusinessProfile(null);
            setCurrentScreen(Screen.Login);
            setAuthLoading(false);
            return;
        }

        try {
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (profileData) {
                setProfile(profileData);
                const isBusiness = profileData.account_type === 'business';
                
                if (isBusiness) {
                    setBusinessProfile({
                        id: profileData.user_id,
                        business_name: profileData.full_name || 'Minha Loja',
                        business_category: 'fashion',
                        description: profileData.bio || '',
                        logo_url: profileData.avatar_url || ''
                    });
                    setCurrentScreen(Screen.VendorDashboard);
                } else if (profileData.account_type === 'personal') {
                    setCurrentScreen(Screen.Feed);
                } else {
                    setCurrentScreen(Screen.AccountTypeSelection);
                }
                
                await fetchData(currentSession.user.id, isBusiness);
            } else {
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } catch (err) {
            toast.error("Erro ao carregar perfil.");
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            processAuth(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    // --- INTERAÇÕES SOCIAIS ---

    const handleLikePost = async (postId: string) => {
        if (!session?.user) return;
        
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        try {
            if (post.isLiked) {
                await supabase.from('likes').delete().match({ post_id: postId, user_id: session.user.id });
            } else {
                await supabase.from('likes').insert({ post_id: postId, user_id: session.user.id });
            }
            fetchGlobalFeed(); // Atualiza o estado global
        } catch (err) {
            console.error("Erro ao curtir:", err);
        }
    };

    const handleAddComment = async (postId: string, text: string) => {
        if (!session?.user) return;
        try {
            const { error } = await supabase
                .from('comments')
                .insert({ post_id: postId, user_id: session.user.id, text });
            if (error) throw error;
            fetchGlobalFeed();
            toast.success("Comentário enviado!");
        } catch (err) {
            toast.error("Erro ao comentar.");
        }
    };

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
            toast.success('Coleção criada com sucesso!');
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
            fetchMarketplace(); // Sincroniza catálogo global
            toast.success("Produto adicionado ao seu catálogo!");
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
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({ 
                    user_id: session.user.id, 
                    account_type: type,
                    username: session.user.email?.split('@')[0] + Math.floor(Math.random()*1000)
                });
            
            if (error) throw error;
            await processAuth(session);
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
                        onCreateFolder={handleCreateFolder} 
                        onDeleteFolder={async (id) => {
                            await supabase.from('folders').delete().eq('id', id);
                            setFolders(prev => prev.filter(f => f.id !== id));
                        }} 
                        onCreateProductInFolder={handleAddProductToFolder} 
                        onDeleteProduct={async (id) => {
                            await supabase.from('products').delete().eq('id', id);
                            setProducts(prev => prev.filter(p => p.id !== id));
                        }}
                        onUpdateProfile={handleUpdateProfile} 
                        onUpdateProfileImage={() => {}}
                        onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)}
                        onOpenMenu={() => setShowVendorMenu(true)} 
                        unreadNotificationCount={0} 
                        onOpenNotificationsPanel={() => setIsNotificationsOpen(true)}
                        onOpenPromotionModal={() => {}} 
                        followersCount={0} 
                        followingCount={0}
                        onMoveProductToFolder={async () => {}} 
                        onLikePost={handleLikePost} 
                        onAddComment={handleAddComment} 
                        onItemClick={startTryOn} 
                        onViewProfile={() => {}}
                    />
                );
            case Screen.VendorProducts: 
                return businessProfile && (
                    <VendorProductsScreen 
                        onBack={() => setCurrentScreen(Screen.VendorDashboard)} 
                        businessProfile={businessProfile} 
                        products={products} 
                        folders={folders} 
                        onCreateProduct={handleAddProductToFolder} 
                        onDeleteProduct={(id) => {
                            supabase.from('products').delete().eq('id', id).then(() => {
                                setProducts(p => p.filter(x => x.id !== id));
                            });
                        }} 
                    />
                );
            // Fix: Add case for Screen.VendorAnalytics to handle navigation to the analytics screen
            case Screen.VendorAnalytics:
                return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.Feed: return profile && (
                <FeedScreen 
                    posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} 
                    isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={startTryOn} 
                    onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} onViewProfile={() => {}} 
                    onSelectCategory={() => {}} onLikePost={handleLikePost} onAddComment={handleAddComment} 
                    onNavigateToAllHighlights={() => {}} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    unreadNotificationCount={0} onNotificationsClick={() => setIsNotificationsOpen(true)} 
                    onSearchClick={() => setCurrentScreen(Screen.Search)} 
                />
            );
            case Screen.Home: return profile && (
                <HomeScreen 
                    loggedInProfile={profile} viewedProfileId={null} realBusinesses={CATEGORIES} 
                    onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} 
                    onSelectCategory={() => {}} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} 
                    onViewProfile={() => {}} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} 
                    unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} 
                    onLikePost={handleLikePost} onAddComment={handleAddComment} onSearchClick={() => setCurrentScreen(Screen.Search)} 
                />
            );
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={(url) => { setUserImage(url); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={(url) => { setUserImage(url); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => { setCartItems(p => [...p, ...vtoItems]); setCurrentScreen(Screen.Cart); }} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.SubCategorySelection)} onGenerateVideo={() => {}} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Pedido finalizado!"); setCartItems([]); }} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} posts={posts} items={allMarketplaceProducts.map(p => ({ id: p.id, name: p.title, description: p.description || '', price: p.price, image: p.image_url || '', category: p.category }))} onViewProfile={() => {}} onLikePost={handleLikePost} onItemClick={startTryOn} onItemAction={startTryOn} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className={`h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={[]} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showCaptionModal && generatedImage && (
                <CaptionModal 
                    image={generatedImage} 
                    onClose={() => setShowCaptionModal(false)} 
                    onPublish={async (caption) => {
                        if (!session?.user) return;
                        setIsLoading(true);
                        try {
                            const { data, error } = await supabase
                                .from('posts')
                                .insert({
                                    user_id: session.user.id,
                                    image_url: generatedImage,
                                    caption: caption
                                })
                                .select()
                                .single();
                            
                            if (error) throw error;
                            
                            await fetchGlobalFeed(); // Recarrega feed global para todos verem
                            setShowCaptionModal(false);
                            setCurrentScreen(Screen.Confirmation);
                        } catch (err: any) {
                            toast.error(err.message);
                        } finally {
                            setIsLoading(false);
                        }
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
