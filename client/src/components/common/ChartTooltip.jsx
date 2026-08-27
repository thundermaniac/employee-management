import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Shared Recharts tooltip so every chart hovers the same way. */
export default function ChartTooltip({ active, payload, label, unit = 'employees' }) {
  if (!active || !payload?.length) return null;

  const point = payload[0];
  const name = label ?? point.name ?? point.payload?.name;

  return (
    <Paper
      elevation={6}
      sx={{ px: 1.5, py: 1, borderRadius: 1.5, border: 1, borderColor: 'divider' }}
    >
      <Typography variant="caption" color="text.secondary">
        {name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '3px',
            bgcolor: point.payload?.fill || point.color || point.stroke,
          }}
        />
        <Typography variant="body2" fontWeight={600}>
          {point.value} {unit}
        </Typography>
      </Box>
    </Paper>
  );
}
