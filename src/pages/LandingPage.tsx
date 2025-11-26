import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { SignInButton } from "@clerk/clerk-react";

import SecurityIcon from '@mui/icons-material/Security';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

const LandingPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0B1120 70%)',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            background: 'rgba(30, 41, 59, 0.7)',
          }}
        >

          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <SecurityIcon sx={{ fontSize: 40, color: '#818CF8' }} />
          </Box>

          <Typography variant="h4" component="h1" gutterBottom fontWeight="700">
            Data Room
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Secure document storage for enterprise. <br />
            Please authenticate to access the vault.
          </Typography>

          <SignInButton mode="modal">
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CloudSyncIcon />}
              sx={{ 
                background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)',
                boxShadow: '0 3px 5px 2px rgba(79, 70, 229, .3)',
              }}
            >
              Access Dashboard
            </Button>
          </SignInButton>

        </Paper>
      </Container>
    </Box>
  );
}

export default LandingPage;
