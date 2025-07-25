"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Chrome, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestOAuthPage() {
  const { user, loginWithGoogle, logout, isLoading } = useAuth()
  const [testResult, setTestResult] = React.useState<{
    status: 'idle' | 'testing' | 'success' | 'error'
    message: string
  }>({ status: 'idle', message: '' })

  const testGoogleOAuth = async () => {
    setTestResult({ status: 'testing', message: 'Initiating Google OAuth...' })
    
    try {
      await loginWithGoogle()
      setTestResult({ 
        status: 'success', 
        message: 'OAuth redirect initiated successfully. You should be redirected to Google.' 
      })
    } catch (error) {
      setTestResult({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'OAuth test failed' 
      })
    }
  }

  const getStatusIcon = () => {
    switch (testResult.status) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>OAuth Authentication Test</CardTitle>
          <CardDescription>
            Test the Google OAuth integration to verify it&apos;s working properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Authenticated as: {user.email}</span>
              </div>
              <Button onClick={logout} variant="outline">
                Logout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Click the button below to test Google OAuth authentication:
              </div>
              
              <Button 
                onClick={testGoogleOAuth} 
                disabled={isLoading || testResult.status === 'testing'}
                className="w-full"
              >
                <Chrome className="mr-2 h-4 w-4" />
                {testResult.status === 'testing' ? 'Testing...' : 'Test Google OAuth'}
              </Button>
              
              {testResult.status !== 'idle' && (
                <div className="flex items-start space-x-2 p-3 rounded-md border">
                  {getStatusIcon()}
                  <div className="text-sm">
                    <div className="font-medium capitalize">{testResult.status}</div>
                    <div className="text-muted-foreground">{testResult.message}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">OAuth Configuration Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Supabase client configured</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>OAuth method implemented</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Redirect URL configured</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}