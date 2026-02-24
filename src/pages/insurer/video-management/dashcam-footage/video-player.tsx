import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

interface VideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  trimRange?: [number, number]; // [start percentage, end percentage]
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onTimeUpdate, initialTime = 0, trimRange = [0, 100] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [endTimeReached, setEndTimeReached] = useState(false);
  const [effectiveRange, setEffectiveRange] = useState<[number, number]>(trimRange);
  const isSeekingRef = useRef(false);
  const lastTrimRangeRef = useRef<[number, number]>(trimRange);

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    if (!seconds && seconds !== 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Convert percentage to time
  const percentToTime = (percent: number) => {
    if (!videoDuration) return '00:00';
    const timeInSeconds = (percent / 100) * videoDuration;
    return formatTime(timeInSeconds);
  };

  // Handle video source change
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Reset play state when video changes
    setIsPlaying(false);
    setEndTimeReached(false);
  }, [videoUrl]);

  // Set initial time when video is loaded and handle metadata
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      // Store video duration for calculations
      setVideoDuration(videoElement.duration);

      // Set initial time based on trim range
      if (trimRange && trimRange[0] > 0) {
        const startTime = (trimRange[0] / 100) * videoElement.duration;
        videoElement.currentTime = startTime;

        // Update effective range state
        setEffectiveRange(trimRange);
      } else if (initialTime && initialTime > 0) {
        videoElement.currentTime = initialTime;
      }

      // Initial time update to parent
      if (onTimeUpdate) {
        onTimeUpdate(videoElement.currentTime, videoElement.duration);
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoUrl, initialTime, onTimeUpdate, trimRange]);

  // Update effective range when trim range changes
  useEffect(() => {
    // Only process if the trim range has actually changed
    if (trimRange[0] !== lastTrimRangeRef.current[0] || trimRange[1] !== lastTrimRangeRef.current[1]) {
      setEffectiveRange(trimRange);
      lastTrimRangeRef.current = trimRange;

      // If video is already loaded, update current time to the start of the trim range
      const videoElement = videoRef.current;
      if (videoElement && videoDuration > 0) {
        const startTime = (trimRange[0] / 100) * videoDuration;
        videoElement.currentTime = startTime;
        setEndTimeReached(false);

        // Update time to parent
        if (onTimeUpdate) {
          onTimeUpdate(startTime, videoDuration);
        }
      }
    }
  }, [trimRange, videoDuration, onTimeUpdate]);

  // Handle time updates and send to parent component
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      // Skip handling during active seeking to prevent conflicts
      if (isSeekingRef.current) return;

      if (onTimeUpdate) {
        onTimeUpdate(videoElement.currentTime, videoElement.duration);
      }

      // Keep video within trim range if defined
      if (effectiveRange && videoDuration > 0) {
        const startTime = (effectiveRange[0] / 100) * videoDuration;
        const endTime = (effectiveRange[1] / 100) * videoDuration;

        // If video goes past the trim end, pause it
        if (videoElement.currentTime >= endTime - 0.1) {
          // Small buffer to avoid precision issues
          if (!endTimeReached) {
            setEndTimeReached(true);
            videoElement.pause();
            setIsPlaying(false);
          }
        } else if (videoElement.currentTime < startTime - 0.1 && !isSeekingRef.current) {
          // Only correct position if significantly outside range and not during seeking
          videoElement.currentTime = startTime;
        } else {
          setEndTimeReached(false);
        }
      }
    };

    const handlePlayPause = () => {
      setIsPlaying(!videoElement.paused);

      // Reset endTimeReached when playing starts
      if (!videoElement.paused) {
        setEndTimeReached(false);

        // Check if we're at the end position, if so, seek back to start
        if (endTimeReached && effectiveRange) {
          const startTime = (effectiveRange[0] / 100) * videoDuration;
          videoElement.currentTime = startTime;
        }
      }
    };

    // Handle seeking to ensure it stays within the trim range
    const handleSeekStart = () => {
      isSeekingRef.current = true;
    };

    const handleSeekEnd = () => {
      if (effectiveRange && videoDuration > 0) {
        const startTime = (effectiveRange[0] / 100) * videoDuration;
        const endTime = (effectiveRange[1] / 100) * videoDuration;

        // Only enforce boundaries after seeking is complete
        if (videoElement.currentTime < startTime) {
          videoElement.currentTime = startTime;
        } else if (videoElement.currentTime > endTime) {
          videoElement.currentTime = startTime; // Go back to start when exceeding end
          if (isPlaying) {
            videoElement.pause();
            setIsPlaying(false);
          }
          setEndTimeReached(true);
        } else {
          setEndTimeReached(false);
        }
      }

      // Small delay to ensure seeked event has fully processed
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 50);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlayPause);
    videoElement.addEventListener('pause', handlePlayPause);
    videoElement.addEventListener('seeking', handleSeekStart);
    videoElement.addEventListener('seeked', handleSeekEnd);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlayPause);
      videoElement.removeEventListener('pause', handlePlayPause);
      videoElement.removeEventListener('seeking', handleSeekStart);
      videoElement.removeEventListener('seeked', handleSeekEnd);
    };
  }, [onTimeUpdate, effectiveRange, videoDuration, endTimeReached, isPlaying]);

  // Seek to specific position by percentage (0-1)
  const seekToPosition = (positionPercent: number) => {
    const videoElement = videoRef.current;
    if (!videoElement || videoDuration <= 0) return;

    isSeekingRef.current = true;

    // If trim range is active, constrain seeking within the range
    if (effectiveRange && (effectiveRange[0] !== 0 || effectiveRange[1] !== 100)) {
      const rangeWidth = effectiveRange[1] - effectiveRange[0];
      const adjustedPosition = effectiveRange[0] + positionPercent * rangeWidth;
      const timePosition = (adjustedPosition / 100) * videoDuration;
      videoElement.currentTime = Math.min(timePosition, (effectiveRange[1] / 100) * videoDuration);
    } else {
      // Normal seeking
      videoElement.currentTime = positionPercent * videoDuration;
    }

    // Reset endTimeReached state when manually seeking
    setEndTimeReached(false);

    // Reset seeking ref after a short delay
    setTimeout(() => {
      isSeekingRef.current = false;
    }, 50);
  };

  // Expose seekToPosition method to parent components
  useEffect(() => {
    if (!videoRef.current) return;

    // Attach the seek method to the video element for external access
    (videoRef.current as any).seekToPosition = seekToPosition;
  }, [videoDuration, effectiveRange]);

  return (
    <Box
      sx={{
        height: '60vh',
        backgroundColor: '#000',
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }}
    >
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            crossOrigin="anonymous"
            controls
            controlsList="nodownload nofullscreen"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {effectiveRange && (effectiveRange[0] > 0 || effectiveRange[1] < 100) && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                zIndex: 10,
              }}
            >
              Playing selected range only ({percentToTime(effectiveRange[0])} - {percentToTime(effectiveRange[1])})
            </Box>
          )}
          {/* Road View Button */}
          <Button
            variant="contained"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              backgroundColor: '#83D860',
              color: '#003350',
              textTransform: 'none',
              fontSize: '0.75rem',
              py: 0.5,
              px: 1,
              zIndex: 10,
              '&:hover': {
                backgroundColor: '#c8e6fa',
              },
            }}
          >
            Road view
          </Button>
        </>
      ) : (
        <Box
          sx={{
            height: '100%',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 1,
          }}
        >
          <Typography variant="body1">Select a video to play</Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoPlayer;
