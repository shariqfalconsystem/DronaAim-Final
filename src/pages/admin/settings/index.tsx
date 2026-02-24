import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  Divider,
  Slider,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ChangeSettingHeader from './setting-header';
import ScoringIcon from '../../../assets/icons/scoring-algo.png';
import { RiCloseCircleFill } from '@remixicon/react';
import ScoringPopup from '../../../assets/icons/scoring_popup.png';
import History from './history';
import { getScoringWeightages, addScoringWeightage } from '../../../services/admin/settingsService';
import { useSelector } from 'react-redux';
import { ScoringConfig, ScoringAlgo } from './type';
import { toast } from 'react-toastify';
import Completed from '../../../assets/icons/completed-box.png';
import Inprogress from '../../../assets/icons/inprogress.png';

const ChangeSetting = () => {
  const [equallyWeightedPercentage, setEquallyWeightedPercentage] = useState(100);
  const [severityAdjustedPercentage, setSeverityAdjustedPercentage] = useState(0);
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [isSliderEnabled, setIsSliderEnabled] = useState(false);
  const [prevEquallyWeightedPercentage, setPrevEquallyWeightedPercentage] = useState(100);
  const [prevSeverityAdjustedPercentage, setPrevSeverityAdjustedPercentage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [view, setView] = useState<'setting' | 'history'>('setting');
  const [scoringData, setScoringData] = useState<ScoringAlgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoringHistory, setScoringHistory] = useState<ScoringConfig[]>([]);
  const [effectiveDate, setEffectiveDate] = useState<number | null>(null);
  const [newScoringWeightages, setNewScoringWeightages] = useState<{
    equallyWeighted: number;
    severityAdjusted: number;
  } | null>(null);
  const [upcomingConfig, setUpcomingConfig] = useState<ScoringConfig | null>(null);

  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);

  const handleSliderChange = (_event: any, newValue: number, algoLabel: string) => {
    if (algoLabel === 'Equi-Weighted Event Scoring') {
      setEquallyWeightedPercentage(newValue);
      setSeverityAdjustedPercentage(100 - newValue);
    } else {
      setSeverityAdjustedPercentage(newValue);
      setEquallyWeightedPercentage(100 - newValue);
    }

    setShowCancelButton(true);
    setIsSliderEnabled(true);
  };
  const handleApplyClick = () => {
    if (!isSliderEnabled) return;
    setSelectedDate('');
    setShowPopup(true);
  };

  const handleCancelClick = () => {
    setEquallyWeightedPercentage(prevEquallyWeightedPercentage);
    setSeverityAdjustedPercentage(prevSeverityAdjustedPercentage);
    setIsSliderEnabled(false);
    setShowCancelButton(false);
  };

  const handlePopupConfirm = async () => {
    try {
      const effectiveTimestamp = new Date(`${selectedDate}T09:00:00`).getTime();

      const payload = {
        effectiveDate: effectiveTimestamp.toString(),
        currentLoggedInUserId: currentUserId,
        weightage: [
          {
            scoringAlgoId: scoringData.find((algo) => (algo.name || (algo as any).scoringAlgoName)?.includes('Equi-Weighted'))?.scoringAlgoId || '',
            scoringAlgoName: 'Equi-Weighted Event Scoring',
            weightage: equallyWeightedPercentage,
          },
          {
            scoringAlgoId: scoringData.find((algo) => (algo.name || (algo as any).scoringAlgoName)?.includes('Severity-Adjusted'))?.scoringAlgoId || '',
            scoringAlgoName: 'Severity-Adjusted Dynamic Scoring',
            weightage: severityAdjustedPercentage,
          },
        ],
      };

      const { status, data: response } = await addScoringWeightage(payload);
      if (status === 200) {
        toast.success(response?.message);
        setEffectiveDate(effectiveTimestamp);
        setNewScoringWeightages({
          equallyWeighted: equallyWeightedPercentage,
          severityAdjusted: severityAdjustedPercentage,
        });

        setIsSliderEnabled(false);
        setShowCancelButton(false);
        setShowPopup(false);
      } else {
        toast.error(response?.data?.details || 'Failed to update scoring weightage.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.details || 'An unexpected error occurred.');
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const now = new Date();
        const today = new Date(now.toDateString());
        const todayTimestamp = today.getTime();

        // 1. Fetch upcoming configs — from today forward
        const upcomingResponse = await getScoringWeightages(currentUserId, todayTimestamp, undefined);
        const upcomingConfigs: ScoringConfig[] = upcomingResponse?.data?.scoringAlgoWeightages || [];

        // 2. Fetch history configs — up to today
        const historyResponse = await getScoringWeightages(currentUserId, undefined, todayTimestamp);
        const allConfigs: ScoringConfig[] = historyResponse?.data?.scoringAlgoWeightages || [];
        setScoringHistory(allConfigs);

        // 3. Fetch current effective config — latest where effectiveDate <= now
        const sliderResponse = await getScoringWeightages(currentUserId, 0, Date.now());
        const sliderConfigs: ScoringConfig[] = sliderResponse?.data?.scoringAlgoWeightages || [];

        const currentEffectiveConfig = sliderConfigs
          .filter((config) => config.effectiveDate <= Date.now())
          .sort((a, b) => b.effectiveDate - a.effectiveDate)[0];

        if (currentEffectiveConfig) {
          const { lookupScoringAlgoMaster } = currentEffectiveConfig;
          setScoringData(lookupScoringAlgoMaster || []);

          const equi = (lookupScoringAlgoMaster || []).find((a) => (a.name || (a as any).scoringAlgoName)?.includes('Equi-Weighted'));
          const severity = (lookupScoringAlgoMaster || []).find((a) => (a.name || (a as any).scoringAlgoName)?.includes('Severity-Adjusted'));

          const equiWeight = equi?.weightage ?? 0;
          const severityWeight = severity?.weightage ?? 0;

          if (effectiveDate && Date.now() >= effectiveDate) {
            setEquallyWeightedPercentage(newScoringWeightages?.equallyWeighted || equiWeight);
            setSeverityAdjustedPercentage(newScoringWeightages?.severityAdjusted || severityWeight);
          } else {
            setEquallyWeightedPercentage(equiWeight);
            setSeverityAdjustedPercentage(severityWeight);
          }

          setPrevEquallyWeightedPercentage(equiWeight);
          setPrevSeverityAdjustedPercentage(severityWeight);
        }

        // 4. Set upcoming config to show based on last config for the date
        const groupedByDate = upcomingConfigs.reduce((acc, config) => {
          const dateOnly = new Date(config.effectiveDate).toDateString();
          if (!acc[dateOnly]) acc[dateOnly] = [];
          acc[dateOnly].push(config);
          return acc;
        }, {} as Record<string, ScoringConfig[]>);

        const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const nextDate = sortedDates[0];

        // Take the last index record from the upcoming configs for the next date
        const upcomingConfig = groupedByDate[nextDate]?.[groupedByDate[nextDate].length - 1] || null;

        setUpcomingConfig(upcomingConfig);
      } catch (error: any) {
        console.error('Error fetching scoring weightages:', error);
        toast.error('Failed to fetch scoring data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUserId, effectiveDate, newScoringWeightages]);

  if (view === 'history') {
    return <History data={scoringHistory} onBack={() => setView('setting')} />;
  }

  const upcomingAlgosToShow = upcomingConfig?.lookupScoringAlgoMaster ?? [];

  return (
    <Box>
      <ChangeSettingHeader />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F5F5', alignItems: 'flex-start', mt: 1 }}>
        <List sx={{ backgroundColor: '#DFE8F0', p: 3, borderRadius: 2, ml: 2, mt: 4 }}>
          <ListItem
            sx={{
              mb: 3,
              mx: 1,
              borderRadius: 2,
              bgcolor: '#247FAD',
              color: '#fff',
              '&:hover': { bgcolor: 'primary.50' },
              cursor: 'pointer',
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Avatar src={ScoringIcon} sx={{ width: 24, height: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary="Scoring Algorithm"
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItem>
        </List>
        <Paper
          sx={{
            position: 'relative',
            width: '960px',
            borderRadius: 4,
            boxShadow: 1,
            borderRight: '1px solid',
            borderColor: 'grey.200',
            height: '800px',
            ml: 4,
            mr: 2,
            mt: 4,
            mb: 4,
          }}
        >
          {loading ? (
            <Box
              sx={{
                p: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100%',
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              {upcomingAlgosToShow.length > 0 && (
                <Box
                  sx={{
                    p: 3,
                    background: 'linear-gradient(90deg, #E9F8FF 0%, #FFFFFF 100%)',
                    borderRadius: 2,
                    border: '2px solid #DFE8F0',
                    m: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      {upcomingAlgosToShow.map((algo) => (
                        <Box key={algo.scoringAlgoId} sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={500}>
                            {algo.name}&nbsp;{algo.weightage}%
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 500 }}
                          >
                            {algo.description?.trim().endsWith('.') ? algo.description : `${algo.description}.`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Box
                        sx={{
                          border: '1px solid #3F5C78',
                          borderRadius: '999px',
                          px: 1,
                          py: 0.5,
                          bgcolor: '#F0F8FC',
                          display: 'inline-block',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: '#3F5C78' }}>
                          Effective Date:{' '}
                          <Box component="span" sx={{ fontWeight: 'bold' }}>
                            {upcomingConfig
                              ? new Date(upcomingConfig.effectiveDate).toLocaleDateString('en-US')
                              : 'N/A'}
                          </Box>
                        </Typography>
                      </Box>

                      {upcomingConfig && (
                        <Box sx={{ ml: 1 }}>
                          <img
                            src={
                              new Date(upcomingConfig.effectiveDate).getTime() <= Date.now() ? Completed : Inprogress
                            }
                            alt="Status Icon"
                            style={{ width: '20px', height: '20px' }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
              <Divider sx={{ bgcolor: '#DFE8F0', height: 1.8, my: 2 }} />

              <Box sx={{ p: 3, paddingLeft: 3, paddingRight: 3 }}>
                {scoringData.map((algo) => (
                  <Box
                    key={algo.name}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: '2px solid #DFE8F0',
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, #E9F8FF 0%, #FFFFFF  100%)',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={500}>
                      {algo.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {algo.description ?? 'No description available'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <Slider
                        value={
                          (algo.name || (algo as any).scoringAlgoName)?.includes('Equi-Weighted') ? equallyWeightedPercentage : severityAdjustedPercentage
                        }
                        onChange={(event, newValue) => handleSliderChange(event, newValue as number, algo.name || (algo as any).scoringAlgoName)}
                        valueLabelDisplay="auto"
                        shiftStep={30}
                        step={10}
                        marks
                        min={0}
                        max={100}
                        aria-labelledby="algorithm-slider"
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      <Typography sx={{ ml: 1, fontWeight: 500 }}>
                        {(algo.name || (algo as any).scoringAlgoName)?.includes('Equi-Weighted') ? equallyWeightedPercentage : severityAdjustedPercentage}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#fff',
                    backgroundColor: '#83D860',
                    '&:hover': {
                      backgroundColor: '#83D860',
                      color: '#fff',
                    },
                  }}
                  onClick={() => setView('history')}
                >
                  History
                </Button>
                <Box>
                  <Button
                    variant="contained"
                    onClick={handleApplyClick}
                    sx={{
                      backgroundColor: isSliderEnabled ? '#3F5C78' : '#B0B0B0',
                      '&:hover': {
                        backgroundColor: isSliderEnabled ? '#3F5C78' : '#B0B0B0',
                      },
                      color: '#fff',
                    }}
                  >
                    Apply
                  </Button>
                  {showCancelButton && (
                    <Button variant="outlined" color="primary" sx={{ ml: 2 }} onClick={handleCancelClick}>
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Paper>

        <Dialog open={showPopup} onClose={handleClose}>
          <DialogTitle
            sx={{
              bgcolor: (theme) => theme.palette.primary.main,
              padding: '16px',
              mb: '10px',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="#fff" variant="h6">
                Scoring Algorithm
              </Typography>
              <IconButton onClick={handleClose}>
                <RiCloseCircleFill color="#fff" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'left' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', my: 2 }}>
              <img
                src={ScoringPopup}
                alt="Scoring Popup"
                style={{ width: 'auto', maxWidth: '80%', maxHeight: '80px', objectFit: 'contain' }}
              />
            </Box>
            <Typography>Are you sure you want to change the scoring model?</Typography>
            <Typography>Please choose an effective date from which you want the change to take effect.</Typography>
            <TextField
              type="date"
              sx={{ mt: 2 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'flex-end',
              px: 3,
              pb: 2,
              bgcolor: '#ECF0F1',
              borderTop: '2px solid #3F5C784D',
              pt: 2,
            }}
          >
            <Button onClick={handleClose} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handlePopupConfirm} color="primary" variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ChangeSetting;
