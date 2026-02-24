import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Paper,
} from '@mui/material';
import { RiCloseCircleFill } from '@remixicon/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { underlinedTypographyStyle } from '../../components/atoms/underlined-typography';

// Sortable item component
const SortableItem = ({ id, item, isSelected, onClick }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      elevation={isDragging ? 6 : isSelected ? 2 : 1}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        width: 'calc(25% - 16px)',
        cursor: 'grab',
        borderRadius: '4px',
        position: 'relative',
        backgroundColor: isDragging ? (isSelected ? '#E9F8FF' : '#F1F5F9') : isSelected ? '#fff' : '#F9FAFB',
        border: isSelected ? 'none' : '1px solid #E5E7EB',
        minWidth: '150px',
        '@media (max-width: 900px)': {
          width: 'calc(33.33% - 16px)',
        },
        '@media (max-width: 600px)': {
          width: 'calc(50% - 16px)',
        },
      }}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <Box
        sx={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? '#2C3E50' : '#E5E7EB',
          color: isSelected ? 'white' : '#6B7280',
          borderRadius: '4px',
          mr: 1.5,
          flexShrink: 0,
        }}
      >
        {isSelected ? item.order : '+'}
      </Box>
      <Typography noWrap sx={{ flex: 1 }}>
        {item.name}
      </Typography>
    </Paper>
  );
};

const CustomizeReportsDialog = ({
  open,
  initialSelectedFilters,
  reportTypes,
  onClose,
  onApplyFilters,
  onClearFilters,
}: any) => {
  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [unselectedItems, setUnselectedItems] = useState<any>([]);
  const [activeId, setActiveId] = useState<any>(null);
  const [activeContainer, setActiveContainer] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) {
      const selected = initialSelectedFilters?.map((name: any, index: any) => ({
        id: `selected-${name}`,
        name,
        order: index + 1,
      }));

      const unselected = reportTypes
        .filter((name: any) => !initialSelectedFilters.includes(name))
        .map((name: any) => ({
          id: `unselected-${name}`,
          name,
        }));

      setSelectedItems(selected);
      setUnselectedItems(unselected);
    }
  }, [open, initialSelectedFilters, reportTypes]);

  const handleSelectItem = (itemName: any) => {
    const item = unselectedItems.find((i: any) => i.name === itemName);
    if (!item) return;

    const nextOrder = selectedItems.length > 0 ? Math.max(...selectedItems.map((i: any) => i.order)) + 1 : 1;

    setSelectedItems([
      ...selectedItems,
      {
        id: `selected-${item.name}`,
        name: item.name,
        order: nextOrder,
      },
    ]);

    setUnselectedItems(unselectedItems.filter((i: any) => i.name !== itemName));
  };

  const handleDeselectItem = (itemName: any) => {
    const item = selectedItems.find((i: any) => i.name === itemName);
    if (!item) return;

    setUnselectedItems([
      ...unselectedItems,
      {
        id: `unselected-${item.name}`,
        name: item.name,
      },
    ]);

    const newSelected = selectedItems
      .filter((i: any) => i.name !== itemName)
      .sort((a: any, b: any) => a.order - b.order)
      .map((item: any, index: any) => ({
        ...item,
        order: index + 1,
      }));

    setSelectedItems(newSelected);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active }: any = event;
    setActiveId(active.id);

    // Determine which container we're dragging from
    if (selectedItems.some((item: any) => item.id === active.id)) {
      setActiveContainer('selected');
    } else {
      setActiveContainer('unselected');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers of the items
    const activeItemIsSelected = selectedItems.some((item: any) => item.id === activeId);
    const overItemIsSelected = selectedItems.some((item: any) => item.id === overId);

    // If items are in different containers
    if (activeItemIsSelected !== overItemIsSelected) {
      if (activeItemIsSelected) {
        // Moving from selected to unselected
        const activeItem = selectedItems.find((item: any) => item.id === activeId);
        if (!activeItem) return;

        setSelectedItems(selectedItems.filter((item: any) => item.id !== activeId));
        setUnselectedItems([
          ...unselectedItems,
          {
            id: `unselected-${activeItem.name}`,
            name: activeItem.name,
          },
        ]);
      } else {
        // Moving from unselected to selected
        const activeItem = unselectedItems.find((item: any) => item.id === activeId);
        if (!activeItem) return;

        const nextOrder = selectedItems.length > 0 ? Math.max(...selectedItems.map((i: any) => i.order)) + 1 : 1;

        setUnselectedItems(unselectedItems.filter((item: any) => item.id !== activeId));
        setSelectedItems([
          ...selectedItems,
          {
            id: `selected-${activeItem.name}`,
            name: activeItem.name,
            order: nextOrder,
          },
        ]);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveContainer(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // If the item was dropped in the same container
    if (
      selectedItems.some((item: any) => item.id === activeId) &&
      selectedItems.some((item: any) => item.id === overId)
    ) {
      // Reorder within selected items
      const oldIndex = selectedItems.findIndex((item: any) => item.id === activeId);
      const newIndex = selectedItems.findIndex((item: any) => item.id === overId);

      if (oldIndex !== newIndex) {
        const newSelectedItems = arrayMove(selectedItems, oldIndex, newIndex);
        const reorderedItems = newSelectedItems.map((item: any, index: any) => ({
          ...item,
          order: index + 1,
        }));
        setSelectedItems(reorderedItems);
      }
    } else if (
      unselectedItems.some((item: any) => item.id === activeId) &&
      unselectedItems.some((item: any) => item.id === overId)
    ) {
      // Reorder within unselected items
      const oldIndex = unselectedItems.findIndex((item: any) => item.id === activeId);
      const newIndex = unselectedItems.findIndex((item: any) => item.id === overId);

      if (oldIndex !== newIndex) {
        setUnselectedItems(arrayMove(unselectedItems, oldIndex, newIndex));
      }
    }
    // Cross-container dnd is handled in handleDragOver
  };

  const handleClearFilters = () => {
    const allUnselected = [
      ...unselectedItems,
      ...selectedItems.map((item: any) => ({ id: `unselected-${item.name}`, name: item.name })),
    ];
    setSelectedItems([]);
    setUnselectedItems(allUnselected);
    onClearFilters();
  };

  const handleApplyFilters = () => {
    const selectedNames = selectedItems.sort((a: any, b: any) => a.order - b.order).map((item: any) => item.name);
    onApplyFilters(selectedNames);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          borderRadius: '8px',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: (theme) => theme.palette.primary.main,
          mb: '25px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography color="#fff" variant="body1">
            Customize Reports Landing Page
          </Typography>
          <IconButton onClick={onClose}>
            <RiCloseCircleFill color="#fff" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="body1">
            Customize your reports to suit your needs! Choose the report type you use the most and organize them to your
            preference. Drag and drop to rearrange the order. Click 'Set Up' to get started.
          </Typography>
        </Box>
        <Box mb={1}>
          <Typography fontWeight="500" mb={1} sx={underlinedTypographyStyle}>
            Report Type Order
          </Typography>
        </Box>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Selected Reports (Drag and drop to reorder)
            </Typography>
            <Box
              sx={{
                minHeight: '80px',
                border: '1px dashed #ccc',
                borderRadius: '4px',
                p: 2,
                backgroundColor: activeContainer === 'selected' ? '#E1F5FE' : '#F9FAFB',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                transition: 'background-color 0.2s ease',
              }}
            >
              {selectedItems.length === 0 ? (
                <Typography sx={{ color: '#9CA3AF', p: 2, textAlign: 'center', width: '100%' }}>
                  No report types selected. Select items from below.
                </Typography>
              ) : (
                <SortableContext
                  items={selectedItems.map((item: any) => item.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {selectedItems
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((item: any) => (
                      <SortableItem
                        key={item.id}
                        id={item.id}
                        item={item}
                        isSelected={true}
                        onClick={() => handleDeselectItem(item.name)}
                      />
                    ))}
                </SortableContext>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
              Available Report Types (Click on reports to select)
            </Typography>
            <Box
              sx={{
                minHeight: '80px',
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
                p: 2,
                backgroundColor: activeContainer === 'unselected' ? '#E1F5FE' : '#F9FAFB',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                transition: 'background-color 0.2s ease',
              }}
            >
              {unselectedItems.length === 0 ? (
                <Typography sx={{ color: '#9CA3AF', p: 2, textAlign: 'center', width: '100%' }}>
                  All report types are selected.
                </Typography>
              ) : (
                <SortableContext
                  items={unselectedItems.map((item: any) => item.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {unselectedItems.map((item: any) => (
                    <SortableItem
                      key={item.id}
                      id={item.id}
                      item={item}
                      isSelected={false}
                      onClick={() => handleSelectItem(item.name)}
                    />
                  ))}
                </SortableContext>
              )}
            </Box>
          </Box>
        </DndContext>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'flex-end',
          px: 3,
          pb: 2,
          bgcolor: '#ECF0F1',
          borderTop: '2px solid #3F5C784D',
          pt: 2,
        }}
      >
        <Button
          variant={selectedItems.length > 0 ? 'contained' : 'outlined'}
          color="primary"
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            background: selectedItems.length > 0 ? '#2C3E50' : 'transparent',
          }}
          onClick={handleApplyFilters}
        >
          Set Up
        </Button>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mr: 1, borderRadius: 1, ml: 1, textTransform: 'none' }}
          onClick={handleClearFilters}
        >
          Clear
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeReportsDialog;
