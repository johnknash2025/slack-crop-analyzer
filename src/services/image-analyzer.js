/**
 * 農作物画像解析サービス
 */

import { downloadSlackFile } from '../utils/slack-api.js';

/**
 * 農作物画像を解析
 */
export async function analyzeCropImage(imageUrl, env) {
  try {
    // Slackから画像をダウンロード
    const imageResponse = await downloadSlackFile(imageUrl, env.SLACK_BOT_TOKEN);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = arrayBufferToBase64(imageBuffer);

    // OpenAI Vision APIを使用して画像を解析
    const analysis = await analyzeWithOpenAI(base64Image, env.OPENAI_API_KEY);
    
    return analysis;
  } catch (error) {
    console.error('Error in analyzeCropImage:', error);
    throw error;
  }
}

/**
 * OpenAI Vision APIで画像解析
 */
async function analyzeWithOpenAI(base64Image, apiKey) {
  const prompt = `
この農作物の画像を詳しく分析してください。以下の情報を提供してください：

1. 作物の種類（米、小麦、トマト、キュウリ、レタスなど）
2. 成長段階（種まき、発芽、成長期、開花期、収穫期など）
3. 健康状態（健康、軽度の問題、重度の問題）
4. 病気や害虫の兆候があれば具体的に指摘
5. 栽培に関する推奨事項
6. 分析の信頼度（0-1の数値）

回答は以下のJSON形式で返してください：
{
  "cropType": "作物の種類",
  "growthStage": "成長段階",
  "healthStatus": "健康状態",
  "diseases": ["病気や害虫のリスト"],
  "recommendations": ["推奨事項のリスト"],
  "confidence": 0.95,
  "additionalNotes": "その他の観察事項"
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0].message.content;

  try {
    // JSONレスポンスをパース
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      // JSONが見つからない場合は、テキストから情報を抽出
      return parseTextResponse(content);
    }
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    return parseTextResponse(content);
  }
}

/**
 * テキストレスポンスから情報を抽出
 */
function parseTextResponse(text) {
  return {
    cropType: extractInfo(text, ['作物', '植物', 'crop']),
    growthStage: extractInfo(text, ['成長', '段階', 'stage']),
    healthStatus: extractInfo(text, ['健康', '状態', 'health']),
    diseases: extractList(text, ['病気', '害虫', 'disease', 'pest']),
    recommendations: extractList(text, ['推奨', '提案', 'recommend']),
    confidence: 0.7,
    additionalNotes: text.substring(0, 200) + '...'
  };
}

/**
 * テキストから特定の情報を抽出
 */
function extractInfo(text, keywords) {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:][^。\n]*`, 'i');
    const match = text.match(regex);
    if (match) {
      return match[0].split(/[：:]/)[1].trim();
    }
  }
  return '不明';
}

/**
 * テキストからリスト形式の情報を抽出
 */
function extractList(text, keywords) {
  const items = [];
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[：:]([^。\n]*)`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const item = match[1].trim();
      if (item && !items.includes(item)) {
        items.push(item);
      }
    }
  }
  return items.length > 0 ? items : ['特に問題は検出されませんでした'];
}

/**
 * ArrayBufferをBase64に変換
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}