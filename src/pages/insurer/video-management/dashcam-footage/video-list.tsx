import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Typography as MuiTypography, Typography, CircularProgress } from '@mui/material';
import { Share, Download } from '@mui/icons-material';
import { formatTimestamp } from '../../../../utility/utilities';

interface VideoSubRequest {
  imei: string;
  deviceId: string;
  fleetId: string;
  requestId: string;
  subRequestId: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  vendorRequestId?: string;
  url?: string;
}

interface VideoListProps {
  videos: VideoSubRequest[];
  selectedVideoIndex: number;
  activePage: number;
  totalPages: number;
  itemsPerPage: number;
  baseUrl: string;
  onVideoSelect: (video: VideoSubRequest, index: number) => void;
  onShare: (subRequestId: string) => void;
  onDownload: (video: VideoSubRequest) => Promise<void>;
  onPreviousPage: () => void;
  onNextPage: () => void;
  overallTimeRange: any;
}

// Component to generate video thumbnail from URL
const VideoThumbnail: React.FC<{ videoUrl: string }> = ({ videoUrl }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    let didCancel = false;

    const generateThumbnail = () => {
      if (!video.videoWidth || !video.videoHeight) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');

        if (!didCancel) {
          setThumbnailUrl(dataUrl);
        }
      }
    };

    const handleLoadedMetadata = () => {
      video.currentTime = 1;
    };

    const handleSeeked = () => {
      generateThumbnail();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);

    // Use .src instead of setting in JSX
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.load();

    return () => {
      didCancel = true;
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [videoUrl]);

  return (
    <>
      <video ref={videoRef} style={{ display: 'none' }} preload="metadata" />
      {thumbnailUrl ? (
        <Box
          component="img"
          src={thumbnailUrl}
          alt="Video thumbnail"
          sx={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '80px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MuiTypography variant="caption" color="text.secondary">
            Loading...
          </MuiTypography>
        </Box>
      )}
    </>
  );
};

const VideoList: React.FC<VideoListProps> = ({
  videos,
  selectedVideoIndex,
  activePage,
  totalPages,
  itemsPerPage,
  baseUrl,
  onVideoSelect,
  onShare,
  onDownload,
  onPreviousPage,
  onNextPage,
  overallTimeRange,
}) => {
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(null);

  const handleDownloadClick = async (e: React.MouseEvent, video: VideoSubRequest) => {
    e.stopPropagation();
    if (downloadingVideoId) return;

    try {
      setDownloadingVideoId(video.subRequestId);
      await onDownload(video);
    } catch (error) {
      console.error('Download failed', error);
    } finally {
      setDownloadingVideoId(null);
    }
  };

  return (
    <Box
      sx={{
        width: '40%',
        maxHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        backgroundColor: '#fff',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          Video footage: {overallTimeRange}
        </Typography>
      </Box>

      {/* Scrollable Video List */}
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <Box
              key={video.subRequestId}
              sx={{
                boxShadow: 'none',
                maxHeight: '100px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                backgroundColor:
                  selectedVideoIndex === (activePage - 1) * itemsPerPage + index ? 'rgba(113, 222, 236, 0.2)' : 'none',
                borderLeft:
                  selectedVideoIndex === (activePage - 1) * itemsPerPage + index ? '4px solid #83D860' : 'none',
                m: 2,
                p: 2,
              }}
              onClick={() => onVideoSelect(video, index)}
            >
              <Box sx={{ position: 'relative', width: '30%' }}>
                {/* Replace static image with dynamic video thumbnail */}
                <VideoThumbnail videoUrl={`${baseUrl}${video.url}`} />
              </Box>
              <Box sx={{ p: 2, mt: 2, flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <MuiTypography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Start:
                    </MuiTypography>
                    <MuiTypography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {formatTimestamp(video.startTime)}
                    </MuiTypography>
                    <MuiTypography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
                      End:
                    </MuiTypography>
                    <MuiTypography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {formatTimestamp(video.endTime)}
                    </MuiTypography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: '#83D860',
                      color: '#003350',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      minWidth: 'auto',
                      py: 0.5,
                      px: 1,
                      '&:hover': {
                        backgroundColor: '#c8e6fa',
                      },
                    }}
                  >
                    Road view
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(`${baseUrl}${video.url}` || '');
                    }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDownloadClick(e, video)}
                    disabled={downloadingVideoId === video.subRequestId}
                  >
                    {downloadingVideoId === video.subRequestId ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Download fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))
        ) : (
          <MuiTypography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            No completed videos found
          </MuiTypography>
        )}
      </Box>

      {/* Footer (Pagination) */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <MuiTypography variant="body2" sx={{ fontSize: '0.75rem' }}>
          Page {activePage} of {totalPages}
        </MuiTypography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            sx={{ mr: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', py: 0.5, px: 1 }}
            disabled={activePage === 1}
            onClick={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', py: 0.5, px: 1 }}
            disabled={activePage === totalPages}
            onClick={onNextPage}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoList;
