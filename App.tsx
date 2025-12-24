
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, AppNotification, SubCategory } from './types';
import { INITIAL_POSTS, MALE_CLOTHING_SUBCATEGORIES } from './constants';
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
import SearchScreen from './components/SearchScreen';
import RecommendationModal from './components/RecommendationModal';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CameraScreen from './components/CameraScreen';
import SubCategorySelectionScreen from './components/SubCategorySelectionScreen';
import ItemSelectionScreen from './components/ItemSelectionScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import CaptionModal from './components/CaptionModal';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    // VTO States
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoItem, setVtoItem] = useState<Item | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory | null>(null);

    const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
    const [viewedProfileData, setViewedProfileData] = useState<Profile | null>(null);
    const [viewedFolders, setViewedFolders] = useState<Folder[]>([]);
    const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [recommendationItem, setRecommendationItem] = useState<Item | null>(null);
    const [realBusinesses, setRealBusinesses] = useState<Category[]>([]);
    
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // --- AUTH LOGIC ---

    const ensureProfile = async (user: any): Promise<Profile> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) return data;

        const { data: created, error: insertError } = await supabase
            .from('profiles')
            .insert({
                user_id: user.id,
                username: user.email?.split('@')[0] ?? `user_${user.id.slice(0, 6)}`,
                full_name: user.user_metadata?.full_name || null,
                account_type: null
            })
            .select()
            .single();

        if (insertError) throw insertError;
        return created;
    };

    const handleAuthState = async (currentSession: Session | null) => {
        setAuthLoading(true);
        setSession(currentSession);
        fetchRealBusinesses();

        if (!currentSession?.user) {
            setProfile(null);
            setBusinessProfile(null);
            setCurrentScreen(Screen.Login);
            setAuthLoading(false);
            return;
        }

        try {
            const prof = await ensureProfile(currentSession.user);
            setProfile(prof);

            if (prof.account_type === 'business') {
                const [f, p] = await Promise.all([
                    supabase.from('folders').select('*').eq('owner_id', prof.user_id),
                    supabase.from('products').select('*').eq('owner_id', prof.user_id)
                ]);
                setFolders(f.data || []);
                setProducts(p.data || []);
                setBusinessProfile({
                    id: prof.user_id,
                    business_name: prof.full_name || prof.username,
                    business_category: 'fashion',
                    description: prof.bio || '',
                    logo_url: prof.avatar_url || ''
                });
                setCurrentScreen(Screen.VendorDashboard);
            } else if (prof.account_type === 'personal') {
                setCurrentScreen(Screen.Feed);
            } else {
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } catch (err) {
            console.error('[PROFILE ERROR]', err);
            toast.error("Houve um problema ao carregar seu perfil.");
            setCurrentScreen(Screen.Login);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string, name?: string }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ 
                    username: updates.username, 
                    bio: updates.bio, 
                    full_name: updates.name 
                })
                .eq('user_id', session.user.id)
                .select()
                .single();

            if (error) throw error;
            setProfile(data);

            if (data.account_type === 'business') {
                setBusinessProfile(prev => prev ? {
                    ...prev,
                    business_name: data.full_name || data.username,
                    description: data.bio || ''
                } : null);
            }
            toast.success("Perfil atualizado!");
        } catch (err: any) {
            toast.error("Erro ao atualizar perfil: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectAccountType = async (type: 'personal' | 'business') => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ account_type: type })
                .eq('user_id', session.user.id)
                .select()
                .single();

            if (error) throw error;
            setProfile(data);
            
            if (type === 'business') {
                setBusinessProfile({
                    id: data.user_id,
                    business_name: data.full_name || data.username,
                    business_category: 'fashion',
                    description: data.bio || '',
                    logo_url: data.avatar_url || ''
                });
                setCurrentScreen(Screen.VendorDashboard);
            } else {
                setCurrentScreen(Screen.Feed);
            }
        } catch (err: any) {
            toast.error("Falha ao salvar tipo de conta no banco.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setIsLoading(false);
    };

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthState(session);
        });
        
        supabase.auth.getSession().then(({ data }) => {
            handleAuthState(data.session);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    // --- CATALOG LOGIC ---

    const fetchRealBusinesses = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('account_type', 'business');
            if (error) throw error;
            const mapped: Category[] = (data || []).map(p => ({
                id: p.user_id,
                name: p.full_name || p.username,
                image: p.avatar_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg',
                type: 'fashion',
                subCategories: MALE_CLOTHING_SUBCATEGORIES, 
                isAd: false
            }));
            setRealBusinesses(mapped);
        } catch (err) {
            console.error('[FETCH BUSINESS ERROR]', err);
        }
    };

    const handleCreateFolder = async (title: string) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            await supabase.from('folders').insert({ title, owner_id: session.user.id });
            const { data } = await supabase.from('folders').select('*').eq('owner_id', session.user.id);
            setFolders(data || []);
            toast.success('Coleção criada ✅');
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    const handleAddProductToFolder = async (folderId: string | null, details: { title: string, description: string, price: number, file: Blob | null }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            let image_url: string | null = null;
            if (details.file) {
                const filePath = `${session.user.id}/${Date.now()}.jpg`;
                await supabase.storage.from('products').upload(filePath, details.file);
                const { data } = supabase.storage.from('products').getPublicUrl(filePath);
                image_url = data.publicUrl;
            }
            const { data: productData } = await supabase.from('products').insert({ owner_id: session.user.id, title: details.title, description: details.description, price: details.price, image_url, folder_id: folderId }).select().single();
            if (folderId && image_url) await supabase.from('folders').update({ cover_image: image_url }).eq('id', folderId);
            
            const [p, f] = await Promise.all([
                supabase.from('products').select('*').eq('owner_id', session.user.id),
                supabase.from('folders').select('*').eq('owner_id', session.user.id)
            ]);
            setProducts(p.data || []);
            setFolders(f.data || []);
            return productData;
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    // --- VTO LOGIC ---

    const startTryOn = (item: Item) => {
        setVtoItem(item);
        if (!userImage) {
            setCurrentScreen(Screen.ImageSourceSelection);
        } else {
            handleGenerateLook(userImage, item, vtoItems);
        }
    };

    const handlePhotoObtained = (url: string) => {
        setUserImage(url);
        if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
        else setCurrentScreen(Screen.Home);
        toast.success("Foto pronta! Escolha um item para provar.");
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
            if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
            else setCurrentScreen(Screen.Home);
        }
    };

    const handlePublishLook = async (caption: string) => {
        if (!generatedImage || !profile) return;
        setIsPublishing(true);
        try {
            const newPost: Post = {
                id: Math.random().toString(36).substr(2, 9),
                user: { id: profile.user_id, full_name: profile.full_name || profile.username, avatar_url: profile.avatar_url },
                image: generatedImage,
                items: vtoItems,
                likes: 0,
                isLiked: false,
                comments: [],
                commentCount: 0,
                caption: caption
            };
            setPosts(prev => [newPost, ...prev]);
            toast.success("Look publicado!");
            setShowCaptionModal(false);
            setCurrentScreen(Screen.Confirmation);
        } catch (err) { toast.error("Erro ao publicar."); } finally { setIsPublishing(false); }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;
        
        if (viewedProfileId && viewedProfileData) {
            const isSelf = profile?.user_id === viewedProfileId;
            return (
                <VendorDashboard 
                    businessProfile={{ id: viewedProfileData.user_id, business_name: viewedProfileData.full_name || viewedProfileData.username, business_category: 'fashion', description: viewedProfileData.bio || '', logo_url: viewedProfileData.avatar_url || '' }}
                    profile={viewedProfileData} onOpenMenu={() => setShowVendorMenu(true)} 
                    unreadNotificationCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} 
                    folders={isSelf ? folders : viewedFolders} products={isSelf ? products : viewedProducts} posts={posts} 
                    onCreateFolder={handleCreateFolder} onCreateProductInFolder={handleAddProductToFolder}
                    onMoveProductToFolder={async (pId, fId) => {}} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                    onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={setViewedProfileId}
                    isVisitor={!isSelf} onBack={() => setViewedProfileId(null)}
                />
            );
        }

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleSelectAccountType} />;
            case Screen.VendorDashboard: return businessProfile && profile && <VendorDashboard businessProfile={businessProfile} profile={profile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadCount} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} folders={folders} products={products} posts={posts} onCreateFolder={handleCreateFolder} onCreateProductInFolder={handleAddProductToFolder} onMoveProductToFolder={async () => {}} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={setViewedProfileId} />;
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} onStartCreate={() => { setVtoItems([]); setUserImage(null); setGeneratedImage(null); setCurrentScreen(Screen.ImageSourceSelection); }} unreadNotificationCount={unreadCount} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => { setVtoItems([]); setUserImage(null); setGeneratedImage(null); setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} onViewProfile={setViewedProfileId} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} posts={posts} items={[]} onViewProfile={setViewedProfileId} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onItemClick={startTryOn} onItemAction={startTryOn} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Pedido finalizado!"); setCartItems([]); }} />;
            
            // --- VTO FLOW ---
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handlePhotoObtained} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handlePhotoObtained} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.SubCategorySelection: return <SubCategorySelectionScreen node={{ id: 'root', name: 'Explorar', image: '', subCategories: MALE_CLOTHING_SUBCATEGORIES }} onSelectSubCategory={(sub) => { setCurrentSubCategory(sub); setCurrentScreen(Screen.ItemSelection); }} onBack={() => generatedImage ? setCurrentScreen(Screen.Result) : setCurrentScreen(Screen.Feed)} />;
            case Screen.ItemSelection: return userImage && currentSubCategory && <ItemSelectionScreen userImage={userImage} collectionId={currentSubCategory.id} collectionName={currentSubCategory.name} collectionType="fashion" onItemSelect={startTryOn} onOpenSplitCamera={() => {}} onBack={() => setCurrentScreen(Screen.SubCategorySelection)} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} onAddToCart={(i) => setCartItems(p => [...p, i])} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => { setCartItems(p => [...p, ...vtoItems]); setCurrentScreen(Screen.Cart); }} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.SubCategorySelection)} onGenerateVideo={() => {}} />;
            case Screen.Confirmation: return <ConfirmationScreen message="Look finalizado com sucesso!" onHome={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} />;
            
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {showCaptionModal && generatedImage && <CaptionModal image={generatedImage} onClose={() => setShowCaptionModal(false)} onPublish={handlePublishLook} isPublishing={isPublishing} />}
            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.VendorDashboard, Screen.VendorProducts, Screen.SubCategorySelection, Screen.ItemSelection].includes(currentScreen) && !viewedProfileId && (
                <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => { 
                        setViewedProfileId(null);
                        if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
                        else setCurrentScreen(Screen.Home);
                    }} onStartTryOn={() => {
                        setVtoItems([]);
                        setGeneratedImage(null);
                        setVtoItem(null);
                        setCurrentScreen(Screen.ImageSourceSelection);
                    }} isCartAnimating={false} accountType={profile.account_type} onNavigateToVendorAnalytics={() => {}} />
            )}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => {}} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={handleSignOut} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={startTryOn} />}
        </div>
    );
};

export default App;
