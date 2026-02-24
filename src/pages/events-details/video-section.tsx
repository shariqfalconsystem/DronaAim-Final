import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShareIcon from '@mui/icons-material/Share';
import { Box, CircularProgress, IconButton, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';
import ShareDialog from '../../components/modals/share-dialog';
import environment from '../../environments/environment';
import { getShortUrl } from '../../services/fleetManager/shareService';
import { getAssociatedLabel } from '../../utility/utilities';

const VideoPlayer = ({ title, date, url, eventData, eventDate }: any) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDocShare = async (url: any) => {
    try {
      const response = await getShortUrl(url);

      if (response.status === 200) {
        const data = response.data;
        setShortenedUrl(data.alias_url);
        setSelectedDocumentName(`Event Media- ${eventData?.eventId}`);
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

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Fetch the video file
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a custom filename
      const customFileName = `${getAssociatedLabel(eventData?.eventType)}_${eventDate}.mp4`;

      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = customFileName; // Set the custom filename
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

  return (
    <Paper elevation={3} sx={{ borderRadius: '10px', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls={true}
          light={false}
          playIcon={<PlayArrowIcon sx={{ fontSize: 60, color: 'white' }} />}
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
                onContextMenu: (e: any) => e.preventDefault(),
              },
            },
          }}
        />
        <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
            onClick={() => handleDocShare(url)}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&.Mui-disabled': {
                bgcolor: 'rgba(0,0,0,0.3)',
                color: 'rgba(255,255,255,0.5)',
              },
            }}
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="small" />}
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', bottom: 70, left: 20, color: 'white' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="caption">{date}</Typography>
        </Box>
      </Box>
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
    </Paper>
  );
};

const VideoSection = ({ media, eventData, eventDate }: any) => {
  const baseUrl = environment?.mediaBaseUrl;
  const mp4Media = media.filter((item: any) => item.type === 'mp4');

  return (
    <Box mt={3}>
      {mp4Media.length > 0 ? (
        mp4Media.map((item: any, index: number) => (
          <VideoPlayer
            key={index}
            title={item.camera == 2 ? 'Driver View' : 'Road View'}
            date={item.date}
            url={baseUrl + item.url}
            eventData={eventData}
            eventDate={eventDate}
          />
        ))
      ) : (
        <Paper elevation={3} sx={{ borderRadius: '10px', padding: 2 }}>
          <Typography variant="subtitle1" color="textSecondary">
            Media Not Available
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default VideoSection;
