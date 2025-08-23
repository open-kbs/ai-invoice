import React, { useEffect, useRef } from "react";
import Avatar from "@mui/material/Avatar";
import { DocumentEditor } from "./DocumentEditor";
import { AccountSuggestions } from "./Presentational/AccountSuggestions";
import { DocumentsList } from "./Presentational/DocumentsList";
import { TrialBalance } from "./Presentational/TrialBalance";
import { IncomeStatement } from "./Presentational/IncomeStatement";
import { VATReport } from "./Presentational/VATReport";
import { AccountsReport } from "./Presentational/AccountsReport";
import { ChartOfAccounts } from "./Presentational/ChartOfAccounts";
import { InvoiceImage } from "./Presentational/InvoiceImage";

const isMobile = window.openkbs.isMobile;

export function getQueryParamValue(paramName) {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(paramName);
}

const extractJSONFromContent = (text) => {
  let braceCount = 0, startIndex = text.indexOf('{');
  if (startIndex === -1) return null;

  for (let i = startIndex; i < text.length; i++) {
    if (text[i] === '{') braceCount++;
    if (text[i] === '}' && --braceCount === 0) {
      try {
        return JSON.parse(text.slice(startIndex, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

const onRenderChatMessage = async (params) => {
  const { APIResponseComponent, theme, setBlockingLoading, setSystemAlert, RequestChatAPI,
    kbUserData, generateMsgId, messages, msgIndex } = params;

  const { content, role } = messages[msgIndex];

  // Continue with the JSON extraction
  const jsonResult = extractJSONFromContent(content);

  if (role === 'user' && !jsonResult) return; // use default rendering for user messages

  if (jsonResult) {
    const data = jsonResult;
    // Check if this is an array containing image_url (like OCR upload result)
    if (Array.isArray(data)) {
      const imageItems = data.filter(item => item.type === "image_url" && item.image_url?.url);
      if (imageItems.length > 0) {
        return imageItems.map((imageItem, index) => (
            <InvoiceImage
                key={index}
                imageUrl={imageItem.image_url.url}
                alt={`Uploaded Invoice ${index + 1}`}
            />
        ))
      }
    }

    // Check if this is a SAVE_DOCUMENT_REQUEST
    if (data?.type === 'SAVE_DOCUMENT_REQUEST' && data?.document) {
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
    if (data?.type === 'DOCUMENTS_LIST' && data?.data) {
      return [
        <DocumentsList documents={data?.data} />
      ];
    }

    // Check if this is a TRIAL_BALANCE response
    if (data?.type === 'TRIAL_BALANCE' && data?.data) {
      return [
        <TrialBalance data={data?.data} />
      ];
    }

    // Check if this is an INCOME_STATEMENT response
    if (data?.type === 'INCOME_STATEMENT' && data?.data) {
      return [
        <IncomeStatement data={data.data} />
      ];
    }

    // Check if this is a VAT_REPORT response
    if (data?.type === 'VAT_REPORT' && data?.data) {
      return [
        <VATReport data={data?.data} />
      ];
    }

    // Check if this is an ACCOUNTS_REPORT response
    if (data?.type === 'ACCOUNTS_REPORT' && data?.data) {
      return [
        <AccountsReport data={data.data} />
      ];
    }

    // Check if this is a CHART_OF_ACCOUNTS response
    if (data?.type === 'CHART_OF_ACCOUNTS' && data?.data) {
      return [
        <ChartOfAccounts data={data?.data} />
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