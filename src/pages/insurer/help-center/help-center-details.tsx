import { ArrowBack } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { RiDownload2Line, RiShareLine } from '@remixicon/react';
import { useEffect, useState } from 'react';
import ShareDialog from '../../../components/modals/share-dialog';
import jsPDF from 'jspdf';
import { handleDownloadClick } from './download';
import { useSelector } from 'react-redux';
import { FiDownload, FiFile } from 'react-icons/fi';
interface File {
  docRef: string;
  contentType: string;
  fileName: string;
  fileSizeInKb: string;
  documentType: string;
  uploadedAtTs: number;
  uploadedBy: string;
  signedUrl?: string;
}

interface Block {
  id: string;
  type: 'paragraph' | 'image' | 'video' | 'header' | 'pdf' | 'quote' | 'list';
  data: any;
}

interface Content {
  time: number;
  version: string;
  blocks: Block[];
}

interface Topic {
  publishedId: string;
  title: string;
  date: string;
  subTitle?: string;
  topicNames?: string[];
  content?: Content;
  createdAt: number;
}

interface TopicDetailProps {
  topic: Topic;
  onBack: () => void;
}

interface ListItem {
  content: string;
  items: ListItem[];
  meta: any;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topic, onBack }) => {
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [mediaUrls, setMediaUrls] = useState<{ [blockId: string]: string }>({});
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareDocumentName, setShareDocumentName] = useState('');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sharing, setSharing] = useState<boolean>(false);

  const currentUserId: any = useSelector((state: any) => state.auth.currentUserId);

  useEffect(() => {
    const urlsToRevoke: string[] = [];

    const loadMedia = async () => {
      if (!topic?.content?.blocks?.length) return;

      const newMediaUrls: { [key: string]: string } = {};

      await Promise.all(
        topic.content.blocks.map(async (block) => {
          const signedUrl = block?.data?.file?.signedUrl;
          const contentType = block?.data?.file?.contentType;

          if (signedUrl && (block.type === 'image' || block.type === 'video' || contentType === 'application/pdf')) {
            try {
              const response = await fetch(signedUrl);
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              urlsToRevoke.push(objectUrl);
              newMediaUrls[block.id] = objectUrl;
            } catch (error) {
              console.error(`Failed to load media for block ${block.id}`, error);
            }
          }
        })
      );

      setMediaUrls(newMediaUrls);
    };

    loadMedia();

    return () => {
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [topic]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);

    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotificationMessage(null);
    }, 5000);
  };

  const handleShareClick = () => setShareOpen(true);

  const handleSharePDF = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setSharing(true);

      // Create the share URL - direct link to view the content
      const viewContentUrl = `${window.location.origin}/help-center/view-content/${topic.publishedId}`;

      // Set the values for the ShareDialog
      setShareUrl(viewContentUrl);
      setShareDocumentName(topic.title || 'Help Center Article');

      // Open the dialog
      setShareDialogOpen(true);

      showNotification('Ready to share content', 'success');
    } catch (error: any) {
      console.error('Error preparing share:', error);
      showNotification(`Failed to prepare share: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setSharing(false);
    }
  };

  const createPdfViewer = (pdfUrl: string, fileName: string) => {
    // Create a PDF viewer with object tag which has better cross-browser compatibility
    return (
      <Box sx={{ width: '100%', position: 'relative' }}>
        <object
          data={`${pdfUrl}`}
          type="application/pdf"
          width="100%"
          height="500px"
          style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
        >
          <Box sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="body1" gutterBottom>
              Unable to display PDF directly in browser.
            </Typography>
            <Button
              variant="contained"
              startIcon={<FiDownload />}
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={fileName || 'document.pdf'}
            >
              Download PDF
            </Button>
          </Box>
        </object>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          {fileName}
        </Typography>
      </Box>
    );
  };

  const renderListItem = (item: ListItem, index: number): JSX.Element => {
    return (
      <li key={index}>
        <div dangerouslySetInnerHTML={{ __html: item.content }} />

        {item.items && item.items.length > 0 && (
          <ul>{item.items.map((nestedItem, nestedIndex) => renderListItem(nestedItem, nestedIndex))}</ul>
        )}
      </li>
    );
  };

  const renderBlock = (block: Block) => {
    const contentType = block.data.file?.contentType;

    switch (block.type) {
      case 'paragraph':
        return (
          <Typography
            key={block?.id}
            variant="body2"
            sx={{ mb: 2, color: '#003350' }}
            dangerouslySetInnerHTML={{ __html: block?.data?.text }}
          />
        );

      case 'header':
        return (
          <Typography key={block.id} variant="subtitle1" sx={{ fontWeight: 600, color: '#003350', mt: 3, mb: 1 }}>
            {block.data.text}
          </Typography>
        );

      case 'list':
        const listStyle = block?.data?.style === 'ordered' ? 'ol' : 'ul';
        const ListComponent = listStyle as keyof JSX.IntrinsicElements;

        return (
          <Box key={block?.id} sx={{ mb: 2, color: '#003350', fontSize: '0.875rem' }}>
            <ListComponent>
              {block?.data?.items?.map((item: ListItem, index: number) => renderListItem(item, index))}
            </ListComponent>
          </Box>
        );

      case 'image':
        return (
          <Box key={block.id} sx={{ my: 3, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-block',
                maxWidth: block.data.stretched ? '100%' : '600px',
                width: '100%',
                mx: 'auto',
              }}
            >
              <img
                src={mediaUrls[block.id]}
                alt={block.data.caption || block.data.file?.fileName || 'image'}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 8,
                }}
              />
              {(block.data.caption || block.data.file?.fileName) && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {block.data.caption || block.data.file?.fileName}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'quote':
        return (
          <Box
            key={block.id}
            sx={{
              borderLeft: '3px solid #e0e0e0',
              pl: 2,
              py: 1,
              mb: 2,
              fontStyle: 'italic',
            }}
          >
            <Typography variant="body2">{block.data.text}</Typography>
            {block.data.caption && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 1 }}>
                — {block.data.caption}
              </Typography>
            )}
          </Box>
        );

      case 'video':
        return (
          <Box key={block.id} sx={{ mb: 3, textAlign: block.data.stretched ? 'initial' : 'center' }}>
            <Box
              component="video"
              controls
              sx={{
                borderRadius: 1,
                bgcolor: '#000',
                maxHeight: '400px',
                width: block.data.stretched ? '100%' : '600px',
                maxWidth: '100%',
                height: 'auto',
              }}
            >
              <source src={block.data.file?.signedUrl} type={block.data.file?.contentType || 'video/mp4'} />
              Your browser does not support the video tag.
            </Box>
            {(block.data.caption || block.data.file?.fileName) && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                {block.data.caption || block.data.file?.fileName}
              </Typography>
            )}
          </Box>
        );

      case 'pdf':
        // Enhanced PDF rendering for better compatibility
        return (
          <Box key={block.id} sx={{ mb: 3 }}>
            {block.data.file?.signedUrl ? (
              createPdfViewer(block.data.file.signedUrl, block.data.file.fileName || 'document.pdf')
            ) : (
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                  bgcolor: '#f5f5f5',
                  borderRadius: 1,
                }}
                component="a"
                href={block.data.file?.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFile size={24} style={{ marginRight: '12px', color: '#0077cc' }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {block.data.file?.fileName || 'Attachment'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {block.data.file?.contentType}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>
        );
      default:
        // Fallback for unsupported block types
        console.warn(`Unsupported block type: ${block.type}`);
        return null;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={onBack}>
            <ArrowBack />
          </IconButton>
          {topic.topicNames?.[0] && <Typography variant="body1">{topic.topicNames[0]}</Typography>}
        </Box>
        <Box>
          <IconButton onClick={() => handleDownloadClick(topic)}>
            <RiDownload2Line />
          </IconButton>

          <IconButton onClick={handleSharePDF}>
            <RiShareLine />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {topic.createdAt && (
        <Typography variant="body2" sx={{ color: 'textSecondary', mb: 2, mt: 1 }}>
          {formatDate(topic.createdAt)}
        </Typography>
      )}
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#003350' }}>
        {topic.title}
      </Typography>
      {topic.subTitle && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#003350', mb: 2, mt: 2 }}>
          {topic.subTitle}
        </Typography>
      )}
      {topic.content?.blocks?.length ? (
        topic.content.blocks.map(renderBlock)
      ) : (
        <Typography variant="body1" sx={{ color: '#003350', mt: 1 }}>
          {'No additional details available for this topic.'}
        </Typography>
      )}
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

export default TopicDetail;
