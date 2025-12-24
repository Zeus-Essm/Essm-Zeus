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
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
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
    // --- AUTH & DATA STATES ---
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    // --- VTO & UI STATES ---
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoItem, setVtoItem] = useState<Item | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [currentSubCategory, setCurrentSubCategory] = useState<SubCategory | null>(null);

    const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
    const [viewedProfileData, setViewedProfileData] = useState<Profile | null>(null);
    const [viewedFolders, setViewedFolders] = useState<Folder[]>([]);
    const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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

    // =========================================================================
    // 1. AUTHENTICATION FLOW
    // =========================================================================

    const handleAccountTypeSelection = async (type: 'personal' | 'business') => {
        if (!session?.user) return;
        setAuthLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    account_type: type,
                    verification_status: type === 'business' ? 'unverified' : 'verified'
                })
                .eq('user_id', session.user.id);
            if (error) throw error;
            await handleAuthState(session);
            toast.success(`Conta ${type === 'personal' ? 'Pessoal' : 'Empresarial'} configurada!`);
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
            setAuthLoading(false);
        }
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
        const { data: dbProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .single();
        if (error || !dbProfile) {
            setCurrentScreen(Screen.Login); 
            setAuthLoading(false);
            return;
        }
        setProfile(dbProfile);
        if (!dbProfile.account_type) {
            setCurrentScreen(Screen.AccountTypeSelection);
        } else if (dbProfile.account_type === 'personal') {
            setCurrentScreen(Screen.Feed);
        } else if (dbProfile.account_type === 'business') {
            setBusinessProfile({
                id: dbProfile.user_id,
                business_name: dbProfile.full_name || dbProfile.username || 'Minha Loja',
                business_category: 'fashion',
                description: dbProfile.bio || '',
                logo_url: dbProfile.avatar_url || ''
            });
            setCurrentScreen(Screen.VendorDashboard);
            const [f, p] = await Promise.all([fetchFolders(dbProfile.user_id), fetchAllProducts(dbProfile.user_id)]);
            setFolders(f);
            setProducts(p);
        }
        setAuthLoading(false);
    };

    const handleSignOut = async () => {
        setShowVendorMenu(false); // FECHA IMEDIATAMENTE
        setIsSettingsOpen(false);
        await supabase.auth.signOut();
        setProfile(null);
        setBusinessProfile(null);
    };

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => handleAuthState(session));
        supabase.auth.getSession().then(({ data }) => handleAuthState(data.session));
        return () => listener.subscription.unsubscribe();
    }, []);

    // =========================================================================
    // 2. DATA FETCHING & ACTIONS (CATALOG MANAGEMENT)
    // =========================================================================

    const fetchRealBusinesses = async () => {
        try {
            const { data } = await supabase.from('profiles').select('*').eq('account_type', 'business');
            const mapped: Category[] = (data || []).map(p => ({
                id: p.user_id,
                name: p.full_name || p.username || 'Loja',
                image: p.avatar_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg',
                type: 'fashion',
                subCategories: MALE_CLOTHING_SUBCATEGORIES, 
                isAd: false
            }));
            setRealBusinesses(mapped);
        } catch (err) { console.error(err); }
    };

    const fetchFolders = async (userId: string) => {
        const { data } = await supabase.from("folders").select("*").eq('owner_id', userId).order("created_at", { ascending: false });
        return data || [];
    };

    const fetchAllProducts = async (userId: string) => {
        const { data } = await supabase.from("products").select("*").eq('owner_id', userId).order("created_at", { ascending: false });
        return data || [];
    };

    const handleCreateFolder = async (title: string) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            await supabase.from('folders').insert({ title, owner_id: session.user.id });
            const freshFolders = await fetchFolders(session.user.id);
            setFolders(freshFolders);
            toast.success('Coleção criada!');
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    const handleAddProductToFolder = async (folderId: string | null, details: { title: string, description: string, price: number, file: Blob | null }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            let image_url: string | null = null;
            if (details.file) {
                const filePath = `${session.user.id}/${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage.from('catalog').upload(filePath, details.file);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('catalog').getPublicUrl(filePath);
                image_url = data.publicUrl;
            }
            const { data: productData, error: insertError } = await supabase.from('products').insert({ 
                owner_id: session.user.id, title: details.title, description: details.description, price: details.price, 
                image_url, folder_id: folderId, is_try_on: true 
            }).select().single();
            if (insertError) throw insertError;
            if (folderId && image_url) await supabase.from('folders').update({ cover_image: image_url }).eq('id', folderId);
            const [p, f] = await Promise.all([fetchAllProducts(session.user.id), fetchFolders(session.user.id)]);
            setProducts(p);
            setFolders(f);
            toast.success("Produto adicionado!");
            return productData;
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Apagar este item permanentemente?")) return;
        if (!session?.user) return;
        setIsLoading(true);
        try {
            await supabase.from('products').delete().eq('id', productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
            toast.success("Item removido.");
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!confirm("Excluir esta coleção? Os itens serão movidos para a vitrine geral.")) return;
        if (!session?.user) return;
        setIsLoading(true);
        try {
            await supabase.from('products').update({ folder_id: null }).eq('folder_id', folderId);
            await supabase.from('folders').delete().eq('id', folderId);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            setProducts(prev => prev.map(p => p.folder_id === folderId ? {...p, folder_id: null} : p));
            toast.success("Coleção removida.");
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    const handleUpdateProfile = async (updates: { name: string, bio: string, username: string }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ full_name: updates.name, bio: updates.bio, username: updates.username })
                .eq('user_id', session.user.id).select().single();
            if (error) throw error;
            setProfile(data);
            if (data.account_type === 'business') {
                setBusinessProfile(prev => prev ? ({ ...prev, business_name: data.full_name, description: data.bio }) : null);
            }
            toast.success("Perfil atualizado!");
        } catch (err: any) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    // --- VTO ---
    const startTryOn = (item: Item) => {
        setVtoItem(item);
        if (!userImage) setCurrentScreen(Screen.ImageSourceSelection);
        else handleGenerateLook(userImage, item, vtoItems);
    };

    const handlePhotoObtained = (url: string) => {
        setUserImage(url);
        if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
        else setCurrentScreen(Screen.Home);
        toast.success("Foto pronta!");
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

    // Added missing handleSaveImage function used in ResultScreen
    const handleSaveImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `pump-look-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Imagem salva com sucesso!");
    };

    // Added missing handlePublishLook function used in CaptionModal
    const handlePublishLook = async (caption: string) => {
        if (!session?.user || !generatedImage) return;
        setIsPublishing(true);
        try {
            // Creating a full UI-compatible Post object
            const newPost: Post = {
                id: `post_${Date.now()}`,
                user_id: session.user.id,
                user: {
                    id: session.user.id,
                    full_name: profile?.full_name || profile?.username || 'Usuário',
                    avatar_url: profile?.avatar_url || null
                },
                image: generatedImage,
                image_url: generatedImage,
                caption,
                likes: 0,
                likes_count: 0,
                is_sponsored: false,
                isSponsored: false,
                created_at: new Date().toISOString(),
                comments: [],
                commentCount: 0,
                items: [...vtoItems]
            };
            
            setPosts(prev => [newPost, ...prev]);
            setShowCaptionModal(false);
            setCurrentScreen(Screen.Confirmation);
            toast.success("Seu look foi publicado!");
        } catch (err: any) {
            toast.error("Erro ao publicar: " + err.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;
        if (viewedProfileId && viewedProfileData) {
            const isSelf = profile?.user_id === viewedProfileId;
            return (
                <VendorDashboard 
                    businessProfile={{ id: viewedProfileData.user_id, business_name: viewedProfileData.full_name || viewedProfileData.username || 'Loja', business_category: 'fashion', description: viewedProfileData.bio || '', logo_url: viewedProfileData.avatar_url || '' }}
                    profile={viewedProfileData} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} 
                    folders={isSelf ? folders : viewedFolders} products={isSelf ? products : viewedProducts} posts={posts} 
                    onCreateFolder={handleCreateFolder} onDeleteFolder={handleDeleteFolder} onCreateProductInFolder={handleAddProductToFolder} onDeleteProduct={handleDeleteProduct} onMoveProductToFolder={async () => {}} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} onLikePost={() => {}} onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={setViewedProfileId} isVisitor={!isSelf} onBack={() => setViewedProfileId(null)}
                />
            );
        }

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onNavigateToSignUp={() => {}} />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleAccountTypeSelection} />;
            case Screen.VendorDashboard: return businessProfile && profile && <VendorDashboard businessProfile={businessProfile} profile={profile} folders={folders} products={products} posts={posts} onCreateFolder={handleCreateFolder} onDeleteFolder={handleDeleteFolder} onCreateProductInFolder={handleAddProductToFolder} onDeleteProduct={handleDeleteProduct} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadCount} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} onMoveProductToFolder={async () => {}} onLikePost={() => {}} onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={setViewedProfileId} />;
            case Screen.VendorProducts: return businessProfile && <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} products={products} folders={folders} onCreateProduct={handleAddProductToFolder} onDeleteProduct={handleDeleteProduct} />;
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onLikePost={() => {}} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} onStartCreate={() => { setVtoItems([]); setUserImage(null); setGeneratedImage(null); setCurrentScreen(Screen.ImageSourceSelection); }} unreadNotificationCount={unreadCount} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => { setVtoItems([]); setUserImage(null); setGeneratedImage(null); setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} onViewProfile={setViewedProfileId} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={() => {}} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Pedido finalizado!"); setCartItems([]); }} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handlePhotoObtained} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handlePhotoObtained} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.SubCategorySelection: return profile && <SubCategorySelectionScreen node={{ id: 'root', name: 'Explorar', image: '', subCategories: MALE_CLOTHING_SUBCATEGORIES }} onSelectSubCategory={(sub) => { setCurrentSubCategory(sub); setCurrentScreen(Screen.ItemSelection); }} onBack={() => { if (generatedImage) setCurrentScreen(Screen.Result); else setCurrentScreen(Screen.Feed); }} />;
            case Screen.ItemSelection: return userImage && currentSubCategory && <ItemSelectionScreen userImage={userImage} collectionId={currentSubCategory.id} collectionName={currentSubCategory.name} collectionType="fashion" onItemSelect={startTryOn} onOpenSplitCamera={() => {}} onBack={() => setCurrentScreen(Screen.SubCategorySelection)} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} onAddToCart={(i) => setCartItems(p => [...p, i])} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => { setCartItems(p => [...p, ...vtoItems]); setCurrentScreen(Screen.Cart); }} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={handleSaveImage} onItemSelect={startTryOn} onAddMoreItems={() => { setCurrentScreen(Screen.SubCategorySelection); }} onGenerateVideo={() => {}} />;
            case Screen.Confirmation: return <ConfirmationScreen message="Look finalizado!" onHome={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {showCaptionModal && generatedImage && <CaptionModal image={generatedImage} onClose={() => setShowCaptionModal(false)} onPublish={handlePublishLook} isPublishing={isPublishing} />}
            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.VendorDashboard, Screen.VendorProducts, Screen.VendorAnalytics].includes(currentScreen) && !viewedProfileId && (
                <BottomNavBar activeScreen={currentScreen} accountType={profile.account_type} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} onNavigateToProfile={() => { setViewedProfileId(null); if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard); else setCurrentScreen(Screen.Home); }} onStartTryOn={() => { setVtoItems([]); setGeneratedImage(null); setVtoItem(null); setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={false} />
            )}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={handleSignOut} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={startTryOn} />}
        </div>
    );
};

export default App;