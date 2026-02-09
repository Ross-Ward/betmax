"use client"

import React from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    onReset?: () => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-destructive">Something went wrong</CardTitle>
                        </div>
                        <CardDescription>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={this.handleReset}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )
        }

        return this.props.children
    }
}

/**
 * Wrapper component for async data loading with error handling
 */
interface AsyncBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    errorFallback?: React.ReactNode
    onError?: (error: Error) => void
}

export function AsyncBoundary({ children, fallback, errorFallback, onError }: AsyncBoundaryProps) {
    return (
        <ErrorBoundary
            fallback={errorFallback}
            onReset={() => window.location.reload()}
        >
            <React.Suspense fallback={fallback || <LoadingFallback />}>
                {children}
            </React.Suspense>
        </ErrorBoundary>
    )
}

/**
 * Default loading fallback
 */
function LoadingFallback() {
    return (
        <Card className="animate-pulse">
            <CardHeader>
                <div className="h-6 w-1/3 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-5/6 bg-muted rounded" />
                    <div className="h-4 w-4/6 bg-muted rounded" />
                </div>
            </CardContent>
        </Card>
    )
}
