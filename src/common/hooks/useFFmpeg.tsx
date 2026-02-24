// src/hooks/useFFmpeg.ts
import { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

export const useFFmpeg = () => {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [ffmpegError, setFfmpegError] = useState<string | null>(null);
  const [processingTrim, setProcessingTrim] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Load FFmpeg when component mounts
  useEffect(() => {
    let ffmpegInstance: FFmpeg | null = null;

    const loadFFmpeg = async () => {
      try {
        setFfmpegLoading(true);
        setFfmpegError(null);

        // Using a more recent and potentially more stable version
        const baseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm';
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
        const workerURL = await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript');

        ffmpegInstance = new FFmpeg();
        ffmpegInstance.on('log', ({ message }) => console.log('FFmpeg Log:', message));

        await ffmpegInstance.load({
          coreURL,
          wasmURL,
          workerURL,
        });

        setFfmpeg(ffmpegInstance);
        setFfmpegLoaded(true);
        console.log('FFmpeg loaded successfully');
      } catch (error: any) {
        console.error('Error loading FFmpeg:', error);
        setFfmpegError(error.message || 'Failed to load FFmpeg');
      } finally {
        setFfmpegLoading(false);
      }
    };

    loadFFmpeg();

    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      if (ffmpegInstance && typeof ffmpegInstance.terminate === 'function') {
        ffmpegInstance.terminate();
        console.log('FFmpeg worker terminated.');
      } else if (ffmpegInstance) {
        console.warn('FFmpeg terminate function not found. No explicit termination performed.');
      }
    };
  }, []);

  // Process video and trim it using FFmpeg
  const processVideoTrim = async (videoSrc: string | undefined, trimRange: [number, number], videoDuration: number) => {
    if (!ffmpegLoaded || !videoSrc || !ffmpeg) {
      console.error('FFmpeg not loaded or video not available');
      return;
    }

    try {
      setProcessingTrim(true);

      // Calculate trim points in seconds
      const startTime = (trimRange[0] / 100) * videoDuration;
      const endTime = (trimRange[1] / 100) * videoDuration;

      console.log(`Trimming video from ${formatFFmpegTime(startTime)} to ${formatFFmpegTime(endTime)}`);

      // Fetch the video file
      const videoFile = await fetch(videoSrc).then((res) => res.blob());
      const videoData = await fetchFile(videoFile);

      // Write the file to FFmpeg's virtual file system
      await ffmpeg.writeFile('input.mp4', videoData);

      // Run FFmpeg command
      await ffmpeg.exec([
        '-ss',
        formatFFmpegTime(startTime),
        '-to',
        formatFFmpegTime(endTime),
        '-i',
        'input.mp4',
        '-c',
        'copy',
        'output.mp4',
      ]);

      // Read the output file
      const data: any = await ffmpeg.readFile('output.mp4');

      // Create a download URL
      const blob = new Blob([data?.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // Clean up FFmpeg filesystem
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');

      console.log('Video trimmed successfully');
    } catch (error) {
      console.error('Error trimming video:', error);
    } finally {
      setProcessingTrim(false);
    }
  };

  // Download the trimmed video
  const downloadTrimmedVideo = () => {
    if (!downloadUrl) return;

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `trimmed-video.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    ffmpeg,
    ffmpegLoaded,
    ffmpegLoading,
    ffmpegError,
    processingTrim,
    downloadUrl,
    processVideoTrim,
    downloadTrimmedVideo,
  };
};

// src/hooks/useVideoTrimming.ts
import { useRef, useCallback } from 'react';
import { formatFFmpegTime } from '../../pages/insurer/video-management/dashcam-footage/video-utilities';

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
