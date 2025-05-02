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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export const InvoiceItemsTable = ({ items = [], onItemsChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [editableItems, setEditableItems] = useState(items);

  const handleItemChange = (index, field, value) => {
    const newItems = [...editableItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    setEditableItems(newItems);
    onItemsChange(newItems);
  };

  const handleAddItem = () => {
    const newItem = {
      no: editableItems.length + 1,
      description: "",
      unit: "",
      unit_price_without_vat: "",
      unit_price_with_vat: "",
      quantity: "",
      total_without_vat: "",
      total_with_vat: ""
    };

    const newItems = [...editableItems, newItem];
    setEditableItems(newItems);
    onItemsChange(newItems);
  };

  const handleDeleteItem = (index) => {
    const newItems = editableItems.filter((_, i) => i !== index);

    // Renumber the items
    const renumberedItems = newItems.map((item, i) => ({
      ...item,
      no: i + 1
    }));

    setEditableItems(renumberedItems);
    onItemsChange(renumberedItems);
  };

  // Define columns based on screen size
  const getColumns = () => {
    if (isMobile) {
      return [
        { id: "no", label: "#", width: "40px" },
        { id: "description", label: "Description", width: "auto" },
        { id: "quantity", label: "Qty", width: "60px" },
        { id: "total_with_vat", label: "Total", width: "70px" },
        { id: "actions", label: "", width: "40px" }
      ];
    }

    return [
      { id: "no", label: "#", width: "30px" },
      { id: "description", label: "Description", width: "30%" },
      { id: "unit", label: "Unit", width: "70px" },
      { id: "quantity", label: "Qty", width: "70px" },
      { id: "unit_price_without_vat", label: "Price (excl)", width: "100px" },
      { id: "unit_price_with_vat", label: "Price (incl)", width: "100px" },
      { id: "total_without_vat", label: "Total (excl)", width: "100px" },
      { id: "total_with_vat", label: "Total (incl)", width: "100px" },
      { id: "actions", label: "", width: "40px" }
    ];
  };

  const columns = getColumns();

  // Mobile Card View
  const renderMobileCards = () => {
    return (
        <Stack spacing={2}>
          {editableItems.map((item, index) => (
              <Card key={index} variant="outlined" sx={{ position: 'relative' }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteItem(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Item #{item.no}
                  </Typography>

                  <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      size="small"
                      value={item.description !== undefined ? item.description : ""}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      sx={{ mb: 2 }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                          fullWidth
                          label="Unit"
                          variant="outlined"
                          size="small"
                          value={item.unit !== undefined ? item.unit : ""}
                          onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                          fullWidth
                          label="Quantity"
                          variant="outlined"
                          size="small"
                          value={item.quantity !== undefined ? item.quantity : ""}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                          fullWidth
                          label="Unit Price (excl VAT)"
                          variant="outlined"
                          size="small"
                          value={item.unit_price_without_vat !== undefined ? item.unit_price_without_vat : ""}
                          onChange={(e) => handleItemChange(index, "unit_price_without_vat", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                          fullWidth
                          label="Unit Price (incl VAT)"
                          variant="outlined"
                          size="small"
                          value={item.unit_price_with_vat !== undefined ? item.unit_price_with_vat : ""}
                          onChange={(e) => handleItemChange(index, "unit_price_with_vat", e.target.value)}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                          fullWidth
                          label="Total (excl VAT)"
                          variant="outlined"
                          size="small"
                          value={item.total_without_vat !== undefined ? item.total_without_vat : ""}
                          onChange={(e) => handleItemChange(index, "total_without_vat", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                          fullWidth
                          label="Total (incl VAT)"
                          variant="outlined"
                          size="small"
                          value={item.total_with_vat !== undefined ? item.total_with_vat : ""}
                          onChange={(e) => handleItemChange(index, "total_with_vat", e.target.value)}
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
        <TableContainer component={Paper}>
          <Table size="small" padding="none" sx={{ '& .MuiTableCell-root': { padding: '4px' } }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                    <TableCell
                        key={column.id}
                        style={{ width: column.width }}
                        align={column.id === "no" ? "center" : "left"}
                    >
                      {column.label}
                    </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {editableItems.map((item, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => {
                      if (column.id === "actions") {
                        return (
                            <TableCell key={column.id} sx={{ padding: '0 4px' }}>
                              <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteItem(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                        );
                      }

                      if (column.id === "no") {
                        return (
                            <TableCell key={column.id} align="center">
                              {item.no}
                            </TableCell>
                        );
                      }

                      if (column.id in item) {
                        return (
                            <TableCell key={column.id}>
                              <TextField
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  value={item[column.id] !== undefined ? item[column.id] : ""}
                                  onChange={(e) =>
                                      handleItemChange(index, column.id, e.target.value)
                                  }
                                  InputProps={{
                                    sx: {
                                      '& .MuiOutlinedInput-input': {
                                        padding: '6px 8px',
                                        fontSize: '0.9rem'
                                      }
                                    }
                                  }}
                              />
                            </TableCell>
                        );
                      }

                      return <TableCell key={column.id}></TableCell>;
                    })}
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
              onClick={handleAddItem}
              size={isMobile ? "small" : "medium"}
          >
            Add Item
          </Button>
        </Box>
      </Box>
  );
};