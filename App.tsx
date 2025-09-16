import React from 'react';
import { Screen, Category, Item, Post } from './types';
import { generateTryOnImage } from './services/geminiService';
import { INITIAL_POSTS } from './constants';

// Screen Components
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import ItemSelectionScreen from './components/ItemSelectionScreen';
import LoadingIndicator from './components/LoadingIndicator';
import ResultScreen from './components/ResultScreen';
import ConfirmationScreen from './components/ConfirmationScreen';
import FeedScreen from './components/FeedScreen';
import MyLooksScreen from './components/MyLooksScreen';

const App: React.FC = () => {
    // State management
    const [currentScreen, setCurrentScreen] = React.useState<Screen>(Screen.Splash);
    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
    const [wornItems, setWornItems] = React.useState<Item[]>([]);
    const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
    const [confirmationMessage, setConfirmationMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Navigation and state update handlers
    const handleLogin = () => setCurrentScreen(Screen.Home);
    const handleImageUpload = (imageDataUrl: string) => {
        setUserImage(imageDataUrl);
        setGeneratedImage(imageDataUrl); // Initially, generated image is the user's image
        setWornItems([]); // Reset items when a new photo is uploaded
    };

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
        setCurrentScreen(Screen.ItemSelection);
    };

    const handleItemSelect = async (item: Item) => {
        if (!userImage) return;
        
        // Use the latest generated image as the base for the next try-on
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
            // Go back to item selection on error
            setCurrentScreen(Screen.ItemSelection);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUndo = () => {
        // This is a simplified undo. A real app might need a history stack.
        // For now, it just goes back to the item selection screen.
        // A better implementation would remove the last item and revert the image.
        if (selectedCategory) {
            setCurrentScreen(Screen.ItemSelection);
        } else {
            setCurrentScreen(Screen.Home);
        }
    };

    const handleContinueStyling = () => {
        if (selectedCategory) {
            setCurrentScreen(Screen.ItemSelection);
        } else {
            // This case shouldn't happen, but as a fallback:
            setCurrentScreen(Screen.Home);
        }
    };

    const handleBuy = () => {
        setConfirmationMessage('Sua compra foi finalizada com sucesso!');
        setCurrentScreen(Screen.Confirmation);
    };
    
    const handleAddToCart = () => {
        setConfirmationMessage('Itens adicionados ao carrinho!');
        setCurrentScreen(Screen.Confirmation);
    };

    const handlePostToFeed = () => {
        if (generatedImage && wornItems.length > 0) {
            const newPost: Post = {
                id: `post_${Date.now()}`,
                user: { name: 'você', avatar: userImage || 'https://i.pravatar.cc/150?u=me' },
                image: generatedImage,
                items: wornItems,
                likes: 0,
                isLiked: false,
            };
            setPosts(prevPosts => [newPost, ...prevPosts]);
            setCurrentScreen(Screen.Feed); // Alterado para ir direto para o Feed
        }
    };

    const resetToHome = () => {
        // Keep user image, but reset the rest of the flow
        setGeneratedImage(userImage);
        setWornItems([]);
        setSelectedCategory(null);
        setCurrentScreen(Screen.Home);
    };

    const handleNavigateToMyLooks = () => {
        setCurrentScreen(Screen.MyLooks);
    };

    const renderScreen = () => {
        if (isLoading) {
            return <LoadingIndicator userImage={userImage!} />;
        }

        switch (currentScreen) {
            case Screen.Splash:
                return <SplashScreen onFinish={() => setCurrentScreen(Screen.Login)} />;
            case Screen.Login:
                return <LoginScreen onLogin={handleLogin} />;
            case Screen.Home:
                return <HomeScreen 
                            userImage={userImage}
                            onImageUpload={handleImageUpload}
                            onSelectCategory={handleSelectCategory} 
                            onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                            onNavigateToMyLooks={handleNavigateToMyLooks}
                            onNavigateToCart={handleAddToCart}
                        />;
            case Screen.ItemSelection:
                if (userImage && selectedCategory) {
                    return <ItemSelectionScreen
                        userImage={userImage}
                        category={selectedCategory}
                        onItemSelect={handleItemSelect}
                        onBack={() => setCurrentScreen(Screen.Home)}
                        onBuy={handleBuy}
                        onAddToCart={handleAddToCart}
                    />;
                }
                // Fallback if state is inconsistent
                return <HomeScreen 
                            userImage={userImage} 
                            onImageUpload={handleImageUpload} 
                            onSelectCategory={handleSelectCategory} 
                            onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                            onNavigateToMyLooks={handleNavigateToMyLooks}
                            onNavigateToCart={handleAddToCart}
                       />;
            case Screen.Generating:
                 return <LoadingIndicator userImage={generatedImage || userImage!} />;
            case Screen.Result:
                if (generatedImage && wornItems.length > 0) {
                    return <ResultScreen
                        generatedImage={generatedImage}
                        items={wornItems}
                        onPostToFeed={handlePostToFeed}
                        onBuy={handleBuy}
                        onBack={handleUndo}
                        onAddToCart={handleAddToCart}
                        onContinueStyling={handleContinueStyling}
                    />;
                }
                return <HomeScreen 
                            userImage={userImage} 
                            onImageUpload={handleImageUpload} 
                            onSelectCategory={handleSelectCategory} 
                            onNavigateToFeed={() => setCurrentScreen(Screen.Feed)}
                            onNavigateToMyLooks={handleNavigateToMyLooks}
                            onNavigateToCart={handleAddToCart}
                       />;
            case Screen.Confirmation:
                return <ConfirmationScreen message={confirmationMessage} onHome={resetToHome} />;
            case Screen.Feed:
                 return <FeedScreen 
                            posts={posts}
                            onBack={() => setCurrentScreen(Screen.Home)}
                            // A simple implementation: clicking an item takes you to its category
                            onItemClick={(item) => {
                                const category = { id: item.category, name: item.category.toUpperCase(), image: ''}; // Simplified
                                handleSelectCategory(category);
                            }}
                        />;
            case Screen.MyLooks:
                return <MyLooksScreen onBack={() => setCurrentScreen(Screen.Home)} />;
            default:
                return <SplashScreen onFinish={() => setCurrentScreen(Screen.Login)} />;
        }
    };

    return (
        <div className="h-screen w-screen max-w-md mx-auto bg-black overflow-hidden relative shadow-2xl shadow-purple-500/30">
            {error && <div className="absolute top-0 left-0 right-0 p-2 bg-red-500 text-white text-center z-50">{error}</div>}
            {renderScreen()}
        </div>
    );
};

export default App;