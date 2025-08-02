/**
 * アプリケーション定数
 */

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

export const CROP_TYPES = [
  '米', '小麦', 'トウモロコシ', '大豆',
  'トマト', 'キュウリ', 'ナス', 'ピーマン',
  'レタス', 'キャベツ', '白菜', 'ほうれん草',
  'ジャガイモ', 'サツマイモ', '人参', '大根',
  'リンゴ', 'ミカン', 'イチゴ', 'ブドウ'
];

export const GROWTH_STAGES = [
  '種まき期',
  '発芽期', 
  '幼苗期',
  '成長期',
  '開花期',
  '結実期',
  '成熟期',
  '収穫期'
];

export const HEALTH_STATUS = {
  HEALTHY: '健康',
  MILD_ISSUES: '軽度の問題',
  MODERATE_ISSUES: '中程度の問題', 
  SEVERE_ISSUES: '重度の問題',
  CRITICAL: '危険な状態'
};

export const COMMON_DISEASES = [
  'うどんこ病',
  '灰色かび病',
  'べと病',
  '疫病',
  '炭疽病',
  '黒星病',
  'さび病',
  '萎凋病'
];

export const COMMON_PESTS = [
  'アブラムシ',
  'ハダニ',
  'アザミウマ',
  'コナジラミ',
  'ヨトウムシ',
  'アオムシ',
  'カメムシ',
  'ハモグリバエ'
];