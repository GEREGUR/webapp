import '@telegram-apps/telegram-ui/dist/styles.css';

import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { retrieveLaunchParams } from '@tma.js/sdk-react';

import { Root } from '@/widgets/root';
import { EnvUnsupported } from '@/widgets/env-unsupported';
import { init } from '@/app/init';
import { routes } from '@/app/routes';

import './index.css';

import './mock-env.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;

  await init({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  }).then(() => {
    root.render(
      <StrictMode>
        <Root routes={routes} />
      </StrictMode>
    );
  });
} catch {
  root.render(<EnvUnsupported />);
}
