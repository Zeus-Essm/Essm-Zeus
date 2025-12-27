
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, Profile, BusinessProfile, Folder, Product, Comment, MarketplaceType, SubCategory } from './types';
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
            console.error("Erro ao sair:", err);
            location.reload();
        }
    };

    const fetchGlobalData = async () => {
        try {
            const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
            if (!pError && profiles) {
                setAllProfilesForSearch(profiles);
                const stores: Category[] = profiles
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

            const { data: allProds, error: prodError } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (!prodError && allProds) setAllMarketplaceProducts(allProds);

            const { data: postsData, error: postsError } = await supabase.from('posts').select('*, profiles(*), comments(*, profiles(*)), likes(*)');
            if (!postsError && postsData) {
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
                    likes: p.likes?.length || 0,
                    isLiked: p.likes?.some((l: any) => l.user_id === session?.user.id),
                    created_at: p.created_at,
                    comments: (p.comments || []).map((c: any) => ({
                        id: c.id,
                        text: c.text,
                        timestamp: c.created_at,
                        user: { id: c.profiles?.user_id, full_name: c.profiles?.full_name, avatar_url: c.profiles?.avatar_url }
                    })),
                    commentCount: p.comments?.length || 0,
                    items: [] 
                }));
                setPosts(formattedPosts);
            }
        } catch (err) { console.error(err); }
    };

    const fetchVendorData = async (userId: string) => {
        const [fRes, pRes] = await Promise.all([
            supabase.from('folders').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
            supabase.from('products').select('*').eq('owner_id', userId).order('created_at', { ascending: false })
        ]);
        setFolders(fRes.data || []);
        setProducts(pRes.data || []);
    };

    const handleUpdateProfileImage = async (base64DataUrl: string) => {
        setIsLoading(true);
        try {
            // 1. Obter usuário (Email ou Google)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");
            const userId = user.id;

            // Converter base64 para Blob
            const response = await fetch(base64DataUrl);
            const file = await response.blob();
            
            // 2. Definir caminho solicitado: userId/avatar.png (dentro do bucket avatars)
            const filePath = `${userId}/avatar.png`;

            // 3. Upload com upsert: true conforme solicitado
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error(uploadError);
                throw uploadError;
            }

            // 4. Obter URL pública
            const { data } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            const avatarUrl = data.publicUrl;

            // 5. Atualizar perfil no banco de dados
            const { data: updatedProfile, error: dbError } = await supabase
                .from("profiles")
                .update({ avatar_url: avatarUrl })
                .eq("user_id", userId)
                .select()
                .single();

            if (dbError) throw dbError;

            // 6. Atualizar estado local
            if (updatedProfile) {
                setProfile(updatedProfile);
                if (updatedProfile.account_type === 'business') {
                    setBusinessProfile(prev => prev ? { ...prev, logo_url: avatarUrl } : null);
                }
                toast.success("Foto atualizada com sucesso!");
                fetchGlobalData();
            }
        } catch (err: any) {
            toast.error(err.message || "Falha ao carregar a foto.");
        } finally {
            setIsLoading(false);
        }
    };

    const uploadProductImage = async (file: Blob): Promise<string> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Não autenticado");
        const userId = user.id;
        
        // Padrão solicitado: products/userId/productId.jpg
        const productId = crypto.randomUUID();
        const filePath = `${userId}/${productId}.jpg`;
        
        const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error(uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleCreateProduct = async (folderId: string | null, details: any): Promise<Product | null> => {
        setIsLoading(true);
        try {
            let finalImageUrl = details.image_url || 'https://i.postimg.cc/LXmdq4H2/D.jpg';
            if (details.file) finalImageUrl = await uploadProductImage(details.file);

            const { data, error } = await supabase.from('products').insert({
                title: details.title,
                description: details.description,
                price: details.price,
                image_url: finalImageUrl,
                folder_id: folderId,
                owner_id: session?.user.id,
                category: 'fashion',
                is_try_on: true
            }).select().single();

            if (error) throw error;
            if (data) {
                setProducts(prev => [data, ...prev]);
                setAllMarketplaceProducts(prev => [data, ...prev]);
                toast.success("Item adicionado com sucesso!");
                return data;
            }
            return null;
        } catch (err: any) {
            toast.error(`Erro ao criar item: ${err.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProduct = async (productId: string, details: any): Promise<Product | null> => {
        setIsLoading(true);
        try {
            let finalImageUrl = details.image_url;
            if (details.file) finalImageUrl = await uploadProductImage(details.file);

            const { data, error } = await supabase.from('products').update({
                title: details.title,
                description: details.description,
                price: details.price,
                image_url: finalImageUrl,
                folder_id: details.folder_id,
                updated_at: new Date().toISOString()
            }).eq('id', productId).select().single();

            if (error) throw error;
            if (data) {
                setProducts(prev => prev.map(p => p.id === productId ? data : p));
                setAllMarketplaceProducts(prev => prev.map(p => p.id === productId ? data : p));
                toast.success("Item atualizado!");
                return data;
            }
            return null;
        } catch (err: any) {
            toast.error(`Erro ao atualizar: ${err.message}`);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
                    if (data) {
                        setProfile(data);
                        if (data.account_type === 'business') {
                            setBusinessProfile({
                                id: data.user_id,
                                business_name: data.full_name || 'Minha Loja',
                                business_category: data.business_category || 'fashion',
                                description: data.bio || '',
                                logo_url: data.avatar_url || ''
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
    }, []);

    const handleSelectCategory = async (cat: Category | SubCategory) => {
        const { data: shopFolders } = await supabase.from('folders').select('*').eq('owner_id', cat.id);
        if (shopFolders && shopFolders.length > 0) {
            const nodeWithSubs = {
                ...cat,
                subCategories: shopFolders.map(f => ({ id: f.id, name: f.title, image: f.cover_image || cat.image }))
            };
            setSelectedCategoryNode(nodeWithSubs);
            setCurrentScreen(Screen.SubCategorySelection);
        } else {
            setSelectedCollectionId(cat.id);
            setCurrentScreen(Screen.ItemSelection);
        }
    };

    const handleUpdateProfile = async (updates: any) => {
        const { data } = await supabase.from('profiles').update(updates).eq('user_id', session?.user.id).select().single();
        if (data) setProfile(data);
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
            setCurrentScreen(Screen.Home);
        }
    };

    const renderScreen = () => {
        if (authLoading || currentScreen === Screen.Splash) return <SplashScreen />;

        const uiItems: Item[] = allMarketplaceProducts.map(p => ({
            id: p.id,
            name: p.title,
            description: p.description || '',
            price: p.price,
            image: p.image_url || '',
            category: p.folder_id || p.owner_id,
            isTryOn: p.is_try_on
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
                            const { data } = await supabase.from('folders').insert({ title, owner_id: profile.user_id }).select().single();
                            if (data) setFolders(p => [data, ...p]);
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
                        onUpdateProfile={handleUpdateProfile} 
                        onUpdateProfileImage={handleUpdateProfileImage}
                        onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)}
                        onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)}
                        onOpenPromotionModal={() => {}} followersCount={0} followingCount={0}
                        onMoveProductToFolder={async () => {}} onLikePost={() => {}} onAddComment={() => {}} onItemClick={startTryOn} onViewProfile={() => {}}
                    />
                );
            case Screen.VendorProducts:
                return businessProfile && (
                    <VendorProductsScreen 
                        onBack={() => setCurrentScreen(Screen.VendorDashboard)} 
                        businessProfile={businessProfile} products={products} folders={folders}
                        onCreateProduct={handleCreateProduct}
                        onUpdateProduct={handleUpdateProduct}
                        onDeleteProduct={(id) => {
                            supabase.from('products').delete().eq('id', id).then(() => setProducts(p => p.filter(x => x.id !== id)));
                        }}
                    />
                );
            case Screen.Feed: return profile && (
                <FeedScreen 
                    posts={posts} stories={[]} profile={profile} businessProfile={businessProfile} 
                    realBusinesses={realBusinessCategories} isProfilePromoted={false} promotedItems={[]} 
                    onBack={() => {}} onItemClick={startTryOn} onAddToCartMultiple={() => {}} onBuyMultiple={() => {}} 
                    onViewProfile={(id) => handleSelectCategory({ id, name: 'Loja', image: '', type: 'fashion' })} 
                    onSelectCategory={handleSelectCategory} onLikePost={() => {}} onAddComment={() => {}} 
                    onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    unreadNotificationCount={0} onNotificationsClick={() => setIsNotificationsOpen(true)} onSearchClick={() => setCurrentScreen(Screen.Search)} 
                />
            );
            case Screen.Home: return profile && (
                <HomeScreen 
                    loggedInProfile={profile} viewedProfileId={null} realBusinesses={realBusinessCategories} 
                    onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={handleUpdateProfileImage} 
                    onSelectCategory={handleSelectCategory} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} 
                    onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToChat={() => {}} onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                    isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={startTryOn} 
                    onViewProfile={() => {}} onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} 
                    unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => setIsNotificationsOpen(true)} 
                    isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} onLikePost={() => {}} onAddComment={() => {}} 
                    onSearchClick={() => setCurrentScreen(Screen.Search)} 
                />
            );
            case Screen.SubCategorySelection: return selectedCategoryNode && (
                <SubCategorySelectionScreen 
                    node={selectedCategoryNode} 
                    onSelectSubCategory={(sub) => { setSelectedCollectionId(sub.id); setCurrentScreen(Screen.ItemSelection); }} 
                    onBack={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} 
                />
            );
            case Screen.ItemSelection: return selectedCollectionId && (
                <ItemSelectionScreen 
                    userImage={userImage || ''} 
                    collectionId={selectedCollectionId} 
                    collectionName="Produtos" 
                    collectionType="fashion"
                    itemsFromDb={uiItems} 
                    onItemSelect={startTryOn} onOpenSplitCamera={() => {}} 
                    onBack={() => setCurrentScreen(Screen.SubCategorySelection)} 
                    onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} 
                    onAddToCart={(i) => { setCartItems(p => [...p, i]); toast.success("Adicionado!"); }} 
                />
            );
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={(url) => { setUserImage(url); setCurrentScreen(Screen.Home); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Camera: return <CameraScreen onPhotoTaken={(url) => { setUserImage(url); setCurrentScreen(Screen.Home); }} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Generating: return userImage && <LoadingIndicator userImage={generatedImage || userImage} />;
            case Screen.Result: return generatedImage && <ResultScreen generatedImage={generatedImage} items={vtoItems} categoryItems={[]} onBuy={() => setCurrentScreen(Screen.Cart)} onUndo={() => { setVtoItems(v => v.slice(0, -1)); setCurrentScreen(Screen.Home); }} onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} onItemSelect={startTryOn} onAddMoreItems={() => setCurrentScreen(Screen.Home)} onGenerateVideo={() => {}} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={(i) => setCartItems(p => p.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={startTryOn} onCheckout={() => { toast.success("Sucesso!"); setCartItems([]); }} />;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={uiItems} availableProfiles={allProfilesForSearch} onViewProfile={() => {}} onLikePost={() => {}} onItemClick={startTryOn} onItemAction={startTryOn} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={(i) => setCartItems(p => [...p, i])} onBuy={(i) => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.AllHighlights: return <AllHighlightsScreen categories={realBusinessCategories} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={handleSelectCategory} />;
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
                        } catch (err) {
                            toast.error("Erro ao publicar post.");
                        } finally {
                            setIsLoading(false);
                        }
                    }} 
                />
            )}
            
            {profile?.account_type === 'personal' && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.AllHighlights].includes(currentScreen) && (
                <BottomNavBar activeScreen={currentScreen} accountType="personal" onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}} onNavigateToProfile={() => setCurrentScreen(Screen.Home)} onNavigateToVendorAnalytics={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} />
            )}
            {profile?.account_type === 'business' && [Screen.VendorDashboard, Screen.VendorProducts, Screen.VendorAnalytics, Screen.Feed, Screen.Search, Screen.AllHighlights].includes(currentScreen) && (
                <BottomNavBar activeScreen={currentScreen} accountType="business" onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => {}} onNavigateToPromotion={() => {}} onNavigateToProfile={() => setCurrentScreen(Screen.VendorDashboard)} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} />
            )}
            {currentScreen === Screen.Confirmation && <ConfirmationScreen message="Look publicado no feed!" onHome={() => setCurrentScreen(profile?.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} />}
            {showVendorMenu && <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => {}} onNavigateToCollaborations={() => {}} onSignOut={handleSignOut} />}
        </div>
    );
};

export default App;
