import { emitEvent, isTMA, mockTelegramEnv } from '@tma.js/sdk-react';

// It is important, to mock the environment only for development purposes. When building the
// application, import.meta.env.DEV will become false, and the code inside will be tree-shaken,
// so you will not see it in your final bundle.
if (import.meta.env.DEV) {
  if (!(await isTMA('complete'))) {
    const themeParams = {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    } as const;
    const noInsets = { left: 0, top: 0, bottom: 0, right: 0 } as const;

    mockTelegramEnv({
      onEvent(e) {
        // Here you can write your own handlers for all known Telegram Mini Apps methods:
        // https://docs.telegram-mini-apps.com/platform/methods
        if (e.name === 'web_app_request_theme') {
          return emitEvent('theme_changed', { theme_params: themeParams });
        }
        if (e.name === 'web_app_request_viewport') {
          return emitEvent('viewport_changed', {
            height: window.innerHeight,
            width: window.innerWidth,
            is_expanded: true,
            is_state_stable: true,
          });
        }
        if (e.name === 'web_app_request_content_safe_area') {
          return emitEvent('content_safe_area_changed', noInsets);
        }
        if (e.name === 'web_app_request_safe_area') {
          return emitEvent('safe_area_changed', noInsets);
        }
      },
      launchParams: new URLSearchParams([
        ['tgWebAppThemeParams', JSON.stringify(themeParams)],
        [
          'tgWebAppData',
          new URLSearchParams([
            ['auth_date', '1772384451'],
            ['hash', '4efa2bf2422fa3c9c779d7a9e90ef26c915bc4e851e9f1279f914b7252994bcf'],
            ['query_id', 'AAFXGC0cAAAAAFcYLRyNphXi'],
            [
              'signature',
              'ubTw2WGvbeB0f2_B0TOrgMjJyz2wjPf0guxOyyHQRUb1yPwnHc-dthm0ie41GdnMmzPfsuFyS5Wp608TvJlADw',
            ],
            [
              'user',
              JSON.stringify({
                id: 279058397,
                first_name: 'George',
                last_name: 'Rubailo',
                language_code: 'en',
              }),
            ],
          ]).toString(),
        ],
        ['tgWebAppVersion', '9.1'],
        ['tgWebAppPlatform', 'macos'],
      ]),
    });

    console.info(
      '⚠️ As long as the current environment was not considered as the Telegram-based one, it was mocked. Take a note, that you should not do it in production and current behavior is only specific to the development process. Environment mocking is also applied only in development mode. So, after building the application, you will not see this behavior and related warning, leading to crashing the application outside Telegram.'
    );
  }
}
