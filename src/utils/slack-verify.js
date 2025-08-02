/**
 * Slackリクエストの署名検証
 */

/**
 * Slackからのリクエストが正当かどうかを検証
 */
export async function verifySlackSignature(body, signature, timestamp, signingSecret) {
  if (!signature || !timestamp || !signingSecret) {
    return false;
  }

  // タイムスタンプが5分以内かチェック（リプレイ攻撃防止）
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
    return false;
  }

  // 署名を生成
  const baseString = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(baseString));
  const computedSignature = 'v0=' + Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 署名を比較
  return computedSignature === signature;
}