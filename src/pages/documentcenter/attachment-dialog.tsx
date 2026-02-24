import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { BsFileEarmarkPdfFill } from 'react-icons/bs';
import { HiOutlineDownload } from 'react-icons/hi';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';

interface ContractDocument {
  zohosignModuleRecordId: string;
  zohosignZohoSignDocumentId: string;
  status: string;
  name: string;
  recipientEmailIds: string[];
  zohoDateSent: number;
  zohoDateCompleted: number;
  zohoDateSentUtc: string;
  zohoDateCompletedUtc: string;
}

interface AttachmentsDialogProps {
  open: boolean;
  onClose: () => void;
  zohoDocumentId: string;
  documents: ContractDocument[];
  onDownload: (documentId: string, documentName?: string) => Promise<void>;
  downloading: string | null;
}

// Styled components matching FleetContractsDialog
const StyledHeadCell = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="th"
    sx={{
      bgcolor: '#fafafa',
      borderBottom: '1px solid #e0e0e0',
      padding: '12px 16px',
      textAlign: 'left',
      position: 'sticky',
      top: 0,
      zIndex: 1,
    }}
  >
    {children}
  </Box>
);

const StyledDataCell = ({ children, align = 'left' }: { children: React.ReactNode; align?: string }) => (
  <Box
    component="td"
    sx={{
      padding: '12px 16px',
      borderBottom: '1px solid #e8e8e8',
      textAlign: align,
    }}
  >
    {children}
  </Box>
);

const AttachmentsDialog: React.FC<AttachmentsDialogProps> = ({
  open,
  onClose,
  zohoDocumentId,
  documents,
  onDownload,
  downloading,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);

  const itemsPerPage = 3;

  // Filter documents based on search query
  const filteredDocuments =
    documents?.filter((doc) => doc.name?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (!sortDirection) return 0;
    const comparison = a.name.localeCompare(b.name);
    return sortDirection === 'ASC' ? comparison : -comparison;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = sortedDocuments.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDownloadClick = async (doc: ContractDocument) => {
    if (doc.zohosignZohoSignDocumentId && doc.zohosignZohoSignDocumentId !== 'NA') {
      await onDownload(doc.zohosignZohoSignDocumentId, doc.name);
    }
  };

  const handleSort = (direction: 'ASC' | 'DESC') => {
    setSortDirection(direction);
    setCurrentPage(1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          maxWidth: '480px',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          bgcolor: '#37474f',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Zoho Document ID - {zohoDocumentId}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'white',
            padding: '4px',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          size="small"
        >
          <CloseIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5' }}>
        {/* Attachments Section */}
        <Box sx={{ bgcolor: '#e8f4f8', p: 2, borderBottom: '1px solid #d0d0d0' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#2c5f7c',
              letterSpacing: '0.01em',
            }}
          >
            Attachments
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 'none',
            maxHeight: '400px',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#5B7C9D',
              borderRadius: '4px',
            },
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledHeadCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#666',
                      }}
                    >
                      Document Name
                    </Typography>

                    {/* Sort Icons */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                      <TbTriangleFilled
                        size={8}
                        color={sortDirection === 'ASC' ? '#000' : 'rgba(0,0,0,0.5)'}
                        onClick={() => handleSort('ASC')}
                        style={{ cursor: 'pointer' }}
                      />
                      <TbTriangleInvertedFilled
                        size={8}
                        color={sortDirection === 'DESC' ? '#000' : 'rgba(0,0,0,0.5)'}
                        onClick={() => handleSort('DESC')}
                        style={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Box>

                  {/* Search Field */}
                  <TextField
                    size="small"
                    fullWidth
                    placeholder=""
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    sx={{
                      mt: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'white',
                        height: '32px',
                        fontSize: '0.8rem',
                        '& fieldset': {
                          borderColor: '#d0d0d0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#999',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1976d2',
                          borderWidth: '1px',
                        },
                      },
                    }}
                  />
                </StyledHeadCell>
                <StyledHeadCell>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#666',
                      }}
                    >
                      Action
                    </Typography>
                  </Box>
                  <Box></Box>
                </StyledHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentDocuments && currentDocuments.length > 0 ? (
                currentDocuments.map((doc, index) => {
                  const isDownloadingThis = downloading === doc.zohosignZohoSignDocumentId;
                  const hasValidDocId = doc.zohosignZohoSignDocumentId && doc.zohosignZohoSignDocumentId !== 'NA';

                  return (
                    <TableRow
                      key={`${doc.zohosignZohoSignDocumentId}-${index}`}
                      sx={{
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                    >
                      <StyledDataCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <BsFileEarmarkPdfFill
                            style={{
                              fontSize: '1.1rem',
                              color: '#e91e63',
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: '0.85rem',
                              color: hasValidDocId ? '#333' : '#999',
                              lineHeight: 1.4,
                            }}
                          >
                            {doc.name || `Document ${startIndex + index + 1}`}
                          </Typography>
                        </Box>
                      </StyledDataCell>
                      <StyledDataCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadClick(doc)}
                          disabled={!hasValidDocId || isDownloadingThis}
                          sx={{
                            width: '32px',
                            height: '32px',
                            bgcolor: 'white',
                            border: '1.5px solid #d0d0d0',
                            borderRadius: '4px',
                            padding: 0,
                            '&:hover': {
                              bgcolor: hasValidDocId ? '#f5f5f5' : 'white',
                              borderColor: hasValidDocId ? '#999' : '#d0d0d0',
                            },
                            '&:disabled': {
                              bgcolor: '#fafafa',
                              borderColor: '#e0e0e0',
                            },
                          }}
                          title={hasValidDocId ? 'Download Document' : 'Document not available'}
                        >
                          {isDownloadingThis ? (
                            <CircularProgress size={14} sx={{ color: '#666' }} />
                          ) : (
                            <HiOutlineDownload
                              style={{
                                fontSize: '1.1rem',
                                color: hasValidDocId ? '#666' : '#ccc',
                              }}
                            />
                          )}
                        </IconButton>
                      </StyledDataCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <StyledDataCell colSpan={2} align="center">
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '0.85rem', py: 2 }}>
                      {searchQuery ? 'No documents match your search' : 'No documents available'}
                    </Typography>
                  </StyledDataCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {sortedDocuments && sortedDocuments.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 2.5,
              borderTop: '1px solid #e0e0e0',
              bgcolor: 'white',
              gap: 1.5,
            }}
          >
            <IconButton
              size="small"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              sx={{
                width: '28px',
                height: '28px',
                color: currentPage === 1 ? '#ccc' : '#666',
                '&:hover': {
                  bgcolor: currentPage === 1 ? 'transparent' : '#f5f5f5',
                },
                '&:disabled': {
                  color: '#ccc',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>‹</Typography>
            </IconButton>

            <Box
              sx={{
                minWidth: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#1565c0',
                color: 'white',
                borderRadius: '4px',
                px: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>{currentPage}</Typography>
            </Box>

            <IconButton
              size="small"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              sx={{
                width: '28px',
                height: '28px',
                color: currentPage === totalPages ? '#ccc' : '#666',
                '&:hover': {
                  bgcolor: currentPage === totalPages ? 'transparent' : '#f5f5f5',
                },
                '&:disabled': {
                  color: '#ccc',
                },
              }}
            >
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 500 }}>›</Typography>
            </IconButton>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentsDialog;
