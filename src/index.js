/**
 * Slack農作物画像解析ボット - Cloudflare Workers版
 */

import { verifySlackSignature } from './utils/slack-verify.js';
import { analyzeCropImage } from './services/image-analyzer.js';
import { sendSlackMessage } from './utils/slack-api.js';

export default {
  async fetch(request, env, ctx) {
    // CORS対応
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Slackからのリクエストのみ処理
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.text();
      const headers = Object.fromEntries(request.headers.entries());

      // Slackからのリクエストを検証
      const isValid = await verifySlackSignature(
        body,
        headers['x-slack-signature'],
        headers['x-slack-request-timestamp'],
        env.SLACK_SIGNING_SECRET
      );

      if (!isValid) {
        return new Response('Unauthorized', { status: 401 });
      }

      // URLエンコードされたボディをパース
      const params = new URLSearchParams(body);
      const payload = JSON.parse(params.get('payload') || '{}');

      // Slackのチャレンジレスポンス（初回設定時）
      if (payload.challenge) {
        return new Response(payload.challenge);
      }

      // イベント処理
      if (payload.event) {
        await handleSlackEvent(payload.event, env);
      }

      return new Response('OK');
    } catch (error) {
      console.error('Error processing request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

/**
 * Slackイベントを処理
 */
async function handleSlackEvent(event, env) {
  // ファイルアップロードイベントを処理
  if (event.type === 'file_shared' || 
      (event.type === 'message' && event.files && event.files.length > 0)) {
    
    const files = event.files || [event.file];
    
    for (const file of files) {
      // 画像ファイルかチェック
      if (file.mimetype && file.mimetype.startsWith('image/')) {
        try {
          // 画像を解析
          const analysis = await analyzeCropImage(file.url_private, env);
          
          // 結果をSlackに投稿
          await sendSlackMessage(
            event.channel,
            formatAnalysisResult(analysis, file.name),
            env.SLACK_BOT_TOKEN
          );
        } catch (error) {
          console.error('Error analyzing image:', error);
          await sendSlackMessage(
            event.channel,
            `画像の解析中にエラーが発生しました: ${file.name}`,
            env.SLACK_BOT_TOKEN
          );
        }
      }
    }
  }
}

/**
 * 解析結果をフォーマット
 */
function formatAnalysisResult(analysis, filename) {
  return {
    text: `🌾 農作物画像解析結果: ${filename}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🌾 農作物画像解析結果`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*ファイル名:* ${filename}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*作物の種類:*\n${analysis.cropType || '不明'}`
          },
          {
            type: 'mrkdwn',
            text: `*成長段階:*\n${analysis.growthStage || '不明'}`
          },
          {
            type: 'mrkdwn',
            text: `*健康状態:*\n${analysis.healthStatus || '不明'}`
          },
          {
            type: 'mrkdwn',
            text: `*信頼度:*\n${analysis.confidence ? (analysis.confidence * 100).toFixed(1) + '%' : '不明'}`
          }
        ]
      }
    ]
  };

  const result = {
    text: `🌾 農作物画像解析結果: ${filename}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🌾 農作物画像解析結果`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*ファイル名:* ${filename}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*作物の種類:*\n${analysis.cropType || '不明'}`
          },
          {
            type: 'mrkdwn',
            text: `*成長段階:*\n${analysis.growthStage || '不明'}`
          },
          {
            type: 'mrkdwn',
            text: `*健康状態:*\n${analysis.healthStatus || '不明'}`
          },
          {
            type: 'mrkdwn',
            text: `*信頼度:*\n${analysis.confidence ? (analysis.confidence * 100).toFixed(1) + '%' : '不明'}`
          }
        ]
      }
    ]
  };

  if (analysis.recommendations && analysis.recommendations.length > 0) {
    result.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*推奨事項:*\n${analysis.recommendations.join('\n')}`
      }
    });
  }

  if (analysis.diseases && analysis.diseases.length > 0) {
    result.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*検出された病気・害虫:*\n${analysis.diseases.join('\n')}`
      }
    });
  }

  return result;
}