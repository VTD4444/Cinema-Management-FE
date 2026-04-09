import React from 'react';
import { cn } from '../../utils/mergeClass';

export const ResponsivePageContainer = ({ className, children }) => {
  return <div className={cn('page-container page-gutter', className)}>{children}</div>;
};

