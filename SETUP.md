# セットアップガイド

## 1. 前提条件

- Node.js (v18以上)
- Cloudflare アカウント
- Slack ワークスペースの管理者権限
- OpenAI APIキー

## 2. Cloudflare Workers CLI のインストール

```bash
npm install -g wrangler
wrangler login
```

## 3. Slack アプリの作成

### 3.1 Slack API でアプリを作成
1. https://api.slack.com/apps にアクセス
2. "Create New App" → "From scratch" を選択
3. アプリ名と対象ワークスペースを設定

### 3.2 Bot Token Scopes の設定
OAuth & Permissions ページで以下のスコープを追加：
- `chat:write` - メッセージ送信
- `files:read` - ファイル読み取り
- `channels:history` - チャンネル履歴読み取り

### 3.3 Event Subscriptions の設定
1. Event Subscriptions を有効化
2. Request URL: `https://your-worker.your-subdomain.workers.dev`
3. Subscribe to bot events:
   - `file_shared`
   - `message.channels`

### 3.4 トークンの取得
- Bot User OAuth Token (`xoxb-` で始まる)
- Signing Secret (Basic Information ページ)

## 4. OpenAI API キーの取得

1. https://platform.openai.com/api-keys にアクセス
2. 新しいAPIキーを作成
3. GPT-4 Vision の利用権限があることを確認

## 5. プロジェクトのデプロイ

### 5.1 環境変数の設定
```bash
cd slack-crop-analyzer
cp .env.example .env
# .env ファイルを編集して実際の値を設定
```

### 5.2 依存関係のインストール
```bash
npm install
```

### 5.3 デプロイ
```bash
# 手動デプロイ
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put SLACK_SIGNING_SECRET  
wrangler secret put OPENAI_API_KEY
wrangler deploy

# または自動デプロイスクリプト使用
./deploy.sh
```

## 6. Slack アプリの最終設定

### 6.1 Request URL の更新
Event Subscriptions ページで Request URL を実際のWorker URLに更新

### 6.2 アプリのインストール
OAuth & Permissions ページで "Install to Workspace"

### 6.3 ボットをチャンネルに招待
```
/invite @your-bot-name
```

## 7. テスト

1. 農作物の画像をSlackチャンネルにアップロード
2. ボットが自動的に解析結果を投稿することを確認

## トラブルシューティング

### よくあるエラー

**署名検証エラー**
- Signing Secret が正しく設定されているか確認
- Request URL が正しいか確認

**ファイル読み取りエラー**  
- Bot Token Scopes に `files:read` が含まれているか確認
- ボットがチャンネルに招待されているか確認

**AI API エラー**
- OpenAI API キーが有効か確認
- API利用制限に達していないか確認
- GPT-4 Vision へのアクセス権があるか確認

### ログの確認
```bash
wrangler tail
```

### 開発環境での実行
```bash
npm run dev
```