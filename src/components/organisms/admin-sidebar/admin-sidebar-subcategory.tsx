import React from 'react';
import { Grid, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';
import helpcenter from '../../../assets/icons/help-center.png';

function AdminSidebarSubcategory({
  selectedCategory,
  currentPath,
  handleSubcategoryClick,
  handleSubMenuToggle,
  openSubMenu,
  isMobile,
}: any) {
  const isVehicleScreen = currentPath.includes('vehicles');
  const isHelpCenter = currentPath.includes('help-center');

  const navigate = useNavigate();
  const subcategoryWidth = isMobile ? '100%' : 'calc(100% - 80px)';

  const handleHelpCenterClick = () => {
    navigate('/admin/help-center');
  };

  return (
    <Grid
      item
      xs={12}
      sx={{
        width: subcategoryWidth,
        backgroundColor: '#003350',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
    >
      {selectedCategory.content && selectedCategory.content.length > 0 && (
        <List
          sx={{
            marginTop: isMobile ? 0 : '8px',
            paddingX: '8px',
            flexGrow: 1,
          }}
        >
          {selectedCategory.content.map((item: any) => (
            <React.Fragment key={item.key}>
              <ListItem
                onClick={() => {
                  item.subOptions ? handleSubMenuToggle(item.key) : handleSubcategoryClick(item);
                }}
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  backgroundColor: currentPath.includes(item.key) ? '#fff' : 'transparent',
                  borderRadius: '4px',
                  marginY: '8px',
                  padding: '6px 12px',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    marginRight: '8px',

                    '& img': {
                      width: '29px',
                      height: '29px',
                    },
                    '& svg': {
                      width: '29px',
                      height: '29px',
                    },
                  }}
                >
                  {currentPath.includes(item.key) ? item.selectedIcon : item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.text}
                  sx={{
                    color: (theme) =>
                      currentPath.includes(item.key) || (isVehicleScreen && item.key === 'assets')
                        ? theme.palette.common.black
                        : theme.palette.common.white,
                    margin: 0,
                    padding: 0,
                    '& .MuiListItemText-primary': {
                      fontWeight:
                        currentPath.includes(item.key) || (isVehicleScreen && item.key === 'assets')
                          ? 'bold'
                          : 'normal',
                      color:
                        currentPath.includes(item.key) || (isVehicleScreen && item.key === 'assets')
                          ? '#2C3E50'
                          : '#fff',
                      fontSize: '0.8rem',
                    },
                  }}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Help Center Button at the bottom */}
      <ListItem
        onClick={handleHelpCenterClick}
        sx={{
          cursor: 'pointer',
          width: 'calc(100% - 16px)',
          backgroundColor: isHelpCenter ? '#fff' : 'transparent',
          borderRadius: 1,
          marginY: 2,
          marginX: 1,
          padding: '6px 12px',
          textTransform: 'none',
          alignItems: 'center',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 'auto',
            marginRight: '8px',

            '& img': {
              width: '29px',
              height: '29px',
            },
            '& svg': {
              width: '29px',
              height: '29px',
            },
          }}
        >
          <img
            src={helpcenter}
            height={30}
            width={30}
            className="help-center-icon"
            style={{ filter: isHelpCenter ? 'invert(1) brightness(2)' : 'none' }}
          />
        </ListItemIcon>
        <ListItemText
          primary="Help Center"
          sx={{
            color: isHelpCenter ? '#2C3E50' : '#fff',
            margin: 0,
            padding: 0,
            '& .MuiListItemText-primary': {
              fontWeight: isHelpCenter ? 'bold' : 'normal',
              color: isHelpCenter ? '#2C3E50' : '#fff',
              fontSize: '0.8rem',
            },
          }}
        />
      </ListItem>
    </Grid>
  );
}

export default AdminSidebarSubcategory;
