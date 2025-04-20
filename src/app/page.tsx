'use client'
import { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
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
  // const [rawTime, setRawTime] = useState<Dayjs>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs>(dayjs());
  const rows: Pair[][] = Array.from({ length: 7 }, () => Array.from({ length: 5 }, () => new Pair()));
  const [formattedData, setFormattedData] = useState<Pair[][]>(rows);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    const weeksBetween = getWeeksBetween(dayjs("2024-12-09"), selectedTime);
    setLoading(true);
    try {
      const response = await fetch('/api/seat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: weeksBetween }),
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='zh-cn'>
      <Box sx={{
        border: 1,
        borderRadius: 2,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4
      }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body1">选择起始座位的那天</Typography>
            <DatePicker
              value={rawTime}
              onChange={(newValue) => newValue && setRawTime(newValue)}
            />
          </Box> */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="body1">选择一天</Typography>
            <DatePicker
              value={selectedTime}
              onChange={(newValue) => newValue && setSelectedTime(newValue)}
            />
          </Box>
        </Box>

        <Button variant="contained" color={loading ? "inherit" : "success"} onClick={handleSubmit} disabled={loading}>
          {loading ? "获取中…" : "查询"}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant="body1">门</Typography>
          <Table sx={{ minWidth: 650 }} aria-label="座位表">
            <TableHead>
              <TableRow>
                {['第一组', '第二组', '第三组', '第四组', '第五组'].map((group) => (
                  <TableCell key={group} align="center">{group}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {formattedData?.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((seat, colIndex) => (
                    <TableCell key={colIndex} align="center">
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
          <Typography variant="body1">窗</Typography>
        </Box>

        <Box>
          <p>讲台</p>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}