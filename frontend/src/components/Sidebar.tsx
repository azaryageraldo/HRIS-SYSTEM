import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  People,
  Business,
  Settings,
  AttachMoney,
  EventNote,
  LocationOn,
  Assignment,
  AccountBalance,
  CalendarToday,
  Receipt,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 260;

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  roles?: number[]; // Role IDs that can access this menu
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Menu configuration based on roles
  const menuItems: MenuItem[] = [
    // Dashboard - role specific
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      path: user?.peran_id === 1 ? '/admin/dashboard' : 
            user?.peran_id === 2 ? '/hr/dashboard' :
            user?.peran_id === 3 ? '/finance/dashboard' :
            '/employee/dashboard',
      roles: [1, 2, 3, 4] // All roles
    },
    // Admin menus (role_id: 1)
    {
      title: 'Manajemen Divisi',
      icon: <Business />,
      path: '/admin/divisi',
      roles: [1]
    },
    {
      title: 'Konfigurasi',
      icon: <Settings />,
      roles: [1],
      children: [
        { title: 'Gaji', icon: <AttachMoney />, path: '/admin/salary-config' },
        { title: 'Cuti', icon: <EventNote />, path: '/admin/config/leave' },
        { title: 'Presensi', icon: <LocationOn />, path: '/admin/config/attendance' }
      ]
    },
    {
      title: 'Manajemen User',
      icon: <People />,
      path: '/admin/users',
      roles: [1]
    },
    // HR menus (role_id: 2)
    {
      title: 'Monitoring Presensi',
      icon: <LocationOn />,
      path: '/hr/presensi',
      roles: [2]
    },
    {
      title: 'Izin & Cuti',
      icon: <EventNote />,
      path: '/hr/cuti',
      roles: [2]
    },
    {
      title: 'Draft Gaji',
      icon: <Assignment />,
      path: '/hr/payroll',
      roles: [2]
    },
    // Finance menus (role_id: 3)
    {
      title: 'Pembayaran Gaji',
      icon: <AccountBalance />,
      path: '/finance/payment',
      roles: [3]
    },
    {
      title: 'Laporan Keuangan',
      icon: <Receipt />,
      path: '/finance/reports',
      roles: [3]
    },
    // Employee menus (role_id: 4)
    {
      title: 'Presensi Saya',
      icon: <CalendarToday />,
      path: '/employee/attendance',
      roles: [4]
    },
    {
      title: 'Pengajuan Cuti',
      icon: <EventNote />,
      path: '/employee/leave',
      roles: [4]
    },
    {
      title: 'Slip Gaji',
      icon: <Receipt />,
      path: '/employee/salary',
      roles: [4]
    }
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpanded(item.title);
    } else if (item.path) {
      navigate(item.path);
      if (isMobile) {
        onClose();
      }
    }
  };

  const toggleExpanded = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const canAccessMenu = (item: MenuItem) => {
    if (!item.roles || !user) return false;
    return item.roles.includes(user.peran_id);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredMenus = menuItems.filter(canAccessMenu);

  const drawerContent = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#fafafa',
        borderRight: '1px solid #e0e0e0'
      }}
    >
      {/* Logo/Brand */}
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #424242 0%, #1a1a1a 100%)',
          color: 'white',
          minHeight: 64,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #616161 0%, #424242 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            <Business sx={{ fontSize: 24, color: '#e0e0e0' }} />
          </Box>
          <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: '-0.5px' }}>
            HRIS System
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* User Info */}
      <Box 
        sx={{ 
          p: 2.5, 
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: '#424242',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          >
            {user ? getInitials(user.nama_lengkap) : 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle2" 
              fontWeight="700"
              sx={{ 
                color: '#1a1a1a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {user?.nama_lengkap}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#757575',
                display: 'block',
                fontSize: '0.75rem'
              }}
            >
              {user?.peran}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* Menu Items */}
      <List sx={{ flex: 1, overflow: 'auto', py: 1.5, px: 1.5 }}>
        {filteredMenus.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 1.5,
                  py: 1.2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #424242 0%, #2d2d2d 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600
                    }
                  },
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: '#616161' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                />
                {item.children && (
                  expandedMenus.includes(item.title) ? 
                    <ExpandLess sx={{ fontSize: 20 }} /> : 
                    <ExpandMore sx={{ fontSize: 20 }} />
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {item.children && (
              <Collapse in={expandedMenus.includes(item.title)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.title} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleMenuClick(child)}
                        selected={isActive(child.path)}
                        sx={{
                          pl: 4,
                          borderRadius: 1.5,
                          py: 1,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            bgcolor: '#e0e0e0',
                            color: '#1a1a1a',
                            '&:hover': {
                              bgcolor: '#d5d5d5',
                            },
                            '& .MuiListItemIcon-root': {
                              color: '#424242'
                            },
                            '& .MuiListItemText-primary': {
                              fontWeight: 600
                            }
                          },
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36, color: '#757575' }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={child.title}
                          primaryTypographyProps={{
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* Footer */}
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          bgcolor: 'white',
          borderTop: '1px solid #e0e0e0'
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#9e9e9e',
            fontWeight: 500,
            fontSize: '0.7rem'
          }}
        >
          HRIS v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop Drawer */
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 'none'
            }
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
