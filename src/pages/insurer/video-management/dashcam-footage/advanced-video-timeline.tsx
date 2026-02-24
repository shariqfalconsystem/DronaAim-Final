import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import TimelineControls from './timeline-control';
import TimelineScrubber from './timeline-scrubber';
import TimelineMarkers from './timeline-markers';
import VideoFramesPreview from './video-frames-preview';
import { formatTime } from './video-utilities';
import { useVideoTrimming } from '../../../../common/hooks/useVideoTrimming';
import { useFFmpeg } from '../../../../common/hooks/useFFmpeg';

interface VideoTimelineProps {
  currentTime: string;
  totalTime: string;
  progress: number;
  videoDuration: number;
  videoSubRequests: unknown[];
  selectedVideoIndex: number;
  selectedFootage: string;
  selectedVideoUrl: string;
  handleTimelineClick: (position: number) => number;
  onTrimRangeChange: (range: [number, number]) => void;
}

const VideoTimeline: React.FC<VideoTimelineProps> = ({
  currentTime,
  totalTime,
  progress,
  videoDuration,
  selectedVideoIndex,
  selectedFootage,
  selectedVideoUrl,
  handleTimelineClick,
  onTrimRangeChange,
}) => {
  const videoRefQuery: any = document.querySelector('video');

  // Timeline refs
  const timelineRef = useRef<HTMLDivElement>(null);

  // Trimming states
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const [trimStartTime, setTrimStartTime] = useState('00:00');
  const [trimEndTime, setTrimEndTime] = useState(totalTime);
  const [trimEnabled, setTrimEnabled] = useState(false);
  const [lastReportedTrimRange, setLastReportedTrimRange] = useState<[number, number]>([0, 100]);
  const trimRangeUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Current time in seconds for the frames preview
  const [currentTimeInSeconds, setCurrentTimeInSeconds] = useState<number>(0);

  // FFmpeg hook
  const {
    ffmpegLoaded,
    ffmpegLoading,
    ffmpegError,
    processVideoTrim,
    downloadUrl,
    processingTrim,
    downloadTrimmedVideo,
  } = useFFmpeg();

  // Use dragging hook
  const { isDraggingRef, activeDragHandleRef, handleMouseDown, setupDragListeners } = useVideoTrimming(
    timelineRef,
    setTrimRange,
    setTrimEnabled
  );

  // Setup event listeners for drag operations
  useEffect(() => {
    const cleanup = setupDragListeners();
    return cleanup;
  }, [setupDragListeners]);

  // Update trim times when range changes and enable trim button
  useEffect(() => {
    if (videoDuration > 0) {
      const startSeconds = (trimRange[0] / 100) * videoDuration;
      const endSeconds = (trimRange[1] / 100) * videoDuration;

      setTrimStartTime(formatTime(startSeconds));
      setTrimEndTime(formatTime(endSeconds));

      // Enable trim button if range is adjusted (not the full video)
      setTrimEnabled(trimRange[0] > 0 || trimRange[1] < 100);

      // Debounce the trim range update to parent
      if (trimRangeUpdateTimeoutRef.current) {
        clearTimeout(trimRangeUpdateTimeoutRef.current);
      }

      // Check if trim range has actually changed before notifying parent
      if (trimRange[0] !== lastReportedTrimRange[0] || trimRange[1] !== lastReportedTrimRange[1]) {
        trimRangeUpdateTimeoutRef.current = setTimeout(() => {
          // Notify parent component about trim range changes
          if (onTrimRangeChange) {
            onTrimRangeChange(trimRange);
            setLastReportedTrimRange(trimRange);
          }
        }, 100);
      }

      // If video element has seekToPosition method
      if (videoRefQuery && typeof videoRefQuery.seekToPosition === 'function' && isDraggingRef.current) {
        if (activeDragHandleRef.current === 'start') {
          // When dragging start handle, seek to the new start position
          videoRefQuery.seekToPosition(trimRange[0] / 100);
        } else if (activeDragHandleRef.current === 'end') {
          // When dragging end handle, seek to near end position
          videoRefQuery.seekToPosition(Math.max(0, trimRange[1] / 100 - 0.05));
        }
      }
    }
  }, [
    trimRange,
    videoDuration,
    isDraggingRef,
    activeDragHandleRef,
    onTrimRangeChange,
    videoRefQuery,
    lastReportedTrimRange,
  ]);

  // Reset trim settings when a new video is selected
  useEffect(() => {
    setTrimRange([0, 100]);
    setTrimEnabled(false);
  }, [selectedVideoIndex]);

  // Update end time when totalTime changes
  useEffect(() => {
    if (totalTime && totalTime !== '00:00') {
      setTrimEndTime(totalTime);
    }
  }, [totalTime]);

  // Calculate current time in seconds whenever progress changes
  useEffect(() => {
    if (videoDuration > 0) {
      const currentTimeSeconds = (progress / 100) * videoDuration;
      setCurrentTimeInSeconds(currentTimeSeconds);
    }
  }, [progress, videoDuration]);

  // Handle click on timeline for seeking
  const handleTimelineClickIn = (e: React.MouseEvent) => {
    // Ignore if we're dragging handles
    if (isDraggingRef.current) return;

    const rect = timelineRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickPosition = (e.clientX - rect.left) / rect.width;

    // Call parent's handleTimelineClick
    if (handleTimelineClick) {
      handleTimelineClick(clickPosition);
    }

    // If video has seekToPosition method
    if (videoRefQuery && typeof (videoRefQuery as any).seekToPosition === 'function') {
      (videoRefQuery as any).seekToPosition(clickPosition);
    }
  };

  // Calculate duration of trimmed segment
  const trimDuration = ((trimRange[1] - trimRange[0]) * videoDuration) / 100;

  return (
    <Box
      sx={{
        mt: 2,
        position: 'relative',
        backgroundColor: '#fff',
        p: 2,
        borderRadius: 2,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <TimelineControls
        selectedFootage={selectedFootage}
        trimStartTime={trimStartTime}
        trimEndTime={trimEndTime}
        downloadUrl={downloadUrl}
        processingTrim={processingTrim}
        trimEnabled={trimEnabled}
        ffmpegLoaded={ffmpegLoaded}
        ffmpegLoading={ffmpegLoading}
        videoSrc={videoRefQuery?.src}
        onTrimClick={() => processVideoTrim(videoRefQuery?.src, trimRange, videoDuration)}
        onDownloadClick={downloadTrimmedVideo}
      />

      {/* FFmpeg loading indicator and error message */}
      {ffmpegLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, alignItems: 'center' }}>
          <Typography sx={{ ml: 1 }}>Loading FFmpeg...</Typography>
        </Box>
      )}

      {ffmpegError && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Typography color="error">{`Error loading FFmpeg: ${ffmpegError}`}</Typography>
        </Box>
      )}

      {/* Timeline with trim handles */}
      {!ffmpegLoading && !ffmpegError && (
        <Box sx={{ position: 'relative', height: '100px', bgcolor: '#f5f5f5', borderRadius: 1, mb: 1 }}>
          {/* Time indicators */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {currentTime || '00:00'}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {totalTime || '00:00'}
            </Typography>
          </Box>

          {/* Timeline scrubber */}
          <TimelineScrubber
            ref={timelineRef}
            trimRange={trimRange}
            progress={progress}
            videoDuration={videoDuration}
            onClick={handleTimelineClickIn}
            onMouseDown={handleMouseDown}
          />

          {/* Time markers */}
          <TimelineMarkers videoDuration={videoDuration} />
        </Box>
      )}

      {/* Video Frames Preview - New component */}
      {selectedVideoUrl && videoDuration > 0 && (
        <VideoFramesPreview
          videoUrl={selectedVideoUrl}
          totalFrames={10}
          selectedTime={currentTimeInSeconds}
          videoDuration={videoDuration}
        />
      )}
    </Box>
  );
};

export default VideoTimeline;
