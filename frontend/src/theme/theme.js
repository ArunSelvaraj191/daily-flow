import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#FF5722',
        light: '#FF8A65',
        dark: '#E64A19',
        contrastText: '#FFFFFF'
      },
      secondary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF'
      },
      background: {
        default: isDark ? '#0F1115' : '#F8F9FA',
        paper: isDark ? '#181B20' : '#FFFFFF'
      },
      text: {
        primary: isDark ? '#F3F4F6' : '#111827',
        secondary: isDark ? '#9CA3AF' : '#6B7280'
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
      action: {
        hover: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
        selected: isDark ? 'rgba(255, 87, 34, 0.12)' : 'rgba(255, 87, 34, 0.08)'
      }
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      h4: {
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.01em'
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em'
      },
      subtitle1: {
        fontWeight: 500
      },
      subtitle2: {
        fontWeight: 600
      },
      button: {
        textTransform: 'none',
        fontWeight: 600
      }
    },
    shape: {
      borderRadius: 14
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none'
            }
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#E64A19'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.35)'
              : '0 2px 14px rgba(0, 0, 0, 0.03)',
            backgroundImage: 'none'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
            padding: '14px 16px'
          },
          head: {
            fontWeight: 700,
            color: isDark ? '#9CA3AF' : '#6B7280',
            backgroundColor: isDark ? '#14171C' : '#F9FAFB'
          }
        }
      }
    }
  });
};
