import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { RiCloseCircleLine, RiRefreshLine, RiEarthLine, RiMapPinLine } from '@remixicon/react';
import { MdNavigation, MdWarning } from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import {
  CalculateAndFormatDuration,
  convertKmToMiles,
  formatDateTime,
  formatLocalizedDateWithMonth,
  formatScore,
  formatUserDateWithMonth,
  splitAddressInTwoLines,
  formatTotalDistance,
  trimToTwoDecimals,
} from '../../utility/utilities';
import { ImMeter } from 'react-icons/im';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { GiPathDistance } from 'react-icons/gi';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import { getVehicleDetails, getVehicleStats } from '../../services/fleetManager/vehiclesService';
import { paths } from '../../common/constants/routes';

const StatItem = ({ icon: Icon, value, label }: any) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, bgcolor: '#f5f5f5', p: 1, borderRadius: 1 }}>
    <Box sx={{ mr: 2, color: '#247FAD' }}>{Icon}</Box>
    <Box>
      <Typography variant="body1" sx={{ fontWeight: '600', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: '#666', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

const LiveTrackingDetails: React.FC<any> = ({
  selectedVehicle,
  onClose,
  addresses,
  selectedVehicleDetails,
  fetchLiveTrackingByDevice,
  isLoading,
}) => {
  const navigate = useNavigate();

  const vehicleAddress = useMemo(
    () => addresses[selectedVehicle?.deviceId] || 'Loading address...',
    [addresses, selectedVehicle?.deviceId]
  );

  const [vehicleStats, setVehicleStats] = useState<any>([]);
  const [vehicleDetails, setVehicleDetails] = useState<any>(null);

  const isStarted = selectedVehicle.vehicleStatus === 'active';

  useEffect(() => {
    const fetchVehicleStats = async () => {
      try {
        const { data } = await getVehicleStats(selectedVehicleDetails?.vehicleId);
        setVehicleStats(data);
      } catch (error) {
        console.error('Failed to fetch vehicle stats:', error);
      }
    };

    const fetchVehicleDetails = async () => {
      try {
        const { data } = await getVehicleDetails(selectedVehicleDetails?.vehicleId);
        setVehicleDetails(data);
      } catch (error) {
        console.error('Failed to fetch vehicle details:', error);
      }
    };
    if (selectedVehicleDetails?.vehicleId) {
      fetchVehicleStats();
      fetchVehicleDetails();
    }
  }, [selectedVehicleDetails?.vehicleId]);

  const handleRefresh = useCallback(() => {
    fetchLiveTrackingByDevice(selectedVehicle.deviceId);
  }, [fetchLiveTrackingByDevice, selectedVehicle.deviceId]);

  const handleNavigate = useCallback(() => {
    navigate(`${paths.TRIPDETAILS}/${selectedVehicleDetails?.tripId}?vin=${selectedVehicleDetails?.vin}`);
  }, [navigate, selectedVehicleDetails?.vin]);

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 4,
        }}
      >
        <Typography>Loading live tracking details...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 'auto' }}>
      <Box
        sx={{
          paddingBottom: '10px',
          paddingX: 2,
          boxShadow: '0px 2px 4px 0px #00000040',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'left',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: '#247FAD',
                fontSize: '1rem',
              }}
            >
              {selectedVehicle.vehicleStatus === 'active' ? (
                <MdNavigation size={20} color="#4CAF50" />
              ) : (
                <IoMdCloseCircle size={20} color="#D24537" />
              )}
              {selectedVehicle?.lookup_vehicles[0]?.vehicleId}
              <IconButton aria-label="refresh" onClick={handleRefresh}>
                <RiRefreshLine color="#247FAD" />
              </IconButton>
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 1,
                mt: 1,
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <RiMapPinLine size={20} color="#247FAD" />
              </Box>
              <Box>
                {splitAddressInTwoLines(
                  isStarted ? vehicleAddress : selectedVehicleDetails?.endAddress || selectedVehicleDetails?.endAddress
                )?.map((line: any, index: any) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      color: '#247FAD',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                    }}
                  >
                    {line}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>

          <Box>
            <IconButton onClick={onClose} sx={{ padding: 0 }} disableRipple>
              <RiCloseCircleLine color="#3F5C78" />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 2, mt: 2, bgcolor: '#fff', p: 2, borderRadius: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: '600', fontSize: '0.9rem' }} onClick={handleNavigate}>
            VIN Number : {selectedVehicleDetails?.vin ?? 'NA'}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Device Id : {selectedVehicleDetails?.deviceId ?? 'NA'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Device Provider : {vehicleStats?.deviceProvider ?? 'NA'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          IMEI Number : {selectedVehicleDetails?.imei ?? 'NA'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Make : {vehicleDetails?.make ?? 'NA'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Model : {vehicleDetails?.model ?? 'NA'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Year : {vehicleDetails?.year ?? 'NA'}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          License Plate : {vehicleDetails?.tagLicencePlateNumber ?? 'NA'}
        </Typography>

        <Box sx={{ borderRadius: 1, mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <StatItem
            icon={<ImMeter color="black" size={20} />}
            value={vehicleStats?.totalDistanceInMiles || '0'}
            label="Total Miles (Device)"
          />
          <StatItem
            icon={<WarningAmberOutlinedIcon sx={{ color: 'black', fontSize: 20 }} />}
            value={vehicleStats?.totalIncidents ?? '0'}
            label="Total Events"
          />
          <StatItem
            icon={<GiPathDistance color="black" size={20} />}
            value={vehicleStats?.totalTrips ?? '0'}
            label="Total Trips"
          />
          <StatItem
            icon={<TimerOutlinedIcon sx={{ color: 'black', mr: 1, fontSize: 20 }} />}
            value={CalculateAndFormatDuration(vehicleStats?.totalDeviceHours) ?? '0'}
            label="Total Hours (Device)"
          />
        </Box>
      </Box>

      <Box sx={{ mb: 2, mt: 2, bgcolor: '#fff', p: 2, borderRadius: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#247FAD' }}
            onClick={handleNavigate}
          >
            {isStarted ? 'Ongoing Trip' : 'Last Trip'} - {selectedVehicleDetails?.tripId}
          </Typography>
          <RiEarthLine size={20} />
        </Box>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Driver Name -{' '}
          <span style={{ color: '#247FAD' }}>
            {selectedVehicleDetails?.driverFirstName || selectedVehicleDetails?.driverLastName
              ? `${selectedVehicleDetails?.driverFirstName}
              ${selectedVehicleDetails?.driverLastName}`
              : 'NA'}
          </span>
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Phone No. -{' '}
          <span style={{ color: '#247FAD' }}>
            {selectedVehicleDetails?.primaryPhoneCtryCd || selectedVehicleDetails?.primaryPhone
              ? `${selectedVehicleDetails?.primaryPhoneCtryCd}
              ${selectedVehicleDetails?.primaryPhone}`
              : 'NA'}
          </span>
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Start Location -{' '}
          {selectedVehicleDetails?.startAddress
            ? splitAddressInTwoLines(selectedVehicleDetails?.startAddress)?.map((line: any, index: any) => (
                <Typography
                  component="span"
                  key={index}
                  variant="caption"
                  sx={{ fontSize: '0.8rem', color: '#247FAD' }}
                >
                  {line}
                </Typography>
              ))
            : 'NA'}
          {selectedVehicleDetails?.startAddress !== 'NA' && selectedVehicleDetails?.estimatedStartAddress && (
            <Tooltip title="Start location estimated">
              <span>
                <MdWarning color="orange" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </span>
            </Tooltip>
          )}
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Start Time -{' '}
          <span style={{ color: '#247FAD' }}>
            {selectedVehicleDetails?.startLocalizedTsInMilliSeconds
              ? formatLocalizedDateWithMonth(
                  selectedVehicleDetails?.startLocalizedTsInMilliSeconds,
                  selectedVehicleDetails?.startTzAbbreviation
                ).dateWithTmz
              : selectedVehicleDetails?.startDate
              ? formatUserDateWithMonth(selectedVehicleDetails?.startDate)?.date
              : 'NA'}
          </span>
        </Typography>

        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          End Location -
          {selectedVehicleDetails?.endAddress
            ? splitAddressInTwoLines(selectedVehicleDetails?.endAddress)?.map((line: any, index: any) => (
                <Typography
                  component="span"
                  key={index}
                  variant="caption"
                  sx={{ fontSize: '0.8rem', color: '#247FAD' }}
                >
                  {line}
                </Typography>
              ))
            : 'NA'}
          {selectedVehicleDetails?.endAddress !== 'NA' && selectedVehicleDetails?.estimatedEndAddress && (
            <Tooltip title="End location estimated">
              <span>
                <MdWarning color="orange" style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </span>
            </Tooltip>
          )}
        </Typography>

        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          End Time -{' '}
          <span
            style={{
              color: isStarted ? '#979797' : '#247FAD',
            }}
          >
            {isStarted
              ? 'No Data Found'
              : selectedVehicleDetails?.endLocalizedTsInMilliSeconds
              ? formatLocalizedDateWithMonth(
                  selectedVehicleDetails?.endLocalizedTsInMilliSeconds,
                  selectedVehicleDetails?.endTzAbbreviation
                ).dateWithTmz
              : selectedVehicleDetails?.endDate
              ? formatUserDateWithMonth(selectedVehicleDetails?.endDate)?.date
              : 'NA'}
          </span>
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 1 }}>
          Distance Covered -{' '}
          <span style={{ color: '#979797' }}>
            {selectedVehicleDetails?.totalDistanceInMiles || '0'}
            Miles
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default LiveTrackingDetails;
