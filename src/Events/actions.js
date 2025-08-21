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

// Default chart of accounts structure - minimal generic version
const getDefaultChartOfAccounts = () => {
  return {
    accounts: [
      // Assets (1000-1999)
      { number: "1000", name: "Cash", category: "Assets", subAccounts: [] },
      { number: "1100", name: "Bank Accounts", category: "Assets", subAccounts: [] },
      { number: "1200", name: "Accounts Receivable", category: "Assets", subAccounts: [] },
      { number: "1500", name: "Fixed Assets", category: "Assets", subAccounts: [] },
      
      // Liabilities (2000-2999)
      { number: "2100", name: "Accounts Payable", category: "Liabilities", subAccounts: [] },
      { number: "2300", name: "VAT Payable", category: "Liabilities", subAccounts: [] },
      { number: "2310", name: "Input VAT", category: "Liabilities", subAccounts: [] },
      { number: "2320", name: "Output VAT", category: "Liabilities", subAccounts: [] },
      { number: "2500", name: "Loans", category: "Liabilities", subAccounts: [] },
      
      // Equity (3000-3999)
      { number: "3000", name: "Capital", category: "Equity", subAccounts: [] },
      { number: "3100", name: "Retained Earnings", category: "Equity", subAccounts: [] },
      
      // Revenue (4000-4999)
      { number: "4000", name: "Sales", category: "Revenue", subAccounts: [] },
      { number: "4100", name: "Services", category: "Revenue", subAccounts: [] },
      
      // Expenses (5000-5999)
      { number: "5000", name: "Purchases", category: "Expenses", subAccounts: [] },
      { number: "5100", name: "Operating Expenses", category: "Expenses", subAccounts: [] },
      { number: "5200", name: "Personnel Expenses", category: "Expenses", subAccounts: [] },
      { number: "5900", name: "Other Expenses", category: "Expenses", subAccounts: [] }
    ]
  };
};

// Helper function to get or create chart of accounts
const getOrCreateChartOfAccounts = async () => {
  try {
    // Try to fetch existing chart of accounts
    const response = await openkbs.items({
      action: 'fetchItems',
      itemType: 'chartOfAccounts',
      limit: 1
    });
    
    if (response.items && response.items.length > 0) {
      // Chart exists, decrypt and parse it
      const encryptedChart = response.items[0].item.chart;
      const decryptedChart = await openkbs.decrypt(encryptedChart);
      return JSON.parse(decryptedChart);
    } else {
      // Chart doesn't exist, create default one
      const defaultChart = getDefaultChartOfAccounts();
      
      // Save the default chart
      await openkbs.items({
        action: 'createItem',
        itemType: 'chartOfAccounts',
        attributes: [
          { attrType: "itemId", attrName: "Id", encrypted: false },
          { attrType: "body", attrName: "chart", encrypted: true }
        ],
        item: {
          Id: 'chartOfAccounts',
          chart: await openkbs.encrypt(JSON.stringify(defaultChart))
        }
      });
      
      return defaultChart;
    }
  } catch (e) {
    console.error("Error getting chart of accounts:", e);
    // Return default if there's an error
    return getDefaultChartOfAccounts();
  }
};

// Helper function to recursively find and add account
const addAccountToChart = (accounts, parentNumber, newAccount) => {
  for (let account of accounts) {
    if (account.number === parentNumber) {
      // Found parent, add as subaccount
      if (!account.subAccounts) account.subAccounts = [];
      account.subAccounts.push(newAccount);
      return true;
    }
    // Recursively search in subaccounts
    if (account.subAccounts && account.subAccounts.length > 0) {
      if (addAccountToChart(account.subAccounts, parentNumber, newAccount)) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to save updated chart
const saveChartOfAccounts = async (chart) => {
  try {
    const encryptedChart = await openkbs.encrypt(JSON.stringify(chart));
    
    // First check if chart exists
    const existing = await openkbs.items({
      action: 'fetchItems',
      itemType: 'chartOfAccounts',
      limit: 1
    });
    
    if (existing.items && existing.items.length > 0) {
      // Update existing - need to delete and recreate
      try {
        // Delete old version
        await openkbs.items({
          action: 'deleteItem',
          itemType: 'chartOfAccounts',
          itemId: 'chartOfAccounts'
        });
      } catch (deleteError) {
        console.log("Could not delete old chart, will try to create new");
      }
    }
    
    // Create new/updated chart
    await openkbs.items({
      action: 'createItem',
      itemType: 'chartOfAccounts',
      attributes: [
        { attrType: "itemId", attrName: "Id", encrypted: false },
        { attrType: "body", attrName: "chart", encrypted: true }
      ],
      item: {
        Id: 'chartOfAccounts',
        chart: encryptedChart
      }
    });
    
    console.log("Chart of accounts saved successfully");
    return true;
  } catch (e) {
    console.error("Error saving chart of accounts:", e);
    return false;
  }
};

// Shared handler function for saving documents
const saveDocument = async (document, suggestedAccounts, meta) => {
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
    
    // Return success response with suggested accounts
    return {
      type: "DOCUMENT_SAVED",
      data: {
        message: `Document saved with ID: ${document.DocumentId}`,
        documentId: document.DocumentId,
        itemCount: document.DocumentDetails?.length || 0,
        documentData: document,
        suggestedAccounts: suggestedAccounts || [],
        result: response,
      },
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
  // Save document - handles both LLM output and manual save button
  [/\{\s*"type"\s*:\s*"SAVE_DOCUMENT_REQUEST"[\s\S]*\}/, async (match) => {
    try {
      // Parse the JSON content
      const requestData = JSON.parse(match[0]);
      const document = requestData.document;
      const suggestedAccounts = requestData.suggestedAccounts;
      
      if (!document) {
        throw new Error("No document data provided");
      }
      
      return await saveDocument(document, suggestedAccounts, meta);
    } catch (e) {
      console.error("Error processing save request:", e);
      return {
        type: "SAVE_DOCUMENT_FAILED",
        error: e.message || "Failed to process save request",
        ...meta
      };
    }
  }],
  // Add account to chart of accounts
  [/\/addAccount\(([^)]+)\)/, async (match) => {
    try {
      // Parse the parameters - expecting JSON like: {"parentNumber": "5000", "number": "5010", "name": "Raw Materials", "category": "Expenses"}
      const params = JSON.parse(match[1]);
      const { parentNumber, number, name, category } = params;
      
      if (!number || !name) {
        return {
          type: "ADD_ACCOUNT_FAILED",
          error: "Account number and name are required",
          _meta_actions: []
        };
      }
      
      // Get current chart
      const chart = await getOrCreateChartOfAccounts();
      
      const newAccount = {
        number,
        name,
        category: category || "Expenses",
        subAccounts: []
      };
      
      let added = false;
      if (parentNumber) {
        // Add as subaccount
        added = addAccountToChart(chart.accounts, parentNumber, newAccount);
      } else {
        // Add as top-level account
        chart.accounts.push(newAccount);
        added = true;
      }
      
      if (added) {
        // Save updated chart
        await saveChartOfAccounts(chart);
        
        return {
          type: "ACCOUNT_ADDED",
          message: `Account ${number} - ${name} added successfully`,
          account: newAccount,
          parentNumber: parentNumber || "root",
          _meta_actions: []
        };
      } else {
        return {
          type: "ADD_ACCOUNT_FAILED",
          error: `Parent account ${parentNumber} not found`,
          _meta_actions: []
        };
      }
    } catch (e) {
      return {
        type: "ADD_ACCOUNT_FAILED",
        error: e.message || "Failed to add account",
        _meta_actions: []
      };
    }
  }],
  
  // Get chart of accounts (for use by LLM and viewing)
  [/\/getChartOfAccounts\(\)/, async (match) => {
    try {
      const chart = await getOrCreateChartOfAccounts();
      
      return {
        type: "CHART_OF_ACCOUNTS",
        data: chart,
        accountCount: chart.accounts.length,
        _meta_actions: ["REQUEST_CHAT_MODEL"]
      };
    } catch (e) {
      return {
        type: "GET_CHART_FAILED",
        error: e.message || "Failed to retrieve chart of accounts",
        _meta_actions: []
      };
    }
  }],
  
  // List all saved documents
  [/\/listDocuments\(\)/, async (match) => {
    try {
      // Fetch all documents from storage
      const response = await openkbs.items({
        action: 'fetchItems',
        itemType: 'document',
        limit: 100  // Adjust as needed
      });
      
      if (!response.items || response.items.length === 0) {
        return {
          type: "DOCUMENTS_LIST",
          message: "No documents found",
          data: [],
          _meta_actions: []  // No LLM interaction needed
        };
      }
      
      // Decrypt and parse each document
      const data = await Promise.all(response.items.map(async (item) => {
        try {
          const decryptedDoc = await openkbs.decrypt(item.item.document);
          const parsedDoc = JSON.parse(decryptedDoc);
          
          // Include the items/details
          const items = parsedDoc.DocumentDetails?.map(detail => ({
            name: detail.ServiceGood?.Name,
            quantity: detail.Qtty,
            measure: detail.Measure,
            price: detail.ServiceGood?.Price,
            amount: detail.Amount,
            vatRate: detail.ServiceGood?.VatRate,
            vatAmount: detail.VatAmount
          })) || [];
          
          return {
            id: item.item.Id,
            documentId: parsedDoc.DocumentId,
            documentType: parsedDoc.DocumentType,
            number: parsedDoc.Number,
            date: parsedDoc.Date,
            totalAmount: parsedDoc.TotalAmount,
            totalVatAmount: parsedDoc.TotalVatAmount,
            sender: parsedDoc.CompanySender?.Name,
            senderTaxId: parsedDoc.CompanySender?.TaxID,
            recipient: parsedDoc.CompanyRecipient?.Name,
            recipientTaxId: parsedDoc.CompanyRecipient?.TaxID,
            itemCount: parsedDoc.DocumentDetails?.length || 0,
            items: items,
            createdAt: item.meta.createdAt,
            updatedAt: item.meta.updatedAt
          };
        } catch (e) {
          console.error("Error decrypting document:", e);
          return {
            id: item.item.Id,
            error: "Failed to decrypt document"
          };
        }
      }));
      
      return {
        type: "DOCUMENTS_LIST",
        data,
        count: data.length,
        _meta_actions: []  // No LLM interaction needed
      };
    } catch (e) {
      console.error("Error listing documents:", e);
      return {
        type: "LIST_DOCUMENTS_FAILED",
        error: e.message || "Failed to list documents",
        _meta_actions: []
      };
    }
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
      
      // Get chart of accounts from database or create default
      const chartOfAccounts = await getOrCreateChartOfAccounts();
      
      const result = {
        YourCompany: yourCompany,
        OtherCompany: otherCompany,
        ChartOfAccounts: chartOfAccounts
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