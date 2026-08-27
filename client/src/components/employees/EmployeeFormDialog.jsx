import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { toDateInput } from '../../utils/format';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  status: 'Active',
  joiningDate: toDateInput(new Date()),
  salary: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length < 2) errors.name = 'Name is too short';

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address';

  if (!values.department) errors.department = 'Choose a department';
  if (!values.designation.trim()) errors.designation = 'Designation is required';
  if (!values.status) errors.status = 'Choose a status';

  if (!values.joiningDate) errors.joiningDate = 'Joining date is required';
  else if (new Date(values.joiningDate) > new Date()) {
    errors.joiningDate = 'Joining date cannot be in the future';
  }

  if (values.salary !== '' && (Number.isNaN(Number(values.salary)) || Number(values.salary) < 0)) {
    errors.salary = 'Enter a valid amount';
  }

  return errors;
}

export default function EmployeeFormDialog({
  open,
  employee,
  departments,
  statuses,
  onClose,
  onSubmit,
}) {
  const isEdit = Boolean(employee);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Reset the form each time the dialog opens, for create and edit alike.
  useEffect(() => {
    if (!open) return;
    setValues(
      employee
        ? {
            name: employee.name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            department: employee.department || '',
            designation: employee.designation || '',
            status: employee.status || 'Active',
            joiningDate: toDateInput(employee.joiningDate),
            salary: employee.salary ?? '',
          }
        : EMPTY
    );
    setErrors({});
    setFormError('');
  }, [open, employee]);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    setFormError('');

    const payload = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      designation: values.designation.trim(),
      salary: values.salary === '' ? 0 : Number(values.salary),
    };

    const result = await onSubmit(payload);
    setSaving(false);

    if (!result.ok) {
      // Surface per-field errors the API returned (e.g. duplicate email).
      setErrors(result.error.fields || {});
      setFormError(result.error.message);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? 'Edit employee' : 'Add employee'}</DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Full name"
                value={values.name}
                onChange={handleChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={values.email}
                onChange={handleChange('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                required
                label="Department"
                value={values.department}
                onChange={handleChange('department')}
                error={Boolean(errors.department)}
                helperText={errors.department}
              >
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Designation"
                value={values.designation}
                onChange={handleChange('designation')}
                error={Boolean(errors.designation)}
                helperText={errors.designation}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                required
                label="Status"
                value={values.status}
                onChange={handleChange('status')}
                error={Boolean(errors.status)}
                helperText={errors.status}
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Joining date"
                value={values.joiningDate}
                onChange={handleChange('joiningDate')}
                error={Boolean(errors.joiningDate)}
                helperText={errors.joiningDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={values.phone}
                onChange={handleChange('phone')}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Annual salary (₹)"
                value={values.salary}
                onChange={handleChange('salary')}
                error={Boolean(errors.salary)}
                helperText={errors.salary}
                slotProps={{ htmlInput: { min: 0, step: 1000 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isEdit ? 'Save changes' : 'Create employee'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
