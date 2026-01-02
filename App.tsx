import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Item, Profile, BusinessProfile, Folder, Product, Post } from './types';
import { toast } from './utils/toast';
import { generateTryOnImage, generateStyleTip, generateFashionVideo } from './services/geminiService';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import HomeScreen from './components/HomeScreen';
import FeedScreen from './components/FeedScreen';
import CartScreen from './components/CartScreen';
import BottomNavBar from './components/BottomNavBar';
import VendorDashboard from './components/VendorDashboard';
import SearchScreen from './components/SearchScreen';
import SettingsPanel from './components/SettingsPanel';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CameraScreen from './components/CameraScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import BusinessOnboardingScreen from './components/BusinessOnboardingScreen';
import CaptionModal from './components/CaptionModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import VeoApiKeyModal from './components/VeoApiKeyModal';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
    
    const [products, setProducts] = useState<Product[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    
    const [authLoading, setAuthLoading] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Splash);
    
    const [userImage, setUserImage] = useState<string | null>(null);
    const [vtoItems, setVtoItems] = useState<Item[]>([]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [styleTip, setStyleTip] = useState<string | undefined>(undefined);
    
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoProgressMsg, setVideoProgressMsg] = useState<string | null>(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    
    const [cartItems, setCartItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showVendorMenu, setShowVendorMenu] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCaptionModal, setShowCaptionModal] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // --- LÓGICA DE GERAÇÃO IA ---
    useEffect(() => {
        if (currentScreen === Screen.Generating && userImage && vtoItems.length > 0 && !generatedImage) {
            generateTryOnImage(userImage, vtoItems[0], [])
                .then(async res => { 
                    setGeneratedImage(res);
                    const tip = await generateStyleTip(vtoItems);
                    setStyleTip(tip);
                    setCurrentScreen(Screen.Result); 
                })
                .catch(e => { 
                    toast.error(e.message); 
                    setCurrentScreen(Screen.Feed); 
                });
        }
    }, [currentScreen, userImage, vtoItems, generatedImage]);

    const handleGenerateVideo = async () => {
        if (!generatedImage) return;

        // @ts-ignore - window.aistudio injected in sandbox
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            setShowKeyModal(true);
            return;
        }

        setIsGeneratingVideo(true);
        try {
            const videoUrl = await generateFashionVideo(generatedImage, (msg) => setVideoProgressMsg(msg));
            setGeneratedVideoUrl(videoUrl);
        } catch (e: any) {
            if (e.message?.includes("Requested entity was not found")) {
                toast.error("Erro na chave de API. Por favor, selecione novamente.");
                setShowKeyModal(true);
            } else {
                toast.error("Falha ao gerar vídeo: " + e.message);
            }
        } finally {
            setIsGeneratingVideo(false);
            setVideoProgressMsg(null);
        }
    };

    const handleSelectKey = async () => {
        setShowKeyModal(false);
        // @ts-ignore
        await window.aistudio.openSelectKey();
        handleGenerateVideo(); 
    };

    const fetchProfileData = async (userId: string) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (data) {
            setProfile(data);
            if (data.account_type === 'business') {
                setBusinessProfile({
                    id: data.id,
                    business_name: data.full_name || 'Minha Loja',
                    business_category: data.business_category || 'fashion',
                    description: data.bio || '',
                    logo_url: data.avatar_url || ''
                });
                setCurrentScreen(Screen.VendorDashboard);
            } else if (data.account_type === 'personal') {
                setCurrentScreen(Screen.Feed);
            } else {
                setCurrentScreen(Screen.AccountTypeSelection);
            }
        } else {
            setCurrentScreen(Screen.AccountTypeSelection);
        }
        setAuthLoading(false);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfileData(session.user.id);
            else {
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            }
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfileData(session.user.id);
            else {
                setProfile(null);
                setBusinessProfile(null);
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setIsLoading(false);
    };

    const renderScreen = () => {
        if (authLoading) return <SplashScreen />;

        switch (currentScreen) {
            case Screen.Login: return <LoginScreen onSuccess={() => {}} />; 
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={async (type) => {
                if (!session?.user) return;
                setIsLoading(true);
                await supabase.from('profiles').update({ account_type: type }).eq('id', session.user.id);
                if (type === 'business') setCurrentScreen(Screen.BusinessOnboarding);
                else fetchProfileData(session.user.id);
                setIsLoading(false);
            }} />;
            case Screen.BusinessOnboarding:
                return <BusinessOnboardingScreen onComplete={async (details) => {
                    setIsLoading(true);
                    await supabase.from('profiles').update({
                        full_name: details.business_name, bio: details.description,
                        avatar_url: details.logo_url, business_category: details.business_category
                    }).eq('id', session?.user.id);
                    setIsLoading(false);
                    fetchProfileData(session!.user.id);
                }} />;
            case Screen.VendorDashboard:
                return profile && businessProfile && (
                    <VendorDashboard 
                        businessProfile={businessProfile} profile={profile} folders={folders} products={products} posts={posts}
                        onCreateFolder={async (title) => {
                            const { data } = await supabase.from('folders').insert({ title, owner_id: profile.id }).select().single();
                            if (data) setFolders(prev => [data, ...prev]);
                        }}
                        onDeleteFolder={async (id) => {
                            await supabase.from('folders').delete().eq('id', id);
                            setFolders(prev => prev.filter(f => f.id !== id));
                        }}
                        onCreateProductInFolder={async (fId, details) => {
                            const { data } = await supabase.from('products').insert({ 
                                title: details.title, price: details.price, folder_id: fId, owner_id: profile.id, image_url: details.image_url 
                            }).select().single();
                            if (data) setProducts(prev => [data, ...prev]);
                            return data;
                        }}
                        onDeleteProduct={async (id) => {
                            await supabase.from('products').delete().eq('id', id);
                            setProducts(prev => prev.filter(p => p.id !== id));
                        }}
                        onMoveProductToFolder={async () => {}}
                        onUpdateProfile={() => {}} onUpdateProfileImage={() => {}}
                        onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)}
                        onLikePost={() => {}} onAddComment={() => {}} onItemClick={() => {}} onViewProfile={() => {}}
                        onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => {}}
                        onOpenPromotionModal={() => {}} followersCount={0} followingCount={0}
                    />
                );
            case Screen.Feed:
                return profile && (
                    <FeedScreen 
                        posts={posts} stories={[]} profile={profile} businessProfile={null} isProfilePromoted={false} promotedItems={[]}
                        onBack={() => {}} onItemClick={(item) => { setVtoItems([item]); setGeneratedImage(null); setStyleTip(undefined); setCurrentScreen(Screen.ImageSourceSelection); }}
                        onAddToCartMultiple={(items) => { setCartItems(prev => [...prev, ...items]); toast.success("Adicionado!"); }}
                        onBuyMultiple={() => setCurrentScreen(Screen.Cart)}
                        onViewProfile={() => {}} onSelectCategory={() => {}} onLikePost={() => {}} onAddComment={() => {}}
                        onNavigateToAllHighlights={() => {}} onStartCreate={() => {}} unreadNotificationCount={0} onNotificationsClick={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)}
                    />
                );
            case Screen.Home:
                return profile && (
                    <HomeScreen 
                        loggedInProfile={profile} viewedProfileId={null}
                        onUpdateProfile={() => {}} onUpdateProfileImage={() => {}} onSelectCategory={() => {}} 
                        onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} 
                        onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}}
                        onNavigateToRewards={() => {}} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)}
                        isCartAnimating={false} onBack={() => {}} posts={posts} onItemClick={() => {}} onViewProfile={() => {}}
                        onNavigateToSettings={() => setIsSettingsOpen(true)} onSignOut={handleSignOut} 
                        unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => {}} 
                        isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0}
                        onLikePost={() => {}} onAddComment={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)}
                    />
                );
            case Screen.Cart:
                return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={(i) => setCartItems(p => p.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={() => {}} onCheckout={() => { toast.success("Pedido enviado!"); setCartItems([]); }} />;
            case Screen.ImageSourceSelection:
                return <ImageSourceSelectionScreen onImageUpload={(url) => { setUserImage(url); setCurrentScreen(Screen.Generating); }} onUseCamera={() => setCurrentScreen(Screen.Camera)} onBack={() => setCurrentScreen(Screen.Feed)} />;
            case Screen.Generating:
                return <LoadingIndicator userImage={userImage || ''} customMessage={videoProgressMsg} />;
            case Screen.Result:
                return generatedImage && (
                    <ResultScreen 
                        generatedImage={generatedImage} items={vtoItems} 
                        styleTip={styleTip} isGeneratingVideo={isGeneratingVideo}
                        onBuy={() => { setCartItems(prev => [...prev, ...vtoItems]); setCurrentScreen(Screen.Cart); }} 
                        onUndo={() => { setGeneratedImage(null); setGeneratedVideoUrl(null); setStyleTip(undefined); setCurrentScreen(Screen.Feed); }} 
                        onStartPublishing={() => setShowCaptionModal(true)} onSaveImage={() => {}} 
                        onAddMoreItems={() => setCurrentScreen(Screen.Feed)} 
                        onGenerateVideo={handleGenerateVideo}
                    />
                );
            case Screen.Search:
                return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={[]} availableProfiles={[]} onViewProfile={() => {}} onLikePost={() => {}} onItemClick={() => {}} onItemAction={() => {}} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={() => {}} onBuy={() => {}} />;
            default:
                return <SplashScreen />;
        }
    };

    return (
        <div className={`h-[100dvh] w-full bg-white overflow-hidden flex flex-col relative ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="flex-grow relative overflow-hidden">{renderScreen()}</div>
            {profile && [Screen.Feed, Screen.Home, Screen.Cart, Screen.Search, Screen.VendorDashboard].includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} 
                    onNavigateToPromotion={() => {}} onNavigateToProfile={() => setCurrentScreen(profile.account_type === 'business' ? Screen.VendorDashboard : Screen.Home)} 
                    onStartTryOn={() => { setVtoItems([]); setGeneratedImage(null); setGeneratedVideoUrl(null); setStyleTip(undefined); setCurrentScreen(Screen.ImageSourceSelection); }} 
                    isCartAnimating={false} accountType={profile.account_type} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)} 
                />
            )}
            {isSettingsOpen && profile && <SettingsPanel profile={profile} theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} onClose={() => setIsSettingsOpen(false)} onSignOut={handleSignOut} onNavigateToVerification={() => {}} />}
            {showCaptionModal && <CaptionModal image={generatedImage || ''} onClose={() => setShowCaptionModal(false)} onPublish={() => { toast.success("Publicado!"); setShowCaptionModal(false); setCurrentScreen(Screen.Feed); }} />}
            {generatedVideoUrl && <VideoPlayerModal videoUrl={generatedVideoUrl} onClose={() => setGeneratedVideoUrl(null)} onPublish={() => { toast.success("Vídeo Publicado!"); setGeneratedVideoUrl(null); }} onSave={() => { toast.success("Vídeo Salvo!"); }} isPublishing={false} />}
            {showKeyModal && <VeoApiKeyModal onClose={() => setShowKeyModal(false)} onSelectKey={handleSelectKey} />}
            {isLoading && <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
        </div>
    );
};

export default App;