

import type { Category, Item, Post, Story, Conversation, CollaborationPost } from './types';

// Sub-categorias de Roupas reutilizáveis
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

export const FEMALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/VLV716TV/Gemini_Generated_Image_1pwnnv1pwnnv1pwn.png' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'saia', name: 'Saia', image: 'https://i.postimg.cc/B6Nf5VcY/Gemini_Generated_Image_4ugkqh4ugkqh4ugk.png' },
    { id: 'vestido', name: 'Vestido', image: 'https://i.postimg.cc/rmg2GPCb/Gemini_Generated_Image_x48n1sx48n1sx48n.png' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

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
    { id: 'pratos', name: 'Pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini_Generated_Image_1eva5i1eva5i1eva-1.png' },
];

// NOVAS categorias para o painel do Vendedor
export const RESTAURANT_SHOP_CATEGORIES = [
    { id: 'pratos', name: 'Pratos', image: 'https://i.postimg.cc/XYJ6b4NT/Gemini_Generated_Image_1eva5i1eva5i1eva-1.png' },
    { id: 'sobremesas', name: 'Sobremesas', image: 'https://i.postimg.cc/L5BvGFbb/PHOTO-2025-07-14-23-58-55.jpg' },
    { id: 'bebidas', name: 'Bebidas', image: 'https://i.postimg.cc/tC39yWny/Gemini_Generated_Image_henwbohenwbohenw.png' },
];

export const SUPERMARKET_SHOP_CATEGORIES = [
    { id: 'mercearia', name: 'Mercearia', image: 'https://i.postimg.cc/15GyPwVS/Gemini_Generated_Image_euq60jeuq60jeuq6.png' },
    { id: 'padaria', name: 'Padaria', image: 'https://i.postimg.cc/VvB42PVh/PHOTO-2025-03-03-19-26-45.jpg' },
    { id: 'talho', name: 'Talho', image: 'https://i.postimg.cc/HsqHQjwp/Gemini_Generated_Image_sa7g1ysa7g1ysa7g.png' },
    { id: 'bebidas', name: 'Bebidas', image: 'https://i.postimg.cc/tC39yWny/Gemini_Generated_Image_henwbohenwbohenw.png' },
    { id: 'decoracao', name: 'Decoração', image: 'https://i.postimg.cc/VLdTbJVz/pngtree_armchair_isolated_on_white_background_png_image_2770873_Photoroom.png' },
];

export const BEAUTY_SHOP_CATEGORIES = [
    { id: 'maquilhagem', name: 'Maquilhagem', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini_Generated_Image_fz7zo1fz7zo1fz7z.png' },
    { id: 'cabelo', name: 'Cabelo', image: 'https://i.postimg.cc/BvTqZFVN/Gemini_Generated_Image_3ps4k73ps4k73ps4.png' },
    { id: 'pele', name: 'Pele', image: 'https://i.postimg.cc/k5QnMSp1/Gemini_Generated_Image_a9r49ea9r49ea9r4.png' },
    { id: 'peruca', name: 'Peruca', image: 'https://i.postimg.cc/6Q1TQDHK/81e_CCdc_Mv_ZL_SL1500.jpg' },
    { id: 'makeup', name: 'Makeup', image: 'https://i.postimg.cc/Hx3xYJvP/469854347_597462169307087_8299951859133309802_n.jpg' },
];

export const TECHNOLOGY_SHOP_CATEGORIES = [
    { id: 'telemoveis', name: 'Telemóveis', image: 'https://i.postimg.cc/ZKszJHKK/Gemini_Generated_Image_lrcnu0lrcnu0lrcn.png' },
    { id: 'computadores', name: 'Computadores', image: 'https://i.postimg.cc/rFZ2qjFs/Gemini_Generated_Image_uvwovcuvwovcuvwo.png' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/zvBNVxMw/louis-vuitton-1-1-millionaires-Z1165-E-PM2-Front-view.webp' },
];

const createSubCategories = (parentId: string, subCategories: {id: string, name: string, image: string}[]) => {
    return subCategories.map(sc => ({ ...sc, id: `${parentId}_${sc.id}` }));
};

export const CATEGORIES: Category[] = [
  { 
    id: 'lv', 
    name: 'Louis Vuitton', 
    image: 'https://i.postimg.cc/xCknv8vV/pexels-rdne-6224633.jpg',
    video: 'https://files.catbox.moe/ctk28a.mp4',
    type: 'fashion',
    subCategories: [
        { id: 'lv_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('lv_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { 
            id: 'lv_feminino', 
            name: 'Feminino', 
            image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', 
            subCategories: createSubCategories('lv_feminino', FEMALE_CLOTHING_SUBCATEGORIES) 
        },
        { id: 'lv_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('lv_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'new_feeling',
    name: 'NEW FEELING',
    image: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png',
    video: 'https://files.catbox.moe/joiet2.mp4',
    type: 'fashion',
    subCategories: [
        { id: 'nf_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('nf_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { 
            id: 'nf_feminino', 
            name: 'Feminino', 
            image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', 
            subCategories: createSubCategories('nf_feminino', FEMALE_CLOTHING_SUBCATEGORIES) 
        },
        { id: 'nf_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('nf_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'noivas',
    name: 'Noivas',
    image: 'https://i.postimg.cc/G3vH75kZ/465687536-1138426001618419-59111119315795457782-n.jpg',
    type: 'fashion',
    subCategories: [
        { id: 'noivas_vestido', name: 'Vestido', image: 'https://i.postimg.cc/gkPXMMRL/noivas.png' },
        { id: 'noivas_sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
        { id: 'noivas_acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' }
    ]
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
    id: 'lilas',
    name: 'Lilás',
    image: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    type: 'fashion',
    subCategories: createSubCategories('lilas', FEMALE_CLOTHING_SUBCATEGORIES)
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
    image: 'https://i.postimg.cc/Yq8BZhk2/Gemini_Generated_Image_dc3csmdc3csmdc3c.png',
    type: 'restaurant',
    subCategories: createSubCategories('clubs', CLUB_S_SUBCATEGORIES)
  },
  {
    id: 'supermercados',
    name: 'Kero',
    image: 'https://i.postimg.cc/15GyPwVS/Gemini_Generated_Image_euq60jeuq60jeuq6.png',
    type: 'supermarket',
    subCategories: [
        { id: 'supermercados_gasosa', name: 'Gasosa', image: 'https://i.postimg.cc/tC39yWny/Gemini_Generated_Image_henwbohenwbohenw.png' },
        { id: 'supermercados_decoracao', name: 'Decoração', image: 'https://i.postimg.cc/VLdTbJVz/pngtree_armchair_isolated_on_white_background_png_image_2770873_Photoroom.png' }
    ]
  },
  {
    id: 'beleza',
    name: 'Bonita',
    image: 'https://i.postimg.cc/k5QnMSp1/Gemini_Generated_Image_a9r49ea9r49ea9r4.png',
    type: 'beauty',
    subCategories: [
        { id: 'beleza_linda', name: 'Linda', image: 'https://i.postimg.cc/YS6p2Fsd/Gemini_Generated_Image_fz7zo1fz7zo1fz7z.png' },
        { id: 'beleza_peruca', name: 'Peruca', image: 'https://i.postimg.cc/6Q1TQDHK/81e_CCdc_Mv_ZL_SL1500.jpg' },
        { id: 'beleza_makeup', name: 'Makeup', image: 'https://i.postimg.cc/Hx3xYJvP/469854347_597462169307087_8299951859133309802_n.jpg' }
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
    { id: 'item3', name: 'Vestido de Gala LV', description: 'Vestido longo de seda.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/k47jSjPj/vestido-lv-fem-1.jpg', price: 15000, recommendationVideo: 'https://files.catbox.moe/ctk28a.mp4' },
    { id: 'item4', name: 'Vestido Casual Monograma', description: 'Vestido confortável para o dia a dia.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/C1QZ8L1k/vestido-lv-fem-2.jpg', price: 7500 },
    { id: 'item5', name: 'Saia Jeans New Feeling', description: 'Saia jeans moderna.', category: 'nf_feminino_saia', image: 'https://i.postimg.cc/8z7xQ9WY/saia-nf-fem-1.jpg', price: 250 },
    { id: 'item6', name: 'Saia Plissada New Feeling', description: 'Saia plissada em tons pastel.', category: 'nf_feminino_saia', image: 'https://i.postimg.cc/J0vP8g1G/saia-nf-fem-2.jpg', price: 320, recommendationVideo: 'https://files.catbox.moe/joiet2.mp4' },
    { id: 'item7', name: 'Adidas Ultraboost', description: 'Tênis de corrida.', category: 'ad_masculino_tenis', image: 'https://i.postimg.cc/Hnpy6yvK/tenis-ad-masc-1.jpg', price: 900, recommendationVideo: 'https://files.catbox.moe/ctk28a.mp4' },
    { id: 'item8', name: 'Adidas Superstar', description: 'O clássico da Adidas.', category: 'ad_masculino_tenis', image: 'https://i.postimg.cc/J0tL2y08/tenis-ad-masc-2.jpg', price: 450 },
    
    // NEW FEELING - Feminino - Acessórios (Pastas)
    { id: 'nf-fem-pasta-1', name: 'pasta 1', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/bYRBsKHw/DSC2384_Photoroom.png', price: 10000 },
    { id: 'nf-fem-pasta-2', name: 'pasta 2', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/Y08nZWqz/W2012_Photoroom.png', price: 10000 },
    { id: 'nf-fem-pasta-3', name: 'pasta 3', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/NfJCxmnB/DSC2373_Photoroom.png', price: 10000 },
    { id: 'nf-fem-pasta-4', name: 'pasta 4', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/T2c4pZqy/DSC2364_Photoroom.png', price: 10000 },
    { id: 'nf-fem-pasta-5', name: 'pasta 5', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/qvWmP00Y/DSC2348_Photoroom.png', price: 10000 },
    { id: 'nf-fem-pasta-6', name: 'pasta 6', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/qvNbDgfS/DSC2338_Photoroom.png', price: 10000 },
    { id: 'nf-fem-pasta-7', name: 'pasta 7', description: 'Pasta exclusiva New Feeling.', category: 'nf_feminino_acessorios', image: 'https://i.postimg.cc/9018K7FL/DSC2336_(1)_Photoroom.png', price: 10000 },

    // Kero - Decoração (Originais + Novos)
    { id: 'deco-1', name: 'deco 1', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/m2Jn3Tvt/Captura_de_Tela_2025_11_30_a_s_6_28_07_PM_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-3', name: 'deco 3', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/Fs86bhMG/Captura_de_Tela_2025_11_30_a_s_6_28_33_PM_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-4', name: 'deco 4', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/L6wWkmcB/Captura_de_Tela_2025_11_30_a_s_6_28_50_PM_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-5', name: 'deco 5', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/Qxwzgj21/Captura_de_Tela_2025_11_30_a_s_6_29_15_PM_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-6', name: 'deco 6', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/VLdTbJVz/pngtree_armchair_isolated_on_white_background_png_image_2770873_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-7', name: 'deco 7', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/ncC5QXPj/pngtree_elegant_rattan_armchair_design_png_image_12689317_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-8', name: 'deco 8', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/Pr97bdgt/poltrona_de_veludo_cor_de_vinho_isolada_em_fundo_transparente_png_psd_888962_1656_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-9', name: 'deco 9', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/zXVMRycL/poltrona_decorativa_sala_de_estar_seul_cinza_1572218835_f683_600x600_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    // Novos itens Deco 10-15
    { id: 'deco-10', name: 'deco 10', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/d3dHQxBR/download.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-11', name: 'deco 11', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/gjRScTDv/kit_de_quadros_decorativos_em_preto_e_branco_new_york_kit_com_4_quadros_de_35x55cm_24904.jpg', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-12', name: 'deco 12', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/4dj2ggz5/madeira_s_reflexo.webp', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-13', name: 'deco 13', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/6qRj6m0f/quadro_com_moldura_frase_coisas_pequenas_amor_30x40cm_preta.webp', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-14', name: 'deco 14', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/fL1qNNx7/quadro_paris_nova_york_e_londres_kit_3_telas_1567793695_3517_600x600.jpg', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-15', name: 'deco 15', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/J040MfMM/png_transparent_frames_quadro_floral_design_poster_ipad_mini_quadros_flower_arranging_text_poster_Ph.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    // Novos itens Deco 17-21
    { id: 'deco-17', name: 'deco 17', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/JzCXCRPb/cz_Nmcy1wcml2YXRl_L3Jhd3Bpe_GVs_X2lt_YWdlcy93ZWJza_XRl_X2Nvbn_Rlbn_Qvb_HIvc_GYtcz_Ex_OC1w_YS02OTQy_L.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-18', name: 'deco 18', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/y8CRC7v9/png_clipart_flowers_in_a_vase_vase_flower_arranging_white_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-19', name: 'deco 19', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/WbkZyd6Z/png_clipart_white_flower_in_clear_glass_vase_vase_flowerpot_glass_flower_bouquet_vase_white_plant_st.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-20', name: 'deco 20', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/sDhWLM9S/pngtree_potted_grass_flower_over_wooden_table_png_image_13738331_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
    { id: 'deco-21', name: 'deco 21', description: 'Item de decoração exclusivo.', category: 'supermercados_decoracao', image: 'https://i.postimg.cc/2SNWNC2G/pngtree_white_ceramic_vases_with_tulips_png_image_14790373_Photoroom.png', price: 20000, isTryOn: true, tryOnType: 'decoration' },
];

export const INITIAL_STORIES: Story[] = [
  { id: 'story1', user: { name: 'Camila', avatar: 'https://i.pravatar.cc/150?u=camila' }, backgroundImage: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png' },
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
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv1',
        participant: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara' },
        lastMessage: {
            id: 'msg1',
            text: 'Olá! Adorei seu último look, ficou incrível!',
            senderId: 'user1',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        unreadCount: 1,
    },
];

export const INITIAL_VENDOR_ITEMS: Item[] = [
    { id: 'vendor-item-1', name: 'T-shirt Gráfica Exclusiva', description: 'T-shirt de algodão com estampa exclusiva.', category: 'vendor-items', image: 'https://i.postimg.cc/TPR4dpBg/louis-vuitton-camiseta-de-algodao-bordada-HTY18-WNPG651-PM2-Front-view.webp', price: 350, gender: 'male', vendorSubCategory: 'tshirt' },
];

export const VENDOR_POSTS: Post[] = [
     {
        id: 'vendor-post1',
        user: { id: 'business-user-1', name: 'NEW FEELING', avatar: 'https://i.postimg.cc/pTbvCjjp/NEW-FEELING.png' },
        image: 'https://i.postimg.cc/T3mn2fXq/meu-estilo-look-5.png',
        items: [INITIAL_VENDOR_ITEMS[0]],
        likes: 1800,
        isLiked: false,
        comments: [],
        commentCount: 0,
        caption: "Nossa nova coleção urbana já está disponível!",
    }
];

export const INITIAL_COLLABORATION_REQUESTS: CollaborationPost[] = [
    {
        id: 'collab1',
        influencer: { id: 'user1', name: 'Ana Clara', avatar: 'https://i.pravatar.cc/150?u=anaclara' },
        businessId: 'business-user-1',
        postId: 'post5',
        status: 'pending',
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    }
];