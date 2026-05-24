'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6 border border-red-500/20 bg-red-500/5 rounded-xl">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4 animate-bounce">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">Something went wrong</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            The application encountered an unexpected runtime crash. Please try reloading the page.
          </p>
          <Button
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
          >
            Reset Application
          </Button>
        </div>
      );
    }

    return this.props.children || null;
  }
}
export default ErrorBoundary;
