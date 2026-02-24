import { useState, useEffect, useMemo } from 'react';

interface TableSortProps<T> {
  data: T[];
  itemsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  searchQueries: Record<string, string>;
  fetchData: any;
  filterCriteria?: any;
}

function useTableFilter<T>({
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

  // Filtering logic
  const filteredData = useMemo(() => {
    if (!isLocalProcessing) return localData;
    return localData?.filter((item: any) => {
      // Apply search queries
      const matchesSearch = Object.entries(searchQueries).every(([column, query]) => {
        // For the 'formattedVehicleStatus' column, perform a strict comparison for 'Active' and 'Inactive'
        if (column === 'formattedVehicleStatus') {
          const status = item[column]?.toLowerCase();
          const queryLower = query.toLowerCase();
          return status.startsWith(queryLower);
        }

        // For all other columns, use the regular includes-based search
        return String(item[column] ?? '')
          .toLowerCase()
          .includes(query?.toLowerCase());
      });

      const isStatusMatched =
        (!filterCriteria?.inactive && !filterCriteria?.active) ||
        (filterCriteria?.inactive && item?.tripStatus === 'Completed') ||
        (filterCriteria?.active && item?.tripStatus === 'Started');

      const isScoreInRange = filterCriteria?.scoreRange
        ? item.meanScore == null ||
          (item.meanScore >= filterCriteria?.scoreRange[0] && item?.meanScore <= filterCriteria?.scoreRange[1])
        : true;

      // Ensure at least one criterion is considered when filtering
      const hasNoCriteria = !filterCriteria || Object.keys(filterCriteria).length === 0;

      return matchesSearch && (hasNoCriteria || (isStatusMatched && isScoreInRange));
    });
  }, [localData, searchQueries, filterCriteria, isLocalProcessing]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!isLocalProcessing) return filteredData;
    let sorted: any = [...filteredData];
    if (sortColumn) {
      sorted.sort((a: any, b: any) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQueries, filterCriteria]);

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

export default useTableFilter;
