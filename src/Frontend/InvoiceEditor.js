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
  Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GetAppIcon from "@mui/icons-material/GetApp";
import { InvoiceItemsTable } from "./InvoiceItemsTable";

const isMobile = window.openkbs.isMobile;

export const InvoiceEditor = ({ invoiceData, onSave }) => {
  const [invoice, setInvoice] = useState(invoiceData.invoice || {});

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setInvoice({
      ...invoice,
      [name]: value
    });
  };

  const handleEntityInfoChange = (entity, field, value) => {
    setInvoice({
      ...invoice,
      [entity]: {
        ...invoice[entity],
        [field]: value
      }
    });
  };

  const handleSummaryChange = (field, value) => {
    setInvoice({
      ...invoice,
      summary: {
        ...invoice.summary,
        [field]: value
      }
    });
  };

  const handlePaymentChange = (field, value) => {
    setInvoice({
      ...invoice,
      payment: {
        ...invoice.payment,
        [field]: value
      }
    });
  };

  const handleItemsChange = (newItems) => {
    setInvoice({
      ...invoice,
      items: newItems
    });
  };

  const handleSaveClick = () => {
    onSave({
      invoice: invoice
    });
  };

  const handleDownloadClick = () => {
    // Create a JSON blob from the invoice data
    const invoiceJSON = JSON.stringify({ invoice }, null, 2);
    const blob = new Blob([invoiceJSON], { type: "application/json" });

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `invoice-${invoice.number || "download"}.json`;
    document.body.appendChild(link);
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Invoice Editor
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Invoice Number"
                    name="number"
                    value={invoice.number || ""}
                    onChange={handleBasicInfoChange}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    value={invoice.date || ""}
                    onChange={handleBasicInfoChange}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Place"
                    name="place"
                    value={invoice.place || ""}
                    onChange={handleBasicInfoChange}
                    variant="outlined"
                    size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Seller Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Name"
                    value={invoice.seller?.name || ""}
                    onChange={(e) => handleEntityInfoChange("seller", "name", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Address"
                    value={invoice.seller?.address || ""}
                    onChange={(e) => handleEntityInfoChange("seller", "address", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="TIN"
                    value={invoice.seller?.TIN || ""}
                    onChange={(e) => handleEntityInfoChange("seller", "TIN", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="VAT"
                    value={invoice.seller?.VAT || ""}
                    onChange={(e) => handleEntityInfoChange("seller", "VAT", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Representative"
                    value={invoice.seller?.representative || ""}
                    onChange={(e) => handleEntityInfoChange("seller", "representative", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Buyer Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Name"
                    value={invoice.buyer?.name || ""}
                    onChange={(e) => handleEntityInfoChange("buyer", "name", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                    fullWidth
                    label="Address"
                    value={invoice.buyer?.address || ""}
                    onChange={(e) => handleEntityInfoChange("buyer", "address", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="TIN"
                    value={invoice.buyer?.TIN || ""}
                    onChange={(e) => handleEntityInfoChange("buyer", "TIN", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="VAT"
                    value={invoice.buyer?.VAT || ""}
                    onChange={(e) => handleEntityInfoChange("buyer", "VAT", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Contact"
                    value={invoice.buyer?.contact || ""}
                    onChange={(e) => handleEntityInfoChange("buyer", "contact", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Client Number"
                    value={invoice.buyer?.client_number || ""}
                    onChange={(e) => handleEntityInfoChange("buyer", "client_number", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Invoice Items</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <InvoiceItemsTable items={invoice.items || []} onItemsChange={handleItemsChange} />
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Base Total"
                    value={invoice.summary?.base_total !== undefined ? invoice.summary.base_total : ""}
                    onChange={(e) => handleSummaryChange("base_total", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="VAT Rate"
                    value={invoice.summary?.vat_rate !== undefined ? invoice.summary.vat_rate : ""}
                    onChange={(e) => handleSummaryChange("vat_rate", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="VAT Amount"
                    value={invoice.summary?.vat_amount !== undefined ? invoice.summary.vat_amount : ""}
                    onChange={(e) => handleSummaryChange("vat_amount", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Total"
                    value={invoice.summary?.total !== undefined ? invoice.summary.total : ""}
                    onChange={(e) => handleSummaryChange("total", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Prepaid Voucher"
                    value={invoice.summary?.prepaid_voucher !== undefined ? invoice.summary.prepaid_voucher : ""}
                    onChange={(e) => handleSummaryChange("prepaid_voucher", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Amount Due"
                    value={invoice.summary?.amount_due !== undefined ? invoice.summary.amount_due : ""}
                    onChange={(e) => handleSummaryChange("amount_due", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                    fullWidth
                    label="Currency"
                    value={invoice.summary?.currency || ""}
                    onChange={(e) => handleSummaryChange("currency", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Payment Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                    fullWidth
                    label="Payment Type"
                    value={invoice.payment?.type || ""}
                    onChange={(e) => handlePaymentChange("type", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                    fullWidth
                    label="Bank"
                    value={invoice.payment?.bank || ""}
                    onChange={(e) => handlePaymentChange("bank", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                    fullWidth
                    label="IBAN"
                    value={invoice.payment?.IBAN || ""}
                    onChange={(e) => handlePaymentChange("IBAN", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                    fullWidth
                    label="BIC"
                    value={invoice.payment?.BIC || ""}
                    onChange={(e) => handlePaymentChange("BIC", e.target.value)}
                    variant="outlined"
                    size="small"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 3, mb: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
              variant="contained"
              color="secondary"
              onClick={handleDownloadClick}
          >
            Download{!isMobile && ` as JSON`}
          </Button>
          <Button
              variant="contained"
              color="primary"
              onClick={handleSaveClick}
          >
            Save{!isMobile && ` Invoice`}
          </Button>
        </Box>
      </Box>
  );
};