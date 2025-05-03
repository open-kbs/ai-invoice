export const getActions = (meta) => [
  // New action to handle invoice save requests
  [/\{"type":"SAVE_INVOICE_REQUEST"[\s\S]*\}/, async (match) => {
    try {
      // Parse the JSON content
      const requestData = JSON.parse(match[0]);
      
      // Return success response
      return {
        type: "SAVE_INVOICE_SUCCESS",
        message: `Invoice with ${requestData?.invoice?.items?.length} items has been successfully saved.`,
        nextStep: `Navigate to the Database section to view/export your invoices.`,
        ...meta
      };
    } catch (e) {
      console.error("Error saving invoice:", e);
      
      // Return error response
      return {
        type: "SAVE_INVOICE_FAILED",
        error: e.message || "Failed to save invoice",
        ...meta
      };
    }
  }]
];