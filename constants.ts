
import type { Category, Item, Post, Story, Conversation, CollaborationPost } from './types';

// Sub-categorias de Roupas reutilizáveis
// FIX: Exported constant arrays for use in other components.
export const MALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/fLHkb25Z/ICONS8.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

// FIX: Exported constant arrays for use in other components.
export const FEMALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/VLV716TV/Gemini_Generated_Image_1pwnnv1pwnnv1pwn.png' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/J0k2Vz7x/ICONS11.jpg' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/prdkxSjC/ICONS10.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

// FIX: Exported constant arrays for use in other components.
export const KID_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/fLHkb25Z/ICONS8.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/J0k2Vz7x/ICONS11.jpg' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/prdkxSjC/ICONS10.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

// NOVAS Sub-categorias para novos marketplaces
const DELICIAS_DA_LEANDRA_SUBCATEGORIES = [
    { id: 'bolos', name: 'Bolos', image: 'https://i.postimg.cc/L5BvGFbb/PHOTO-2025-07-14-23-58-55.jpg' },
];

const CLUB_S_SUBCATEGORIES = [
    { id: 'pratos', name: 'Pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini-Generated-Image-1eva5i1eva5i1eva-1.png' },
];

// NOVAS categorias para o painel do Vendedor
export const RESTAURANT_SHOP_CATEGORIES = [
    { id: 'pratos', name: 'Pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini-Generated-Image-1eva5i1eva5i1eva-1.png' },
    { id: 'sobremesas', name: 'Sobremesas', image: 'https://i.postimg.cc/L5BvGFbb/PHOTO-2025-07-14-23-58-55.jpg' },
    { id: 'bebidas', name: 'Bebidas', image: 'https://i.postimg.cc/tC39yWny/Gemini-Generated-Image-henwbohenwbohenw.png' },
];

export const SUPERMARKET_SHOP_CATEGORIES = [
    { id: 'mercearia', name: 'Mercearia', image: 'https://i.postimg.cc/15GyPwVS/Gemini-Generated-Image-euq60jeuq60jeuq6.png' },
    { id: 'padaria', name: 'Padaria', image: 'https://i.postimg.cc/VvB42PVh/PHOTO-2025-03-03-19-26-45.jpg' },
    { id: 'talho', name: 'Talho', image: 'https://i.postimg.cc/HsqHQjwp/Gemini-Generated-Image-sa7g1ysa7g1ysa7g.png' },
    { id: 'bebidas', name: 'Bebidas', image: 'https://i.postimg.cc/tC39yWny/Gemini-Generated-Image-henwbohenwbohenw.png' },
];

export const BEAUTY_SHOP_CATEGORIES = [
    { id: 'maquilhagem', name: 'Maquilhagem', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini-Generated-Image-fz7zo1fz7zo1fz7z.png' },
    { id: 'cabelo', name: 'Cabelo', image: 'https://i.postimg.cc/BvTqZFVN/Gemini-Generated-Image-3ps4k73ps4k73ps4.png' },
    { id: 'pele', name: 'Pele', image: 'https://i.postimg.cc/k5QnMSp1/Gemini-Generated-Image-a9r49ea9r49ea9r4.png' },
];

export const TECHNOLOGY_SHOP_CATEGORIES = [
    { id: 'telemoveis', name: 'Telemóveis', image: 'https://i.postimg.cc/ZKszJHKK/Gemini_Generated_Image_lrcnu0lrcnu0lrcn.png' },
    { id: 'computadores', name: 'Computadores', image: 'https://i.postimg.cc/rFZ2qjFs/Gemini_Generated_Image_uvwovcuvwovcuvwo.png' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/zvBNVxMw/louis-vuitton-1-1-millionaires-Z1165-E-PM2-Front-view.webp' },
];

// Helper para criar subcategorias com IDs únicos
const createSubCategories = (parentId: string, subCategories: {id: string, name: string, image: string}[]) => {
    return subCategories.map(sc => ({ ...sc, id: `${parentId}_${sc.id}` }));
};


// As categorias do mercado
export const CATEGORIES: Category[] = [
  { 
    id: 'lv', 
    name: 'Louis Vuitton', 
    image: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg',
    video: 'https://files.catbox.moe/ctk28a.mp4',
    type: 'fashion',
    subCategories: [
        { id: 'lv_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('lv_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('lv_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lv_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('lv_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'new_feeling',
    name: 'NEW FEELING',
    image: 'https://i.postimg.cc/P5K1G2Py/new.jpg',
    video: 'https://files.catbox.moe/joiet2.mp4',
    type: 'fashion',
    subCategories: [
        { id: 'nf_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('nf_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('nf_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('nf_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'noivas',
    name: 'Noivas',
    image: 'https://i.postimg.cc/G3vH75kZ/465687536-1138426001618419-59111119315795457782-n.jpg',
    type: 'fashion',
    subCategories: createSubCategories('noivas', FEMALE_CLOTHING_SUBCATEGORIES.filter(c => ['vestido', 'sapatos', 'acessorios'].includes(c.id)))
  },
  {
    id: 'lilas',
    name: 'Lilás',
    image: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    type: 'fashion',
    subCategories: createSubCategories('lilas', FEMALE_CLOTHING_SUBCATEGORIES)
  },
  {
    id: 'adidas',
    name: 'Adidas',
    image: 'https://i.postimg.cc/LXmdq4H2/D.jpg',
    type: 'fashion',
    subCategories: [
        { id: 'ad_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('ad_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'ad_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('ad_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
    ]
  },
  {
    id: 'restaurantes',
    name: 'Delicias da Leandra',
    image: 'https://i.postimg.cc/WzRfQnbd/Delicias-da-Leandra.jpg',
    type: 'restaurant',
    subCategories: createSubCategories('restaurantes', DELICIAS_DA_LEANDRA_SUBCATEGORIES)
  },
  {
    id: 'clubs',
    name: 'Club S',
    image: 'https://i.postimg.cc/Yq8BZhk2/Gemini-Generated-Image-dc3csmdc3csmdc3c.png',
    type: 'restaurant',
    subCategories: createSubCategories('clubs', CLUB_S_SUBCATEGORIES)
  },
  {
    id: 'supermercados',
    name: 'Kero',
    image: 'https://i.postimg.cc/15GyPwVS/Gemini-Generated-Image-euq60jeuq60jeuq6.png',
    type: 'supermarket',
    subCategories: [
        { id: 'supermercados_gasosa', name: 'Gasosa', image: 'https://i.postimg.cc/tC39yWny/Gemini-Generated-Image-henwbohenwbohenw.png' }
    ]
  },
  {
    id: 'beleza',
    name: 'Bonita',
    image: 'https://i.postimg.cc/k5QnMSp1/Gemini-Generated-Image-a9r49ea9r49ea9r4.png',
    type: 'beauty',
    subCategories: [
        { id: 'beleza_linda', name: 'Linda', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini-Generated-Image-fz7zo1fz7zo1fz7z.png' }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Apple',
    image: 'https://i.postimg.cc/rFZ2qjFs/Gemini_Generated_Image_uvwovcuvwovcuvwo.png',
    type: 'technology',
    subCategories: [
        { id: 'tecnologia_Iphone', name: 'Iphone', image: 'https://i.postimg.cc/ZKszJHKK/Gemini_Generated_Image_lrcnu0lrcnu0lrcn.png' }
    ]
  }
];

export const ITEMS: Item[] = [
    // Louis Vuitton - Feminino - Vestido
    { id: 'item3', name: 'Vestido de Gala LV', description: 'Vestido longo de seda para ocasiões especiais.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/k47jSjPj/vestido-lv-fem-1.jpg', price: 15000 },
    { id: 'item4', name: 'Vestido Casual Monograma', description: 'Vestido confortável para o dia a dia, com padrão monograma.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/C1QZ8L1k/vestido-lv-fem-2.jpg', price: 7500 },
    // NEW FEELING - Feminino - Saia
    { id: 'item5', name: 'Saia Jeans New Feeling', description: 'Saia jeans moderna e despojada.', category: 'nf_feminino_saia', image: 'https://i.postimg.cc/8z7xQ9WY/saia-nf-fem-1.jpg', price: 250 },
    { id: 'item6', name: 'Saia Plissada New Feeling', description: 'Saia plissada em tons pastel.', category: 'nf_feminino_saia', image: 'https://i.postimg.cc/J0vP8g1G/saia-nf-fem-2.jpg', price: 320 },
    // Adidas - Masculino - Tênis
    { id: 'item7', name: 'Adidas Ultraboost', description: 'Tênis de corrida com máximo conforto e retorno de energia.', category: 'ad_masculino_tenis', image: 'https://i.postimg.cc/Hnpy6yvK/tenis-ad-masc-1.jpg', price: 900 },
    { id: 'item8', name: 'Adidas Superstar', description: 'O clássico da Adidas com seu design icônico.', category: 'ad_masculino_tenis', image: 'https://i.postimg.cc/J0tL2y08/tenis-ad-masc-2.jpg', price: 450 },
    
    // Louis Vuitton - Masculino - Fato
    { id: 'item15', name: 'fato 1', description: 'Fato sofisticado da coleção Louis Vuitton.', category: 'lv_masculino_fato', image: 'https://i.postimg.cc/tg58WhFB/louis-vuitton-terno-pont-neuf-em-la-HQCF4-WAVD631-PM2-Front-view.webp', price: 20000 },
    { id: 'item16', name: 'fato 2', description: 'Fato sofisticado da coleção Louis Vuitton.', category: 'lv_masculino_fato', image: 'https://i.postimg.cc/cHkj509Y/louis-vuitton-terno-pont-neuf-em-mescla-de-la-HQCF4-WFOG900-PM2-Front-view.webp', price: 20000 },
    // Louis Vuitton - Masculino - Ténis
    { id: 'item20', name: 'ténis 1', description: 'Ténis exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 20000 },
    { id: 'item21', name: 'ténis 2', description: 'Ténis exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/66mJMLgS/louis-vuitton-tenis-lv-skate-BP9-U2-PMI92-PM2-Front-view.webp', price: 20000 },
    { id: 'item22', name: 'ténis 3', description: 'Ténis exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/xTNrhNSd/louis-vuitton-tenis-lv-skate-BR9-U1-PMI20-PM2-Front-view.webp', price: 20000 },
    { id: 'item23', name: 'ténis 4', description: 'Ténis exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/hjCWW9jX/louis-vuitton-tenis-lv-trainer-BSUPN8-GC52-PM2-Front-view.webp', price: 20000 },
    { id: 'item24', name: 'ténis 5', description: 'Ténis exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/KjRXZRkJ/louis-vuitton-tenis-lv-trainer-BTU017-MI01-PM2-Front-view.webp', price: 20000 },
    // Louis Vuitton - Masculino - Acessórios
    { id: 'item25', name: 'óculos 1', description: 'Óculos de sol de luxo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/zvBNVxMw/louis-vuitton-1-1-millionaires-Z1165-E-PM2-Front-view.webp', price: 20000 },
    { id: 'item26', name: 'óculos 2', description: 'Óculos de sol de luxo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/h4ygHqz2/louis-vuitton-oculos-de-sol-1-0-millionaires-Z2516-U-PM2-Front-view.webp', price: 20000 },
    { id: 'item27', name: 'óculos 3', description: 'Óculos de sol de luxo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/pXmxv1KR/louis-vuitton-oculos-de-sol-lv-match-Z1414-W-PM2-Front-view.webp', price: 20000 },
    { id: 'item28', name: 'óculos 4', description: 'Óculos de sol de luxo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/TYBx3qcm/louis-vuitton-oculos-de-sol-quadrados-lv-clash-Z1579-W-PM2-Front-view.webp', price: 20000 },
    { id: 'item29', name: 'óculos 5', description: 'Óculos de sol de luxo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/1zhyJcnP/louis-vuitton-oculos-de-sol-quadrados-lv-link-pm-Z1566-W-PM2-Front-view.webp', price: 20000 },
    { id: 'item30', name: 'óculos 6', description: 'Óculos de sol de luxo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/RhDBfc5k/louis-vuitton-oculos-de-sol-quadrados-lv-ocean-Z2207-U-PM2-Front-view.webp', price: 20000 },
    // Louis Vuitton - Masculino - Acessórios (Chapéus)
    { id: 'item-chapeu-1', name: 'Chapeu 1', description: 'Chapéu exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/wBQYFKYc/louis-vuitton-bone-lv-get-ready-M76505-PM2-Front-view.webp', price: 20000 },
    { id: 'item-chapeu-2', name: 'Chapeu 2', description: 'Chapéu exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/MTZ2FsWk/louis-vuitton-bone-lv-smash-M7608-L-PM2-Front-view.webp', price: 20000 },
    { id: 'item-chapeu-3', name: 'Chapeu 3', description: 'Chapéu exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/NjTc99Nn/louis-vuitton-bone-monogram-shadow-M76580-PM2-Front-view.webp', price: 20000 },
    { id: 'item-chapeu-4', name: 'Chapeu 4', description: 'Chapéu exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/j2W1pmm1/pngtree-brown-louis-vuitton-lv-polyester-mens-png-image-12912743.png', price: 20000 },
    // Louis Vuitton - Masculino - Acessórios (Rula/Relógios)
    { id: 'item-rula-1', name: 'rula 1', description: 'Relógio exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/cHd0NxBb/louis-vuitton-relogio-tambour-street-diver-chronograph-com-movimento-automatico-e-46-mm-de-diametro.webp', price: 20000 },
    { id: 'item-rula-2', name: 'rula 2', description: 'Relógio exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/0QZxkTt2/louis-vuitton-relogio-tambour-street-diver-chronograph-com-movimento-automatico-e-46-mm-de-diametro.webp', price: 20000 },
    { id: 'item-rula-3', name: 'rula 3', description: 'Relógio exclusivo da coleção Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/PqWTcpYD/louis-vuitton-relogio-tambour-street-diver-de-movimento-automatico-com-44-mm-de-diametro-em-aco-QA1.webp', price: 20000 },
    // Louis Vuitton - Masculino - Calça (NOVOS)
    { id: 'item-calca-1', name: 'calça 1', description: 'Calça de luxo da coleção Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/wTBFPX5K/louis-vuitton-calca-cigarrete-de-la-com-jacquard-damier-HSP61-WSMYMU1-PM2-Front-view.webp', price: 20000 },
    { id: 'item-calca-2', name: 'calça 2', description: 'Calça de luxo da coleção Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/mkmjkks6/louis-vuitton-calca-de-agasalho-em-tecido-tecnologico-com-monogram-estampado-HRP83-WMJW609-PM2-Front.webp', price: 20000 },
    { id: 'item-calca-3', name: 'calça 3', description: 'Calça de luxo da coleção Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/SQdDDTM7/louis-vuitton-calca-de-couro-damier-HQL60-EBQV822-PM2-Front-view.webp', price: 20000 },
    { id: 'item-calca-4', name: 'calça 4', description: 'Calça de luxo da coleção Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/W1tdQn1k/dddd.webp', price: 20000 },
    { id: 'item-calca-5', name: 'calça 5', description: 'Calça de luxo da coleção Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/R09jWPJ3/louis-vuitton-fleece-jogpants-HQY22-WDFXMU1-PM2-Front-view.webp', price: 20000 },
    { id: 'item-calca-6', name: 'calça 6', description: 'Calça de luxo da coleção Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/76ZdVfVw/louis-vuitton-calca-em-jacquard-damoflage-HSN93-WTMJ900-PM2-Front-view.webp', price: 20000 },
    // Louis Vuitton - Masculino - Jaqueta
    { id: 'item-jaqueta-1', name: 'jaqueta 1', description: 'Jaqueta exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/MZ4N7ZjJ/louis-vuitton-jaqueta-de-couro-damier-HSL90-ETAHMU1-PM2-Front-view.webp', price: 20000 },
    { id: 'item-jaqueta-2', name: 'jaqueta 2', description: 'Jaqueta exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/QMC3DCnK/louis-vuitton-jaqueta-safari-chic-com-gola-de-couro-HSB73-WRJV851-PM2-Front-view.webp', price: 20000 },
    { id: 'item-jaqueta-3', name: 'jaqueta 3', description: 'Jaqueta exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/VNG5vQGQ/louis-vuitton-jaqueta-de-baseball-em-nylon-bordado--HSB75WGPD900_PM2_Front_view.webp', price: 20000 },
    // Louis Vuitton - Masculino - T-shirt (NOVOS)
    { id: 'item-tshirt-1', name: 't-shirt 1', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/TPR4dpBg/louis-vuitton-camiseta-de-algodao-bordada-HTY18-WNPG651-PM2-Front-view.webp', price: 10000 },
    { id: 'item-tshirt-2', name: 't-shirt 2', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/6pVPxdbB/Louis-Vuitton-LV-Monogram-Gradient-Black-White-T-Shirt-Crepslocker-Front-1.webp', price: 10000 },
    { id: 'item-tshirt-3', name: 't-shirt 3', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/SKJkZXrc/blue-front-t-shirt-free-png.webp', price: 10000 },
    { id: 'item-tshirt-4', name: 't-shirt 4', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/k5BqjVc2/louis-vuitton-camisa-polo-de-manga-curta-em-algodao-com-assinatura-bordada--HNY58WJ6422C_PM2_Front_v.webp', price: 10000 },
    { id: 'item-tshirt-5', name: 't-shirt 5', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/KYRx9KNk/louis-vuitton-camiseta-com-monogram-e-listras--FOTS37TR1522_PM2_Front_view.webp', price: 10000 },
    { id: 'item-tshirt-6', name: 't-shirt 6', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/8zyTBdhW/louis-vuitton-camiseta-de-manga-curta-em-algodao-damier-com-patch-lv-em-cristais--HQN63WAUR816_PM2_F.webp', price: 10000 },
    { id: 'item-tshirt-7', name: 't-shirt 7', description: 'T-shirt exclusiva da coleção Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/7ZPx2tTH/louis-vuitton-camiseta-com-monogram-e-listras--FOTS37TR1613_PM2_Front_view.webp', price: 10000 },
    
    // Louis Vuitton - Feminino - Calça (NOVOS)
    { id: 'item-fem-calca-1', name: 'Calça 1', description: 'Calça feminina exclusiva Louis Vuitton.', category: 'lv_feminino_calca', image: 'https://i.postimg.cc/vmvHs3bK/Gemini_Generated_Image_vapl0avapl0avapl.png', price: 20000 },
    { id: 'item-fem-calca-2', name: 'Calça 2', description: 'Calça feminina exclusiva Louis Vuitton.', category: 'lv_feminino_calca', image: 'https://i.postimg.cc/s2JDrws8/Gemini_Generated_Image_rf67ahrf67ahrf67.png', price: 20000 },
    { id: 'item-fem-calca-3', name: 'Calça 3', description: 'Calça feminina exclusiva Louis Vuitton.', category: 'lv_feminino_calca', image: 'https://i.postimg.cc/d0FtpzcY/Gemini_Generated_Image_ojq8ngojq8ngojq8.png', price: 20000 },
    { id: 'item-fem-calca-4', name: 'Calça 4', description: 'Calça feminina exclusiva Louis Vuitton.', category: 'lv_feminino_calca', image: 'https://i.postimg.cc/6QK5gDJD/Gemini_Generated_Image_k5xewpk5xewpk5xe.png', price: 20000 },

    // Louis Vuitton - Feminino - Jaqueta (NOVOS)
    { id: 'item-fem-jaqueta-1', name: 'jaqueta', description: 'Jaqueta feminina exclusiva Louis Vuitton.', category: 'lv_feminino_jaqueta', image: 'https://i.postimg.cc/PJvjP4nQ/Gemini_Generated_Image_80r5ki80r5ki80r5.png', price: 20000 },
    { id: 'item-fem-jaqueta-2', name: 'jaqueta 2', description: 'Jaqueta feminina exclusiva Louis Vuitton.', category: 'lv_feminino_jaqueta', image: 'https://i.postimg.cc/fySNJKQc/Gemini_Generated_Image_binoenbinoenbino.png', price: 20000 },

    // Noivas - Vestido (NOVOS)
    { id: 'noivas-vestido-nova-1', name: 'nova 1', description: 'Vestido de noiva exclusivo.', category: 'noivas_vestido', image: 'https://i.postimg.cc/G2z4DQWx/Gemini_Generated_Image_2650mg2650mg2650-Photoroom.png', price: 20000 },
    { id: 'noivas-vestido-nova-2', name: 'nova 2', description: 'Vestido de noiva exclusivo.', category: 'noivas_vestido', image: 'https://i.postimg.cc/26Cq3JKV/Gemini_Generated_Image_a1effta1effta1ef-Photoroom.png', price: 20000 },
    { id: 'noivas-vestido-nova-3', name: 'nova 3', description: 'Vestido de noiva exclusivo.', category: 'noivas_vestido', image: 'https://i.postimg.cc/26T1WwsW/Gemini_Generated_Image_ft6rlgft6rlgft6r-Photoroom.png', price: 20000 },
    { id: 'noivas-vestido-nova-4', name: 'nova 4', description: 'Vestido de noiva exclusivo.', category: 'noivas_vestido', image: 'https://i.postimg.cc/hjKJhw5h/Gemini_Generated_Image_mo1c0dmo1c0dmo1c-Photoroom.png', price: 20000 },
    { id: 'noivas-vestido-nova-5', name: 'nova 5', description: 'Vestido de noiva exclusivo.', category: 'noivas_vestido', image: 'https://i.postimg.cc/W3sDtKHF/Gemini_Generated_Image_yy6m84yy6m84yy6m-Photoroom.png', price: 20000 },
    { id: 'noivas-vestido-nova-6', name: 'nova 6', description: 'Vestido de noiva exclusivo.', category: 'noivas_vestido', image: 'https://i.postimg.cc/sXKMWckP/Gemini_Generated_Image_z8z8hwz8z8hwz8z8-Photoroom.png', price: 20000 },

    // NEW FEELING - Masculino - Fato (NOVOS)
    { id: 'nf-masc-fato-1', name: 'fato 1', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/TwNdQgN6/Gemini_Generated_Image_1tdh7l1tdh7l1tdh.png', price: 20000 },
    { id: 'nf-masc-fato-2', name: 'fato 2', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/s2XDWTKD/Gemini_Generated_Image_6o1rfi6o1rfi6o1r.png', price: 20000 },
    { id: 'nf-masc-fato-3', name: 'fato 3', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/T2ZL6v00/Gemini_Generated_Image_atk1gxatk1gxatk1.png', price: 20000 },
    { id: 'nf-masc-fato-4', name: 'fato 4', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/8C5PvZwz/Gemini_Generated_Image_c9tbmfc9tbmfc9tb.png', price: 20000 },
    { id: 'nf-masc-fato-5', name: 'fato 5', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/mDpLVCXj/Gemini_Generated_Image_doczjodoczjodocz.png', price: 20000 },
    { id: 'nf-masc-fato-6', name: 'fato 6', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/fRWw4H4N/Gemini_Generated_Image_eklfymeklfymeklf.png', price: 20000 },
    { id: 'nf-masc-fato-7', name: 'fato 7', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/K89mmnFk/Gemini_Generated_Image_fl36ccfl36ccfl36.png', price: 20000 },
    { id: 'nf-masc-fato-8', name: 'fato 8', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/ZRsbjp77/Gemini_Generated_Image_hhn23xhhn23xhhn2.png', price: 20000 },
    { id: 'nf-masc-fato-9', name: 'fato 9', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/FHx73d4T/Gemini_Generated_Image_k41u7k41u7k41u7k.png', price: 20000 },
    { id: 'nf-masc-fato-10', name: 'fato 10', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/9F5MktFH/Gemini_Generated_Image_lwcaqelwcaqelwca.png', price: 20000 },
    { id: 'nf-masc-fato-11', name: 'fato 11', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/nV6jJfTn/Gemini_Generated_Image_px3v72px3v72px3v.png', price: 20000 },
    { id: 'nf-masc-fato-12', name: 'fato 12', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/8zyTThDL/Gemini_Generated_Image_qlzuojqlzuojqlzu.png', price: 20000 },
    { id: 'nf-masc-fato-13', name: 'fato 13', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/2STS3sQM/Gemini_Generated_Image_wyvwfkwyvwfkwyvw.png', price: 20000 },
    { id: 'nf-masc-fato-14', name: 'fato 14', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/gkWzszNX/Gemini_Generated_Image_xz80sqxz80sqxz80.png', price: 20000 },
    { id: 'nf-masc-fato-15', name: 'fato 15', description: 'Fato New Feeling elegante.', category: 'nf_masculino_fato', image: 'https://i.postimg.cc/XYgpdGbm/Gemini_Generated_Image_z8b2jmz8b2jmz8b2.png', price: 20000 },

    // NEW FEELING - Feminino - Fato (NOVOS)
    { id: 'nf-fem-fato-1', name: 'fato 1', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/VLV716TV/Gemini_Generated_Image_1pwnnv1pwnnv1pwn.png', price: 20000 },
    { id: 'nf-fem-fato-2', name: 'fato 2', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/bvHHGNCq/Gemini_Generated_Image_2tecl32tecl32tec.png', price: 20000 },
    { id: 'nf-fem-fato-3', name: 'fato 3', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/YqsXk9VJ/Gemini_Generated_Image_6qse8k6qse8k6qse.png', price: 20000 },
    { id: 'nf-fem-fato-4', name: 'fato 4', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/9FMxvTxx/Gemini_Generated_Image_7ejw87ejw87ejw87.png', price: 20000 },
    { id: 'nf-fem-fato-5', name: 'fato 5', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/SxLzd1WV/Gemini_Generated_Image_7rc39w7rc39w7rc3.png', price: 20000 },
    { id: 'nf-fem-fato-6', name: 'fato 6', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/GpJJBh7B/Gemini_Generated_Image_8ha8yr8ha8yr8ha8.png', price: 20000 },
    { id: 'nf-fem-fato-7', name: 'fato 7', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/GpJJBh7B/Gemini_Generated_Image_8ha8yr8ha8yr8ha8.png', price: 20000 },
    { id: 'nf-fem-fato-8', name: 'fato 8', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/ZKGrVyXJ/Gemini_Generated_Image_9k2r799k2r799k2r.png', price: 20000 },
    { id: 'nf-fem-fato-9', name: 'fato 9', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/gkCvN61W/Gemini_Generated_Image_ae45k6ae45k6ae45.png', price: 20000 },
    { id: 'nf-fem-fato-10', name: 'fato 10', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/L6byRX7y/Gemini_Generated_Image_g00297g00297g002.png', price: 20000 },
    { id: 'nf-fem-fato-12', name: 'fato 12', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/dQSRZfB2/Gemini_Generated_Image_h04of5h04of5h04o.png', price: 20000 },
    { id: 'nf-fem-fato-13', name: 'fato 13', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/yNXXJYQd/Gemini_Generated_Image_i98uani98uani98u.png', price: 20000 },
    { id: 'nf-fem-fato-14', name: 'fato 14', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/JhW54Bqm/Gemini_Generated_Image_ijzvs1ijzvs1ijzv.png', price: 20000 },
    { id: 'nf-fem-fato-15', name: 'fato 15', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/JhW54Bqm/Gemini_Generated_Image_ijzvs1ijzvs1ijzv.png', price: 20000 },
    { id: 'nf-fem-fato-16-a', name: 'fato 16', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/t4dVkvhd/Gemini_Generated_Image_x7t4s5x7t4s5x7t4.png', price: 20000 },
    { id: 'nf-fem-fato-16-b', name: 'fato 16', description: 'Fato feminino New Feeling.', category: 'nf_feminino_fato', image: 'https://i.postimg.cc/sf0PGLc8/Gemini_Generated_Image_vsge8jvsge8jvsge.png', price: 20000 },

    // NOVOS ITENS DE NOVAS CATEGORias
    // Delicias da Leandra - Bolos
    { id: 'item-bolo-1', name: 'Bolo 1', description: 'Bolo artesanal delicioso, feito com ingredientes frescos.', category: 'restaurantes_bolos', image: 'https://i.postimg.cc/L5BvGFbb/PHOTO-2025-07-14-23-58-55.jpg', price: 20000 },
    { id: 'item-bolo-2', name: 'Bolo 2', description: 'Bolo de festa espetacular para celebrar momentos especiais.', category: 'restaurantes_bolos', image: 'https://i.postimg.cc/VvB42PVh/PHOTO-2025-03-03-19-26-45.jpg', price: 100000 },
    // Club S - Pratos
    { id: 'item-prato-1', name: 'prato 1', description: 'Prato delicioso do Club S.', category: 'clubs_pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini-Generated-Image-1eva5i1eva5i1eva-1.png', price: 20000 },
    { id: 'item-prato-2', name: 'prato 2', description: 'Prato especial do Club S.', category: 'clubs_pratos', image: 'https://i.postimg.cc/HsqHQjwp/Gemini-Generated-Image-sa7g1ysa7g1ysa7g.png', price: 100000 },
    // Kero - Gasosa
    { id: 'item-kero-gasosa-1', name: 'produ 1', description: 'Produto de qualidade do Kero.', category: 'supermercados_gasosa', image: 'https://i.postimg.cc/tC39yWny/Gemini-Generated-Image-henwbohenwbohenw.png', price: 20000 },
    { id: 'item-kero-gasosa-2', name: 'produ 2', description: 'Produto exclusivo do Kero.', category: 'supermercados_gasosa', image: 'https://i.postimg.cc/28QCmhLC/Gemini-Generated-Image-uei117uei117uei1.png', price: 100000 },
    // Bonita - Linda (UPDATED FOR VIRTUAL TRY-ON)
    { 
      id: 'item-beleza-linda-1',
      name: 'Batom Vermelho Intenso',
      description: 'Batom vermelho vibrante com acabamento matte para um look poderoso.',
      category: 'beleza_linda',
      image: 'https://i.postimg.cc/YS6p2Fsd/Gemini-Generated-Image-fz7zo1fz7zo1fz7z.png',
      price: 150,
      isTryOn: true,
      beautyType: 'lipstick'
    },
    {
      id: 'item-beleza-linda-2',
      name: 'Peruca Loira Ondulada',
      description: 'Peruca loira com ondas naturais e aparência realista para uma mudança de visual instantânea.',
      category: 'beleza_linda',
      image: 'https://i.postimg.cc/BvTqZFVN/Gemini-Generated-Image-3ps4k73ps4k73ps4.png',
      price: 1200,
      isTryOn: true,
      beautyType: 'wig'
    },
    {
      id: 'item-beleza-linda-3',
      name: 'Sombra Noite Estrelada',
      description: 'Paleta de sombras com tons escuros e brilhantes para um olhar marcante.',
      category: 'beleza_linda',
      image: 'https://i.postimg.cc/J0bJbJgQ/Gemini-Generated-Image-2.png',
      price: 250,
      isTryOn: true,
      beautyType: 'eyeshadow'
    },
    // Bonita - Linda (NEW ITEMS)
    { 
      id: 'item-beleza-linda-4',
      name: 'linda 3',
      description: 'Produto de beleza exclusivo da coleção Linda.',
      category: 'beleza_linda',
      image: 'https://i.postimg.cc/KzkGMFnR/Gemini_Generated_Image_bn4paxbn4paxbn4p.png',
      price: 20000,
      isTryOn: true,
    },
    { 
      id: 'item-beleza-linda-5',
      name: 'linda 4',
      description: 'Produto de beleza exclusivo da coleção Linda.',
      category: 'beleza_linda',
      image: 'https://i.postimg.cc/PxpXwhmN/Gemini_Generated_Image_tmnkkttmnkkttmnk.png',
      price: 20000,
      isTryOn: true,
    },
    { 
      id: 'item-beleza-linda-6',
      name: 'linda 5',
      description: 'Produto de beleza exclusivo da coleção Linda.',
      category: 'beleza_linda',
      image: 'https://i.postimg.cc/dQCQQssX/Gemini_Generated_Image_ngmtkengmtkengmt.png',
      price: 20000,
      isTryOn: true,
    },
    // Apple - Iphone
    { id: 'item-tec-iphone-1', name: 'Iphone 1', description: 'Iphone exclusivo da Apple.', category: 'tecnologia_Iphone', image: 'https://i.postimg.cc/ZKszJHKK/Gemini_Generated_Image_lrcnu0lrcnu0lrcn.png', price: 20000 },
    { id: 'item-tec-iphone-2', name: 'Iphone 2', description: 'Iphone exclusivo da Apple.', category: 'tecnologia_Iphone', image: 'https://i.postimg.cc/ncSfn2cL/Gemini_Generated_Image_c2upgec2upgec2up.png', price: 100000 },
];

export const INITIAL_STORIES: Story[] = [
  { id: 'story1', user: { name: 'Camila', avatar: 'https://i.pravatar.cc/150?u=camila' }, backgroundImage: 'https://i.postimg.cc/P5K1G2Py/new.jpg' },
  { id: 'story2', user: { name: 'Juliana', avatar: 'https://i.pravatar.cc/150?u=juliana' }, backgroundImage: 'https://i.postimg.cc/fT8G07T7/lilas.jpg' },
  { id: 'story3', user: { name: 'Lucas', avatar: 'https://i.pravatar.cc/150?u=lucas' }, backgroundImage: 'https://i.postimg.cc/6pBH2ygx/adidas.jpg' },
  { id: 'story4', user: { name: 'Mariana', avatar: 'https://i.pravatar.cc/150?u=mariana' }, backgroundImage: 'https://i.postimg.cc/Y0dZ2hRz/noiva.jpg' },
];

export const INITIAL_POSTS: Post[] = [
    {
        id: 'post1',
        user: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara' },
        image: 'https://i.postimg.cc/nzdDSLvZ/meu-estilo-look-9.png',
        items: [ITEMS[0]], // Vestido de Gala LV
        likes: 1250,
        isLiked: false,
        comments: [
            { id: 'c1-1', user: { id: 'user2', name: 'Bruno Gomes', avatar: 'https://i.pravatar.cc/150?u=bruno' }, text: 'Uau, que vestido lindo!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: 'c1-2', user: { id: 'user3', name: 'Carla Dias', avatar: 'https://i.pravatar.cc/150?u=carla' }, text: 'Amei a cor!', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: 'c1-3', user: { id: 'user4', name: 'Daniel Alves', avatar: 'https://i.pravatar.cc/150?u=daniel' }, text: 'Perfeita!', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        ],
        commentCount: 3,
        caption: 'Um dia especial pede um look especial! ✨',
    },
    {
        id: 'post2',
        user: { id: 'user2', name: 'Bruno Gomes', avatar: 'https://i.pravatar.cc/150?u=bruno' },
        image: 'https://i.postimg.cc/PxhsxmFf/meu-estilo-look-12.png',
        items: [ITEMS[4]], // Adidas Ultraboost
        likes: 850,
        isLiked: true,
        comments: [
            { id: 'c2-1', user: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara' }, text: 'Esse ténis é super confortável!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
        ],
        commentCount: 1,
        caption: 'Correndo com estilo. Conforto é tudo.',
    },
    {
        id: 'post3',
        user: { id: 'user3', name: 'Carla Dias', avatar: 'https://i.pravatar.cc/150?u=carla' },
        image: 'https://i.postimg.cc/mk2v3Ts0/meu-estilo-look-13.png',
        items: [ITEMS[2]], // Saia Jeans New Feeling
        likes: 2300,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: 'Adoro o estilo despojado desta saia.',
    },
    {
        id: 'post4',
        user: { id: 'user4', name: 'Daniel Alves', avatar: 'https://i.pravatar.cc/150?u=daniel' },
        image: 'https://i.postimg.cc/vTc6Jdzn/meu-estilo-look.png',
        items: [ITEMS[30]], // Updated index for item-tshirt-1 due to removals and additions
        likes: 980,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: 'Vibes casuais hoje.',
    },
    {
        id: 'post6',
        user: { id: 'user5', name: 'Eduarda Lima', avatar: 'https://i.pravatar.cc/150?u=eduarda' },
        image: 'https://i.postimg.cc/T3mn2fXq/meu-estilo-look-5.png',
        items: [ITEMS[1]], // Vestido Casual Monograma
        likes: 1800,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: 'Simples e elegante.',
    },
     {
        id: 'post7',
        user: { id: 'user2', name: 'Bruno Gomes', avatar: 'https://i.pravatar.cc/150?u=bruno' },
        image: 'https://i.postimg.cc/bJYnRnS3/meu-estilo-look-6.png',
        items: [ITEMS[5]], // Adidas Superstar
        likes: 4200,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: 'Um clássico nunca sai de moda.',
    },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        participant: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara' },
        lastMessage: {
            id: 'msg1',
            text: 'Olá! Adorei seu último look, ficou incrível!',
            senderId: 'user1',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        },
        unreadCount: 1,
    },
    {
        id: 'conv2',
        participant: { id: 'user2', name: 'Bruno Gomes', avatar: 'https://i.pravatar.cc/150?u=bruno' },
        lastMessage: {
            id: 'msg2',
            text: 'Com certeza! Te vejo lá.',
            senderId: 'currentUser', // Mock current user
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        unreadCount: 0,
    },
];

// DADOS PARA VENDEDOR
export const INITIAL_VENDOR_ITEMS: Item[] = [
    { id: 'vendor-item-1', name: 'T-shirt Gráfica Exclusiva', description: 'T-shirt de algodão com estampa exclusiva.', category: 'vendor-items', image: 'https://i.postimg.cc/TPR4dpBg/louis-vuitton-camiseta-de-algodao-bordada-HTY18-WNPG651-PM2-Front-view.webp', price: 350, gender: 'male', vendorSubCategory: 'tshirt' },
    { id: 'vendor-item-2', name: 'Calça Cargo Techwear', description: 'Calça cargo com múltiplos bolsos e tecido tecnológico.', category: 'vendor-items', image: 'https://i.postimg.cc/W1tdQn1k/dddd.webp', price: 890, gender: 'male', vendorSubCategory: 'calca' },
    { id: 'vendor-item-3', name: 'Ténis Urbano V2', description: 'Ténis para o dia a dia com design moderno.', category: 'vendor-items', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 1250, gender: 'male', vendorSubCategory: 'tenis' },
    { id: 'vendor-item-4', name: 'Jaqueta Corta-vento', description: 'Jaqueta leve e resistente ao vento.', category: 'vendor-items', image: 'https://i.postimg.cc/W1cyy9n9/louis-vuitton-paleto-pont-neuf-de-la-HRFJ8-EDLG60-D-PM2-Front-view.png', price: 720, gender: 'male', vendorSubCategory: 'jaqueta' },
    { id: 'vendor-item-5', name: 'Saia Plissada New Feeling', description: 'Saia plissada em tons pastel.', category: 'vendor-items', image: 'https://i.postimg.cc/J0vP8g1G/saia-nf-fem-2.jpg', price: 320, gender: 'female', vendorSubCategory: 'saia' },
    { id: 'vendor-item-6', name: 'Vestido Estampado Floral', description: 'Vestido leve para o verão.', category: 'vendor-items', image: 'https://i.postimg.cc/J0k2Vz7x/ICONS11.jpg', price: 550, gender: 'female', vendorSubCategory: 'vestido' },
    { id: 'vendor-item-7', name: 'T-shirt Infantil Dino', description: 'T-shirt divertida com estampa de dinossauro.', category: 'vendor-items', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg', price: 150, gender: 'kid', vendorSubCategory: 'tshirt' },
    { id: 'vendor-item-8', name: 'Calça Jeans Infantil', description: 'Calça jeans confortável para crianças.', category: 'vendor-items', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg', price: 250, gender: 'kid', vendorSubCategory: 'calca' },
];

export const VENDOR_POSTS: Post[] = [
     {
        id: 'vendor-post1',
        user: { id: 'business-user-1', name: 'NEW FEELING', avatar: 'https://i.postimg.cc/P5K1G2Py/new.jpg' },
        image: 'https://i.postimg.cc/T3mn2fXq/meu-estilo-look-5.png',
        items: [INITIAL_VENDOR_ITEMS[0], INITIAL_VENDOR_ITEMS[1]],
        likes: 1800,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: "Nossa nova coleção urbana já está disponível!",
    },
    {
        id: 'vendor-post2',
        user: { id: 'business-user-1', name: 'NEW FEELING', avatar: 'https://i.postimg.cc/P5K1G2Py/new.jpg' },
        image: 'https://i.postimg.cc/mk2v3Ts0/meu-estilo-look-13.png',
        items: [INITIAL_VENDOR_ITEMS[4]],
        likes: 2300,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: "A saia perfeita para qualquer ocasião.",
    }
];

export const INITIAL_COLLABORATION_REQUESTS: CollaborationPost[] = [
    {
        id: 'collab1',
        influencer: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara' },
        businessId: 'business-user-1',
        postId: 'post5', // This ID is kept for historical data but might not render if post is removed from feed
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
        id: 'collab2',
        influencer: { id: 'user2', name: 'Bruno Gomes', avatar: 'https://i.pravatar.cc/150?u=bruno' },
        businessId: 'business-user-1',
        postId: 'post7', // Post do Adidas Superstar
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
        id: 'collab3',
        influencer: { id: 'user3', name: 'Carla Dias', avatar: 'https://i.pravatar.cc/150?u=carla' },
        businessId: 'business-user-1',
        postId: 'post3', // Post da Saia Jeans
        status: 'approved',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    }
];

export const FASHION_MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2d01d690f7.mp3';
