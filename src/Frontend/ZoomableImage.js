import React from 'react';
import { Box } from '@mui/material';

export const ZoomableImage = ({ imageUrl, alt = "Invoice Image" }) => {
  const isMobile = window.openkbs?.isMobile || false;
  
  return (
    <Box
      component="img"
      src={imageUrl}
      alt={alt}
      sx={{ 
        maxWidth: isMobile ? '100%' : '50%',
        height: 'auto',
        display: 'block'
      }}
    />
  );
};