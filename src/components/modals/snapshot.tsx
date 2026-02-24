import React, { useState } from 'react';
import { Box, Typography, IconButton, CircularProgress } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import { toast } from 'react-toastify';
import ShareDialog from './share-dialog';
import { getShortUrl } from '../../services/fleetManager/shareService';
import SnapshotPreviewModal from './snapshotPreviewModal';
import { formatToUserTimezone } from '../../utility/utilities';

interface SnapshotImageDisplayProps {
  snapshots?: any[];
  mediaBaseUrl: string;
}

const SnapshotImageDisplay: React.FC<SnapshotImageDisplayProps> = ({ snapshots = [], mediaBaseUrl }) => {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [downloadingByCamera, setDownloadingByCamera] = useState<{ [key: number]: boolean }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);

  const cameraViews = [
    // { id: 2, label: 'Driver View' },
    { id: 1, label: 'Road View' },
  ];

  const handleDocShare = async (url: string, index: number) => {
    try {
      const response = await getShortUrl(url);
      if (response.status === 200) {
        setShortenedUrl(response.data.alias_url);
        setSelectedDocumentName(`Snapshot`);
        setShareDialogOpen(true);
      } else {
        toast.error('Failed to create a shortened URL.');
      }
    } catch {
      toast.error('An error occurred while sharing.');
    }
  };

  const handleDownload = async (url: string, filename: string, cameraId: number) => {
    setDownloadingByCamera((prev) => ({ ...prev, [cameraId]: true }));
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Download complete');
    } catch {
      toast.error('Download failed.');
    } finally {
      setDownloadingByCamera((prev) => ({ ...prev, [cameraId]: false }));
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', p: 1 }}>
        {cameraViews.map((cameraInfo, index) => {
          const snap = snapshots.find((s) => s.camera === cameraInfo.id);
          const imageUrl = snap?.urls?.[0]?.url;
          const hasImage = Boolean(imageUrl);
          const fullImageUrl = hasImage ? `${mediaBaseUrl}${imageUrl}` : '';
          const formattedDate = snap?.urls?.[0]?.updatedAt ? formatToUserTimezone(snap.urls[0].updatedAt) : '';
          const dateOnly = snap?.urls?.[0]?.updatedAt
            ? new Date(snap.urls[0].updatedAt).toISOString().split('T')[0]
            : 'unknown_date';
          const fileName = `${cameraInfo.label.replace(/\s+/g, '_')}_${dateOnly}.jpg`;

          return (
            <Box
              key={cameraInfo.id}
              sx={{
                position: 'relative',
                width: 200,
                height: 100,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #ccc',
                bgcolor: hasImage ? 'transparent' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hasImage ? (
                <Box
                  component="img"
                  src={fullImageUrl}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedImage(fullImageUrl);
                    setSelectedImageIndex(index);
                    setSelectedTimestamp(formattedDate);
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, color: '#aaa', mt: 2 }} />
                  <Typography variant="caption" sx={{ color: 'red', fontSize: '0.59rem', mt: 1 }}>
                    {cameraInfo.label} Snapshot Unavailable
                  </Typography>
                </Box>
              )}

              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 8,
                  bgcolor: 'rgba(255,255,255,0.8)',
                  color: 'black',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              >
                {cameraInfo.label}
              </Typography>

              {hasImage && formattedDate && (
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.6rem',
                  }}
                >
                  {formattedDate}
                </Typography>
              )}

              {hasImage && (
                <Box sx={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                    onClick={() => handleDocShare(fullImageUrl, index)}
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
                    onClick={() => handleDownload(fullImageUrl, fileName, cameraInfo.id)}
                    disabled={downloadingByCamera[cameraInfo.id]}
                  >
                    {downloadingByCamera[cameraInfo.id] ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DownloadIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {selectedImage && selectedImageIndex !== null && (
        <SnapshotPreviewModal
          imageUrl={selectedImage}
          index={selectedImageIndex}
          onClose={() => {
            setSelectedImage(null);
            setSelectedImageIndex(null);
            setSelectedTimestamp(null);
          }}
          onShare={handleDocShare}
          onDownload={(url, name) => {
            const cameraId = cameraViews[selectedImageIndex].id;
            handleDownload(url, name, cameraId);
          }}
          isDownloading={downloadingByCamera[cameraViews[selectedImageIndex].id]}
          cameraLabel={cameraViews[selectedImageIndex]?.label || ''}
          timestamp={selectedTimestamp || ''}
          filename={(() => {
            const snap = snapshots.find((s) => s.camera === cameraViews[selectedImageIndex].id);
            const dateOnly = snap?.urls?.[0]?.updatedAt
              ? new Date(snap.urls[0].updatedAt).toISOString().split('T')[0]
              : 'unknown_date';
            return `${cameraViews[selectedImageIndex].label.replace(/\s+/g, '_')}_${dateOnly}.jpg`;
          })()}
        />
      )}

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
    </>
  );
};

export default SnapshotImageDisplay;
