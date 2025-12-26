import React, { useState, useEffect } from 'react';
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
    // --- ESTADOS CORE (MOCK LOCAL) ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
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

    // --- LÓGICA DE TRANSIÇÃO (VIRGEM) ---

    useEffect(() => {
        // Simula o carregamento inicial do app
        const timer = setTimeout(() => {
            setIsLoadingInitial(false);
            setCurrentScreen(Screen.Login);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleMockLogin = (email: string) => {
        setAuthLoading(true);
        // Simula criação de perfil local
        const mockProfile: Profile = {
            user_id: 'local_user_123',
            username: email.split('@')[0],
            full_name: 'Usuário Convidado',
            bio: 'Experimentando o PUMP Angola.',
            avatar_url: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
            account_type: null,
            reward_points: 150
        };
        
        setProfile(mockProfile);
        setIsLoggedIn(true);
        setCurrentScreen(Screen.AccountTypeSelection);
        setAuthLoading(false);
    };

    const [authLoading, setAuthLoading] = useState(false);

    // --- AÇÕES MOCK (SEM DATABASE) ---

    const handleCreateFolder = (title: string) => {
        const newFolder: Folder = {
            id: `folder_${Date.now()}`,
            owner_id: profile?.user_id || '0',
            title,
            cover_image: null,
            created_at: new Date().toISOString()
        };
        setFolders(prev => [newFolder, ...prev]);
        toast.success('Coleção criada localmente!');
    };

    const handleAddProductToFolder = async (folderId: string | null, details: any) => {
        setIsLoading(true);
        const imageUrl = details.file ? URL.createObjectURL(details.file) : 'https://i.postimg.cc/LXmdq4H2/D.jpg';
        
        const newProduct: Product = {
            id: `prod_${Date.now()}`,
            owner_id: profile?.user_id || '0',
            folder_id: folderId,
            title: details.title,
            description: details.description,
            price: details.price,
            image_url: imageUrl,
            category: 'fashion',
            is_try_on: true,
            created_at: new Date().toISOString()
        };

        setProducts(prev => [newProduct, ...prev]);
        setIsLoading(false);
        toast.success("Produto adicionado ao catálogo!");
    };

    const handleUpdateProfile = (updates: any) => {
        if (!profile) return;
        setProfile({ ...profile, full_name: updates.name, bio: updates.bio, username: updates.username });
        toast.success("Perfil atualizado localmente!");
    };

    const handleAccountTypeSelection = (type: 'personal' | 'business') => {
        if (!profile) return;
        const updatedProfile = { ...profile, account_type: type };
        setProfile(updatedProfile);

        if (type === 'business') {
            setBusinessProfile({
                id: profile.user_id,
                business_name: profile.full_name || profile.username || 'Minha Loja',
                business_category: 'fashion',
                description: profile.bio || '',
                logo_url: profile.avatar_url || ''
            });
            setCurrentScreen(Screen.VendorDashboard);
        } else {
            setCurrentScreen(Screen.Feed);
        }
    };

    const handleSignOut = () => {
        setIsLoggedIn(false);
        setProfile(null);
        setBusinessProfile(null);
        setProducts([]);
        setFolders([]);
        setCurrentScreen(Screen.Login);
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
        if (isLoadingInitial || currentScreen === Screen.Splash) return <SplashScreen />;

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onSuccess={() => handleMockLogin('admin@pump.com')} />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleAccountTypeSelection} />;
            case Screen.VendorDashboard: 
                return businessProfile && profile && (
                    <VendorDashboard 
                        businessProfile={businessProfile} profile={profile} folders={folders} products={products} posts={posts}
                        onCreateFolder={handleCreateFolder} onDeleteFolder={(id) => setFolders(prev => prev.filter(f => f.id !== id))} 
                        onCreateProductInFolder={handleAddProductToFolder} onDeleteProduct={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
                        onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={(url) => setProfile(p => p ? {...p, avatar_url: url} : null)}
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
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={(url) => setProfile(p => p ? {...p, avatar_url: url} : null)} onSelectCategory={() => {}} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} onViewProfile={() => {}} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => setPosts(p => p.map(x => x.id === id ? {...x, isLiked: !x.isLiked} : x))} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={(url) => { setUserImage(url); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={(url) => { setUserImage(url); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => { setCartItems(p => [...p, ...vtoItems]); setCurrentScreen(Screen.Cart); }} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.SubCategorySelection)} onGenerateVideo={() => {}} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Pedido finalizado (Simulação)"); setCartItems([]); }} />;
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