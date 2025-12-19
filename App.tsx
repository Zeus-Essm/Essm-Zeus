
import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile, MarketplaceType, AppNotification, Conversation, Comment, BusinessProfile, CollaborationPost } from './types';
import { generateTryOnImage, normalizeImageAspectRatio, generateBeautyTryOnImage, generateFashionVideo, generateDecorationImage } from './services/geminiService';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, ITEMS, INITIAL_CONVERSATIONS, INITIAL_COLLABORATION_REQUESTS } from './constants';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import BusinessOnboardingScreen from './components/BusinessOnboardingScreen';
import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/SettingsScreen';
import SubCategorySelectionScreen from './components/SubCategorySelectionScreen';
import ItemSelectionScreen from './components/ItemSelectionScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import FeedScreen from './components/FeedScreen';
import MyLooksScreen from './components/MyLooksScreen';
import CameraScreen from './components/CameraScreen';
import ImageSourceSelectionScreen from './components/ImageSourceSelectionScreen';
import CartScreen from './components/CartScreen';
import RewardsScreen from './components/RewardsScreen';
import BottomNavBar from './components/BottomNavBar';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import VendorDashboard from './components/VendorDashboard';
import VendorMenuModal from './components/VendorMenuModal';
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import VendorProductsScreen from './components/VendorProductsScreen';
import VendorAffiliatesScreen from './components/VendorAffiliatesScreen';
import VendorCollaborationsScreen from './components/VendorCollaborationsScreen';
import AllHighlightsScreen from './components/AllHighlightsScreen';
import SearchScreen from './components/SearchScreen';
import RecommendationModal from './components/RecommendationModal';

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
};

const App: React.FC = () => {
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [products, setProducts] = React.useState<Item[]>([]);
    const [authLoading, setAuthLoading] = React.useState(true);
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Splash);
    const [viewedProfileId, setViewedProfileId] = React.useState<string | null>(null);
    const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
    const [cartItems, setCartItems] = React.useState<Item[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [businessProfile, setBusinessProfile] = React.useState<BusinessProfile | null>(null);
    const [showVendorMenu, setShowVendorMenu] = React.useState(false);
    const [recommendationItem, setRecommendationItem] = React.useState<Item | null>(null);

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
                const { data: freshProducts } = await supabase.from('items').select('*').eq('user_id', user.id);
                setProfile(freshProfile);
                setProducts(freshProducts || []);
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
            } else handleLogoutReset();
            setAuthLoading(false);
        };
        const handleLogoutReset = () => {
            setProfile(null); setProducts([]); setBusinessProfile(null); setCartItems([]); setSession(null); setCurrentScreen(Screen.Login);
        };
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') handleLogoutReset(); else handleAuthState(session);
        });
        supabase.auth.getSession().then(({ data: { session } }) => handleAuthState(session));
        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true);
        try { await supabase.auth.signOut(); setShowVendorMenu(false); } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string, full_name?: string }) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            await supabase.from('profiles').update(updates).eq('user_id', session.user.id);
            const { data: freshProfile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
            setProfile(freshProfile);
        } catch (err) { alert(err); } finally { setIsLoading(false); }
    };

    const handleUpdateProfileImage = async (dataUrl: string) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            const blob = await dataUrlToBlob(dataUrl);
            const path = `avatars/${session.user.id}/${crypto.randomUUID()}.png`;
            await supabase.storage.from('media').upload(path, blob);
            const { data: storageData } = supabase.storage.from('media').getPublicUrl(path);
            await supabase.from('profiles').update({ avatar_url: storageData.publicUrl }).eq('user_id', session.user.id);
            const { data: freshProfile } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).single();
            setProfile(freshProfile);
        } catch (err) { alert(err); } finally { setIsLoading(false); }
    };

    const handleCreateProduct = async (productData: Partial<Item>) => {
        if (!session?.user) return;
        setIsLoading(true);
        try {
            await supabase.from('items').insert([{ ...productData, user_id: session.user.id }]);
            const { data: freshProducts } = await supabase.from('items').select('*').eq('user_id', session.user.id);
            setProducts(freshProducts || []);
        } catch (err) { alert(err); } finally { setIsLoading(false); }
    };

    const renderScreenContent = () => {
        if (authLoading) return <SplashScreen />;
        switch (currentScreen) {
            case Screen.Login: return <LoginScreen />;
            case Screen.AccountTypeSelection: 
                return <AccountTypeSelectionScreen onSelect={async (type) => {
                    const uid = session?.user.id;
                    if (uid) {
                        await supabase.from('profiles').update({ account_type: type }).eq('user_id', uid);
                        const { data } = await supabase.from('profiles').select('*').eq('user_id', uid).single();
                        setProfile(data);
                        if (type === 'business') setCurrentScreen(Screen.BusinessOnboarding);
                        else setCurrentScreen(Screen.Feed);
                    }
                }} />;
            case Screen.BusinessOnboarding:
                return <BusinessOnboardingScreen onComplete={async (details) => {
                    if (session?.user) {
                        await handleUpdateProfile({ full_name: details.business_name, bio: details.description });
                        setBusinessProfile({ id: session.user.id, ...details });
                        setCurrentScreen(Screen.VendorDashboard);
                    }
                }} />;
            case Screen.VendorDashboard:
                return businessProfile && profile && <VendorDashboard businessProfile={businessProfile} profile={profile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={0} onOpenNotificationsPanel={() => {}} onOpenPromotionModal={() => {}} followersCount={0} followingCount={0} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} onNavigateToProducts={() => setCurrentScreen(Screen.VendorProducts)} />;
            case Screen.VendorProducts:
                return businessProfile && <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} products={products} onCreateProduct={handleCreateProduct} />;
            case Screen.VendorAnalytics:
                return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorAffiliates:
                return <VendorAffiliatesScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
            case Screen.VendorCollaborations:
                return <VendorCollaborationsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} collaborationRequests={INITIAL_COLLABORATION_REQUESTS} posts={posts} />;
            case Screen.Feed:
                return profile && <FeedScreen posts={posts} stories={INITIAL_STORIES} profile={profile} businessProfile={businessProfile} isProfilePromoted={false} promotedItems={[]} onBack={() => {}} onItemClick={setRecommendationItem} onAddToCartMultiple={it => it.forEach(i => setCartItems(p => [...p, i]))} onBuyMultiple={it => { it.forEach(i => setCartItems(p => [...p, i])); setCurrentScreen(Screen.Cart); }} onViewProfile={setViewedProfileId} onSelectCategory={c => { setCurrentScreen(Screen.SubCategorySelection); }} onLikePost={id => setPosts(ps => ps.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p))} onAddComment={() => {}} onNavigateToAllHighlights={() => setCurrentScreen(Screen.AllHighlights)} onStartCreate={() => setCurrentScreen(Screen.ImageSourceSelection)} unreadNotificationCount={0} onNotificationsClick={() => {}} onSearchClick={() => setCurrentScreen(Screen.Search)} />;
            case Screen.Home:
                return profile && <HomeScreen loggedInProfile={profile} viewedProfileId={viewedProfileId} onUpdateProfile={handleUpdateProfile} onUpdateProfileImage={handleUpdateProfileImage} onSelectCategory={() => {}} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={() => {}} onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToChat={() => {}} onNavigateToRewards={() => setCurrentScreen(Screen.Rewards)} onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false} onBack={() => setViewedProfileId(null)} posts={posts} onItemClick={setRecommendationItem} onViewProfile={(id) => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }} onNavigateToSettings={() => setCurrentScreen(Screen.Settings)} onSignOut={handleSignOut} unreadNotificationCount={0} unreadMessagesCount={0} onOpenNotificationsPanel={() => {}} isFollowing={false} onToggleFollow={() => {}} followersCount={0} followingCount={0} />;
            case Screen.Search:
                return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={ITEMS} onViewProfile={id => { setViewedProfileId(id); setCurrentScreen(Screen.Home); }} onLikePost={() => {}} onItemClick={setRecommendationItem} onItemAction={() => {}} onOpenSplitCamera={() => {}} onOpenComments={() => {}} onAddToCart={i => setCartItems(p => [...p, i])} onBuy={i => { setCartItems(p => [...p, i]); setCurrentScreen(Screen.Cart); }} />;
            case Screen.Cart:
                return <CartScreen cartItems={cartItems} onBack={() => setCurrentScreen(Screen.Feed)} onRemoveItem={i => setCartItems(ps => ps.filter((_, idx) => idx !== i))} onBuyItem={() => {}} onTryOnItem={() => {}} onCheckout={() => setCurrentScreen(Screen.Cart)} />;
            default:
                return <SplashScreen />;
        }
    };

    const SCREENS_WITH_NAVBAR = [Screen.Home, Screen.Feed, Screen.Search, Screen.Cart, Screen.ChatList, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.AllHighlights];

    return (
        <div className="h-[100dvh] w-full bg-[var(--bg-main)] overflow-hidden flex flex-col relative">
            <div className="flex-grow relative overflow-hidden">{renderScreenContent()}</div>
            {SCREENS_WITH_NAVBAR.includes(currentScreen) && (
                <BottomNavBar 
                    activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                    onNavigateToCart={() => setCurrentScreen(Screen.Cart)} onNavigateToPromotion={() => {}}
                    onNavigateToProfile={() => { if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard); else setCurrentScreen(Screen.Home); }}
                    onStartTryOn={() => setCurrentScreen(Screen.ImageSourceSelection)} isCartAnimating={false}
                    accountType={profile?.account_type} onNavigateToVendorAnalytics={() => setCurrentScreen(Screen.VendorAnalytics)}
                />
            )}
            {isLoading && (<div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>)}
            {recommendationItem && <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={i => setCartItems(p => [...p, i])} onStartTryOn={() => {}} />}
            {showVendorMenu && (
                <VendorMenuModal 
                    onClose={() => setShowVendorMenu(false)}
                    onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }}
                    onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }}
                    onNavigateToAffiliates={() => { setCurrentScreen(Screen.VendorAffiliates); setShowVendorMenu(false); }}
                    onNavigateToCollaborations={() => { setCurrentScreen(Screen.VendorCollaborations); setShowVendorMenu(false); }}
                    onSignOut={handleSignOut}
                />
            )}
        </div>
    );
};

export default App;
