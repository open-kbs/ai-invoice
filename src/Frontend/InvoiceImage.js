import React from 'react';

export const InvoiceImage = ({ imageUrl, alt = "Invoice Image" }) => {
  const isMobile = window.openkbs?.isMobile || false;
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{ 
        maxWidth: isMobile ? '100%' : '50%',
        height: 'auto',
        display: 'block',
        marginBottom: '16px'
      }}
    />
  );
};