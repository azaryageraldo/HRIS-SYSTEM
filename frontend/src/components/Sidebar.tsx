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
  Typography,
  Collapse,
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  History as HistoryIcon,
  People,
  Person,
  Business,
  Settings,
  AttachMoney,
  EventNote,
  LocationOn,
  Assignment,
  AccountBalanceWallet,
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
      path: '/hr/gaji',
      roles: [2]
    },
    // Finance menus (role_id: 3)
    {
      title: 'Pembayaran Gaji',
      icon: <AccountBalanceWallet />,
      path: '/finance/salary-payment',
      roles: [3]
    },
    {
      title: 'Riwayat Pembayaran',
      icon: <HistoryIcon />,
      path: '/finance/payment-history',
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
      title: 'Akun & Profil',
      icon: <Person />,
      path: '/employee/profile',
      roles: [4]
    },
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
        bgcolor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
      }}
    >
      {/* Logo/Brand */}
      <Toolbar
        sx={{
          minHeight: 80,
          background: '#ffffff',
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px -1px rgba(15, 23, 42, 0.2)',
            }}
          >
            <Business sx={{ fontSize: 22, color: '#ffffff' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="800" sx={{ letterSpacing: '-0.5px', color: '#0f172a', lineHeight: 1, fontSize: '1.1rem' }}>
              HRIS
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '2.5px', fontSize: '0.65rem' }}>
              SYSTEM
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      {/* Menu Items */}
      <List sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        <Typography 
          variant="caption" 
          sx={{ 
            px: 2, 
            mb: 2, 
            mt: 1,
            display: 'block', 
            color: '#94a3b8', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.5px'
          }}
        >
          Menu Utama
        </Typography>
        {filteredMenus.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 2,
                  minHeight: 48,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-selected': {
                    bgcolor: '#f1f5f9',
                    color: '#0f172a',
                    '&:hover': {
                      bgcolor: '#e2e8f0',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#0f172a'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -2,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '24px',
                      width: '4px',
                      bgcolor: '#0f172a',
                      borderTopRightRadius: '4px',
                      borderBottomRightRadius: '4px',
                      boxShadow: '2px 0 4px rgba(15, 23, 42, 0.1)'
                    }
                  },
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    transform: 'translateX(4px)',
                    color: '#0f172a',
                    '& .MuiListItemIcon-root': {
                      color: '#0f172a'
                    }
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 38, 
                    color: isActive(item.path) ? '#0f172a' : '#94a3b8',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 700 : 500,
                    letterSpacing: '0.2px'
                  }}
                />
                {item.children && (
                  expandedMenus.includes(item.title) ? 
                    <ExpandLess sx={{ fontSize: 18, color: '#94a3b8' }} /> : 
                    <ExpandMore sx={{ fontSize: 18, color: '#94a3b8' }} />
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenu */}
            {item.children && (
              <Collapse in={expandedMenus.includes(item.title)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ mt: -0.5, mb: 1 }}>
                  {item.children.map((child) => (
                    <ListItem key={child.title} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleMenuClick(child)}
                        selected={isActive(child.path)}
                        sx={{
                          pl: 6.5,
                          borderRadius: '8px',
                          py: 1,
                          mx: 1,
                          transition: 'all 0.2s ease',
                          '&.Mui-selected': {
                            color: '#0f172a',
                            bgcolor: 'transparent',
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              color: '#0f172a'
                            }
                          },
                          '&:hover': {
                            color: '#0f172a',
                            bgcolor: '#f1f5f9',
                            '& .dot-indicator': {
                              bgcolor: '#0f172a'
                            }
                          }
                        }}
                      >
                         <Box 
                           className="dot-indicator"
                           sx={{ 
                             width: 6, 
                             height: 6, 
                             borderRadius: '50%', 
                             bgcolor: isActive(child.path) ? '#0f172a' : '#e2e8f0',
                             mr: 2,
                             transition: 'background-color 0.2s ease'
                           }} 
                         />
                        <ListItemText 
                          primary={child.title}
                          primaryTypographyProps={{
                            fontSize: '0.825rem',
                            fontWeight: isActive(child.path) ? 600 : 500,
                            color: isActive(child.path) ? '#0f172a' : '#64748b'
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

      {/* User Info (Bottom) */}
      <Box 
        sx={{ 
          p: 3, 
          bgcolor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '2px solid #ffffff'
            }}
          >
            {user ? getInitials(user.nama_lengkap) : 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#0f172a', lineHeight: 1.2, mb: 0.5 }}>
              {user?.nama_lengkap}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 500 }}>
                {user?.peran}
              </Typography>
              {user?.divisi && (
                <>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#2563eb', 
                      fontWeight: 600,
                      fontSize: '0.7rem', 
                    }}
                  >
                    {user.divisi}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
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
