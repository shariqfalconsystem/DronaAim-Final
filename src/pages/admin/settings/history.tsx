import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import ScoringIcon from '../../../assets/icons/scoring-algo.png';
import ChangeSettingHeader from './setting-header';
import { ScoringConfig, ScoringAlgo } from './type';
import { ArrowBack } from '@mui/icons-material';

const History = ({ data, onBack }: { data: ScoringConfig[]; onBack: () => void }) => {
  const historyData = (data || []).map((record) => {
    const algoMap = new Map(record.lookupScoringAlgoMaster.map((a) => [a.scoringAlgoId, a]));

    const algosWithWeight = record.weightage
      .filter((w: any) => w.weightage > 0)
      .map((w) => ({
        ...algoMap.get(w.scoringAlgoId),
        weightage: w.weightage,
      }));

    return {
      effectiveDate: record.effectiveDate,
      formattedDate: new Date(record.effectiveDate).toLocaleDateString('en-US'),
      algos: algosWithWeight,
    };
  });

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
            height: '680px',
            overflowY: 'auto',
            ml: 4,
            mr: 2,
            mt: 4,
            mb: 4,
          }}
        >
          <Box sx={{ p: 1, m: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={onBack}>
                <ArrowBack />
              </IconButton>
              <Typography variant="body1" sx={{ ml: 1, fontWeight: '500' }}>
                Scoring Model Version History
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mt: 0 }} />

          <Box sx={{ px: 4, pb: 4, mt: 2 }}>
            {historyData.map((entry, idx) => (
              <Box
                key={idx}
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #E9F8FF 0%, #FFFFFF 100%)',
                  boxShadow: 1,
                  border: '1px solid #DFE8F0',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box>
                    {entry.algos.map((algo, i) => (
                      <Typography key={i} variant="subtitle2" fontWeight={500}>
                        {algo.name || (algo as any).scoringAlgoName}
                        <Typography component="span" sx={{ fontWeight: 600, ml: 1 }}>
                          {algo.weightage}%
                        </Typography>
                      </Typography>
                    ))}
                  </Box>

                  <Box
                    sx={{
                      border: '1px solid #3F5C78',
                      borderRadius: '999px',
                      px: 2,
                      py: 0.5,
                      bgcolor: '#F0F8FC',
                      display: 'inline-block',
                      height: '28px',
                      mt: { xs: 2, sm: 0 },
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#3F5C78', display: 'flex', alignItems: 'center' }}>
                      Previous Effective Date:&nbsp;
                      <Box component="span" sx={{ fontWeight: 'bold' }}>
                        {entry.formattedDate}
                      </Box>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default History;
