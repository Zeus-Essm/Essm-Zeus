
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, AppNotification, SubCategory } from './types';
import { INITIAL_POSTS, MALE_CLOTHING_SUBCATEGORIES, CATEGORIES, ITEMS } from './constants';
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

const GUEST_PERSONAL_PROFILE: Profile = {
    user_id: 'guest_user',
    username: 'convidado',
    full_name: 'Usuário Convidado',
    bio: 'Explorando o PUMP sem login.',
    avatar_url: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
    account_type: 'personal',
};

const GUEST_BUSINESS_PROFILE: Profile = {
    user_id: 'guest_business',
    username: 'loja_convidada',
    full_name: 'Loja de Exemplo',
    bio: 'Painel de vendedor (Modo Preview).',
    avatar_url: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
    account_type: 'business',
};

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    // States
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

    // --- VTO LOGIC ---
    const startTryOn = (item: Item) => {
        setVtoItem(item);
        if (!userImage) setCurrentScreen(Screen.ImageSourceSelection);
        else handleGenerateLook(userImage, item, vtoItems);
    };

    const handlePhotoObtained = (url: string) => {
        setUserImage(url);
        if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
        else setCurrentScreen(Screen.Home);
        toast.success("Foto conectada!");
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

    const fetchRealBusinesses = async () => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('account_type', 'business');
            if (error) throw error;
            const mapped: Category[] = (data || []).map(p => ({
                id: p.user_id, name: p.full_name || p.username, image: p.avatar_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg',
                type: 'fashion', subCategories: MALE_CLOTHING_SUBCATEGORIES, isAd: false
            }));
            setRealBusinesses(mapped);
        } catch (err) { console.error(err); }
    };

    const handleAuthState = async (currentSession: Session | null) => {
        setAuthLoading(true);
        setSession(currentSession);
        fetchRealBusinesses();
        if (currentSession?.user) {
            const user = currentSession.user;
            const { data: freshProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
            setProfile(freshProfile);
            if (freshProfile) {
                if (freshProfile.account_type === 'personal') setCurrentScreen(Screen.Feed);
                else if (freshProfile.account_type === 'business') {
                    setBusinessProfile({ id: user.id, business_name: freshProfile.full_name || freshProfile.username, business_category: 'fashion', description: freshProfile.bio || '', logo_url: freshProfile.avatar_url || '' });
                    setCurrentScreen(Screen.VendorDashboard);
                } else setCurrentScreen(Screen.AccountTypeSelection);
            } else {
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } else {
            setProfile(null);
            setBusinessProfile(null);
            setCurrentScreen(Screen.Login);
        }
        setAuthLoading(false);
    };

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => handleAuthState(session));
        supabase.auth.getSession().then(({ data }) => handleAuthState(data.session));
        return () => listener.subscription.unsubscribe();
    }, []);

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
                    onCreateFolder={async () => {}} onCreateProductInFolder={async () => {}} onMoveProductToFolder={async () => {}}
                    onUpdateProfile={() => {}} onUpdateProfileImage={() => {}} onNavigateToProducts={() => {}}
                    onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                    onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={setViewedProfileId}
                    isVisitor={!isSelf} onBack={() => setViewedProfileId(null)}
                />
            );
        }

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onNavigateToSignUp={() => setCurrentScreen(Screen.AccountTypeSelection)} />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={(t) => { if (t === 'personal') { setProfile(GUEST_PERSONAL_PROFILE); setCurrentScreen(Screen.Feed); } else { setProfile(GUEST_BUSINESS_PROFILE); setCurrentScreen(Screen.VendorDashboard); } }} />;
            case Screen.VendorDashboard: return businessProfile && profile && <VendorDashboard businessProfile={businessProfile} profile={profile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadCount} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} folders={folders} products={products} posts={posts} onCreateFolder={() => {}} onCreateProductInFolder={async () => {}} onMoveProductToFolder={async () => {}} onUpdateProfile={() => {}} onUpdateProfileImage={() => {}} onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={setViewedProfileId} />;
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} onStartCreate={() => { setCurrentScreen(Screen.ImageSourceSelection); }} unreadNotificationCount={unreadCount} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={() => {}} onUpdateProfileImage={() => {}} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => { setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} onViewProfile={setViewedProfileId} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={() => handleAuthState(null)} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handlePhotoObtained} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handlePhotoObtained} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => {}} onUndo={() => { setCurrentScreen(Screen.Feed); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.Feed)} onGenerateVideo={() => {}} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={() => handleAuthState(null)} onNavigateToVerification={() => {}} />}
            {showCaptionModal && generatedImage && <CaptionModal image={generatedImage} onClose={() => setShowCaptionModal(false)} onPublish={() => {}} />}
            {profile && !viewedProfileId && !['Camera', 'Login', 'AccountTypeSelection'].includes(currentScreen.toString()) && (
                <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => { if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard); else setCurrentScreen(Screen.Home); }} onStartTryOn={() => { setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={false} accountType={profile.account_type} onNavigateToVendorAnalytics={() => {}} />
            )}
            {isLoading && <div className="fixed inset-0 z-[300] bg-black/40 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
        </div>
    );
};

export default App;
