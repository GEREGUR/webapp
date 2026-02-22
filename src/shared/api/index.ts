import axios from 'axios';
import { retrieveLaunchParams, retrieveRawInitData } from '@tma.js/sdk-react';

interface TelegramUserData {
  id: number;
  first_name?: string;
  username?: string;
  photo_url?: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const initData = getTelegramInitData();
  if (initData) {
    config.headers.x_telegram_data = initData;
  }

  config.headers['ngrok-skip-browser-warning'] = 'true';

  return config;
});

const getTelegramInitData = (): string | null => {
  try {
    return retrieveRawInitData() || null;
  } catch {
    return null;
  }
};

export const getTelegramUserData = (): TelegramUserData | null => {
  try {
    const launchParams = retrieveLaunchParams();
    const user = launchParams.tgWebAppData?.user;
    if (!user || typeof user.id !== 'number') {
      return null;
    }
    return {
      id: user.id,
      first_name: user.first_name,
      username: user.username,
      photo_url: user.photo_url,
    };
  } catch {
    return null;
  }
};

export const getRequiredUserId = (): number => {
  const telegramUser = getTelegramUserData();
  if (telegramUser?.id) {
    return telegramUser.id;
  }

  if (import.meta.env.DEV) {
    return 1;
  }

  throw new Error('Unable to determine user_id for API request');
};
