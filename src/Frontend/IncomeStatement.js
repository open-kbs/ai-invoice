import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  Chip,
  LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';

export const IncomeStatement = ({ data }) => {
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const formatPercent = (percent) => {
    return parseFloat(percent || 0).toFixed(1);
  };

  if (!data) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            No income statement data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { revenue, expenses, netIncome, profitMargin } = data;
  const isProfitable = netIncome >= 0;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceWalletIcon color="primary" />
        <Typography variant="h5">
          Income Statement (Profit & Loss)
        </Typography>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyIcon color="success" />
                <Typography variant="subtitle2" color="white">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(revenue.total)}
              </Typography>
              <Typography variant="caption" color="white">
                {revenue.accounts.length} revenue streams
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyOffIcon />
                <Typography variant="subtitle2" color="white">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(expenses.total)}
              </Typography>
              <Typography variant="caption" color="white">
                {expenses.accounts.length} expense categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: isProfitable ? 'primary.main' : 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isProfitable ? <TrendingUpIcon /> : <TrendingDownIcon />}
                <Typography variant="subtitle2" color="white">
                  Net {isProfitable ? 'Income' : 'Loss'}
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(Math.abs(netIncome))}
              </Typography>
              <Chip 
                label={isProfitable ? "Profitable" : "Loss"} 
                size="small" 
                sx={{ 
                  backgroundColor: 'white', 
                  color: isProfitable ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Profit Margin
              </Typography>
              <Typography 
                variant="h4" 
                color={profitMargin >= 0 ? "success.main" : "error.main"}
              >
                {formatPercent(profitMargin)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, Math.abs(profitMargin))} 
                color={profitMargin >= 0 ? "success" : "error"}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="h6">Revenue</Typography>
            </Box>
            <Typography variant="h6" color="success.main">
              {formatAmount(revenue.total)}
            </Typography>
          </Box>
          
          {revenue.accounts.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'success.light' }}>
                    <TableCell sx={{ color: 'white' }}>Account #</TableCell>
                    <TableCell sx={{ color: 'white' }}>Revenue Stream</TableCell>
                    <TableCell align="center" sx={{ color: 'white' }}>Transactions</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Amount</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>% of Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenue.accounts.map((account) => (
                    <TableRow key={account.number}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {account.number}
                        </Typography>
                      </TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell align="center">
                        <Chip label={account.transactions} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatAmount(account.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatPercent((account.amount / revenue.total) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No revenue recorded
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDownIcon color="error" />
              <Typography variant="h6">Expenses</Typography>
            </Box>
            <Typography variant="h6" color="error.main">
              {formatAmount(expenses.total)}
            </Typography>
          </Box>
          
          {expenses.accounts.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'error.light' }}>
                    <TableCell sx={{ color: 'white' }}>Account #</TableCell>
                    <TableCell sx={{ color: 'white' }}>Expense Category</TableCell>
                    <TableCell align="center" sx={{ color: 'white' }}>Transactions</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>Amount</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>% of Expenses</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenses.accounts.map((account) => (
                    <TableRow key={account.number}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {account.number}
                        </Typography>
                      </TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell align="center">
                        <Chip label={account.transactions} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {formatAmount(account.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatPercent((account.amount / expenses.total) * 100)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No expenses recorded
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Net Income Summary */}
      <Card sx={{ 
        backgroundColor: isProfitable ? 'success.light' : 'error.light',
        color: 'white'
      }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6">
                Financial Summary
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total Revenue:</Typography>
                  <Typography fontWeight="bold">+ {formatAmount(revenue.total)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Total Expenses:</Typography>
                  <Typography fontWeight="bold">- {formatAmount(expenses.total)}</Typography>
                </Box>
                <Divider sx={{ backgroundColor: 'white', my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Net {isProfitable ? 'Income' : 'Loss'}:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatAmount(Math.abs(netIncome))}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
              <Typography variant="h2" fontWeight="bold">
                {formatPercent(profitMargin)}%
              </Typography>
              <Typography variant="h6">
                Profit Margin
              </Typography>
              <Chip 
                label={isProfitable ? "Business is Profitable" : "Business is at Loss"} 
                sx={{ 
                  mt: 1,
                  backgroundColor: 'white', 
                  color: isProfitable ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'N/A'} | 
          Documents processed: {data.documentCount || 0}
        </Typography>
      </Box>
    </Box>
  );
};