import React, { useEffect, useState } from "react";
import Button from '@mui/material/Button';
import Avatar from "@mui/material/Avatar";
import { InvoiceEditor } from "./InvoiceEditor";

const isMobile = window.openkbs.isMobile;

// Use a regular expression to replace newlines only within string values
const escapeNewlines = (jsonString) => jsonString.replace(/"(?:\\.|[^"\\])*"/g, (match) => match.replace(/\n/g, '\\n'));

const extractJSONFromContent = (content) => {
  try {
    // Check if content is already valid JSON
    JSON.parse(content);
    return { data: JSON.parse(content), prefix: "" };
  } catch (e) {
    // Try to extract JSON from text
    try {
      // Look for JSON pattern in content
      const jsonMatch = content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        const jsonString = escapeNewlines(jsonMatch[0]);
        const data = JSON.parse(jsonString);
        let prefix = content.substring(0, content.indexOf(jsonMatch[0])).trim();
        prefix = prefix.replace(/```json\s*$/i, '').replace(/```\s*$/i, '').trim();
        return { data, prefix };
      }
    } catch (error) {
      console.error("Error extracting JSON:", error);
    }
  }
  return null;
};

// Function to convert nested invoice to flat structure
const flattenInvoice = (invoice) => {
  const flatInvoice = {
    // Basic invoice info
    invoiceNumber: invoice.number || '',
    invoiceDate: invoice.date || '',
    invoicePlace: invoice.place || '',
    
    // Seller info
    sellerName: invoice.seller?.name || '',
    sellerAddress: invoice.seller?.address || '',
    sellerTIN: invoice.seller?.TIN || '',
    sellerVAT: invoice.seller?.VAT || '',
    sellerRepresentative: invoice.seller?.representative || '',
    
    // Buyer info
    buyerName: invoice.buyer?.name || '',
    buyerAddress: invoice.buyer?.address || '',
    buyerTIN: invoice.buyer?.TIN || '',
    buyerVAT: invoice.buyer?.VAT || '',
    buyerContact: invoice.buyer?.contact || '',
    buyerClientNumber: invoice.buyer?.client_number || '',
    
    // Summary info
    baseTotal: invoice.summary?.base_total || '0.00',
    vatRate: invoice.summary?.vat_rate || '0.00',
    vatAmount: invoice.summary?.vat_amount || '0.00',
    totalAmount: invoice.summary?.total || '0.00',
    prepaidVoucher: invoice.summary?.prepaid_voucher || '0.00',
    amountDue: invoice.summary?.amount_due || '0.00',
    currency: invoice.summary?.currency || 'USD',
    
    // Payment info
    paymentType: invoice.payment?.type || '',
    paymentBank: invoice.payment?.bank || '',
    paymentIBAN: invoice.payment?.IBAN || '',
    paymentBIC: invoice.payment?.BIC || '',
    
    // System fields
    itemId: invoice.itemId,
    items: invoice.items || []
  };
  
  return flatInvoice;
};

// Function to flatten invoice item
const flattenInvoiceItem = (item, invoiceId) => {
  return {
    itemId: item.itemId,
    invoiceId: invoiceId,
    itemNumber: item.no || 0,
    itemDescription: item.description || '',
    itemUnit: item.unit || '',
    itemQuantity: item.quantity || 0,
    itemUnitPriceExVat: item.unit_price_without_vat || 0,
    itemUnitPriceIncVat: item.unit_price_with_vat || 0,
    itemTotalExVat: item.total_without_vat || 0,
    itemTotalIncVat: item.total_with_vat || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

// Function to save an invoice to the database
const saveInvoice = async (invoice, itemsAPI, KB, setSystemAlert) => {
  try {
    // Generate invoice ID if it doesn't exist
    if (!invoice.itemId) {
      invoice.itemId = "INV-" + Math.floor(Math.random() * 10000);
    }
    
    // Add timestamp
    const timestamp = new Date().getTime();
    invoice.createdAt = invoice.createdAt || timestamp;
    invoice.updatedAt = timestamp;
    
    // Flatten the invoice for storage
    const flatInvoice = flattenInvoice(invoice);
    flatInvoice.createdAt = invoice.createdAt;
    flatInvoice.updatedAt = invoice.updatedAt;
    
    // Save the main invoice record
    await itemsAPI.createItem({
      itemId: invoice.itemId,
      itemType: 'invoice',
      KBData: KB,
      attributes: [
        { attrName: 'invoiceNumber', attrType: 'text1' },
        { attrName: 'invoiceDate', attrType: 'text2' },
        { attrName: 'invoicePlace', attrType: 'text3' },
        { attrName: 'sellerName', attrType: 'text4' },
        { attrName: 'sellerAddress', attrType: 'text5' },
        { attrName: 'sellerTIN', attrType: 'text6' },
        { attrName: 'sellerVAT', attrType: 'text7' },
        { attrName: 'sellerRepresentative', attrType: 'text8' },
        { attrName: 'buyerName', attrType: 'text9' },
        { attrName: 'buyerAddress', attrType: 'keyword8' },
        { attrName: 'buyerTIN', attrType: 'keyword7' },
        { attrName: 'buyerVAT', attrType: 'keyword6' },
        { attrName: 'buyerContact', attrType: 'keyword5' },
        { attrName: 'buyerClientNumber', attrType: 'keyword4' },
        { attrName: 'baseTotal', attrType: 'float1' },
        { attrName: 'vatRate', attrType: 'float2' },
        { attrName: 'vatAmount', attrType: 'float3' },
        { attrName: 'totalAmount', attrType: 'float4' },
        { attrName: 'prepaidVoucher', attrType: 'float5' },
        { attrName: 'amountDue', attrType: 'float6' },
        { attrName: 'currency', attrType: 'keyword1' },
        { attrName: 'paymentType', attrType: 'keyword2' },
        { attrName: 'paymentBank', attrType: 'keyword3' },
        { attrName: 'paymentIBAN', attrType: 'keyword9' },
        { attrName: 'createdAt', attrType: 'integer1' },
        { attrName: 'updatedAt', attrType: 'integer2' }
      ],
      item: flatInvoice
    });
    
    // Save each invoice item
    if (invoice.items && invoice.items.length > 0) {
      for (const item of invoice.items) {
        // Generate item ID if it doesn't exist
        if (!item.itemId) {
          item.itemId = `ITEM-${Math.floor(Math.random() * 10000)}-${timestamp}`;
        }
        
        // Add relation to parent invoice and timestamps
        item.invoiceId = invoice.itemId;
        item.createdAt = item.createdAt || timestamp;
        item.updatedAt = timestamp;
        
        // Flatten the item for storage
        const flatItem = flattenInvoiceItem(item, invoice.itemId);
        flatItem.createdAt = item.createdAt;
        flatItem.updatedAt = item.updatedAt;

        try {
          // Save the invoice item
          await itemsAPI.createItem({
            itemId: item.itemId,
            itemType: 'invoiceItem',
            KBData: KB,
            attributes: [
              { attrName: 'itemNumber', attrType: 'integer5' },
              { attrName: 'itemDescription', attrType: 'text1' },
              { attrName: 'itemUnit', attrType: 'text2' },
              { attrName: 'itemQuantity', attrType: 'float1' },
              { attrName: 'itemUnitPriceExVat', attrType: 'float2' },
              { attrName: 'itemUnitPriceIncVat', attrType: 'float3' },
              { attrName: 'itemTotalExVat', attrType: 'float4' },
              { attrName: 'itemTotalIncVat', attrType: 'float5' },
              { attrName: 'invoiceId', attrType: 'text3' },
              { attrName: 'createdAt', attrType: 'integer3' },
              { attrName: 'updatedAt', attrType: 'integer4' }
            ],
            item: flatItem
          });
        } catch (err) {}

      }
    }

    setSystemAlert({
      severity: 'success',
      message: 'Invoice saved successfully!'
    });
    
    return invoice.itemId;
  } catch (error) {
    console.error("Error saving invoice:", error);
    setSystemAlert({
      severity: 'error',
      message: 'Failed to save invoice. Please try again.'
    });
    throw error;
  }
};


const onRenderChatMessage = async (params) => {
  const { APIResponseComponent, theme, setBlockingLoading, setSystemAlert, RequestChatAPI,
    kbUserData, generateMsgId, messages, msgIndex, itemsAPI, KB } = params;

  const { content, role } = messages[msgIndex];
  
  if (role === 'user') return; // use default rendering for user messages
  
  // Continue with the original JSON extraction
  const jsonResult = extractJSONFromContent(content);

  if (jsonResult) {
    const { data, prefix } = jsonResult;
    
    // Check if this is an invoice data object
    if (data.invoice) {
      const imageUrl = data.image;
      const avatarSize = isMobile ? '48px' : '64px';

      return [
        imageUrl && (
          <Avatar
            alt="Invoice Image"
            src={imageUrl}
            style={{
              marginRight: '10px',
              cursor: 'pointer',
              position: 'absolute',
              left: isMobile ? -54 : -72,
              bottom: 68,
              borderRadius: '50%',
              height: avatarSize,
              width: avatarSize
            }}
            onClick={() => window.open(imageUrl, '_blank')}
          />
        ),
        prefix && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{prefix}</div>,
        <InvoiceEditor 
          invoiceData={data} 
          onSave={async (updatedData) => {
            setBlockingLoading(true);
            try {
              // Save invoice directly to the database
              const invoiceId = await saveInvoice(updatedData.invoice, itemsAPI, KB, setSystemAlert);
              
              // Send a message to the chat about the successful save
              await RequestChatAPI([...messages, {
                role: 'user',
                content: JSON.stringify({
                  type: "SAVE_INVOICE_REQUEST",
                  invoiceId: invoiceId,
                  invoice: updatedData.invoice
                }),
                userId: kbUserData().chatUsername,
                msgId: generateMsgId()
              }]);
            } catch (e) {
              console.error("Error in save process:", e);
            } finally {
              setBlockingLoading(false);
            }
          }}
        />
      ];
    }
    
    // Handle different response types
    if (data.type) {
      switch (data.type) {
        case "SAVE_INVOICE_REQUEST":
          // Just acknowledge the save request
          return renderAPIResponse('Invoice Saved', theme?.palette?.success?.main, data, prefix);
          
        case "SAVE_INVOICE_SUCCESS":
        case "SAVE_INVOICE_FAILED":
        default:
          // Fallback to generic JSON display
          return renderAPIResponse(data.type || 'API Response', null, data, prefix);
      }
    }
    
    // Default rendering for any JSON
    return renderAPIResponse('API Response', null, data, prefix);
  }
  
  // If no JSON was found, return null to let default rendering handle it
  return null;

  function renderAPIResponse(entityName, color, data, prefix = '') {
    return (
      <>
        {prefix && <div style={{ whiteSpace: 'pre-wrap' }}>{prefix}</div>}
        <APIResponseComponent
          entityName={entityName}
          color={color}
          open={true}
          JSONData={data}
        />
      </>
    );
  }
};

const Header = ({ setRenderSettings }) => {
  useEffect(() => {
    setRenderSettings({
      setMessageWidth: () => isMobile ? '95%' : '85%',
      inputLabelsQuickSend: true,
      disableBalanceView: false,
      disableSentLabel: false,
      disableChatAvatar: isMobile,
      disableChatModelsSelect: false,
      disableContextItems: false,
      disableCopyButton: false,
      disableEmojiButton: false,
      disableTextToSpeechButton: false,
      disableMobileLeftButton: false,
    });
  }, [setRenderSettings]);
};

const exports = { onRenderChatMessage, Header };
window.contentRender = exports;
export default exports;