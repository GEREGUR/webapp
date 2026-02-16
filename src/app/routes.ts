import { type ComponentType, lazy } from 'react';

export interface RouteObject {
  path: string;
  Component: ComponentType;
  title: string;
}

export const routes: RouteObject[] = [
  { path: '/', Component: lazy(() => import('@/pages/index-page/index-page').then(m => ({ default: m.IndexPage }))), title: 'Home' },
  { path: '/init-data', Component: lazy(() => import('@/pages/init-data-page').then(m => ({ default: m.InitDataPage }))), title: 'Init Data' },
  { path: '/theme-params', Component: lazy(() => import('@/pages/theme-params-page').then(m => ({ default: m.ThemeParamsPage }))), title: 'Theme Params' },
  { path: '/launch-params', Component: lazy(() => import('@/pages/launch-params-page').then(m => ({ default: m.LaunchParamsPage }))), title: 'Launch Params' },
  { path: '/ton-connect', Component: lazy(() => import('@/pages/ton-connect-page/ton-connect-page').then(m => ({ default: m.TONConnectPage }))), title: 'TON Connect' },
];
