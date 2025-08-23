import React from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Typography } from '@mui/material';

export const InvoiceImage = ({ imageUrl, alt = "Invoice Image" }) => {
  const isMobile = window.openkbs?.isMobile || false;
  
  const isPDF = imageUrl && imageUrl.toLowerCase().includes('.pdf');
  
  if (isPDF) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          cursor: 'pointer',
          marginBottom: '16px'
        }}
        onClick={() => window.open(imageUrl, '_blank')}
      >
        <PictureAsPdfIcon sx={{ fontSize: 48 }} />
        <Typography variant="body1" sx={{ color: '#1976d2', textDecoration: 'underline' }}>
          Open PDF Document
        </Typography>
      </Box>
    );
  }
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      style={{ 
        maxWidth: isMobile ? '100%' : '50%',
        height: 'auto',
        display: 'block',
        marginBottom: '16px',
        cursor: 'pointer'
      }}
      onClick={() => window.open(imageUrl, '_blank')}
    />
  );
};