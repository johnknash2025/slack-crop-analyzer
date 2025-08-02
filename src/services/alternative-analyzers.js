/**
 * 代替AI画像解析サービス
 */

/**
 * Google Cloud Vision APIで画像解析
 */
export async function analyzeWithGoogleVision(base64Image, apiKey) {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 10 },
            { type: 'TEXT_DETECTION' },
            { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
          ]
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Vision API error: ${response.statusText}`);
  }

  const result = await response.json();
  return parseGoogleVisionResponse(result);
}

/**
 * Azure Computer Visionで画像解析
 */
export async function analyzeWithAzureVision(imageUrl, apiKey, endpoint) {
  const response = await fetch(`${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Tags`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: imageUrl
    }),
  });

  if (!response.ok) {
    throw new Error(`Azure Vision API error: ${response.statusText}`);
  }

  const result = await response.json();
  return parseAzureVisionResponse(result);
}

/**
 * Google Vision APIレスポンスをパース
 */
function parseGoogleVisionResponse(response) {
  const annotations = response.responses[0];
  const labels = annotations.labelAnnotations || [];
  const objects = annotations.localizedObjectAnnotations || [];

  // 農作物関連のラベルを抽出
  const cropLabels = labels.filter(label => 
    isCropRelated(label.description)
  );

  return {
    cropType: extractCropType(cropLabels, objects),
    growthStage: extractGrowthStage(labels),
    healthStatus: extractHealthStatus(labels),
    diseases: extractDiseases(labels),
    recommendations: generateRecommendations(cropLabels),
    confidence: calculateConfidence(cropLabels),
    additionalNotes: `Google Vision検出ラベル: ${labels.slice(0, 5).map(l => l.description).join(', ')}`
  };
}

/**
 * Azure Vision APIレスポンスをパース
 */
function parseAzureVisionResponse(response) {
  const categories = response.categories || [];
  const tags = response.tags || [];
  const objects = response.objects || [];

  const cropTags = tags.filter(tag => isCropRelated(tag.name));

  return {
    cropType: extractCropTypeFromTags(cropTags, objects),
    growthStage: extractGrowthStageFromTags(tags),
    healthStatus: extractHealthStatusFromTags(tags),
    diseases: extractDiseasesFromTags(tags),
    recommendations: generateRecommendationsFromTags(cropTags),
    confidence: calculateConfidenceFromTags(cropTags),
    additionalNotes: `Azure Vision検出タグ: ${tags.slice(0, 5).map(t => t.name).join(', ')}`
  };
}

/**
 * 農作物関連かどうかを判定
 */
function isCropRelated(label) {
  const cropKeywords = [
    'plant', 'crop', 'vegetable', 'fruit', 'flower', 'leaf', 'stem',
    '植物', '作物', '野菜', '果物', '花', '葉', '茎', '根',
    'tomato', 'cucumber', 'lettuce', 'cabbage', 'carrot', 'potato',
    'rice', 'wheat', 'corn', 'soybean'
  ];
  
  return cropKeywords.some(keyword => 
    label.toLowerCase().includes(keyword.toLowerCase())
  );
}

// その他のヘルパー関数...
function extractCropType(labels, objects) {
  // 実装省略 - ラベルから作物の種類を推定
  return '不明';
}

function extractGrowthStage(labels) {
  // 実装省略 - ラベルから成長段階を推定
  return '不明';
}

function extractHealthStatus(labels) {
  // 実装省略 - ラベルから健康状態を推定
  return '不明';
}

function extractDiseases(labels) {
  // 実装省略 - ラベルから病気を検出
  return [];
}

function generateRecommendations(labels) {
  // 実装省略 - 推奨事項を生成
  return ['詳細な分析のため、より高解像度の画像をアップロードしてください'];
}

function calculateConfidence(labels) {
  // 実装省略 - 信頼度を計算
  return 0.6;
}

// Azure用の同様の関数...
function extractCropTypeFromTags(tags, objects) { return '不明'; }
function extractGrowthStageFromTags(tags) { return '不明'; }
function extractHealthStatusFromTags(tags) { return '不明'; }
function extractDiseasesFromTags(tags) { return []; }
function generateRecommendationsFromTags(tags) { return ['詳細な分析のため、より高解像度の画像をアップロードしてください']; }
function calculateConfidenceFromTags(tags) { return 0.6; }