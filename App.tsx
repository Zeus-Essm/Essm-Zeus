
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile, MarketplaceType, AppNotification, Conversation, Comment, BusinessProfile, CollaborationPost, Folder, ShowcaseItem } from './types';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, ITEMS, INITIAL_CONVERSATIONS, INITIAL_COLLABORATION_REQUESTS } from './constants';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import BusinessOnboardingScreen from './components/BusinessOnboardingScreen';
import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/SettingsScreen';
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
    
    // Notification State - Initialized empty for real users
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const showSuccess = (msg: string) => {
        alert(msg);
        setShowUpdateBadge(true);
        setTimeout(() => setShowUpdateBadge(false), 3000);
    };

    const handleOpenNotifications = () => setIsNotificationsOpen(true);
    const handleCloseNotifications = () => setIsNotificationsOpen(false);

    const handleNotificationClick = (notif: AppNotification) => {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
        if (notif.relatedCategoryId) {
            // Logic to navigate if needed
        }
    };

    const fetchFolders = async (userId: string) => {
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar pastas:", error);
            return [];
        }
        return data || [];
    };

    const fetchAllProducts = async (userId: string) => {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Erro ao buscar produtos:", error);
            return [];
        }
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
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') handleLogoutReset(); 
            else handleAuthState(session);
        });

        supabase.auth.getSession().then(({ data: { session } }) => handleAuthState(session));
        return () => subscription.unsubscribe();
    }, []);

    const uploadImage = async ({ bucket, file, path }: { bucket: string, file: Blob, path: string }) => {
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    };

    const handleCreateFolder = async (title: string) => {
        if (!session?.user) return alert("Por favor, faça login para salvar.");
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !title) return;
            const { data, error } = await supabase.from("folders").insert({ owner_id: user.id, title }).select().single();
            if (error) throw error;
            setFolders(prev => [data, ...prev]);
            showSuccess("Coleção criada com sucesso");
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToFolder = async (folderId: string, details: { title: string, description: string, price: number, file: Blob }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const imagePath = `${user.id}/products/${Date.now()}.jpg`;
            const imageUrl = await uploadImage({ bucket: "products", file: details.file, path: imagePath });
            const { data: responseData, error } = await supabase.from("products").insert({
                owner_id: user.id, folder_id: folderId, title: details.title, price: details.price, description: details.description, image_url: imageUrl,
            }).select().single();
            if (error) throw error;
            const newProduct: Item = {
                id: responseData.id, name: responseData.title, description: responseData.description, price: responseData.price, image: responseData.image_url, category: 'general', owner_id: responseData.owner_id, folder_id: responseData.folder_id
            };
            setProducts(prev => [newProduct, ...prev]);
            const updatedFolders = await fetchFolders(user.id);
            setFolders(updatedFolders);
            showSuccess("Produto adicionado com sucesso");
            return newProduct;
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateDraftProduct = async (details: { title: string, description: string, price: number, file: Blob }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !details.title) return;
            const imagePath = `${user.id}/drafts/${Date.now()}.jpg`;
            const imageUrl = await uploadImage({ bucket: "products", file: details.file, path: imagePath });
            const { data: responseData, error } = await supabase.from("products").insert({
                owner_id: user.id, folder_id: null, title: details.title, price: details.price, description: details.description, image_url: imageUrl,
            }).select().single();
            if (error) throw error;
            const newProduct: Item = {
                id: responseData.id, name: responseData.title, description: responseData.description, price: responseData.price, image: responseData.image_url, category: 'general', owner_id: responseData.owner_id, folder_id: null
            };
            setProducts(prev => [newProduct, ...prev]);
            showSuccess("Produto adicionado com sucesso");
            return newProduct;
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveProductToFolder = async (productId: string, folderId: string | null) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from("products").update({ folder_id: folderId }).eq("id", productId);
            if (error) throw error;
            setProducts(prev => prev.map(p => p.id === productId ? { ...p, folder_id: folderId } : p));
            if (session?.user.id) {
                const updatedFolders = await fetchFolders(session.user.id);
                setFolders(updatedFolders);
            }
            showSuccess("Produto movido com sucesso");
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={viewedProfileId} onUpdateProfile={async (u) => { 
                if (session?.user) {
                    const { data } = await supabase.from('profiles').update({ full_name: u.name, bio: u.bio }).eq('user_id', profile?.user_id).select().single(); 
                    if (data) setProfile(data); 
                } else setProfile(prev => prev ? { ...prev, full_name: u.name ?? prev.full_name, bio: u.bio ?? prev.bio } : null);
            }} onUpdateProfileImage={async (url) => {}} onSelectCategory={() => {}} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem} onViewProfile={(id) => setViewedProfileId(id)} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onSignOut={() => supabase.auth.signOut()} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={handleOpenNotifications} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={handleLikePost} onAddComment={handleAddComment} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {showUpdateBadge && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-slideUp flex items-center gap-2 border border-white/10"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>Banco de Dados Atualizado!</div>}
            
            {/* Notifications Mini Window Overlay */}
            {isNotificationsOpen && (
                <NotificationsPanel 
                    notifications={notifications} 
                    onClose={handleCloseNotifications} 
                    onNotificationClick={handleNotificationClick} 
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
