import { useEffect, useState } from 'react';
import { Box, Divider, Typography } from '@mui/material';
import {
  convertKmToMiles,
  formatDateTime,
  formatScore,
  splitAddressInTwoLines,
  trimLocation,
  formatTotalDistance,
  trimToTwoDecimals,
} from '../../utility/utilities';
import InfoItem from './info-item';
import { RiDashboard2Line } from '@remixicon/react';
import CompletedBox from '../../assets/icons/completed-box.png';
import ActiveNavigation from '../../assets/icons/active-navigation.png';
import StartIcon from '../../assets/icons/start-pin.png';
import EndIcon from '../../assets/icons/end-pin.png';
import EstStartIcon from '../../assets/icons/est-start-pin.png';
import Truncated from '../../assets/icons/orphan.png';
import EstEndIcon from '../../assets/icons/est-end-pin.png';
import VehicleSafetyScoreBox from './vehicle-score-box';
import { GiPathDistance } from 'react-icons/gi';

const VehicleTripOverview = ({ liveTrackingData, latestTrip }: any) => {
  const { startAddress, endAddress } = liveTrackingData;

  const isStartEstimated = liveTrackingData?.estimatedStartAddress || false;
  const isEndEstimated = liveTrackingData?.estimatedEndAddress || false;

  const renderTripStatus = () => {
    if (liveTrackingData?.tripStatus === 'Completed') {
      return (
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
      );
    } else if (liveTrackingData?.tripStatus === 'Started' && liveTrackingData?.isOrphaned === true) {
      return (
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
          <img src={Truncated} alt="Active" />
          &nbsp; Truncated
        </Typography>
      );
    } else if (liveTrackingData?.tripStatus === 'Started') {
      return (
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
          <img src={ActiveNavigation} alt="Active" />
          &nbsp; Started
        </Typography>
      );
    } else {
      return (
        <Typography
          sx={{
            ml: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4a4a4a',
            py: 0.5,
            fontSize: '0.75rem',
          }}
        >
          NA
        </Typography>
      );
    }
  };

  const getStatusBorderColor = () => {
    if (liveTrackingData?.tripStatus === 'Completed') return '1px solid #427890';
    if (liveTrackingData?.tripStatus === 'Started' && liveTrackingData?.isOrphaned === true) return '1px solid #4a4a4a';
    if (liveTrackingData?.tripStatus === 'Started') return '1px solid #d3c7b2';
    return '1px solid #4a4a4a';
  };

  const getStatusBgColor = () => {
    if (liveTrackingData?.tripStatus === 'Completed') return '#F6FFFA';
    // if(liveTrackingData?.tripStatus === 'Started' && liveTrackingData?.isOrphaned === true) return  '#4a4a4a';
    if (liveTrackingData?.tripStatus === 'Started') return '#fbf3e4';
    return '#F5F5F5';
  };

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
        <Box sx={{ display: 'flex' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {latestTrip?.tripId}
          </Typography>
          <Box
            sx={{
              border: getStatusBorderColor(),
              borderRadius: '10px',
              bgcolor: getStatusBgColor(),
              px: 1,
              ml: 1,
              minHeight: '32px',
              minWidth: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderTripStatus()}
          </Box>
        </Box>

        <Box>
          <VehicleSafetyScoreBox score={formatScore(liveTrackingData?.safetyScore)} />
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
              {splitAddressInTwoLines(startAddress)?.map((line: string, index: number) => (
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: startAddress === 'GPS Location Not Available' ? '#8b8b8b' : '#247FAD',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    maxWidth: '350px',
                  }}
                >
                  {line}
                </Typography>
              ))}

              <Typography variant="caption" color="text.secondary">
                Start Date & Time:{' '}
                <span
                  style={{
                    fontStyle: 'italic',
                    fontWeight: 400,
                    color: '#247FAD',
                  }}
                >
                  {formatDateTime(liveTrackingData?.startDate)}
                </span>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontStyle="italic" mb={1} fontWeight="500">
                  {'Last Updated Location'}
                </Typography>

                {splitAddressInTwoLines(endAddress)?.map((line: string, index: number) => (
                  <Typography
                    variant="body2"
                    sx={{
                      fontStyle: 'italic',
                      fontWeight: 600,
                      color: endAddress === 'GPS Location Not Available' ? '#8b8b8b' : '#247FAD',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                      maxWidth: '350px',
                    }}
                  >
                    {line}
                  </Typography>
                ))}
                <Typography variant="caption" color="text.secondary">
                  End Date & Time:{' '}
                  <span
                    style={{
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: '#247FAD',
                    }}
                  >
                    {formatDateTime(liveTrackingData?.endDate)}
                  </span>
                </Typography>
              </Box>
              <InfoItem
                icon={<GiPathDistance size={30} color="#3F5C78" className="trip-icon" />}
                value={
                  liveTrackingData?.totalDistanceInMiles ? `${liveTrackingData?.totalDistanceInMiles} Miles` : '0 Miles'
                }
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

export default VehicleTripOverview;
