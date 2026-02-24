import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import HelpCenterHeader from '../landing/help-center-header';
import ContentList from './drafts-content-list';
import { useSelector, useDispatch } from 'react-redux';
import { getAllDrafts } from '../../../../services/admin/helpCenterServices';
import { fetchHelpCenterTopics } from '../../../../redux/help-center/helpCenterSlice';

const AllDrafts: React.FC = () => {
  const dispatch = useDispatch();
  const currentUserId = useSelector((state: any) => state.auth.currentUserId);

  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pageDetails, setPageDetails] = useState<any>({
    totalRecords: 0,
    pageSize: 10,
    currentPage: 1,
  });

  // Fetch drafts data
  const fetchDrafts = async (page: number = 1) => {
    try {
      setLoading(true);
      const requestBody: any = {};
      const { data, status } = await getAllDrafts(currentUserId, requestBody, page, pageDetails.pageSize);

      setDrafts(data.draftsList || []);
      setPageDetails({
        totalRecords: data.pageDetails?.totalRecords || 0,
        pageSize: data.pageDetails?.pageSize || 10,
        currentPage: data.pageDetails?.currentPage || page,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch drafts');
      setDrafts([]);
      setPageDetails({ totalRecords: 0, pageSize: 10, currentPage: 1 });
    } finally {
      setLoading(false);
    }
  };

  // Format date helper function
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  // Get placeholder text helper function
  const getPlaceholderText = (content: any) => {
    if (!content || !content.blocks) return '';

    // Find first paragraph block
    const paragraphBlock = content.blocks.find((block: any) => block.type === 'paragraph');
    if (paragraphBlock && paragraphBlock.data && paragraphBlock.data.text) {
      // Limit text to reasonable length
      return paragraphBlock.data.text.substring(0, 150) + '...';
    }
    return '';
  };

  // Handle successful draft deletion
  const handleDeleteSuccess = () => {
    // Refresh the drafts list after successful deletion
    fetchDrafts(pageDetails.currentPage);
  };

  // Handle page change event from ContentList
  const handlePageChange = (newPage: number) => {
    fetchDrafts(newPage);
  };

  useEffect(() => {
    // Fetch drafts and topics when component mounts
    fetchDrafts();
    dispatch(fetchHelpCenterTopics());
  }, [currentUserId, dispatch]);

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', position: 'relative' }}>
      <HelpCenterHeader />

      <Box sx={{ display: 'flex', p: 4, gap: 1, borderRadius: 4 }}>
        <ContentList
          drafts={drafts}
          loading={loading}
          error={error}
          pageDetails={pageDetails}
          formatDate={formatDate}
          getPlaceholderText={getPlaceholderText}
          onDeleteSuccess={handleDeleteSuccess}
          onPageChange={handlePageChange}
        />
      </Box>
    </Box>
  );
};

export default AllDrafts;
