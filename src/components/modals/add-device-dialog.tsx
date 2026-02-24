import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { RiCloseCircleFill } from "@remixicon/react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

interface AddVehicleDialogProps {
  open: boolean;
  handleClose: () => void;
  isMobile: any;
}

const AddDeviceDialog: React.FC<AddVehicleDialogProps> = ({
  open,
  handleClose,
  isMobile,
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        style: {
          borderRadius: "10px",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          mb: "25px",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="h6">
            Add New Device
          </Typography>
          <IconButton onClick={handleClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <form>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vehicleName" sx={{ color: "#2C3E50" }}>
                  Device Name
                </InputLabel>
                <TextField fullWidth id="vehicleName" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vin" sx={{ color: "#2C3E50" }}>
                  Manufacturer Or Brand
                </InputLabel>
                <TextField fullWidth id="vin" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vin" sx={{ color: "#2C3E50" }}>
                  Model Or Version
                </InputLabel>
                <TextField fullWidth id="vin" variant="outlined" />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vin" sx={{ color: "#2C3E50" }}>
                  Serial Number
                </InputLabel>
                <TextField fullWidth id="vin" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vin" sx={{ color: "#2C3E50" }}>
                  Firmware Version
                </InputLabel>
                <TextField fullWidth id="vin" variant="outlined" />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vin" sx={{ color: "#2C3E50" }}>
                  IMEI Number
                </InputLabel>
                <TextField fullWidth id="vin" variant="outlined" />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="assignVehicle" sx={{ color: "#2C3E50" }}>
                  Assign Vehicle
                </InputLabel>
                <FormControl fullWidth variant="outlined">
                  <Select id="assignVehicle">
                    <MenuItem value="form1">Form 1</MenuItem>
                    <MenuItem value="form2">Form 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="installationDate">
                  Installation Date
                </InputLabel>
                <DatePicker label="" sx={{ width: "100%" }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="vin" sx={{ color: "#2C3E50" }}>
                  Installer ID
                </InputLabel>
                <TextField fullWidth id="vin" variant="outlined" />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box mb={2}>
                <InputLabel htmlFor="fmcsa" sx={{ color: "#2C3E50" }}>
                  FMCSA ELD Compliance
                </InputLabel>
                <FormControl fullWidth variant="outlined">
                  <Select id="fmcsa">
                    <MenuItem value="form1">Complaint</MenuItem>
                    <MenuItem value="form2">Complaint 2</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mr: 1, borderRadius: 2 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="primary"
              sx={{ borderRadius: 2, background: "#2C3E50" }}
            >
              Save
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceDialog;
