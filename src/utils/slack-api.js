/**
 * Slack API関連のユーティリティ
 */

/**
 * Slackチャンネルにメッセージを送信
 */
export async function sendSlackMessage(channel, message, botToken) {
  const url = 'https://slack.com/api/chat.postMessage';
  
  const payload = {
    channel: channel,
    ...message
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

/**
 * Slackファイルをダウンロード
 */
export async function downloadSlackFile(fileUrl, botToken) {
  const response = await fetch(fileUrl, {
    headers: {
      'Authorization': `Bearer ${botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return response;
}