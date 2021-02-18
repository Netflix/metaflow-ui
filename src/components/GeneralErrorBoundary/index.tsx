import React, { Component, ErrorInfo, ReactNode } from 'react';
import { analyticsSendException } from '../../utils/analytics';

interface Props {
  children: ReactNode;
  message: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ hasError: true });
    const warning = `${error.name}: ${error.message}, ${errorInfo.componentStack?.split('\n')[1]}`;
    analyticsSendException(warning, true);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <p>{this.props.message}</p>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
