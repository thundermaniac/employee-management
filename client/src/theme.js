import { createTheme } from '@mui/material/styles';

const shared = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
};

export const buildTheme = (mode) =>
  createTheme({
    ...shared,
    palette: {
      mode,
      primary: { main: mode === 'light' ? '#4f46e5' : '#818cf8' },
      secondary: { main: '#0ea5e9' },
      success: { main: '#16a34a' },
      warning: { main: '#f59e0b' },
      error: { main: '#dc2626' },
      background:
        mode === 'light'
          ? { default: '#f4f6fb', paper: '#ffffff' }
          : { default: '#0f1523', paper: '#161d2f' },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 1px 2px rgba(16, 24, 40, 0.05)'
                : 'none',
          }),
        },
      },
      MuiPaper: { defaultProps: { elevation: 0 } },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            fontWeight: 600,
            fontSize: 13,
            color: theme.palette.text.secondary,
            backgroundColor:
              theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.03)',
          }),
        },
      },
      MuiButton: { defaultProps: { disableElevation: true } },
    },
  });
