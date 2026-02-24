import { useState } from 'react';
import { Drawer, Grid, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SubcategoryList from './sidebar-subcategory';
import { categories, SuperCategories } from './sidebar-data';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);

  const currentPath = location.pathname;
  const isFleetTracking = currentPath.includes('fleet-tracking');

  const currentUserRole = useSelector((state: any) => state.auth.currentUserRole);

  const selectedCategory = currentUserRole === 'fleetManagerSuperUser' ? SuperCategories[0] : categories[0];

  const handleSubcategoryClick = (subcategory: any) => {
    navigate(subcategory.key);
    if (isMobile) setDrawerOpen(false);
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const handleSubMenuToggle = (key: any) => {
    setOpenSubMenu(openSubMenu === key ? null : key);
  };

  const sidebarWidth = isMobile ? '60%' : '14%';
  const appBarHeight = theme.mixins.toolbar.minHeight;

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      anchor="left"
      open={drawerOpen || !isMobile}
      onClose={toggleDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          marginTop: `${appBarHeight}px`,
          height: `calc(100vh - ${appBarHeight}px)`,
          bgcolor: '#3F5C78',
        },
      }}
    >
      <Grid container direction="row" sx={{ height: '100%', zIndex: 10 }}>
        <SubcategoryList
          selectedCategory={selectedCategory}
          currentPath={currentPath}
          isFleetTracking={isFleetTracking}
          handleSubcategoryClick={handleSubcategoryClick}
          handleSubMenuToggle={handleSubMenuToggle}
          openSubMenu={openSubMenu}
          isMobile={isMobile}
        />
      </Grid>
    </Drawer>
  );
}

export default Sidebar;
