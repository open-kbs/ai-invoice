// Helper function to fetch company details from EU VIES API
const fetchEUCompanyDetails = async (vatNumber) => {
  try {
    // Clean VAT number - remove spaces and convert to uppercase
    const cleanVAT = vatNumber.replace(/\s/g, '').toUpperCase();
    
    // Extract country code and number
    const countryCode = cleanVAT.substring(0, 2);
    const number = cleanVAT.substring(2);
    
    // Use official EU VIES REST API (free, no auth required)
    const response = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${countryCode}/vat/${number}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    return {
      Name: data.name || '',
      TaxID: number,  // Just the number without country code
      VATNumber: `${countryCode}${number}`,  // Full VAT with country code
      isVATRegistered: data.isValid || false,
      Id: number,
      Addresses: data.address ? [{
        Location: data.address
      }] : [],
      CompanyType: data.viesApproximate?.companyType || '',
      OriginalResponse: data  // Keep original for reference
    };
  } catch (e) {
    console.log(`Could not fetch EU company details for ${vatNumber}:`, e.message);
    return null;
  }
};

// Helper function to generate chart of accounts
const getChartOfAccounts = () => {
  return {
    accounts: [
      // Assets (1000-1999)
      { number: "1000", name: "Cash", category: "Assets" },
      { number: "1100", name: "Bank Accounts", category: "Assets" },
      { number: "1200", name: "Accounts Receivable", category: "Assets" },
      { number: "1300", name: "Inventory", category: "Assets" },
      { number: "1400", name: "Prepaid Expenses", category: "Assets" },
      { number: "1500", name: "Fixed Assets", category: "Assets" },
      { number: "1600", name: "Accumulated Depreciation", category: "Assets" },
      
      // Liabilities (2000-2999)
      { number: "2100", name: "Accounts Payable", category: "Liabilities" },
      { number: "2200", name: "Short-term Loans", category: "Liabilities" },
      { number: "2300", name: "VAT Payable", category: "Liabilities" },
      { number: "2310", name: "Input VAT", category: "Liabilities" },
      { number: "2320", name: "Output VAT", category: "Liabilities" },
      { number: "2400", name: "Salaries Payable", category: "Liabilities" },
      { number: "2500", name: "Long-term Loans", category: "Liabilities" },
      
      // Equity (3000-3999)
      { number: "3000", name: "Share Capital", category: "Equity" },
      { number: "3100", name: "Retained Earnings", category: "Equity" },
      { number: "3200", name: "Current Year Earnings", category: "Equity" },
      
      // Revenue (4000-4999)
      { number: "4000", name: "Sales Revenue", category: "Revenue" },
      { number: "4100", name: "Service Revenue", category: "Revenue" },
      { number: "4200", name: "Other Revenue", category: "Revenue" },
      
      // Expenses (5000-5999)
      { number: "5000", name: "Cost of Goods Sold", category: "Expenses" },
      { number: "5100", name: "Rent Expense", category: "Expenses" },
      { number: "5200", name: "Purchases", category: "Expenses" },
      { number: "5300", name: "Salaries Expense", category: "Expenses" },
      { number: "5400", name: "Utilities Expense", category: "Expenses" },
      { number: "5500", name: "Marketing Expense", category: "Expenses" },
      { number: "5600", name: "Office Supplies", category: "Expenses" },
      { number: "5700", name: "Travel Expense", category: "Expenses" },
      { number: "5800", name: "Depreciation Expense", category: "Expenses" },
      { number: "5900", name: "Other Expenses", category: "Expenses" }
    ]
  };
};

// Shared handler function for saving documents
const saveDocument = async (document, meta) => {
  try {
    if (!document.DocumentId) {
      throw new Error("Document must have a DocumentId field");
    }

    // Save the document to OpenKBS storage
    const response = await openkbs.items({
      action: 'createItem',
      itemType: 'document',
      attributes: [
        { attrType: "itemId", attrName: "Id", encrypted: false },
        { attrType: "body", attrName: "document", encrypted: true }
      ],
      item: {
        Id: document.DocumentId,
        document: await openkbs.encrypt(JSON.stringify(document))
      }
    });
    
    // Return success response
    return {
      type: "DOCUMENT_SAVED",
      message: `Document saved with ID: ${document.DocumentId}`,
      documentId: document.DocumentId,
      itemCount: document.DocumentDetails?.length || 0,
      documentData: document,
      result: response,
      ...meta
    };
  } catch (e) {
    console.error("Error saving document:", e);
    return {
      type: "SAVE_DOCUMENT_FAILED",
      error: e.message || "Failed to save document",
      ...meta
    };
  }
};

export const getActions = (meta) => [
  // Auto-save when LLM outputs a document with DocumentId
  [/\{"DocumentId"[\s\S]*\}/, async (match) => {
    try {
      const document = JSON.parse(match[0]);
      if (!document.DocumentId) {
        return null; // Not a document, let other handlers process it
      }
      return await saveDocument(document, meta);
    } catch (e) {
      return null; // Let document be displayed normally if parsing fails
    }
  }],
  
  // Manual save when user clicks save button
  [/\{"type":"SAVE_DOCUMENT_REQUEST"[\s\S]*\}/, async (match) => {
    // Test if regex matches
    return {
      type: "TEST_REGEX_MATCH",
      message: "Regex matched SAVE_DOCUMENT_REQUEST!",
      matchedString: match[0].substring(0, 100), // First 100 chars to see what was matched
      ...meta
    };
  }],
  // Get company details and chart of accounts for invoice processing
  [/\/getCompanyDetails\("([^"]*)",\s*"([^"]*)"\)/, async (match, event) => {
    const yourCompanyTaxID = match[1]?.trim();
    const otherCompanyTaxID = match[2]?.trim();

    if (!yourCompanyTaxID || !otherCompanyTaxID) {
      return {
        error: 'Both YOUR_COMPANY Tax ID and other company Tax ID are required',
        ...meta
      };
    }
    
    try {
      // Try to fetch company details from EU VAT API if they look like VAT numbers
      let yourCompany = null;
      let otherCompany = null;
      
      // Check if the tax IDs look like EU VAT numbers (start with 2 letters)
      if (/^[A-Z]{2}/i.test(yourCompanyTaxID)) {
        yourCompany = await fetchEUCompanyDetails(yourCompanyTaxID);
      }
      
      if (/^[A-Z]{2}/i.test(otherCompanyTaxID)) {
        otherCompany = await fetchEUCompanyDetails(otherCompanyTaxID);
      }
      
      // If not found or not EU VAT numbers, create basic entries
      if (!yourCompany) {
        yourCompany = {
          Name: "Your Company",
          TaxID: yourCompanyTaxID,
          VATNumber: yourCompanyTaxID,
          isVATRegistered: true, // Assume VAT registered by default
          Id: yourCompanyTaxID,
          Addresses: []
        };
      }
      
      if (!otherCompany) {
        otherCompany = {
          Name: "Other Company",
          TaxID: otherCompanyTaxID,
          VATNumber: otherCompanyTaxID,
          isVATRegistered: true, // Assume VAT registered by default
          Id: otherCompanyTaxID,
          Addresses: []
        };
      }
      
      const result = {
        YourCompany: yourCompany,
        OtherCompany: otherCompany,
        ChartOfAccounts: getChartOfAccounts()
      };

      return {
        data: result,
        ...meta
      };
    } catch (e) {
      return {
        error: e.message,
        ...meta
      };
    }
  }],

  // OCR processing for uploaded images
  [/\[\{"type":"text","text":[\s\S]*?\]/, async (match) => {
    try {
      // Parse the image upload content
      const uploadContent = JSON.parse(match[0]);
      
      // Extract image URL from the array
      let imageUrl = "";
      for (const item of uploadContent) {
        if (item.type === "image_url" && item.image_url?.url) {
          imageUrl = item.image_url.url;
          break;
        }
      }
      
      if (!imageUrl) {
        throw new Error("No image URL found in upload");
      }
      
      // Perform OCR
      const ocr = await openkbs.imageToText(imageUrl);
      
      return {
        data: {
          invoiceText: ocr?.results,
          imageUrl: imageUrl
        },
        message: `OCR completed for uploaded image`,
        ...meta
      };
    } catch (e) {
      console.error("OCR processing error:", e);
      
      return {
        type: "OCR_ERROR",
        error: e.message,
        message: `❌ Error in OCR processing: ${e.message}`,
        ...meta
      };
    }
  }],

];