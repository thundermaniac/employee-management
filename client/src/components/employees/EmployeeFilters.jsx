import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function EmployeeFilters({
  search,
  department,
  status,
  departments,
  statuses,
  onChange,
  onReset,
}) {
  const hasFilters = search || department !== 'All' || status !== 'All';

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <TextField
        size="small"
        label="Search name or email"
        value={search}
        onChange={(e) => onChange({ search: e.target.value })}
        sx={{ flex: '1 1 260px' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        size="small"
        select
        label="Department"
        value={department}
        onChange={(e) => onChange({ department: e.target.value })}
        sx={{ flex: '0 1 190px', minWidth: 160 }}
      >
        <MenuItem value="All">All departments</MenuItem>
        {departments.map((d) => (
          <MenuItem key={d} value={d}>
            {d}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        select
        label="Status"
        value={status}
        onChange={(e) => onChange({ status: e.target.value })}
        sx={{ flex: '0 1 160px', minWidth: 140 }}
      >
        <MenuItem value="All">All statuses</MenuItem>
        {statuses.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>

      {hasFilters && (
        <Button size="small" color="inherit" startIcon={<ClearIcon />} onClick={onReset}>
          Clear
        </Button>
      )}
    </Box>
  );
}
