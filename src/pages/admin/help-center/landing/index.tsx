import React, { useState, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Category, PublishedContentItemType } from '../types';
import BottomActions from './bottom-actions';
import CategorySidebar from './category-sidebar';
import ContentList from './content-list';
import HelpCenterHeader from './help-center-header';
import { getAllPublishedContent } from '../../../../services/admin/helpCenterServices';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHelpCenterTopics, selectAllTopics } from '../../../../redux/help-center/helpCenterSlice';

const HelpCenter: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);
  const categories = useSelector(selectAllTopics);

  // Check if there's a selected category in the navigation state
  const categoryFromNavigation = location.state?.selectedCategory;
  const [selectedCategory, setSelectedCategory] = useState(categoryFromNavigation || 'All Topics');

  const [contentItems, setContentItems] = useState<PublishedContentItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const limit = 10;

  // Helper function to extract plain text from content blocks
  const extractPlainTextContent = (content: any): string => {
    if (!content || !content.blocks) return '';

    // Extract text from paragraph blocks and concatenate
    const textBlocks = content.blocks
      .filter((block: any) => block.type === 'paragraph')
      .map((block: any) => block.data.text);

    // Join with space and truncate if too long
    let plainText = textBlocks.join(' ');
    if (plainText.length > 200) {
      plainText = plainText.substring(0, 200) + '...';
    }

    return plainText;
  };

  // Debounce the search text
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 1500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchText]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchText, selectedCategory]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      dispatch(fetchHelpCenterTopics());

      const requestBody: { topicNames?: string[]; searchText?: string } = {};

      if (selectedCategory !== 'All Topics') {
        requestBody.topicNames = [selectedCategory];
      }

      if (debouncedSearchText.trim()) {
        requestBody.searchText = debouncedSearchText.trim();
      }

      const contentResponse = await getAllPublishedContent(currentUserId, requestBody, page, limit);

      if (contentResponse?.data) {
        const transformedItems: PublishedContentItemType[] = contentResponse.data?.publishedList?.map((item: any) => ({
          id: item.publishedId,
          category: item?.topicNames[0] || '',
          title: item.title,
          subtitle: item.subTitle,
          date: new Date(item.createdAt).toLocaleDateString(),
          placeholder: extractPlainTextContent(item.content),
          content: item.content,
          publishedBy: item.publishedBy,
          publishedVersion: item.publishedVersion,
          activePersonas: item.activePersonas || [],
        }));

        setContentItems(transformedItems);
        setTotalPages(Math.ceil(contentResponse.data.pageDetails.totalRecords / limit));
        setTotalRecords(contentResponse.data.pageDetails.totalRecords);
      }
    } catch (err) {
      console.error('Failed to fetch help center data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, page, debouncedSearchText, currentUserId, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear navigation state after component mount
  useEffect(() => {
    // This prevents the selected category from persisting after page refresh
    if (location.state?.selectedCategory) {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HelpCenterHeader onSearchChange={handleSearchChange} searchText={searchText} />
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HelpCenterHeader onSearchChange={handleSearchChange} searchText={searchText} />
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <HelpCenterHeader onSearchChange={handleSearchChange} searchText={searchText} isLanding={true} />

      <Box sx={{ display: 'flex', flex: 1, p: 2, gap: 2 }}>
        <Box sx={{ width: '300px', bgcolor: '#F5FAFF', borderRadius: 2 }}>
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <BottomActions />
        </Box>
        <Box sx={{ flex: 1 }}>
          <ContentList
            selectedCategory={selectedCategory}
            contentItems={contentItems}
            totalRecords={totalRecords}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HelpCenter;
