export const sendTelegramAlert = async (message: string) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram notification');
    }
  } catch (error) {
    console.error('Error sending Telegram alert:', error);
  }
};

export const sendEmailAlert = async (subject: string, message: string) => {
  const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;
  const EMAIL_TO = process.env.EMAIL_TO;
  
  if (!EMAIL_SERVICE_URL || !EMAIL_TO) {
    console.error('Email service not configured');
    return;
  }

  try {
    const response = await fetch(EMAIL_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: EMAIL_TO,
        subject,
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email notification');
    }
  } catch (error) {
    console.error('Error sending email alert:', error);
  }
};