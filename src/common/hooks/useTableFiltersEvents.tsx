import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialPage = Number(searchParams.get('page')) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localData, setLocalData] = useState<T[]>(data);

  const memoizedSearchQueries = useMemo(() => searchQueries, [searchQueries]);
  const memoizedFilterCriteria = useMemo(() => filterCriteria, [filterCriteria]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [memoizedSearchQueries, memoizedFilterCriteria]);

  useEffect(() => {
    if (location.state?.page) {
      setCurrentPage(location.state.page);
    }
  }, [location.state]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setSearchParams({ page: String(newPage) });
    navigate(`${location.pathname}?page=${newPage}`, { replace: true, state: { page: newPage } });

    if (!isLocalProcessing) {
      fetchData(newPage, sortColumn, sortDirection, searchQueries);
    }
  };

  // Filtering logic
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
      const itemTimestamp = item.tsInMilliSeconds;

      const fromDate = filterCriteria?.fromDate ? Number(filterCriteria.fromDate) : null;
      const toDate = filterCriteria?.toDate ? Number(filterCriteria.toDate) : null;

      // Date range logic
      const isDateInRange = (!fromDate || itemTimestamp >= fromDate) && (!toDate || itemTimestamp <= toDate);

      const isEventTypeMatched =
        (!filterCriteria?.harshBraking &&
          !filterCriteria?.speeding &&
          !filterCriteria?.harshCornering &&
          !filterCriteria?.harshAcceleration &&
          !filterCriteria?.shock &&
          !filterCriteria?.severeShock) ||
        (filterCriteria?.harshBraking && item?.eventType === 'Brake') ||
        (filterCriteria?.speeding && item?.eventType === 'Speed') ||
        (filterCriteria?.harshCornering && item?.eventType === 'Turn') ||
        (filterCriteria?.harshAcceleration && item?.eventType === 'Accelerate') ||
        (filterCriteria?.shock && item?.eventType === 'Shock') ||
        (filterCriteria?.severeShock && item?.eventType === 'SevereShock');

      // Ensure at least one criterion is considered when filtering
      const hasNoCriteria = !filterCriteria || Object.keys(filterCriteria).length === 0;

      return matchesSearch && (hasNoCriteria || (isDateInRange && isEventTypeMatched));
    });
  }, [localData, searchQueries, filterCriteria, isLocalProcessing]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!isLocalProcessing) return filteredData;
    const sorted: any = [...filteredData];
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

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);

    if (!isLocalProcessing) {
      fetchData(currentPage, column, direction, searchQueries);
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
