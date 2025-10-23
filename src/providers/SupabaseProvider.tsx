'use client'
import * as React from 'react'

import { createContext, useContext, ReactNode } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types';

type SupabaseContext = {
  supabase: ReturnType<typeof createSupabaseClient>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createSupabaseClient()

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}
