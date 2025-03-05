import { ReactNode } from 'react';
import { TranslationKey } from '../../types/translations';

export interface NavItem {
  path: string;
  label: TranslationKey;
  icon?: ReactNode;
}

export interface LayoutProps {
  navigationItems: NavItem[];
}
