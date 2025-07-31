
import React from 'react';
import { icons } from 'lucide-react';

// This is a dynamic icon component that can render any lucide-react icon.
// The name prop should be a valid key from the lucide-react icons object.
// Example: <Icon name="Coffee" />

interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number | string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, color, size, className }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // Fallback icon or null
    return null;
  }

  return <LucideIcon color={color} size={size} className={className} />;
};
