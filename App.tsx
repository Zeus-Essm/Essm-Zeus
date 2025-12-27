
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, MarketplaceType, SubCategory } from './types';
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
import VendorProductsScreen from './components/VendorProductsScreen';
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import VendorMenuModal from './components/VendorMenuModal';
import SearchScreen from './components/SearchScreen';
import NotificationsPanel from './components/NotificationsPanel';
import SettingsPanel from './components/SettingsPanel';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CameraScreen from './components/CameraScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import CaptionModal from './components/CaptionModal';
import AllHighlightsScreen from './components/AllHighlightsScreen';
import ItemSelectionScreen from './components/ItemSelectionScreen';
import SubCategorySelectionScreen from './components/SubCategorySelectionScreen';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [allMarketplaceProducts, setAllMarketplaceProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [realBusinessCategories, setRealBusinessCategories] = useState<Category[]>([]);
    const [allProfilesForSearch, setAllProfilesForSearch] = useState<Profile[]>([]);
    
    const [selectedCategoryNode, setSelectedCategoryNode] = useState<Category | SubCategory | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoTargetItem, setVtoTargetItem] = useState<Item | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            location.reload();
        } catch (err) {
            location.reload();
        }
    };

    const fetchGlobalData = useCallback(async () => {
        try {
            // 1. Perfis e Lojas com Limpeza de Duplicados e Incompletos
            const { data: profilesData } = await (supabase.from('profiles').select('*') as any);
            if (profilesData) {
                const typedProfiles = profilesData as Profile[];
                
                // Deduplicação por user_id e remoção de perfis sem nome/username
                const uniqueProfilesMap = new Map<string, Profile>();
                typedProfiles.forEach(p => {
                    if (p.user_id && (p.full_name || p.username)) {
                        uniqueProfilesMap.set(p.user_id, p);
                    }
                });
                const cleanedProfiles = Array.from(uniqueProfilesMap.values());
                
                setAllProfilesForSearch(cleanedProfiles);

                const stores: Category[] = cleanedProfiles
                    .filter(p => p.account_type === 'business')
                    .map(p => ({
                        id: p.user_id,
                        name: p.full_name || p.username || 'Loja PUMP',
                        image: p.avatar_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg',
                        type: (p.business_category as MarketplaceType) || 'fashion', 
                        subCategories: [] 
                    }));
                setRealBusinessCategories(stores);
            }

            // 2. Produtos Globais
            const { data: allProds } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (allProds) setAllMarketplaceProducts(allProds as Product[]);

            // 3. Feed de Posts (Restauração robusta)
            const { data: postsData } = await supabase.from('posts').select('*, profiles(*)').order('created_at', { ascending: false });
            if (postsData) {
                const formattedPosts: Post[] = postsData.map((p: any) => ({
                    id: p.id,
                    user_id: p.user_id,
                    user: { 
                        id: p.profiles?.user_id || p.user_id, 
                        full_name: p.profiles?.full_name || p.profiles?.username || 'Utilizador PUMP', 
                        avatar_url: p.profiles?.avatar_url || null
                    },
                    image: p.image_url,
                    caption: p.caption,
                    likes: p.likes_count || 0,
                    isLiked: false,
                    created_at: p.created_at,
                    comments: [],
                    commentCount: 0,
                    items: [] 
                }));
                setPosts(formattedPosts);
            }
        } catch (err) { console.error("Erro Global:", err); }
    }, []);

    const fetchVendorData = async (userId: string) => {
        const [fRes, pRes] = await Promise.all([
            supabase.from('folders').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
            supabase.from('products').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
        ]);
        setFolders((fRes.data as Folder[]) || []);
        setProducts((pRes.data as Product[]) || []);
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
                    const profileData = data as Profile | null;
                    if (profileData) {
                        setProfile(profileData);
                        if (profileData.account_type === 'business') {
                            setBusinessProfile({
                                id: profileData.user_id,
                                business_name: profileData.full_name || 'Minha Loja',
                                business_category: profileData.business_category || 'fashion',
                                description: profileData.bio || '',
                                logo_url: profileData.avatar_url || ''
                            });
                            fetchVendorData(session.user.id);
                            setCurrentScreen(Screen.VendorDashboard);
                        } else {
                            setCurrentScreen(Screen.Feed);
                        }
                        fetchGlobalData();
                    } else {
                        setCurrentScreen(Screen.AccountTypeSelection);
                    }
                    setAuthLoading(false);
                });
            } else {
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            }
        });
        return () => subscription.unsubscribe();
    }, [fetchGlobalData]);

    const handlePhotoCaptured = (url: string) => {
        setUserImage(url);
        if (vtoTargetItem) {
            handleGenerateLook(url, vtoTargetItem, []);
            setVtoTargetItem(null);
        } else {
            if (profile?.account_type === 'business') {
                setCurrentScreen(Screen.VendorDashboard);
            } else {
                setCurrentScreen(Screen.Feed);
                toast("Agora escolha algo no catálogo para provar!");
            }
        }
    };

    const startTryOn = (item: Item) => {
        if (!userImage) {
            setVtoTargetItem(item);
            setCurrentScreen(Screen.ImageSourceSelection);
        } else {
            handleGenerateLook(userImage, item, vtoItems);
        }
    };

    const handleGenerateLook = async (image: string, item: Item, existing: Item[]) => {
        setCurrentScreen(Screen.Generating);
        setIsLoading(true);
        try {
            const result = await generateTryOnImage(image, item, existing);
            setGeneratedImage(result);
            setVtoItems(prev => [...prev, item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            toast.error(err.message);
            setCurrentScreen(Screen.Feed);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProduct = async (folderId: string | null, details: any): Promise<Product | null> => {
        if (!session?.user) return null;
        setIsLoading(true);
        try {
            const { data } = await (supabase.from('products').insert({
                title: details.title,
                description: details.description,
                price: details.price,
                image_url: details.image_url,
                folder_id: folderId,
                owner_id: session.user.id,
                category: details.category || 'fashion',
                is_try_on: true
            }).select().single() as any);
            if (data) {
                setProducts(prev => [data as Product, ...prev]);
                fetchGlobalData();
                return data as Product;
            }
            return null;
        } catch (err) { return null; } finally { setIsLoading(false); }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;

        // Filtramos para a pesquisa não mostrar o próprio utilizador (limpa o ecrã de busca)
        const filteredProfilesForSearch = allProfilesForSearch.filter(p => p.user_id !== profile?.user_id);

        const uiItems: Item[] = allMarketplaceProducts.map(p => ({
            id: p.id,
            name: p.title,
            description: p.description || '',
            price: p.price,
            image: p.image_url || '',
            category: (p.folder_id || p.owner_id) as string,
            isTryOn: p.is_try_on,
            owner_id: p.owner_id
        }));

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onSuccess={() => {}} />;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={async (type) => {
                await supabase.from('profiles').update({ account_type: type }).eq('user_id', session?.user.id);
                window.location.reload();
            }} />;
            case Screen.VendorDashboard: 
                return businessProfile && profile && (
                    <VendorDashboard 
                        businessProfile={businessProfile} profile={profile} folders={folders} products={products} posts={posts}
                        onCreateFolder={async (title) => {
                            const { data } = await (supabase.from('folders').insert({ title, owner_id: profile.user_id }).select().single() as any);
                            if (data) setFolders(p => [data as Folder, ...p]);
                        }} 
                        onDeleteFolder={async (id) => {
                            await supabase.from('folders').delete().eq('id', id);
                            setFolders(p => p.filter(f => f.id !== id));
                        }} 
                        onCreateProductInFolder={handleCreateProduct} 
                        onDeleteProduct={async (id) => {
                            await supabase.from('products').delete().eq('id', id);
                            setProducts(p => p.filter(prod => prod.id !== id));
                        }}
                        onUpdateProfile={async (updates) => {
                            const { data } = await (supabase.from('profiles').update(updates).eq('user_id', profile.user_id).select().single() as any);
                            if (data) setProfile(data as Profile);
                        }} 
                        onUpdateProfileImage={async (dataUrl) => {
                            await supabase.from('profiles').update({ avatar_url: dataUrl }).eq('user_id', profile.user_id);
                            setProfile(p => p ? {...p, avatar_url: dataUrl} : null);
                        }}
                        onNavigateToProducts={(fid) => { setSelectedCollectionId(fid || profile.user_id); setCurrentScreen(Screen.ItemSelection); }}
                        onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)}
                        onOpenPromotionModal={() => {}} followersCount={0} followingCount={0}
                        onMoveProductToFolder={async () => {}} onLikePost={() => {}} onAddComment={() => {}} 
                        onItemClick={startTryOn} 
                        onViewProfile={(id) => { setSelectedCollectionId(id); setCurrentScreen(Screen.ItemSelection); }}
                    />
                );
            case Screen.Feed: return profile && <FeedScreen posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} realBusinesses={realBusinessCategories} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} onViewProfile={(id) => { setSelectedCollectionId(id); setCurrentScreen(Screen.ItemSelection); }} onSelectCategory={(cat) => { setSelectedCollectionId(cat.id); setCurrentScreen(Screen.ItemSelection); }} onLikePost={() => {}} onAddComment={() => {}} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => { setVtoTargetItem(null); setCurrentScreen(Screen.ImageSourceSelection); }} unreadNotificationCount={0} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home: return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinessCategories} onUpdateProfile={() => {}} onUpdateProfileImage={() => {}} onSelectCategory={(cat) => { setSelectedCollectionId(cat.id); setCurrentScreen(Screen.ItemSelection); }} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => { setVtoTargetItem(null); setCurrentScreen(Screen.ImageSourceSelection); }} isCartAnimating={false} onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} onItemClick={startTryOn} onViewProfile={(id) => { setSelectedCollectionId(id); setCurrentScreen(Screen.ItemSelection); }} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={() => {}} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={uiItems} availableProfiles={filteredProfilesForSearch} onViewProfile={(id) => { setSelectedCollectionId(id); setCurrentScreen(Screen.ItemSelection); }} onLikePost={() => {}} onItemClick={startTryOn} onItemAction={startTryOn} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.AllHighlights: return <AllHighlightsScreen categories={realBusinessCategories} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={async (cat) => { setSelectedCollectionId(cat.id); setCurrentScreen(Screen.ItemSelection); }} />;
            case Screen.ItemSelection: return selectedCollectionId && <ItemSelectionScreen userImage={userImage || ''} collectionId={selectedCollectionId} collectionName="Catálogo" collectionType="fashion" itemsFromDb={uiItems} onItemSelect={startTryOn} onOpenSplitCamera={() => {}} onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Feed)} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} onAddToCart={(i) => { setCartItems(p => [...p, i]); toast.success("Adicionado!"); }} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handlePhotoCaptured} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handlePhotoCaptured} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => setCurrentScreen(Screen.Cart)} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(Screen.Feed); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.Feed)} onGenerateVideo={() => {}} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={(i) => setCartItems(p => p.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Sucesso!"); setCartItems([]); }} />;
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            default: return <SplashScreen />;
        }
    };

    return (
        <div className={`h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {isNotificationsOpen && <NotificationsPanel notifications={[]} onClose={() => setIsNotificationsOpen(false)} onNotificationClick={() => {}} />}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            {showCaptionModal && generatedImage && (
                <CaptionModal 
                    image={generatedImage} onClose={() => setShowCaptionModal(false)} 
                    onPublish={async (caption) => {
                        setIsLoading(true);
                        try {
                            await supabase.from('posts').insert({ user_id: session?.user.id, image_url: generatedImage, caption });
                            await fetchGlobalData();
                            setShowCaptionModal(false);
                            setCurrentScreen(Screen.Confirmation);
                        } catch (err) { toast.error("Erro ao publicar."); } finally { setIsLoading(false); }
                    }} 
                />
            )}
            {[Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.AllHighlights, Screen.VendorDashboard].includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} 
                    accountType={profile?.account_type} 
                    onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToPromotion={() => {}} 
                    onNavigateToProfile={() => profile?.account_type === 'business' ? setCurrentScreen(Screen.VendorDashboard) : setCurrentScreen(Screen.Home)} 
                    onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} 
                    onStartTryOn={() => { setVtoTargetItem(null); setVtoItems([]); setCurrentScreen(Screen.ImageSourceSelection); }} 
                    isCartAnimating={cartItems.length > 0} 
                />
            )}
            {currentScreen === Screen.Confirmation && <ConfirmationScreen message="Look publicado com sucesso!" onHome={() => profile?.account_type === 'business' ? setCurrentScreen(Screen.VendorDashboard) : setCurrentScreen(Screen.Feed)} />}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={handleSignOut} />}
        </div>
    );
};

export default App;
