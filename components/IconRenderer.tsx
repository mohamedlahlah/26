
import React from 'react';
import {
  FileText,
  UserCheck,
  AlertCircle,
  Zap,
  Database,
  ShieldCheck,
  Globe,
  HelpCircle,
  Facebook,
  Twitter,
  Linkedin,
  LucideIcon
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  FileText,
  UserCheck,
  AlertCircle,
  Zap,
  Database,
  ShieldCheck,
  Globe,
  HelpCircle,
  Facebook,
  Twitter,
  Linkedin
};

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className, size = 24 }) => {
  const IconComponent = icons[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
};
