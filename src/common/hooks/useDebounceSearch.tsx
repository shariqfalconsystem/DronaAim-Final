import React, { useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash/debounce';

// Custom hook for debounced search
const useDebounceSearch = (callback: (value: any) => void, delay: number) => {
  const debouncedSearch = useCallback(
    debounce((value: any) => {
      callback(value);
    }, delay),
    [callback, delay]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return debouncedSearch;
};

export default useDebounceSearch;
