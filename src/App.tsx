import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import './App.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased">
          <div className="relative flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                  <h1 className="text-xl font-bold">🎯 HeyTrack</h1>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                  <p className="text-sm text-muted-foreground">
                    Business Management System
                  </p>
                </div>
              </div>
            </header>
            
            <main className="flex-1">
              <div className="container mx-auto py-6">
                <div className="grid gap-6">
                  <div className="flex flex-col space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome to HeyTrack</h2>
                    <p className="text-muted-foreground">
                      Comprehensive business management system untuk BISMILLAH
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Feature Cards */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">📦 Inventory</CardTitle>
                        <Badge variant="secondary">Active</Badge>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Manage stock, categories, and suppliers
                        </CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">👥 Customers</CardTitle>
                        <Badge variant="secondary">Active</Badge>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Track customers and order history
                        </CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">📋 Orders</CardTitle>
                        <Badge variant="secondary">Active</Badge>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Complete order management system
                        </CardDescription>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">💰 Financial</CardTitle>
                        <Badge variant="secondary">Active</Badge>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          Track income, expenses, and profits
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🚀 Getting Started
                        <Badge variant="outline">v1.0.0</Badge>
                      </CardTitle>
                      <CardDescription>
                        HeyTrack UMKM setup status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">✅</Badge>
                        <span>Database migration applied successfully</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">✅</Badge>
                        <span>API services configured and ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">✅</Badge>
                        <span>TypeScript types defined</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">✅</Badge>
                        <span>shadcn/ui components installed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">🔧</Badge>
                        <span>Ready to build components and UI</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      Built with ❤️ for BISMILLAH • Version {import.meta.env.VITE_APP_VERSION || '1.0.0'}
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;