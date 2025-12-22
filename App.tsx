import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, ShowcaseItem, AppNotification, Comment, User, Product } from './types';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, MALE_CLOTHING_SUBCATEGORIES } from './constants';
import { toast } from './utils/toast';

const isNative = !!(window as any).Capacitor;

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import BusinessOnboardingScreen from './components/BusinessOnboardingScreen';
import HomeScreen from './components/HomeScreen';
import FeedScreen from './components/FeedScreen';
import CartScreen from './components/CartScreen';
import BottomNavBar from './components/BottomNavBar';
import VendorDashboard from './components/VendorDashboard';
import VendorMenuModal from './components/VendorMenuModal';
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import VendorProductsScreen from './components/VendorProductsScreen';
import VendorAffiliatesScreen from './components/VendorAffiliatesScreen';
import VendorCollaborationsScreen from './components/VendorCollaborationsScreen';
import AllHighlightsScreen from './components/AllHighlightsScreen';
import SearchScreen from './components/SearchScreen';
import RecommendationModal from './components/RecommendationModal';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import VerificationIntroScreen from './components/VerificationIntroScreen';
import IdUploadScreen from './components/IdUploadScreen';
import FaceScanScreen from './components/FaceScanScreen';
import VerificationPendingScreen from './components/VerificationPendingScreen';

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
};

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [recommendationItem, setRecommendationItem] = useState<Item | null>(null);
    const [showUpdateBadge, setShowUpdateBadge] = useState(false);
    const [realBusinesses, setRealBusinesses] = useState<Category[]>([]);
    
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleOpenNotifications = () => setIsNotificationsOpen(true);
    const handleCloseNotifications = () => setIsNotificationsOpen(false);
    const handleOpenSettings = () => setIsSettingsOpen(true);
    const handleCloseSettings = () => setIsSettingsOpen(false);

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
        if (next === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setIsSettingsOpen(false);
            setShowVendorMenu(false);
            setViewedProfileId(null);
            setCartItems([]);
            setCurrentScreen(Screen.Login);
        } catch (err) {
            console.error("Erro ao sair:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationClick = (notif: AppNotification) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    };

    const fetchRealBusinesses = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('account_type', 'business');
        if (error) return;
        setRealBusinesses((data || []).map(p => ({
            id: p.user_id,
            name: p.full_name || p.username,
            image: p.avatar_url || '',
            type: 'fashion',
            subCategories: MALE_CLOTHING_SUBCATEGORIES, 
            isAd: false
        })));
    };

    const handleAuthState = async (currentSession: Session | null) => {
        setSession(currentSession);
        if (currentSession?.user) {
            const user = currentSession.user;
            const { data: existingProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
            
            if (!existingProfile) {
                await supabase.from('profiles').insert({
                    user_id: user.id,
                    username: user.user_metadata?.full_name?.toLowerCase().replace(/\s/g, '_') || `user_${user.id.substring(0, 5)}`,
                    full_name: user.user_metadata?.full_name ?? '',
                    avatar_url: user.user_metadata?.avatar_url ?? null,
                    account_type: null
                });
            }
            
            const { data: freshProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
            setProfile(freshProfile);
            fetchRealBusinesses();

            if (freshProfile) {
                if (freshProfile.account_type === 'personal') {
                    setCurrentScreen(Screen.Feed);
                } else if (freshProfile.account_type === 'business') {
                    setBusinessProfile({
                        id: user.id,
                        business_name: freshProfile.full_name || freshProfile.username,
                        business_category: 'fashion',
                        description: freshProfile.bio || '',
                        logo_url: freshProfile.avatar_url || ''
                    });
                    const [f, p] = await Promise.all([
                        supabase.from("folders").select("*").eq('owner_id', user.id).order("created_at", { ascending: false }),
                        supabase.from("products").select("*").eq('owner_id', user.id).order("created_at", { ascending: false })
                    ]);
                    setFolders(f.data || []);
                    setProducts(p.data || []);
                    // LAND ON FEED EVEN FOR BUSINESS (User Request)
                    setCurrentScreen(Screen.Feed);
                } else {
                    setCurrentScreen(Screen.AccountTypeSelection);
                }
            }
        } else {
            setProfile(null);
            setCurrentScreen(Screen.Login);
        }
        setAuthLoading(false);
    };

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('[AUTH STATE]', _event);
            handleAuthState(session);
        });
        supabase.auth.getSession().then(({ data }) => handleAuthState(data.session));
        return () => listener.subscription.unsubscribe();
    }, []);

    const handleCreateFolder = async (title: string) => {
        if (!profile) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('folders').insert({ title, owner_id: profile.user_id, item_count: 0 }).select().single();
            if (error) throw error;
            setFolders(p => [data, ...p]);
        } catch (err: any) {
            toast.error("Erro ao criar pasta");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToFolder = async (folderId: string, details: { title: string, description: string, price: number, file: Blob | null }) => {
        if (!profile) return;
        setIsLoading(true);
        try {
            let publicUrl: string | null = null;
            if (details.file) {
                const fileName = `${profile.user_id}/${Date.now()}.jpg`;
                const { error: uploadError } = await supabase.storage.from('products').upload(fileName, details.file);
                if (uploadError) throw uploadError;
                const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
                toast.success('Upload concluído com sucesso ✅');
            }

            const { data: productData, error: dbError } = await supabase.from('products').insert({
                title: details.title, description: details.description, price: details.price,
                image_url: publicUrl, folder_id: folderId, owner_id: profile.user_id
            }).select().single();

            if (dbError) throw dbError;
            await supabase.rpc('increment_folder_count', { row_id: folderId });
            setProducts(p => [productData, ...p]);
            setFolders(f => f.map(fold => fold.id === folderId ? { ...fold, item_count: (fold.item_count || 0) + 1, cover_image: fold.cover_image || productData.image_url } : fold));
            return productData;
        } catch (err: any) {
            toast.error(err.message || 'Erro ao enviar arquivo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string, name?: string }) => {
        if (!profile) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('profiles').update({
                full_name: updates.name ?? profile.full_name,
                bio: updates.bio ?? profile.bio,
                username: updates.username ?? profile.username
            }).eq('user_id', profile.user_id).select().single();
            if (error) throw error;
            setProfile(data);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfileImage = async (dataUrl: string) => {
        if (!profile) return;
        setIsLoading(true);
        try {
            const blob = await dataUrlToBlob(dataUrl);
            const fileName = `${profile.user_id}/avatar_${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            const { data, error: dbError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('user_id', profile.user_id).select().single();
            if (dbError) throw dbError;
            setProfile(data);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;
        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={async (type) => { 
                if (session?.user) { 
                    await supabase.from('profiles').update({ account_type: type }).eq('user_id', session.user.id); 
                    const { data } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single(); 
                    setProfile(data); 
                    if (type === 'business') setCurrentScreen(Screen.BusinessOnboarding); 
                    else setCurrentScreen(Screen.Feed); 
                }
            }} />;
            case Screen.BusinessOnboarding: return <BusinessOnboardingScreen onComplete={async (details) => { 
                if (session?.user) { 
                    await supabase.from('profiles').update({ full_name: details.business_name, bio: details.description }).eq('user_id', session.user.id); 
                    setBusinessProfile({ id: session.user.id, ...details }); 
                }
                setCurrentScreen(Screen.Feed); 
            }} />;
            case Screen.VendorDashboard: return businessProfile && profile && (
                <VendorDashboard 
                    businessProfile={businessProfile} profile={profile} 
                    onOpenMenu={() => setShowVendorMenu(true)} 
                    unreadNotificationCount={unreadCount} 
                    onOpenNotificationsPanel={handleOpenNotifications} 
                    onOpenPromotionModal={() => {}} 
                    followersCount={0} followingCount={0} 
                    folders={folders} products={products} posts={posts}
                    onCreateFolder={handleCreateFolder} 
                    onCreateProductInFolder={handleAddProductToFolder}
                    onMoveProductToFolder={async (pId, fId) => {
                        await supabase.from('products').update({ folder_id: fId }).eq('id', pId);
                        setProducts(prev => prev.map(p => (p.id === pId ? { ...p, folder_id: fId } : p)));
                    }} 
                    onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={handleUpdateProfileImage} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={(id) => {}} onAddComment={(id, text) => {}}
                    onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId}
                />
            );
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorProducts: return <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile!} products={products} onCreateProduct={(data) => handleAddProductToFolder(folders[0].id, data)} />;
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => { setViewedProfileId(cat.id); setCurrentScreen(Screen.Home); }} onLikePost={(id) => {}} onAddComment={(id, text) => {}} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => {}} unreadNotificationCount={unreadCount} onNotificationsClick={handleOpenNotifications} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={viewedProfileId} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={handleUpdateProfileImage} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => {}} isCartAnimating={false} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId} onNavigateToSettings={handleOpenSettings} onSignOut={handleSignOut} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={handleOpenNotifications} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => {}} onAddComment={(id, t) => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} posts={posts} items={[]} onViewProfile={(id) => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }} onLikePost={(id) => {}} onItemClick={setRecommendationItem} onItemAction={setRecommendationItem} onOpenSplitCamera={() => {}} onOpenComments={(id) => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.VerificationIntro: return <VerificationIntroScreen onBack={() => setCurrentScreen(Screen.Home)} onStart={() => setCurrentScreen(Screen.IdUpload)} />;
            case Screen.IdUpload: return <IdUploadScreen onBack={() => setCurrentScreen(Screen.VerificationIntro)} onComplete={() => setCurrentScreen(Screen.FaceScan)} />;
            case Screen.FaceScan: return <FaceScanScreen onBack={() => setCurrentScreen(Screen.IdUpload)} onComplete={() => setCurrentScreen(Screen.VerificationPending)} />;
            case Screen.VerificationPending: return <VerificationPendingScreen onComplete={() => { if (profile) setProfile({ ...profile, verification_status: 'verified' }); setCurrentScreen(Screen.Home); }} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={handleCloseNotifications} onNotificationClick={handleNotificationClick} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={toggleTheme} onClose={handleCloseSettings} onSignOut={handleSignOut} onNavigateToVerification={() => { setIsSettingsOpen(false); setCurrentScreen(Screen.VerificationIntro); }} />}
            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Rewards, Screen.AllHighlights, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.VendorProducts].includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToPromotion={() => {}} onNavigateToProfile={() => { if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard); else setCurrentScreen(Screen.Home); setViewedProfileId(null); }} 
                    onStartTryOn={() => {}} isCartAnimating={false} accountType={profile.account_type} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} 
                />
            )}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => { setShowVendorMenu(false); }} onNavigateToCollaborations={() => { setShowVendorMenu(false); }} onSignOut={handleSignOut} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={() => {}} />}
        </div>
    );
};

export default App;