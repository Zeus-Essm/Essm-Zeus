import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, ShowcaseItem, AppNotification, Comment, User, Product } from './types';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, MALE_CLOTHING_SUBCATEGORIES } from './constants';

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

const isNative = !!(window as any).Capacitor;

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
    
    // UI Panels State
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
            image: p.avatar_url || '',
            type: 'fashion',
            subCategories: MALE_CLOTHING_SUBCATEGORIES, 
            isAd: false
        }));
        setRealBusinesses(mapped);
    };

    const fetchFolders = async (userId: string) => {
        if (userId.startsWith('temp_')) return [];
        const { data, error } = await supabase
            .from("folders")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });

        if (error) return [];
        return data || [];
    };

    const fetchAllProducts = async (userId: string) => {
        if (userId.startsWith('temp_')) return [];
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq('owner_id', userId)
            .order("created_at", { ascending: false });

        if (error) return [];
        return data || [];
    };

    const handleAuthState = async (currentSession: Session | null, mounted: boolean) => {
        if (!mounted) return;
        
        setSession(currentSession);
        fetchRealBusinesses();

        if (currentSession?.user) {
            const user = currentSession.user;
            
            // Buscar perfil existente
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (!mounted) return;

            // Se não existir, criar um novo perfil básico
            if (!existingProfile) {
                await supabase.from('profiles').insert({
                    user_id: user.id,
                    username: user.user_metadata?.full_name?.toLowerCase().replace(/\s/g, '_') || `user_${user.id.substring(0, 5)}`,
                    full_name: user.user_metadata?.full_name ?? '',
                    avatar_url: user.user_metadata?.avatar_url ?? null,
                    account_type: null
                });
            }
            
            if (!mounted) return;
            
            // Buscar perfil atualizado
            const { data: freshProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (!mounted) return;

            // Buscar dados da loja/inventário
            if (user.id) {
                const [freshFolders, fetchedProducts] = await Promise.all([
                    fetchFolders(user.id),
                    fetchAllProducts(user.id)
                ]);
                if (!mounted) return;
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
        } else {
            // Lógica de Sign Out / Sessão Expirada
            setProfile(null);
            setProducts([]);
            setFolders([]);
            setBusinessProfile(null);
            setCartItems([]);
            setCurrentScreen(Screen.AccountTypeSelection);
        }
        
        if (mounted) setAuthLoading(false);
    };

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const { data } = await supabase.auth.getSession();
            if (!mounted) return;
            handleAuthState(data.session, mounted);
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (!mounted) return;
                handleAuthState(session, mounted);
            }
        );

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleCreateFolder = async (title: string) => {
        if (!profile) return;
        if (profile.user_id.startsWith('temp_')) {
            const mockFolder: Folder = {
                id: `temp_${Date.now()}`,
                title,
                owner_id: profile.user_id,
                item_count: 0,
                created_at: new Date().toISOString(),
                cover_image: null
            };
            setFolders(p => [mockFolder, ...p]);
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('folders')
                .insert({ title, owner_id: profile.user_id, item_count: 0 })
                .select().single();
            if (error) throw error;
            setFolders(p => [data, ...p]);
            setShowUpdateBadge(true);
            setTimeout(() => setShowUpdateBadge(false), 3000);
        } catch (err: any) {
            console.error(err.message);
            alert("Erro ao criar pasta no Supabase.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProductToFolder = async (folderId: string, details: { title: string, description: string, price: number, file: Blob | null }) => {
        if (!profile || !session?.user) return;
        setIsLoading(true);
        try {
            let publicUrl: string | null = null;
            
            if (details.file) {
                const fileExt = details.file.type.split('/')[1] || 'jpg';
                const fileName = `${profile.user_id}/${Date.now()}_${details.title.replace(/\s/g, '_')}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(fileName, details.file);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
                publicUrl = urlData.publicUrl;
            }

            const { data: productData, error: dbError } = await supabase
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

            if (dbError) throw dbError;

            // Incremento via RPC (deve estar configurado no seu Supabase SQL)
            await supabase.rpc('increment_folder_count', { row_id: folderId });

            setProducts(p => [productData, ...p]);
            setFolders(f => f.map(fold => fold.id === folderId ? { 
                ...fold, 
                item_count: (fold.item_count || 0) + 1,
                cover_image: fold.cover_image || productData.image_url
            } : fold));
            
            setShowUpdateBadge(true);
            setTimeout(() => setShowUpdateBadge(false), 3000);
            return productData;
        } catch (err: any) {
            console.error(err.message);
            alert("Erro ao salvar produto no Supabase.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string, name?: string }) => {
        if (!profile || !session?.user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    full_name: updates.name ?? profile.full_name,
                    bio: updates.bio ?? profile.bio,
                    username: updates.username ?? profile.username
                })
                .eq('user_id', profile.user_id)
                .select().single();

            if (error) throw error;
            setProfile(data);
            if (profile.account_type === 'business') {
                setBusinessProfile(prev => prev ? {
                    ...prev,
                    business_name: data.full_name || data.username,
                    description: data.bio || ''
                } : null);
            }
            setShowUpdateBadge(true);
            setTimeout(() => setShowUpdateBadge(false), 3000);
        } catch (err: any) {
            alert(`Erro: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfileImage = async (dataUrl: string) => {
        if (!profile || !session?.user) return;
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
            alert(`Erro: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLikePost = (postId: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const newIsLiked = !p.isLiked;
                return {
                    ...p,
                    isLiked: newIsLiked,
                    likes: newIsLiked ? p.likes + 1 : p.likes - 1
                };
            }
            return p;
        }));
    };

    const handleAddComment = (postId: string, text: string) => {
        if (!profile) return;
        const comment: Comment = {
            id: `c_${Date.now()}`,
            user: {
                id: profile.user_id,
                full_name: profile.full_name || profile.username || 'User',
                avatar_url: profile.avatar_url || ''
            },
            text,
            timestamp: new Date().toISOString()
        };
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return {
                    ...p,
                    comments: [...p.comments, comment],
                    commentCount: p.commentCount + 1
                };
            }
            return p;
        }));
    };

    // Helper for Product to Item mapping (for Feed/Search UI)
    const mappedItems: Item[] = products.map(p => ({
        id: p.id,
        name: p.title,
        description: p.description || '',
        price: p.price,
        image: p.image_url || '',
        category: 'catalog',
        owner_id: p.owner_id,
        folder_id: p.folder_id
    }));

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
                        user_id: `temp_${Date.now()}`,
                        username: '',
                        full_name: '',
                        bio: '',
                        avatar_url: null,
                        account_type: type
                    };
                    setProfile(tempProfile);
                    if (type === 'business') {
                        setBusinessProfile({
                            id: tempProfile.user_id, business_name: '', business_category: 'fashion', description: '', logo_url: ''
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
                    onMoveProductToFolder={async (pId, fId) => {
                      if (!profile.user_id.startsWith('temp_')) {
                        await supabase.from('products').update({ folder_id: fId }).eq('id', pId);
                      }

                      const oldFolderId = products.find(p => p.id === pId)?.folder_id;

                      setProducts(prev =>
                        prev.map(p => (p.id === pId ? { ...p, folder_id: fId } : p))
                      );

                      setFolders(prev =>
                        prev.map(f => {
                          if (f.id === fId) return { ...f, item_count: (f.item_count || 0) + 1 };
                          if (oldFolderId && f.id === oldFolderId)
                            return { ...f, item_count: Math.max(0, (f.item_count || 0) - 1) };
                          return f;
                        })
                      );
                    }} 
                    onUpdateProfile={handleUpdateProfile} 
                    onUpdateProfileImage={handleUpdateProfileImage} 
                    onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} 
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    onItemClick={setRecommendationItem}
                    onViewProfile={setViewedProfileId}
                />
            );
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorProducts:
              return businessProfile && folders.length > 0 ? (
                <VendorProductsScreen
                  onBack={() => setCurrentScreen(Screen.VendorDashboard)}
                  businessProfile={businessProfile}
                  products={products}
                  onCreateProduct={(data) =>
                    handleAddProductToFolder(folders[0].id, data)
                  }
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn bg-white">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-zinc-50 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Coleção Necessária</h3>
                  <p className="text-[11px] text-zinc-500 mt-2 max-w-[240px] leading-relaxed">
                    Você precisa criar pelo menos uma <span className="font-bold text-amber-600">Coleção</span> no painel principal antes de começar a cadastrar seus produtos.
                  </p>
                  <button 
                    onClick={() => setCurrentScreen(Screen.VendorDashboard)}
                    className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 hover:text-amber-700 underline"
                  >
                    Voltar ao Painel
                  </button>
                </div>
              );
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={(cat) => { setViewedProfileId(cat.id); setCurrentScreen(Screen.Home); }} onLikePost={handleLikePost} onAddComment={handleAddComment} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} unreadNotificationCount={unreadCount} onNotificationsClick={handleOpenNotifications} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={viewedProfileId} realBusinesses={realBusinesses} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={handleUpdateProfileImage} onSelectCategory={(cat) => setViewedProfileId(cat.id)} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem} onViewProfile={setViewedProfileId} onNavigateToSettings={handleOpenSettings} onSignOut={() => supabase.auth.signOut()} unreadNotificationCount={unreadCount} unreadMessagesCount={0} onOpenNotificationsPanel={handleOpenNotifications} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={handleLikePost} onAddComment={handleAddComment} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} posts={posts} items={mappedItems} onViewProfile={(id) => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }} onLikePost={handleLikePost} onItemClick={setRecommendationItem} onItemAction={setRecommendationItem} onOpenSplitCamera={() => {}} onOpenComments={handleLikePost} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            
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
            {showUpdateBadge && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[250] bg-zinc-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl animate-slideUp flex items-center gap-2 border border-white/10"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>Sincronizado com Supabase</div>}
            
            {isNotificationsOpen && <NotificationsPanel notifications={notifications} onClose={handleCloseNotifications} onNotificationClick={handleNotificationClick} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={toggleTheme} onClose={handleCloseSettings} onSignOut={() => supabase.auth.signOut()} onNavigateToVerification={() => { setIsSettingsOpen(false); setCurrentScreen(Screen.VerificationIntro); }} />}

            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Rewards, Screen.AllHighlights, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.VendorProducts].includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} 
                    onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToPromotion={() => {}} 
                    onNavigateToProfile={() => { 
                        if (profile.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
                        else setCurrentScreen(Screen.Home);
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