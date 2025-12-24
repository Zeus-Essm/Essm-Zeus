
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, AppNotification, SubCategory } from './types';
import { INITIAL_POSTS, MALE_CLOTHING_SUBCATEGORIES, CATEGORIES } from './constants';
import { toast } from './utils/toast';

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
import VendorProductsScreen from './components/VendorProductsScreen';
import SearchScreen from './components/SearchScreen';
import RecommendationModal from './components/RecommendationModal';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CameraScreen from './components/CameraScreen';

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
    bio: 'Esta é uma prévia do painel de vendedor como convidado.',
    avatar_url: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png',
    account_type: 'business',
};

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
    
    // VTO States
    const [userImage, setUserImage] = useState<string | null>(null);

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
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

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

    const fetchFolders = async (userId: string) => {
        if (userId.startsWith('guest_')) return [];
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });
        if (error) return [];
        return data || [];
    };

    const fetchAllProducts = async (userId: string) => {
        if (userId.startsWith('guest_')) return [];
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });
        if (error) return [];
        return data || [];
    };

    const handleAuthState = async (currentSession: Session | null) => {
        setAuthLoading(true);
        setSession(currentSession);
        fetchRealBusinesses();

        if (currentSession?.user) {
            const user = currentSession.user;
            try {
                const { data: freshProfile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
                
                if (user.id) {
                    const [freshFolders, fetchedProducts] = await Promise.all([
                        fetchFolders(user.id),
                        fetchAllProducts(user.id)
                    ]);
                    setFolders(freshFolders);
                    setProducts(fetchedProducts);
                }
                
                setProfile(freshProfile);

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
                        setCurrentScreen(Screen.VendorDashboard);
                    } else {
                        setCurrentScreen(Screen.AccountTypeSelection);
                    }
                }
            } catch (err) {
                console.error('[AUTH SYNC ERROR]', err);
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } else {
            setProfile(null);
            setProducts([]);
            setFolders([]);
            setBusinessProfile(null);
            setCartItems([]);
            setCurrentScreen(Screen.AccountTypeSelection);
        }
        setAuthLoading(false);
    };

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthState(session);
        });
        supabase.auth.getSession().then(({ data }) => handleAuthState(data.session));
        return () => listener.subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const loadViewedProfileData = async () => {
            if (!viewedProfileId) return;
            if (viewedProfileId.startsWith('guest_')) return;
            
            setIsLoading(true);
            try {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', viewedProfileId).single();
                if (profileData) {
                    setViewedProfileData(profileData);
                    const [f, p] = await Promise.all([
                        fetchFolders(viewedProfileId),
                        fetchAllProducts(viewedProfileId)
                    ]);
                    setViewedFolders(f);
                    setViewedProducts(p);
                }
            } catch (e) {
                toast.error("Erro ao carregar loja.");
            } finally {
                setIsLoading(false);
            }
        };
        loadViewedProfileData();
    }, [viewedProfileId]);

    const handleCreateFolder = async (title: string) => {
        if (!session?.user) {
            // MODO GUEST: Salva em memória
            const newFolder: Folder = {
                id: Math.random().toString(36).substr(2, 9),
                owner_id: profile?.user_id || 'guest',
                title: title,
                cover_image: null,
                item_count: 0,
                created_at: new Date().toISOString()
            };
            setFolders(prev => [newFolder, ...prev]);
            toast.success('Coleção criada ✅');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.from('folders').insert({
                title,
                owner_id: session.user.id
            });
            if (error) throw error;
            const freshFolders = await fetchFolders(session.user.id);
            setFolders(freshFolders);
            toast.success('Coleção salva no banco ✅');
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToFolder = async (folderId: string | null, details: { title: string, description: string, price: number, file: Blob | null }) => {
        if (!session?.user) {
            // MODO GUEST: Preview Local
            const imgUrl = details.file ? URL.createObjectURL(details.file) : null;
            const newProd: Product = {
                id: Math.random().toString(36).substr(2, 9),
                owner_id: profile?.user_id || 'guest',
                folder_id: folderId,
                title: details.title,
                description: details.description,
                price: details.price,
                image_url: imgUrl,
                created_at: new Date().toISOString()
            };
            setProducts(prev => [newProd, ...prev]);
            
            // ATUALIZA IMAGEM DA PASTA NO MODO GUEST
            if (folderId && imgUrl) {
                setFolders(prev => prev.map(f => f.id === folderId ? { ...f, cover_image: imgUrl } : f));
            }
            
            toast.success("Produto adicionado (Preview)");
            return newProd;
        }

        setIsLoading(true);
        try {
            let image_url: string | null = null;
            if (details.file) {
                const filePath = `${session.user.id}/${Date.now()}.jpg`;
                await supabase.storage.from('products').upload(filePath, details.file);
                const { data } = supabase.storage.from('products').getPublicUrl(filePath);
                image_url = data.publicUrl;
            }

            const { data: productData, error } = await supabase.from('products').insert({
                owner_id: session.user.id,
                title: details.title,
                description: details.description,
                price: details.price,
                image_url,
                folder_id: folderId
            }).select().single();

            if (error) throw error;

            // ATUALIZA IMAGEM DA PASTA NO SUPABASE
            if (folderId && image_url) {
                await supabase.from('folders').update({ cover_image: image_url }).eq('id', folderId);
            }
            
            const [p, f] = await Promise.all([fetchAllProducts(session.user.id), fetchFolders(session.user.id)]);
            setProducts(p);
            setFolders(f);
            return productData;
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: any) => {
        if (!session?.user) {
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            toast.success("Perfil atualizado localmente");
            return;
        }
        // ... Lógica Supabase ...
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;
        
        if (viewedProfileId && viewedProfileData) {
            const isSelf = profile?.user_id === viewedProfileId;
            return (
                <VendorDashboard 
                    businessProfile={{ 
                        id: viewedProfileData.user_id, 
                        business_name: viewedProfileData.full_name || viewedProfileData.username, 
                        business_category: 'fashion', 
                        description: viewedProfileData.bio || '', 
                        logo_url: viewedProfileData.avatar_url || '' 
                    }}
                    profile={viewedProfileData} 
                    onOpenMenu={() => setShowVendorMenu(true)} 
                    unreadNotificationCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} 
                    folders={isSelf ? folders : viewedFolders} 
                    products={isSelf ? products : viewedProducts} 
                    posts={posts} 
                    onCreateFolder={handleCreateFolder}
                    onDeleteFolder={(id) => setFolders(f => f.filter(x => x.id !== id))}
                    onCreateProductInFolder={handleAddProductToFolder}
                    onDeleteProduct={(id) => setProducts(p => p.filter(x => x.id !== id))}
                    onMoveProductToFolder={async (pId, fId) => {
                        setProducts(prev => prev.map(p => p.id === pId ? {...p, folder_id: fId} : p));
                        toast.success("Item movido!");
                    }} 
                    onUpdateProfile={handleUpdateProfile} 
                    onUpdateProfileImage={() => {}} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                    onAddComment={() => {}} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId}
                    isVisitor={!isSelf} onBack={() => setViewedProfileId(null)}
                />
            );
        }

        switch (currentScreen) {
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={(type) => { 
                if (type === 'personal') {
                    setProfile(GUEST_PERSONAL_PROFILE);
                    setCurrentScreen(Screen.Feed);
                } else {
                    setProfile(GUEST_BUSINESS_PROFILE);
                    setBusinessProfile({
                        id: 'guest_business',
                        business_name: 'Loja de Exemplo',
                        business_category: 'fashion',
                        description: 'Prévia do painel de vendedor.',
                        logo_url: 'https://i.postimg.cc/XJf6gckX/Pump_STARTAP.png'
                    });
                    setCurrentScreen(Screen.VendorDashboard);
                }
            }} />;
            case Screen.VendorDashboard: return businessProfile && profile && (
                <VendorDashboard 
                    businessProfile={businessProfile} profile={profile} onOpenMenu={() => setShowVendorMenu(true)} 
                    unreadNotificationCount={unreadCount} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} folders={folders} 
                    products={products} posts={posts} 
                    onCreateFolder={handleCreateFolder} 
                    onDeleteFolder={(id) => setFolders(f => f.filter(x => x.id !== id))}
                    onCreateProductInFolder={handleAddProductToFolder}
                    onDeleteProduct={(id) => setProducts(p => p.filter(x => x.id !== id))}
                    onMoveProductToFolder={async (pId, fId) => {
                        setProducts(prev => prev.map(p => p.id === pId ? {...p, folder_id: fId} : p));
                        toast.success("Item movido!");
                    }} 
                    onUpdateProfile={handleUpdateProfile} 
                    onUpdateProfileImage={() => {}} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                    onAddComment={() => {}} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId}
                />
            );
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} unreadNotificationCount={unreadCount} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={() => {}} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={() => handleAuthState(null)} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} posts={posts} items={[]} onViewProfile={setViewedProfileId} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onItemClick={setRecommendationItem} onItemAction={setRecommendationItem} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.VendorProducts: return businessProfile && <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} products={products} folders={folders} onCreateProduct={handleAddProductToFolder} onDeleteProduct={(id) => setProducts(p => p.filter(x => x.id !== id))} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={(it) => { setRecommendationItem(it); }} onCheckout={() => { toast.success("Pedido finalizado!"); setCartItems([]); }} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={(url) => { setUserImage(url); setCurrentScreen(Screen.Feed); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={(url) => { setUserImage(url); setCurrentScreen(Screen.Feed); }} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={() => handleAuthState(null)} onNavigateToVerification={() => {}} />}
            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.VendorDashboard, Screen.VendorProducts].includes(currentScreen) && !viewedProfileId && (
                <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => { 
                        setViewedProfileId(null);
                        if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
                        else setCurrentScreen(Screen.Home);
                    }} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} accountType={profile.account_type} onNavigateToVendorAnalytics={() => {}} />
            )}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => {}} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={() => handleAuthState(null)} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={() => {}} />}
        </div>
    );
};

export default App;
