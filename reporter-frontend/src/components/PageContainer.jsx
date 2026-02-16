import React from 'react';

export function PageContainer({ children }) {
  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="p-8">
        {children}
      </div>
    </div>
  );
}
