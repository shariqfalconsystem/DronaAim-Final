import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Category } from '../types';
import CategoryIcon from './category-icon';
import { useNavigate, useLocation } from 'react-router-dom';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategoryClick = (category: string) => {
    onSelectCategory(category);

    // Check if we're not already on the help center landing page
    if (!location.pathname.endsWith('/help-center')) {
      // Navigate to help center with state to preserve the selected category
      navigate('/admin/help-center', {
        state: { selectedCategory: category },
      });
    }
  };

  return (
    <Box sx={{ width: '100%', flexShrink: 0 }}>
      <List sx={{ backgroundColor: '#DFE8F0', p: 2, borderRadius: 2 }}>
        {categories.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              mb: 2,
              px: 3,
              borderRadius: 2,
              bgcolor: selectedCategory === item.name ? '#247FAD' : 'transparent',
              color: selectedCategory === item.name ? '#fff' : 'grey.700',
              '&:hover': {
                bgcolor: selectedCategory === item.name ? '#247FAD' : 'grey.100',
                cursor: 'pointer',
              },
              cursor: 'pointer',
              border: '1px solid rgb(202, 202, 202)',
            }}
            onClick={() => handleCategoryClick(item.name)}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <CategoryIcon type={item.icon} selected={selectedCategory === item.name} />
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CategorySidebar;
