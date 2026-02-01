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
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  NotificationsOutlined,
  PersonOutline,
  Logout,
  SettingsOutlined,
  Search,
  KeyboardArrowDown
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
        bgcolor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        ...(isMobile ? {} : { ml: '260px', width: 'calc(100% - 260px)' }),
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        {/* Menu Button (Mobile) */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ 
              mr: 2,
              color: '#64748b',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Page Title & Breadcrumbs Simulation */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: '#1e293b',
              letterSpacing: '-0.5px',
              fontSize: '1.1rem'
            }}
          >
            Dashboard
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            Overview & Statistics
          </Typography>
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
          {/* Search Button (Optional) */}
          <Tooltip title="Search">
            <IconButton
              sx={{
                color: '#64748b',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotifOpen}
              sx={{
                color: '#64748b',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    boxShadow: '0 0 0 2px white'
                  }
                }}
              >
                <NotificationsOutlined />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', mx: 1, borderColor: '#e2e8f0' }} />

          {/* User Profile */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              py: 0.5,
              px: 1,
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: '#f1f5f9' }
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: 'transparent',
                border: '2px solid #3b82f6',
                p: 0.5
              }}
            >
              <Avatar
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: '#3b82f6',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {user ? getInitials(user.nama_lengkap) : 'U'}
              </Avatar>
            </Avatar>
            
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155', lineHeight: 1.2 }}>
                {user?.nama_lengkap}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', lineHeight: 1 }}>
                {user?.peran}
              </Typography>
            </Box>
            
            <KeyboardArrowDown sx={{ color: '#94a3b8', fontSize: 18 }} />
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 0,
            sx: {
              width: 240,
              mt: 1.5,
              overflow: 'visible',
              filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.1))',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 28,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderTop: '1px solid #e2e8f0',
                borderLeft: '1px solid #e2e8f0',
              },
            }
          }}
        >
          <Box sx={{ px: 3, py: 2 }}>
             <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1e293b' }}>
               User Profile
             </Typography>
             <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
               Manage your account settings and preferences.
             </Typography>
          </Box>
          <Divider sx={{ borderColor: '#f1f5f9' }} />
          <MenuItem onClick={handleProfile} sx={{ py: 1.5, px: 3 }}>
            <ListItemIcon>
              <PersonOutline fontSize="small" sx={{ color: '#64748b' }} />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={500} color="#334155">My Profile</Typography>
          </MenuItem>
          <MenuItem onClick={handleProfileMenuClose} sx={{ py: 1.5, px: 3 }}>
            <ListItemIcon>
              <SettingsOutlined fontSize="small" sx={{ color: '#64748b' }} />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={500} color="#334155">Account Settings</Typography>
          </MenuItem>
          <Divider sx={{ borderColor: '#f1f5f9' }} />
          <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 3, '&:hover': { bgcolor: '#fef2f2' } }}>
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            <Typography variant="body2" fontWeight={600} color="#ef4444">Sign Out</Typography>
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
            elevation: 0,
            sx: {
              width: 360,
              mt: 1.5,
              maxHeight: 480,
              filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.1))',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
            }
          }}
        >
          <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer' }}>
              Mark all as read
            </Typography>
          </Box>
          <Divider sx={{ borderColor: '#f1f5f9' }} />
          <MenuItem onClick={handleNotifClose} sx={{ py: 2, px: 3, whiteSpace: 'normal', alignItems: 'flex-start' }}>
            <Box sx={{ mr: 2, mt: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#3b82f6', borderRadius: '50%' }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="#334155" gutterBottom>
                New leave request from John Doe
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 0.5 }}>
                Requesting annual leave for 3 days starting next Monday.
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                2 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ borderColor: '#f1f5f9' }} />
          <MenuItem onClick={handleNotifClose} sx={{ py: 2, px: 3, whiteSpace: 'normal', alignItems: 'flex-start' }}>
            <Box sx={{ mr: 2, mt: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#3b82f6', borderRadius: '50%' }} />
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="#334155" gutterBottom>
                Payroll draft ready for review
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ mb: 0.5 }}>
                February 2026 payroll calculation has been completed.
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                5 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ borderColor: '#f1f5f9' }} />
          <MenuItem onClick={handleNotifClose} sx={{ py: 1.5, justifyContent: 'center' }}>
            <Typography variant="button" sx={{ fontSize: '0.75rem', color: '#3b82f6', textTransform: 'none' }}>
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
