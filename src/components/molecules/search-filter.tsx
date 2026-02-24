import SearchInput from "../atoms/search-input";
import FilterListIcon from "@mui/icons-material/FilterList";

const SearchAndFilterComponent = ({
  handleFilterIconClick,
  searchQuery,
  onSearch,
}: any) => {
  const handleSearchChange = (event: any) => {
    onSearch(event.target.value);
  };

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box sx={{ mr: 1 }}>
        <SearchInput
          placeholder="Search ID"
          size="small"
          sx={{ width: "300px" }}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Box>

      <Box
        display="flex"
        alignItems="center"
        border="1px solid grey"
        borderRadius="4px"
        height="30px"
        padding="0 8px"
        onClick={handleFilterIconClick}
      >
        <IconButton sx={{ padding: "0", height: "24px" }}>
          <FilterListIcon sx={{ fontSize: "20px" }} />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ marginLeft: "4px", fontSize: "14px", cursor: "pointer" }}
        >
          Filters
        </Typography>
      </Box>
    </Box>
  );
};

export default SearchAndFilterComponent;
