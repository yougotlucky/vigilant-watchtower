export const sendTelegramAlert = async (message: string) => {
  const TELEGRAM_BOT_TOKEN = localStorage.getItem('telegramBotToken');
  const TELEGRAM_CHAT_ID = localStorage.getItem('telegramChatId');
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured in settings');
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
    throw error;
  }
};

export const sendEmailAlert = async (subject: string, message: string) => {
  const EMAIL_SERVICE_URL = localStorage.getItem('emailServiceUrl');
  const EMAIL_TO = localStorage.getItem('emailTo');
  
  if (!EMAIL_SERVICE_URL || !EMAIL_TO) {
    console.error('Email service not configured in settings');
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
    throw error;
  }
};

export const sendWhatsAppAlert = async (message: string) => {
  const WHATSAPP_API_URL = localStorage.getItem('whatsappApiUrl');
  const WHATSAPP_TOKEN = localStorage.getItem('whatsappToken');
  const WHATSAPP_TO = localStorage.getItem('whatsappTo');

  if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN || !WHATSAPP_TO) {
    console.error('WhatsApp credentials not configured in settings');
    return;
  }

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: WHATSAPP_TO,
        type: 'text',
        text: {
          body: message
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp notification');
    }
  } catch (error) {
    console.error('Error sending WhatsApp alert:', error);
    throw error;
  }
};