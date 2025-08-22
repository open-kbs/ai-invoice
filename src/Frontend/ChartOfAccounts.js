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
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export const ChartOfAccounts = ({ data }) => {
  if (!data || !data.accounts || data.accounts.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            No chart of accounts available
          </Typography>
        </CardContent>
      </Card>
    );
  }

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

  // Group accounts by category
  const accountsByCategory = data.accounts.reduce((acc, account) => {
    const category = account.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(account);
    return acc;
  }, {});

  const categoryOrder = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];
  const sortedCategories = Object.entries(accountsByCategory).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a[0]);
    const indexB = categoryOrder.indexOf(b[0]);
    if (indexA === -1 && indexB === -1) return a[0].localeCompare(b[0]);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const totalAccounts = data.accounts.length;
  const totalSubAccounts = data.accounts.reduce((sum, account) => 
    sum + (account.subAccounts ? account.subAccounts.length : 0), 0
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountTreeIcon color="primary" />
        <Typography variant="h5">
          Chart of Accounts
        </Typography>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Accounts
              </Typography>
              <Typography variant="h4" color="primary.main">
                {totalAccounts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Sub Accounts
              </Typography>
              <Typography variant="h4" color="info.main">
                {totalSubAccounts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Categories
              </Typography>
              <Typography variant="h4" color="success.main">
                {sortedCategories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories with Accounts */}
      {sortedCategories.map(([categoryName, accounts]) => (
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
                  {accounts.length} main accounts, {accounts.reduce((sum, acc) => sum + (acc.subAccounts ? acc.subAccounts.length : 0), 0)} sub accounts
                </Typography>
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
                    <TableCell align="center">Sub Accounts</TableCell>
                    <TableCell>Category</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accounts.sort((a, b) => a.number.localeCompare(b.number)).map((account) => (
                    <React.Fragment key={account.number}>
                      {/* Main Account */}
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {account.number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {account.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={account.subAccounts ? account.subAccounts.length : 0} 
                            size="small" 
                            variant="outlined"
                            color={account.subAccounts && account.subAccounts.length > 0 ? "primary" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={account.category} 
                            size="small" 
                            color={getCategoryColor(account.category)}
                          />
                        </TableCell>
                      </TableRow>
                      
                      {/* Sub Accounts */}
                      {account.subAccounts && account.subAccounts.map((subAccount) => (
                        <TableRow key={subAccount.number} sx={{ backgroundColor: 'grey.25' }}>
                          <TableCell sx={{ pl: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              └─ {subAccount.number}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ pl: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {subAccount.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {subAccount.category || account.category}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
      
      {/* Footer */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" align="center">
              Chart of Accounts - {totalAccounts} main accounts with {totalSubAccounts} sub accounts across {sortedCategories.length} categories
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};