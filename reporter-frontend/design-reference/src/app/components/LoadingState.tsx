import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="size-10 text-blue-600 animate-spin mb-4" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
}
