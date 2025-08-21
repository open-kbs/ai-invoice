import React, { useEffect, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import { DocumentEditor } from "./DocumentEditor";
import { AccountSuggestions } from "./AccountSuggestions";
import { DocumentsList } from "./DocumentsList";
import { TrialBalance } from "./TrialBalance";
import { IncomeStatement } from "./IncomeStatement";
import { VATReport } from "./VATReport";
import { AccountsReport } from "./AccountsReport";

const isMobile = window.openkbs.isMobile;

export function getQueryParamValue(paramName) {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(paramName);
}

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
      // Look for JSON pattern in content - handle both single objects and code blocks
      let jsonString = content;
      let prefix = "";
      
      // Check for code block with json
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonString = codeBlockMatch[1];
        prefix = content.substring(0, content.indexOf(codeBlockMatch[0])).trim();
      } else {
        // Look for JSON pattern in content
        const jsonMatch = content.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
          prefix = content.substring(0, content.indexOf(jsonMatch[0])).trim();
        }
      }
      
      // Parse the JSON
      const escapedString = escapeNewlines(jsonString);
      const data = JSON.parse(escapedString);
      return { data, prefix };
    } catch (error) {
      console.error("Error extracting JSON from content:", error);
      console.log("Content that failed:", content?.substring(0, 200));
    }
  }
  return null;
};

const onRenderChatMessage = async (params) => {
  const { APIResponseComponent, theme, setBlockingLoading, setSystemAlert, RequestChatAPI,
    kbUserData, generateMsgId, messages, msgIndex } = params;

  const { content, role } = messages[msgIndex];
  

  
  // Continue with the JSON extraction
  const jsonResult = extractJSONFromContent(content);

  if (role === 'user') return; // use default rendering for user messages

  if (jsonResult) {
    const { data, prefix } = jsonResult;
    
    // Debug logging
    console.log("Extracted JSON type:", data?.type);
    console.log("Has data field:", !!data?.data);
    
    // Check if this is a SAVE_DOCUMENT_REQUEST
    if (data.type === 'SAVE_DOCUMENT_REQUEST' && data.document) {
      const document = data.document;
      const suggestedAccounts = data.suggestedAccounts;
      const imageUrl = document.image || data.image;
      const avatarSize = isMobile ? '48px' : '64px';
      
      // Create the save handler for manual saves after editing  
      const handleSave = async (updatedData) => {
        setBlockingLoading(true);
        try {
          // Send a message to the chat about the save request
          await RequestChatAPI([...messages, {
            role: 'user',
            content: JSON.stringify({
              type: "SAVE_DOCUMENT_REQUEST",
              document: updatedData.document
            }),
            userId: kbUserData().chatUsername,
            msgId: generateMsgId()
          }]);
          
          setSystemAlert({
            severity: 'success',
            message: 'Document saved successfully!'
          });
        } catch (e) {
          console.error("Error in save process:", e);
          setSystemAlert({
            severity: 'error',
            message: 'Failed to save document. Please try again.'
          });
        } finally {
          setBlockingLoading(false);
        }
      };

      return [
        imageUrl && (
          <Avatar
            alt="Document Image"
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
        <DocumentEditor 
          documentData={document} 
          onSave={handleSave}
        />,
        suggestedAccounts && suggestedAccounts.length > 0 && (
          <AccountSuggestions 
            suggestions={suggestedAccounts}
            RequestChatAPI={RequestChatAPI}
            messages={messages}
            kbUserData={kbUserData}
            generateMsgId={generateMsgId}
          />
        )
      ];
    }
    
    // Check if this is a DOCUMENTS_LIST response
    if (data.type === 'DOCUMENTS_LIST' && data.data) {
      return [
        prefix && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{prefix}</div>,
        <DocumentsList documents={data.data} />
      ];
    }
    
    // Check if this is a TRIAL_BALANCE response
    if (data.type === 'TRIAL_BALANCE' && data.data) {
      return [
        prefix && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{prefix}</div>,
        <TrialBalance data={data.data} />
      ];
    }
    
    // Check if this is an INCOME_STATEMENT response
    if (data.type === 'INCOME_STATEMENT' && data.data) {
      return [
        prefix && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{prefix}</div>,
        <IncomeStatement data={data.data} />
      ];
    }
    
    // Check if this is a VAT_REPORT response
    if (data.type === 'VAT_REPORT' && data.data) {
      return [
        prefix && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{prefix}</div>,
        <VATReport data={data.data} />
      ];
    }
    
    // Check if this is an ACCOUNTS_REPORT response
    if (data.type === 'ACCOUNTS_REPORT' && data.data) {
      return [
        prefix && <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{prefix}</div>,
        <AccountsReport data={data.data} />
      ];
    }
    
    // Default rendering for any JSON
    return null
  }
  
  // If no JSON was found, return null to let default rendering handle it
  return null;
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