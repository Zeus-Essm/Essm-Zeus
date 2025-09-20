

import type { Category, Item, Post, Story } from './types';

// Sub-categorias de Roupas reutilizáveis
const MALE_CLOTHING_SUBCATEGORIES = [
    { id: 'fato', name: 'Fato', image: 'https://i.postimg.cc/fLHkb25Z/ICONS8.jpg' },
    { id: 'tshirt', name: 'T-shirt', image: 'https://i.postimg.cc/gJxZFbq8/ICONS3.jpg' },
    { id: 'camisa', name: 'Camisa', image: 'https://i.postimg.cc/yNG84gNY/ICONS9.jpg' },
    { id: 'calca', name: 'Calça', image: 'https://i.postimg.cc/sXbZ3Hw8/ICONS4.jpg' },
    { id: 'jaqueta', name: 'Jaqueta', image: 'https://i.postimg.cc/pXfntZ8G/ICONS.jpg' },
    { id: 'tenis', name: 'Ténis', image: 'https://i.postimg.cc/4xGVKMsR/ICONS7.jpg' },
    { id: 'sapatos', name: 'Sapatos', image: 'https://i.postimg.cc/TPYb0DKk/ICONS6.jpg' },
    { id: 'acessorios', name: 'Acessórios', image: 'https://i.postimg.cc/jjg7FSNR/ICONS5.jpg' },
];

const FEMALE_CLOTHING_SUBCATEGORIES = [
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

const KID_CLOTHING_SUBCATEGORIES = [
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
    video: 'https://cdn-1.limewire.com/video/QmR7P4i2rTsqc9g99rM5895X3Lw9x9Y9jJ3k5t9x4f8w2q?filename=video-f0f80e72-d599-4c07-b649-14a5b51259ab-1718820876.mp4',
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
    subCategories: [
        { id: 'nf_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('nf_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('nf_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'nf_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('nf_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'noivas',
    name: 'NOIVAS',
    image: 'https://i.postimg.cc/G3vH75kZ/465687536-1138426001618419-59111119315795457782-n.jpg',
    subCategories: [
        { id: 'noivas_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg' },
        { id: 'noivas_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg' },
        { id: 'noivas_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg' }
    ]
  },
  {
    id: 'lilas',
    name: 'LILAS',
    image: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    subCategories: [
        { id: 'lilas_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('lilas_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lilas_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('lilas_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'lilas_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('lilas_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  },
  {
    id: 'adidas',
    name: 'ADIDAS',
    image: 'https://i.postimg.cc/LXmdq4H2/D.jpg',
    subCategories: [
        { id: 'adidas_masculino', name: 'Masculino', image: 'https://i.postimg.cc/zD9nNvQB/homem.jpg', subCategories: createSubCategories('adidas_masculino', MALE_CLOTHING_SUBCATEGORIES) },
        { id: 'adidas_feminino', name: 'Feminino', image: 'https://i.postimg.cc/y8T90P8g/mulher.jpg', subCategories: createSubCategories('adidas_feminino', FEMALE_CLOTHING_SUBCATEGORIES) },
        { id: 'adidas_crianca', name: 'Criança', image: 'https://i.postimg.cc/DyL1wFVc/pequeno.jpg', subCategories: createSubCategories('adidas_crianca', KID_CLOTHING_SUBCATEGORIES) }
    ]
  }
];

// Itens de exemplo (mesma estrutura que antes)
export const ITEMS: Item[] = [
    // Louis Vuitton Feminino
    { id: 'lv_feminino_vestido_1', name: 'Vestido de Cocktail LV', description: 'Vestido elegante para ocasiões especiais.', category: 'lv_feminino_vestido', image: 'https://i.postimg.cc/WpX9pL9g/lv-women-dress1.jpg', price: 12000 },
    { id: 'lv_feminino_saia_1', name: 'Saia Plissada Monogram', description: 'Saia plissada com o icônico padrão Monogram.', category: 'lv_feminino_saia', image: 'https://i.postimg.cc/qR3tjXz3/lv-women-skirt1.jpg', price: 5500 },
    { id: 'lv_feminino_tshirt_1', name: 'T-shirt Feminina LV', description: 'T-shirt com corte feminino e logo LV.', category: 'lv_feminino_tshirt', image: 'https://i.postimg.cc/SRhD10N6/lv-women-tshirt1.jpg', price: 2300 },
    { id: 'lv_feminino_acessorios_1', name: 'Bolsa Speedy LV', description: 'Bolsa clássica em canvas Monogram.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/kXF1pG4j/lv-women-bag1.jpg', price: 8500 },
    { id: 'lv_feminino_acessorios_2', name: 'Óculos de Sol My Monogram', description: 'Óculos de sol elegantes com detalhes Monogram.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/Gmd0V5zN/lv-women-sunglasses1.jpg', price: 3200 },
    { id: 'lv_feminino_acessorios_3', name: 'Lenço de Seda Monogram', description: 'Lenço de seda versátil com estampa Monogram.', category: 'lv_feminino_acessorios', image: 'https://i.postimg.cc/qMQ4wF7p/lv-women-scarf1.jpg', price: 2100 },
    
    // Louis Vuitton Masculino (Restante)
    { id: 'lv_masculino_camisa_1', name: 'Camisa de Seda LV', description: 'Camisa de seda com estampa exclusiva da coleção.', category: 'lv_masculino_camisa', image: 'https://i.postimg.cc/k4xY0VjM/lv-men-shirt1.jpg', price: 4500 },

    // LV Masculino - Fato (NOVO)
    { id: 'lv_masculino_fato_new_1', name: 'fato 1', description: 'Fato Louis Vuitton.', category: 'lv_masculino_fato', image: 'https://i.postimg.cc/tg58WhFB/louis-vuitton-terno-pont-neuf-em-la-HQCF4-WAVD631-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_fato_new_2', name: 'fato 2', description: 'Fato Louis Vuitton.', category: 'lv_masculino_fato', image: 'https://i.postimg.cc/cHkj509Y/louis-vuitton-terno-pont-neuf-em-mescla-de-la-HQCF4-WFOG900-PM2-Front-view.webp', price: 20000 },

    // LV Masculino - T-shirt (NOVO)
    { id: 'lv_masculino_tshirt_new_1', name: 't-shirt 1', description: 'T-shirt Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/TPR4dpBg/louis-vuitton-camiseta-de-algodao-bordada-HTY18-WNPG651-PM2-Front-view.webp', price: 10000 },
    { id: 'lv_masculino_tshirt_new_2', name: 't-shirt 2', description: 'T-shirt Louis Vuitton.', category: 'lv_masculino_tshirt', image: 'https://i.postimg.cc/6pVPxdbB/Louis-Vuitton-LV-Monogram-Gradient-Black-White-T-Shirt-Crepslocker-Front-1.webp', price: 10000 },
    
    // LV Masculino - Calça (NOVO)
    { id: 'lv_masculino_calca_new_1', name: 'calça 1', description: 'Calça Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/wTBFPX5K/louis-vuitton-calca-cigarrete-de-la-com-jacquard-damier-HSP61-WSMYMU1-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_calca_new_2', name: 'calça 2', description: 'Calça Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/mkmjkks6/louis-vuitton-calca-de-agasalho-em-tecido-tecnologico-com-monogram-estampado-HRP83-WMJW609-PM2-Front.webp', price: 20000 },
    { id: 'lv_masculino_calca_new_3', name: 'calça 3', description: 'Calça Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/SQdDDTM7/louis-vuitton-calca-de-couro-damier-HQL60-EBQV822-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_calca_new_4', name: 'calça 4', description: 'Calça Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/W1tdQn1k/dddd.webp', price: 20000 },
    { id: 'lv_masculino_calca_new_5', name: 'calça 5', description: 'Calça Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/R09jWPJ3/louis-vuitton-fleece-jogpants-HQY22-WDFXMU1-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_calca_new_6', name: 'calça 6', description: 'Calça Louis Vuitton.', category: 'lv_masculino_calca', image: 'https://i.postimg.cc/76ZdVfVw/louis-vuitton-calca-em-jacquard-damoflage-HSN93-WTMJ900-PM2-Front-view.webp', price: 20000 },
    
    // LV Masculino - Jaqueta/Casaco (NOVO)
    { id: 'lv_masculino_jaqueta_new_1', name: 'jaqueta 1', description: 'Jaqueta Louis Vuitton.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/MZ4N7ZjJ/louis-vuitton-jaqueta-de-couro-damier-HSL90-ETAHMU1-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_jaqueta_new_2', name: 'jaqueta 2', description: 'Jaqueta Louis Vuitton.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/QMC3DCnK/louis-vuitton-jaqueta-safari-chic-com-gola-de-couro-HSB73-WRJV851-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_casaco_new_1', name: 'casaco 1', description: 'Casaco Louis Vuitton.', category: 'lv_masculino_jaqueta', image: 'https://i.postimg.cc/W1cyy9n9/louis-vuitton-paleto-pont-neuf-de-la-HRFJ8-EDLG60-D-PM2-Front-view.png', price: 20000 },

    // LV Masculino - Ténis (NOVO)
    { id: 'lv_masculino_tenis_new_1', name: 'ténis 1', description: 'Ténis Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/VvTx5mX1/louis-vuitton-sneaker-lv-skate-BO9-U3-PMI31-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_tenis_new_2', name: 'ténis 2', description: 'Ténis Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/66mJMLgS/louis-vuitton-tenis-lv-skate-BP9-U2-PMI92-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_tenis_new_3', name: 'ténis 3', description: 'Ténis Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/xTNrhNSd/louis-vuitton-tenis-lv-skate-BR9-U1-PMI20-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_tenis_new_4', name: 'ténis 4', description: 'Ténis Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/hjCWW9jX/louis-vuitton-tenis-lv-trainer-BSUPN8-GC52-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_tenis_new_5', name: 'ténis 5', description: 'Ténis Louis Vuitton.', category: 'lv_masculino_tenis', image: 'https://i.postimg.cc/KjRXZRkJ/louis-vuitton-tenis-lv-trainer-BTU017-MI01-PM2-Front-view.webp', price: 20000 },

    // LV Masculino - Acessórios (NOVO)
    { id: 'lv_masculino_acessorios_new_1', name: 'Chapeu 1', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/wBQYFKYc/louis-vuitton-bone-lv-get-ready-M76505-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_2', name: 'Chapeu 2', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/MTZ2FsWk/louis-vuitton-bone-lv-smash-M7608-L-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_3', name: 'Chapeu 3', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/NjTc99Nn/louis-vuitton-bone-monogram-shadow-M76580-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_4', name: 'Chapeu 4', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/j2W1pmm1/pngtree-brown-louis-vuitton-lv-polyester-mens-png-image-12912743.png', price: 20000 },
    { id: 'lv_masculino_acessorios_new_5', name: 'rula 1', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/cHd0NxBb/louis-vuitton-relogio-tambour-street-diver-chronograph-com-movimento-automatico-e-46-mm-de-diametro.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_6', name: 'rula 2', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/0QZxkTt2/louis-vuitton-relogio-tambour-street-diver-chronograph-com-movimento-automatico-e-46-mm-de-diametro.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_7', name: 'rula 3', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/PqWTcpYD/louis-vuitton-relogio-tambour-street-diver-de-movimento-automatico-com-44-mm-de-diametro-em-aco-QA1.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_8', name: 'óculos 1', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/zvBNVxMw/louis-vuitton-1-1-millionaires-Z1165-E-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_9', name: 'óculos 2', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/h4ygHqz2/louis-vuitton-oculos-de-sol-1-0-millionaires-Z2516-U-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_10', name: 'óculos 3', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/pXmxv1KR/louis-vuitton-oculos-de-sol-lv-match-Z1414-W-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_11', name: 'óculos 4', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/TYBx3qcm/louis-vuitton-oculos-de-sol-quadrados-lv-clash-Z1579-W-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_12', name: 'óculos 5', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/1zhyJcnP/louis-vuitton-oculos-de-sol-quadrados-lv-link-pm-Z1566-W-PM2-Front-view.webp', price: 20000 },
    { id: 'lv_masculino_acessorios_new_13', name: 'óculos 6', description: 'Acessório Louis Vuitton.', category: 'lv_masculino_acessorios', image: 'https://i.postimg.cc/RhDBfc5k/louis-vuitton-oculos-de-sol-quadrados-lv-ocean-Z2207-U-PM2-Front-view.webp', price: 20000 },

    // ADIDAS Masculino
    { id: 'adidas_masculino_tshirt_1', name: 'T-shirt Logo Trefoil', description: 'T-shirt clássica de algodão com o logo Trefoil da Adidas.', category: 'adidas_masculino_tshirt', image: 'https://i.postimg.cc/pT5L5bSj/adidas-men-tshirt1.jpg', price: 180 },
    { id: 'adidas_masculino_calca_1', name: 'Calça Tiro 23', description: 'Calça de treino com tecnologia AEROREADY que remove o suor.', category: 'adidas_masculino_calca', image: 'https://i.postimg.cc/Y0NHgR8P/adidas-men-pants1.jpg', price: 350 },
    { id: 'adidas_masculino_tenis_1', name: 'Ténis Superstar', description: 'O icónico ténis com a biqueira em concha de borracha.', category: 'adidas_masculino_tenis', image: 'https://i.postimg.cc/7L4wjy6J/adidas-men-shoes1.jpg', price: 550 },

    // ADIDAS Feminino
    { id: 'adidas_feminino_tshirt_1', name: 'T-shirt Boyfriend', description: 'T-shirt com modelagem folgada para um look descontraído.', category: 'adidas_feminino_tshirt', image: 'https://i.postimg.cc/k4W2r9bQ/adidas-women-tshirt1.jpg', price: 170 },
    { id: 'adidas_feminino_calca_1', name: 'Legging Essentials', description: 'Legging de cintura alta com as 3 riscas laterais.', category: 'adidas_feminino_calca', image: 'https://i.postimg.cc/NMyL2yMh/adidas-women-leggings1.jpg', price: 280 },
    { id: 'adidas_feminino_tenis_1', name: 'Tênis Stan Smith', description: 'O design clássico e minimalista que nunca sai de moda.', category: 'adidas_feminino_tenis', image: 'https://i.postimg.cc/50qf3G7f/adidas-women-shoes1.jpg', price: 520 },
    { id: 'adidas_feminino_vestido_1', name: 'Vestido Longo 3-Stripes', description: 'Um vestido casual com as icónicas 3 riscas, combinando conforto e estilo.', category: 'adidas_feminino_vestido', image: 'https://i.postimg.cc/LXmdq4H2/D.jpg', price: 450 },
];


// Posts iniciais para o feed (exemplo)
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    user: {
      id: 'user_camila',
      name: 'camila_fashion',
      avatar: 'https://i.postimg.cc/zX8ZgGg1/vecteezy-portrait-of-a-beautiful-young-woman-with-long-hair-and-35990471.jpg',
    },
    image: 'https://i.postimg.cc/L6W5ntbS/vecteezy-ai-generated-portrait-of-a-beautiful-woman-in-a-stylish-34844601.jpg',
    items: [ITEMS[4], ITEMS[5]],
    likes: 1289,
    isLiked: false,
  },
  {
    id: 'post_2',
    user: {
      id: 'user_marco',
      name: 'marco_style',
      avatar: 'https://i.postimg.cc/135z5Y42/vecteezy-stylish-man-in-a-studio-shot-32204593.jpg',
    },
    image: 'https://i.postimg.cc/8cK5dMkh/vecteezy-beige-fashion-background-with-girl-28680288.jpg',
    items: [ITEMS[0], ITEMS[1]],
    likes: 345,
    isLiked: true,
  },
  {
    id: 'post_3',
    user: {
      id: 'user_lv',
      name: 'louisvuitton',
      avatar: 'https://i.postimg.cc/7Z9pT8Wk/L.jpg',
    },
    image: 'https://i.postimg.cc/4yd43yvn/vecteezy-fashionable-young-adult-woman-in-multi-colored-garment-24577243.jpg',
    items: [ITEMS[2], ITEMS[3]],
    likes: 25432,
    isLiked: false,
  },
  {
    id: 'post_4',
    user: {
      id: 'user_julia',
      name: 'julia_looks',
      avatar: 'https://i.postimg.cc/tJc7g4A9/vecteezy-portrait-of-a-stylish-woman-in-a-hat-32204595.jpg',
    },
    image: 'https://i.postimg.cc/J02rH8Kx/vecteezy-fashion-portrait-stylish-pretty-woman-in-sunglasses-posing-3289139.jpg',
    items: [ITEMS[6], ITEMS[7]],
    likes: 876,
    isLiked: false,
  },
  {
    id: 'post_5',
    user: {
      id: 'user_ana',
      name: 'ana_trends',
      avatar: 'https://i.postimg.cc/pT3w6gT7/vecteezy-fashion-portrait-of-a-beautiful-young-woman-with-dark-hair-35990473.jpg',
    },
    image: 'https://i.postimg.cc/wMZctM1S/vecteezy-a-woman-in-a-white-dress-and-a-hat-is-posing-for-a-picture-35990485.jpg',
    items: [ITEMS[8], ITEMS[5]],
    likes: 1542,
    isLiked: false,
  },
  {
    id: 'post_6',
    user: {
      id: 'user_rodrigo',
      name: 'rodrigo_sharp',
      avatar: 'https://i.postimg.cc/C1bQZ6fK/vecteezy-a-man-in-a-suit-and-tie-is-posing-for-a-picture-35990491.jpg',
    },
    image: 'https://i.postimg.cc/WbN1SgBv/vecteezy-a-man-in-a-suit-and-tie-is-posing-for-a-picture-35990479.jpg',
    items: [ITEMS[9], ITEMS[11], ITEMS[0]],
    likes: 789,
    isLiked: true,
  },
  {
    id: 'post_7',
    user: {
      id: 'user_fashionista',
      name: 'fashionista_br',
      avatar: 'https://i.postimg.cc/t46Tz9Cg/vecteezy-a-woman-with-long-hair-is-posing-for-a-picture-35990483.jpg',
    },
    image: 'https://i.postimg.cc/6pQpWzL5/vecteezy-a-woman-in-a-white-shirt-and-black-hat-is-posing-for-a-picture-35990487.jpg',
    items: [ITEMS[10], ITEMS[12]],
    likes: 2301,
    isLiked: false,
  },
  {
    id: 'post_8',
    user: {
      id: 'user_urban',
      name: 'urban_explorer',
      avatar: 'https://i.postimg.cc/2jT1yZk5/vecteezy-a-man-in-a-black-jacket-is-posing-for-a-picture-35990467.jpg',
    },
    image: 'https://i.postimg.cc/sXJ3x23G/vecteezy-a-man-in-a-black-jacket-is-posing-for-a-picture-35990475.jpg',
    items: [ITEMS[4], ITEMS[1]],
    likes: 567,
    isLiked: false,
  },
  {
    id: 'post_9',
    user: {
      id: 'user_sofia',
      name: 'sofia_couture',
      avatar: 'https://i.postimg.cc/mk0jJzCF/vecteezy-a-woman-in-a-black-dress-is-posing-for-a-picture-35990494.jpg',
    },
    image: 'https://i.postimg.cc/2yT9gWwF/vecteezy-a-woman-in-a-black-dress-is-posing-for-a-picture-35990481.jpg',
    items: [ITEMS[6], ITEMS[8]],
    likes: 4123,
    isLiked: true,
  },
  {
    id: 'post_10',
    user: {
      id: 'user_rodrigo',
      name: 'rodrigo_sharp',
      avatar: 'https://i.postimg.cc/C1bQZ6fK/vecteezy-a-man-in-a-suit-and-tie-is-posing-for-a-picture-35990491.jpg',
    },
    image: 'https://i.postimg.cc/nzdDSLvZ/meu-estilo-look-9.png',
    items: [ITEMS[15], ITEMS[16]],
    likes: 982,
    isLiked: false,
  },
  {
    id: 'post_11',
    user: {
      id: 'user_ana',
      name: 'ana_trends',
      avatar: 'https://i.postimg.cc/pT3w6gT7/vecteezy-fashion-portrait-of-a-beautiful-young-woman-with-dark-hair-35990473.jpg',
    },
    image: 'https://i.postimg.cc/PxhsxmFf/meu-estilo-look-12.png',
    items: [ITEMS[2], ITEMS[3], ITEMS[4]],
    likes: 1743,
    isLiked: true,
  },
  {
    id: 'post_12',
    user: {
      id: 'user_julia',
      name: 'julia_looks',
      avatar: 'https://i.postimg.cc/tJc7g4A9/vecteezy-portrait-of-a-stylish-woman-in-a-hat-32204595.jpg',
    },
    image: 'https://i.postimg.cc/mk2v3Ts0/meu-estilo-look-13.png',
    items: [ITEMS[0], ITEMS[5]],
    likes: 2104,
    isLiked: false,
  },
  {
    id: 'post_13',
    user: {
      id: 'user_marco',
      name: 'marco_style',
      avatar: 'https://i.postimg.cc/135z5Y42/vecteezy-stylish-man-in-a-studio-shot-32204593.jpg',
    },
    image: 'https://i.postimg.cc/vTc6Jdzn/meu-estilo-look.png',
    items: [ITEMS[19], ITEMS[20]],
    likes: 654,
    isLiked: false,
  },
  {
    id: 'post_14',
    user: {
      id: 'user_sofia',
      name: 'sofia_couture',
      avatar: 'https://i.postimg.cc/mk0jJzCF/vecteezy-a-woman-in-a-black-dress-is-posing-for-a-picture-35990494.jpg',
    },
    image: 'https://i.postimg.cc/tgNPPkJs/meu-estilo-look-11.png',
    items: [ITEMS[1], ITEMS[6]],
    likes: 3201,
    isLiked: true,
  },
  {
    id: 'post_15',
    user: {
      id: 'user_camila',
      name: 'camila_fashion',
      avatar: 'https://i.postimg.cc/zX8ZgGg1/vecteezy-portrait-of-a-beautiful-young-woman-with-long-hair-and-35990471.jpg',
    },
    image: 'https://i.postimg.cc/T3mn2fXq/meu-estilo-look-5.png',
    items: [ITEMS[7], ITEMS[8]],
    likes: 1899,
    isLiked: false,
  },
  {
    id: 'post_16',
    user: {
      id: 'user_urban',
      name: 'urban_explorer',
      avatar: 'https://i.postimg.cc/2jT1yZk5/vecteezy-a-man-in-a-black-jacket-is-posing-for-a-picture-35990467.jpg',
    },
    image: 'https://i.postimg.cc/bJYnRnS3/meu-estilo-look-6.png',
    items: [ITEMS[22], ITEMS[25]],
    likes: 432,
    isLiked: false,
  },
  {
    id: 'post_17',
    user: {
      id: 'user_fashionista',
      name: 'fashionista_br',
      avatar: 'https://i.postimg.cc/t46Tz9Cg/vecteezy-a-woman-with-long-hair-is-posing-for-a-picture-35990483.jpg',
    },
    image: 'https://i.postimg.cc/nLJBCgF8/meu-estilo-look-7.png',
    items: [ITEMS[3], ITEMS[5]],
    likes: 2501,
    isLiked: true,
  }
];

// Stories iniciais para o feed (exemplo)
export const INITIAL_STORIES: Story[] = [
    {
        id: 'story_1',
        user: { name: 'vogue', avatar: 'https://i.postimg.cc/8cq3J9S8/vogue.jpg' },
        backgroundImage: 'https://i.postimg.cc/HxbYJq13/vogue-story.jpg',
    },
    {
        id: 'story_2',
        user: { name: 'gqbrasil', avatar: 'https://i.postimg.cc/mD8pWqVw/gq.jpg' },
        backgroundImage: 'https://i.postimg.cc/3wLMQxVp/gq-story.jpg',
    },
    {
        id: 'story_3',
        user: { name: 'elle', avatar: 'https://i.postimg.cc/FKHj2Mkd/elle.jpg' },
        backgroundImage: 'https://i.postimg.cc/Y9D5k0P7/elle-story.jpg',
    },
    {
        id: 'story_4',
        user: { name: 'bazaar', avatar: 'https://i.postimg.cc/prc8m7Y5/bazaar.jpg' },
        backgroundImage: 'https://i.postimg.cc/W1D8Hk9w/bazaar-story.jpg',
    },
];