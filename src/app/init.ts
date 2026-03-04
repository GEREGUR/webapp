import {
  setDebug,
  themeParams,
  initData,
  viewport,
  init as initSDK,
  mockTelegramEnv,
  type ThemeParams,
  retrieveLaunchParams,
  emitEvent,
  miniApp,
  backButton,
  closingBehavior,
} from '@tma.js/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function init(options: {
  debug: boolean;
  eruda: boolean;
  mockForMacOS: boolean;
}): Promise<void> {
  setDebug(options.debug);
  initSDK();

  options.eruda &&
    void import('eruda').then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: window.innerHeight - 50 });
    });

  if (options.mockForMacOS) {
    let firstThemeSent = false;
    mockTelegramEnv({
      onEvent(event, next) {
        if (event.name === 'web_app_request_theme') {
          let tp: ThemeParams = {};
          if (firstThemeSent) {
            tp = themeParams.state();
          } else {
            firstThemeSent = true;
            tp ||= retrieveLaunchParams().tgWebAppThemeParams;
          }
          return emitEvent('theme_changed', { theme_params: tp });
        }

        if (event.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', { left: 0, top: 0, right: 0, bottom: 0 });
        }

        next();
      },
    });
  }

  initData.restore();
  backButton.mount.ifAvailable();
  closingBehavior.mount.ifAvailable();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  const lp = retrieveLaunchParams();

  if (viewport.mount.isAvailable()) {
    void viewport.mount().then(async () => {
      viewport.bindCssVars();
      if (['ios', 'android'].includes(lp.tgWebAppPlatform)) {
        await viewport.requestFullscreen();
      }
    });
  }
}
