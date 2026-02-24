// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3F5C78",
      light: "##ECF0F1",
      dark: "#2C3E50",
    },
    secondary: {
      main: "#E6F1FB",
      light: "#ECF0F1",
      dark: "#D9DEE4",
    },
    background: {
      default: "#ECF0F1",
      paper: "#FCFDFD",
    },
    action: {
      active: "#1f3038",
      hover: "#1f3038",
    },
    text: {
      primary: "#000",
    },
  },
  typography: {
    fontFamily: [
      "Poppins",
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
});

export default theme;
