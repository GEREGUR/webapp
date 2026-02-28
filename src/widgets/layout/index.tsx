import { useEffect, type FC, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/widgets/header';
import {
  closingBehavior,
  miniApp,
  retrieveLaunchParams,
  swipeBehavior,
  viewport,
} from '@tma.js/sdk-react';
import { useProfile } from '@/entities/user';
import { cn } from '@/shared/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const isFaqPage = pathname === '/faq';
  const hideHeaderLeftSide = pathname === '/profile' || pathname === '/awards';
  const { data: profile } = useProfile();

  const tonBalance = profile?.ton_balance.toString() ?? '0';
  const bpBalance = profile?.internal_balance.toString() ?? '0';

  useEffect(() => {
    const shouldLogBehaviorDebug =
      import.meta.env.DEV || new URLSearchParams(window.location.search).has('tgBehaviorDebug');
    const logBehaviorDebug = (message: string, payload?: Record<string, unknown>) => {
      if (!shouldLogBehaviorDebug) {
        return;
      }

      if (payload) {
        console.info(`[TMA behavior] ${message}`, payload);
        return;
      }

      console.info(`[TMA behavior] ${message}`);
    };

    const getBehaviorSnapshot = (): Record<string, unknown> => {
      const tgWebApp =
        (window as Window & { Telegram?: { WebApp?: Record<string, unknown> } }).Telegram?.WebApp ??
        null;

      let launchParams: ReturnType<typeof retrieveLaunchParams> | null = null;
      try {
        launchParams = retrieveLaunchParams();
      } catch {
        launchParams = null;
      }

      return {
        launchParams: launchParams
          ? {
              platform: launchParams.tgWebAppPlatform,
              version: launchParams.tgWebAppVersion,
            }
          : null,
        miniAppMounted: miniApp.isMounted(),
        closingBehavior: {
          mounted: closingBehavior.isMounted(),
          mountAvailable: closingBehavior.mount.isAvailable(),
          confirmationEnabled: closingBehavior.isConfirmationEnabled(),
          enableConfirmationAvailable: closingBehavior.enableConfirmation.isAvailable(),
        },
        swipeBehavior: {
          mounted: swipeBehavior.isMounted(),
          supported: swipeBehavior.isSupported(),
          mountAvailable: swipeBehavior.mount.isAvailable(),
          verticalEnabled: swipeBehavior.isVerticalEnabled(),
          disableVerticalAvailable: swipeBehavior.disableVertical.isAvailable(),
        },
        telegramWebApp: tgWebApp
          ? {
              platform: tgWebApp.platform,
              version: tgWebApp.version,
              isVerticalSwipesEnabled: tgWebApp.isVerticalSwipesEnabled,
              isClosingConfirmationEnabled: tgWebApp.isClosingConfirmationEnabled,
            }
          : null,
      };
    };

    const runBehaviorStep = (name: string, step: () => void) => {
      try {
        step();
        logBehaviorDebug(`${name}: success`, getBehaviorSnapshot());
      } catch (error) {
        logBehaviorDebug(`${name}: failed`, {
          error: error instanceof Error ? error.message : String(error),
          snapshot: getBehaviorSnapshot(),
        });
      }
    };

    logBehaviorDebug('initial snapshot', getBehaviorSnapshot());

    if (closingBehavior.mount.isAvailable()) {
      runBehaviorStep('closingBehavior.mount', () => closingBehavior.mount());
    } else {
      logBehaviorDebug('closingBehavior.mount unavailable', getBehaviorSnapshot());
    }

    if (swipeBehavior.mount.isAvailable()) {
      runBehaviorStep('swipeBehavior.mount', () => swipeBehavior.mount());
    } else {
      logBehaviorDebug('swipeBehavior.mount unavailable', getBehaviorSnapshot());
    }

    try {
      if (miniApp.setHeaderColor.supports('rgb')) {
        miniApp.setHeaderColor('#000000');
        miniApp.headerColor();
      }
    } catch (e) {
      logBehaviorDebug('miniApp.setHeaderColor failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    try {
      if (
        !closingBehavior.isConfirmationEnabled() &&
        closingBehavior.enableConfirmation.isAvailable()
      ) {
        closingBehavior.enableConfirmation();
      }
    } catch (e) {
      logBehaviorDebug('closingBehavior.enableConfirmation failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    try {
      if (swipeBehavior.isSupported() && swipeBehavior.disableVertical.isAvailable()) {
        swipeBehavior.disableVertical();
      }
    } catch (e) {
      logBehaviorDebug('swipeBehavior.disableVertical failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }

    logBehaviorDebug('final snapshot', getBehaviorSnapshot());
  }, []);

  return (
    <>
      {!isFaqPage && (
        <Header tonBalance={tonBalance} bpBalance={bpBalance} hideLeftSide={hideHeaderLeftSide} />
      )}
      <main
        className={cn(
          'lg:w-full',
          isFaqPage
            ? 'h-[100dvh] overflow-hidden'
            : viewport.isMounted() && viewport.isFullscreen()
              ? 'pt-32'
              : 'pt-10'
        )}
      >
        {children}
      </main>
    </>
  );
};
