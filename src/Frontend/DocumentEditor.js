import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DocumentDetailsTable } from "./DocumentDetailsTable";

const isMobile = window.openkbs.isMobile;

export const DocumentEditor = ({ documentData, onSave }) => {
  const [document, setDocument] = useState(() => {
    return documentData || {
      DocumentId: "",
      DocumentType: "1",
      TotalAmount: "0.000000",
      TotalVatAmount: "0.000000",
      PaymentType: "1",
      CompanyRecipient: {
        Name: "",
        TaxID: "",
        VATNumber: "",
        Addresses: [{ Location: "" }],
        BankAccounts: [{ Name: "", IBAN: "" }]
      },
      CompanySender: {
        Name: "",
        TaxID: "",
        VATNumber: "",
        Addresses: [{ Location: "" }],
        BankAccounts: [{ Name: "", IBAN: "" }]
      },
      DocumentDetails: [],
      Accountings: [{
        AccountingDate: new Date().toISOString(),
        AccountingDetails: [
          {
            VatTermId: "7",
            Direction: "Debit",
            Amount: "0.000000",
            AccountNumber: "1200",
            VatTerm: "7",
            Description: "Accounts Receivable"
          },
          {
            VatTermId: "7",
            Direction: "Credit",
            Amount: "0.000000",
            AccountNumber: "4000",
            VatTerm: "7",
            Description: "Sales Revenue"
          },
          {
            VatTermId: "7",
            Direction: "Credit",
            Amount: "0.000000",
            AccountNumber: "2320",
            VatTerm: "7",
            Description: "Output VAT"
          }
        ]
      }]
    };
  });

  const handleBasicChange = (field, value) => {
    setDocument({
      ...document,
      [field]: value
    });
  };

  const handleCompanyChange = (company, field, value) => {
    setDocument({
      ...document,
      [company]: {
        ...document[company],
        [field]: value
      }
    });
  };

  const handleCompanyAddressChange = (company, value) => {
    setDocument({
      ...document,
      [company]: {
        ...document[company],
        Addresses: [{ Location: value }]
      }
    });
  };

  const handleCompanyBankChange = (company, field, value) => {
    const currentBank = document[company].BankAccounts[0] || {};
    setDocument({
      ...document,
      [company]: {
        ...document[company],
        BankAccounts: [{
          ...currentBank,
          [field]: value
        }]
      }
    });
  };

  const handleDetailsChange = (newDetails) => {
    setDocument({
      ...document,
      DocumentDetails: newDetails
    });
    
    // Recalculate totals
    calculateTotals(newDetails);
  };

  const calculateTotals = (details) => {
    let totalVat = 0;
    let totalAmount = 0;
    
    details.forEach(detail => {
      const amount = parseFloat(detail.Amount || 0);
      const vatAmount = parseFloat(detail.VatAmount || 0);
      
      totalAmount += amount;
      totalVat += vatAmount;
    });
    
    const totalWithVat = totalAmount + totalVat;
    
    // Update document totals
    setDocument(prev => ({
      ...prev,
      TotalAmount: totalWithVat.toFixed(6),
      TotalVatAmount: totalVat.toFixed(6),
      Accountings: [{
        ...prev.Accountings[0],
        AccountingDetails: [
          {
            ...prev.Accountings[0].AccountingDetails[0],
            Amount: totalWithVat.toFixed(6)
          },
          {
            ...prev.Accountings[0].AccountingDetails[1],
            Amount: totalAmount.toFixed(6)
          },
          {
            ...prev.Accountings[0].AccountingDetails[2],
            Amount: totalVat.toFixed(6)
          }
        ]
      }]
    }));
  };

  const handleAccountingDateChange = (field, value) => {
    setDocument({
      ...document,
      Accountings: [{
        ...document.Accountings[0],
        [field]: value
      }]
    });
  };

  const handleSaveClick = () => {
    // Generate DocumentId if not present
    if (!document.DocumentId && document.CompanySender?.TaxID && document.Number) {
      document.DocumentId = `${document.CompanySender.TaxID}_${document.Number}`;
    }
    onSave({ document });
  };

  const formatAmount = (value) => {
    const num = parseFloat(value || 0);
    return num.toFixed(6);
  };

  // Determine currency based on country (simple logic, can be enhanced)
  const getCurrency = () => {
    const vatNumber = document.CompanyRecipient?.VATNumber || "";
    if (vatNumber.startsWith("BG")) return "BGN";
    if (vatNumber.startsWith("DE") || vatNumber.startsWith("FR") || vatNumber.startsWith("IT")) return "EUR";
    if (vatNumber.startsWith("GB")) return "GBP";
    return "EUR"; // Default to EUR
  };

  const currency = getCurrency();

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        International Invoice Editor
      </Typography>

      {/* Basic Document Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Document Number"
                value={document.Number || ""}
                onChange={(e) => handleBasicChange("Number", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Document Date"
                type="datetime-local"
                value={document.Date ? new Date(document.Date).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()} ${date.toLocaleTimeString('en-US', { hour12: true })}`;
                  handleBasicChange("Date", formattedDate);
                }}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={document.DocumentType}
                  label="Document Type"
                  onChange={(e) => handleBasicChange("DocumentType", e.target.value)}
                >
                  <MenuItem value="1">Invoice</MenuItem>
                  <MenuItem value="2">Debit Note</MenuItem>
                  <MenuItem value="3">Credit Note</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={document.PaymentType}
                  label="Payment Type"
                  onChange={(e) => handleBasicChange("PaymentType", e.target.value)}
                >
                  <MenuItem value="1">Bank Transfer</MenuItem>
                  <MenuItem value="2">Cash</MenuItem>
                  <MenuItem value="3">Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Total Amount"
                value={document.TotalAmount}
                onChange={(e) => handleBasicChange("TotalAmount", formatAmount(e.target.value))}
                variant="outlined"
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Total VAT Amount"
                value={document.TotalVatAmount}
                onChange={(e) => handleBasicChange("TotalVatAmount", formatAmount(e.target.value))}
                variant="outlined"
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Document ID"
                value={document.DocumentId || `${document.CompanySender?.TaxID || ''}_${document.Number || ''}`}
                variant="outlined"
                size="small"
                InputProps={{ readOnly: true }}
                helperText="Auto-generated: SenderTaxID_DocumentNumber"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Company Sender */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Company Sender (Seller/Supplier)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={document.CompanySender?.Name || ""}
                onChange={(e) => handleCompanyChange("CompanySender", "Name", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tax ID"
                value={document.CompanySender?.TaxID || ""}
                onChange={(e) => handleCompanyChange("CompanySender", "TaxID", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="VAT Number"
                value={document.CompanySender?.VATNumber || ""}
                onChange={(e) => handleCompanyChange("CompanySender", "VATNumber", e.target.value)}
                variant="outlined"
                size="small"
                placeholder="e.g., DE123456789"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={document.CompanySender?.Addresses?.[0]?.Location || ""}
                onChange={(e) => handleCompanyAddressChange("CompanySender", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={document.CompanySender?.BankAccounts?.[0]?.Name || ""}
                onChange={(e) => handleCompanyBankChange("CompanySender", "Name", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IBAN"
                value={document.CompanySender?.BankAccounts?.[0]?.IBAN || ""}
                onChange={(e) => handleCompanyBankChange("CompanySender", "IBAN", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Company Recipient */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Company Recipient (Buyer - YOUR COMPANY)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={document.CompanyRecipient?.Name || ""}
                onChange={(e) => handleCompanyChange("CompanyRecipient", "Name", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Tax ID"
                value={document.CompanyRecipient?.TaxID || ""}
                onChange={(e) => handleCompanyChange("CompanyRecipient", "TaxID", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="VAT Number"
                value={document.CompanyRecipient?.VATNumber || ""}
                onChange={(e) => handleCompanyChange("CompanyRecipient", "VATNumber", e.target.value)}
                variant="outlined"
                size="small"
                placeholder="e.g., FR12345678901"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={document.CompanyRecipient?.Addresses?.[0]?.Location || ""}
                onChange={(e) => handleCompanyAddressChange("CompanyRecipient", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={document.CompanyRecipient?.BankAccounts?.[0]?.Name || ""}
                onChange={(e) => handleCompanyBankChange("CompanyRecipient", "Name", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="IBAN"
                value={document.CompanyRecipient?.BankAccounts?.[0]?.IBAN || ""}
                onChange={(e) => handleCompanyBankChange("CompanyRecipient", "IBAN", e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Document Details */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Document Details (Goods/Services)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <DocumentDetailsTable 
            details={document.DocumentDetails || []} 
            onDetailsChange={handleDetailsChange} 
          />
        </AccordionDetails>
      </Accordion>

      {/* Accounting Dates */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Accounting Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Accounting Date"
                type="datetime-local"
                value={document.Accountings?.[0]?.AccountingDate?.slice(0, 16) || ""}
                onChange={(e) => handleAccountingDateChange("AccountingDate", e.target.value + ":00")}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Due Date"
                type="datetime-local"
                value={document.DueDate ? new Date(document.DueDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  handleBasicChange("DueDate", date.toISOString().split('T')[0]);
                }}
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Term"
                value={document.Term || ""}
                onChange={(e) => handleBasicChange("Term", e.target.value)}
                variant="outlined"
                size="small"
                placeholder="e.g., Purchase of goods"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2 }}>
            Accounting Entries (Auto-calculated)
          </Typography>
          <Grid container spacing={2}>
            {document.Accountings?.[0]?.AccountingDetails?.map((detail, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {detail.Description || `Account ${detail.AccountNumber}`} ({detail.Direction})
                    </Typography>
                    <Typography variant="h6">
                      {parseFloat(detail.Amount).toFixed(2)} {currency}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveClick}
        >
          Save Document
        </Button>
      </Box>
    </Box>
  );
};