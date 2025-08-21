import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
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
  Grid,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export const DocumentsList = ({ documents = [] }) => {
  const formatAmount = (amount) => {
    return parseFloat(amount || 0).toFixed(2);
  };

  const getDocumentTypeLabel = (type) => {
    switch(type) {
      case "1": return { label: "Invoice", color: "primary" };
      case "2": return { label: "Debit Note", color: "warning" };
      case "3": return { label: "Credit Note", color: "error" };
      default: return { label: "Document", color: "default" };
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" align="center">
            No documents found
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Documents List ({documents.length} documents)
      </Typography>
      
      {documents.map((doc, index) => {
        const docType = getDocumentTypeLabel(doc.documentType);
        
        return (
          <Accordion key={doc.id || index} sx={{ mb: 2 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: 'grey.50' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <ReceiptIcon color="action" />
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {doc.number || doc.documentId}
                    </Typography>
                    <Chip 
                      label={docType.label} 
                      size="small" 
                      color={docType.color}
                    />
                    {doc.itemCount > 0 && (
                      <Chip 
                        label={`${doc.itemCount} items`} 
                        size="small" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16 }} color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {doc.date}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BusinessIcon sx={{ fontSize: 16 }} color="action" />
                      <Typography variant="body2">
                        From: <strong>{doc.sender}</strong> → To: <strong>{doc.recipient}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                  <Typography variant="h6" color="primary">
                    {formatAmount(doc.totalAmount)}
                  </Typography>
                  {doc.totalVatAmount > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      VAT: {formatAmount(doc.totalVatAmount)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Sender Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>{doc.sender}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tax ID: {doc.senderTaxId}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Recipient Details
                    </Typography>
                    <Typography variant="body2">
                      <strong>{doc.recipient}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tax ID: {doc.recipientTaxId}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {doc.items && doc.items.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Document Items
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'grey.100' }}>
                          <TableCell>#</TableCell>
                          <TableCell>Item Name</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="center">Unit</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">VAT %</TableCell>
                          <TableCell align="right">VAT Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {doc.items.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="center">{item.measure}</TableCell>
                            <TableCell align="right">{formatAmount(item.price)}</TableCell>
                            <TableCell align="right">{formatAmount(item.amount)}</TableCell>
                            <TableCell align="center">{item.vatRate}%</TableCell>
                            <TableCell align="right">{formatAmount(item.vatAmount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Document ID: {doc.documentId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(doc.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};