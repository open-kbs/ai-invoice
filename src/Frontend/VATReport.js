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
  Alert,
  Divider
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';

export const VATReport = ({ data }) => {
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  if (!data) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            No VAT report data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { inputVAT, outputVAT, vatPayable, vatRefundable, documents, summary } = data;
  const needsToPay = vatPayable > 0;
  const canClaim = vatRefundable > 0;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountBalanceIcon color="primary" />
        <Typography variant="h5">
          VAT Report
        </Typography>
      </Box>
      
      {/* VAT Status Alert */}
      {needsToPay && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6">VAT Payment Due: {formatAmount(vatPayable)}</Typography>
          <Typography variant="body2">
            You owe {formatAmount(vatPayable)} in VAT to the tax authorities.
          </Typography>
        </Alert>
      )}
      
      {canClaim && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6">VAT Refund Available: {formatAmount(vatRefundable)}</Typography>
          <Typography variant="body2">
            You can claim {formatAmount(vatRefundable)} VAT refund from the tax authorities.
          </Typography>
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'info.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon />
                <Typography variant="subtitle2" color="white">
                  Input VAT
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(inputVAT)}
              </Typography>
              <Typography variant="caption" color="white">
                VAT on purchases (reclaimable)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: 'warning.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                <Typography variant="subtitle2" color="white">
                  Output VAT
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(outputVAT)}
              </Typography>
              <Typography variant="caption" color="white">
                VAT on sales (payable)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            backgroundColor: needsToPay ? 'error.main' : canClaim ? 'success.main' : 'grey.400'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                <Typography variant="subtitle2" color="white">
                  Net VAT Position
                </Typography>
              </Box>
              <Typography variant="h4" color="white">
                {formatAmount(needsToPay ? vatPayable : vatRefundable)}
              </Typography>
              <Chip 
                label={needsToPay ? "To Pay" : canClaim ? "To Claim" : "Balanced"} 
                size="small" 
                sx={{ 
                  backgroundColor: 'white', 
                  color: needsToPay ? 'error.main' : canClaim ? 'success.main' : 'grey.600',
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
                Total Documents
              </Typography>
              <Typography variant="h4" color="primary">
                {summary?.totalDocuments || 0}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Input: {summary?.inputDocuments || 0} | Output: {summary?.outputDocuments || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Documents Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6">VAT Documents</Typography>
          </Box>
          
          {documents && documents.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell>Document #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell align="center">VAT Type</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell align="right">VAT Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {doc.number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.documentId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(doc.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {doc.sender}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {doc.recipient}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={doc.type} 
                          size="small"
                          color={doc.type === 'Input VAT' ? 'info' : 'warning'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatAmount(doc.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={doc.type === 'Input VAT' ? 'info.main' : 'warning.main'}
                        >
                          {formatAmount(doc.vatAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Summary Row */}
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell colSpan={5}>
                      <Typography variant="body2" fontWeight="bold">
                        VAT Summary
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatAmount(documents.reduce((sum, doc) => sum + doc.totalAmount, 0))}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        {formatAmount(documents.reduce((sum, doc) => sum + doc.vatAmount, 0))}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No VAT documents found
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* VAT Calculation Summary */}
      <Card sx={{ mt: 3, backgroundColor: 'grey.50' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            VAT Calculation Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Output VAT (Sales):</Typography>
                  <Typography fontWeight="bold" color="warning.main">
                    + {formatAmount(outputVAT)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Input VAT (Purchases):</Typography>
                  <Typography fontWeight="bold" color="info.main">
                    - {formatAmount(inputVAT)}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    {needsToPay ? 'VAT to Pay:' : canClaim ? 'VAT to Claim:' : 'VAT Balance:'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold"
                    color={needsToPay ? 'error.main' : canClaim ? 'success.main' : 'grey.600'}
                  >
                    {formatAmount(needsToPay ? vatPayable : vatRefundable)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: needsToPay ? 'error.light' : canClaim ? 'success.light' : 'grey.200',
                borderRadius: 1,
                color: needsToPay || canClaim ? 'white' : 'inherit'
              }}>
                <Typography variant="h6" gutterBottom>
                  Action Required
                </Typography>
                {needsToPay && (
                  <Typography variant="body2">
                    • File VAT return by the due date<br/>
                    • Pay {formatAmount(vatPayable)} to tax authorities<br/>
                    • Keep all supporting documents
                  </Typography>
                )}
                {canClaim && (
                  <Typography variant="body2">
                    • File VAT return to claim refund<br/>
                    • Claim {formatAmount(vatRefundable)} from tax authorities<br/>
                    • Ensure all input VAT is valid
                  </Typography>
                )}
                {!needsToPay && !canClaim && (
                  <Typography variant="body2" color="text.secondary">
                    • VAT is balanced - no payment or claim needed<br/>
                    • File nil VAT return if required<br/>
                    • Maintain proper records
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
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