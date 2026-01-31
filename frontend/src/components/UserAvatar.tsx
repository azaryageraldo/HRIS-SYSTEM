import React from 'react';
import { Avatar, Box } from '@mui/material';

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: 'small' | 'medium' | 'large';
  online?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 'medium',
  online
}) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56
  };

  const avatarSize = sizeMap[size];

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getColorFromName = (fullName: string) => {
    const colors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#4facfe',
      '#43e97b',
      '#fa709a',
      '#fee140',
      '#30cfd0'
    ];
    const index = fullName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Box position="relative" display="inline-block">
      <Avatar
        src={src}
        alt={name}
        sx={{
          width: avatarSize,
          height: avatarSize,
          bgcolor: getColorFromName(name),
          fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.25rem' : '1rem',
          fontWeight: 600
        }}
      >
        {!src && getInitials(name)}
      </Avatar>
      {online !== undefined && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: avatarSize * 0.25,
            height: avatarSize * 0.25,
            borderRadius: '50%',
            bgcolor: online ? 'success.main' : 'grey.400',
            border: '2px solid white'
          }}
        />
      )}
    </Box>
  );
};

export default UserAvatar;
