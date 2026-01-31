import React from 'react';
import { Card, CardContent, Box, Typography, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  gradient?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  size?: 'normal' | 'large';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  gradient,
  trend,
  loading = false,
  size = 'normal'
}) => {
  const gradientMap: Record<string, string> = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
    warning: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
    error: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    info: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
  };

  const selectedGradient = gradient || gradientMap[color];
  const minHeight = size === 'large' ? 160 : 140;

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          height: '100%',
          minHeight,
          border: '1px solid #e0e0e0',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress size={40} />
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        minHeight,
        background: selectedGradient,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
          pointerEvents: 'none'
        }
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', p: 3 }}>
        {/* Icon */}
        <Box
          sx={{
            display: 'inline-flex',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            mb: 2
          }}
        >
          <Box sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 500,
            mb: 1,
            fontSize: '0.875rem',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>

        {/* Value */}
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 700,
            mb: trend ? 1 : 0,
            fontSize: size === 'large' ? '2.5rem' : '2rem',
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>

        {/* Trend Indicator */}
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 'auto'
            }}
          >
            {trend.isPositive ? (
              <TrendingUp sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% dari bulan lalu
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
