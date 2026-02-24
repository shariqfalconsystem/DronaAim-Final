import React from "react";
import { Grid, List, ListItem, ListItemIcon, Box } from "@mui/material";
import { RiSettings2Line, RiUserLine } from "@remixicon/react";

function SidebarCategory({
  categories,
  selectedCategory,
  handleCategoryClick,
  isFleetTracking,
  theme,
  Logo,
}: any) {
  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={isFleetTracking ? 6 : 3}
      sx={{
        width: isFleetTracking ? 40 : 90,
        backgroundColor: theme.palette.primary.dark,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <List
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={Logo}
            alt="icon"
            style={{
              width: 50,
              height: 50,
              marginBottom: 10,
              marginTop: 10,
            }}
          />
          {categories.slice(0, -2).map((category: any) => (
            <ListItem
              key={category.title}
              onClick={() => handleCategoryClick(category)}
              sx={{
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ListItemIcon
                sx={{
                  padding: "10px",
                  backgroundColor:
                    selectedCategory.title === category.title
                      ? theme.palette.common.white
                      : "transparent",
                }}
              >
                {selectedCategory.title === category.title
                  ? category.selectedIcon
                  : category.icon}
              </ListItemIcon>
            </ListItem>
          ))}
        </Box>
        <Box>
          {categories.slice(-2).map((category: any) => (
            <ListItem
              key={category.title}
              onClick={() => handleCategoryClick(category)}
              sx={{
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ListItemIcon
                sx={{
                  padding: "10px",
                  backgroundColor:
                    selectedCategory.title === category.title
                      ? theme.palette.common.white
                      : "transparent",
                }}
              >
                {selectedCategory.title === category.title
                  ? category.selectedIcon
                  : category.icon}
              </ListItemIcon>
            </ListItem>
          ))}
        </Box>
      </List>
    </Grid>
  );
}

export default SidebarCategory;
