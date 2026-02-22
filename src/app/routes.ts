import { type ComponentType, lazy } from 'react';

export interface RouteObject {
  path: string;
  Component: ComponentType;
  title: string;
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: lazy(() =>
      import('@/pages/index-page/index-page').then((m) => ({ default: m.IndexPage }))
    ),
    title: 'Home',
  },
  {
    path: '/battle-pass',
    Component: lazy(() =>
      import('@/pages/battle-pass-page/battle-pass-page').then((m) => ({
        default: m.BattlePassPage,
      }))
    ),
    title: 'Battle Pass',
  },
  {
    path: '/inventory',
    Component: lazy(() =>
      import('@/pages/inventory-page/inventory-page').then((m) => ({ default: m.InventoryPage }))
    ),
    title: 'Inventory',
  },
  {
    path: '/awards',
    Component: lazy(() =>
      import('@/pages/awards-page/awards-page').then((m) => ({ default: m.AwardsPage }))
    ),
    title: 'Awards',
  },
  {
    path: '/profile',
    Component: lazy(() =>
      import('@/pages/profile-page/profile-page').then((m) => ({ default: m.ProfilePage }))
    ),
    title: 'Profile',
  },
];
