import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Fade,
  Stack,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person,
  Lock,
  Business
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      
      // Auto-routing based on role
      // This will be executed after login() updates the AuthContext
      // We need to get the user from AuthContext after login
      // For now, we'll navigate to root and let the routing handle it
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96, 96, 96, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-50%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64, 64, 64, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }
      }}
    >
      {/* Left Side - Branding */}
      <Box
        sx={{
          flex: { xs: 0, md: 1 },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 6,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            maxWidth: 500
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Business sx={{ fontSize: 60, color: '#e0e0e0' }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            fontWeight="700"
            sx={{
              color: '#ffffff',
              mb: 2,
              letterSpacing: '-0.5px'
            }}
          >
            HRIS System
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: '#b0b0b0',
              fontWeight: 400,
              mb: 4,
              lineHeight: 1.6
            }}
          >
            Human Resource Information System
          </Typography>

          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', mb: 4 }} />

          <Typography
            variant="body1"
            sx={{
              color: '#909090',
              lineHeight: 1.8
            }}
          >
            Sistem manajemen karyawan IT yang modern, efisien, dan terintegrasi untuk mengelola presensi, cuti, dan penggajian secara otomatis.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="sm">
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, sm: 6 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Mobile Logo */}
              <Box
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 4
                }}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #4a4a4a 0%, #2d2d2d 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Business sx={{ fontSize: 36, color: '#e0e0e0' }} />
                </Box>
                <Typography variant="h5" fontWeight="700" color="text.primary">
                  HRIS System
                </Typography>
              </Box>

              {/* Header */}
              <Box mb={4}>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  sx={{
                    color: '#1a1a1a',
                    mb: 1,
                    letterSpacing: '-0.5px'
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue to your dashboard
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      bgcolor: '#fff5f5',
                      border: '1px solid #ffcdd2'
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Username or Email"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#757575' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fafafa',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#757575',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#424242',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#424242',
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#757575' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: '#757575' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#fafafa',
                        '& fieldset': {
                          borderColor: '#e0e0e0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#757575',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#424242',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#424242',
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={!loading && <LoginIcon />}
                    sx={{
                      py: 1.8,
                      background: 'linear-gradient(135deg, #424242 0%, #1a1a1a 100%)',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&:disabled': {
                        background: '#e0e0e0',
                        color: '#9e9e9e',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#9e9e9e' }} />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <Divider sx={{ my: 4, color: '#e0e0e0' }}>
                <Typography variant="caption" color="text.secondary">
                  Demo Credentials
                </Typography>
              </Divider>

              {/* Footer */}
              <Box textAlign="center">
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#757575',
                    fontFamily: 'monospace',
                    bgcolor: '#fafafa',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    border: '1px dashed #e0e0e0'
                  }}
                >
                  admin@gmail.com / dsadsadsa
                </Typography>
              </Box>
            </Paper>
          </Fade>

          {/* Copyright */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#909090',
              mt: 3
            }}
          >
            © 2026 HRIS System. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
