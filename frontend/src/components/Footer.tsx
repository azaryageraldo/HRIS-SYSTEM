import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4
          }}
        >
          {/* Company Info */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              HRIS System
            </Typography>
            <Typography variant="body2" color="grey.400" paragraph>
              Human Resource Information System untuk mengelola karyawan IT dengan efisien dan modern.
            </Typography>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="grey.400" underline="hover">
                About Us
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Features
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Privacy Policy
              </Link>
              <Link href="#" color="grey.400" underline="hover">
                Terms of Service
              </Link>
            </Box>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" sx={{ color: 'grey.400' }} />
                <Typography variant="body2" color="grey.400">
                  info@hris-system.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" sx={{ color: 'grey.400' }} />
                <Typography variant="body2" color="grey.400">
                  +62 123 4567 890
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" sx={{ color: 'grey.400' }} />
                <Typography variant="body2" color="grey.400">
                  Jakarta, Indonesia
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3, bgcolor: 'grey.800' }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="grey.500">
            © {currentYear} HRIS System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
