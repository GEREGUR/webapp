import axios from "axios";
import { retrieveLaunchParams } from "@tma.js/sdk-react";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const launchParams = retrieveLaunchParams();
    const initData = launchParams.tgWebAppData;

    if (initData) {
      config.headers["X-Telegram-Data"] = initData;
    }
  } catch (err) {
    console.error(err);
  }

  return config;
});
