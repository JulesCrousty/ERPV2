"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Button } from "@/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error("API render error", error);
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            <span>{this.state.message || "Unable to load data"}</span>
            <Button variant="secondary" size="sm" onClick={this.reset}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
