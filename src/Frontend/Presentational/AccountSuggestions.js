import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const AccountSuggestions = ({ suggestions = [], onAddAccount, RequestChatAPI, messages, kbUserData, generateMsgId }) => {
  const [expanded, setExpanded] = useState(true);
  const [addedAccounts, setAddedAccounts] = useState(new Set());
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const handleAddAccount = async (account) => {
    setLoading(prev => ({ ...prev, [account.number]: true }));
    setError(null);
    
    try {
      // Send request to add account via chat API
      const addAccountMessage = {
        role: 'user',
        content: `/addAccount(${JSON.stringify({
          parentNumber: account.parentNumber,
          number: account.number,
          name: account.name,
          category: account.category || "Expenses"
        })})`,
        userId: kbUserData().chatUsername,
        msgId: generateMsgId()
      };

      await RequestChatAPI([...messages, addAccountMessage]);
      
      // Mark as added
      setAddedAccounts(prev => new Set([...prev, account.number]));
      
      // Callback to parent if provided
      if (onAddAccount) {
        onAddAccount(account);
      }
    } catch (e) {
      console.error("Error adding account:", e);
      setError(`Failed to add account ${account.number}: ${e.message}`);
    } finally {
      setLoading(prev => {
        const newLoading = { ...prev };
        delete newLoading[account.number];
        return newLoading;
      });
    }
  };

  return (
    <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <AddCircleOutlineIcon color="primary" />
            <Typography variant="h6" component="div">
              Suggested New Accounts
            </Typography>
            <Chip 
              label={`${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These accounts are suggested based on the invoice items. Click to add them to your chart of accounts.
            </Typography>
            
            {suggestions.map((account) => (
              <Box
                key={account.number}
                sx={{
                  mb: 1.5,
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: addedAccounts.has(account.number) ? 'success.main' : 'divider',
                  transition: 'all 0.3s'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {account.number} - {account.name}
                      </Typography>
                      {account.parentNumber && (
                        <Chip 
                          label={`Under ${account.parentNumber}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {account.reason}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant={addedAccounts.has(account.number) ? "outlined" : "contained"}
                    color={addedAccounts.has(account.number) ? "success" : "primary"}
                    size="small"
                    onClick={() => handleAddAccount(account)}
                    disabled={addedAccounts.has(account.number) || loading[account.number]}
                    startIcon={
                      loading[account.number] ? (
                        <CircularProgress size={16} />
                      ) : addedAccounts.has(account.number) ? (
                        <CheckCircleIcon />
                      ) : (
                        <AddCircleOutlineIcon />
                      )
                    }
                    sx={{ minWidth: 100 }}
                  >
                    {addedAccounts.has(account.number) ? "Added" : "Add"}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};