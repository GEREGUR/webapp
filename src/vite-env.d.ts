/// <reference types="vite/client" />

declare module '*.svg?react' {
  import type { ComponentType, SVGProps } from 'react';
  const Component: ComponentType<SVGProps<SVGElement>>;
  export default Component;
}

declare module '*.svg' {
  const src: string;
  export default src;
}
