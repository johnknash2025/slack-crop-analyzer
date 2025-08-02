# Slack農作物画像解析ボット

Cloudflare Workersで動作するSlack用の農作物画像解析ボットです。投稿された農作物の画像を自動的に解析し、作物の種類、成長段階、健康状態などの情報を提供します。

## 機能

- 🌾 農作物の種類識別
- 📈 成長段階の判定
- 🏥 健康状態の評価
- 🐛 病気・害虫の検出
- 💡 栽培に関する推奨事項の提供
- 📊 分析結果の信頼度表示

## セットアップ

### 1. 必要な環境変数

`wrangler.toml`ファイルで以下の環境変数を設定してください：

```toml
[env.production.vars]
SLACK_BOT_TOKEN = "xoxb-your-bot-token"
SLACK_SIGNING_SECRET = "your-signing-secret"
OPENAI_API_KEY = "your-openai-api-key"
```

### 2. Slackアプリの設定

1. [Slack API](https://api.slack.com/apps)でアプリを作成
2. Bot Token Scopesで以下の権限を追加：
   - `chat:write`
   - `files:read`
   - `channels:history`
3. Event Subscriptionsを有効化し、以下のイベントを購読：
   - `file_shared`
   - `message.channels`
4. Request URLにデプロイしたWorkerのURLを設定

### 3. デプロイ

```bash
# 依存関係をインストール
npm install

# 開発環境で実行
npm run dev

# 本番環境にデプロイ
npm run deploy
```

## 使用方法

1. Slackチャンネルに農作物の画像をアップロード
2. ボットが自動的に画像を解析
3. 解析結果がチャンネルに投稿される

## 対応画像形式

- JPEG
- PNG
- GIF
- WebP

## AI画像解析サービス

現在はOpenAI Vision APIを使用していますが、以下のサービスにも対応可能：

- Google Cloud Vision API
- Azure Computer Vision
- AWS Rekognition
- カスタムAIモデル

## カスタマイズ

### 解析プロンプトの変更

`src/services/image-analyzer.js`の`analyzeWithOpenAI`関数内のプロンプトを編集することで、解析内容をカスタマイズできます。

### 他のAIサービスの使用

`src/services/image-analyzer.js`に新しい解析関数を追加し、`analyzeCropImage`関数で使用するサービスを切り替えることができます。

## トラブルシューティング

### よくある問題

1. **画像が解析されない**
   - Slack Bot Tokenが正しく設定されているか確認
   - ファイル読み取り権限が付与されているか確認

2. **署名検証エラー**
   - Slack Signing Secretが正しく設定されているか確認
   - リクエストのタイムスタンプが5分以内か確認

3. **AI API エラー**
   - API キーが有効か確認
   - API の利用制限に達していないか確認

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。