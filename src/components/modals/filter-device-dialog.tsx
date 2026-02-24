// @flow
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
} from "@mui/material";
import { RiCloseCircleFill } from "@remixicon/react";

export const FilterDeviceDialog = ({
  filterPopupOpen,
  handleFilterPopupClose,
  filterButtonPosition,
}: any) => {
  return (
    <div>
      <Dialog
        open={filterPopupOpen}
        onClose={handleFilterPopupClose}
        maxWidth="lg"
        PaperProps={{
          style: {
            width: "500px",
            height: "auto",
            borderRadius: "10px",
            position: "absolute",
            top: filterButtonPosition ? filterButtonPosition.top : "auto",
            left: filterButtonPosition ? filterButtonPosition.left - 400 : "auto",
            transform: "none",
          },
        }}
      >
        <DialogTitle
          style={{
            backgroundColor: "#3F5C78",
            color: "white",
            padding: "20px 15px",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Filter By</span>
            <IconButton
              size="small"
              style={{ color: "white" }}
              onClick={handleFilterPopupClose}
            >
              <RiCloseCircleFill />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent style={{ padding: "15px" }}>
          <Grid container spacing={4} sx={{ mb: 10 }}>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: "10px 0" }}>Vehicle</h4>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Vehicle Attached"
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                <h4 style={{ margin: "10px 0" }}>Vehicle Type</h4>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Trucks"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Vans"
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <h4 style={{ margin: "10px 0", textWrap: 'nowrap' }}>FMCA Compliance Status</h4>
                <FormControlLabel control={<Checkbox />} label="Complaint" />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", mt: 2 }}>
                <h4 style={{ margin: "10px 0" }}>Status Type</h4>
                <FormControlLabel control={<Checkbox />} label="Active" />
                <FormControlLabel control={<Checkbox />} label="Offline" />
                <FormControlLabel control={<Checkbox />} label="Idle" />
                <FormControlLabel control={<Checkbox />} label="Not Connected" />
                <FormControlLabel control={<Checkbox />} label="Upgrading" />
                <FormControlLabel control={<Checkbox />} label="Under Maintainence" />

              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          style={{ justifyContent: "space-between", padding: "10px 15px" }}
        >
          <Button variant="outlined" disableRipple>Clear Filter</Button>
          <Button variant="contained" color="primary" disableRipple>
            Search
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
