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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';

export const AccountsReport = ({ data }) => {
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const getAgingColor = (aging) => {
    switch(aging) {
      case 'Current': return 'success';
      case '31-60 days': return 'warning';
      case '61-90 days': return 'error';
      case 'Over 90 days': return 'error';
      default: return 'default';
    }
  };

  const getAgingProgress = (aging) => {
    switch(aging) {
      case 'Current': return 25;
      case '31-60 days': return 50;
      case '61-90 days': return 75;
      case 'Over 90 days': return 100;
      default: return 0;
    }
  };

  if (!data) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            No accounts report data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { payables, receivables, totalPayable, totalReceivable, netPosition, agingSummary } = data;
  const isPositive = netPosition >= 0;

  // Find overdue items
  const overduePayables = payables.filter(p => 
    p.documents.some(d => d.daysOld > 30)
  );
  const overdueReceivables = receivables.filter(r => 
    r.documents.some(d => d.daysOld > 30)
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceIcon color="primary" />
        <Typography variant="h5">
          Accounts Payable & Receivable Report
        </Typography>
      </Box>

      {/* Alerts for overdue items */}
      {overduePayables.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body2">
              {overduePayables.length} supplier(s) have overdue payments
            </Typography>
          </Box>
        </Alert>
      )}
      
      {overdueReceivables.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body2">
              {overdueReceivables.length} customer(s) have overdue payments
            </Typography>
          </Box>
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon />
                <Typography variant="subtitle2" color="white">
                  Accounts Payable
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(totalPayable)}
              </Typography>
              <Typography variant="caption" color="white">
                What we owe to {payables.length} suppliers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                <Typography variant="subtitle2" color="white">
                  Accounts Receivable
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(totalReceivable)}
              </Typography>
              <Typography variant="caption" color="white">
                What {receivables.length} customers owe us
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            backgroundColor: isPositive ? 'primary.main' : 'warning.main'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon />
                <Typography variant="subtitle2" color="white">
                  Net Position
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(Math.abs(netPosition))}
              </Typography>
              <Chip 
                label={isPositive ? "Positive" : "Negative"} 
                size="small" 
                sx={{ 
                  backgroundColor: 'white', 
                  color: isPositive ? 'success.main' : 'error.main',
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
                Cash Flow Impact
              </Typography>
              <Typography variant="h4" color={isPositive ? "success.main" : "error.main"}>
                {isPositive ? '+' : ''}{formatAmount(netPosition)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Expected net cash flow
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Aging Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error.main">
                Payables Aging
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current (0-30 days):</Typography>
                  <Typography fontWeight="bold">{formatAmount(agingSummary?.payables?.current || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">31-60 days:</Typography>
                  <Typography fontWeight="bold" color="warning.main">{formatAmount(agingSummary?.payables?.days30_60 || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">61-90 days:</Typography>
                  <Typography fontWeight="bold" color="error.main">{formatAmount(agingSummary?.payables?.days60_90 || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Over 90 days:</Typography>
                  <Typography fontWeight="bold" color="error.main">{formatAmount(agingSummary?.payables?.over90 || 0)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                Receivables Aging
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Current (0-30 days):</Typography>
                  <Typography fontWeight="bold">{formatAmount(agingSummary?.receivables?.current || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">31-60 days:</Typography>
                  <Typography fontWeight="bold" color="warning.main">{formatAmount(agingSummary?.receivables?.days30_60 || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">61-90 days:</Typography>
                  <Typography fontWeight="bold" color="error.main">{formatAmount(agingSummary?.receivables?.days60_90 || 0)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Over 90 days:</Typography>
                  <Typography fontWeight="bold" color="error.main">{formatAmount(agingSummary?.receivables?.over90 || 0)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Accounts Payable Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="error" />
              <Typography variant="h6">Accounts Payable (What We Owe)</Typography>
            </Box>
            <Typography variant="h6" color="error.main">
              {formatAmount(totalPayable)}
            </Typography>
          </Box>
          
          {payables.length > 0 ? (
            payables.map((supplier) => (
              <Accordion key={supplier.name} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {supplier.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tax ID: {supplier.taxId}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="error.main">
                        {formatAmount(supplier.totalAmount)}
                      </Typography>
                      <Chip 
                        label={`${supplier.documents.length} invoices`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Days Old</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {supplier.documents.map((doc) => (
                          <TableRow key={doc.documentId}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {doc.number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(doc.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatAmount(doc.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="body2">{doc.daysOld}</Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={getAgingProgress(doc.aging)} 
                                  color={getAgingColor(doc.aging)}
                                  sx={{ width: 40, height: 4 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={doc.aging}
                                size="small"
                                color={getAgingColor(doc.aging)}
                                variant={doc.daysOld > 30 ? "filled" : "outlined"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No accounts payable found
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Accounts Receivable Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="success" />
              <Typography variant="h6">Accounts Receivable (What We're Owed)</Typography>
            </Box>
            <Typography variant="h6" color="success.main">
              {formatAmount(totalReceivable)}
            </Typography>
          </Box>
          
          {receivables.length > 0 ? (
            receivables.map((customer) => (
              <Accordion key={customer.name} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tax ID: {customer.taxId}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="success.main">
                        {formatAmount(customer.totalAmount)}
                      </Typography>
                      <Chip 
                        label={`${customer.documents.length} invoices`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell>Invoice #</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Days Old</TableCell>
                          <TableCell align="center">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customer.documents.map((doc) => (
                          <TableRow key={doc.documentId}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {doc.number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(doc.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold">
                                {formatAmount(doc.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="body2">{doc.daysOld}</Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={getAgingProgress(doc.aging)} 
                                  color={getAgingColor(doc.aging)}
                                  sx={{ width: 40, height: 4 }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                label={doc.aging}
                                size="small"
                                color={getAgingColor(doc.aging)}
                                variant={doc.daysOld > 30 ? "filled" : "outlined"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No accounts receivable found
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant="caption" color="text.secondary">
          Generated: {data.generatedAt ? new Date(data.generatedAt).toLocaleString() : 'N/A'}
        </Typography>
      </Box>
    </Box>
  );
};