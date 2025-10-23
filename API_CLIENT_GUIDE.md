# 🔌 Centralized API Client Guide

## Quick Start

### Basic Usage

```typescript
import { apiClient } from '@/lib/api/client'

// GET request
const response = await apiClient.get('/api/customers')
if (response.success) {
  console.log(response.data)
}

// POST request
const response = await apiClient.post('/api/customers', {
  name: 'John Doe',
  email: 'john@example.com',
})

// PUT request
const response = await apiClient.put('/api/customers/123', {
  name: 'Jane Doe',
})

// DELETE request
const response = await apiClient.delete('/api/customers/123')
```

### Using Hooks in Components

```typescript
import { useApi, useMutationApi } from '@/hooks/useApi'

// Fetch data
export function CustomersList() {
  const { data, isLoading, error, fetch } = useApi('/api/customers', {
    autoLoad: true,
  })

  if (isLoading) return <Loading />
  if (error) return <Error message={error} />

  return (
    <div>
      {data?.map((customer) => (
        <CustomerItem key={customer.id} customer={customer} />
      ))}
    </div>
  )
}

// Mutate data
export function CreateCustomer() {
  const { mutate, isLoading, error } = useMutationApi('/api/customers')

  const handleSubmit = async (formData) => {
    try {
      await mutate(formData)
      // Success - data is in response
    } catch (error) {
      // Error handled
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## API Client Features

### 1. Request/Response Logging
Automatically logs all requests and responses in development mode.

```typescript
// Console output
[API] GET /api/customers
[API] Success 200 /api/customers
```

### 2. Error Handling
Consistent error handling across all requests.

```typescript
const response = await apiClient.get('/api/customers')

if (!response.success) {
  console.error(response.error) // "Network error" or API error message
  console.error(response.status) // 404, 500, etc.
}
```

### 3. Retry Logic with Exponential Backoff
Automatically retries failed requests with exponential backoff.

```typescript
const response = await apiClient.get('/api/customers', {
  retry: 3, // Retry up to 3 times
})
// Retry delays: 1s, 2-4s, 4-8s (+ random jitter)
```

### 4. Request Timeout
Set custom timeout for requests.

```typescript
const response = await apiClient.get('/api/customers', {
  timeout: 5000, // 5 second timeout (default: 30s)
})
```

### 5. Interceptors
Register global interceptors for logging, auth, etc.

```typescript
// Request Interceptor (e.g., add authorization header)
apiClient.useRequestInterceptor((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// Response Interceptor (e.g., handle 401 responses)
apiClient.useResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Handle unauthorized - redirect to login
    window.location.href = '/login'
  }
  return response
})

// Error Interceptor (e.g., global error handling)
apiClient.useErrorInterceptor(async (error) => {
  if (error.status === 401) {
    // Handle token refresh
  }
  if (error.status === 500) {
    // Send to error tracking service
  }
})
```

## Hooks Reference

### useApi

Hook for fetching data with loading/error states.

```typescript
const { data, isLoading, error, isRefreshing, fetch, refetch } = useApi(
  '/api/customers',
  {
    autoLoad: true, // Auto-fetch on mount
    onSuccess: (data) => console.log(data),
    onError: (error) => console.error(error),
  }
)

// Manually fetch
await fetch()

// Refetch with loading state
await refetch()
```

**Return Value:**
- `data: T | null` - Fetched data
- `isLoading: boolean` - Initial loading state
- `isRefreshing: boolean` - Refetch loading state
- `error: string | null` - Error message
- `fetch: (config?) => Promise<void>` - Fetch function
- `refetch: (config?) => Promise<void>` - Refetch function

### useMutationApi

Hook for POST/PUT/PATCH/DELETE requests.

```typescript
const { mutate, data, isLoading, error } = useMutationApi(
  '/api/customers',
  'POST',
  {
    onSuccess: (result) => console.log('Created:', result),
    onError: (error) => console.error('Failed:', error),
  }
)

// Execute mutation
try {
  await mutate({ name: 'John' })
} catch (error) {
  // Error already handled by hook
}
```

**Return Value:**
- `mutate: (body?, config?) => Promise<void>` - Execute mutation
- `data: T | null` - Response data
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message

## Complete Examples

### Example 1: Customers List

```typescript
'use client'

import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CustomersList() {
  const { data: customers, isLoading, error, refetch } = useApi('/api/customers', {
    autoLoad: true,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Customers</h1>
      <Button onClick={() => refetch()}>Refresh</Button>

      <div className="space-y-4">
        {customers?.map((customer) => (
          <Card key={customer.id} className="p-4">
            <h2>{customer.name}</h2>
            <p>{customer.email}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### Example 2: Create Customer

```typescript
'use client'

import { useState } from 'react'
import { useMutationApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/forms'

export function CreateCustomerForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const { mutate, isLoading, error } = useMutationApi('/api/customers', 'POST', {
    onSuccess: () => {
      setName('')
      setEmail('')
      alert('Customer created!')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await mutate({ name, email })
    } catch (error) {
      // Error already handled
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error}
      />
      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  )
}
```

### Example 3: Update & Delete

```typescript
export function CustomerActions({ customerId }: { customerId: string }) {
  const { mutate: updateCustomer, isLoading: isUpdating } = useMutationApi(
    `/api/customers/${customerId}`,
    'PUT'
  )

  const { mutate: deleteCustomer, isLoading: isDeleting } = useMutationApi(
    `/api/customers/${customerId}`,
    'DELETE'
  )

  const handleUpdate = async () => {
    await updateCustomer({ name: 'Updated Name' })
  }

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deleteCustomer()
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleUpdate} disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update'}
      </Button>
      <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )
}
```

### Example 4: With Pagination & Filtering

```typescript
'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'

export function FilteredCustomersList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useApi('/api/customers', {
    autoLoad: true,
  })

  const handleSearch = async () => {
    await refetch({
      ...({ search, page } as any),
    })
  }

  return (
    <div>
      <input
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch} disabled={isLoading}>
        Search
      </button>

      {data?.map((customer) => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  )
}
```

## Setup & Configuration

### Initial Setup

```typescript
// src/lib/api/setup.ts
import { apiClient } from './client'

export function setupApiClient() {
  // Add authorization header
  apiClient.useRequestInterceptor((config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  })

  // Handle 401 responses
  apiClient.useResponseInterceptor(async (response) => {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return response
  })

  // Global error handling
  apiClient.useErrorInterceptor(async (error) => {
    console.error('API Error:', error.message)
    // Send to error tracking service
  })
}

// Call in your app layout or main file
setupApiClient()
```

## Type Safety

```typescript
interface Customer {
  id: string
  name: string
  email: string
}

// Typed hook
const { data: customers } = useApi<Customer[]>('/api/customers')

// Typed mutation
const { mutate } = useMutationApi<Customer, Customer>(
  '/api/customers',
  'POST'
)

// Use with type checking
customers?.map((c) => c.name) // ✅ TypeScript knows c.name exists
```

## Error Handling

```typescript
const { data, error, isLoading } = useApi('/api/customers')

if (isLoading) return <Loading />
if (error === 'Request timeout') return <TimeoutError />
if (error?.includes('404')) return <NotFoundError />
if (error) return <Error message={error} />

return <CustomersList data={data} />
```

## File Structure

```
src/lib/api/
└── client.ts          # Main API client

src/hooks/
└── useApi.ts          # Hooks: useApi, useMutationApi
```

## Best Practices

1. **Always use hooks** for component data fetching
2. **Use typed hooks** for better type safety
3. **Handle errors** consistently
4. **Set up interceptors** for auth & global error handling
5. **Use retry** for network requests
6. **Set appropriate timeouts** for different endpoints
7. **Log requests** in development for debugging

## Migration Path

From scattered `fetch()` calls to centralized API client:

**Before:**
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  fetch('/api/customers')
    .then(r => r.json())
    .then(setData)
    .catch(console.error)
    .finally(() => setLoading(false))
}, [])
```

**After:**
```typescript
const { data, isLoading } = useApi('/api/customers', {
  autoLoad: true,
})
```

---

**Benefits:**
- ⭐⭐⭐⭐⭐ **Consistency** across all API calls
- ⭐⭐⭐⭐⭐ **Error handling** built-in
- ⭐⭐⭐⭐⭐ **Type safety** with TypeScript
- ⭐⭐⭐⭐ **Retry logic** automatic
- ⭐⭐⭐⭐ **Request logging** built-in
- ⭐⭐⭐⭐ **Loading states** managed
