import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface BreadcrumbsProps {
  links?: { label: string; href?: string }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ links }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbLinks = links || pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = value.charAt(0).toUpperCase() + value.slice(1);

    return {
      label,
      href: last ? undefined : to
    };
  });

  return (
    <Box sx={{ mb: 3 }}>
      <MuiBreadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' } }}
      >
        <Link
          component={RouterLink}
          to="/admin/dashboard"
          color="inherit"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          Home
        </Link>
        {breadcrumbLinks.map((link, index) => {
          const isLast = index === breadcrumbLinks.length - 1;
          
          return isLast ? (
            <Typography key={link.label} color="text.primary" fontWeight={600}>
              {link.label}
            </Typography>
          ) : (
            <Link
              key={link.label}
              component={RouterLink}
              to={link.href || '#'}
              color="inherit"
              sx={{ 
                textDecoration: 'none',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
