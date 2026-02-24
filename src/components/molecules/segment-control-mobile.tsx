// SegmentControlContainer.tsx
import React from "react";
import { Box, Button, Card, Divider, styled } from "@mui/material";

interface SegmentControlProps {
  selectedButton: string;
  handleButtonClick: (button: string) => void;
}

interface HighlightButtonProps {
  selected?: boolean;
}

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

const SegmentControlContainermobile = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 16,
  height: 30,
  width: "100%",
  padding: "0 16px",
  boxSizing: "border-box",
}));

const HighlightButton = styled(
  ({ selected, ...other }: HighlightButtonProps & any) => <Button {...other} />
)(({ theme, selected }) => ({
  backgroundColor: selected
    ? theme.palette.grey[300]
    : theme.palette.common.white,
  color: theme.palette.common.black,
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

const SegmentControlContainer: React.FC<SegmentControlProps> = ({
  selectedButton,
  handleButtonClick,
}) => {
  return (
    <SegmentControlContainermobile>
      <ButtonCard>
        <Box display="flex" width="100%">
          <HighlightButton
            selected={selectedButton === "view all"}
            onClick={() => handleButtonClick("view all")}
          >
            View all
          </HighlightButton>
          <Divider orientation="vertical" flexItem />
          <HighlightButton
            selected={selectedButton === "driver un-assigned"}
            onClick={() => handleButtonClick("driver un-assigned")}
          >
            Driver Un-Assigned
          </HighlightButton>
          <Divider orientation="vertical" flexItem />
          <HighlightButton
            selected={selectedButton === "maintenance"}
            onClick={() => handleButtonClick("maintenance")}
          >
            Maintenance
          </HighlightButton>
        </Box>
      </ButtonCard>
    </SegmentControlContainermobile>
  );
};

export default SegmentControlContainer;
