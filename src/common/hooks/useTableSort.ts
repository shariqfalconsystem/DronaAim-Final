import { useState, useEffect, useMemo } from 'react';

interface TableSortProps<T> {
  data: T[];
  itemsPerPage: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
}

function useTableSort<T>({
  data,
  itemsPerPage,
  totalRecords,
  onPageChange,
  searchQuery,
}: TableSortProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    return data.filter((item: any) => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchQuery?.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const sortedData = useMemo(() => {
    let sorted = [...filteredData];
    if (sortColumn) {
      sorted.sort((a: any, b: any) => {
        if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortColumn, sortDirection]);

  const displayedItems = useMemo(() => {
    if (totalRecords < 200) {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return sortedData.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      return sortedData;
    }
  }, [sortedData, currentPage, itemsPerPage, totalRecords]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (totalRecords >= 200) {
      onPageChange(newPage);
    }
  };

  return {
    displayedItems,
    currentPage,
    sortColumn,
    sortDirection,
    handleSort,
    handlePageChange,
    totalFilteredRecords: filteredData.length,
  };
}

export default useTableSort;