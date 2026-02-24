import { useRef, useCallback } from 'react';

export const useVideoTrimming = (
  timelineRef: React.RefObject<HTMLDivElement>,
  setTrimRange: React.Dispatch<React.SetStateAction<[number, number]>>,
  setTrimEnabled: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const isDraggingRef = useRef(false);
  const activeDragHandleRef = useRef<'start' | 'end' | null>(null);

  // Handle mouse down on timeline handles
  const handleMouseDown = (e: React.MouseEvent, handle: 'start' | 'end') => {
    isDraggingRef.current = true;
    activeDragHandleRef.current = handle;
    document.body.style.cursor = 'ew-resize';
    e.preventDefault(); // Prevent text selection
  };

  // Setup dragging event listeners
  const setupDragListeners = useCallback(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !timelineRef.current || !activeDragHandleRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));

      setTrimRange((prevRange) => {
        if (activeDragHandleRef.current === 'start') {
          // Ensure start handle doesn't go beyond end handle
          return [Math.min(position, prevRange[1] - 1), prevRange[1]];
        } else {
          // Ensure end handle doesn't go below start handle
          return [prevRange[0], Math.max(prevRange[0] + 1, position)];
        }
      });

      // Enable trim button as soon as handles are moved
      setTrimEnabled(true);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      activeDragHandleRef.current = null;
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [timelineRef, setTrimRange, setTrimEnabled]);

  return {
    isDraggingRef,
    activeDragHandleRef,
    handleMouseDown,
    setupDragListeners,
  };
};
