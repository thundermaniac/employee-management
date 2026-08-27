import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutlined';
import BeachAccessIcon from '@mui/icons-material/BeachAccessOutlined';
import ApartmentIcon from '@mui/icons-material/ApartmentOutlined';
import CloudOffIcon from '@mui/icons-material/CloudOffOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import StatCard from '../components/common/StatCard';
import ChartCard from '../components/common/ChartCard';
import ChartTooltip from '../components/common/ChartTooltip';
import StateBlock from '../components/common/StateBlock';
import { fetchAnalytics } from '../api/employees';
import { toApiError } from '../api/client';
import { chartPalette } from '../utils/chartPalette';
import { formatDate, initials, STATUS_COLOR } from '../utils/format';

export default function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const palette = useMemo(() => chartPalette(theme.palette.mode), [theme.palette.mode]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAnalytics());
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const axisStyle = {
    fontSize: 12,
    fill: theme.palette.text.secondary,
  };
  const gridStroke = theme.palette.divider;
  const surface = theme.palette.background.paper;

  if (error) {
    return (
      <Card>
        <StateBlock
          tone="error"
          icon={<CloudOffIcon sx={{ fontSize: 48 }} />}
          title="Could not load analytics"
          description={error.message}
          actionLabel="Try again"
          onAction={load}
        />
      </Card>
    );
  }

  const isEmpty = !loading && data?.total === 0;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Analytics</Typography>
        <Typography variant="body2" color="text.secondary">
          A live snapshot of your workforce.
        </Typography>
      </Box>

      {isEmpty ? (
        <Card>
          <StateBlock
            icon={<InsightsIcon sx={{ fontSize: 48 }} />}
            title="Nothing to chart yet"
            description="Analytics appear once you add employees to the directory."
            actionLabel="Add employees"
            onAction={() => navigate('/employees')}
          />
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total employees"
              value={data?.total ?? 0}
              icon={<GroupsIcon />}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Active"
              value={data?.active ?? 0}
              color="success"
              icon={<CheckCircleIcon />}
              caption={
                data?.total ? `${Math.round((data.active / data.total) * 100)}% of headcount` : ''
              }
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="On leave"
              value={data?.onLeave ?? 0}
              color="warning"
              icon={<BeachAccessIcon />}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Departments"
              value={data?.byDepartment?.length ?? 0}
              color="secondary"
              icon={<ApartmentIcon />}
              loading={loading}
            />
          </Grid>

          {/* Department headcount — one measure, so one hue. Values are labelled
              directly on the axis rather than relying on bar length alone. */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <ChartCard
              title="Department-wise headcount"
              subtitle="Employees per department"
              height={320}
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.byDepartment ?? []}
                  layout="vertical"
                  margin={{ top: 4, right: 28, bottom: 4, left: 8 }}
                  barCategoryGap="22%"
                >
                  <CartesianGrid horizontal={false} stroke={gridStroke} />
                  <XAxis type="number" allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={112}
                    tick={axisStyle}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: theme.palette.action.hover }}
                    content={<ChartTooltip />}
                  />
                  <Bar
                    dataKey="count"
                    fill={palette.primary}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                    label={{
                      position: 'right',
                      fill: theme.palette.text.secondary,
                      fontSize: 12,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          {/* Status distribution — reserved status colours, always with a label. */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <ChartCard
              title="Status distribution"
              subtitle="Share of employees by status"
              height={320}
              loading={loading}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ flexGrow: 1, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.byStatus ?? []}
                        dataKey="count"
                        nameKey="name"
                        innerRadius="62%"
                        outerRadius="92%"
                        paddingAngle={2}
                        stroke={surface}
                        strokeWidth={2}
                      >
                        {(data?.byStatus ?? []).map((entry) => (
                          <Cell key={entry.name} fill={palette.status[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">{data?.total ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        total
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, pt: 1 }}>
                  {(data?.byStatus ?? []).map((entry) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '3px',
                          bgcolor: palette.status[entry.name],
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {entry.name} · <strong>{entry.count}</strong>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </ChartCard>
          </Grid>

          {/* Hiring over time — a single series, so no legend box is needed. */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <ChartCard
              title="Monthly joins"
              subtitle="Employees who joined in the last 12 months"
              height={280}
              loading={loading}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.monthlyJoined ?? []}
                  margin={{ top: 8, right: 12, bottom: 4, left: -18 }}
                >
                  <defs>
                    <linearGradient id="joinsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.primary} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={palette.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="label" tick={axisStyle} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ stroke: gridStroke, strokeWidth: 1 }}
                    content={<ChartTooltip unit="joined" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke={palette.primary}
                    strokeWidth={2}
                    fill="url(#joinsFill)"
                    activeDot={{ r: 5, stroke: surface, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6">Recent joiners</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The five most recent joining dates
                </Typography>

                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Skeleton key={i} height={52} />
                    ))
                  : (data?.recentHires ?? []).map((person, index, arr) => (
                      <Box key={person._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>
                            {initials(person.name)}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {person.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {person.designation} · {person.department}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: 0.5,
                              flexShrink: 0,
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {formatDate(person.joiningDate)}
                            </Typography>
                            <Chip
                              size="small"
                              label={person.status}
                              color={STATUS_COLOR[person.status] || 'default'}
                              variant={person.status === 'Inactive' ? 'outlined' : 'filled'}
                            />
                          </Box>
                        </Box>
                        {index < arr.length - 1 && <Divider />}
                      </Box>
                    ))}

                <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/employees')}>
                  View all employees
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
