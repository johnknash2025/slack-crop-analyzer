#!/bin/bash

# Slack農作物画像解析ボット デプロイスクリプト

echo "🌾 Slack農作物画像解析ボットをデプロイします..."

# 環境変数の確認
if [ -z "$SLACK_BOT_TOKEN" ] || [ -z "$SLACK_SIGNING_SECRET" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ 必要な環境変数が設定されていません"
    echo "以下の環境変数を設定してください："
    echo "- SLACK_BOT_TOKEN"
    echo "- SLACK_SIGNING_SECRET" 
    echo "- OPENAI_API_KEY"
    exit 1
fi

# wrangler.tomlに環境変数を設定
echo "📝 環境変数を設定中..."
wrangler secret put SLACK_BOT_TOKEN --env production
wrangler secret put SLACK_SIGNING_SECRET --env production
wrangler secret put OPENAI_API_KEY --env production

# デプロイ実行
echo "🚀 Cloudflare Workersにデプロイ中..."
wrangler deploy --env production

if [ $? -eq 0 ]; then
    echo "✅ デプロイが完了しました！"
    echo ""
    echo "次のステップ："
    echo "1. Slack App設定でRequest URLを更新"
    echo "2. ボットをチャンネルに招待"
    echo "3. 農作物画像をアップロードしてテスト"
else
    echo "❌ デプロイに失敗しました"
    exit 1
fi