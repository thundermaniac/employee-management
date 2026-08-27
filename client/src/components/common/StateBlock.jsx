import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

/**
 * One presentation for the three non-happy paths: empty results, load errors
 * and "nothing here yet". Keeps those states looking consistent everywhere.
 */
export default function StateBlock({ icon, title, description, actionLabel, onAction, tone = 'default' }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ color: tone === 'error' ? 'error.main' : 'text.disabled', display: 'flex' }}>
        {icon}
      </Box>
      <Typography variant="h6" color={tone === 'error' ? 'error.main' : 'text.primary'}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="outlined" onClick={onAction} sx={{ mt: 1.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
