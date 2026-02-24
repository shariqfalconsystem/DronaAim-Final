import { Box, Typography } from '@mui/material';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  CalculateAndFormatDuration,
  convertKmToMiles,
  formatLocalizedDateWithMonth,
  formatUserDateWithMonth,
  splitAddressInTwoLines,
  formatTotalDistance,
  trimToTwoDecimals,
} from '../../utility/utilities';
import { GiPathDistance } from 'react-icons/gi';
import StartIcon from '../../assets/icons/start-pin.png';
import EndIcon from '../../assets/icons/end-pin.png';

const LocationOverview = ({ tripsData, totalCount, state }: any) => {
  const startAddress =
    state?.startAddress === 'NA' || !state?.startAddress
      ? 'GPS Location Not Available'
      : state?.startAddress || tripsData?.startAddress || 'GPS Location Not Available';

  const endAddress =
    state?.endAddress === 'NA' || !state?.endAddress
      ? 'GPS Location Not Available'
      : state?.endAddress || tripsData?.endAddress || 'GPS Location Not Available';

  const estimatedStartAddress = state?.estimatedStartAddress || tripsData?.estimatedStartAddress || false;
  const estimatedEndAddress = state?.estimatedEndAddress || tripsData?.estimatedEndAddress || false;

  const isStartEstimated = !!estimatedStartAddress;
  const isEndEstimated = !!estimatedEndAddress;

  // Check if trip status is "Started"
  const isTripStarted = state?.tripStatus === 'Started' || tripsData?.tripStatus === 'Started';

  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: 2,
        backgroundColor: '#fff',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" fontStyle="italic" mb={1} fontWeight="500" whiteSpace="normal">
            Start Location
          </Typography>
          <Typography variant="subtitle2" fontStyle="italic" mb={1} fontWeight="500">
            End Location
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src={StartIcon} width={40} height={40} alt={'Start Location'} />{' '}
            <Box sx={{ ml: 1 }}>
              {splitAddressInTwoLines(startAddress).map((line: string, index: number) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: startAddress === 'GPS Location Not Available' ? '#8b8b8b' : '#247FAD',
                    maxWidth: '500px',
                  }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              borderTop: '3px solid #247FAD',
              flexGrow: 1,
              mx: 1,
              height: 0,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src={EndIcon} width={40} height={40} alt={'End Location'} />{' '}
            <Box sx={{ ml: 1 }}>
              {splitAddressInTwoLines(endAddress).map((line: string, index: number) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: endAddress === 'GPS Location Not Available' ? '#8b8b8b' : '#247FAD',
                    maxWidth: '500px',
                  }}
                >
                  {line}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: -1,
            mb: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Start Date & Time:{' '}
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#247FAD',
              }}
            >
              {tripsData?.startLocalizedTsInMilliSeconds
                ? formatLocalizedDateWithMonth(
                    tripsData?.startLocalizedTsInMilliSeconds,
                    tripsData?.startTzAbbreviation
                  ).dateWithTmz
                : formatUserDateWithMonth(tripsData?.startDate)?.date}
            </span>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            End Date & Time:{' '}
            <span
              style={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#247FAD',
              }}
            >
              {tripsData?.tripStatus === 'Completed'
                ? tripsData?.endLocalizedTsInMilliSeconds
                  ? formatLocalizedDateWithMonth(tripsData?.endLocalizedTsInMilliSeconds, tripsData?.endTzAbbreviation)
                      .dateWithTmz
                  : formatUserDateWithMonth(tripsData?.endDate)?.date
                : 'Not Available'}
            </span>
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#3F5C78',
            color: '#fff',
            p: 1,
            paddingX: 4,
            borderRadius: '7px',
            width: 200,
            height: 50,
            justifyContent: 'center',
          }}
        >
          <TimerOutlinedIcon sx={{ color: '#fff', mr: 1, fontSize: 25 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ justifyContent: 'center', display: 'flex' }}>
              {isTripStarted ? '--' : CalculateAndFormatDuration(tripsData?.tripDuration)}
            </Typography>
            <Typography variant="caption" color="#fff" fontSize="0.7rem">
              Trip Duration
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#3F5C78',
            color: '#fff',
            p: 1,
            paddingX: 4,
            borderRadius: '7px',
            width: 200,
            height: 50,
            justifyContent: 'center',
          }}
        >
          <WarningAmberOutlinedIcon sx={{ color: '#fff', mr: 1, fontSize: 30 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ justifyContent: 'center', display: 'flex' }}>
              {isTripStarted ? '--' : `${totalCount} events`}
            </Typography>
            <Typography variant="caption" color="#fff" fontSize="0.7rem">
              Total Events
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#3F5C78',
            color: '#fff',
            p: 1,
            paddingX: 4,
            borderRadius: '7px',
            width: 200,
            height: 50,
            justifyContent: 'center',
          }}
        >
          <Box sx={{ mr: 1 }}>
            <GiPathDistance color="#fff" size={30} />
          </Box>

          <Box>
            <Typography
              variant="body2"
              fontWeight="bold"
              fontSize="0.8rem"
              noWrap
              sx={{ justifyContent: 'center', display: 'flex' }}
            >
              {isTripStarted
                ? '--'
                : tripsData?.totalDistanceInMiles
                ? `${tripsData?.totalDistanceInMiles} Miles`
                : '0 Miles'}
            </Typography>
            <Typography variant="caption" color="#fff" fontSize="0.7rem">
              Total Distance
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LocationOverview;
