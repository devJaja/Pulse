#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOCALES_DIR = join(__dirname, '../locales');

const NEW_KEYS: Record<string, Record<string, string>> = {
  // Feed screen
  'feed.explore': {
    en: 'Explore',
    es: 'Explorar',
    fr: 'Explorer',
    de: 'Erkunden',
    zh: '探索',
    ja: '探索',
    ko: '탐색',
    ar: 'استكشف',
    pt: 'Explorar',
    ru: 'Исследовать',
    hi: 'अन्वेषण करें',
    it: 'Esplora',
  },
  // Balance Card
  'wallet.totalBalance': {
    en: 'Total Balance',
    es: 'Saldo total',
    fr: 'Solde total',
    de: 'Gesamtguthaben',
    zh: '总余额',
    ja: '総残高',
    ko: '총 잔액',
    ar: 'الرصيد الإجمالي',
    pt: 'Saldo total',
    ru: 'Общий баланс',
    hi: 'कुल शेष',
    it: 'Saldo totale',
  },
  'wallet.monadTestnet': {
    en: 'Monad Testnet',
    es: 'Monad Testnet',
    fr: 'Monad Testnet',
    de: 'Monad Testnet',
    zh: 'Monad 测试网',
    ja: 'Monad Testnet',
    ko: 'Monad Testnet',
    ar: 'Monad Testnet',
    pt: 'Monad Testnet',
    ru: 'Monad Testnet',
    hi: 'Monad Testnet',
    it: 'Monad Testnet',
  },
  // Create Post Modal
  'feed.createPost': {
    en: 'Create Post',
    es: 'Crear publicación',
    fr: 'Créer une publication',
    de: 'Beitrag erstellen',
    zh: '创建帖子',
    ja: '投稿を作成',
    ko: '게시물 작성',
    ar: 'إنشاء منشور',
    pt: 'Criar publicação',
    ru: 'Создать пост',
    hi: 'पोस्ट बनाएं',
    it: 'Crea post',
  },
  'feed.whatsHappening': {
    en: "What's happening?",
    es: '¿Qué está pasando?',
    fr: 'Quoi de neuf?',
    de: 'Was gibt\'s Neues?',
    zh: '发生了什么？',
    ja: '今どうしてる？',
    ko: '무슨 일이 일어나고 있나요?',
    ar: 'ماذا يحدث؟',
    pt: 'O que está acontecendo?',
    ru: 'Что происходит?',
    hi: 'क्या हो रहा है?',
    it: 'Cosa sta succedendo?',
  },
  'feed.uploading': {
    en: 'Uploading...',
    es: 'Subiendo...',
    fr: 'Téléchargement...',
    de: 'Hochladen...',
    zh: '上传中...',
    ja: 'アップロード中...',
    ko: '업로드 중...',
    ar: 'جارٍ التحميل...',
    pt: 'Enviando...',
    ru: 'Загрузка...',
    hi: 'अपलोड हो रहा है...',
    it: 'Caricamento...',
  },
  'feed.posting': {
    en: 'Posting...',
    es: 'Publicando...',
    fr: 'Publication...',
    de: 'Wird gepostet...',
    zh: '发布中...',
    ja: '投稿中...',
    ko: '게시 중...',
    ar: 'جارٍ النشر...',
    pt: 'Publicando...',
    ru: 'Публикация...',
    hi: 'पोस्ट हो रहा है...',
    it: 'Pubblicazione...',
  },
  'feed.tokenizePost': {
    en: 'Tokenize Post',
    es: 'Tokenizar publicación',
    fr: 'Tokeniser la publication',
    de: 'Beitrag tokenisieren',
    zh: '代币化帖子',
    ja: '投稿をトークン化',
    ko: '게시물 토큰화',
    ar: 'ترميز المنشور',
    pt: 'Tokenizar publicação',
    ru: 'Токенизировать пост',
    hi: 'पोस्ट को टोकन बनाएं',
    it: 'Tokenizza post',
  },
  'feed.tokenSupply': {
    en: 'Token Supply',
    es: 'Suministro de tokens',
    fr: 'Offre de jetons',
    de: 'Token-Angebot',
    zh: '代币供应',
    ja: 'トークン供給',
    ko: '토큰 공급',
    ar: 'عرض الرمز',
    pt: 'Fornecimento de tokens',
    ru: 'Предложение токенов',
    hi: 'टोकन आपूर्ति',
    it: 'Fornitura di token',
  },
  'feed.pricePerToken': {
    en: 'Price per Token (MON)',
    es: 'Precio por token (MON)',
    fr: 'Prix par jeton (MON)',
    de: 'Preis pro Token (MON)',
    zh: '每个代币价格 (MON)',
    ja: 'トークンあたりの価格 (MON)',
    ko: '토큰당 가격 (MON)',
    ar: 'السعر لكل رمز (MON)',
    pt: 'Preço por token (MON)',
    ru: 'Цена за токен (MON)',
    hi: 'प्रति टोकन मूल्य (MON)',
    it: 'Prezzo per token (MON)',
  },
  'feed.tokenTip': {
    en: 'Users can buy tokens of your post. Token value may increase based on demand!',
    es: 'Los usuarios pueden comprar tokens de tu publicación. ¡El valor del token puede aumentar según la demanda!',
    fr: 'Les utilisateurs peuvent acheter des jetons de votre publication. La valeur du jeton peut augmenter en fonction de la demande!',
    de: 'Benutzer können Token Ihres Beitrags kaufen. Der Token-Wert kann je nach Nachfrage steigen!',
    zh: '用户可以购买您帖子的代币。代币价值可能会根据需求增加！',
    ja: 'ユーザーはあなたの投稿のトークンを購入できます。トークンの価値は需要に基づいて増加する可能性があります！',
    ko: '사용자가 게시물의 토큰을 구매할 수 있습니다. 토큰 가치는 수요에 따라 증가할 수 있습니다!',
    ar: 'يمكن للمستخدمين شراء رموز منشورك. قد تزداد قيمة الرمز بناءً على الطلب!',
    pt: 'Os usuários podem comprar tokens da sua publicação. O valor do token pode aumentar com base na demanda!',
    ru: 'Пользователи могут покупать токены вашего поста. Стоимость токена может увеличиться в зависимости от спроса!',
    hi: 'उपयोगकर्ता आपकी पोस्ट के टोकन खरीद सकते हैं। मांग के आधार पर टोकन मूल्य बढ़ सकता है!',
    it: 'Gli utenti possono acquistare token del tuo post. Il valore del token può aumentare in base alla domanda!',
  },
  'feed.addImages': {
    en: 'Add Images',
    es: 'Agregar imágenes',
    fr: 'Ajouter des images',
    de: 'Bilder hinzufügen',
    zh: '添加图片',
    ja: '画像を追加',
    ko: '이미지 추가',
    ar: 'إضافة صور',
    pt: 'Adicionar imagens',
    ru: 'Добавить изображения',
    hi: 'छवियां जोड़ें',
    it: 'Aggiungi immagini',
  },
  'feed.maxImages': {
    en: 'Max 4 images',
    es: 'Máximo 4 imágenes',
    fr: 'Maximum 4 images',
    de: 'Maximal 4 Bilder',
    zh: '最多4张图片',
    ja: '最大4枚の画像',
    ko: '최대 4개 이미지',
    ar: 'حد أقصى 4 صور',
    pt: 'Máximo 4 imagens',
    ru: 'Максимум 4 изображения',
    hi: 'अधिकतम 4 छवियां',
    it: 'Massimo 4 immagini',
  },
  'feed.imagesUploaded': {
    en: 'Images uploaded!',
    es: '¡Imágenes subidas!',
    fr: 'Images téléchargées!',
    de: 'Bilder hochgeladen!',
    zh: '图片已上传！',
    ja: '画像がアップロードされました！',
    ko: '이미지 업로드됨!',
    ar: 'تم تحميل الصور!',
    pt: 'Imagens enviadas!',
    ru: 'Изображения загружены!',
    hi: 'छवियां अपलोड की गईं!',
    it: 'Immagini caricate!',
  },
  'feed.failedToUploadImages': {
    en: 'Failed to upload images',
    es: 'Error al subir imágenes',
    fr: 'Échec du téléchargement des images',
    de: 'Fehler beim Hochladen der Bilder',
    zh: '上传图片失败',
    ja: '画像のアップロードに失敗しました',
    ko: '이미지 업로드 실패',
    ar: 'فشل تحميل الصور',
    pt: 'Falha ao enviar imagens',
    ru: 'Не удалось загрузить изображения',
    hi: 'छवियां अपलोड करने में विफल',
    it: 'Impossibile caricare le immagini',
  },
  // Post actions
  'feed.buy': {
    en: 'Buy',
    es: 'Comprar',
    fr: 'Acheter',
    de: 'Kaufen',
    zh: '购买',
    ja: '購入',
    ko: '구매',
    ar: 'شراء',
    pt: 'Comprar',
    ru: 'Купить',
    hi: 'खरीदें',
    it: 'Acquista',
  },
  'feed.receivedTips': {
    en: 'Received {{amount}} MON in tips',
    es: 'Recibió {{amount}} MON en propinas',
    fr: 'A reçu {{amount}} MON en pourboires',
    de: '{{amount}} MON an Trinkgeldern erhalten',
    zh: '收到 {{amount}} MON 小费',
    ja: 'チップで {{amount}} MON を受け取りました',
    ko: '팁으로 {{amount}} MON 받음',
    ar: 'تلقى {{amount}} MON في الإكراميات',
    pt: 'Recebeu {{amount}} MON em gorjetas',
    ru: 'Получено {{amount}} MON чаевых',
    hi: 'टिप्स में {{amount}} MON प्राप्त हुआ',
    it: 'Ricevuto {{amount}} MON in mance',
  },
  // Common messages
  'feed.addressCopied': {
    en: 'Address copied!',
    es: '¡Dirección copiada!',
    fr: 'Adresse copiée!',
    de: 'Adresse kopiert!',
    zh: '地址已复制！',
    ja: 'アドレスがコピーされました！',
    ko: '주소 복사됨!',
    ar: 'تم نسخ العنوان!',
    pt: 'Endereço copiado!',
    ru: 'Адрес скопирован!',
    hi: 'पता कॉपी किया गया!',
    it: 'Indirizzo copiato!',
  },
  'feed.balanceRefreshed': {
    en: 'Balance refreshed!',
    es: '¡Saldo actualizado!',
    fr: 'Solde actualisé!',
    de: 'Guthaben aktualisiert!',
    zh: '余额已刷新！',
    ja: '残高が更新されました！',
    ko: '잔액 새로고침됨!',
    ar: 'تم تحديث الرصيد!',
    pt: 'Saldo atualizado!',
    ru: 'Баланс обновлен!',
    hi: 'शेष ताज़ा किया गया!',
    it: 'Saldo aggiornato!',
  },
};

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  
  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

function addKeys() {
  console.log('🔄 Adding feed keys...\n');
  
  const languages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'pt', 'ru', 'hi', 'it'];
  
  for (const lang of languages) {
    const langPath = join(LOCALES_DIR, `${lang}.json`);
    
    try {
      const langContent = JSON.parse(readFileSync(langPath, 'utf-8'));
      let updated = false;
      
      for (const [key, translations] of Object.entries(NEW_KEYS)) {
        if (translations[lang]) {
          setNestedValue(langContent, key, translations[lang]);
          updated = true;
        }
      }
      
      if (updated) {
        writeFileSync(langPath, JSON.stringify(langContent, null, 2) + '\n', 'utf-8');
        console.log(`✅ Updated ${lang}.json`);
      }
      
    } catch (error) {
      console.error(`❌ Error updating ${lang}.json:`, error);
    }
  }
  
  console.log('\n✅ Feed keys added successfully!');
}

addKeys();
