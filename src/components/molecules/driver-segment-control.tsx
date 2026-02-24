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

interface DriverSegmentControlProps {
  selectedButton: string;
  handleButtonClick: (button: string) => void;
}

const DriverSegmentControl: React.FC<DriverSegmentControlProps> = ({
  selectedButton,
  handleButtonClick,
}) => {
  return (
    <ButtonCard>
      <Box display="flex" width="100%">
        <HighlightButton
          selected={selectedButton === "view all"}
          onClick={() => handleButtonClick("view all")}
        >
          View all (283)
        </HighlightButton>
        <Divider orientation="vertical" flexItem />
        <HighlightButton
          selected={selectedButton === "active"}
          onClick={() => handleButtonClick("active")}
        >
          Active (178)
        </HighlightButton>
        <Divider orientation="vertical" flexItem />
        <HighlightButton
          selected={selectedButton === "off-duty"}
          onClick={() => handleButtonClick("maintenance")}
        >
          Off Duty (23)
        </HighlightButton>
      </Box>
    </ButtonCard>
  );
};

export default DriverSegmentControl;
