import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';

export default function StatCard({ label, value, icon, color = 'primary', caption, loading }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={(theme) => ({
            width: 52,
            height: 52,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: theme.palette[color].main,
            bgcolor: alpha(theme.palette[color].main, theme.palette.mode === 'light' ? 0.12 : 0.2),
          })}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={64} height={38} />
          ) : (
            <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
              {value}
            </Typography>
          )}
          {caption && (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
