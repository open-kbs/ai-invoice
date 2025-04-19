import React, { useEffect } from "react";
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

const onRenderChatMessage = async (params) => {
  const { APIResponseComponent, theme, setBlockingLoading, setSystemAlert, RequestChatAPI,
    kbUserData, generateMsgId, messages, msgIndex } = params;

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
            await RequestChatAPI([...messages, {
              role: 'user',
              content: JSON.stringify({
                type: "SAVE_INVOICE_REQUEST",
                ...updatedData
              }),
              userId: kbUserData().chatUsername,
              msgId: generateMsgId()
            }]);
          }}
        />
      ];
    }
    
    // Handle different response types
    if (data.type) {
      switch (data.type) {
        case "SAVE_INVOICE_REQUEST":
          return renderAPIResponse('Save Invoice Request', null, data, prefix);
        case "SAVE_INVOICE_SUCCESS":
          return renderAPIResponse('Invoice Saved', theme?.palette?.success?.main, data, prefix);
        case "SAVE_INVOICE_FAILED":
          return renderAPIResponse('Invoice Save Failed', theme?.palette?.error?.main, data, prefix);
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