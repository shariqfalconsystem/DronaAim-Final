import React, { useEffect, useState, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface VideoFramesPreviewProps {
  videoUrl: string;
  totalFrames?: number;
  selectedTime?: number;
  videoDuration: number;
}

const VideoFramesPreview: React.FC<VideoFramesPreviewProps> = ({
  videoUrl,
  totalFrames = 10,
  selectedTime,
  videoDuration,
}) => {
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Extract frames from the video
  useEffect(() => {
    if (!videoUrl || videoDuration <= 0) {
      setFrames([]);
      return;
    }

    const extractFrames = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create video element if it doesn't exist
        if (!videoRef.current) {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          videoRef.current = video;
        }

        // Create canvas if it doesn't exist
        if (!canvasRef.current) {
          const canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          setError('Canvas context not available');
          setLoading(false);
          return;
        }

        // Set video source
        video.src = videoUrl;

        // Wait for video metadata to load
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve();
          // Handle error
          video.onerror = () => {
            setError('Error loading video');
            setLoading(false);
          };
        });

        // Set canvas dimensions
        canvas.width = 120; // Thumbnail width
        canvas.height = 90; // Thumbnail height (16:9 aspect ratio)

        // Extract frames at equal intervals
        const framesList: string[] = [];
        const interval = videoDuration / (totalFrames + 1);

        for (let i = 1; i <= totalFrames; i++) {
          const timePoint = i * interval;
          video.currentTime = timePoint;

          // Wait for the video to seek to the specified time
          await new Promise<void>((resolve) => {
            const seekHandler = () => {
              resolve();
              video.removeEventListener('seeked', seekHandler);
            };
            video.addEventListener('seeked', seekHandler);
          });

          // Draw frame on canvas and get image data
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          framesList.push(frameDataUrl);
        }

        setFrames(framesList);
      } catch (err) {
        setError(`Failed to extract frames: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    extractFrames();
  }, [videoUrl, totalFrames, videoDuration]);

  // Highlight the frame closest to the selected time
  const getSelectedFrameIndex = () => {
    if (!selectedTime || videoDuration <= 0) return -1;
    const interval = videoDuration / (totalFrames + 1);
    return Math.min(Math.floor(selectedTime / interval), totalFrames - 1);
  };

  const selectedFrameIndex = getSelectedFrameIndex();

  return (
    <Box
      sx={{
        mt: 1,
        p: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 1,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
          <Typography sx={{ ml: 2, fontSize: '0.875rem' }}>Extracting frames...</Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          overflow: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {frames.map((frame, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              flexShrink: 0,
              width: 112,
              height: 90,
              mx: 0.5,
              border: index === selectedFrameIndex ? '2px solid #2196f3' : '1px solid #ddd',
              overflow: 'hidden',
              borderRadius: 1,
              boxShadow: index === selectedFrameIndex ? '0 0 0 2px rgba(33, 150, 243, 0.3)' : 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <img
              src={frame}
              alt={`Frame ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                padding: '2px 4px',
                fontSize: '0.6rem',
                textAlign: 'center',
              }}
            >
              {formatTime((index + 1) * (videoDuration / (totalFrames + 1)))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// Format time helper (MM:SS)
const formatTime = (seconds: number) => {
  if (!seconds && seconds !== 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default VideoFramesPreview;
