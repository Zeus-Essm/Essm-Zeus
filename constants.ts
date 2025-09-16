import type { Category, Item, Post } from './types';

// As categorias de coleções
export const CATEGORIES: Category[] = [
  { 
    id: 'lv', 
    name: 'LV', 
    image: 'user-provided-image-1.png',
    // IMPORTANTE: A URL do Google Drive foi ajustada para um link direto.
    // Para produção, é recomendado usar um serviço de hosting de vídeo (Vercel, S3, etc.) para melhor performance.
    video: 'https://drive.google.com/uc?export=view&id=1CgliJYea5wMjAkNPMmr9m5UiSeHaYw3l'
  },
  { id: 'polo_do_albano', name: 'POLO DO ALBANO', image: 'user-provided-image-13.png' },
];

// A coleção de itens
export const ITEMS: Item[] = [
  { id: 'lv_item_1', name: 'Blazer de Smoking Preto', description: 'Blazer de lã com lapela de cetim, um toque de sofisticação para eventos formais.', category: 'lv', image: 'user-provided-image-1.png', price: 9850.00 },
  { id: 'lv_item_2', name: 'Jaqueta Utilitária Marrom', description: 'Jaqueta texturizada com múltiplos bolsos e colarinho de couro, combinando luxo e funcionalidade.', category: 'lv', image: 'user-provided-image-2.png', price: 12500.00 },
  { id: 'lv_item_3', name: 'Calça Xadrez Verde e Azul', description: 'Calça de alfaiataria com padronagem xadrez Damier em tons vibrantes.', category: 'lv', image: 'user-provided-image-3.png', price: 4500.00 },
  { id: 'lv_item_4', name: 'Calça Flare de Couro Damier', description: 'Calça flare em couro com a icônica padronagem Damier em tons de marrom.', category: 'lv', image: 'user-provided-image-4.png', price: 8200.00 },
  { id: 'lv_item_5', name: 'Camiseta Monogram Azul Marinho', description: 'Camiseta de algodão com estampa Monogram por toda a peça e detalhe na barra.', category: 'lv', image: 'user-provided-image-5.png', price: 2900.00 },
  { id: 'lv_item_6', name: 'Camiseta Damier com Logo LV', description: 'Camiseta com padronagem Damier em tons de marrom e logo LV bordado em cristais.', category: 'lv', image: 'user-provided-image-6.png', price: 3100.00 },
  { id: 'lv_item_7', name: 'Calça Jogger Monogram', description: 'Calça jogger confortável com estampa Monogram e listras laterais contrastantes.', category: 'lv', image: 'user-provided-image-7.png', price: 5600.00 },
  { id: 'lv_item_8', name: 'Camisa Polo Verde', description: 'Camisa polo clássica em piquet de algodão verde com logo bordado.', category: 'lv', image: 'user-provided-image-8.png', price: 2550.00 },
  { id: 'lv_item_9', name: 'Blazer Xadrez Verde e Azul', description: 'Blazer de dois botões com padronagem xadrez Damier, para um visual completo.', category: 'lv', image: 'user-provided-image-9.png', price: 11500.00 },
  { id: 'lv_item_10', name: 'Camiseta Monogram Vermelha', description: 'Versão vibrante da camiseta Monogram em algodão vermelho intenso.', category: 'lv', image: 'user-provided-image-10.png', price: 2900.00 },
  { id: 'lv_item_11', name: 'Blazer Damier Cinza', description: 'Blazer elegante em tons de cinza com padronagem Damier sutil e logo discreto.', category: 'lv', image: 'user-provided-image-11.png', price: 10200.00 },
  { id: 'lv_item_12', name: 'Jaqueta Bomber de Cetim Preta', description: 'Jaqueta bomber de cetim preta com logo bordado no peito e detalhes em ribana.', category: 'lv', image: 'user-provided-image-12.png', price: 8900.00 },
  { id: 'polo_albano_item_1', name: 'Camisa Casual Turquesa', description: 'Camisa de manga longa em tom turquesa vibrante com um sutil micropadrão, perfeita para um look casual e elegante.', category: 'polo_do_albano', image: 'user-provided-image-13.png', price: 450.00 },
];


// Dados fictícios para o feed
export const INITIAL_POSTS: Post[] = [
    {
        id: 'post1',
        user: { name: 'camila_fashion', avatar: 'https://i.pravatar.cc/150?u=camila' },
        image: 'https://images.unsplash.com/photo-1617114912952-b436551b9b23?q=80&w=800&auto=format&fit=crop',
        items: [ITEMS[0], ITEMS[3]],
        likes: 134,
        isLiked: false,
    },
    {
        id: 'post2',
        user: { name: 'marco_style', avatar: 'https://i.pravatar.cc/150?u=marco' },
        image: 'https://images.unsplash.com/photo-1593032465267-e69b59a4ee35?q=80&w=800&auto=format&fit=crop',
        items: [ITEMS[8], ITEMS[2]],
        likes: 256,
        isLiked: true,
    },
     {
        id: 'post3',
        user: { name: 'julia_looks', avatar: 'https://i.pravatar.cc/150?u=julia' },
        image: 'https://images.unsplash.com/photo-1574201433653-54e7f3b6d39d?q=80&w=800&auto=format&fit=crop',
        items: [ITEMS[1]],
        likes: 89,
        isLiked: false,
    },
];