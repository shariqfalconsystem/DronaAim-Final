import { useEffect, useRef } from 'react';

export const usePreviousRoute = (currentPath: string) => {
  const prevPathRef = useRef<string>(currentPath);

  useEffect(() => {
    prevPathRef.current = currentPath;
  }, [currentPath]);

  return prevPathRef.current;
};
