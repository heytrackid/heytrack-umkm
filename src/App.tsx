import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">📦 Inventory</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage stock, categories, and suppliers
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">👥 Customers</h3>
                      <p className="text-sm text-muted-foreground">
                        Track customers and order history
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">📋 Orders</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete order management system
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">💰 Financial</h3>
                      <p className="text-sm text-muted-foreground">
                        Track income, expenses, and profits
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-6">
                    <h3 className="text-xl font-semibold mb-4">🚀 Getting Started</h3>
                    <div className="grid gap-3 text-sm">
                      <p>✅ Database migration applied successfully</p>
                      <p>✅ API services configured and ready</p>
                      <p>✅ TypeScript types defined</p>
                      <p>🔧 Ready to build components and UI</p>
                    </div>
                  </div>
                  
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
      </Router>
    </QueryClientProvider>
  );
}

export default App;