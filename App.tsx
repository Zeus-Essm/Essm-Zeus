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
            
            if (error) {
                console.error('[SUPABASE ERROR]', error.code, error.message);
                throw error;
            }

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
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });
        if (error) {
            console.error('[SUPABASE ERROR]', error.code, error.message);
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
            console.error('[SUPABASE ERROR]', error.code, error.message);
            return [];
        }
        return data || [];
    };

    const handleAuthState = async (currentSession: Session | null) => {
        setAuthLoading(true);
        setSession(currentSession);
        fetchRealBusinesses();

        if (currentSession?.user) {
            const user = currentSession.user;
            try {
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
            }
        } else {
            setProfile(null);
            setProducts([]);
            setFolders([]);
            setBusinessProfile(null);
            setCartItems([]);
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

    useEffect(() => {
        const loadViewedProfileData = async () => {
            if (!viewedProfileId) {
                setViewedProfileData(null);
                setViewedFolders([]);
                setViewedProducts([]);
                return;
            }
            
            setIsLoading(true);
            try {
                const { data: profileData, error: profileErr } = await supabase.from('profiles').select('*').eq('user_id', viewedProfileId).single();
                
                if (profileErr) {
                    console.error('[SUPABASE ERROR]', profileErr.code, profileErr.message);
                    throw profileErr;
                }

                if (profileData) {
                    setViewedProfileData(profileData);
                    const [f, p] = await Promise.all([
                        fetchFolders(viewedProfileId),
                        fetchAllProducts(viewedProfileId)
                    ]);
                    setViewedFolders(f);
                    setViewedProducts(p);
                }
            } catch (e: any) {
                console.error('[SYNC VIEWED ERROR]', e);
                toast.error("Erro ao carregar catálogo da loja.");
                setViewedProfileId(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadViewedProfileData();
    }, [viewedProfileId]);

    const handleUpdateProfile = async (updates: {
      username?: string;
      bio?: string;
      name?: string;
    }) => {
      setIsLoading(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) throw new Error('Usuário não autenticado');

        const payload: any = {};
        if (updates.name !== undefined) payload.full_name = updates.name;
        if (updates.bio !== undefined) payload.bio = updates.bio;
        if (updates.username !== undefined) payload.username = updates.username;

        const { data, error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('[SUPABASE UPDATE ERROR]', error.code, error.message);
          toast.error(error.message);
          return;
        }

        setProfile(data);

        if (data.account_type === 'business') {
          setBusinessProfile(prev =>
            prev
              ? {
                  ...prev,
                  business_name: data.full_name || data.username,
                  description: data.bio || ''
                }
              : null
          );
        }

        toast.success('Perfil atualizado ✅');
      } catch (err: any) {
        console.error('[UPDATE PROFILE ERROR]', err.code, err.message);
        toast.error(err.message || 'Erro ao atualizar perfil');
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpdateProfileImage = async (imageDataUrl: string) => {
        setIsLoading(true);
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) throw new Error('Usuário não autenticado');

            const blob = await dataUrlToBlob(imageDataUrl);
            const fileName = `avatar_${Date.now()}.jpg`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, blob, { upsert: true });

            if (uploadError) {
                console.error('[SUPABASE ERROR]', uploadError.message);
                toast.error(uploadError.message);
                return;
            }

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const avatar_url = urlData.publicUrl;

            const { data: updatedProfile, error: dbError } = await supabase
                .from('profiles')
                .update({ avatar_url })
                .eq('user_id', user.id)
                .select()
                .single();

            if (dbError) {
                console.error('[SUPABASE ERROR]', dbError.code, dbError.message);
                toast.error(dbError.message);
                return;
            }

            if (updatedProfile) {
                setProfile(updatedProfile);
                if (updatedProfile.account_type === 'business') {
                    setBusinessProfile(prev => prev ? { ...prev, logo_url: updatedProfile.avatar_url || '' } : null);
                }
            }
            
            toast.success("Foto atualizada ✅");
        } catch (error: any) {
            console.error('[UPDATE IMAGE ERROR]', error);
            toast.error(error.message || "Erro no upload da imagem.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFolder = async (title: string) => {
        // 🔍 DEBUG DEFINITIVO DE AUTH
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        console.log('[DEBUG] sessionError:', sessionError);
        console.log('[DEBUG] session:', sessionData?.session);
        console.log('[DEBUG] user:', sessionData?.session?.user);
        console.log('[DEBUG] user.id:', sessionData?.session?.user?.id);

        if (!sessionData?.session?.user?.id) {
            toast.error('SEM SESSÃO ATIVA ❌');
            return;
        }

        setIsLoading(true);
        try {
            const user = sessionData.session.user;
            const { error } = await supabase
                .from('folders')
                .insert({
                    title,
                    owner_id: user.id
                });

            if (error) {
                toast.error(error.message);
                return;
            }

            // 🔄 FORÇA RELOAD REAL DO BACKEND
            const freshFolders = await fetchFolders(user.id);
            console.log('[FOLDERS AFTER INSERT]', freshFolders);
            setFolders(freshFolders);

            toast.success('Coleção criada com sucesso ✅');
        } catch (err) {
            console.error('[CREATE FOLDER ERROR]', err);
            toast.error('Erro inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToFolder = async (folderId: string | null, details: { title: string, description: string, price: number, file: Blob | null }) => {
        try {
            setIsLoading(true);
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;
            if (!user) throw new Error('Usuário não autenticado');

            let image_url: string | null = null;
            
            if (details.file) {
                const fileName = `${Date.now()}-${details.title.replace(/\s+/g, '_').substring(0, 20)}.jpg`;
                const filePath = `${user.id}/${fileName}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, details.file);
                
                if (uploadError) {
                    toast.error(uploadError.message);
                    return;
                }
                
                const { data: urlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);
                    
                image_url = urlData.publicUrl;
            }

            const { data: productData, error: dbError } = await supabase
                .from('products')
                .insert({ 
                    owner_id: user.id,
                    folder_id: folderId,
                    title: details.title, 
                    description: details.description, 
                    price: details.price, 
                    image_url
                })
                .select()
                .single();
            
            if (dbError) {
                toast.error(dbError.message);
                return;
            }

            // 🔄 FORÇA RELOAD REAL DO BACKEND
            const freshProducts = await fetchAllProducts(user.id);
            setProducts(freshProducts);
            
            if (folderId) {
                setFolders(f => f.map(fold => fold.id === folderId ? { 
                    ...fold, 
                    item_count: (fold.item_count || 0) + 1, 
                    cover_image: fold.cover_image || productData.image_url 
                } : fold));
                
                if (productData.image_url) {
                    const currentFold = folders.find(f => f.id === folderId);
                    await supabase.from('folders').update({ 
                        item_count: (currentFold?.item_count || 0) + 1,
                        cover_image: currentFold?.cover_image || productData.image_url
                    }).eq('id', folderId);
                }
            }
            
            toast.success("Produto adicionado ✅");
            return productData;
        } catch (err: any) {
            toast.error(err.message || 'Erro no upload');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhotoSelection = (dataUrl: string) => {
        setUserImage(dataUrl);
        // Após carregar a foto, redirecionar para a Home (Perfil) para escolher a seção
        setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home);
        toast.success("Foto carregada! Escolha uma seção do Mercado para provar.");
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;
        
        if (viewedProfileId && viewedProfileData) {
            const isSelf = profile?.user_id === viewedProfileId;
            if (viewedProfileData.account_type === 'business') {
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
                        onCreateProductInFolder={handleAddProductToFolder}
                        onMoveProductToFolder={async (pId, fId) => {
                            try {
                                const { error } = await supabase.from('products').update({ folder_id: fId }).eq('id', pId);
                                if (error) throw error;
                                setProducts(prev => prev.map(p => (p.id === pId ? { ...p, folder_id: fId } : p)));
                                toast.success("Item movido!");
                            } catch (e) { toast.error("Erro ao mover."); }
                        }} 
                        onUpdateProfile={handleUpdateProfile} 
                        onUpdateProfileImage={handleUpdateProfileImage} 
                        onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                        onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                        onAddComment={() => {}} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId}
                        isVisitor={!isSelf} onBack={() => setViewedProfileId(null)}
                    />
                );
            } else {
                return profile && (
                    <HomeScreen 
                        loggedInProfile={profile} viewedProfileId={viewedProfileId} realBusinesses={realBusinesses} 
                        onUpdateProfile={handleUpdateProfile} 
                        onUpdateProfileImage={handleUpdateProfileImage} 
                        onSelectCategory={(cat) => setViewedProfileId(cat.id)} 
                        onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} 
                        onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} 
                        onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} 
                        onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem} 
                        onViewProfile={setViewedProfileId} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={() => supabase.auth.signOut()} 
                        unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                        isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} 
                        onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                        onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} 
                    />
                );
            }
        }

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={async (type) => { 
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.id) { 
                    setIsLoading(true);
                    try {
                        const { data: updated, error } = await supabase.from('profiles').update({ account_type: type }).eq('user_id', user.id).select().single(); 
                        if (error) throw error;
                        if (updated) setProfile(updated);
                    } catch (e) {
                        toast.error("Erro ao definir tipo.");
                    } finally { setIsLoading(false); }
                }
            }} />;
            case Screen.BusinessOnboarding: return <BusinessOnboardingScreen onComplete={async (details) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) { 
                    setIsLoading(true);
                    try {
                        const { data: updated, error = null } = await supabase.from('profiles').update({ 
                          full_name: details.business_name, 
                          bio: details.description, 
                          avatar_url: details.logo_url 
                        }).eq('user_id', user.id).select().single(); 
                        if (error) throw error;
                        if (updated) setProfile(updated);
                    } catch (e) { toast.error("Erro no cadastro."); }
                    finally { setIsLoading(false); }
                }
            }} />;
            case Screen.VendorDashboard: return businessProfile && profile && (
                <VendorDashboard 
                    businessProfile={businessProfile} profile={profile} onOpenMenu={() => setShowVendorMenu(true)} 
                    unreadNotificationCount={unreadCount} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} folders={folders} 
                    products={products} posts={posts} onCreateFolder={handleCreateFolder} 
                    onCreateProductInFolder={handleAddProductToFolder}
                    onMoveProductToFolder={async (pId, fId) => {
                        try {
                            const { error } = await supabase.from('products').update({ folder_id: fId }).eq('id', pId);
                            if (error) throw error;
                            setProducts(prev => prev.map(p => (p.id === pId ? { ...p, folder_id: fId } : p)));
                            toast.success("Item movido!");
                        } catch (e) { toast.error("Erro ao mover."); }
                    }} 
                    onUpdateProfile={handleUpdateProfile} 
                    onUpdateProfileImage={handleUpdateProfileImage} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} 
                    onAddComment={() => {}} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId}
                />
            );
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onNavigateToAllHighlights={() => {}} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} unreadNotificationCount={unreadCount} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={handleUpdateProfileImage} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={() => supabase.auth.signOut()} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} posts={posts} items={[]} onViewProfile={setViewedProfileId} onLikePost={(id) => setPosts(prev => prev.map(p => p.id === id ? {...p, isLiked: !p.isLiked} : p))} onItemClick={setRecommendationItem} onItemAction={setRecommendationItem} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.VendorProducts: return businessProfile && <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} products={products} onCreateProduct={async (d) => { await handleAddProductToFolder(null, d); }} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onRemoveItem={(i) => setCartItems(prev => prev.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={(it) => { setRecommendationItem(it); }} onCheckout={() => { toast.success("Pedido finalizado!"); setCartItems([]); }} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handlePhotoSelection} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handlePhotoSelection} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className="h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={() => supabase.auth.signOut()} onNavigateToVerification={() => {}} />}
            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.VendorDashboard, Screen.VendorProducts].includes(currentScreen) && !viewedProfileId && (
                <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => { 
                        setViewedProfileId(null);
                        if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
                        else setCurrentScreen(Screen.Home);
                    }} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} accountType={profile.account_type} onNavigateToVendorAnalytics={() => {}} />
            )}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => {}} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={() => supabase.auth.signOut()} />}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={() => {}} />}
        </div>
    );
};

export default App;