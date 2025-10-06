export type MarketplaceType = 'fashion' | 'beauty' | 'supermarket' | 'restaurant' | 'technology';

export enum Screen {
  Splash,
  Login,
  Home,
  SubCategorySelection, // Nova tela
  ItemSelection,
  Generating,
  Result,
  Confirmation,
  Feed,
  MyLooks,
  Camera,
  ImageSourceSelection,
  Cart,
  Rewards,
}

export interface SubCategory {
  id: string;
  name: string;
  image: string;
  subCategories?: SubCategory[];
}

export interface Category {
  id:string;
  name: string;
  image: string;
  video?: string;
  type: MarketplaceType;
  subCategories?: SubCategory[]; // Adicionado: Sub-categorias opcionais
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
}

// Novo tipo para um post no feed
export interface Post {
  id: string;
  user: {
    id: string; // ID do usuário que postou
    name: string;
    avatar: string; // URL da imagem de avatar
  };
  image: string; // A imagem do look gerado
  items: Item[]; // Os itens usados no look
  likes: number;
  isLiked: boolean; // Para controlar o estado de curtida no cliente
}

// Novo tipo para um look salvo
export interface SavedLook {
  id: string;
  image: string;
  items: Item[];
}

// Novo tipo para um story no feed
export interface Story {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  backgroundImage: string;
}

// Novo tipo para o perfil do usuário do Supabase
export interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_image_url?: string;
  cover_image_url?: string;
}