import React, { useEffect, useState } from 'react';
import { Container, Box, Typography as MuiTypography } from '@mui/material';
import LoadingScreen from '../../../../components/molecules/loading-screen';
import { useDispatch } from 'react-redux';
import DashcamFootageHeader from './dashcam-footage-header';
import { useParams, useLocation } from 'react-router-dom';
import { getVideoSubRequests } from '../../../../services/insurer/IdevicesService';
import environment from '../../../../environments/environment';
import VideoTimeline from './advanced-video-timeline';
import { formatTimestamp } from '../../../../utility/utilities';
import VideoList from './video-list';
import { getShortUrl } from '../../../../services/fleetManager/shareService';
import { toast } from 'react-toastify';
import ShareDialog from '../../../../components/modals/share-dialog';
import VideoPlayer from './video-player';

// Interface for video sub-request data
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

const VideoManagementFootage: React.FC = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<any>('00:00');
  const [totalTime, setTotalTime] = useState<any>('00:00');
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFootage, setSelectedFootage] = useState('');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [videoSubRequests, setVideoSubRequests] = useState<VideoSubRequest[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTrimRange, setCurrentTrimRange] = useState<[number, number]>([0, 100]);

  // Share and download states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentVideoData, setCurrentVideoData] = useState<VideoSubRequest | null>(null);

  const itemsPerPage = 5;
  const baseUrl = environment.mediaBaseUrl || '';

  // Get requestId from URL params or location state
  const { requestId } = useParams<{ requestId: string }>();
  const location = useLocation();
  const locationRequestId = location.state?.requestId;

  // Use the requestId from params or state
  const activeRequestId = requestId || locationRequestId;

  // Format time for video player (MM:SS)
  const formatTime = (seconds: any) => {
    if (!seconds) return 0;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get video sub-requests data from API
  useEffect(() => {
    const fetchVideoSubRequests = async () => {
      if (!activeRequestId) return;

      try {
        setLoading(true);
        const { data, status } = await getVideoSubRequests(activeRequestId);

        // Filter only completed videos
        const completedVideos = data?.videoSubRequests.filter(
          (video: VideoSubRequest) => video.status === 'completed' && video.url
        );

        setVideoSubRequests(completedVideos);
        setTotalPages(Math.ceil(completedVideos.length / itemsPerPage));

        // Set default selected video if available
        if (completedVideos.length > 0) {
          const firstVideo = completedVideos[0];
          setSelectedFootage(`${formatTimestamp(firstVideo.startTime)} - ${formatTimestamp(firstVideo.endTime)}`);
          setSelectedVideoUrl(`${baseUrl}${firstVideo.url}`);
          setCurrentVideoData(firstVideo);
        }
      } catch (error) {
        console.error('Failed to fetch video sub-requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoSubRequests();
  }, [activeRequestId, baseUrl]);

  // Handle video time update from VideoPlayer component
  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    setCurrentTime(formatTime(currentTime));
    setTotalTime(formatTime(duration));
    setVideoDuration(duration);
    setProgress((currentTime / duration) * 100);
  };

  // Get paginated videos
  const getPaginatedVideos = () => {
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return videoSubRequests.slice(startIndex, endIndex);
  };

  // Handle video selection
  const handleVideoSelect = (video: VideoSubRequest, index: number) => {
    setSelectedFootage(`${formatTimestamp(video.startTime)} - ${formatTimestamp(video.endTime)}`);
    setSelectedVideoUrl(`${baseUrl}${video.url}`);
    setCurrentVideoData(video);
    setSelectedVideoIndex((activePage - 1) * itemsPerPage + index);
    setCurrentTime('00:00'); // Reset time when selecting a new video
    setProgress(0);
  };

  // Handle timeline click for seeking
  const handleTimelineClick = (position: number) => {
    // Calculate position within trim range if needed
    const newTime = position * videoDuration;
    setProgress(position * 100);
    return newTime;
  };

  const handleTrimRangeChange = (newTrimRange: [number, number]) => {
    setCurrentTrimRange(newTrimRange);

    // If video is playing, pause it when trim range changes
    if (isPlaying) {
      setIsPlaying(false);
    }

    // Update the progress to the start of the new trim range
    const newProgress = newTrimRange[0];
    setProgress(newProgress);

    // Update displayed time
    if (videoDuration) {
      const newTime = (newTrimRange[0] / 100) * videoDuration;
      setCurrentTime(formatTime(newTime));
    }
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (activePage > 1) {
      setActivePage(activePage - 1);
    }
  };

  const handleNextPage = () => {
    if (activePage < totalPages) {
      setActivePage(activePage + 1);
    }
  };

  // Handle share
  const handleShare = async (url: string) => {
    try {
      const fullUrl = url;
      const response = await getShortUrl(fullUrl);

      if (response.status === 200) {
        const data = response.data;
        setShortenedUrl(data.alias_url);
        setSelectedDocumentName(`Video Footage`);
        setShareDialogOpen(true);
      } else {
        console.error('Alias API error:', response.data);
        toast.error('Failed to create a shortened URL. Please try again.');
      }
    } catch (error) {
      console.error('Error creating shortened URL:', error);
      toast.error('An error occurred while creating a shortened URL.');
    }
  };

  // Handle download
  const handleDownload = async (video?: VideoSubRequest) => {
    if (!video) return;

    setIsDownloading(true);

    const fullUrl = `${baseUrl}${video?.url}`;

    try {
      // Fetch the video file
      const response = await fetch(fullUrl);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a custom filename
      const customFileName = `Video_Footage_${formatTimestamp(video?.startTime || '')}.mp4`;

      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = customFileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download completed successfully');
    } catch (error) {
      console.error('Error downloading video:', error);
      toast.error('An error occurred while downloading the video.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Extract overall start and end times for the footage header
  const overallTimeRange =
    videoSubRequests.length > 0
      ? `${formatTimestamp(videoSubRequests[0].startTime)} - ${formatTimestamp(
        videoSubRequests[videoSubRequests.length - 1].endTime
      )}`
      : '';

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Box
        mb={2}
        sx={{
          boxShadow: '0px 4px 4px 0px #00000040',
          bgcolor: '#fff',
          py: 2,
          px: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <DashcamFootageHeader activeRequestId={activeRequestId} />
      </Box>

      <Container maxWidth={false} sx={{ px: 3 }}>
        {/* Main Content - Video List and Player side by side */}
        <Box sx={{ display: 'flex', mb: 2, gap: 4 }}>
          {/* Left Side - Video List */}
          <VideoList
            videos={getPaginatedVideos()}
            selectedVideoIndex={selectedVideoIndex}
            activePage={activePage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            baseUrl={baseUrl}
            onVideoSelect={handleVideoSelect}
            onShare={handleShare}
            onDownload={handleDownload}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            overallTimeRange={overallTimeRange}
          />

          {/* Right Side - Video Player - Now using our new component */}
          <Box sx={{ width: '60%' }}>
            <VideoPlayer
              videoUrl={selectedVideoUrl}
              onTimeUpdate={handleVideoTimeUpdate}
              trimRange={currentTrimRange}
            />
          </Box>
        </Box>

        {/* Video Timeline Preview - Shown below the video player */}
        {selectedVideoUrl && (
          <VideoTimeline
            currentTime={currentTime}
            totalTime={totalTime}
            progress={progress}
            videoDuration={videoDuration}
            videoSubRequests={videoSubRequests}
            selectedVideoIndex={selectedVideoIndex}
            selectedFootage={selectedFootage}
            handleTimelineClick={handleTimelineClick}
            onTrimRangeChange={handleTrimRangeChange}
            selectedVideoUrl={selectedVideoUrl}
          />
        )}
      </Container>

      <ShareDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setShortenedUrl('');
          setSelectedDocumentName('');
        }}
        documentUrl={shortenedUrl}
        documentName={selectedDocumentName}
      />
    </>
  );
};

export default VideoManagementFootage;
