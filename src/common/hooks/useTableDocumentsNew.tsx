import { useState, useEffect, useMemo, useRef } from 'react';
import dayjs from 'dayjs';

interface TableSortProps<T> {
  data: T[];
  itemsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  searchQueries: Record<string, string>;
  fetchData: any;
  filterCriteria?: any;
}

function useTableDocumentsNew<T>({
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

  //  Match calendar/search date (MM/DD/YYYY) with timestamp date
  const isDateMatch = (uploadedAtTs: number | string, searchDate: string): boolean => {
    if (!searchDate || !uploadedAtTs) return false;

    const timestamp = typeof uploadedAtTs === 'string' ? parseInt(uploadedAtTs) : uploadedAtTs;

    const documentDate = dayjs(timestamp).format('MM/DD/YYYY');
    const selectedDate = dayjs(searchDate, ['MM-DD-YYYY', 'MM/DD/YYYY']).format('MM/DD/YYYY');

    return documentDate === selectedDate;
  };

  const filteredData = useMemo(() => {
    if (!isLocalProcessing) return localData;

    return localData?.filter((item: any) => {
      const matchesSearch = Object.entries(searchQueries).every(([column, query]) => {
        if (column === 'date') {
          return isDateMatch(item.uploadedAtTs, query);
        }
        return String(item[column] ?? '')
          .toLowerCase()
          .includes(query.toLowerCase());
      });

      const documentDate = item.uploadedAtTs;

      const fromDate = filterCriteria?.fromDate ? new Date(filterCriteria.fromDate).setHours(0, 0, 0, 0) : null;
      const toDate = filterCriteria?.toDate ? new Date(filterCriteria.toDate).setHours(23, 59, 59, 999) : null;

      const isDateInRange =
        (fromDate === null || documentDate >= fromDate) && (toDate === null || documentDate <= toDate);

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

      const hasNoCriteria = !filterCriteria || Object.keys(filterCriteria).length === 0;

      return matchesSearch && (hasNoCriteria || (isDateInRange && isStatusMatched && isFileTypeMatched));
    });
  }, [localData, searchQueries, filterCriteria, isLocalProcessing]);

  const sortedData = useMemo(() => {
    if (!isLocalProcessing) return filteredData;

    const sorted = [...filteredData];

    if (sortColumn) {
      sorted.sort((a: any, b: any) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (sortColumn === 'size') {
          const aSize = parseFloat(aValue) || 0;
          const bSize = parseFloat(bValue) || 0;
          return sortDirection === 'asc' ? aSize - bSize : bSize - aSize;
        }
        if (sortColumn === 'date' || sortColumn === 'uploadedAtTs') {
          const aTime = typeof a.uploadedAtTs === 'string' ? parseInt(a.uploadedAtTs) : a.uploadedAtTs;
          const bTime = typeof b.uploadedAtTs === 'string' ? parseInt(b.uploadedAtTs) : b.uploadedAtTs;

          return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
        }

        if (sortColumn === 'fileName') {
          const aStr = String(aValue || '').toLowerCase();
          const bStr = String(bValue || '').toLowerCase();
          return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [filteredData, sortColumn, sortDirection, isLocalProcessing]);

  const displayedItems = useMemo(() => {
    if (!isLocalProcessing) return data;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, itemsPerPage, isLocalProcessing, data]);

  const hasSearchQueriesChanged = (prev: Record<string, string>, current: Record<string, string>) => {
    const prevKeys = Object.keys(prev);
    const currentKeys = Object.keys(current);
    if (prevKeys.length !== currentKeys.length) return true;

    return prevKeys.some((key) => {
      const prevVal = (prev[key] || '').trim();
      const currentVal = (current[key] || '').trim();
      return prevVal !== currentVal;
    });
  };

  const hasFilterCriteriaChanged = (prev: any, current: any) => {
    return JSON.stringify(prev) !== JSON.stringify(current);
  };

  const hasSortingChanged = (
    prevColumn: string | null,
    currentColumn: string | null,
    prevDirection: 'asc' | 'desc',
    currentDirection: 'asc' | 'desc'
  ) => {
    return prevColumn !== currentColumn || prevDirection !== currentDirection;
  };

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

export default useTableDocumentsNew;
