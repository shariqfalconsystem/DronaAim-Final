import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    IconButton,
    Paper,
    FormLabel,
    Grid,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { RiCloseCircleFill } from '@remixicon/react';

const UploadDialog = ({
    open,
    onClose,
    handleFileChange,
    handleUpload,
    selectedFileName,
    selectedFile,
    handleClearFile,
    documentType,
    setDocumentType,
    showFileUpload,
    setShowFileUpload,
    isUploading
}: any) => {

    const handleDocumentTypeChange = (event: any) => {
        setDocumentType(event.target.value);
        setShowFileUpload(true); // Show file upload section when document type is selected
    };

    const handleClose = () => {
        setShowFileUpload(false);
        setDocumentType('');
        onClose();
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    style: {
                        borderRadius: '10px',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        bgcolor: (theme) => theme.palette.primary.main,
                        mb: '25px',
                    }}
                >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography color="#fff" variant="h6">
                            Upload Document
                        </Typography>
                        <IconButton onClick={handleClose}>
                            <RiCloseCircleFill color="#fff" />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent
                    sx={{
                        paddingX: 3,
                        paddingBottom: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    {/* Document Type Selection */}
                    {!showFileUpload && (
                        <FormControl component="fieldset" sx={{ width: '100%' }}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item>
                                    <FormLabel
                                        component="legend"
                                        sx={{
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            Select Document Type:
                                        </div>
                                    </FormLabel>
                                </Grid>
                                <Grid item xs>
                                    <RadioGroup
                                        row
                                        value={documentType}
                                        onChange={handleDocumentTypeChange}
                                    >
                                        <FormControlLabel
                                            value="DrivingLicense"
                                            control={<Radio />}
                                            label={
                                                <div style={{ textAlign: 'center' }}>
                                                    Driver's License
                                                </div>
                                            }
                                        />
                                        <FormControlLabel
                                            value="Other"
                                            control={<Radio />}
                                            label={
                                                <div style={{ textAlign: 'center' }}>
                                                    Other Document
                                                </div>
                                            }
                                        />
                                    </RadioGroup>
                                </Grid>
                            </Grid>
                        </FormControl>
                    )}

                    {/* File Upload Section */}
                    {showFileUpload && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontStyle: 'italic',
                                    color: 'text.secondary',
                                    mb: 1,
                                }}
                            >
                                Supported formats: PNG, JPG, PDF
                            </Typography>

                            <input
                                accept=".png,.jpg,.pdf"
                                style={{ display: 'none' }}
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="contained"
                                    component="span"
                                    sx={{ textTransform: 'none' }}
                                >
                                    Choose File
                                </Button>
                            </label>

                            {/* Selected File Display */}
                            {selectedFile && (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mt: 2,
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="body2" noWrap>
                                        {selectedFileName}
                                    </Typography>
                                    <IconButton size="small" onClick={handleClearFile}>
                                        <Close fontSize="small" />
                                    </IconButton>
                                </Paper>
                            )}
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} variant="outlined" color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        color="primary"
                        disabled={!selectedFile || !documentType || isUploading}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UploadDialog;