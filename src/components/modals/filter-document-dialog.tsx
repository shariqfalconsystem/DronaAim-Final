import { useEffect, useRef, useState } from 'react';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Typography } from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { underlinedTypographyStyle } from '../atoms/underlined-typography';
import { PiCalendarDotsDuotone } from 'react-icons/pi';
import { clearFilterCriteria, selectFilterCriteria, setFilterCriteria } from '../../redux/documents/documentsSlice';

export const FilterDocumentDialog = ({
  filterPopupOpen,
  handleFilterPopupClose,
  filterButtonPosition,
  onApplyFilter,
  onClearFilter,
}: any) => {
  const dispatch = useDispatch();
  const modalRef = useRef<any>(null);
  const datePickerRef = useRef<any>(null);
  const filterCriteria = useSelector(selectFilterCriteria);

  const [fromDate, setFromDate] = useState<any>(filterCriteria.fromDate ? dayjs(filterCriteria.fromDate) : null);
  const [toDate, setToDate] = useState<any>(filterCriteria.toDate ? dayjs(filterCriteria.toDate) : null);
  const [approvedChecked, setApprovedChecked] = useState(filterCriteria.approved);
  const [rejectedChecked, setRejectedChecked] = useState(filterCriteria.rejected);
  const [verificationPendingChecked, setVerificationPendingChecked] = useState(filterCriteria.verificationPending);
  const [pngChecked, setPngChecked] = useState(filterCriteria.png);
  const [jpgChecked, setJpgChecked] = useState(filterCriteria.jpg);
  const [pdfChecked, setPdfChecked] = useState(filterCriteria.pdf);
  const [docChecked, setDocChecked] = useState(filterCriteria.doc);

  const [selectedTypeCount, setSelectedTypeCount] = useState(0);
  const [selectedStatusCount, setSelectedStatusCount] = useState(0);

  const onChangeFrom = (date: any) => setFromDate(date);
  const onChangeTo = (date: any) => setToDate(date);

  const handleApplyFilter = () => {
    const filters = {
      fromDate: fromDate ? fromDate.startOf('day').valueOf() : null,
      toDate: toDate ? toDate.endOf('day').valueOf() : null,
      approved: approvedChecked,
      rejected: rejectedChecked,
      verificationPending: verificationPendingChecked,
      png: pngChecked,
      jpg: jpgChecked,
      pdf: pdfChecked,
      doc: docChecked,
    };
    dispatch(setFilterCriteria(filters));
    onApplyFilter(filters);
    handleFilterPopupClose();
  };

  const handleClearFilter = () => {
    setFromDate(null);
    setToDate(null);
    setApprovedChecked(false);
    setRejectedChecked(false);
    setVerificationPendingChecked(false);
    setPngChecked(false);
    setJpgChecked(false);
    setPdfChecked(false);
    setDocChecked(false);
    setSelectedTypeCount(0);
    setSelectedStatusCount(0);
    dispatch(clearFilterCriteria());
    onClearFilter();
  };

  const handleTypeChange = (checked: boolean, setChecked: (checked: boolean) => void) => {
    if (checked && selectedTypeCount >= 3) return;
    setChecked(checked);
    setSelectedTypeCount((prev) => (checked ? prev + 1 : prev - 1));
  };

  const handleStatusChange = (checked: boolean, setChecked: (checked: boolean) => void) => {
    if (checked && selectedStatusCount >= 2) return;
    setChecked(checked);
    setSelectedStatusCount((prev) => (checked ? prev + 1 : prev - 1));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (modalRef.current && !modalRef.current.contains(target) && !datePickerRef.current?.contains(target)) {
        handleFilterPopupClose();
      }
    };

    if (filterPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterPopupOpen, handleFilterPopupClose]);

  if (!filterPopupOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <Box
        ref={modalRef}
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '300px',
          position: 'absolute',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          top: filterButtonPosition ? `${filterButtonPosition.top}px` : 'auto',
          left: filterButtonPosition ? `${filterButtonPosition.left - 200}px` : 'auto',
        }}
      >
        <Box
          sx={{
            backgroundColor: '#3F5C78',
            color: 'white',
            padding: '12px 16px',
            fontSize: '16px',
            fontWeight: 'normal',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <Typography>Filter By</Typography>
          <IconButton size="small" sx={{ color: 'white', padding: 0 }} onClick={handleFilterPopupClose}>
            <RiCloseCircleFill />
          </IconButton>
        </Box>
        <Box sx={{ padding: '16px' }}>
          <Box mb={2}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Date
            </Typography>
            <Box sx={{ width: '100%' }}>
              <DatePicker
                ref={datePickerRef}
                onChange={onChangeFrom}
                value={fromDate}
                size="middle"
                placeholder="From"
                style={{ width: '100%' }}
                suffixIcon={<PiCalendarDotsDuotone color="black" size={18} />}
              />
            </Box>
            <Box sx={{ width: '100%', mt: 2 }}>
              <DatePicker
                ref={datePickerRef}
                onChange={onChangeTo}
                value={toDate}
                size="middle"
                placeholder="To"
                style={{ width: '100%' }}
                suffixIcon={<PiCalendarDotsDuotone color="black" size={18} />}
              />
            </Box>
          </Box>
          <Box mb={2}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Type
            </Typography>
            <FormControlLabel
              control={
                <Checkbox checked={pngChecked} onChange={(e) => handleTypeChange(e.target.checked, setPngChecked)} />
              }
              label="PNG"
            />
            <FormControlLabel
              control={
                <Checkbox checked={jpgChecked} onChange={(e) => handleTypeChange(e.target.checked, setJpgChecked)} />
              }
              label="JPG"
            />
            <FormControlLabel
              control={
                <Checkbox checked={pdfChecked} onChange={(e) => handleTypeChange(e.target.checked, setPdfChecked)} />
              }
              label="PDF"
            />
            <FormControlLabel
              control={
                <Checkbox checked={docChecked} onChange={(e) => handleTypeChange(e.target.checked, setDocChecked)} />
              }
              label="DOC"
            />
          </Box>
          <Box mb={2}>
            <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
              Status
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={approvedChecked}
                  onChange={(e) => handleStatusChange(e.target.checked, setApprovedChecked)}
                />
              }
              label="Approved"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rejectedChecked}
                  onChange={(e) => handleStatusChange(e.target.checked, setRejectedChecked)}
                />
              }
              label="Rejected"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={verificationPendingChecked}
                  onChange={(e) => handleStatusChange(e.target.checked, setVerificationPendingChecked)}
                />
              }
              label="Verification Pending"
            />
          </Box>
        </Box>
        <Box
          sx={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button variant="outlined" disableRipple sx={{ textTransform: 'none',color:'#003350',borderColor: '#003350' }} onClick={handleClearFilter}>
            Clear Filter
          </Button>
          <Button variant="contained" color="primary" disableRipple sx={{ textTransform: 'none',backgroundColor:'#003350' }} onClick={handleApplyFilter}>
            Search
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
