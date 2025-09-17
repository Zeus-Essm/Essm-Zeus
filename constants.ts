
import type { Category, Item, Post, Story } from './types';

// Sub-categorias de Roupas reutilizáveis
const MALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/Qd37t43s/men-suit.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/6p683zY1/men-tshirt.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/Hxb3SYN1/men-shirt.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/WbN1N7hV/men-pants.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/mD3VZV8d/men-jacket.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/3J8MczR7/men-sneakers.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/y8Xn3JmY/men-shoes.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/yN7k0v1N/men-accessories.jpg' },
];

const FEMALE_CLOTHING_SUBCATEGORIES = [
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/KY1M8mDR/women-tshirt.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/x8K6bBsF/women-blouse.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/pXbJkYy5/women-pants.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/Qx41pYgr/women-skirt.jpg' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/Z5N3sSg1/women-dress.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/J0BvB1fJ/mahdi-chaghari-J8-Cf-D-Q2-Fw-unsplash.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/j5G0xM1P/adidas-women.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/sX2C4x51/women-heels.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/cJVdYg6Q/women-accessories.jpg' },
];

const KID_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/vH4B6LwM/pageboy-suit.png' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/1z7CqVjT/nf-kid-tshirt.png' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/Pq91y5nj/kid-shirt.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/YSG824Q0/nf-kid-shorts.png' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/L6f2dJ2f/lilas-kid.jpg' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/L5Kk6H7y/flowergirl-dress.png' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/zXk0y3S9/lilas-kid-jacket.png' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/Pq2kxbH1/adidas-kid.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/J083BwrR/lv-kid-shoes.png' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/ydpLZYMh/kid-accessories.jpg' },
];

// Helper para criar subcategorias com IDs únicos
const createSubCategories = (parentId: string, subCategories: {id: string, name: string, image: string}[]) => {
    return subCategories.map(sc => ({ ...sc, id: `${parentId}_${sc.id}` }));
};


// As categorias de coleções
export const CATEGORIES: Category[] = [
  { 
    id: 'lv', 
    name: 'Louis Vuitton', 
    image: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg',
    video: 'https://streamable.com/f79d27/video.mp4',
    subCategories: [
        { id: 'lv_masculino', name: 'Masculino', image: 'https://i.postimg.cc/qBjM1W9L/pedro-sande-v-RT2t-T5-S-k-unsplash.jpg', subCategories: createSubCategories('lv_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_feminino', name: 'Feminino', image: 'https://i.postimg.cc/J05bN2Vv/charlesdeluvio-M-v-fl-T2-Fw-unsplash.jpg', subCategories: createSubCategories('lv_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_crianca', name: 'Criança', image: 'https://i.postimg.cc/mDcf1W0w/pexels-antoni-shkraba-production-8041071.jpg', subCategories: createSubCategories('lv_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'new_feeling',
    name: 'NEW FEELING',
    image: 'https://i.postimg.cc/P5K1G2Py/new.jpg',
    subCategories: [
        { id: 'nf_masculino', name: 'Masculino', image: 'https://i.postimg.cc/QdZ0c2s5/nf-men.jpg', subCategories: createSubCategories('nf_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_feminino', name: 'Feminino', image: 'https://i.postimg.cc/0j2gKzDF/nf-women.jpg', subCategories: createSubCategories('nf_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_crianca', name: 'Criança', image: 'https://i.postimg.cc/sXv7xX6K/nf-kid.jpg', subCategories: createSubCategories('nf_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'noivas',
    name: 'NOIVAS',
    image: 'https://i.postimg.cc/G3vH75kZ/465687536-1138426001618419-5911119315795457782-n.jpg',
    subCategories: [
        { id: 'noivas_vestidos', name: 'Vestidos', image: 'https://i.postimg.cc/Kz4Y57h3/bride-dress.png' },
        { id: 'noivas_noivos', name: 'Noivos', image: 'https://i.postimg.cc/Pqj05h6n/groom-tuxedo.png' },
        { id: 'noivas_criancas', name: 'Crianças', image: 'https://i.postimg.cc/L5Kk6H7y/flowergirl-dress.png' }
    ]
  },
  {
    id: 'lilas',
    name: 'LILAS',
    image: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    subCategories: [
        { id: 'lilas_masculino', name: 'Masculino', image: 'https://i.postimg.cc/pT4yYwR2/lilas-men.jpg', subCategories: createSubCategories('lilas_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lilas_feminino', name: 'Feminino', image: 'https://i.postimg.cc/tJnF9L4g/lilas-women.jpg', subCategories: createSubCategories('lilas_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lilas_crianca', name: 'Criança', image: 'https://i.postimg.cc/L6f2dJ2f/lilas-kid.jpg', subCategories: createSubCategories('lilas_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'adidas',
    name: 'ADIDAS',
    image: 'https://i.postimg.cc/LXmdq4H2/D.jpg',
    subCategories: [
        { id: 'adidas_masculino', name: 'Masculino', image: 'https://i.postimg.cc/mD3B4Jg3/adidas-men.jpg', subCategories: createSubCategories('adidas_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'adidas_feminino', name: 'Feminino', image: 'https://i.postimg.cc/j5G0xM1P/adidas-women.jpg', subCategories: createSubCategories('adidas_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'adidas_crianca', name: 'Criança', image: 'https://i.postimg.cc/Pq2kxbH1/adidas-kid.jpg', subCategories: createSubCategories('adidas_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
];

// A coleção de itens
export const ITEMS: Item[] = [
  // Louis Vuitton
  { id: 'lv_item_m1', name: 'Jaqueta de Couro Monogram', description: 'Jaqueta bomber em couro de cordeiro macio com o icônico padrão Monogram em relevo.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/X743w2vj/lv-men-jacket.png', price: 28000.00 },
  { id: 'lv_item_m2', name: 'Tênis LV Trainer', description: 'Tênis de cano baixo inspirado nos modelos de basquete vintage, com assinatura Louis Vuitton manuscrita.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/fyy2v7s0/lv-men-sneaker.png', price: 6850.00 },
  { id: 'lv_item_f1', name: 'Bolsa Neverfull MM', description: 'A lendária bolsa tote em canvas Monogram com acabamento em couro natural, perfeita para qualquer ocasião.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/D0ghmQ8g/lv-women-bag.png', price: 10500.00 },
  { id: 'lv_item_f2', name: 'Vestido de Seda Estampado', description: 'Vestido fluido de seda com estampa da coleção atual, combinando elegância e modernidade.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/3wL20Wk1/lv-women-dress.png', price: 15200.00 },
  { id: 'lv_item_c1', name: 'Macacão Infantil Monogram', description: 'Adorável macacão em algodão suave com o padrão Monogram, garantindo conforto e estilo para os pequenos.', category: 'lv_crianca_vestido', image: 'https://i.postimg.cc/d1G5B1G5/lv-kid-romper.png', price: 2500.00 },
  { id: 'lv_item_c2', name: 'Sapatinho de Bebê LV Archlight', description: 'Versão em miniatura do icônico tênis Archlight, para os primeiros passos com muito estilo.', category: 'lv_crianca_sapatos', image: 'https://i.postimg.cc/J083BwrR/lv-kid-shoes.png', price: 1800.00 },

  // NEW FEELING
  { id: 'nf_item_m1', name: 'Moletom com Capuz Essencial', description: 'Moletom de algodão orgânico com um toque macio, perfeito para o dia a dia.', category: 'nf_masculino_jaqueta', image: 'https://i.postimg.cc/fT8c1V8q/nf-hoodie.png', price: 350.00 },
  { id: 'nf_item_m2', name: 'Calça Jeans Reta Vintage', description: 'Jeans de corte reto com lavagem clássica, versátil e confortável.', category: 'nf_masculino_calca', image: 'https://i.postimg.cc/prgQkDBL/nf-jeans.png', price: 280.00 },
  { id: 'nf_item_f1', name: 'Top Cropped Canelado', description: 'Top cropped básico em malha canelada, essencial para compor looks modernos.', category: 'nf_feminino_tshirt', image: 'https://i.postimg.cc/vB2QzYn6/nf-croptop.png', price: 120.00 },
  { id: 'nf_item_f2', name: 'Calça Wide Leg de Linho', description: 'Calça de pernas largas em linho, proporcionando elegância e conforto.', category: 'nf_feminino_calca', image: 'https://i.postimg.cc/WbFfVw8d/nf-wideleg.png', price: 420.00 },
  { id: 'nf_item_c1', name: 'Camiseta Estampada Divertida', description: 'Camiseta de algodão com estampa exclusiva, para brincar com estilo.', category: 'nf_crianca_tshirt', image: 'https://i.postimg.cc/1z7CqVjT/nf-kid-tshirt.png', price: 95.00 },
  { id: 'nf_item_c2', name: 'Bermuda de Sarja Colorida', description: 'Bermuda confortável em sarja, disponível em várias cores vibrantes.', category: 'nf_crianca_calca', image: 'https://i.postimg.cc/YSG824Q0/nf-kid-shorts.png', price: 150.00 },

  // NOIVAS
  { id: 'noivas_item_m1', name: 'Smoking de Lã Fria', description: 'Smoking clássico com lapela de cetim, corte impecável para o noivo.', category: 'noivas_noivos', image: 'https://i.postimg.cc/Pqj05h6n/groom-tuxedo.png', price: 4500.00 },
  { id: 'noivas_item_m2', name: 'Sapato Oxford de Verniz', description: 'Sapato social em verniz com design elegante, o toque final para o traje.', category: 'noivas_noivos', image: 'https://i.postimg.cc/Y0zYy5fT/groom-shoes.png', price: 890.00 },
  { id: 'noivas_item_f3', name: 'Vestido de pérolas', description: 'Elegante vestido de noiva com corpete bordado em pérolas e saia fluida.', category: 'noivas_vestidos', image: 'https://i.postimg.cc/2jFGhTXx/kindpng-519639.png', price: 20000.00 },
  { id: 'noivas_item_f4', name: 'Vestido de Princesa', description: 'Um vestido de noiva deslumbrante estilo princesa com saia volumosa e detalhes brilhantes.', category: 'noivas_vestidos', image: 'https://i.postimg.cc/CLrjs2Cb/Captura-de-Tela-2025-09-17-a-s-12-10-28-AM.png', price: 30000.00 },
  { id: 'noivas_item_c1', name: 'Vestido Daminha de Honra', description: 'Vestido de tule com faixa de cetim, perfeito para a daminha.', category: 'noivas_criancas', image: 'https://i.postimg.cc/L5Kk6H7y/flowergirl-dress.png', price: 750.00 },
  { id: 'noivas_item_c2', name: 'Traje de Pajem Completo', description: 'Conjunto de calça, camisa e suspensório para o pajem.', category: 'noivas_criancas', image: 'https://i.postimg.cc/vH4B6LwM/pageboy-suit.png', price: 680.00 },

  // LILAS
  { id: 'lilas_item_m1', name: 'Suéter de Lã Lilás', description: 'Suéter macio em tom de lilás, adicionando cor ao guarda-roupa.', category: 'lilas_masculino_camisa', image: 'https://i.postimg.cc/pL4B3Yv4/lilas-sweater.png', price: 410.00 },
  { id: 'lilas_item_m2', name: 'Camisa de Botão Lavanda', description: 'Camisa social de algodão em um tom suave de lavanda.', category: 'lilas_masculino_camisa', image: 'https://i.postimg.cc/XvPKs1p7/lilas-shirt.png', price: 320.00 },
  { id: 'lilas_item_f1', name: 'Vestido Midi Lilás', description: 'Vestido de comprimento midi com tecido fluido, ideal para a primavera.', category: 'lilas_feminino_vestido', image: 'https://i.postimg.cc/k47tXvXy/lilas-dress.png', price: 680.00 },
  { id: 'lilas_item_f2', name: 'Bolsa de Ombro Acolchoada', description: 'Bolsa moderna em couro sintético lilás com alça de corrente.', category: 'lilas_feminino_acessorios', image: 'https://i.postimg.cc/PqjM9g8L/lilas-bag.png', price: 350.00 },
  { id: 'lilas_item_c1', name: 'Jaqueta Corta-vento Lilás', description: 'Jaqueta leve e estilosa para proteger as crianças do vento.', category: 'lilas_crianca_jaqueta', image: 'https://i.postimg.cc/zXk0y3S9/lilas-kid-jacket.png', price: 250.00 },
  { id: 'lilas_item_c2', name: 'Tênis Infantil Lilás', description: 'Tênis casual com detalhes em lilás, confortável para o dia a dia.', category: 'lilas_crianca_tenis', image: 'https://i.postimg.cc/J0bL4g3W/lilas-kid-shoes.png', price: 220.00 },

  // ADIDAS
  { id: 'adidas_item_m1', name: 'Agasalho Adidas Originals', description: 'Conjunto de agasalho icônico com as três listras.', category: 'adidas_masculino_fato', image: 'https://i.postimg.cc/mkb7m2jN/adidas-tracksuit.png', price: 599.99 },
  { id: 'adidas_item_m2', name: 'Tênis Adidas Samba OG', description: 'O clássico Samba, um ícone da moda urbana e do futebol.', category: 'adidas_masculino_tenis', image: 'https://i.postimg.cc/Wb8j6T7Y/adidas-samba.png', price: 699.99 },
  { id: 'adidas_item_f1', name: 'Legging de Treino 3-Stripes', description: 'Legging de alta sustentação, ideal para qualquer tipo de treino.', category: 'adidas_feminino_calca', image: 'https://i.postimg.cc/0j9YwP6T/adidas-leggings.png', price: 279.99 },
  { id: 'adidas_item_f2', name: 'Top Esportivo Don\'t Rest', description: 'Top de suporte médio com design costas nadador para liberdade de movimentos.', category: 'adidas_feminino_tshirt', image: 'https://i.postimg.cc/t453qgXk/adidas-bra.png', price: 199.99 },
  { id: 'adidas_item_c1', name: 'Conjunto Infantil Adidas', description: 'Conjunto de shorts e camiseta para os pequenos atletas.', category: 'adidas_crianca_fato', image: 'https://i.postimg.cc/L6D8W21m/adidas-kid-set.png', price: 249.99 },
  { id: 'adidas_item_c2', name: 'Tênis Superstar Infantil', description: 'A icônica biqueira shell-toe em uma versão para crianças.', category: 'adidas_crianca_tenis', image: 'https://i.postimg.cc/8PjT0qjS/adidas-kid-superstar.png', price: 329.99 },
];


// Dados fictícios para o feed
export const INITIAL_POSTS: Post[] = [
    {
        id: 'post_lv_squad',
        user: { name: 'louisvuitton', avatar: 'https://i.pravatar.cc/150?u=louisvuitton' },
        image: 'user-provided-image.png',
        items: [ITEMS[0], ITEMS[2]],
        likes: 1245,
        isLiked: false,
    },
    {
        id: 'post1',
        user: { name: 'camila_fashion', avatar: 'https://i.pravatar.cc/150?u=camila' },
        image: 'https://images.unsplash.com/photo-1617114912952-b436551b9b23?q=80&w=800&auto=format&fit=crop',
        items: [ITEMS[2]],
        likes: 134,
        isLiked: false,
    },
    {
        id: 'post2',
        user: { name: 'marco_style', avatar: 'https://i.pravatar.cc/150?u=marco' },
        image: 'https://images.unsplash.com/photo-1593032465267-e69b59a4ee35?q=80&w=800&auto=format&fit=crop',
        items: [ITEMS[1]],
        likes: 256,
        isLiked: true,
    },
     {
        id: 'post3',
        user: { name: 'julia_looks', avatar: 'https://i.pravatar.cc/150?u=julia' },
        image: 'https://images.unsplash.com/photo-1574201433653-54e7f3b6d39d?q=80&w=800&auto=format&fit=crop',
        items: [ITEMS[3]],
        likes: 89,
        isLiked: false,
    },
];

// Dados fictícios para stories
export const INITIAL_STORIES: Story[] = [
    {
        id: 'story1',
        user: { name: 'ana_couto', avatar: 'https://i.pravatar.cc/150?u=ana' },
        backgroundImage: 'https://images.unsplash.com/photo-1549237511-6b39ab502442?q=80&w=800',
    },
    {
        id: 'story2',
        user: { name: 'bruno_g', avatar: 'https://i.pravatar.cc/150?u=bruno' },
        backgroundImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800',
    },
    {
        id: 'story3',
        user: { name: 'carla_s', avatar: 'https://i.pravatar.cc/150?u=carla' },
        backgroundImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800',
    },
    {
        id: 'story4',
        user: { name: 'daniel_m', avatar: 'https://i.pravatar.cc/150?u=daniel' },
        backgroundImage: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?q=80&w=800',
    },
    {
        id: 'story5',
        user: { name: 'elisa_f', avatar: 'https://i.pravatar.cc/150?u=elisa' },
        backgroundImage: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800',
    },
    {
        id: 'story6',
        user: { name: 'felipe_r', avatar: 'https://i.pravatar.cc/150?u=felipe' },
        backgroundImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800',
    },
];
