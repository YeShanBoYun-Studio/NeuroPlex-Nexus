import { ReactNode } from 'react';
import { TranslationKey } from '../../types/translations';

export interface NavigationItem {
  path: string;
  labelKey: TranslationKey;
  icon?: ReactNode;
}

export interface NavigationProps {
  onItemClick?: () => void;
}
