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

function useTableFilterFleetList<T>({
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
      const matchesSearch = Object.entries(searchQueries).every(([column, query]) =>
        String(item[column] ?? '')
          .toLowerCase()
          .includes(query.toLowerCase())
      );

      // Apply filter criteria
      const tripStartDate = item.startDate;
      const tripEndDate = item.endDate;

      const fromDate = filterCriteria?.fromDate ? Number(filterCriteria.fromDate) : null;
      const toDate = filterCriteria?.toDate ? Number(filterCriteria.toDate) : null;

      // Date range logic
      // const isDateInRange = (!fromDate || tripStartDate >= fromDate) && (!toDate || tripEndDate <= toDate);

      const isStatusMatched =
        (!filterCriteria?.completed && !filterCriteria?.inProgress) ||
        (filterCriteria?.completed && item?.tripStatus === 'Completed') ||
        (filterCriteria?.inProgress && item?.tripStatus === 'Started');

      const isScoreInRange = filterCriteria?.scoreRange
        ? item.meanScore == null ||
          (item.meanScore >= filterCriteria?.scoreRange[0] && item?.meanScore <= filterCriteria?.scoreRange[1])
        : true;

      const isMilesInRange = filterCriteria?.milesRange
        ? item.totalDistance === null ||
          (item.totalDistance >= filterCriteria?.milesRange[0] && item?.totalDistance <= filterCriteria?.milesRange[1])
        : true;

      // Ensure at least one criterion is considered when filtering
      const hasNoCriteria = !filterCriteria || Object.keys(filterCriteria).length === 0;

      return matchesSearch && (hasNoCriteria || (isMilesInRange && isScoreInRange));
    });
  }, [localData, searchQueries, filterCriteria, isLocalProcessing]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!isLocalProcessing) return filteredData;

    let sorted: any = [...filteredData];

    // Custom sorting logic to prioritize ongoing non-orphaned trips
    sorted.sort((a: any, b: any) => {
      // Check if both trips are 'InProgress'

      // Continue with existing sort logic
      if (sortColumn) {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];

        // Special handling for 'tripDistance'
        if (sortColumn === 'totalDistance') {
          aValue = parseFloat(a.totalDistance);
          bValue = parseFloat(b.totalDistance);
        }

        if (sortColumn === 'meanScore') {
          aValue = parseFloat(a.meanScore);
          bValue = parseFloat(b.meanScore);
        }

        if (sortColumn === 'formattedStartDateTime' || sortColumn === 'formattedEndDateTime') {
          const dateField = sortColumn === 'formattedStartDateTime' ? 'startDate' : 'endDate';

          // Convert to number, use -Infinity for invalid/undefined dates
          aValue = a[dateField] ? Number(a[dateField]) : -Infinity;
          bValue = b[dateField] ? Number(b[dateField]) : -Infinity;

          // If both values are invalid, maintain their original order
          if (aValue === -Infinity && bValue === -Infinity) {
            return 0;
          }

          // Invalid/undefined dates should be sorted to the end
          if (aValue === -Infinity) return sortDirection === 'asc' ? 1 : -1;
          if (bValue === -Infinity) return sortDirection === 'asc' ? -1 : 1;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });

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

export default useTableFilterFleetList;
