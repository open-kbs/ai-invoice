export const getActions = (meta) => [
  // New action to handle invoice save requests
  [/\{"type":"SAVE_INVOICE_REQUEST"[\s\S]*\}/, async (match) => {
    try {
      // Parse the JSON content
      const requestData = JSON.parse(match[0]);
      
      // Simulate API call to store the invoice
      // In a real app, this would make an actual API call
      console.log("Saving invoice data:", requestData);
      
      // Demo API call simulation - would be replaced with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success response
      return {
        type: "SAVE_INVOICE_SUCCESS",
        message: "Invoice has been successfully saved",
        timestamp: new Date().toISOString(),
        invoiceId: "INV-" + Math.floor(Math.random() * 10000),
        ...meta
      };
    } catch (e) {
      console.error("Error saving invoice:", e);
      
      // Return error response
      return {
        type: "SAVE_INVOICE_FAILED",
        error: e.message || "Failed to save invoice",
        timestamp: new Date().toISOString(),
        ...meta
      };
    }
  }]
];