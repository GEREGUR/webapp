import { useLayoutEffect, useState } from 'react';

export const useEnsureScrollable = (deps: unknown[]) => {
  const [padding, setPadding] = useState(0);

  useLayoutEffect(() => {
    const viewportHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (documentHeight <= viewportHeight) {
      setPadding(viewportHeight - documentHeight + 24);
    } else {
      setPadding(0);
    }
  }, deps);

  return padding;
};
