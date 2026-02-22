import axios from 'axios';
import { retrieveRawInitData } from '@tma.js/sdk-react';

export const api = axios.create({
  baseURL: import.meta.env.VITE_PROXY_TARGET + import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const initDataRaw = retrieveRawInitData();

    if (initDataRaw) {
      config.headers['x-telegram-data'] = initDataRaw;
      config.headers['ngrok-skip-browser-warning'] = 'true';
    }
  } catch (err) {
    console.error(err);
  }

  return config;
});
