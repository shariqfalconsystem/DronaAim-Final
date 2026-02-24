import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Button,
  Typography,
  Stack,
  useTheme,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { supportService } from '../../../services/fleetManager/supportService';
import { toast } from 'react-toastify';
import { IoMdAttach } from 'react-icons/io';
import environment from '../../../environments/environment';

const SupportEmailModal = ({ open, onClose, insurerId, insurerName, insurerEmail }: any) => {
  const theme = useTheme();

  const getDefaultEmailBody = (id: string, name: string) => {
    return `Dear Support Team,

We are experiencing an issue with [briefly describe the issue, e.g., "accessing telematics reports"].

Insurer ID: ${id}
Insurer Name: ${name}
Issue Description: [Provide a few details of the problem]
Date/Time of Issue: [Provide Date and Time of the issue]
Urgency: [High/Low]

Thank you.

Best regards,
${name}
[Your Position]
[Company Name]
[Contact Information]`;
  };

  const initialFormData = {
    issueDescription: '',
    name: '',
    subject: `Support Request from ${insurerName} [${insurerId}]`,
    body: getDefaultEmailBody(insurerId, insurerName),
    ccEmails: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_ATTACHMENT_SIZE_MB = 5;

  useEffect(() => {
    if (open) {
      setFormData((prev: any) => ({
        ...prev,
        subject: `Support Request from ${insurerName} [${insurerId}]`,
        body: getDefaultEmailBody(insurerId, insurerName),
        ccEmails: insurerEmail ? [{ value: insurerEmail, showError: false }] : [{ value: '', showError: false }],
      }));
    }
  }, [open, insurerEmail, insurerName, insurerId]);

  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setAttachments([]);
    }
  }, [open]);

  const handleAddCcEmail = () => {
    setFormData((prev: any) => ({
      ...prev,
      ccEmails: [...prev.ccEmails, { value: '', showError: false }],
    }));
  };

  const handleRemoveCcEmail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ccEmails: prev.ccEmails.filter((_: any, i: any) => i !== index),
    }));
  };

  const handleCcEmailChange = (index: number, value: string) => {
    const isInvalidCharacter = !/^[a-zA-Z0-9._%+-@]*$/.test(value);
    const isInvalidEmail = value.includes('@') && !/^[^\s@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(value);

    setFormData((prev: any) => ({
      ...prev,
      ccEmails: prev.ccEmails.map((email: any, i: number) =>
        i === index
          ? {
              value,
              showError: isInvalidCharacter || isInvalidEmail,
            }
          : email
      ),
    }));
  };

  const isEmailValid = (email: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentTotalSize = attachments.reduce((total, file) => total + file.size, 0);
      const newFilesTotalSize = newFiles.reduce((total, file) => total + file.size, 0);
      const totalSizeAfterAdding = currentTotalSize + newFilesTotalSize;

      if (totalSizeAfterAdding > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
        toast.error(`Some files exceed the ${MAX_ATTACHMENT_SIZE_MB} MB limit and were not added.`);
        return;
      }

      const validFiles = newFiles.filter((file) => file.size <= MAX_ATTACHMENT_SIZE_MB * 1024 * 1024);

      if (validFiles.length < newFiles.length) {
        toast.error(`Some files exceed the individual file size limit of ${MAX_ATTACHMENT_SIZE_MB} MB.`);
      }

      setAttachments((prev) => [...prev, ...validFiles]);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (formData.ccEmails.some((email: any) => email.showError || !email.value)) {
      setError('Please enter valid email addresses in the CC field.');
      return;
    }

    const requestBody = {
      toEmail: [environment.supportEmail],
      userId: insurerId,
      subject: formData.subject,
      body: formData.body,
      ccEmails: formData.ccEmails.map((email: any) => email.value).filter((email: string) => email),
      attachments,
    };

    setLoading(true);
    setError(null);

    try {
      const response = await supportService(requestBody);
      if (response?.status === 200) {
        toast.success(response?.message || 'Email sent successfully!');
      } else {
        toast.error(response?.message || 'Failed to send email. Please try again.');
      }
      onClose();
    } catch (error: any) {
      console.error('Error sending request:', error);
      toast.error('Failed to send support email. Please try again.');
      setError('Failed to send support email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '800px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          mb: '25px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            Email to {environment.supportEmail}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: '#fff' }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pb: 8 }}>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField fullWidth disabled value={environment.supportEmail} label="To" sx={{ bgcolor: 'grey.50' }} />

          {formData?.ccEmails?.map((email: any, index: any) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                label="CC Email"
                value={email.value}
                onChange={(e) => handleCcEmailChange(index, e.target.value)}
                error={email.showError}
                helperText={email.showError ? 'Invalid email' : ''}
              />
              <IconButton onClick={handleAddCcEmail}>
                <AddIcon />
              </IconButton>
              {index > 0 && (
                <IconButton onClick={() => handleRemoveCcEmail(index)}>
                  <RemoveIcon />
                </IconButton>
              )}
            </Box>
          ))}

          <TextField
            fullWidth
            label="Subject"
            value={formData.subject}
            onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
            sx={{ bgcolor: 'grey.50' }}
          />

          <TextField
            multiline
            rows={12}
            label="Body"
            value={formData.body}
            onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
            sx={{
              bgcolor: 'grey.50',
              '& .MuiInputBase-root': {
                height: '400px',
                '& textarea': {
                  height: '100% !important',
                },
              },
            }}
          />

          {error && <Typography color="error">{error}</Typography>}
        </Stack>
        <Box sx={{ mt: 2 }}>
          {attachments.map((file, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1}>
              <Typography>
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </Typography>
              <IconButton onClick={() => handleRemoveFile(index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          bgcolor: 'grey.100',
          p: 1,
          boxShadow: 2,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: '#2C3E50',
            ml: 2,
            width: '120px',
            '&:hover': {
              bgcolor: '#000',
            },
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </Button>
        <Tooltip title={`Maximum allowed limit for attachment is ${MAX_ATTACHMENT_SIZE_MB} MB`} placement="top">
          <IconButton component="label">
            <IoMdAttach />

            <input hidden multiple type="file" onChange={handleAddFile} />
          </IconButton>
        </Tooltip>
      </Box>
    </Dialog>
  );
};

export default SupportEmailModal;
