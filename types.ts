export enum Screen {
  Splash,
  Login,
  Home,
  ItemSelection,
  Generating,
  Result,
  Confirmation,
  Feed,
  MyLooks, // Nova tela
}

export interface Category {
  id: string;
  name: string;
  image: string;
  video?: string; // Adicionado: Campo opcional para o vídeo de destaque
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
    name: string;
    avatar: string; // URL da imagem de avatar
  };
  image: string; // A imagem do look gerado
  items: Item[]; // Os itens usados no look
  likes: number;
  isLiked: boolean; // Para controlar o estado de curtida no cliente
}