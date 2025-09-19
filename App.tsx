

import React from 'react';
// FIX: Changed to a non-type import for Session, which might be required by older Supabase versions.
import { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabaseClient';
import { Screen, Category, Item, Post, SubCategory, SavedLook, Story, Profile } from './types';
import { generateTryOnImage } from './services/geminiService';
import { INITIAL_POSTS, CATEGORIES, INITIAL_STORIES } from './constants';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
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


const App: React.FC = () => {
    // Auth & Profile state
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = React.useState(true);

    // App Navigation and UI state
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Home);
    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [navigationStack, setNavigationStack] = React.useState<(Category | SubCategory)[]>([]);
    const [collectionIdentifier, setCollectionIdentifier] = React.useState<{id: string, name: string} | null>(null);
    const [wornItems, setWornItems] = React.useState<Item[]>([]);
    const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
    const [stories, setStories] = React.useState<Story[]>(INITIAL_STORIES);
    const [savedLooks, setSavedLooks] = React.useState<SavedLook[]>([]);
    const [cartItems, setCartItems] = React.useState<Item[]>([]);
    const [toast, setToast] = React.useState<string | null>(null);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isCartAnimating, setIsCartAnimating] = React.useState(false);

    // Auth effect
    React.useEffect(() => {
        const setupAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            if (session) {
                const profileData = await getOrCreateProfile(session, setError);
                setProfile(profileData);
            }
            setAuthLoading(false);
        };

        setupAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session) {
                const profileData = await getOrCreateProfile(session, setError);
                setProfile(profileData);
            } else {
                setProfile(null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);
    
    const handleContinueAsVisitor = () => {
        const mockProfile: Profile = {
            id: 'mock_user_123',
            username: 'BV (blue sky)',
            bio: 'Bem-vindo(a) ao MEU ESTILO! Explore as coleções e prove roupas virtualmente.',
            profile_image_url: 'https://i.postimg.cc/pL7M6Vgv/bv.jpg',
            cover_image_url: 'https://i.postimg.cc/wTQh27Rt/Captura-de-Tela-2025-09-19-a-s-2-10-14-PM.png',
        };
        const mockSession = { user: { id: 'mock_user_123' } } as Session;

        setSession(mockSession);
        setProfile(mockProfile);
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
        }
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
            setToast('Função desativada para visitantes.');
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
    const handleImageUpload = (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setGeneratedImage(imageDataUrl);
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
    };

    const handleSelectCategory = (category: Category) => {
        setNavigationStack([category]);
        if (!userImage) {
            setCurrentScreen(Screen.ImageSourceSelection);
            return;
        }
        if (category.subCategories && category.subCategories.length > 0) {
            setCurrentScreen(Screen.SubCategorySelection);
        } else {
            setCollectionIdentifier({ id: category.id, name: category.name });
            setCurrentScreen(Screen.ItemSelection);
        }
    };
    
    const handleSelectSubCategory = (subCategory: SubCategory) => {
        if (subCategory.subCategories && subCategory.subCategories.length > 0) {
            setNavigationStack(prev => [...prev, subCategory]);
        } else {
            setCollectionIdentifier({ id: subCategory.id, name: subCategory.name });
            setCurrentScreen(Screen.ItemSelection);
        }
    };

    const handleBack = () => {
        const newStack = [...navigationStack];
        newStack.pop();
        if (newStack.length === 0) {
            setCurrentScreen(Screen.Home);
        } else {
            setNavigationStack(newStack);
            setCurrentScreen(Screen.SubCategorySelection);
        }
    };

    const handleItemSelect = async (item: Item) => {
        if (!userImage) return;
        const baseImage = generatedImage || userImage;
        const existingItems = [...wornItems];
        setCurrentScreen(Screen.Generating);
        setIsLoading(true);
        setError(null);
        try {
            const newImage = await generateTryOnImage(baseImage, item, existingItems);
            setGeneratedImage(newImage);
            setWornItems(prevItems => [...prevItems, item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setCurrentScreen(Screen.ItemSelection);
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
        setCurrentScreen(Screen.Generating);
        setIsLoading(true);
        setError(null);
        try {
            const newImage = await generateTryOnImage(userImage, item, []);
            setGeneratedImage(newImage);
            setWornItems([item]);
            setCurrentScreen(Screen.Result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setCurrentScreen(Screen.Cart);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUndoLastItem = () => {
        if (collectionIdentifier) {
             setCurrentScreen(Screen.ItemSelection);
        } else {
            handleBack();
        }
    };

    const handleContinueStyling = () => {
        if (collectionIdentifier) {
            setCurrentScreen(Screen.ItemSelection);
        } else {
            setCurrentScreen(Screen.Home);
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
                user: { name: profile.username, avatar: profile.profile_image_url || 'https://i.pravatar.cc/150?u=me' },
                image: generatedImage,
                items: wornItems,
                likes: 0,
                isLiked: false,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setCurrentScreen(Screen.Feed);
        }
    };

    const handleSaveLook = () => {
        if (generatedImage && wornItems.length > 0) {
            const newLook: SavedLook = {
                id: `look_${Date.now()}`,
                image: generatedImage,
                items: wornItems,
            };
            setSavedLooks(prevLooks => [newLook, ...prevLooks]);
            setConfirmationMessage('Look salvo com sucesso na sua galeria!');
            setCurrentScreen(Screen.Confirmation);
        }
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
        setGeneratedImage(userImage);
        setWornItems([]);
        setNavigationStack([]);
        setCollectionIdentifier(null);
        setCurrentScreen(Screen.Home);
    };

    const handleNavigateToMyLooks = () => setCurrentScreen(Screen.MyLooks);
    const handleNavigateToRewards = () => setCurrentScreen(Screen.Rewards);

    const renderScreen = () => {
        if (isLoading) return <LoadingIndicator userImage={userImage!} />;

        const currentNode = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null;

        switch (currentScreen) {
            case Screen.Home:
                return <HomeScreen 
                            profile={profile!}
                            onUpdateProfileImage={handleUpdateProfileImage}
                            onUpdateCoverImage={handleUpdateCoverImage}
                            onUpdateProfile={handleUpdateProfile}
                            onSelectCategory={handleSelectCategory} 
                            onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                            onNavigateToMyLooks={handleNavigateToMyLooks}
                            onNavigateToCart={handleNavigateToCart}
                            onNavigateToRewards={handleNavigateToRewards}
                            onStartTryOn={handleStartTryOn}
                            onSignOut={handleSignOut}
                            isCartAnimating={isCartAnimating}
                        />;
            case Screen.ImageSourceSelection:
                 return <ImageSourceSelectionScreen 
                            onImageUpload={handleImageUpload} 
                            onUseCamera={handleUseCamera}
                            onBack={() => setCurrentScreen(Screen.Home)}
                        />;
            case Screen.SubCategorySelection:
                 if (currentNode) {
                    return <SubCategorySelectionScreen
                        node={currentNode}
                        onSelectSubCategory={handleSelectSubCategory}
                        onBack={handleBack}
                    />;
                 }
                 setCurrentScreen(Screen.Home);
                 return null;
            case Screen.ItemSelection:
                if (userImage && collectionIdentifier) {
                    return <ItemSelectionScreen
                        userImage={userImage}
                        collectionId={collectionIdentifier.id}
                        collectionName={collectionIdentifier.name}
                        onItemSelect={handleItemSelect}
                        onBack={() => setCurrentScreen(Screen.SubCategorySelection)}
                        onBuy={handleBuy}
                        onAddToCart={handleAddToCart}
                    />;
                }
                setCurrentScreen(Screen.Home);
                return null;
            case Screen.Generating:
                 return <LoadingIndicator userImage={generatedImage || userImage!} />;
            case Screen.Result:
                if (generatedImage && wornItems.length > 0) {
                    return <ResultScreen
                        generatedImage={generatedImage}
                        items={wornItems}
                        onPostToFeed={handlePostToFeed}
                        onBuy={handleBuyLook}
                        onBack={handleUndoLastItem}
                        onSaveLook={handleSaveLook}
                        onSaveImage={handleSaveImage}
                        onContinueStyling={handleContinueStyling}
                    />;
                }
                setCurrentScreen(Screen.Home);
                return null;
            case Screen.Confirmation:
                return <ConfirmationScreen message={confirmationMessage} onHome={resetToHome} />;
            case Screen.Feed:
                 return <FeedScreen 
                            posts={posts}
                            stories={stories}
                            profileImage={profile?.profile_image_url || null}
                            onBack={() => setCurrentScreen(Screen.Home)}
                            onItemClick={handleItemClick}
                        />;
            case Screen.MyLooks:
                return <MyLooksScreen 
                            looks={savedLooks} 
                            onBack={() => setCurrentScreen(Screen.Home)} 
                            onItemClick={handleItemClick}
                            onBuyLook={handleBuyLook}
                        />;
            case Screen.Camera:
                return <CameraScreen 
                           onPhotoTaken={handleImageUpload} 
                           onBack={() => setCurrentScreen(Screen.ImageSourceSelection)} 
                       />;
            case Screen.Cart:
                return <CartScreen
                    cartItems={cartItems}
                    onBack={() => setCurrentScreen(Screen.Home)}
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
                return <RewardsScreen onBack={() => setCurrentScreen(Screen.Home)} />;
            default:
                setCurrentScreen(Screen.Home);
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
        if (!profile) {
            // Profile is being fetched or failed to fetch, show a loader
            return <SplashScreen />;
        }
        return renderScreen();
    };

    return (
        <div className="h-screen w-screen max-w-md mx-auto bg-black overflow-hidden relative shadow-2xl shadow-purple-500/30">
            {error && <div className="absolute top-0 left-0 right-0 p-2 bg-red-500 text-white text-center z-50">{error}</div>}
            {renderContent()}
            {toast && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full shadow-lg z-50 animate-fadeIn text-sm font-semibold">
                    {toast}
                </div>
            )}
        </div>
    );
};

export default App;