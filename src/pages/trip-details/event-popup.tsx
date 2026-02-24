import React from 'react';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import Slider from 'react-slick';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getAssociatedLabel } from '../../utility/utilities';
import environment from '../../environments/environment';

const CustomPrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        left: '-25px',
        top: '40%',
        transform: 'translateY(-50%)',
        zIndex: 1,
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
        right: '-25px',
        top: '40%',
        transform: 'translateY(-50%)',
        zIndex: 1,
        '&:hover': { bgcolor: 'background.paper' },
      }}
    >
      <ChevronRightIcon />
    </IconButton>
  );
};

const EventPopup = ({ event, onClose, filteredEvents }: any) => {
  const sliderSettings: any = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
  };

  const baseUrl = environment?.mediaBaseUrl;

  const matchingEvent = filteredEvents.find((e: any) => e.eventId === event.id);

  const videos = matchingEvent ? matchingEvent.media.filter((m: any) => m.type === 'mp4') : [];

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        padding: 2,
        zIndex: 1000,
        marginBottom: 1,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        {event.title}
      </Typography>
      <Box sx={{ width: '100%', height: 200, marginBottom: 2 }}>
        {videos.length > 0 ? (
          <Slider {...sliderSettings}>
            {videos?.map((video: any, index: any) => (
              <>
                <div key={index} style={{ position: 'relative' }}>
                  <video
                    src={baseUrl + video?.url}
                    controls
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                  />
                </div>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'relative',
                    bottom: 150,
                    left: 180,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    zIndex: 2,
                  }}
                >
                  {video?.camera == '2' ? 'Driver View' : 'Road View'}
                </Typography>
              </>
            ))}
          </Slider>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" lineHeight="150px">
            No videos available
          </Typography>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 50,
          textAlign: 'center',
          color: 'black',
        }}
      >
        {getAssociatedLabel(matchingEvent?.eventType) || 'Unknown'}
        {`(${matchingEvent?.eventId})`}
      </Typography>{' '}
      <Box sx={{ position: 'absolute', top: 5, right: 5, cursor: 'pointer' }} onClick={onClose}>
        ✖
      </Box>
    </Paper>
  );
};

export default EventPopup;
