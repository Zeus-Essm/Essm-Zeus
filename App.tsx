


import React from 'react';
// FIX: Changed to a non-type import for Session, which might be required by older Supabase versions.
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile, MarketplaceType } from './types';
import { generateTryOnImage, expandImageToSquare, generateBeautyTryOnImage } from './services/geminiService';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES, ITEMS } from './constants';

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
import { XCircleIcon } from './components/IconComponents';

declare global {
  interface Window {}
  interface Navigator {
      canShare(data?: ShareData): boolean;
  }
  interface ShareData {
    files?: File[];
    text?: string;
    title?: string;
    url?: string;
  }
}

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

        // Check for specific error code for 'no rows'
        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (data) {
            return data;
        }

        // No profile found, let's create one
        const user = session.user;
        const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || `user_${Date.now().toString().slice(-6)}`;
        const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: username,
                profile_image_url: avatar,
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

// Helper to assign demo posts to the current user for a better preview experience
const assignDemoPostsToUser = (profile: Profile): Post[] => {
    const userPostImages = [
        'https://i.postimg.cc/nzdDSLvZ/meu-estilo-look-9.png',
        'https://i.postimg.cc/PxhsxmFf/meu-estilo-look-12.png',
        'https://i.postimg.cc/mk2v3Ts0/meu-estilo-look-13.png',
        'https://i.postimg.cc/vTc6Jdzn/meu-estilo-look.png',
        'https://i.postimg.cc/tgNPPkJs/meu-estilo-look-11.png',
        'https://i.postimg.cc/T3mn2fXq/meu-estilo-look-5.png',
        'https://i.postimg.cc/bJYnRnS3/meu-estilo-look-6.png',
        'https://i.postimg.cc/nLJBCgF8/meu-estilo-look-7.png'
    ];
    // Create a fresh copy from INITIAL_POSTS to avoid mutations between sessions
    return INITIAL_POSTS.map(post => {
        if (userPostImages.includes(post.image)) {
            return {
                ...post,
                user: {
                    id: profile.id,
                    name: profile.username,
                    avatar: profile.profile_image_url || `https://i.pravatar.cc/150?u=${profile.id}`
                }
            };
        }
        return post;
    });
};

// Helper to assign demo looks to the current user for a better "My Looks" experience
const assignDemoLooksToUser = (): SavedLook[] => {
    const userPostImages = [
        'https://i.postimg.cc/nzdDSLvZ/meu-estilo-look-9.png',
        'https://i.postimg.cc/PxhsxmFf/meu-estilo-look-12.png',
        'https://i.postimg.cc/mk2v3Ts0/meu-estilo-look-13.png',
        'https://i.postimg.cc/vTc6Jdzn/meu-estilo-look.png',
        'https://i.postimg.cc/tgNPPkJs/meu-estilo-look-11.png',
        'https://i.postimg.cc/T3mn2fXq/meu-estilo-look-5.png',
        'https://i.postimg.cc/bJYnRnS3/meu-estilo-look-6.png',
        'https://i.postimg.cc/nLJBCgF8/meu-estilo-look-7.png'
    ];
    // Filter INITIAL_POSTS to get only the demo posts and map them to SavedLook format
    return INITIAL_POSTS
        .filter(post => userPostImages.includes(post.image))
        .map(post => ({
            id: `look_${post.id}`, // Create a unique ID for the look
            image: post.image,
            items: post.items,
        }));
};

const getCategoryTypeFromItem = (item: Item): MarketplaceType => {
    const rootCategoryId = item.category.split('_')[0];
    const category = CATEGORIES.find(c => c.id === rootCategoryId);
    return category?.type || 'fashion'; // Default to fashion if not found
};


const App: React.FC = () => {
    // Auth & Profile state
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);

    // App Navigation and UI state
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Home);
    const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');
    const [viewedProfileId, setViewedProfileId] = React.useState<string | null>(null);
    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
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
            const profileData = await getOrCreateProfile(session, setError);
            setProfile(profileData);
            if (profileData) {
                setPosts(assignDemoPostsToUser(profileData));
                
                // Check for mock user
                if (session.user.id.startsWith('mock_')) {
                    setSavedLooks(assignDemoLooksToUser());
                } else {
                    // Fetch real saved looks for authenticated user
                    try {
                        const { data, error } = await supabase
                            .from('saved_looks')
                            .select('*')
                            .eq('user_id', session.user.id)
                            .order('created_at', { ascending: false });

                        if (error) throw error;
                        
                        // Map db response to SavedLook type
                        const userLooks: SavedLook[] = data.map(look => ({
                            id: look.id,
                            image: look.image_url,
                            items: look.items,
                        }));
                        setSavedLooks(userLooks);
                    } catch (err: any) {
                        console.error("Error fetching saved looks:", err.message);
                        setError("Não foi possível carregar os looks salvos.");
                        setSavedLooks([]); // Reset on error
                    }
                }
            }
        };

        const setupAuth = async () => {
            const isOAuthRedirect = window.location.hash.includes('access_token');
            
            // On OAuth redirect, enforce a 3-second splash screen as requested.
            if (isOAuthRedirect) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                await fetchAndSetUserData(session);
            }
            setAuthLoading(false);

            // Clean the URL hash after processing to prevent this logic from re-running on refresh.
            if (isOAuthRedirect) {
                 window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        };

        setupAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Reset error on auth change to avoid showing old errors
            setError(null);
            setSession(session);
            if (session) {
                await fetchAndSetUserData(session);
            } else {
                setProfile(null);
                setViewedProfileId(null);
                setPosts(INITIAL_POSTS); // Reset posts on logout
                setSavedLooks([]); // Reset saved looks on logout
            }
        });

        return () => subscription?.unsubscribe();
    }, []);
    
    const handleContinueAsVisitor = () => {
        const mockProfile: Profile = {
            id: 'mock_user_123',
            username: 'BV (blue sky)',
            bio: 'Bem-vindo(a) ao MEU ESTILO! Explore o mercado e prove roupas virtualmente.',
            profile_image_url: 'https://i.postimg.cc/pL7M6Vgv/bv.jpg',
            cover_image_url: 'https://i.postimg.cc/wTQh27Rt/Captura-de-Tela-2025-09-19-a-s-2-10-14-PM.png',
        };
        const mockSession = { user: { id: 'mock_user_123' } } as Session;

        setSession(mockSession);
        setProfile(mockProfile);
        setPosts(assignDemoPostsToUser(mockProfile));
        // FIX: Called assignDemoLooksToUser which takes no arguments, instead of assignDemoPostsToUser.
        setSavedLooks(assignDemoLooksToUser());
        setAuthLoading(false);
    };


    // Profile Management
    const handleSignOut = async () => {
        // FIX: Added error handling for `signOut` for more robust code.
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error signing out:", error.message);
        }
        // Clearing local state for visitor mode
        if (session?.user.id.startsWith('mock_')) {
            setSession(null);
            setProfile(null);
            setPosts(INITIAL_POSTS);
        }
        setViewedProfileId(null);
        setIsPreviewingAsVisitor(false);
        setCurrentScreen(Screen.Home); // Reset screen state
    };

    const handleUpdateProfile = async (updates: { username?: string, bio?: string }) => {
        if (!session || session.user.id.startsWith('mock_')) {
            setToast('Função desativada para visitantes.');
            // Optimistically update local state for demo purposes
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
        // Optimistically update for mock user
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
        // Optimistically update for mock user
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

    // App Logic Handlers
    const handleImageUpload = async (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setLoadingMessage("Expandindo sua foto com IA. Isso pode levar um momento...");
        setIsLoading(true);
        setError(null);
        try {
            const squaredImageDataUrl = await expandImageToSquare(imageDataUrl);
            
            setUserImage(squaredImageDataUrl);
            setGeneratedImage(squaredImageDataUrl);
            setImageHistory([squaredImageDataUrl]); // Initialize history
            setWornItems([]);
            
            const currentCategory = navigationStack.length > 0 ? navigationStack[0] as Category : null;
            if (currentCategory) {
                setCurrentScreen(Screen.SubCategorySelection);
            } else {
                const defaultCategory = CATEGORIES[0];
                if (defaultCategory) {
                    setNavigationStack([defaultCategory]);
                    setCurrentScreen(Screen.SubCategorySelection);
                } else {
                    setCurrentScreen(Screen.Home);
                }
            }
        } catch (err: any) {
            console.error("Erro ao expandir a imagem:", err);
            setError("Houve um problema ao preparar sua foto. Por favor, tente novamente.");
            setCurrentScreen(Screen.ImageSourceSelection); 
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    };

    const handleSelectCategory = (category: Category) => {
        setNavigationStack([category]);
        if (!userImage && (category.type === 'fashion' || category.type === 'beauty')) {
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
        const itemType = getCategoryTypeFromItem(item);

        if (itemType === 'fashion' || item.isTryOn) {
            if (!userImage) {
                 if (profile) setUserImage(profile.profile_image_url); // Fallback to profile picture if no image is set
                 else {
                    setError("Por favor, carregue uma foto primeiro.");
                    setCurrentScreen(Screen.ImageSourceSelection);
                    return;
                 }
            }
            const baseImage = generatedImage || userImage!;
            const existingItems = [...wornItems];
            setLoadingMessage(null);
            setIsLoading(true);
            setError(null);
            try {
                // Determine which AI service to call
                const generatorFunction = item.isTryOn && itemType === 'beauty' 
                    ? (userImg: string, newItem: Item) => generateBeautyTryOnImage(userImg, newItem)
                    : generateTryOnImage;

                // The beauty function doesn't need existingItems, so we adapt the call signature
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
            // "repost" logic for non-fashion, non-try-on items
            if (profile) {
                const newPost: Post = {
                    id: `post_${Date.now()}`,
                    user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || `https://i.pravatar.cc/150?u=${profile.id}` },
                    image: item.image,
                    items: [item],
                    likes: 0,
                    isLiked: false,
                };
                setPosts(prevPosts => [newPost, ...prevPosts]);
                setConfirmationMessage(`${item.name} foi postado no seu feed!`);
                setCurrentScreen(Screen.Confirmation);
            } else {
                setError("Você precisa estar logado para postar.");
            }
        }
    };
    
    const handleStartNewTryOnSession = async (item: Item) => {
        if (!userImage) {
            setCurrentScreen(Screen.ImageSourceSelection);
            return;
        }
        setCollectionIdentifier(null);
        setLoadingMessage(null);
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
            // This is a fallback, but on ResultScreen, collectionIdentifier should exist.
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
                 if (collectionIdentifier) {
                    setCurrentScreen(Screen.ItemSelection);
                } else {
                    handleBack();
                }
            }
            // Stay on ResultScreen if there are still items left
        } else {
             if (collectionIdentifier) {
                setCurrentScreen(Screen.ItemSelection);
            } else {
                handleBack();
            }
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
        const formattedTotal = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        setConfirmationMessage(`Sua compra de ${items.length} item(ns) no valor de ${formattedTotal} foi finalizada!`);
        setCurrentScreen(Screen.Confirmation);
    };
    const handleAddToCart = (item: Item) => {
        setCartItems(prevItems => [...prevItems, item]);
        setToast(`${item.name} foi adicionado ao carrinho!`);
        setTimeout(() => setToast(null), 3000);

        // Animation logic
        setIsCartAnimating(true);
        setTimeout(() => {
            setIsCartAnimating(false);
        }, 500); // Animation duration
    };

    const handleAddToCartMultiple = (items: Item[]) => {
        if (items.length === 0) return;
        setCartItems(prevItems => [...prevItems, ...items]);
        setToast(`${items.length} iten(s) adicionado(s) ao carrinho!`);
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

    const handlePostToFeed = () => {
        if (generatedImage && wornItems.length > 0 && profile) {
            const newPost: Post = {
                id: `post_${Date.now()}`,
                user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || 'https://i.pravatar.cc/150?u=me' },
                image: generatedImage,
                items: wornItems,
                likes: 0,
                isLiked: false,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setCurrentScreen(Screen.Feed);
        }
    };

    const handleSaveLook = async () => {
        if (!generatedImage || wornItems.length === 0 || !session || !profile) return;
    
        // Handle visitor mode: save locally for the session
        if (session.user.id.startsWith('mock_')) {
            const newLook: SavedLook = {
                id: `look_${Date.now()}`,
                image: generatedImage,
                items: wornItems,
            };
            setSavedLooks(prevLooks => [newLook, ...prevLooks]);
            setConfirmationMessage('Look salvo localmente para esta sessão!');
            setCurrentScreen(Screen.Confirmation);
            setToast('Faça login para salvar looks permanentemente.');
            setTimeout(() => setToast(null), 4000);
            return;
        }
    
        setIsLoading(true);
        setLoadingMessage('Salvando seu look...');
        setError(null);
    
        try {
            // 1. Upload the generated image (data URL) to Supabase Storage
            const publicUrl = await uploadImage('looks', generatedImage);
            if (!publicUrl) {
                throw new Error('Falha ao fazer upload da imagem do look.');
            }
    
            // 2. Prepare the data for insertion
            const lookData = {
                user_id: session.user.id,
                image_url: publicUrl,
                items: wornItems, // Supabase client handles JSON stringification
            };
    
            // 3. Insert into the 'saved_looks' table
            const { data: newSavedLook, error } = await supabase
                .from('saved_looks')
                .insert(lookData)
                .select()
                .single();
    
            if (error) throw error;
    
            // 4. Update local state with the new look from the database
            const lookToAdd: SavedLook = {
                id: newSavedLook.id,
                image: newSavedLook.image_url,
                items: newSavedLook.items,
            };
            setSavedLooks(prevLooks => [lookToAdd, ...prevLooks]);
    
            // 5. Show confirmation
            setConfirmationMessage('Look salvo com sucesso no seu perfil!');
            setCurrentScreen(Screen.Confirmation);
    
        } catch (err: any) {
            console.error("Error saving look:", err);
            setError(`Não foi possível salvar o look: ${err.message}`);
            setCurrentScreen(Screen.Result); // Go back to the result screen on failure
        } finally {
            setIsLoading(false);
            setLoadingMessage(null);
        }
    };

    const handlePostLookFromSaved = (look: SavedLook) => {
        if (!profile) return;
        const newPost: Post = {
            id: `post_${Date.now()}`,
            user: { id: profile.id, name: profile.username, avatar: profile.profile_image_url || 'https://i.pravatar.cc/150?u=me' },
            image: look.image,
            items: look.items,
            likes: 0,
            isLiked: false,
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
        setToast('Look postado no feed com sucesso!');
        setTimeout(() => setToast(null), 3000);
        setCurrentScreen(Screen.Feed);
    };

    const handleSaveImage = () => {
        if (!generatedImage) return;

        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'meu-estilo-look.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setToast('Imagem salva na sua galeria!');
        setTimeout(() => setToast(null), 3000);
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

    const resetToHome = () => {
        const fromRepost = confirmationMessage.includes('postado no seu feed');
        setGeneratedImage(userImage);
        setWornItems([]);
        setImageHistory(userImage ? [userImage] : []);
        setNavigationStack([]);
        setCollectionIdentifier(null);
        if (fromRepost) {
            setCurrentScreen(Screen.Feed);
        } else {
            handleNavigateToProfile();
        }
    };

    const handleNavigateToMyLooks = () => setCurrentScreen(Screen.MyLooks);
    const handleNavigateToRewards = () => setCurrentScreen(Screen.Rewards);
    const handleNavigateToSettings = () => setCurrentScreen(Screen.Settings);

    const handleNavigateToProfile = () => {
        setViewedProfileId(null);
        setIsPreviewingAsVisitor(false);
        setCurrentScreen(Screen.Home);
    };

    const handleViewProfile = async (profileId: string) => {
        if (profileId === profile?.id) {
            handleNavigateToProfile();
            return;
        }
        setViewedProfileId(profileId);
        setIsPreviewingAsVisitor(false);
        setCurrentScreen(Screen.Home);
    };

    const handleToggleVisitorPreview = () => {
        setIsPreviewingAsVisitor(prev => !prev);
    };

    const renderScreen = () => {
        if (isLoading) return <LoadingIndicator userImage={userImage || 'https://i.postimg.cc/htGw97By/Sem-Ti-tulo-1.png'} customMessage={loadingMessage} />;

        const currentNode = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;

        switch (currentScreen) {
            case Screen.Home:
                return <HomeScreen 
                            loggedInProfile={profile!}
                            viewedProfileId={viewedProfileId}
                            onUpdateProfileImage={handleUpdateProfileImage}
                            onUpdateCoverImage={handleUpdateCoverImage}
                            onUpdateProfile={handleUpdateProfile}
                            onSelectCategory={handleSelectCategory} 
                            onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                            onNavigateToMyLooks={handleNavigateToMyLooks}
                            onNavigateToCart={handleNavigateToCart}
                            onNavigateToRewards={handleNavigateToRewards}
                            onNavigateToSettings={handleNavigateToSettings}
                            onStartTryOn={handleStartTryOn}
                            onSignOut={handleSignOut}
                            isCartAnimating={isCartAnimating}
                            onBack={handleProfileBack}
                            isPreviewingAsVisitor={isPreviewingAsVisitor}
                            onToggleVisitorPreview={handleToggleVisitorPreview}
                            posts={posts}
                            onItemClick={handleItemClick}
                            onViewProfile={handleViewProfile}
                        />;
            case Screen.Settings:
                return <SettingsScreen 
                            onBack={handleNavigateToProfile}
                            theme={theme}
                            onToggleTheme={toggleTheme}
                        />;
            case Screen.ImageSourceSelection:
                 return <ImageSourceSelectionScreen 
                            onImageUpload={handleImageUpload} 
                            onUseCamera={handleUseCamera}
                            onBack={handleNavigateToProfile}
                        />;
            case Screen.SubCategorySelection:
                 if (currentNode) {
                    return <SubCategorySelectionScreen
                        node={currentNode}
                        onSelectSubCategory={handleSelectSubCategory}
                        onBack={handleBack}
                    />;
                 }
                 handleNavigateToProfile();
                 return null;
            case Screen.ItemSelection:
                if (collectionIdentifier) {
                    // For non-fashion, we still need a user image placeholder for the UI.
                    const displayImage = userImage || (profile?.profile_image_url || 'https://i.postimg.cc/htGw97By/Sem-Ti-tulo-1.png');
                    return <ItemSelectionScreen
                        userImage={displayImage}
                        collectionId={collectionIdentifier.id}
                        collectionName={collectionIdentifier.name}
                        collectionType={collectionIdentifier.type}
                        onItemSelect={handleItemSelect}
                        onBack={() => setCurrentScreen(Screen.SubCategorySelection)}
                        onBuy={handleBuy}
                        onAddToCart={handleAddToCart}
                    />;
                }
                handleNavigateToProfile();
                return null;
            case Screen.Generating:
                 return <LoadingIndicator userImage={generatedImage || userImage!} />;
            case Screen.Result:
                if (generatedImage && wornItems.length > 0) {
                    const categoryItems = collectionIdentifier 
                        ? ITEMS.filter(item => item.category === collectionIdentifier.id) 
                        : [];
                    return <ResultScreen
                        generatedImage={generatedImage}
                        items={wornItems}
                        categoryItems={categoryItems}
                        onItemSelect={handleItemSelect}
                        onPostToFeed={handlePostToFeed}
                        onBuy={handleBuyLook}
                        onUndo={handleUndoLastItem}
                        onSaveLook={handleSaveLook}
                        onSaveImage={handleSaveImage}
                        onAddMoreItems={handleNavigateToAddMoreItems}
                    />;
                }
                // If we land here with no items, it means we undid the last one.
                if (collectionIdentifier) {
                    setCurrentScreen(Screen.ItemSelection);
                } else {
                    handleBack();
                }
                return null;
            case Screen.Confirmation:
                return <ConfirmationScreen message={confirmationMessage} onHome={resetToHome} />;
            case Screen.Feed:
                 return <FeedScreen 
                            posts={posts}
                            stories={stories}
                            profileImage={profile?.profile_image_url || null}
                            onBack={handleNavigateToProfile}
                            onItemClick={handleItemClick}
                            onAddToCartMultiple={handleAddToCartMultiple}
                            onBuyMultiple={handleBuyLook}
                            onViewProfile={handleViewProfile}
                            onSelectCategory={handleSelectCategory}
                        />;
            case Screen.MyLooks:
                return <MyLooksScreen 
                            looks={savedLooks} 
                            onBack={handleNavigateToProfile} 
                            onItemClick={handleItemClick}
                            onBuyLook={handleBuyLook}
                            onPostLook={handlePostLookFromSaved}
                        />;
            case Screen.Camera:
                return <CameraScreen 
                           onPhotoTaken={handleImageUpload} 
                           onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                       />;
            case Screen.Cart:
                return <CartScreen
                    cartItems={cartItems}
                    onBack={handleNavigateToProfile}
                    onRemoveItem={handleRemoveFromCart}
                    onBuyItem={handleBuySingleItemFromCart}
                    onTryOnItem={handleStartNewTryOnSession}
                    onCheckout={() => {
                        if (cartItems.length > 0) {
                            handleBuyLook(cartItems);
                            setCartItems([]);
                        }
                    }}
                />;
            case Screen.Rewards:
                return <RewardsScreen onBack={handleNavigateToProfile} />;
            default:
                handleNavigateToProfile();
                return null;
        }
    };
    
    const renderContent = () => {
        if (authLoading) {
            return <SplashScreen />;
        }
        if (!session) {
            return <LoginScreen onContinueAsVisitor={handleContinueAsVisitor} />;
        }
        // Handle profile fetch failure after login
        if (!profile && error) {
            return (
                <div className="flex flex-col items-center justify-center h-full w-full p-6 text-[var(--text-primary)] text-center animate-fadeIn bg-[var(--bg-main)]">
                    <XCircleIcon className="w-24 h-24 text-red-400 mb-6" />
                    <h1 className="text-2xl font-bold mb-2">Falha ao Carregar Perfil</h1>
                    <p className="text-[var(--text-tertiary)] text-base mb-6">{error}</p>
                    <p className="text-[var(--text-secondary)] text-sm mb-10 bg-[var(--bg-secondary)] p-3 rounded-lg border border-zinc-700">
                       <strong>Dica:</strong> Este erro geralmente ocorre porque as Políticas de Segurança de Nível de Linha (RLS) não estão configuradas corretamente na sua tabela <code>profiles</code> no Supabase. Certifique-se de que os usuários autenticados tenham permissão para ler e criar seus próprios perfis.
                    </p>
                    <GradientButton onClick={handleSignOut}>
                        Voltar ao Login
                    </GradientButton>
                </div>
            );
        }
        if (!profile) {
            // Profile is being fetched, show a loader
            return <SplashScreen />;
        }
        return renderScreen();
    };

    return (
        <div className="h-screen w-screen max-w-md mx-auto bg-[var(--bg-main)] overflow-hidden relative shadow-2xl shadow-yellow-500/20">
            {renderContent()}
            {toast && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur-sm text-black px-5 py-2.5 rounded-full shadow-lg z-50 animate-fadeIn text-sm font-semibold">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default App;