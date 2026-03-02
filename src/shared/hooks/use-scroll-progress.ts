import { useEffect, useState, useRef } from 'react';

export const useScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      setProgress((scrollTop / (scrollHeight - clientHeight)) * 100);

      setIsScrollingUp(scrollTop < prevScrollY.current);

      prevScrollY.current = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress, isScrollingUp };
};
