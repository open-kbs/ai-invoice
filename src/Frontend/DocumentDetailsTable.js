import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const isMobile = window.openkbs.isMobile;

export const DocumentDetailsTable = ({ details = [], onDetailsChange }) => {
  const [editableDetails, setEditableDetails] = useState(details);

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...editableDetails];
    
    if (field.includes('.')) {
      // Handle nested fields like ServiceGood.Name
      const [parent, child] = field.split('.');
      newDetails[index] = {
        ...newDetails[index],
        [parent]: {
          ...newDetails[index][parent],
          [child]: value
        }
      };
    } else {
      newDetails[index] = {
        ...newDetails[index],
        [field]: value
      };
    }

    setEditableDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const handleAddDetail = () => {
    const newDetail = {
      ServiceGood: {
        Name: "",
        Code: "",
        Price: "0.000000",
        FixPrice: "0.000000",
        EcoTax: "0.000000",
        Measure: "pcs",
        Barcode: "",
        Reference: "",
        VatRate: "20",
        VatTermId: "7"
      },
      Qtty: "1",
      Amount: "0.000000",
      Reference: "",
      Measure: "pcs",
      VatAmount: "0.000000",
      TotalVatAmount: "0.000000"
    };

    const newDetails = [...editableDetails, newDetail];
    setEditableDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const handleDeleteDetail = (index) => {
    const newDetails = editableDetails.filter((_, i) => i !== index);
    setEditableDetails(newDetails);
    onDetailsChange(newDetails);
  };

  const formatAmount = (value) => {
    const num = parseFloat(value || 0);
    return num.toFixed(6);
  };

  // Mobile Card View
  const renderMobileCards = () => {
    return (
      <Stack spacing={2}>
        {editableDetails.map((detail, index) => (
          <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteDetail(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Item #{index + 1}
              </Typography>

              <TextField
                fullWidth
                label="Service/Good Name"
                variant="outlined"
                size="small"
                value={detail.ServiceGood?.Name || ""}
                onChange={(e) => handleDetailChange(index, "ServiceGood.Name", e.target.value)}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Code"
                    variant="outlined"
                    size="small"
                    value={detail.ServiceGood?.Code || ""}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.Code", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Barcode"
                    variant="outlined"
                    size="small"
                    value={detail.ServiceGood?.Barcode || ""}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.Barcode", e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    variant="outlined"
                    size="small"
                    value={detail.Qtty || "1"}
                    onChange={(e) => handleDetailChange(index, "Qtty", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Unit"
                    variant="outlined"
                    size="small"
                    value={detail.Measure || "pcs"}
                    onChange={(e) => handleDetailChange(index, "Measure", e.target.value)}
                    placeholder="pcs, kg, m, etc."
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    variant="outlined"
                    size="small"
                    value={detail.ServiceGood?.Price || "0.000000"}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.Price", formatAmount(e.target.value))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    variant="outlined"
                    size="small"
                    value={detail.Amount || "0.000000"}
                    onChange={(e) => handleDetailChange(index, "Amount", formatAmount(e.target.value))}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="VAT Rate (%)"
                    variant="outlined"
                    size="small"
                    value={detail.ServiceGood?.VatRate || "20"}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.VatRate", e.target.value)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="VAT Amount"
                    variant="outlined"
                    size="small"
                    value={detail.VatAmount || "0.000000"}
                    onChange={(e) => handleDetailChange(index, "VatAmount", formatAmount(e.target.value))}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reference"
                    variant="outlined"
                    size="small"
                    value={detail.Reference || ""}
                    onChange={(e) => handleDetailChange(index, "Reference", e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  // Desktop Table View
  const renderDesktopTable = () => {
    return (
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table 
          size="small" 
          sx={{ 
            minWidth: 1200,
            '& .MuiTableCell-root': { 
              padding: '6px 8px',
              fontSize: '0.85rem',
              border: '1px solid #e0e0e0'
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width="30px">#</TableCell>
              <TableCell width="400px">Name</TableCell>
              <TableCell width="130px">Code</TableCell>
              <TableCell width="50px">Qty</TableCell>
              <TableCell width="60px">Unit</TableCell>
              <TableCell width="90px">Price</TableCell>
              <TableCell width="90px">Amount</TableCell>
              <TableCell width="50px">VAT%</TableCell>
              <TableCell width="90px">VAT Amount</TableCell>
              <TableCell width="50px"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {editableDetails.map((detail, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={detail.ServiceGood?.Name || ""}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.Name", e.target.value)}
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.ServiceGood?.Code || ""}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.Code", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.Qtty || "1"}
                    onChange={(e) => handleDetailChange(index, "Qtty", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.Measure || "pcs"}
                    onChange={(e) => handleDetailChange(index, "Measure", e.target.value)}
                    placeholder="pcs, kg, m"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.ServiceGood?.Price || "0.000000"}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.Price", formatAmount(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.Amount || "0.000000"}
                    onChange={(e) => handleDetailChange(index, "Amount", formatAmount(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.ServiceGood?.VatRate || "20"}
                    onChange={(e) => handleDetailChange(index, "ServiceGood.VatRate", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    InputProps={{
                      sx: {
                        '& .MuiOutlinedInput-input': {
                          padding: '6px 8px',
                          fontSize: '0.85rem',
                          minHeight: '18px'
                        }
                      }
                    }}
                    value={detail.VatAmount || "0.000000"}
                    onChange={(e) => handleDetailChange(index, "VatAmount", formatAmount(e.target.value))}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteDetail(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      {isMobile ? renderMobileCards() : renderDesktopTable()}

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddDetail}
          size={isMobile ? "small" : "medium"}
        >
          Add Item
        </Button>
      </Box>
    </Box>
  );
};