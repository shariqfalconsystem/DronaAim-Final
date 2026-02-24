import { useEffect, useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import {
  convertKmToMiles,
  formatDateTime,
  formatScore,
  formatTotalDistance,
  trimLocation,
  trimToTwoDecimals,
} from '../../utility/utilities';
import { RiDashboard2Line } from '@remixicon/react';
import CompletedBox from '../../assets/icons/completed-box.png';
import ActiveNavigation from '../../assets/icons/active-navigation.png';
import StartIcon from '../../assets/icons/start-pin.png';
import EndIcon from '../../assets/icons/end-pin.png';
import EstStartIcon from '../../assets/icons/est-start-pin.png';
import EstEndIcon from '../../assets/icons/est-end-pin.png';
import TripDistanceIcon from '../../assets/icons/trip-distance.png';
import InfoItem from '../vehicle-details/info-item';
import VehicleSafetyScoreBox from '../vehicle-details/vehicle-score-box';
import Truncated from '../../assets/icons/orphan.png';

const DriverTripsOverview = ({ latestTrip }: any) => {
  const isStartEstimated = latestTrip?.estimatedStartAddress || false;
  const isEndEstimated = latestTrip?.estimatedEndAddress || false;

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: 2,
        backgroundColor: '#fff',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="h6" sx={{ pr: 1, borderRight: '2px solid black', fontSize: '1rem' }}>
                Latest Trip
              </Typography>
              <Box
                sx={{
                  border: latestTrip?.tripStatus === 'Completed' ? '1px solid #427890' : '1px solid #d3c7b2',
                  borderRadius: '10px',
                  bgcolor: latestTrip?.tripStatus === 'Completed' ? '#F6FFFA' : '#fbf3e4',
                  px: 1,
                  ml: 1,
                }}
              >
                {latestTrip?.tripStatus ? (
                  latestTrip.tripStatus === 'Completed' ? (
                    <Typography
                      sx={{
                        ml: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'green',
                        py: 0.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      <img src={CompletedBox} alt="Completed" />
                      &nbsp; Completed
                    </Typography>
                  ) : latestTrip.tripStatus === 'Started' && latestTrip?.isOrphaned === true ? (
                    <Typography
                      sx={{
                        ml: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: '#4a4a4a',
                        py: 0.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      <img src={Truncated} alt="Truncated" />
                      &nbsp; Truncated
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        ml: 1,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'orange',
                        py: 0.5,
                        fontSize: '0.75rem',
                      }}
                    >
                      <img src={ActiveNavigation} alt="Started" />
                      &nbsp; Started
                    </Typography>
                  )
                ) : (
                  <Typography
                    sx={{
                      ml: 1,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'gray',
                      py: 0.5,
                      fontSize: '0.75rem',
                    }}
                  >
                    NA
                  </Typography>
                )}
              </Box>
            </Box>
            <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
              {latestTrip?.tripId || 'NA'}
            </Typography>
          </Box>
        </Box>

        <Box>
          {' '}
          <VehicleSafetyScoreBox score={formatScore(latestTrip?.safetyScore)} />{' '}
        </Box>
      </Box>

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ position: 'relative', mt: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            mb: 2,
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={isStartEstimated ? EstStartIcon : StartIcon}
              alt={isStartEstimated ? 'Estimated Start Location' : 'Start Location'}
              width={30}
              height={30}
            />{' '}
            <Box
              sx={{
                width: '2px',
                height: '50px',
                backgroundColor: '#247FAD',
                mt: 1,
                mb: 1,
              }}
            />
            <img
              src={isEndEstimated ? EstEndIcon : EndIcon}
              alt={isEndEstimated ? 'Estimated End Location' : 'End Location'}
              width={30}
              height={30}
            />{' '}
          </Box>

          <Box sx={{ ml: 2, flex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontStyle="italic" mb={1} fontWeight="500">
                {'Start Location'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: '#247FAD',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  maxWidth: '350px',
                }}
              >
                {latestTrip?.startAddress && latestTrip?.startAddress !== 'NA' ? (
                  trimLocation(latestTrip?.startAddress, 80)
                ) : (
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#9CACBA' }}>
                    GPS Location Not Available
                  </Typography>
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Start Time:{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: '#247FAD',
                  }}
                >
                  {formatDateTime(latestTrip?.startDate)}
                </span>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontStyle="italic" mb={1} fontWeight="500">
                  {'Last Updated Location'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: '#247FAD',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    maxWidth: '350px',
                  }}
                >
                  {trimLocation(latestTrip?.endAddress, 80)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  End Time:{' '}
                  <span
                    style={{
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: '#247FAD',
                    }}
                  >
                    {formatDateTime(latestTrip?.endDate)}
                  </span>
                </Typography>
              </Box>
              <InfoItem
                icon={<img src={TripDistanceIcon} alt="trip-distance" />}
                value={`${latestTrip?.totalDistanceInMiles || 'NA'} Miles`}
                label="Trip Distance"
                styles={{ marginX: 1, minWidth: '150px' }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DriverTripsOverview;
