const getDefaultChartOfAccounts = () => {
  return {
    accounts: [
      { number: "1000", name: "Cash", category: "Assets", subAccounts: [] },
      { number: "1100", name: "Bank Accounts", category: "Assets", subAccounts: [] },
      { number: "1200", name: "Accounts Receivable", category: "Assets", subAccounts: [] },
      { number: "1500", name: "Fixed Assets", category: "Assets", subAccounts: [] },
      
      { number: "2100", name: "Accounts Payable", category: "Liabilities", subAccounts: [] },
      { number: "2300", name: "VAT Payable", category: "Liabilities", subAccounts: [] },
      { number: "2310", name: "Input VAT", category: "Liabilities", subAccounts: [] },
      { number: "2320", name: "Output VAT", category: "Liabilities", subAccounts: [] },
      { number: "2500", name: "Loans", category: "Liabilities", subAccounts: [] },
      
      { number: "3000", name: "Capital", category: "Equity", subAccounts: [] },
      { number: "3100", name: "Retained Earnings", category: "Equity", subAccounts: [] },
      
      { number: "4000", name: "Sales", category: "Revenue", subAccounts: [] },
      { number: "4100", name: "Services", category: "Revenue", subAccounts: [] },
      
      { number: "5000", name: "Purchases", category: "Expenses", subAccounts: [] },
      { number: "5100", name: "Operating Expenses", category: "Expenses", subAccounts: [] },
      { number: "5200", name: "Personnel Expenses", category: "Expenses", subAccounts: [] },
      { number: "5900", name: "Other Expenses", category: "Expenses", subAccounts: [] }
    ]
  };
};

const getOrCreateChartOfAccounts = async () => {
  const response = await openkbs.items({
    action: 'fetchItems',
    field: 'itemId',
    from: 'chartOfAccounts',
    limit: 1
  });
  
  const chartItems = response.items?.filter(item => 
    item.meta?.itemType === 'chartOfAccounts'
  ) || [];
  
  if (chartItems.length > 0) {
    const encryptedChart = chartItems[0].item.chart;
    const decryptedChart = await openkbs.decrypt(encryptedChart);
    const parsedChart = JSON.parse(decryptedChart);
    return parsedChart;
  } else {
    const defaultChart = getDefaultChartOfAccounts();
    
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
};

const addAccountToChart = (accounts, parentNumber, newAccount) => {
  for (let account of accounts) {
    if (account.number === parentNumber) {
      if (!account.subAccounts) account.subAccounts = [];
      account.subAccounts.push(newAccount);
      return true;
    }
    if (account.subAccounts && account.subAccounts.length > 0) {
      if (addAccountToChart(account.subAccounts, parentNumber, newAccount)) {
        return true;
      }
    }
  }
  return false;
};

const saveChartOfAccounts = async (chart) => {
  const encryptedChart = await openkbs.encrypt(JSON.stringify(chart));
  
  const existing = await openkbs.items({
    action: 'fetchItems',
    field: 'itemId',
    from: 'chartOfAccounts',
    limit: 1
  });
  
  const existingCharts = existing.items?.filter(item => 
    item.meta?.itemType === 'chartOfAccounts'
  ) || [];
  
  if (existingCharts.length > 0) {
    await openkbs.items({
      action: 'deleteItem',
      itemType: 'chartOfAccounts',
      itemId: 'chartOfAccounts'
    });
  }
  
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
  
  return true;
};

const saveDocument = async (document, suggestedAccounts, meta) => {
  if (!document.DocumentId) {
    throw new Error("Document must have a DocumentId field");
  }

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
    _meta_actions: []
  };
};

export const getActions = (meta) => [
  [/\{\s*"type"\s*:\s*"SAVE_DOCUMENT_REQUEST"[\s\S]*\}/, async (match) => {
    const requestData = openkbs.parseJSONFromText(match[0]);
    const document = requestData.document;
    const suggestedAccounts = requestData.suggestedAccounts;
    
    if (!document) {
      throw new Error("No document data provided");
    }
    
    return await saveDocument(document, suggestedAccounts, meta);
  }],
  
  [/\/addAccount\(([^)]+)\)/, async (match) => {
    const params = JSON.parse(match[1]);
    const { parentNumber, number, name, category } = params;
    
    if (!number || !name) {
      return {
        type: "ADD_ACCOUNT_FAILED",
        error: "Account number and name are required",
        _meta_actions: []
      };
    }
    
    const chart = await getOrCreateChartOfAccounts();
    
    const newAccount = {
      number,
      name,
      category: category || "Expenses",
      subAccounts: []
    };
    
    let added = false;
    if (parentNumber) {
      added = addAccountToChart(chart.accounts, parentNumber, newAccount);
    } else {
      chart.accounts.push(newAccount);
      added = true;
    }
    
    if (added) {
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
  }],
  
  [/\/getChartOfAccounts\(\)/, async (match) => {
    const chart = await getOrCreateChartOfAccounts();
    
    return {
      type: "CHART_OF_ACCOUNTS",
      data: chart,
      ...meta
    };
  }],
  
  [/\/listDocuments\(\)/, async (match) => {
    const response = await openkbs.items({
      action: 'fetchItems',
      limit: 1000
    });
    
    const documentItems = response.items?.filter(item => 
      item.meta?.itemType === 'document'
    ) || [];
    
    if (documentItems.length === 0) {
      return {
        type: "DOCUMENTS_LIST",
        message: "No documents found",
        data: [],
        _meta_actions: []
      };
    }
    
    const data = await Promise.all(documentItems.map(async (item) => {
      const decryptedDoc = await openkbs.decrypt(item.item.document);
      const parsedDoc = JSON.parse(decryptedDoc);
      
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
    }));
    
    return {
      type: "DOCUMENTS_LIST",
      data,
      count: data.length,
      _meta_actions: []
    };
  }],
  
  [/\/getTrialBalance\(\)/, async (match) => {
    const response = await openkbs.items({
      action: 'fetchItems',
      limit: 1000
    });
    
    const documentItems = response.items?.filter(item => 
      item.meta?.itemType === 'document'
    ) || [];
    
    if (documentItems.length === 0) {
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
    
    const chart = await getOrCreateChartOfAccounts();
    const accountMap = {};
    
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
    
    for (const item of documentItems) {
      const decryptedDoc = await openkbs.decrypt(item.item.document);
      const doc = JSON.parse(decryptedDoc);
      
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
    }
    
    const categorizedAccounts = {};
    let totalDebit = 0;
    let totalCredit = 0;
    
    Object.entries(accountMap).forEach(([accountNum, account]) => {
      if (account.debit > 0 || account.credit > 0) {
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
        documentCount: documentItems.length,
        generatedAt: new Date().toISOString()
      },
      _meta_actions: []
    };
  }],
  
  [/\/getIncomeStatement\(\)/, async (match) => {
    const response = await openkbs.items({
      action: 'fetchItems',
      limit: 1000
    });
    
    const documentItems = response.items?.filter(item => 
      item.meta?.itemType === 'document'
    ) || [];
    
    if (documentItems.length === 0) {
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
    
    const chart = await getOrCreateChartOfAccounts();
    const accountMap = {};
    
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
    
    for (const item of documentItems) {
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
    }
    
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
        documentCount: documentItems.length,
        generatedAt: new Date().toISOString()
      },
      _meta_actions: []
    };
  }],
  
  [/\/getVATReport\(\)/, async (match) => {
    const response = await openkbs.items({
      action: 'fetchItems',
      limit: 1000
    });
    
    const documentItems = response.items?.filter(item => 
      item.meta?.itemType === 'document'
    ) || [];
    
    if (documentItems.length === 0) {
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
    
    let inputVAT = 0;
    let outputVAT = 0;
    const documents = [];
    
    for (const item of documentItems) {
      const decryptedDoc = await openkbs.decrypt(item.item.document);
      const doc = JSON.parse(decryptedDoc);
      
      const vatAmount = parseFloat(doc.TotalVatAmount || 0);
      if (vatAmount > 0) {
        let isInput = false;
        let isOutput = false;
        
        if (doc.Accountings) {
          for (const accounting of doc.Accountings) {
            if (accounting.AccountingDetails) {
              for (const detail of accounting.AccountingDetails) {
                if (detail.AccountNumber === '2310') {
                  isInput = true;
                } else if (detail.AccountNumber === '2320') {
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
    }
    
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
  }],
  
  [/\/getAccountsReport\(\)/, async (match) => {
    const response = await openkbs.items({
      action: 'fetchItems',
      limit: 1000
    });
    
    const documentItems = response.items?.filter(item => 
      item.meta?.itemType === 'document'
    ) || [];
    
    if (documentItems.length === 0) {
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
    
    const payables = {};
    const receivables = {};
    
    for (const item of documentItems) {
      const decryptedDoc = await openkbs.decrypt(item.item.document);
      const doc = JSON.parse(decryptedDoc);
      
      let hasPayable = false;
      let hasReceivable = false;
      
      if (doc.Accountings) {
        for (const accounting of doc.Accountings) {
          if (accounting.AccountingDetails) {
            for (const detail of accounting.AccountingDetails) {
              if (detail.AccountNumber === '2100') {
                hasPayable = true;
              } else if (detail.AccountNumber === '1200') {
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
    }
    
    const payablesList = Object.values(payables);
    const receivablesList = Object.values(receivables);
    
    const totalPayable = payablesList.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalReceivable = receivablesList.reduce((sum, r) => sum + r.totalAmount, 0);
    
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
  }],
  
  [/\[[\s\S]*?"image_url"[\s\S]*?\]/, async (match) => {
    const uploadContent = JSON.parse(match[0]);
    
    const imageUrls = [];
    for (const item of uploadContent) {
      if (item.type === "image_url" && item.image_url?.url) {
        imageUrls.push(item.image_url.url);
      }
    }
    
    if (imageUrls.length === 0) {
      throw new Error("No image URLs found in upload");
    }
    
    const ocrResults = [];
    for (const imageUrl of imageUrls) {
      const ocr = await openkbs.imageToText(imageUrl);
      ocrResults.push({
        imageUrl: imageUrl,
        text: ocr?.results || ""
      });
    }
    
    return {
      data: {
        invoiceTexts: ocrResults,
        imageUrls: imageUrls
      },
      message: `OCR completed for ${imageUrls.length} image(s)`,
      ...meta
    };
  }],

];