import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Modal, IconButton, Button, Slider, CircularProgress } from '@mui/material';
import { ZoomIn, ZoomOut, RotateLeft, RotateRight, Download, Close } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { handleDriverDocDownload } from '../../utility/utilities';
import { attestDriverDocuments } from '../../services/fleetManager/driverServices';
import RejectedStamp from '../../assets/img/rejected.png';
import { RiCloseCircleLine } from '@remixicon/react';
import rejectedIcon from '../../assets/icons/rejected.png';
import approvedIcon from '../../assets/icons/approved.png';
import pendingIcon from '../../assets/icons/pending.png';
import { REJECTION_REASONS } from '../../common/constants/general';
import { MdWarning } from 'react-icons/md';
import { TbResize } from 'react-icons/tb';
import { BsFloppy } from 'react-icons/bs';
import { useSelector } from 'react-redux';

const DocumentModal = ({ open, onClose, document: doc, driverId, refreshData, onRejectClick }: any) => {
  const [zoom, setZoom] = useState<any>(100);
  const [rotation, setRotation] = useState<any>(0);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const lonestarId = 'LS1013'; // Temporarily hardcoded

  useEffect(() => {
    let objectUrl: any;
    if (doc?.signedUrl) {
      setLoading(true);
      fetch(doc.signedUrl)
        .then((response) => response.blob())
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          setPreview(objectUrl);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error loading document preview:', error);
          toast.error('Failed to load document preview');
          setLoading(false);
        });
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [doc]);

  const handleApprove = useCallback(async () => {
    try {
      setIsApproving(true);
      await attestDriverDocuments(driverId, {
        docRef: doc.docRef,
        status: 'APPROVED',
        attestedBy: currentUserId,
        lonestarId,
      });
      toast.success('Document approved successfully');
      refreshData();
      onClose();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error('Failed to approve document');
    } finally {
      setIsApproving(false);
    }
  }, [doc, onClose]);

  const handleZoom = useCallback((newZoom: any) => {
    setZoom(Math.max(50, Math.min(newZoom, 200)));
  }, []);

  const handleZoomIn = useCallback(() => handleZoom(zoom + 10), [zoom, handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom(zoom - 10), [zoom, handleZoom]);

  const handleRotateLeft = useCallback(() => setRotation((prev: any) => (prev - 90) % 360), []);
  const handleRotateRight = useCallback(() => setRotation((prev: any) => (prev + 90) % 360), []);

  const statusIconMap: any = {
    APPROVED: approvedIcon,
    REJECTED: rejectedIcon,
    PENDING: pendingIcon,
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            marginTop: 1,
            marginBottom: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    const isRejected = doc?.status === 'REJECTED';

    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 'calc(60vh - 100px)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {doc?.contentType?.startsWith('image/') && (
          <img
            src={preview}
            alt={doc?.fileName}
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transition: 'transform 0.3s',
            }}
          />
        )}
        {doc?.contentType === 'application/pdf' && (
          <iframe
            src={`${preview}#zoom=${zoom}`}
            title={doc?.fileName}
            width="100%"
            height="100%"
            style={{
              border: 'none',
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s',
            }}
          />
        )}
        {isRejected && (
          <img
            src={RejectedStamp}
            alt="Rejected"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.7,
              width: '50%',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
    );
  };

  const resetStates = () => {
    setZoom(100);
    setRotation(0);
    setPreview(null);
    setLoading(false);
  };

  const handleClose = async () => {
    resetStates();
    onClose();
  };

  const getReasonDetails = (reasonId: string) => {
    const reason = REJECTION_REASONS.find((r: any) => r.id === reasonId);
    return reason ? { label: reason.label, description: reason.description } : null;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ width: '80%', maxHeight: '80vh', position: 'relative', margin: 'auto', mt: '5%' }}>
        <Box
          sx={{
            backgroundColor: '#e6f0ff',
            p: 2,
            overflowY: 'auto',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={() => handleDriverDocDownload(doc)}>
              <Download />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6">{doc?.fileName}</Typography>
              <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={statusIconMap[doc?.status] || ''} alt={doc?.status} style={{ width: 20, height: 20 }} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {doc?.status !== 'APPROVED' && (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 1 }}
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  Approve
                </Button>
              )}
              {doc?.status !== 'REJECTED' && (
                <Button variant="contained" color="error" sx={{ mr: 1 }} onClick={onRejectClick}>
                  Reject
                </Button>
              )}
              <IconButton onClick={handleClose}>
                <RiCloseCircleLine size={30} />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', mb: 2, height: 'calc(60vh - 100px)', overflow: 'hidden' }}>
            {renderPreview()}
          </Box>
          {/* reject reasons */}
          {doc?.status === 'REJECTED' && doc.rejectReason && (
            <Box sx={{ mt: 2 }}>
              {doc.rejectReason.map((reason: any, index: number) => {
                if (reason.startsWith('Custom:')) {
                  // Custom reject reasons handling
                  const [label, ...descriptionParts] = reason.split(':');
                  const description = descriptionParts.join(':').trim();
                  return (
                    <Box key={index} sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <MdWarning color="orange" style={{ marginRight: '4px' }} />

                      <Typography variant="body2" color="#2C3E50" sx={{ fontWeight: '600' }}>
                        {label} :{' '}
                      </Typography>
                      <Typography variant="caption" color="#2C3E50" sx={{ ml: 1, fontSize: '0.8rem' }}>
                        {description}
                      </Typography>
                    </Box>
                  );
                } else {
                  const reasonDetails = getReasonDetails(reason);
                  return reasonDetails ? (
                    <Box key={index} sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <MdWarning color="orange" style={{ marginRight: '4px' }} />
                      <Typography variant="body2" color="#2C3E50" sx={{ fontWeight: '600' }}>
                        {reasonDetails.label} :{' '}
                      </Typography>
                      <Typography variant="caption" color="#2C3E50" sx={{ ml: 1, fontSize: '0.8rem' }}>
                        {reasonDetails.description}
                      </Typography>
                    </Box>
                  ) : null;
                }
              })}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fff',
            p: 2,
            borderBottomLeftRadius: '10px',
            borderBottomRightRadius: '10px',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ display: 'flex' }}>
              <TbResize />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {doc?.contentType}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', ml: 3 }}>
              <BsFloppy />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {parseFloat(doc?.fileSizeInKb)?.toFixed(2) || 0} KB
              </Typography>
            </Box>
          </Box>

          {doc?.contentType !== 'application/pdf' && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleRotateLeft}>
                <RotateLeft />
              </IconButton>
              <IconButton onClick={handleRotateRight}>
                <RotateRight />
              </IconButton>
              <IconButton onClick={handleZoomOut}>
                <ZoomOut />
              </IconButton>
              <Slider
                value={zoom}
                onChange={(_, newValue) => handleZoom(newValue)}
                min={50}
                max={200}
                sx={{ width: '100px', mx: 2 }}
              />
              <IconButton onClick={handleZoomIn}>
                <ZoomIn />
              </IconButton>
              <Typography variant="body2">{zoom}%</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default DocumentModal;
