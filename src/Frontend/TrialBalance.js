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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export const TrialBalance = ({ data }) => {
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Assets': return 'primary';
      case 'Liabilities': return 'error';
      case 'Equity': return 'warning';
      case 'Revenue': return 'success';
      case 'Expenses': return 'info';
      default: return 'default';
    }
  };

  if (!data || !data.categories || Object.keys(data.categories).length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            No accounting data available for trial balance
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const categoryOrder = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];
  const sortedCategories = Object.entries(data.categories).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a[0]);
    const indexB = categoryOrder.indexOf(b[0]);
    if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0]);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceIcon color="primary" />
        <Typography variant="h5">
          Trial Balance
        </Typography>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Debit
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatAmount(data.totals.debit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon color="error" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Credit
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {formatAmount(data.totals.credit)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Balance Difference
              </Typography>
              <Typography variant="h4" color={data.totals.difference > 0.01 ? "warning.main" : "success.main"}>
                {formatAmount(data.totals.difference)}
              </Typography>
              {data.totals.difference < 0.01 && (
                <Typography variant="caption" color="success.main">
                  ✓ Balanced
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories with Accounts */}
      {sortedCategories.map(([categoryName, categoryData]) => (
        <Accordion key={categoryName} defaultExpanded sx={{ mb: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ backgroundColor: 'grey.50' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
              <Chip 
                label={categoryName} 
                color={getCategoryColor(categoryName)}
                size="small"
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {categoryData.accounts.length} accounts
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Debit</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatAmount(categoryData.totalDebit)}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Credit</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatAmount(categoryData.totalCredit)}
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                  <Typography variant="caption" color="text.secondary">Balance</Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    color={categoryData.totalBalance >= 0 ? "primary" : "error"}
                  >
                    {formatAmount(Math.abs(categoryData.totalBalance))}
                    {categoryData.totalBalance < 0 && ' (CR)'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell>Account #</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell align="center">Transactions</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Credit</TableCell>
                    <TableCell align="right">Balance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoryData.accounts.map((account) => (
                    <TableRow key={account.number}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {account.number}
                        </Typography>
                      </TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={account.transactionCount} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {account.debit > 0 ? formatAmount(account.debit) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {account.credit > 0 ? formatAmount(account.credit) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={account.balance >= 0 ? "inherit" : "error"}
                        >
                          {formatAmount(Math.abs(account.balance))}
                          {account.balance < 0 && ' (CR)'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Category Totals Row */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell colSpan={2}>
                      <Typography variant="body2" fontWeight="bold">
                        Category Total
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={categoryData.accounts.reduce((sum, acc) => sum + acc.transactionCount, 0)} 
                        size="small" 
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatAmount(categoryData.totalDebit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatAmount(categoryData.totalCredit)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        color={categoryData.totalBalance >= 0 ? "primary" : "error"}
                      >
                        {formatAmount(Math.abs(categoryData.totalBalance))}
                        {categoryData.totalBalance < 0 && ' (CR)'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
      
      {/* Footer */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Documents processed: {data.documentCount || 0}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Typography variant="h6">
              Grand Total - Debit: {formatAmount(data.totals.debit)} | Credit: {formatAmount(data.totals.credit)}
            </Typography>
            {data.totals.difference < 0.01 && (
              <Typography variant="body2" color="success.main">
                ✓ Trial Balance is balanced
              </Typography>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};