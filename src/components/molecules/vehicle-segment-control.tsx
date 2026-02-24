import React from "react";
import { Card, Divider, Box, Button, styled } from "@mui/material";

const ButtonCard = styled(Card)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
  boxShadow: "none",
  border: "1px solid #ccc",
  backgroundColor: "#f5f5f5",
  width: "fit-content",
  marginRight: "center",
});

const HighlightButton = styled(({ selected, ...other }: any) => (
  <Button {...other} />
))(({ theme, selected }) => ({
  backgroundColor: selected
    ? theme.palette.primary.main
    : theme.palette.common.white,
  color: selected ? theme.palette.common.white : theme.palette.common.black,
  "&:hover": {
    backgroundColor: theme.palette.grey[400],
  },
  height: "30px",
  borderRadius: 0,
  textTransform: "none",
  fontSize: "11px",
  padding: "0 8px",
  whiteSpace: "nowrap",
  minWidth: "80px",
  maxWidth: "150px",
}));

interface VehicleSegmentControlProps {
  selectedButton: string;
  handleButtonClick: (button: string) => void;
  segmentValues: any;
}

const VehicleSegmentControl: React.FC<VehicleSegmentControlProps> = ({
  selectedButton,
  handleButtonClick,
  segmentValues,
}) => {
  return (
    <ButtonCard>
      <Box display="flex" width="100%">
        <HighlightButton
          selected={selectedButton === "view all"}
          onClick={() => handleButtonClick("view all")}
        >
          {segmentValues.filter1}
        </HighlightButton>
        <Divider orientation="vertical" flexItem />
        {segmentValues.filter2 && (
          <HighlightButton
            selected={selectedButton === "driver un-assigned"}
            onClick={() => handleButtonClick("driver un-assigned")}
          >
            {segmentValues.filter2}
          </HighlightButton>
        )}
        <Divider orientation="vertical" flexItem />
        <HighlightButton
          selected={selectedButton === "maintenance"}
          onClick={() => handleButtonClick("maintenance")}
        >
          {segmentValues.filter3}
        </HighlightButton>
        {segmentValues.filter4 && (
          <HighlightButton
            selected={selectedButton === "offline"}
            onClick={() => handleButtonClick("offline")}
          >
            {segmentValues.filter4}
          </HighlightButton>
        )}
      </Box>
    </ButtonCard>
  );
};

export default VehicleSegmentControl;
