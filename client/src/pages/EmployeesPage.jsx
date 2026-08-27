import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import AddIcon from '@mui/icons-material/Add';
import PersonSearchIcon from '@mui/icons-material/PersonSearchOutlined';
import CloudOffIcon from '@mui/icons-material/CloudOffOutlined';
import GroupAddIcon from '@mui/icons-material/GroupAddOutlined';

import EmployeeFilters from '../components/employees/EmployeeFilters';
import EmployeeTable from '../components/employees/EmployeeTable';
import EmployeeFormDialog from '../components/employees/EmployeeFormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import StateBlock from '../components/common/StateBlock';
import useEmployees from '../hooks/useEmployees';
import useDebounce from '../hooks/useDebounce';
import { createEmployee, deleteEmployee, updateEmployee, fetchMeta } from '../api/employees';
import { toApiError } from '../api/client';

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [meta, setMeta] = useState({ departments: [], statuses: [] });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  const params = useMemo(
    () => ({ search: debouncedSearch, department, status, page, limit, sortBy, order }),
    [debouncedSearch, department, status, page, limit, sortBy, order]
  );

  const { items, total, totalPages, loading, error, refetch } = useEmployees(params);

  useEffect(() => {
    fetchMeta()
      .then(setMeta)
      .catch(() => setMeta({ departments: [], statuses: [] }));
  }, []);

  // Any change to the query should start from the first page again.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, department, status, limit]);

  // Deleting the last row of the last page would otherwise leave us stranded.
  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const handleFilterChange = useCallback((patch) => {
    if ('search' in patch) setSearch(patch.search);
    if ('department' in patch) setDepartment(patch.department);
    if ('status' in patch) setStatus(patch.status);
  }, []);

  const handleReset = () => {
    setSearch('');
    setDepartment('All');
    setStatus('All');
  };

  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnId);
      setOrder('asc');
    }
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateEmployee(editing._id, payload);
        setToast({ severity: 'success', message: `${payload.name} updated` });
      } else {
        await createEmployee(payload);
        setToast({ severity: 'success', message: `${payload.name} added` });
      }
      setFormOpen(false);
      setEditing(null);
      await refetch();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: toApiError(err) };
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(pendingDelete._id);
      setToast({ severity: 'success', message: `${pendingDelete.name} deleted` });
      setPendingDelete(null);
      await refetch();
    } catch (err) {
      setToast({ severity: 'error', message: toApiError(err).message });
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(debouncedSearch) || department !== 'All' || status !== 'All';
  const showEmpty = !loading && !error && items.length === 0;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5">Employees</Typography>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading…' : `${total} employee${total === 1 ? '' : 's'} found`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add employee
        </Button>
      </Box>

      <Card>
        <EmployeeFilters
          search={search}
          department={department}
          status={status}
          departments={meta.departments}
          statuses={meta.statuses}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Thin progress bar for refetches, so the table doesn't flash skeletons. */}
        <Box sx={{ height: 4 }}>{loading && items.length > 0 && <LinearProgress />}</Box>

        {error && (
          <StateBlock
            tone="error"
            icon={<CloudOffIcon sx={{ fontSize: 48 }} />}
            title="Could not load employees"
            description={error.message}
            actionLabel="Try again"
            onAction={refetch}
          />
        )}

        {showEmpty && hasFilters && (
          <StateBlock
            icon={<PersonSearchIcon sx={{ fontSize: 48 }} />}
            title="No matching employees"
            description="No one matches the current search and filters. Try widening them."
            actionLabel="Clear filters"
            onAction={handleReset}
          />
        )}

        {showEmpty && !hasFilters && (
          <StateBlock
            icon={<GroupAddIcon sx={{ fontSize: 48 }} />}
            title="No employees yet"
            description="Add your first employee to start building the directory."
            actionLabel="Add employee"
            onAction={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          />
        )}

        {!error && (loading || items.length > 0) && (
          <>
            <EmployeeTable
              rows={items}
              loading={loading && items.length === 0}
              sortBy={sortBy}
              order={order}
              onSort={handleSort}
              onEdit={(row) => {
                setEditing(row);
                setFormOpen(true);
              }}
              onDelete={setPendingDelete}
            />
            <TablePagination
              component="div"
              count={total}
              page={Math.max(page - 1, 0)}
              onPageChange={(_, nextPage) => setPage(nextPage + 1)}
              rowsPerPage={limit}
              onRowsPerPageChange={(e) => setLimit(parseInt(e.target.value, 10))}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        employee={editing}
        departments={meta.departments}
        statuses={meta.statuses}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete employee?"
        description={`${pendingDelete?.name} will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setPendingDelete(null)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity} variant="filled" onClose={() => setToast(null)}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
