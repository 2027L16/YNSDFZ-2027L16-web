'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
const getWeeksBetween = (startDate: Dayjs, endDate: Dayjs) => {
  const getMonday = (date: Dayjs) => {
    const day = date.day(); // 0（周日）到6（周六）
    return date.subtract(day === 0 ? 6 : day - 1, 'day');
  };

  const mondayStart = getMonday(startDate);
  const mondayEnd = getMonday(endDate);

  const weeks = mondayEnd.diff(mondayStart, 'week');
  return Math.abs(weeks);
};
class Pair {
  first: string;
  second: string;
  constructor() {
    this.first = 'x';
    this.second = 'None';
  }
}
export default function SeatPage() {
  const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());
  const [offset, setOffset] = useState<number>(0);
  const rows: Pair[][] = Array.from({ length: 7 }, () => Array.from({ length: 5 }, () => new Pair()));
  const [formattedData, setFormattedData] = useState<Pair[][]>(rows);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 创建 Material-UI 主题
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      background: {
        default: isDarkMode ? '#0a0a0a' : '#ffffff',
        paper: isDarkMode ? '#1a1a1a' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ededed' : '#171717',
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: isDarkMode ? '#ededed' : '#171717',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? '#90caf9' : '#1976d2',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDarkMode ? '#ededed' : '#171717',
          },
        },
      },
    },
  });
  const handleSubmit = async () => {
    const weeksBetween = getWeeksBetween(dayjs("2025-09-01"), selectedTime) - offset;
    const adjustedWeeks = Math.max(0, weeksBetween); // 确保不为负数
    setLoading(true);
    try {
      const response = await fetch('/api/seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: adjustedWeeks }),
      });

      const data = await response.json();

      // 转换数据结构
      const rows = [];
      const colCount = Object.keys(data).length;
      const rowCount = data[0].length;

      for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = [];
        for (let colIndex = 0; colIndex < colCount; colIndex++) {
          const column = data[colIndex.toString()];
          row.push(column?.[rowIndex] || { first: 'x', second: 'None' });
        }
        rows.push(row);
      }

      setFormattedData(rows);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='zh-cn'>
        <Box sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          p: 2,
          backgroundColor: 'var(--background)',
        }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" className='text-[var(--foreground)] mb-2'>选择要查询的那天（选下周某天）</Typography>
              <DatePicker
                value={selectedTime}
                onChange={(newValue) => newValue && setSelectedTime(newValue)}
                slotProps={{
                  textField: {
                    sx: {
                      '& .MuiInputBase-input': {
                        color: 'var(--foreground)',
                      },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: isDarkMode ? '#90caf9' : '#1976d2',
                        },
                      },
                    },
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                        color: isDarkMode ? '#ededed' : '#171717',
                        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}`,
                      },
                      '& .MuiPickersDay-root': {
                        color: isDarkMode ? '#ededed' : '#171717',
                        '&:hover': {
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDarkMode ? '#90caf9' : '#1976d2',
                          color: isDarkMode ? '#000' : '#fff',
                          '&:hover': {
                            backgroundColor: isDarkMode ? '#64b5f6' : '#1565c0',
                          },
                        },
                      },
                      '& .MuiPickersCalendarHeader-root': {
                        color: isDarkMode ? '#ededed' : '#171717',
                      },
                      '& .MuiPickersArrowSwitcher-button': {
                        color: isDarkMode ? '#ededed' : '#171717',
                      },
                      '& .MuiDayCalendar-weekDayLabel': {
                        color: isDarkMode ? 'rgba(237, 237, 237, 0.7)' : 'rgba(23, 23, 23, 0.7)',
                      },
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body1" className='text-[var(--foreground)] mb-2'>偏移量（跳过不换座位的周数）</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOffset(Math.max(0, offset - 1))}
                  sx={{
                    minWidth: '40px',
                    color: 'var(--foreground)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    }
                  }}
                >
                  -
                </Button>
                <Typography
                  variant="h6"
                  className='text-[var(--foreground)]'
                  sx={{ minWidth: '30px', textAlign: 'center' }}
                >
                  {offset}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOffset(offset + 1)}
                  sx={{
                    minWidth: '40px',
                    color: 'var(--foreground)',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    '&:hover': {
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    }
                  }}
                >
                  +
                </Button>
              </Box>
            </Box>
          </Box>

          <Button variant="contained" color={loading ? "inherit" : "success"} onClick={handleSubmit} disabled={loading} size="large">
            {loading ? "获取中…" : "查询"}
          </Button>

          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2, md: 4 },
            flexDirection: { xs: 'column', lg: 'row' },
            width: '100%',
            justifyContent: 'center'
          }}>
            <Typography variant="body1" className='text-[var(--foreground)]' sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <strong>门</strong>
            </Typography>
            <Box sx={{ overflow: 'auto', maxWidth: '100%' }}>
              <Table sx={{ minWidth: { xs: 400, md: 650 } }} aria-label="座位表">
                <TableHead>
                  <TableRow>
                    {['第一组', '第二组', '第三组', '第四组', '第五组'].map((group) => (
                      <TableCell key={group} align="center" className='text-[var(--foreground)]' sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
                        {group}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formattedData?.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((seat, colIndex) => (
                        <TableCell
                          key={colIndex}
                          align="center"
                          className='text-sm text-[var(--foreground)] dark:text-[var(--foreground)]'
                          sx={{
                            fontSize: { xs: '0.75rem', md: '0.875rem' },
                            padding: { xs: '8px 4px', md: '16px' }
                          }}
                        >
                          {seat.first === 'x' ? (
                            <span> </span>
                          ) : seat.second !== 'None' ? (
                            `${seat.first}/ ${seat.second}`
                          ) : (
                            seat.first
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Typography variant="body1" className='text-[var(--foreground)]' sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <strong>窗</strong>
            </Typography>
          </Box>

          <Box>
            <strong className='text-[var(--foreground)]' style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>讲台</strong>
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}