# 💰 Cloudflare Workers 使用量制限設定ガイド

## 料金体系の理解

### Cloudflare Workers 無料プラン
- **100,000リクエスト/日** まで無料
- **CPU時間**: 10ms/リクエスト まで無料
- **KV操作**: 1,000回/日 まで無料

### 有料プラン ($5/月〜)
- **10,000,000リクエスト/月** ($0.50/百万リクエスト追加)
- **CPU時間**: 50ms/リクエスト ($12.50/GB-秒追加)
- **KV操作**: 10,000,000回/月 ($0.50/百万操作追加)

## 使用量制限の設定方法

### 1. Cloudflare ダッシュボードでの設定

#### Step 1: 請求設定にアクセス
1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. 右上のアカウントメニュー → **"Billing"** をクリック
3. **"Payment Methods"** でクレジットカードを登録

#### Step 2: 使用量アラートの設定
1. **"Billing"** → **"Usage Alerts"** 
2. **"Create Alert"** をクリック
3. 以下を設定：
   - **Service**: Workers
   - **Threshold**: $4.00 (5ドル予算の80%)
   - **Alert Type**: Email notification

#### Step 3: 支払い制限の設定
1. **"Billing"** → **"Payment Settings"**
2. **"Spending Limits"** を有効化
3. **Monthly Limit**: $5.00 を設定

### 2. Workers設定での制限

#### wrangler.tomlでの設定
```toml
name = "slack-crop-analyzer"
main = "src/index.js"
compatibility_date = "2023-12-01"

# 使用量制限設定
[limits]
cpu_ms = 50  # CPU時間制限 (ms)
```

#### コード内での制限実装
```javascript
// リクエスト数制限の実装例
const DAILY_REQUEST_LIMIT = 1000; // 1日1000リクエストまで

export default {
  async fetch(request, env, ctx) {
    // 使用量チェック
    const usage = await checkDailyUsage(env);
    if (usage.requests > DAILY_REQUEST_LIMIT) {
      return new Response('Daily limit exceeded', { status: 429 });
    }
    
    // 通常の処理...
  }
};
```

## 予算管理のベストプラクティス

### 1. 監視項目
- **リクエスト数**: 1日あたりの処理回数
- **CPU時間**: 画像解析の処理時間
- **外部API呼び出し**: OpenAI API使用量

### 2. コスト最適化

#### 画像サイズ制限
```javascript
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB制限

if (imageSize > MAX_IMAGE_SIZE) {
  return new Response('Image too large', { status: 413 });
}
```

#### キャッシュ活用
```javascript
// 同じ画像の再解析を防ぐ
const cacheKey = `analysis:${imageHash}`;
const cached = await env.CACHE.get(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

#### レート制限
```javascript
// ユーザーあたりの制限
const userLimit = 10; // 1日10回まで
const userUsage = await getUserUsage(userId);
if (userUsage >= userLimit) {
  return new Response('User limit exceeded', { status: 429 });
}
```

## OpenAI API 使用量制限

### 1. OpenAI ダッシュボードでの設定
1. [OpenAI Platform](https://platform.openai.com/usage) にアクセス
2. **"Usage limits"** で月額制限を設定
3. **Hard limit**: $3.00 (Workers予算の一部として)
4. **Soft limit**: $2.00 (アラート用)

### 2. コード内での制限
```javascript
// トークン数制限
const MAX_TOKENS = 1000;
const prompt = cropAnalysisPrompt.substring(0, MAX_TOKENS);

// 画像解像度制限
const resizedImage = await resizeImage(originalImage, 512, 512);
```

## 監視とアラート

### 1. Cloudflare Analytics
- **Workers Analytics** でリアルタイム監視
- **Requests**, **Errors**, **CPU Time** を確認

### 2. 自動アラート設定
```javascript
// 使用量監視関数
async function checkUsageLimits(env) {
  const usage = await getUsageStats(env);
  
  if (usage.cost > 4.0) { // $4到達でアラート
    await sendAlert('Budget warning: $4 reached');
  }
  
  if (usage.cost > 5.0) { // $5到達で停止
    throw new Error('Budget limit exceeded');
  }
}
```

## 緊急停止手順

### 1. Workers無効化
```bash
# 緊急時のWorker停止
wrangler delete slack-crop-analyzer
```

### 2. ダッシュボードから停止
1. Cloudflare Dashboard → Workers & Pages
2. 該当Worker → **"Settings"** → **"Delete"**

## 予算シミュレーション

### 想定使用量 (月間)
- **Slackメッセージ**: 1,000回 → 無料範囲内
- **画像解析**: 100回 → OpenAI: $3.00
- **Workers CPU**: 平均30ms/リクエスト → $1.50
- **合計予想**: 約$4.50/月

### 安全マージン
- **予算設定**: $5.00
- **アラート**: $4.00 (80%)
- **実際の使用**: $4.50予想
- **余裕**: $0.50

## まとめ

1. **Cloudflare**: 月額$5制限 + $4アラート設定
2. **OpenAI**: 月額$3制限 + $2アラート設定  
3. **コード内制限**: リクエスト数・画像サイズ・処理時間
4. **監視**: リアルタイム使用量チェック
5. **緊急停止**: 予算超過時の自動停止機能

これらの設定により、予期しない高額請求を防げます。