
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile, MarketplaceType, AppNotification, Conversation, Comment, BusinessProfile, CollaborationPost, Folder, ShowcaseItem } from './types';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, ITEMS, INITIAL_CONVERSATIONS, INITIAL_COLLABORATION_REQUESTS, MALE_CLOTHING_SUBCATEGORIES } from './constants';

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
    const [products, setProducts] = useState<Item[]>([]);
    const [showcase, setShowcase] = useState<ShowcaseItem[]>([]);
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
    
    // UI Panels State
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const showSuccess = (msg: string) => {
        alert(msg);
        setShowUpdateBadge(true);
        setTimeout(() => setShowUpdateBadge(false), 3000);
    };

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

    const handleNotificationClick = (notif: AppNotification) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    };

    const fetchRealBusinesses = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('account_type', 'business');
        
        if (error) return;

        const mapped: Category[] = (data || []).map(p => ({
            id: p.user_id,
            name: p.full_name || p.username,
            image: p.avatar_url || 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
            type: 'fashion',
            subCategories: MALE_CLOTHING_SUBCATEGORIES, // Fallback subcats
            isAd: false
        }));
        setRealBusinesses(mapped);
    };

    const fetchFolders = async (userId: string) => {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });

        if (error) return [];
        return data || [];
    };

    const fetchAllProducts = async (userId: string) => {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });

        if (error) return [];
        return (data || []).map(p => ({
            id: p.id,
            name: p.title,
            description: p.description,
            price: p.price,
            image: p.image_url,
            category: 'general',
            owner_id: p.owner_id,
            folder_id: p.folder_id
        }));
    };

    useEffect(() => {
        const handleAuthState = async (currentSession: Session | null) => {
            setSession(currentSession);
            fetchRealBusinesses();
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
                
                if (user.id) {
                    const freshFolders = await fetchFolders(user.id);
                    const mappedProducts = await fetchAllProducts(user.id);
                    const { data: freshShowcase } = await supabase.from('showcase').select('*').eq('owner_id', user.id);
                    setShowcase(freshShowcase || []);
                    setFolders(freshFolders);
                    setProducts(mappedProducts);
                }
                
                setProfile(freshProfile);

                if (freshProfile) {
                    if (freshProfile.account_type === 'personal') setCurrentScreen(Screen.Feed);
                    else if (freshProfile.account_type === 'business') {
                        setBusinessProfile({
                            id: user.id,
                            business_name: freshProfile.full_name || freshProfile.username,
                            business_category: 'fashion',
                            description: freshProfile.bio || '',
                            logo_url: freshProfile.avatar_url || ''
                        });
                        setCurrentScreen(Screen.VendorDashboard);
                    } else setCurrentScreen(Screen.AccountTypeSelection);
                }
            } else {
                setCurrentScreen(Screen.AccountTypeSelection);
            }
            setAuthLoading(false);
        };

        const handleLogoutReset = () => {
            setProfile(null);
            setProducts([]);
            setShowcase([]);
            setFolders([]);
            setBusinessProfile(null);
            setCartItems([]);
            setSession(null);
            setCurrentScreen(Screen.AccountTypeSelection);
            setNotifications([]);
            setIsSettingsOpen(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') handleLogoutReset(); 
            else handleAuthState(session);
        });

        supabase.auth.getSession().then(({ data: { session } }) => handleAuthState(session));
        return () => subscription.unsubscribe();
    }, []);

    const handleLikePost = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    };

    const handleAddComment = (postId: string, text: string) => {
        if (!profile) return;
        const newComment: Comment = {
            id: `c_${Date.now()}`,
            user: { id: profile.user_id, name: profile.username, avatar: profile.avatar_url || '' },
            text,
            timestamp: new Date().toISOString()
        };
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 } : p));
    };

    // Handler to create a folder in Supabase
    const handleCreateFolder = async (title: string) => {
        if (!profile) return;
        try {
            const { data, error } = await supabase
                .from('folders')
                .insert({
                    title,
                    owner_id: profile.user_id,
                    item_count: 0
                })
                .select()
                .single();
            if (error) throw error;
            if (data) setFolders(prev => [data, ...prev]);
        } catch (error) {
            console.error("Erro ao criar pasta:", error);
        }
    };

    // Handler to add a product to a folder, including image upload
    const handleAddProductToFolder = async (folderId: string, details: { title: string, description: string, price: number, file: Blob }) => {
        if (!profile) return;
        try {
            const fileName = `${profile.user_id}/${Date.now()}_${details.title.replace(/\s/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, details.file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({
                    title: details.title,
                    description: details.description,
                    price: details.price,
                    image_url: publicUrl,
                    folder_id: folderId,
                    owner_id: profile.user_id
                })
                .select()
                .single();

            if (productError) throw productError;

            const newItem: Item = {
                id: productData.id,
                name: productData.title,
                description: productData.description,
                price: productData.price,
                image: productData.image_url,
                category: 'general',
                owner_id: productData.owner_id,
                folder_id: productData.folder_id
            };

            setProducts(prev => [newItem, ...prev]);
            setFolders(prev => prev.map(f => f.id === folderId ? { ...f, item_count: (f.item_count || 0) + 1, cover_image: f.cover_image || newItem.image } : f));
            return productData;
        } catch (error) {
            console.error("Erro ao adicionar produto:", error);
        }
    };

    // Handler to move a product between folders
    const handleMoveProductToFolder = async (productId: string, folderId: string | null) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ folder_id: folderId })
                .eq('id', productId);
            if (error) throw error;

            setProducts(prev => prev.map(p => p.id === productId ? { ...p, folder_id: folderId } : p));
        } catch (error) {
            console.error("Erro ao mover produto:", error);
        }
    };

    // Handler to create a draft product (without folder)
    const handleCreateDraftProduct = async (details: { title: string, description: string, price: number, file: Blob }) => {
        if (!profile) return;
        try {
            const fileName = `${profile.user_id}/${Date.now()}_draft_${details.title.replace(/\s/g, '_')}`;
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, details.file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

            const { data: productData, error: productError } = await supabase
                .from('products')
                .insert({
                    title: details.title,
                    description: details.description,
                    price: details.price,
                    image_url: publicUrl,
                    owner_id: profile.user_id
                })
                .select()
                .single();

            if (productError) throw productError;

            const newItem: Item = {
                id: productData.id,
                name: productData.title,
                description: productData.description,
                price: productData.price,
                image: productData.image_url,
                category: 'general',
                owner_id: productData.owner_id,
                folder_id: productData.folder_id
            };

            setProducts(prev => [newItem, ...prev]);
        } catch (error) {
            console.error("Erro ao criar rascunho:", error);
        }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;
        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={async (type) => { 
                const uid = session?.user.id; 
                if (uid) { 
                    await supabase.from('profiles').update({ account_type: type }).eq('user_id', uid); 
                    const { data } = await supabase.from('profiles').select('*').eq('user_id', uid).single(); 
                    setProfile(data); 
                    if (type === 'business') setCurrentScreen(Screen.BusinessOnboarding); 
                    else setCurrentScreen(Screen.Feed); 
                } else {
                    const tempProfile: Profile = {
                        user_id: `temp_${type}_${Date.now()}`,
                        username: type === 'personal' ? 'cliente' : 'vendedor',
                        full_name: type === 'personal' ? 'Usuário Pessoal' : 'Marca Local',
                        bio: 'Perfil ativo para navegação.',
                        avatar_url: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
                        account_type: type,
                        reward_points: 0
                    };
                    setProfile(tempProfile);
                    if (type === 'business') {
                        setBusinessProfile({
                            id: tempProfile.user_id, business_name: tempProfile.full_name || '', business_category: 'fashion', description: '', logo_url: tempProfile.avatar_url || ''
                        });
                        setCurrentScreen(Screen.VendorDashboard);
                    } else setCurrentScreen(Screen.Feed);
                }
            }} />;
            case Screen.BusinessOnboarding: return <BusinessOnboardingScreen onComplete={async (details) => { 
                if (session?.user) { 
                    await supabase.from('profiles').update({ full_name: details.business_name, bio: details.description }).eq('user_id', session.user.id); 
                    setBusinessProfile({ id: session.user.id, ...details }); 
                } else if (profile) {
                    setBusinessProfile({ id: profile.user_id, ...details });
                }
                setCurrentScreen(Screen.VendorDashboard); 
            }} />;
            case Screen.VendorDashboard: return businessProfile && profile && (
                <VendorDashboard 
                    businessProfile={businessProfile} 
                    profile={profile} 
                    onOpenMenu={() => setShowVendorMenu(true)} 
                    unreadNotificationCount={unreadCount} 
                    onOpenNotificationsPanel={handleOpenNotifications} 
                    onOpenPromotionModal={() => {}} 
                    followersCount={0} 
                    followingCount={0} 
                    folders={folders} 
                    products={products} 
                    posts={posts}
                    onCreateFolder={handleCreateFolder} 
                    onCreateProductInFolder={handleAddProductToFolder}
                    onMoveProductToFolder={handleMoveProductToFolder} 
                    onUpdateProfile={async (u) => { 
                        if (session?.user) {
                            const { data } = await supabase.from('profiles').update({ full_name: u.name, bio: u.bio }).eq('user_id', profile.user_id).select().single(); 
                            if (data) setProfile(data); 
                        } else setProfile(prev => prev ? { ...prev, full_name: u.name ?? prev.full_name, bio: u.bio ?? prev.bio } : null);
                    }} 
                    onUpdateProfileImage={async (url) => {}} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onItemClick={setRecommendationItem}
                    onViewProfile={setViewedProfileId}
                />
            );
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorProducts: return businessProfile && (
                <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} products={products} onCreateProduct={handleCreateDraftProduct} />
            );
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={INITIAL_STORIES} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={() => {}} onLikePost={handleLikePost} onAddComment={handleAddComment} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} unreadNotificationCount={unreadCount} onNotificationsClick={handleOpenNotifications} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={viewedProfileId} realBusinesses={realBusinesses} onUpdateProfile={async (u) => { 
                if (session?.user) {
                    const { data } = await supabase.from('profiles').update({ full_name: u.name, bio: u.bio }).eq('user_id', profile?.user_id).select().single(); 
                    if (data) setProfile(data); 
                } else setProfile(prev => prev ? { ...prev, full_name: u.name ?? prev.full_name, bio: u.bio ?? prev.bio } : null);
            }} onUpdateProfileImage={async (url) => {}} onSelectCategory={() => {}} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem} onViewProfile={(id) => setViewedProfileId(id)} onNavigateToSettings={handleOpenSettings} onSignOut={() => supabase.auth.signOut()} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={handleOpenNotifications} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={handleLikePost} onAddComment={handleAddComment} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} posts={posts} items={products} onViewProfile={(id) => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }} onLikePost={handleLikePost} onItemClick={setRecommendationItem} onItemAction={setRecommendationItem} onOpenSplitCamera={() => {}} onOpenComments={handleLikePost} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            
            // Verification Flow Screens
            case Screen.VerificationIntro:
                return <VerificationIntroScreen onBack={() => setCurrentScreen(Screen.Home)} onStart={() => setCurrentScreen(Screen.IdUpload)} />;
            case Screen.IdUpload:
                return <IdUploadScreen onBack={() => setCurrentScreen(Screen.VerificationIntro)} onComplete={(f, b) => setCurrentScreen(Screen.FaceScan)} />;
            case Screen.FaceScan:
                return <FaceScanScreen onBack={() => setCurrentScreen(Screen.IdUpload)} onComplete={() => setCurrentScreen(Screen.VerificationPending)} />;
            case Screen.VerificationPending:
                return <VerificationPendingScreen onComplete={() => {
                    if (profile) {
                        setProfile({ ...profile, verification_status: 'pending' });
                    }
                    setCurrentScreen(Screen.Home);
                }} />;
                
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {showUpdateBadge && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-slideUp flex items-center gap-2 border border-white/10"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>Banco de Dados Atualizado!</div>}
            
            {/* UI Overlays */}
            {isNotificationsOpen && (
                <NotificationsPanel 
                    notifications={notifications} 
                    onClose={handleCloseNotifications} 
                    onNotificationClick={handleNotificationClick} 
                />
            )}
            
            {isSettingsOpen && profile && (
                <SettingsPanel 
                    profile={profile}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    onClose={handleCloseSettings}
                    onSignOut={() => supabase.auth.signOut()}
                    onNavigateToVerification={() => {
                        setIsSettingsOpen(false);
                        setCurrentScreen(Screen.VerificationIntro);
                    }}
                />
            )}

            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Rewards, Screen.AllHighlights, Screen.VendorDashboard, Screen.VendorAnalytics].includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} 
                    onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToPromotion={() => {}} 
                    onNavigateToProfile={() => { 
                        if (profile.account_type === 'business') {
                            setCurrentScreen(Screen.VendorDashboard);
                        } else {
                            setCurrentScreen(Screen.Home);
                        }
                        setViewedProfileId(null); 
                    }} 
                    onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    isCartAnimating={false} 
                    accountType={profile.account_type} 
                    onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} 
                />
            )}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => { setCurrentScreen(Screen.VendorAffiliates); setShowVendorMenu(false); }} onNavigateToCollaborations={() => { setCurrentScreen(Screen.VendorCollaborations); setShowVendorMenu(false); }} onSignOut={() => supabase.auth.signOut()} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={() => {}} />}
        </div>
    );
};

export default App;