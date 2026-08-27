import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

export default function ChartCard({ title, subtitle, height = 300, loading, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ height, mt: subtitle ? 0 : 2 }}>
          {loading ? <Skeleton variant="rounded" height={height} /> : children}
        </Box>
      </CardContent>
    </Card>
  );
}
