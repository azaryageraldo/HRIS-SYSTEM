import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleProfileMenuClose();
    navigate('/profile');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        ...(isMobile ? {} : { ml: '260px', width: 'calc(100% - 260px)' })
      }}
    >
      <Toolbar>
        {/* Menu Button (Mobile) */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ 
              mr: 2,
              color: '#424242',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page Title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '-0.5px'
          }}
        >
          Dashboard
        </Typography>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotifOpen}
            aria-label="notifications"
            sx={{
              color: '#616161',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
            <Badge 
              badgeContent={3} 
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#424242',
                  color: 'white'
                }
              }}
            >
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Profile */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ p: 0.5 }}
            aria-label="user profile"
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#424242',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {user ? getInitials(user.nama_lengkap) : 'U'}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 220, mt: 1 }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" color="#1a1a1a">
              {user?.nama_lengkap}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#616161', fontWeight: 600 }}>
              {user?.peran}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Logout</Typography>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, mt: 1, maxHeight: 400 }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Notifications
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2">New leave request from John Doe</Typography>
              <Typography variant="caption" color="text.secondary">
                2 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2">Payroll draft ready for review</Typography>
              <Typography variant="caption" color="text.secondary">
                5 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box>
              <Typography variant="body2">System maintenance scheduled</Typography>
              <Typography variant="caption" color="text.secondary">
                1 day ago
              </Typography>
            </Box>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleNotifClose} sx={{ justifyContent: 'center' }}>
            <Typography variant="caption" color="primary">
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
