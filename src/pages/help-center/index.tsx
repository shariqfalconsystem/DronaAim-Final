import { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  Pagination,
  PaginationItem,
} from '@mui/material';
import { RiDownload2Line, RiShareLine } from '@remixicon/react';
import { styled } from '@mui/material/styles';
import HelpCenterHeader from './help-center-header';
import TopicDetail from './help-center-details';
import Support from '../../assets/icons/support-resources.png';
import FAQ from '../../assets/icons/FAQ.png';
import TroubleShoot from '../../assets/icons/troubleshoot.png';
import UserManuals from '../../assets/icons/user-manuals.png';
import Topics from '../../assets/icons/topics.png';
import ShareDialog from '../../components/modals/share-dialog';
import { getAllPublished, getPublishedById } from '../../services/insurer/helpCenterService';
import { useSelector } from 'react-redux';
import { Block, Topic } from '../insurer/help-center/type';
import { handleDownloadClick } from '../insurer/help-center/download';
import { useNavigate, useParams } from 'react-router-dom';

const iconMap: Record<string, string> = {
  'All Topics': Topics,
  'User Manuals': UserManuals,
  'Troubleshooting Guides': TroubleShoot,
  'Support Resources': Support,
  FAQs: FAQ,
};

const StyledPagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPaginationItem-page:hover': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '& .MuiPaginationItem-page.Mui-selected': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '& .MuiPaginationItem-previousNext:hover': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
  '& .MuiPaginationItem-ellipsis': {
    color: theme.palette.primary.main,
  },
}));

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState<string>('All Topics');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const navigate = useNavigate();
  const { publishedId } = useParams<{ publishedId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareDocumentName, setShareDocumentName] = useState('');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);
  const currentActiveRole: any = useSelector((state: any) => state.auth.currentUserRole);

  const sidebarItems = [
    { text: 'All Topics', icon: <img src={Topics} alt="All Topics" width={24} height={24} /> },
    { text: 'User Manuals', icon: <img src={UserManuals} alt="User Manuals" width={24} height={24} /> },
    { text: 'Troubleshooting Guides', icon: <img src={TroubleShoot} alt="Troubleshooting" width={24} height={24} /> },
    { text: 'Support Resources', icon: <img src={Support} alt="Support Resources" width={24} height={24} /> },
    { text: 'FAQs', icon: <img src={FAQ} alt="FAQs" width={24} height={24} /> },
  ];

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 1500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 1500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText]);

  useEffect(() => {
    if (!publishedId) return;
    if (!publishedId) {
      setSelectedTopic(null);
    }

    const fetchTopic = async () => {
      setLoading(true);
      try {
        const { data } = await getPublishedById(currentUserId, publishedId!);
        setSelectedTopic(data);
      } catch (error) {
        console.error('Failed to fetch topic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [publishedId]);

  const handleGoBack = () => {
    setSelectedTopic(null);
    navigate('/help-center');
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText]);

  useEffect(() => {
    async function fetchAllPublishedContent() {
      try {
        setLoading(true);

        const requestBody: any = {
          activePersona: currentActiveRole,
        };
        if (debouncedSearchText) {
          requestBody.searchText = debouncedSearchText;
        }

        const response = await getAllPublished(currentUserId, requestBody, page, pageSize);
        if (response?.data?.publishedList) {
          setAllTopics(response.data.publishedList || []);
          setTotalRecords(response.data.totalRecords ?? response.data.publishedList.length ?? 0);
        }
      } catch (error) {
        console.error('Failed to fetch Topics List:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPublishedContent();
  }, [page, pageSize, currentUserId, debouncedSearchText]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getPreviewTextFromBlocks = (blocks: Block[], maxLength = 150) => {
    if (!Array.isArray(blocks)) return '';
    const firstParagraph = blocks.find((block) => block.type === 'paragraph' && block.data?.text);
    if (!firstParagraph) return '';
    const plainText = firstParagraph.data.text.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength ? plainText.slice(0, maxLength) + '...' : plainText;
  };

  const filteredTopics =
    activeTab === 'All Topics' ? allTopics : allTopics.filter((item) => item.topicNames?.includes(activeTab));

  const handleTopicClick = async (item: Topic) => {
    try {
      navigate(`/help-center/view-content/${item.publishedId}`);
    } catch (error) {
      console.error('Error while navigating to topic detail:', error);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);

    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotificationMessage(null);
    }, 5000);
  };

  const handleSharePDF = async (topic: Topic) => {
    try {
      setSharing(true);

      const viewContentUrl = `${window.location.origin}/help-center/view-content/${topic.publishedId}`;

      setShareUrl(viewContentUrl);
      setShareDocumentName(topic.title || 'Help Center Article');
      setShareDialogOpen(true);

      showNotification('Ready to share content', 'success');
    } catch (error: any) {
      console.error('Error preparing share:', error);
      showNotification(`Failed to prepare share: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Box>
      {!selectedTopic && (
        <HelpCenterHeader onSearchChange={handleSearchChange} searchText={searchText} isLanding={true} />
      )}
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F5F5', alignItems: 'flex-start', mt: 1 }}>
        <Box
          sx={{
            position: 'sticky',
            top: 80,
            alignSelf: 'flex-start',
            backgroundColor: '#DFE8F0',
            p: 3,
            borderRadius: 2,
            ml: 2,
            mt: 4,
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            flexShrink: 0,
            width: '240px',
          }}
        >
          <List>
            {sidebarItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={activeTab === item.text}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: '#247FAD',
                      color: '#fff',
                      '&:hover': { bgcolor: '#1c6d96' },
                    },
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  onClick={() => {
                    setActiveTab(item.text);
                    setSelectedTopic(null);
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1, minWidth: 0, overflowX: 'auto', ml: 2, mr: 2 }}>
          <Paper sx={{ minWidth: '960px', width: '80%', borderRadius: 4, boxShadow: 1, p: 4, ml: 4, mt: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : !selectedTopic ? (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {activeTab}
                </Typography>
                <Divider />
                {filteredTopics.map((item, index) => (
                  <Box
                    key={index}
                    sx={{ mb: 1, p: 1, borderRadius: 2, cursor: 'pointer' }}
                    onClick={() => handleTopicClick(item)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img
                          src={iconMap[activeTab === 'All Topics' ? item.topicNames?.[0] ?? '' : activeTab] || Topics}
                          alt={activeTab}
                          width={24}
                          height={24}
                        />
                        <Typography variant="body2" sx={{ color: '#003350' }}>
                          {activeTab === 'All Topics' ? item.topicNames?.[0] ?? 'General' : activeTab}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="Download content">
                          <span>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadClick(item as any);
                              }}
                            >
                              <RiDownload2Line />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Share content">
                          <span>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSharePDF(item);
                              }}
                            >
                              <RiShareLine />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 550, mt: 1, color: '#003350', fontSize: '0.9rem', lineHeight: 1.9 }}
                    >
                      {item.title}
                    </Typography>
                    {item.content?.blocks && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#003350',
                          mt: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.85rem',
                        }}
                        component="div"
                        dangerouslySetInnerHTML={{
                          __html: getPreviewTextFromBlocks(item.content?.blocks) || '',
                        }}
                      />
                    )}
                    {item.createdAt && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        {formatDate(Number(item.createdAt))}
                      </Typography>
                    )}
                    {index < filteredTopics.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </>
            ) : (
              <TopicDetail topic={selectedTopic as any} onBack={handleGoBack} />
            )}
            {!selectedTopic && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <StyledPagination
                  count={Math.ceil(totalRecords / pageSize)}
                  page={page}
                  onChange={(event, newPage) => setPage(newPage)}
                  siblingCount={1}
                  boundaryCount={1}
                  variant="outlined"
                  shape="rounded"
                  renderItem={(item) => <PaginationItem {...item} />}
                />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => {
          setShareDialogOpen(false);
          setShareUrl('');
          setShareDocumentName('');
        }}
        documentUrl={shareUrl}
        documentName={shareDocumentName}
      />
    </Box>
  );
};

export default HelpCenter;
