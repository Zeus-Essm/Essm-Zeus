
import React from 'react';
// FIX: Changed to a non-type import for Session, which might be required by older Supabase versions.
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile, MarketplaceType, AppNotification, Conversation, Comment, BusinessProfile, CollaborationPost } from './types';
import { generateTryOnImage, normalizeImageAspectRatio, generateBeautyTryOnImage, generateFashionVideo, generateDecorationImage } from './services/geminiService';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, ITEMS, INITIAL_CONVERSATIONS, INITIAL_COLLABORATION_REQUESTS } from './constants';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
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
import GradientButton from './components/GradientButton';
import NotificationsPanel from './components/NotificationsPanel';
import BottomNavBar from './components/BottomNavBar';
import ChatListScreen from './components/ChatListScreen';
import ChatScreen from './components/ChatScreen';
import { XCircleIcon } from './components/IconComponents';
import VideoPlayerModal from './components/VideoPlayerModal';
import AccountTypeSelectionScreen from './components/AccountTypeSelectionScreen';
import BusinessOnboardingScreen from './components/BusinessOnboardingScreen';
import VendorDashboard from './components/VendorDashboard';
import VendorMenuModal from './components/VendorMenuModal';
import VendorAnalyticsScreen from './components/VendorAnalyticsScreen';
import VendorProductsScreen from './components/VendorProductsScreen';
import VendorAffiliatesScreen from './components/VendorAffiliatesScreen';
import VendorCollaborationsScreen from './components/VendorCollaborationsScreen';
import AllHighlightsScreen from './components/AllHighlightsScreen';
import SearchScreen from './components/SearchScreen';
import CommentsModal from './components/CommentsModal';
import PromotionModal from './components/PromotionModal';
import VerificationIntroScreen from './components/VerificationIntroScreen';
import IdUploadScreen from './components/IdUploadScreen';
import FaceScanScreen from './components/FaceScanScreen';
import VerificationPendingScreen from './components/VerificationPendingScreen';
import VeoApiKeyModal from './components/VeoApiKeyModal';
import CaptionModal from './components/CaptionModal';
import CoinBurst from './components/CoinBurst';
import RecommendationModal from './components/RecommendationModal';
import SplitCameraScreen from './components/SplitCameraScreen';
import VideoEditScreen from './components/VideoEditScreen';
import DecorationPlacementScreen from './components/DecorationPlacementScreen';

// Helper para converter data URL para Blob para upload
const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return await res.blob();
};

// Helper to get or create a user profile
const getOrCreateProfile = async (session: Session, setError: (msg: string) => void): Promise<Profile | null> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (data) {
            return data;
        }

        const user = session.user;
        const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`;
        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                user_id: user.id,
                username: username,
                profile_image_url: avatar,
                account_type: null,
                verification_status: 'unverified',
                reward_points: 0,
                bio: '',
                cover_image_url: null
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }
        return newProfile;
    } catch (err: any) {
        console.error("Error getting or creating profile:", err.message);
        setError("Não foi possível carregar o perfil do usuário.");
        return null;
    }
};

const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
    const rootCategoryId = item.category.split('_')[0];
    const category = CATEGORIES.find(c => c.id === rootCategoryId);
    return category?.type || 'fashion';
};

const SCREENS_WITH_NAVBAR = [Screen.Home, Screen.Feed, Screen.Search, Screen.Cart, Screen.ChatList, Screen.VendorDashboard, Screen.VendorAnalytics, Screen.AllHighlights];

const App: React.FC = () => {
    // Auth & Profile state
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [businessProfile, setBusinessProfile] = React.useState<BusinessProfile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);

    // App Navigation and UI state
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Home);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
    const [viewedProfileId, setViewedProfileId] = React.useState<string | null>(null);
    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = React.useState<string | null>(null);
    const [showVideoPlayer, setShowVideoPlayer] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [imageHistory, setImageHistory] = React.useState<string[]>([]);
    const [navigationStack, setNavigationStack] = React.useState<(Category | SubCategory)[]>([]);
    const [collectionIdentifier, setCollectionIdentifier] = React.useState<{id: string, name: string, type: MarketplaceType} | null>(null);
    const [wornItems, setWornItems] = React.useState<Item[]>([]);
    const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
    const [stories, setStories] = React.useState<Story[]>(INITIAL_STORIES);
    const [savedLooks, setSavedLooks] = React.useState<SavedLook[]>([]);
    const [cartItems, setCartItems] = React.useState<Item[]>([]);
    const [toast, setToast] = React.useState<string | null>(null);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [loadingMessage, setLoadingMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isCartAnimating, setIsCartAnimating] = React.useState(false);
    const [isPreviewingAsVisitor, setIsPreviewingAsVisitor] = React.useState(false);
    const [isVeoKeyFlowNeeded, setIsVeoKeyFlowNeeded] = React.useState(false);
    const [showCoinAnimation, setShowCoinAnimation] = React.useState(false);
    
    // Notifications & Messages State
    const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
    const [showNotificationsPanel, setShowNotificationsPanel] = React.useState(false);
    const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
    const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null);
    const [commentingPost, setCommentingPost] = React.useState<Post | null>(null);
    const [isCaptioning, setIsCaptioning] = React.useState(false);
    
    // Vendor State & Promotion State
    const [showVendorMenu, setShowVendorMenu] = React.useState(false);
    const [promotedContent, setPromotedContent] = React.useState<{ items: {id: string, image: string}[] } | null>(null);
    const [collaborationRequests, setCollaborationRequests] = React.useState<CollaborationPost[]>(INITIAL_COLLABORATION_REQUESTS);
    const [promotionModalConfig, setPromotionModalConfig] = React.useState<{ isOpen: boolean; accountType: 'personal' | 'business' | null }>({ isOpen: false, accountType: null });
    
    // Verification State
    const [idFrontImage, setIdFrontImage] = React.useState<string | null>(null);
    const [idBackImage, setIdBackImage] = React.useState<string | null>(null);

    // Recommendation State
    const [recommendationItem, setRecommendationItem] = React.useState<Item | null>(null);

    // Split Camera State
    const [splitCameraItem, setSplitCameraItem] = React.useState<Item | null>(null);
    const [editingVideoDetails, setEditingVideoDetails] = React.useState<{ blob: Blob; item: Item } | null>(null);
    
    // Repost & Decoration State
    const [repostingItem, setRepostingItem] = React.useState<Item | null>(null);
    const [placingItem, setPlacingItem] = React.useState<Item | null>(null);

    // Generic Action for Modal Resume
    const [pendingAction, setPendingAction] = React.useState<(() => void) | null>(null);

    const profileImageInputRef = React.useRef(null) as React.MutableRefObject<HTMLInputElement | null>;

    const unreadNotificationCount = notifications.filter(n => !n.read).length;
    const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Auth effect
    React.useEffect(() => {
        const fetchAndSetUserData = async (session: Session) => {
            if (!session.user.id.startsWith('mock_')) {
                setPosts(INITIAL_POSTS);
                setSavedLooks([]);
            }

            const profileData = await getOrCreateProfile(session, setError);
            setProfile(profileData);

            if (profileData) {
                if (!profileData.account_type) {
                    setCurrentScreen(Screen.AccountTypeSelection);
                } else if (profileData.account_type === 'business') {
                    setBusinessProfile({
                        id: profileData.id,
                        business_name: profileData.username,
                        logo_url: profileData.profile_image_url || '',
                        business_category: 'Fashion',
                        description: profileData.bio || 'Sua loja de moda no PUMP'
                    });
                    setCurrentScreen(Screen.VendorDashboard);
                } else {
                    setCurrentScreen(Screen.Feed);
                }
            }
            setAuthLoading(false);
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setAuthLoading(true);
                setSession(session);
                await fetchAndSetUserData(session);
                if (window.location.hash) {
                    try {
                        window.history.replaceState(null, '', '/'); 
                    } catch (e) {
                        console.warn('Could not clean URL hash', e);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setProfile(null);
                setBusinessProfile(null);
                setViewedProfileId(null);
                setPosts(INITIAL_POSTS);
                setSavedLooks([]);
                setCurrentScreen(Screen.Login);
                setAuthLoading(false);
            } else if (event === 'INITIAL_SESSION') {
                setSession(session);
                if (session) {
                    await fetchAndSetUserData(session);
                } else {
                    setAuthLoading(false);
                }
            }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
             if (session && !profile) {
                 setSession(session);
                 fetchAndSetUserData(session);
             } else if (!session) {
                 setAuthLoading(false);
             }
        });

        return () => subscription?.unsubscribe();
    }, []);
    
    React.useEffect(() => {
        if (!session) return;
        const timer = setTimeout(() => {
            setConversations(prevConvos => {
                const newConvos = JSON.parse(JSON.stringify(prevConvos));
                const convoToUpdate = newConvos.find((c: Conversation) => c.id === 'conv1');
                if (convoToUpdate) {
                    convoToUpdate.unreadCount += 1;
                    convoToUpdate.lastMessage.text = "Hey, você viu a nova coleção?";
                    convoToUpdate.lastMessage.timestamp = new Date().toISOString();
                }
                return newConvos;
            });
            setToast("Nova mensagem de Ana Clara!");
            setTimeout(() => setToast(null), 3000);
        }, 10000);
        return () => clearTimeout(timer);
    }, [session]);
    
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    React.useEffect(() => {
        if (commentingPost) {
            const updatedPost = posts.find(p => p.id === commentingPost.id);
            if (updatedPost) {
                setCommentingPost(updatedPost);
            } else {
                setCommentingPost(null);
            }
        }
    }, [posts, commentingPost]);

    const handleContinueAsVisitor = () => {
        const mockProfile: Profile = {
            id: 'mock_user_123',
            username: 'Visitante',
            bio: '',
            profile_image_url: '',
            cover_image_url: '',
            account_type: null,
            verification_status: 'unverified',
            reward_points: 0,
        };
        const mockSession = { user: { id: 'mock_user_123' } } as Session;

        setSession(mockSession);
        setProfile(mockProfile);
        setPosts(INITIAL_POSTS);
        setSavedLooks([]);
        setAuthLoading(false);
        setCurrentScreen(Screen.AccountTypeSelection);
    };

    const handleSetAccountType = async (type: 'personal' | 'business') => {
        if (!profile || !session) return;

        if (session.user.id.startsWith('mock_')) {
            if (type === 'personal') {
                const personalProfile: Profile = {
                    id: 'mock_user_123',
                    username: 'Visitante',
                    bio: '',
                    profile_image_url: '',
                    cover_image_url: '',
                    account_type: 'personal',
                    verification_status: 'unverified',
                    reward_points: 0,
                };
                setProfile(personalProfile);
                setPosts(INITIAL_POSTS);
                setSavedLooks([]);
                setCurrentScreen(Screen.Feed);
            } else {
                const businessBaseProfile: Profile = {
                    ...profile,
                    username: "Minha Loja",
                    account_type: 'business',
                };
                setProfile(businessBaseProfile);
                setCurrentScreen(Screen.BusinessOnboarding);
            }
            return;
        }

        const updatedProfile = { ...profile, account_type: type };
        setProfile(updatedProfile);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ account_type: type })
                .eq('id', session.user.id);
            if (error) throw error;
        } catch (err: any) {
            setError('Falha ao salvar o tipo de conta.');
            setProfile(profile);
            return;
        }
        
        if (type === 'personal') {
            setCurrentScreen(Screen.Feed);
        } else {
            setCurrentScreen(Screen.BusinessOnboarding);
        }
    };
    
    const handleCompleteBusinessOnboarding = (details: Omit<BusinessProfile, 'id'>) => {
        if (!profile) return;
        const newBusinessProfile: BusinessProfile = {
            id: profile.id,
            ...details,
        };
        setBusinessProfile(newBusinessProfile);
        setCurrentScreen(Screen.VendorDashboard);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        }
        if (session?.user.id.startsWith('mock_')) {
            setSession(null);
            setProfile(null);
            setPosts(INITIAL_POSTS);
        }
        setViewedProfileId(null);
        setIsPreviewingAsVisitor(false);
        setCurrentScreen(Screen.Login);
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string }) => {
        if (!session || session.user.id.startsWith('mock_')) {
            setToast('Função desativada para visitantes.');
            if (profile) {
                setProfile({ ...profile, ...updates });
            }
            return;
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', session.user.id)
                .select()
                .single();
            if (error) throw error;
            if (data) setProfile(data);
            setToast('Perfil atualizado com sucesso!');
        } catch (err: any) {
            setError(err.message);
        }
    };
    
    const uploadImage = async (bucket: string, imageDataUrl: string): Promise<string | null> => {
        if (!session || session.user.id.startsWith('mock_')) {
            setToast('Função de upload desativada para visitantes.');
            return null;
        }
        try {
            const blob = await dataUrlToBlob(imageDataUrl);
            const fileExt = blob.type.split('/')[1] || 'png';
            const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, blob);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
            return data.publicUrl;
        } catch (err: any) {
            setError('Falha no upload da imagem: ' + err.message);
            return null;
        }
    };

    const handleUpdateProfileImage = async (imageDataUrl: string) => {
        if (session?.user.id.startsWith('mock_') && profile) {
            setProfile({ ...profile, profile_image_url: imageDataUrl });
            return;
        }
        const publicUrl = await uploadImage('profiles', imageDataUrl);
        if (publicUrl && session) {
            const { data, error } = await supabase
                .from('profiles')
                .update({ profile_image_url: publicUrl })
                .eq('id', session.user.id)
                .select()
                .single();
            if (error) setError(error.message);
            else if (data) setProfile(data);
        }
    };
    
    const handleUpdateCoverImage = async (imageDataUrl: string) => {
        if (session?.user.id.startsWith('mock_') && profile) {
            setProfile({ ...profile, cover_image_url: imageDataUrl });
            return;
        }
        const publicUrl = await uploadImage('profiles', imageDataUrl);
        if (publicUrl && session) {
            const { data, error } = await supabase
                .from('profiles')
                .update({ cover_image_url: publicUrl })
                .eq('id', session.user.id)
                .select()
                .single();
            if (error) setError(error.message);
            else if (data) setProfile(data);
        }
    };

    const handleOpenNotificationsPanel = () => {
        setShowNotificationsPanel(true);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleCloseNotificationsPanel = () => {
        setShowNotificationsPanel(false);
    };

    const handleNotificationClick = (notification: AppNotification) => {
        setShowNotificationsPanel(false);
        if (notification.relatedCategoryId) {
            const category = CATEGORIES.find(c => c.id === notification.relatedCategoryId);
            if (category) {
                handleSelectCategory(category);
            }
        }
    };

    const handleImageUpload = async (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setLoadingMessage("Analisando e ajustando sua foto com IA...");
        setIsLoading(true);
        setError(null);
        try {
            const currentCategoryType = navigationStack.length > 0 ? (navigationStack[0] as Category).type : 'fashion';
            const processedImage = currentCategoryType === 'fashion' 
                ? await normalizeImageAspectRatio(imageDataUrl) 
                : imageDataUrl;
            setUserImage(processedImage);
            setGeneratedImage(processedImage);
            setImageHistory([processedImage]);
            setWornItems([]);
            setCurrentScreen(Screen.SubCategorySelection);
        } catch (err: any) {
            console.error("Erro ao processar a imagem:", err);
            setError("Houve um problema ao preparar sua foto. Por favor, tente novamente.");
            setCurrentScreen(Screen.ImageSourceSelection); 
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    };

    const handleSelectCategory = (category: Category) => {
        setNavigationStack([category]);
        if (!userImage && (category.type === 'fashion' || category.type === 'beauty' || category.type === 'decoration')) {
            setCurrentScreen(Screen.ImageSourceSelection);
            return;
        }
        if (category.subCategories && category.subCategories.length > 0) {
            setCurrentScreen(Screen.SubCategorySelection);
        } else {
            setCollectionIdentifier({ id: category.id, name: category.name, type: category.type });
            setCurrentScreen(Screen.ItemSelection);
        }
    };
    
    const handleSelectSubCategory = (subCategory: SubCategory) => {
        if (subCategory.subCategories && subCategory.subCategories.length > 0) {
            setNavigationStack(prev => [...prev, subCategory]);
        } else {
            const rootCategoryId = subCategory.id.split('_')[0];
            const rootCategory = CATEGORIES.find(c => c.id === rootCategoryId);
            setCollectionIdentifier({ id: subCategory.id, name: subCategory.name, type: rootCategory?.type || 'fashion' });
            setCurrentScreen(Screen.ItemSelection);
        }
    };

    const handleBack = () => {
        const newStack = [...navigationStack];
        newStack.pop();
        if (newStack.length === 0) {
            handleNavigateToProfile();
        } else {
            setNavigationStack(newStack);
            setCurrentScreen(Screen.SubCategorySelection);
        }
    };
    
    const handleProfileBack = () => {
        setViewedProfileId(null);
        setCurrentScreen(Screen.Feed);
    };

    const handleItemSelect = async (item: Item) => {
        if (item.recommendationVideo && !recommendationItem) {
            setRecommendationItem(item);
            return;
        }
        const itemType = getCategoryTypeFromItem(item);
        if (itemType === 'decoration') {
            if (!userImage) {
                setError("Por favor, carregue uma foto do seu ambiente primeiro.");
                setCurrentScreen(Screen.ImageSourceSelection);
                return;
            }
            setPlacingItem(item);
            setCurrentScreen(Screen.DecorationPlacement);
            return;
        }
        if (itemType === 'fashion' || item.isTryOn) {
            if (!userImage) {
                 if (profile && profile.profile_image_url) setUserImage(profile.profile_image_url);
                 else {
                    setError("Por favor, carregue uma foto primeiro.");
                    setCurrentScreen(Screen.ImageSourceSelection);
                    return;
                 }
            }
            const baseImage = generatedImage || userImage!;
            const existingItems = [...wornItems];
            setIsLoading(true);
            setError(null);
            try {
                const generatorFunction = item.isTryOn && itemType === 'beauty' 
                    ? generateBeautyTryOnImage
                    : generateTryOnImage;
                const newImage = await (generatorFunction === generateTryOnImage
                    ? generatorFunction(baseImage, item, existingItems)
                    : (generatorFunction as (userImg: string, newItem: Item) => Promise<string>)(baseImage, item));
                setGeneratedImage(newImage);
                setImageHistory(prev => [...prev, newImage]);
                setWornItems(prevItems => [...prevItems, item]);
                setCurrentScreen(Screen.Result);
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
                setCurrentScreen(Screen.ItemSelection);
            } finally {
                setIsLoading(false);
            }
        } else {
            if (profile) {
                setRepostingItem(item);
                setIsCaptioning(true);
            } else {
                setError("Você precisa estar logado para postar.");
            }
        }
    };

    const handleConfirmPlacement = async (compositeImage: string) => {
        const aiStudio = (window as any).aistudio;
        if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
            const hasKey = await aiStudio.hasSelectedApiKey();
            if (!hasKey) {
                setPendingAction(() => () => handleConfirmPlacement(compositeImage));
                setIsVeoKeyFlowNeeded(true);
                return;
            }
        }
        setIsLoading(true);
        setLoadingMessage("Decorando o ambiente com IA...");
        setError(null);
        try {
            const newImage = await generateDecorationImage(compositeImage);
            setGeneratedImage(newImage);
            setImageHistory(prev => [...prev, newImage]);
            if (placingItem) {
                setWornItems(prevItems => [...prevItems, placingItem]);
            }
            setPlacingItem(null);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro desconhecido ao gerar a imagem.');
            setCurrentScreen(Screen.DecorationPlacement);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartNewTryOnSession = async (item: Item) => {
        if (!userImage) {
            setCurrentScreen(Screen.ImageSourceSelection);
            return;
        }
        setCollectionIdentifier(null);
        setIsLoading(true);
        setError(null);
        try {
            const newImage = await generateTryOnImage(userImage, item, []);
            setGeneratedImage(newImage);
            setImageHistory([userImage, newImage]);
            setWornItems([item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setCurrentScreen(Screen.Cart);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateToAddMoreItems = () => {
        if (collectionIdentifier) {
            setCurrentScreen(Screen.ItemSelection);
        } else {
            handleBack(); 
        }
    };

    const handleUndoLastItem = () => {
        if (imageHistory.length > 1 && wornItems.length > 0) {
            const newHistory = [...imageHistory];
            newHistory.pop();
            const newWornItems = [...wornItems];
            newWornItems.pop();
            setImageHistory(newHistory);
            setGeneratedImage(newHistory[newHistory.length - 1]);
            setWornItems(newWornItems);
            if (newWornItems.length === 0) {
                 if (collectionIdentifier) setCurrentScreen(Screen.ItemSelection);
                 else handleBack();
            }
        } else {
             if (collectionIdentifier) setCurrentScreen(Screen.ItemSelection);
             else handleBack();
        }
    };

    const handleGenerateVideo = async () => {
        if (!generatedImage) {
            setError("Não há imagem de look para gerar o vídeo.");
            return;
        }
        const aiStudio = (window as any).aistudio;
        if (aiStudio && typeof aiStudio.hasSelectedApiKey === 'function') {
            const hasKey = await aiStudio.hasSelectedApiKey();
            if (!hasKey) {
                setPendingAction(() => handleGenerateVideo);
                setIsVeoKeyFlowNeeded(true);
                return;
            }
        }
        setIsLoading(true);
        setLoadingMessage("Iniciando a criação do vídeo...");
        setError(null);
        try {
            const videoUrl = await generateFashionVideo(generatedImage, (message) => {
                setLoadingMessage(message);
            });
            setGeneratedVideoUrl(videoUrl);
            setShowVideoPlayer(true);
        } catch (err: any) {
            const errorMessage = err.message || '';
            if (errorMessage.toLowerCase().includes("requested entity was not found")) {
                setError("Sua chave de API pode não ter acesso ao Veo.");
                setIsVeoKeyFlowNeeded(true);
            } else {
                setError(errorMessage || 'Falha ao gerar o vídeo.');
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    };

    const handleSaveVideo = () => {
        if (!generatedVideoUrl) return;
        const link = document.createElement('a');
        link.href = generatedVideoUrl;
        link.download = `pump-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast('Vídeo salvo nos seus downloads!');
        setTimeout(() => setToast(null), 3000);
    };

    const handlePublishVideo = async () => {
        if (!generatedVideoUrl || !profile || !generatedImage || !session) return;
        setShowCoinAnimation(true);
        setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
        setTimeout(() => setShowCoinAnimation(false), 2000);
        if (session.user.id.startsWith('mock_')) {
            const newPost: Post = {
                id: `post_video_${Date.now()}`,
                user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                image: generatedImage,
                video: generatedVideoUrl,
                items: wornItems,
                likes: 0,
                isLiked: false,
                comments: [],
                commentCount: 0,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setShowVideoPlayer(false);
            setGeneratedVideoUrl(null);
            setCurrentScreen(Screen.Feed);
            setToast('Vídeo publicado!');
            return;
        }
        setIsPublishing(true);
        try {
            const response = await fetch(generatedVideoUrl);
            const videoBlob = await response.blob();
            const filePath = `${session.user.id}/videos/${Date.now()}.mp4`;
            const { error: uploadError } = await supabase.storage.from('looks').upload(filePath, videoBlob);
            if (uploadError) throw uploadError;
            const { data: publicUrlData } = supabase.storage.from('looks').getPublicUrl(filePath);
            const publicVideoUrl = publicUrlData.publicUrl;
            const newPost: Post = {
                id: `post_video_${Date.now()}`,
                user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                image: generatedImage,
                video: publicVideoUrl,
                items: wornItems,
                likes: 0,
                isLiked: false,
                comments: [],
                commentCount: 0,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setShowVideoPlayer(false);
            setGeneratedVideoUrl(null);
            setCurrentScreen(Screen.Feed);
            setToast('Vídeo publicado!');
        } catch (err: any) {
            setError(`Falha ao publicar vídeo: ${err.message}`);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleUseCamera = () => setCurrentScreen(Screen.Camera);
    const handleStartTryOn = () => {
        setNavigationStack([]);
        setCurrentScreen(Screen.ImageSourceSelection);
    };
    const handleBuy = (item: Item) => {
        setConfirmationMessage(`Sua compra de ${item.name} foi finalizada!`);
        setCurrentScreen(Screen.Confirmation);
    };
    const handleBuyLook = (items: Item[]) => {
        const total = items.reduce((sum, item) => sum + item.price, 0);
        const formattedTotal = total.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' });
        setConfirmationMessage(`Sua compra de ${items.length} item(ns) no valor de ${formattedTotal} foi finalizada!`);
        setCurrentScreen(Screen.Confirmation);
    };
    const handleAddToCart = (item: Item) => {
        setCartItems(prevItems => [...prevItems, item]);
        setToast(`${item.name} adicionado ao carrinho!`);
        setTimeout(() => setToast(null), 3000);
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500);
    };

    const handleAddToCartMultiple = (items: Item[]) => {
        if (items.length === 0) return;
        setCartItems(prevItems => [...prevItems, ...items]);
        setToast(`${items.length} iten(s) adicionados!`);
        setTimeout(() => setToast(null), 3000);
        setIsCartAnimating(true);
        setTimeout(() => setIsCartAnimating(false), 500);
    };

    const handleRemoveFromCart = (indexToRemove: number) => {
        setCartItems(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
    };
    const handleBuySingleItemFromCart = (item: Item, index: number) => {
        setConfirmationMessage(`Sua compra de ${item.name} foi finalizada!`);
        setCurrentScreen(Screen.Confirmation);
        handleRemoveFromCart(index);
    };
    const handleNavigateToCart = () => setCurrentScreen(Screen.Cart);
    const handleStartPublishing = () => setIsCaptioning(true);

    const handlePostToFeed = (caption: string) => {
        if (profile) {
            setShowCoinAnimation(true);
            setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
            setTimeout(() => setShowCoinAnimation(false), 2000);
            let newPost: Post;
            if (repostingItem) {
                 newPost = {
                    id: `post_${Date.now()}`,
                    user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                    image: repostingItem.image,
                    items: [repostingItem],
                    likes: 0,
                    isLiked: false,
                    comments: [],
                    commentCount: 0,
                    caption: caption,
                };
                setRepostingItem(null);
            } else if (generatedImage) {
                 newPost = {
                    id: `post_${Date.now()}`,
                    user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                    image: generatedImage,
                    items: wornItems,
                    likes: 0,
                    isLiked: false,
                    comments: [],
                    commentCount: 0,
                    caption: caption,
                };
            } else return;
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setIsCaptioning(false);
            setConfirmationMessage("Publicado com sucesso!");
            setCurrentScreen(Screen.Confirmation);
        }
    };

    const handleSaveLook = async () => {
        if (!generatedImage || wornItems.length === 0 || !session || !profile) return;
        if (session.user.id.startsWith('mock_')) {
            const newLook: SavedLook = { id: `look_${Date.now()}`, image: generatedImage, items: wornItems };
            setSavedLooks(prevLooks => [newLook, ...prevLooks]);
            setConfirmationMessage('Look salvo localmente!');
            setCurrentScreen(Screen.Confirmation);
            return;
        }
        setIsLoading(true);
        try {
            const publicUrl = await uploadImage('looks', generatedImage);
            if (!publicUrl) throw new Error('Falha no upload.');
            const { data: newSavedLook, error } = await supabase.from('saved_looks').insert({ user_id: session.user.id, image_url: publicUrl, items: wornItems }).select().single();
            if (error) throw error;
            setSavedLooks(prev => [{ id: newSavedLook.id, image: newSavedLook.image_url, items: newSavedLook.items }, ...prev]);
            setConfirmationMessage('Look salvo!');
            setCurrentScreen(Screen.Confirmation);
        } catch (err: any) {
            setError(err.message);
            setCurrentScreen(Screen.Result);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostLookFromSaved = (look: SavedLook) => {
        if (!profile) return;
        const newPost: Post = {
            id: `post_${Date.now()}`,
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
            image: look.image,
            items: look.items,
            likes: 0,
            isLiked: false,
            comments: [],
            commentCount: 0,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setToast('Look postado!');
        setCurrentScreen(Screen.Feed);
        setShowCoinAnimation(true);
        setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
        setTimeout(() => setShowCoinAnimation(false), 2000);
    };

    const handleSaveImage = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'meu-look-pump.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast('Salvo na galeria!');
    };

    const handleItemClick = (item: Item) => {
        const parentCategoryId = item.category.split('_')[0];
        const parentCategory = CATEGORIES.find(c => c.id === parentCategoryId);
        if (parentCategory) {
            setWornItems([]);
            if (userImage) setGeneratedImage(userImage);
            handleSelectCategory(parentCategory);
        }
    };

    const handleLikePost = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));
    };

    const handleAddComment = (postId: string, text: string) => {
        if (!profile) return;
        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
            text,
            timestamp: new Date().toISOString()
        };
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 } : p));
    };
    
    const handleOpenComments = (postId: string) => {
        const post = posts.find(p => p.id === postId);
        if (post) setCommentingPost(post);
    };

    const resetToHome = () => {
        const fromPublication = confirmationMessage.toLowerCase().includes('publicado');
        const fromVerification = confirmationMessage.toLowerCase().includes('verificado');
        setGeneratedImage(userImage);
        setWornItems([]);
        setImageHistory(userImage ? [userImage] : []);
        setNavigationStack([]);
        setCollectionIdentifier(null);
        if (fromPublication) setCurrentScreen(Screen.Feed);
        else if (fromVerification) setCurrentScreen(Screen.Settings);
        else handleNavigateToProfile();
    };

    const handleOpenSplitCamera = (item: Item) => {
        setSplitCameraItem(item);
        setCurrentScreen(Screen.SplitCamera);
    };

    const handleRecordingComplete = (videoBlob: Blob) => {
        if (splitCameraItem) {
            setEditingVideoDetails({ blob: videoBlob, item: splitCameraItem });
            setCurrentScreen(Screen.VideoEdit);
        }
    };
    
    const handlePublishOverlayVideo = (details: { caption: string; position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
        if (profile && editingVideoDetails) {
            const { blob, item } = editingVideoDetails;
            const newPost: Post = {
                id: `post_overlay_${Date.now()}`,
                user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || '' },
                image: item.image,
                video: URL.createObjectURL(blob),
                items: [item],
                likes: 0,
                isLiked: false,
                comments: [],
                commentCount: 0,
                caption: details.caption,
                layout: 'product-overlay',
                overlayPosition: details.position,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setConfirmationMessage('Publicado com sucesso!');
            setCurrentScreen(Screen.Confirmation);
            setShowCoinAnimation(true);
            setProfile(prev => prev ? { ...prev, reward_points: (prev.reward_points || 0) + 50 } : null);
            setTimeout(() => setShowCoinAnimation(false), 2000);
        }
        setSplitCameraItem(null);
        setEditingVideoDetails(null);
    };

    const handleNavigateToMyLooks = () => setCurrentScreen(Screen.MyLooks);
    const handleNavigateToRewards = () => setCurrentScreen(Screen.Rewards);
    const handleNavigateToSettings = () => setCurrentScreen(Screen.Settings);
    const handleNavigateToSearch = () => setCurrentScreen(Screen.Search);
    const handleNavigateToChat = () => setCurrentScreen(Screen.ChatList);
    const handleNavigateToAllHighlights = () => setCurrentScreen(Screen.AllHighlights);

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setConversations(prev => prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c));
        setCurrentScreen(Screen.Chat);
    };

    const handleSendMessage = (text: string, conversationId: string) => {
        const newMessage = { id: `msg_${Date.now()}`, text, senderId: profile!.id, timestamp: new Date().toISOString() };
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, lastMessage: newMessage } : c));
    };

    const handleNavigateToProfile = () => {
        setViewedProfileId(null);
        setIsPreviewingAsVisitor(false);
        if (profile?.account_type === 'business') setCurrentScreen(Screen.VendorDashboard);
        else setCurrentScreen(Screen.Home);
    };
    
    const handleNavigateToVendorAnalytics = () => setCurrentScreen(Screen.VendorAnalytics);
    const handleNavigateToVendorCollaborations = () => setCurrentScreen(Screen.VendorCollaborations);

    const handleViewProfile = async (profileId: string) => {
        if (profileId === profile?.id) { handleNavigateToProfile(); return; }
        setViewedProfileId(profileId);
        setIsPreviewingAsVisitor(false);
        setCurrentScreen(Screen.Home);
    };

    const handleToggleVisitorPreview = () => setIsPreviewingAsVisitor(prev => !prev);
    const handleOpenPromotionModal = (type: 'personal' | 'business') => setPromotionModalConfig({ isOpen: true, accountType: type });
    const handleClosePromotionModal = () => setPromotionModalConfig({ isOpen: false, accountType: null });

    const handleConfirmPromotion = (details: { budget: number; duration: number; items: { id: string; image: string; }[]; }) => {
        if (promotionModalConfig.accountType === 'business') {
            setPromotedContent({ items: details.items });
            setToast(`Promoção ativada!`);
        } else if (promotionModalConfig.accountType === 'personal') {
            const postIds = new Set(details.items.map(item => item.id));
            setPosts(prev => prev.map(p => postIds.has(p.id) ? { ...p, isSponsored: true } : p));
            setToast(`Promovido!`);
        }
        handleClosePromotionModal();
    };

    const handleApproveCollaboration = (requestId: string) => {
        if (!businessProfile) return;
        const request = collaborationRequests.find(r => r.id === requestId);
        if (!request) return;
        setPosts(prev => prev.map(p => p.id === request.postId ? { ...p, user: { id: businessProfile.id, name: businessProfile.business_name, avatar: businessProfile.logo_url } } : p));
        setCollaborationRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved' } : r));
        setToast('Aprovado!');
    };
    
    const handleSponsorPost = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isSponsored: true } : p));
        setToast('Patrocinado!');
    };

    const handleNavigateToVerification = () => {
        if (profile?.verification_status === 'unverified') setCurrentScreen(Screen.VerificationIntro);
        else setToast(profile?.verification_status === 'verified' ? 'Já verificado.' : 'Em análise.');
    };
    
    const handleIdUploadComplete = (idFront: string, idBack: string) => {
        setIdFrontImage(idFront); setIdBackImage(idBack);
        setCurrentScreen(Screen.FaceScan);
    };

    const handleFaceScanComplete = () => {
        if (profile) setProfile({ ...profile, verification_status: 'pending' });
        setCurrentScreen(Screen.VerificationPending);
    };

    const handleVerificationComplete = () => {
        if (profile) setProfile({ ...profile, verification_status: 'verified' });
        setConfirmationMessage('Perfil verificado!');
        setCurrentScreen(Screen.Confirmation);
    };

    const renderScreen = () => {
        if (isLoading) return <LoadingIndicator userImage={userImage || ''} customMessage={loadingMessage} />;
        const currentNode = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;
        switch (currentScreen) {
             case Screen.DecorationPlacement:
                if (userImage && placingItem) return <DecorationPlacementScreen userImage={userImage} item={placingItem} onBack={() => { setPlacingItem(null); setCurrentScreen(Screen.ItemSelection); }} onConfirm={handleConfirmPlacement} />;
                setCurrentScreen(Screen.ItemSelection); return null;
             case Screen.SplitCamera:
                if (splitCameraItem) return <SplitCameraScreen item={splitCameraItem} onBack={() => setCurrentScreen(Screen.ItemSelection)} onRecordingComplete={handleRecordingComplete} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.VideoEdit:
                if (editingVideoDetails) return <VideoEditScreen videoBlob={editingVideoDetails.blob} item={editingVideoDetails.item} onBack={() => { setEditingVideoDetails(null); setCurrentScreen(Screen.SplitCamera); }} onPublish={handlePublishOverlayVideo} isPublishing={isPublishing} />;
                setCurrentScreen(Screen.ItemSelection); return null;
            case Screen.AccountTypeSelection: return <AccountTypeSelectionScreen onSelect={handleSetAccountType} />;
            case Screen.BusinessOnboarding: return <BusinessOnboardingScreen onComplete={handleCompleteBusinessOnboarding} />;
            case Screen.VendorDashboard:
                if (businessProfile) return <VendorDashboard businessProfile={businessProfile} onOpenMenu={() => setShowVendorMenu(true)} unreadNotificationCount={unreadNotificationCount} onOpenNotificationsPanel={handleOpenNotificationsPanel} onOpenPromotionModal={() => handleOpenPromotionModal('business')} />;
                setCurrentScreen(profile?.account_type === 'business' ? Screen.BusinessOnboarding : Screen.Login); return null;
            case Screen.VendorAnalytics: return <VendorAnalyticsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} isProfilePromoted={!!promotedContent} />;
            case Screen.VendorProducts: if (businessProfile) return <VendorProductsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} businessProfile={businessProfile} />;
                setCurrentScreen(Screen.VendorDashboard); return null;
            case Screen.VendorAffiliates: return <VendorAffiliatesScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} />;
             case Screen.VendorCollaborations: return <VendorCollaborationsScreen onBack={() => setCurrentScreen(Screen.VendorDashboard)} collaborationRequests={collaborationRequests} posts={posts} onApprove={handleApproveCollaboration} onReject={(id) => setCollaborationRequests(prev => prev.map(r => r.id === id ? {...r, status: 'rejected'} : r))} onSponsor={handleSponsorPost} />;
            case Screen.Home: return <HomeScreen loggedInProfile={profile!} viewedProfileId={viewedProfileId} onUpdateProfileImage={handleUpdateProfileImage} onUpdateProfile={handleUpdateProfile} onSelectCategory={handleSelectCategory} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToMyLooks={handleNavigateToMyLooks} onNavigateToCart={handleNavigateToCart} onNavigateToChat={handleNavigateToChat} onNavigateToSettings={handleNavigateToSettings} onNavigateToRewards={handleNavigateToRewards} onStartTryOn={handleStartTryOn} onSignOut={handleSignOut} isCartAnimating={isCartAnimating} onBack={handleProfileBack} isPreviewingAsVisitor={isPreviewingAsVisitor} onToggleVisitorPreview={handleToggleVisitorPreview} posts={posts} onItemClick={handleItemClick} onViewProfile={handleViewProfile} unreadNotificationCount={unreadNotificationCount} unreadMessagesCount={unreadMessagesCount} onOpenNotificationsPanel={handleOpenNotificationsPanel} />;
            case Screen.Settings: return <SettingsScreen profile={profile!} onBack={handleNavigateToProfile} theme={theme} onToggleTheme={toggleTheme} onNavigateToVerification={handleNavigateToVerification} />;
            case Screen.ImageSourceSelection: return <ImageSourceSelectionScreen onImageUpload={handleImageUpload} onUseCamera={handleUseCamera} onBack={handleNavigateToProfile} />;
            case Screen.SubCategorySelection: if (currentNode) return <SubCategorySelectionScreen node={currentNode} onSelectSubCategory={handleSelectSubCategory} onBack={handleBack} />;
                 handleNavigateToProfile(); return null;
            case Screen.ItemSelection: if (collectionIdentifier) { const displayImage = userImage || (profile?.profile_image_url || ''); return <ItemSelectionScreen userImage={displayImage} collectionId={collectionIdentifier.id} collectionName={collectionIdentifier.name} collectionType={collectionIdentifier.type} onItemSelect={handleItemSelect} onOpenSplitCamera={handleOpenSplitCamera} onBack={() => setCurrentScreen(Screen.SubCategorySelection)} onBuy={handleBuy} onAddToCart={handleAddToCart} />; }
                handleNavigateToProfile(); return null;
            case Screen.Camera: return <CameraScreen onPhotoTaken={handleImageUpload} onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} />;
            case Screen.Result: if (generatedImage && collectionIdentifier) { const categoryItems = ITEMS.filter(item => item.category.startsWith(collectionIdentifier.id.split('_')[0])); return <ResultScreen generatedImage={generatedImage} items={wornItems} categoryItems={categoryItems} onBuy={handleBuyLook} onUndo={handleUndoLastItem} onStartPublishing={handleStartPublishing} onSaveImage={handleSaveImage} onItemSelect={handleItemSelect} onAddMoreItems={handleNavigateToAddMoreItems} onGenerateVideo={handleGenerateVideo} />; }
                setCurrentScreen(Screen.Home); return null;
            case Screen.Confirmation: return <ConfirmationScreen message={confirmationMessage} onHome={resetToHome} />;
            case Screen.Feed: return <FeedScreen posts={posts} stories={stories} profile={profile!} businessProfile={businessProfile} isProfilePromoted={!!promotedContent} promotedItems={promotedContent?.items || []} onBack={handleNavigateToProfile} onItemClick={handleItemClick} onAddToCartMultiple={handleAddToCartMultiple} onBuyMultiple={handleBuyLook} onViewProfile={handleViewProfile} onSelectCategory={handleSelectCategory} onLikePost={handleLikePost} onAddComment={handleAddComment} onNavigateToAllHighlights={handleNavigateToAllHighlights} unreadNotificationCount={unreadNotificationCount} onNotificationsClick={handleOpenNotificationsPanel} onSearchClick={handleNavigateToSearch} />;
            case Screen.MyLooks: return <MyLooksScreen looks={savedLooks} onBack={handleNavigateToProfile} onItemClick={handleItemClick} onBuyLook={handleBuyLook} onPostLook={handlePostLookFromSaved} />;
            case Screen.Cart: return <CartScreen cartItems={cartItems} onBack={handleNavigateToProfile} onRemoveItem={handleRemoveFromCart} onBuyItem={handleBuySingleItemFromCart} onTryOnItem={handleStartNewTryOnSession} onCheckout={() => handleBuyLook(cartItems)} />;
            case Screen.Rewards: return <RewardsScreen onBack={handleNavigateToProfile} points={profile?.reward_points || 0} />;
            case Screen.ChatList: return <ChatListScreen conversations={conversations} onBack={handleNavigateToProfile} onSelectConversation={handleSelectConversation} />;
            case Screen.Chat: if (selectedConversation) return <ChatScreen conversation={selectedConversation} currentUser={profile!} onBack={() => setCurrentScreen(Screen.ChatList)} onSendMessage={handleSendMessage} />;
                setCurrentScreen(Screen.ChatList); return null;
            case Screen.Search: return <SearchScreen onBack={() => setCurrentScreen(Screen.Feed)} posts={posts} items={ITEMS} onViewProfile={handleViewProfile} onLikePost={handleLikePost} onItemClick={handleItemClick} onItemAction={handleItemSelect} onOpenSplitCamera={handleOpenSplitCamera} onOpenComments={handleOpenComments} onAddToCart={handleAddToCart} onBuy={handleBuy} />;
            case Screen.AllHighlights: return <AllHighlightsScreen categories={CATEGORIES} onBack={() => setCurrentScreen(Screen.Feed)} onSelectCategory={handleSelectCategory} />;
            case Screen.VerificationIntro: return <VerificationIntroScreen onBack={() => setCurrentScreen(Screen.Settings)} onStart={() => setCurrentScreen(Screen.IdUpload)} />;
            case Screen.IdUpload: return <IdUploadScreen onBack={() => setCurrentScreen(Screen.VerificationIntro)} onComplete={handleIdUploadComplete} />;
            case Screen.FaceScan: return <FaceScanScreen onBack={() => setCurrentScreen(Screen.IdUpload)} onComplete={handleFaceScanComplete} />;
            case Screen.VerificationPending: return <VerificationPendingScreen onComplete={handleVerificationComplete} />;
            default: setCurrentScreen(Screen.Feed); return null;
        }
    };

    if (authLoading) return <SplashScreen />;
    if (!session) return <LoginScreen onContinueAsVisitor={handleContinueAsVisitor} />;
    if (!profile) return ( <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-main)] text-red-400 p-6 text-center"> <p className="mb-4">Erro ao carregar perfil.</p> <button onClick={handleSignOut} className="px-4 py-2 bg-[var(--bg-tertiary)] rounded-lg text-white font-bold hover:bg-[var(--accent-primary)] transition-colors"> Sair </button> </div> );
    const showNavBar = SCREENS_WITH_NAVBAR.includes(currentScreen) || (profile.account_type === 'business' && [Screen.VendorDashboard, Screen.VendorAnalytics].includes(currentScreen));

    return (
        <div className="h-full w-full max-w-lg mx-auto bg-[var(--bg-main)] flex flex-col relative font-sans">
            <div className="flex-grow overflow-hidden relative">{renderScreen()}</div>
            {showNavBar && ( <div className="flex-shrink-0"> <BottomNavBar activeScreen={currentScreen} onNavigateToFeed={() => setCurrentScreen(Screen.Feed)} onNavigateToCart={handleNavigateToCart} onNavigateToPromotion={() => handleOpenPromotionModal(profile!.account_type!)} onNavigateToProfile={handleNavigateToProfile} onStartTryOn={handleStartTryOn} isCartAnimating={isCartAnimating} accountType={profile.account_type} onNavigateToVendorAnalytics={handleNavigateToVendorAnalytics} /> </div> )}
            {toast && ( <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm animate-fadeIn z-50"> {toast} </div> )}
            {error && ( <div className="absolute top-0 left-0 right-0 p-3 bg-red-500/90 text-white text-sm flex justify-between items-center z-50"> <span>{error}</span> <button onClick={() => setError(null)}><XCircleIcon className="w-5 h-5"/></button> </div> )}
            {showCoinAnimation && <CoinBurst />}
            {showNotificationsPanel && ( <NotificationsPanel notifications={notifications} onClose={handleCloseNotificationsPanel} onNotificationClick={handleNotificationClick} /> )}
            {showVideoPlayer && generatedVideoUrl && ( <VideoPlayerModal videoUrl={generatedVideoUrl} onClose={() => setShowVideoPlayer(false)} onPublish={handlePublishVideo} onSave={handleSaveVideo} isPublishing={isPublishing} /> )}
            {isVeoKeyFlowNeeded && (window as any).aistudio && ( <VeoApiKeyModal onClose={() => setIsVeoKeyFlowNeeded(false)} onSelectKey={async () => { await (window as any).aistudio.openSelectKey(); setIsVeoKeyFlowNeeded(false); if (pendingAction) { setTimeout(() => { pendingAction(); setPendingAction(null); }, 100); } else { setTimeout(() => { handleGenerateVideo(); }, 100); } }} /> )}
            {showVendorMenu && ( <VendorMenuModal onClose={() => setShowVendorMenu(false)} onNavigateToAnalytics={() => { setCurrentScreen(Screen.VendorAnalytics); setShowVendorMenu(false); }} onNavigateToProducts={() => { setCurrentScreen(Screen.VendorProducts); setShowVendorMenu(false); }} onNavigateToAffiliates={() => { setCurrentScreen(Screen.VendorAffiliates); setShowVendorMenu(false); }} onNavigateToCollaborations={() => { setCurrentScreen(Screen.VendorCollaborations); setShowVendorMenu(false); }} onSignOut={handleSignOut} /> )}
            {commentingPost && profile && ( <CommentsModal post={commentingPost} currentUser={profile} onClose={() => setCommentingPost(null)} onAddComment={handleAddComment} /> )}
            {promotionModalConfig.isOpen && ( <PromotionModal accountType={promotionModalConfig.accountType!} profile={promotionModalConfig.accountType === 'business' ? businessProfile! : profile} userPosts={posts.filter(p => p.user.id === profile?.id)} onClose={handleClosePromotionModal} onConfirm={handleConfirmPromotion} /> )}
            {isCaptioning && (generatedImage || repostingItem) && ( <CaptionModal image={repostingItem ? repostingItem.image : generatedImage!} onClose={() => { setIsCaptioning(false); setRepostingItem(null); }} onPublish={handlePostToFeed} /> )}
            {recommendationItem && ( <RecommendationModal item={recommendationItem} onClose={() => setRecommendationItem(null)} onAddToCart={(item) => { handleAddToCart(item); setRecommendationItem(null); }} onStartTryOn={(item) => { setRecommendationItem(null); setTimeout(() => { if (!userImage) setCurrentScreen(Screen.ImageSourceSelection); else handleItemSelect(item); }, 100); }} /> )}
        </div>
    );
};

export default App;
