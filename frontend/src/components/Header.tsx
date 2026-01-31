import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  showLoginButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showLoginButton = true }) => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: 1
            }}
          >
            HRIS System
          </Typography>

          {/* Navigation */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {showLoginButton && (
              <Button
                color="inherit"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
