import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DownloadIcon from '@mui/icons-material/Download';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ShareIcon from '@mui/icons-material/Share';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { MdOutlineSpeed } from 'react-icons/md';
import Slider from 'react-slick';
import { toast } from 'react-toastify';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import ShareDialog from '../../components/modals/share-dialog';
import environment from '../../environments/environment';
import { getShortUrl } from '../../services/fleetManager/shareService';
import {
  convertSpeedToMph,
  formatLocalizedDateWithMonth,
  formatUserDateWithMonth,
  getAssociatedLabel,
} from '../../utility/utilities';

interface IncidentReportProps {
  tripEvents: any;
}

const CustomPrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        left: '-40px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'background.paper' },
      }}
    >
      <ChevronLeftIcon />
    </IconButton>
  );
};

const CustomNextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        right: '-40px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'background.paper' },
      }}
    >
      <ChevronRightIcon />
    </IconButton>
  );
};

const IncidentReport: React.FC<IncidentReportProps> = ({ tripEvents }) => {
  const baseUrl = environment?.mediaBaseUrl;

  const [openImage, setOpenImage] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  // Add loading state for downloads
  const [downloadingMedia, setDownloadingMedia] = useState<Record<string, boolean>>({});

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    appendDots: (dots: React.ReactNode) => (
      <Box
        sx={{
          position: 'absolute',
          top: '90%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <ul
          style={{
            marginTop: '20px',
            padding: '10px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            listStyleType: 'none',
          }}
        >
          {dots}
        </ul>
      </Box>
    ),
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  const filteredEvents = tripEvents?.allEvents;

  // Grouping events by eventType
  const groupedEvents = filteredEvents?.reduce((acc: any, event: any) => {
    if (!acc[event.eventType]) {
      acc[event.eventType] = [];
    }
    acc[event.eventType].push(event);
    return acc;
  }, {});

  const handleDocShare = async (url: any, documentName: any) => {
    try {
      const response = await getShortUrl(url);

      if (response.status === 200) {
        const data = response.data;
        setShortenedUrl(data.alias_url);
        setSelectedDocumentName(documentName || 'Media');
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

  const handleDownload = async (url: string, eventType: string, eventDate: string, mediaId: string) => {
    // Set loading state for this specific media
    setDownloadingMedia((prev) => ({ ...prev, [mediaId]: true }));

    try {
      // Fetch the video file
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a custom filename
      const customFileName = `${getAssociatedLabel(eventType)}_${eventDate}.mp4`;

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
      // Reset loading state
      setDownloadingMedia((prev) => ({ ...prev, [mediaId]: false }));
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Events Media
      </Typography>
      {groupedEvents && Object.keys(groupedEvents).length > 0 ? (
        Object.keys(groupedEvents).map((eventType, index) => {
          const hasMp4 = groupedEvents[eventType].some((incident: any) =>
            incident.media?.some((media: any) => media.type === 'mp4')
          );

          return (
            <Box
              key={index}
              mb={3}
              sx={{
                marginTop: 2,
                border: '1px solid #9CACBA',
                borderRadius: '20px',
                padding: 3,
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {getAssociatedLabel(eventType)}
              </Typography>
              <Box sx={{ position: 'relative', margin: '0 30px', paddingBottom: '60px' }}>
                <Slider {...settings}>
                  {hasMp4 &&
                    groupedEvents[eventType].map((incident: any) =>
                      incident.media
                        ?.filter((media: any) => media.type === 'mp4')
                        .map((media: any, mediaIndex: number) => {
                          const mediaId = `${incident.eventId}-${media.url}-${mediaIndex}`;
                          const isDownloading = downloadingMedia[mediaId] || false;

                          console.log('Media : ', media);
                          console.log('incident: ', incident);

                          return (
                            <Box key={mediaIndex} sx={{ padding: '0 10px' }}>
                              <Card sx={{ maxWidth: 360, mx: 'auto', height: '300px' }}>
                                <CardMedia
                                  component="div"
                                  sx={{
                                    height: 0,
                                    paddingTop: '56.25%',
                                    position: 'relative',
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  }}
                                >
                                  <video
                                    controls
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                    }}
                                    controlsList="nodownload"
                                    disablePictureInPicture
                                    onContextMenu={(e: any) => e.preventDefault()}
                                  >
                                    <source src={baseUrl + media?.url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                  </video>
                                  <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                                      onClick={() => handleDocShare(baseUrl + media?.url, incident?.eventId)}
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
                                      disabled={isDownloading}
                                      onClick={() =>
                                        handleDownload(
                                          baseUrl + media?.url,
                                          incident?.eventType,
                                          incident?.localizedTsInMilliSeconds
                                            ? formatLocalizedDateWithMonth(
                                                incident?.localizedTsInMilliSeconds,
                                                incident?.tzAbbreviation
                                              )?.YYYYMMDD
                                            : formatUserDateWithMonth(media?.startTsInMilliseconds).YYYYMMDD,
                                          mediaId
                                        )
                                      }
                                    >
                                      {isDownloading ? (
                                        <CircularProgress size={16} color="inherit" />
                                      ) : (
                                        <DownloadIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Box>
                                  <PlayCircleOutlineIcon
                                    sx={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      transform: 'translate(-50%, -50%)',
                                      fontSize: 48,
                                      color: 'white',
                                      pointerEvents: 'none',
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      position: 'absolute',
                                      top: 5,
                                      right: 5,
                                      color: 'white',
                                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                      padding: '2px 4px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    {media?.camera == '2' ? 'Driver View' : 'Road View'}
                                  </Typography>
                                </CardMedia>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">{`${incident?.eventId}`}</Typography>
                                    {incident?.gnssInfo?.speed !== null && (
                                      <Box
                                        sx={{
                                          ml: 1,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          bgcolor: '#e9eef5',
                                          color: '#2b3a4a',
                                          fontWeight: 'bold',
                                          padding: '2px',
                                          fontSize: '0.65rem',
                                          borderRadius: '8px',
                                          border: '1px solid #cdd4da',
                                          gap: '6px',
                                          maxWidth: '100px',
                                        }}
                                      >
                                        <MdOutlineSpeed style={{ fontSize: '1rem', color: '#2b3a4a' }} />
                                        {`${convertSpeedToMph(incident?.gnssInfo?.speed)} mph`}
                                      </Box>
                                    )}
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    {incident?.localizedTsInMilliSeconds
                                      ? formatLocalizedDateWithMonth(
                                          incident?.localizedTsInMilliSeconds,
                                          incident?.tzAbbreviation
                                        )?.dateWithTmz
                                      : formatUserDateWithMonth(incident?.tsInMilliSeconds).date}
                                  </Typography>
                                  <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                                    {incident?.address || 'NA'}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Box>
                          );
                        })
                    )}
                </Slider>
              </Box>
            </Box>
          );
        })
      ) : (
        <Card sx={{ maxWidth: 360, mx: 'auto', padding: 3, mt: 2 }}>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            No events media available.
          </Typography>
        </Card>
      )}
      {/* Modal for full-screen image */}
      <Dialog open={Boolean(openImage)} onClose={() => setOpenImage(null)} maxWidth="lg" fullWidth>
        <DialogContent>
          <img src={openImage || ''} alt="Selected Media" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>
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
    </Box>
  );
};

export default IncidentReport;
