# 🚀 Cloudflare Workers デプロイガイド

## 前提条件の確認

### 1. Cloudflareアカウント
- [Cloudflare](https://cloudflare.com)でアカウント作成
- Workers & Pages プランを確認（無料プランでも利用可能）

### 2. 必要なツール
```bash
# Node.js (v18以上)
node --version

# Wrangler CLI
npm install -g wrangler
wrangler --version
```

## デプロイ手順

### Step 1: Wranglerにログイン
```bash
cd slack-crop-analyzer
wrangler login
```
ブラウザが開いてCloudflareアカウントでの認証を求められます。

### Step 2: 依存関係のインストール
```bash
npm install
```

### Step 3: 環境変数の設定
以下の環境変数を設定する必要があります：

```bash
# Slack Bot Token (xoxb-で始まる)
wrangler secret put SLACK_BOT_TOKEN

# Slack Signing Secret
wrangler secret put SLACK_SIGNING_SECRET

# OpenAI API Key
wrangler secret put OPENAI_API_KEY
```

### Step 4: 設定ファイルの確認
`wrangler.toml`を確認：
```toml
name = "slack-crop-analyzer"
main = "src/index.js"
compatibility_date = "2023-12-01"
```

### Step 5: デプロイ実行
```bash
# 開発環境でテスト
npm run dev

# 本番環境にデプロイ
npm run deploy
```

## 必要な環境変数の取得方法

### Slack設定
1. [Slack API](https://api.slack.com/apps)でアプリ作成
2. **Bot Token Scopes**:
   - `chat:write`
   - `files:read`
   - `channels:history`
3. **Event Subscriptions**:
   - `file_shared`
   - `message.channels`
4. **Bot User OAuth Token**をコピー
5. **Signing Secret**をコピー

### OpenAI API Key
1. [OpenAI Platform](https://platform.openai.com/api-keys)
2. 新しいAPIキーを作成
3. GPT-4 Visionへのアクセス権限を確認

## デプロイ後の設定

### 1. Slack Event Subscriptions
- Request URL: `https://slack-crop-analyzer.YOUR_SUBDOMAIN.workers.dev`
- URLを保存してSlack側で検証

### 2. ボットをチャンネルに招待
```
/invite @your-bot-name
```

### 3. テスト
農作物の画像をアップロードして動作確認

## トラブルシューティング

### よくあるエラー

**認証エラー**
```bash
wrangler whoami  # ログイン状態確認
wrangler login   # 再ログイン
```

**環境変数エラー**
```bash
wrangler secret list  # 設定済み環境変数確認
```

**デプロイエラー**
```bash
wrangler tail  # ログ確認
```

### ログの確認
```bash
# リアルタイムログ
wrangler tail

# 特定の期間のログ
wrangler tail --since 1h
```

## 料金について

### Cloudflare Workers 無料プラン
- 100,000リクエスト/日
- CPU時間: 10ms/リクエスト
- 通常の使用では無料プラン内で十分

### OpenAI API 料金
- GPT-4 Vision: 入力トークンあたりの課金
- 画像解析: 1回あたり約$0.01-0.03
- 月間予算設定を推奨

## セキュリティ

### 環境変数の管理
- 本番環境では必ずWrangler secretsを使用
- `.env`ファイルはGitにコミットしない
- 定期的なAPIキーのローテーション

### Slack署名検証
- 全てのリクエストで署名検証を実行
- タイムスタンプベースのリプレイ攻撃防止

## 監視とメンテナンス

### ダッシュボード
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- Workers & Pages セクションで監視

### アラート設定
- エラー率の監視
- レスポンス時間の監視
- 使用量の監視