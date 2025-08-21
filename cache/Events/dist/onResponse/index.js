/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __nccwpck_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "handler": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: ./actions.js
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

const getActions = (meta) => [
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
        _meta_actions: []
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

  // Generate Trial Balance (Oborotna Vedomost) grouped by categories
  [/\/getTrialBalance\(\)/, async (match) => {
    try {
      // Fetch all documents
      const response = await openkbs.items({
        action: 'fetchItems',
        itemType: 'document',
        limit: 1000
      });
      
      if (!response.items || response.items.length === 0) {
        return {
          type: "TRIAL_BALANCE",
          message: "No documents found for trial balance",
          data: {
            categories: {},
            totals: { debit: 0, credit: 0 }
          },
          _meta_actions: []
        };
      }
      
      // Get chart of accounts for account info
      const chart = await getOrCreateChartOfAccounts();
      const accountMap = {};
      
      // Build account map with categories
      const buildAccountMap = (accounts, parentCategory = null) => {
        accounts.forEach(account => {
          accountMap[account.number] = {
            name: account.name,
            category: account.category || parentCategory,
            debit: 0,
            credit: 0,
            balance: 0,
            transactions: []
          };
          if (account.subAccounts && account.subAccounts.length > 0) {
            buildAccountMap(account.subAccounts, account.category);
          }
        });
      };
      buildAccountMap(chart.accounts);
      
      // Process all documents
      for (const item of response.items) {
        try {
          const decryptedDoc = await openkbs.decrypt(item.item.document);
          const doc = JSON.parse(decryptedDoc);
          
          // Process accounting entries
          if (doc.Accountings) {
            for (const accounting of doc.Accountings) {
              if (accounting.AccountingDetails) {
                for (const detail of accounting.AccountingDetails) {
                  const accountNum = detail.AccountNumber;
                  if (accountMap[accountNum]) {
                    const amount = parseFloat(detail.Amount || 0);
                    
                    if (detail.Direction === 'Debit') {
                      accountMap[accountNum].debit += amount;
                    } else if (detail.Direction === 'Credit') {
                      accountMap[accountNum].credit += amount;
                    }
                    
                    // Add transaction details
                    accountMap[accountNum].transactions.push({
                      documentId: doc.DocumentId,
                      date: doc.Date,
                      description: detail.Description,
                      direction: detail.Direction,
                      amount: amount
                    });
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Error processing document for trial balance:", e);
        }
      }
      
      // Calculate balances and group by category
      const categorizedAccounts = {};
      let totalDebit = 0;
      let totalCredit = 0;
      
      Object.entries(accountMap).forEach(([accountNum, account]) => {
        if (account.debit > 0 || account.credit > 0) {
          // Calculate balance based on account type
          const category = account.category || 'Other';
          if (category === 'Assets' || category === 'Expenses') {
            account.balance = account.debit - account.credit;
          } else {
            account.balance = account.credit - account.debit;
          }
          
          if (!categorizedAccounts[category]) {
            categorizedAccounts[category] = {
              accounts: [],
              totalDebit: 0,
              totalCredit: 0,
              totalBalance: 0
            };
          }
          
          categorizedAccounts[category].accounts.push({
            number: accountNum,
            name: account.name,
            debit: account.debit,
            credit: account.credit,
            balance: account.balance,
            transactionCount: account.transactions.length
          });
          
          categorizedAccounts[category].totalDebit += account.debit;
          categorizedAccounts[category].totalCredit += account.credit;
          categorizedAccounts[category].totalBalance += account.balance;
          
          totalDebit += account.debit;
          totalCredit += account.credit;
        }
      });
      
      // Sort accounts within each category
      Object.values(categorizedAccounts).forEach(category => {
        category.accounts.sort((a, b) => a.number.localeCompare(b.number));
      });
      
      return {
        type: "TRIAL_BALANCE",
        data: {
          categories: categorizedAccounts,
          totals: {
            debit: totalDebit,
            credit: totalCredit,
            difference: Math.abs(totalDebit - totalCredit)
          },
          documentCount: response.items.length,
          generatedAt: new Date().toISOString()
        },
        _meta_actions: []
      };
    } catch (e) {
      console.error("Error generating trial balance:", e);
      return {
        type: "TRIAL_BALANCE_ERROR",
        error: e.message || "Failed to generate trial balance",
        _meta_actions: []
      };
    }
  }],
  
  // Generate Income Statement (Profit & Loss)
  [/\/getIncomeStatement\(\)/, async (match) => {
    try {
      // Fetch all documents
      const response = await openkbs.items({
        action: 'fetchItems',
        itemType: 'document',
        limit: 1000
      });
      
      if (!response.items || response.items.length === 0) {
        return {
          type: "INCOME_STATEMENT",
          message: "No documents found",
          data: {
            revenue: { accounts: [], total: 0 },
            expenses: { accounts: [], total: 0 },
            netIncome: 0
          },
          _meta_actions: []
        };
      }
      
      // Get chart of accounts
      const chart = await getOrCreateChartOfAccounts();
      const accountMap = {};
      
      // Build account map
      const buildAccountMap = (accounts, parentCategory = null) => {
        accounts.forEach(account => {
          accountMap[account.number] = {
            name: account.name,
            category: account.category || parentCategory,
            amount: 0,
            transactions: 0
          };
          if (account.subAccounts && account.subAccounts.length > 0) {
            buildAccountMap(account.subAccounts, account.category);
          }
        });
      };
      buildAccountMap(chart.accounts);
      
      // Process documents
      for (const item of response.items) {
        try {
          const decryptedDoc = await openkbs.decrypt(item.item.document);
          const doc = JSON.parse(decryptedDoc);
          
          if (doc.Accountings) {
            for (const accounting of doc.Accountings) {
              if (accounting.AccountingDetails) {
                for (const detail of accounting.AccountingDetails) {
                  const accountNum = detail.AccountNumber;
                  if (accountMap[accountNum]) {
                    const amount = parseFloat(detail.Amount || 0);
                    const category = accountMap[accountNum].category;
                    
                    // For Revenue: Credit increases, Debit decreases
                    // For Expenses: Debit increases, Credit decreases
                    if (category === 'Revenue') {
                      if (detail.Direction === 'Credit') {
                        accountMap[accountNum].amount += amount;
                      } else {
                        accountMap[accountNum].amount -= amount;
                      }
                    } else if (category === 'Expenses') {
                      if (detail.Direction === 'Debit') {
                        accountMap[accountNum].amount += amount;
                      } else {
                        accountMap[accountNum].amount -= amount;
                      }
                    }
                    accountMap[accountNum].transactions++;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Error processing document:", e);
        }
      }
      
      // Separate revenue and expense accounts
      const revenue = { accounts: [], total: 0 };
      const expenses = { accounts: [], total: 0 };
      
      Object.entries(accountMap).forEach(([number, account]) => {
        if (account.amount !== 0) {
          if (account.category === 'Revenue') {
            revenue.accounts.push({
              number,
              name: account.name,
              amount: account.amount,
              transactions: account.transactions
            });
            revenue.total += account.amount;
          } else if (account.category === 'Expenses') {
            expenses.accounts.push({
              number,
              name: account.name,
              amount: account.amount,
              transactions: account.transactions
            });
            expenses.total += account.amount;
          }
        }
      });
      
      // Sort accounts
      revenue.accounts.sort((a, b) => b.amount - a.amount);
      expenses.accounts.sort((a, b) => b.amount - a.amount);
      
      const netIncome = revenue.total - expenses.total;
      
      return {
        type: "INCOME_STATEMENT",
        data: {
          revenue,
          expenses,
          netIncome,
          profitMargin: revenue.total > 0 ? (netIncome / revenue.total * 100) : 0,
          documentCount: response.items.length,
          generatedAt: new Date().toISOString()
        },
        _meta_actions: []
      };
    } catch (e) {
      console.error("Error generating income statement:", e);
      return {
        type: "INCOME_STATEMENT_ERROR",
        error: e.message || "Failed to generate income statement",
        _meta_actions: []
      };
    }
  }],
  
  // Generate VAT Report
  [/\/getVATReport\(\)/, async (match) => {
    try {
      const response = await openkbs.items({
        action: 'fetchItems',
        itemType: 'document',
        limit: 1000
      });
      
      if (!response.items || response.items.length === 0) {
        return {
          type: "VAT_REPORT",
          message: "No documents found",
          data: {
            inputVAT: 0,
            outputVAT: 0,
            vatPayable: 0,
            documents: []
          },
          _meta_actions: []
        };
      }
      
      let inputVAT = 0;  // VAT on purchases (can be reclaimed)
      let outputVAT = 0; // VAT on sales (must be paid)
      const documents = [];
      
      for (const item of response.items) {
        try {
          const decryptedDoc = await openkbs.decrypt(item.item.document);
          const doc = JSON.parse(decryptedDoc);
          
          const vatAmount = parseFloat(doc.TotalVatAmount || 0);
          if (vatAmount > 0) {
            // Determine if it's input or output VAT based on accounting entries
            let isInput = false;
            let isOutput = false;
            
            if (doc.Accountings) {
              for (const accounting of doc.Accountings) {
                if (accounting.AccountingDetails) {
                  for (const detail of accounting.AccountingDetails) {
                    if (detail.AccountNumber === '2310') { // Input VAT account
                      isInput = true;
                    } else if (detail.AccountNumber === '2320') { // Output VAT account
                      isOutput = true;
                    }
                  }
                }
              }
            }
            
            documents.push({
              documentId: doc.DocumentId,
              number: doc.Number,
              date: doc.Date,
              sender: doc.CompanySender?.Name,
              recipient: doc.CompanyRecipient?.Name,
              totalAmount: parseFloat(doc.TotalAmount || 0),
              vatAmount: vatAmount,
              type: isInput ? 'Input VAT' : (isOutput ? 'Output VAT' : 'Unknown')
            });
            
            if (isInput) {
              inputVAT += vatAmount;
            } else if (isOutput) {
              outputVAT += vatAmount;
            }
          }
        } catch (e) {
          console.error("Error processing document for VAT:", e);
        }
      }
      
      // Sort documents by date
      documents.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const vatPayable = outputVAT - inputVAT;
      
      return {
        type: "VAT_REPORT",
        data: {
          inputVAT,
          outputVAT,
          vatPayable,
          vatRefundable: vatPayable < 0 ? Math.abs(vatPayable) : 0,
          documents,
          summary: {
            totalDocuments: documents.length,
            inputDocuments: documents.filter(d => d.type === 'Input VAT').length,
            outputDocuments: documents.filter(d => d.type === 'Output VAT').length
          },
          generatedAt: new Date().toISOString()
        },
        _meta_actions: []
      };
    } catch (e) {
      console.error("Error generating VAT report:", e);
      return {
        type: "VAT_REPORT_ERROR",
        error: e.message || "Failed to generate VAT report",
        _meta_actions: []
      };
    }
  }],
  
  // Generate Accounts Payable/Receivable Report
  [/\/getAccountsReport\(\)/, async (match) => {
    try {
      const response = await openkbs.items({
        action: 'fetchItems',
        itemType: 'document',
        limit: 1000
      });
      
      if (!response.items || response.items.length === 0) {
        return {
          type: "ACCOUNTS_REPORT",
          message: "No documents found",
          data: {
            payables: [],
            receivables: [],
            totalPayable: 0,
            totalReceivable: 0
          },
          _meta_actions: []
        };
      }
      
      const payables = {};  // What we owe to suppliers
      const receivables = {}; // What customers owe us
      
      for (const item of response.items) {
        try {
          const decryptedDoc = await openkbs.decrypt(item.item.document);
          const doc = JSON.parse(decryptedDoc);
          
          // Check if it's payable or receivable based on accounting entries
          let hasPayable = false;
          let hasReceivable = false;
          
          if (doc.Accountings) {
            for (const accounting of doc.Accountings) {
              if (accounting.AccountingDetails) {
                for (const detail of accounting.AccountingDetails) {
                  if (detail.AccountNumber === '2100') { // Accounts Payable
                    hasPayable = true;
                  } else if (detail.AccountNumber === '1200') { // Accounts Receivable
                    hasReceivable = true;
                  }
                }
              }
            }
          }
          
          const amount = parseFloat(doc.TotalAmount || 0);
          const daysOld = Math.floor((new Date() - new Date(doc.Date)) / (1000 * 60 * 60 * 24));
          
          if (hasPayable) {
            const supplier = doc.CompanySender?.Name || 'Unknown';
            if (!payables[supplier]) {
              payables[supplier] = {
                name: supplier,
                taxId: doc.CompanySender?.TaxID,
                totalAmount: 0,
                documents: []
              };
            }
            payables[supplier].totalAmount += amount;
            payables[supplier].documents.push({
              documentId: doc.DocumentId,
              number: doc.Number,
              date: doc.Date,
              amount: amount,
              daysOld: daysOld,
              aging: daysOld <= 30 ? 'Current' : daysOld <= 60 ? '31-60 days' : daysOld <= 90 ? '61-90 days' : 'Over 90 days'
            });
          }
          
          if (hasReceivable) {
            const customer = doc.CompanyRecipient?.Name || 'Unknown';
            if (!receivables[customer]) {
              receivables[customer] = {
                name: customer,
                taxId: doc.CompanyRecipient?.TaxID,
                totalAmount: 0,
                documents: []
              };
            }
            receivables[customer].totalAmount += amount;
            receivables[customer].documents.push({
              documentId: doc.DocumentId,
              number: doc.Number,
              date: doc.Date,
              amount: amount,
              daysOld: daysOld,
              aging: daysOld <= 30 ? 'Current' : daysOld <= 60 ? '31-60 days' : daysOld <= 90 ? '61-90 days' : 'Over 90 days'
            });
          }
        } catch (e) {
          console.error("Error processing document:", e);
        }
      }
      
      // Convert to arrays and calculate totals
      const payablesList = Object.values(payables);
      const receivablesList = Object.values(receivables);
      
      const totalPayable = payablesList.reduce((sum, p) => sum + p.totalAmount, 0);
      const totalReceivable = receivablesList.reduce((sum, r) => sum + r.totalAmount, 0);
      
      // Calculate aging summary
      const calculateAging = (list) => {
        const aging = {
          current: 0,
          days30_60: 0,
          days60_90: 0,
          over90: 0
        };
        list.forEach(company => {
          company.documents.forEach(doc => {
            if (doc.aging === 'Current') aging.current += doc.amount;
            else if (doc.aging === '31-60 days') aging.days30_60 += doc.amount;
            else if (doc.aging === '61-90 days') aging.days60_90 += doc.amount;
            else aging.over90 += doc.amount;
          });
        });
        return aging;
      };
      
      return {
        type: "ACCOUNTS_REPORT",
        data: {
          payables: payablesList,
          receivables: receivablesList,
          totalPayable,
          totalReceivable,
          netPosition: totalReceivable - totalPayable,
          agingSummary: {
            payables: calculateAging(payablesList),
            receivables: calculateAging(receivablesList)
          },
          generatedAt: new Date().toISOString()
        },
        _meta_actions: []
      };
    } catch (e) {
      console.error("Error generating accounts report:", e);
      return {
        type: "ACCOUNTS_REPORT_ERROR",
        error: e.message || "Failed to generate accounts report",
        _meta_actions: []
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
;// CONCATENATED MODULE: ./onResponse.js


const handler = async (event) => {
    const actions = getActions({_meta_actions: ["REQUEST_CHAT_MODEL"]});

    for (let [regex, action] of actions) {
        const lastMessage = event.payload.messages[event.payload.messages.length - 1].content;        
        const match = lastMessage?.match(regex);        
        if (match) return await action(match);            
    }

    return { type: 'CONTINUE' }
};
module.exports = __webpack_exports__;
/******/ })()
;