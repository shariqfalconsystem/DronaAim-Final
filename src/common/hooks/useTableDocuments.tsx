import { useState, useEffect, useMemo, useRef } from 'react';

interface TableSortProps<T> {
  data: T[];
  itemsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  searchQueries: Record<string, string>;
  fetchData: any;
  filterCriteria?: any;
}

function useTableDocuments<T>({
  data,
  itemsPerPage,
  totalRecords,
  onPageChange,
  searchQueries,
  fetchData,
  filterCriteria = {},
}: TableSortProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localData, setLocalData] = useState<T[]>(data);

  // Use refs to track previous values to detect actual changes
  const prevSearchQueries = useRef<Record<string, string>>(searchQueries);
  const prevFilterCriteria = useRef<any>(filterCriteria);
  const prevSortColumn = useRef<string | null>(sortColumn);
  const prevSortDirection = useRef<'asc' | 'desc'>(sortDirection);

  const isLocalProcessing = totalRecords < 50000;

  useEffect(() => {
    if (isLocalProcessing) {
      setLocalData(data);
    }
  }, [data, isLocalProcessing]);

  useEffect(() => {
    if (!isLocalProcessing) {
      fetchData(currentPage, sortColumn, sortDirection, searchQueries);
    }
  }, [currentPage, sortColumn, sortDirection, searchQueries, isLocalProcessing, fetchData]);

  const filteredData = useMemo(() => {
    if (!isLocalProcessing) return localData;

    return localData?.filter((item: any) => {
      // Apply search queries
      const matchesSearch = Object.entries(searchQueries).every(([column, query]) =>
        String(item[column] ?? '')
          .toLowerCase()
          .includes(query.toLowerCase())
      );

      // Apply filter criteria
      const documentDate = item.uploadedAtTs;

      // Parse fromDate and toDate
      const fromDate = filterCriteria?.fromDate ? new Date(filterCriteria.fromDate).setHours(0, 0, 0, 0) : null;
      const toDate = filterCriteria?.toDate ? new Date(filterCriteria.toDate).setHours(23, 59, 59, 999) : null;

      // Updated date range logic
      const isDateInRange =
        (fromDate === null || documentDate >= fromDate) && (toDate === null || documentDate <= toDate);

      const isDateValid =
        isDateInRange || (fromDate !== null && toDate !== null && documentDate >= fromDate && documentDate <= toDate);

      const isStatusMatched =
        (!filterCriteria?.approved && !filterCriteria?.rejected && !filterCriteria?.verificationPending) ||
        (filterCriteria?.approved && item.status === 'APPROVED') ||
        (filterCriteria?.rejected && item.status === 'REJECTED') ||
        (filterCriteria?.verificationPending && item.status === 'PENDING');

      const fileTypesMap = {
        png: 'image/png',
        jpg: ['image/jpeg', 'image/jpg'],
        pdf: 'application/pdf',
        doc: 'application/msword',
      };

      const isFileTypeMatched =
        Object.entries(fileTypesMap).every(([key]) => {
          return !filterCriteria?.[key];
        }) ||
        Object.entries(fileTypesMap).some(([key, mimeTypes]) => {
          if (Array.isArray(mimeTypes)) {
            return filterCriteria?.[key] && mimeTypes.includes(item.contentType);
          }
          return filterCriteria?.[key] && item.contentType === mimeTypes;
        });

      // Ensure at least one criterion is considered when filtering
      const hasNoCriteria = !filterCriteria || Object.keys(filterCriteria).length === 0;

      return matchesSearch && (hasNoCriteria || (isDateValid && isStatusMatched && isFileTypeMatched));
    });
  }, [localData, searchQueries, filterCriteria, isLocalProcessing]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!isLocalProcessing) return filteredData;

    let sorted: any = [...filteredData];

    if (sortColumn) {
      sorted.sort((a: any, b: any) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        // Handle sorting for numeric fields like 'size'
        if (sortColumn === 'size') {
          const aSize = parseFloat(aValue) || 0;
          const bSize = parseFloat(bValue) || 0;

          if (aSize < bSize) return sortDirection === 'asc' ? -1 : 1;
          if (aSize > bSize) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }

        // Handle sorting for date fields (timestamp)
        if (sortColumn === 'date' || sortColumn === 'uploadedAtTs') {
          const aDate = new Date(aValue).getTime() || 0;
          const bDate = new Date(bValue).getTime() || 0;

          if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
          if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }

        if (sortColumn === 'fileName') {
          const aString = String(aValue || '').toLowerCase();
          const bString = String(bValue || '').toLowerCase();

          return sortDirection === 'asc' ? aString.localeCompare(bString) : bString.localeCompare(aString);
        }

        // Default string comparison for other columns
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [filteredData, sortColumn, sortDirection, isLocalProcessing]);

  // Pagination logic
  const displayedItems = useMemo(() => {
    if (!isLocalProcessing) return data;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedData.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedData, currentPage, itemsPerPage, isLocalProcessing, data]);

  // Helper function to check if search queries have meaningfully changed
  const hasSearchQueriesChanged = (prev: Record<string, string>, current: Record<string, string>) => {
    const prevKeys = Object.keys(prev);
    const currentKeys = Object.keys(current);

    // Check if number of keys changed
    if (prevKeys.length !== currentKeys.length) return true;

    // Check if any non-empty values changed
    return prevKeys.some((key) => {
      const prevValue = (prev[key] || '').trim();
      const currentValue = (current[key] || '').trim();
      return prevValue !== currentValue && (prevValue !== '' || currentValue !== '');
    });
  };

  // Helper function to check if filter criteria have changed
  const hasFilterCriteriaChanged = (prev: any, current: any) => {
    return JSON.stringify(prev) !== JSON.stringify(current);
  };

  // Helper function to check if sorting has changed
  const hasSortingChanged = (
    prevColumn: string | null,
    currentColumn: string | null,
    prevDirection: 'asc' | 'desc',
    currentDirection: 'asc' | 'desc'
  ) => {
    return prevColumn !== currentColumn || prevDirection !== currentDirection;
  };

  // Reset to page 1 only when search, filter, or sorting criteria actually change meaningfully
  useEffect(() => {
    const searchChanged = hasSearchQueriesChanged(prevSearchQueries.current, searchQueries);
    const filterChanged = hasFilterCriteriaChanged(prevFilterCriteria.current, filterCriteria);
    const sortingChanged = hasSortingChanged(
      prevSortColumn.current,
      sortColumn,
      prevSortDirection.current,
      sortDirection
    );

    if ((searchChanged || filterChanged || sortingChanged) && currentPage !== 1) {
      setCurrentPage(1);
    }

    // Update refs with current values
    prevSearchQueries.current = searchQueries;
    prevFilterCriteria.current = filterCriteria;
    prevSortColumn.current = sortColumn;
    prevSortDirection.current = sortDirection;
  }, [searchQueries, filterCriteria, sortColumn, sortDirection, currentPage]);

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);

    if (!isLocalProcessing) {
      fetchData(currentPage, column, direction, searchQueries);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (!isLocalProcessing) {
      fetchData(newPage, sortColumn, sortDirection, searchQueries);
    }
  };

  return {
    displayedItems,
    currentPage,
    sortColumn,
    sortDirection,
    handleSort,
    handlePageChange,
    totalFilteredRecords: isLocalProcessing ? filteredData.length : totalRecords,
  };
}

export default useTableDocuments;
