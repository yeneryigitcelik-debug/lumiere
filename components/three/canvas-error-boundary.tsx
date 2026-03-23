"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold-50 to-cream">
            <div className="text-center">
              <span className="block font-serif text-5xl text-gold-200">&#9670;</span>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-charcoal/40">
                3D görüntüleyici yüklenemedi
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
