import { useEffect, useState, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types/database';

type Tables = Database['public']['Tables'];

// Base CRUD hook for any table
export function useSupabaseData<T extends keyof Tables>(
  table: T,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createSupabaseClient();
      let query = supabase.from(table).select(options?.select || '*');

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [table, options]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    
    // Initial fetch
    refetch();

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((prev) => [payload.new as Tables[T]['Row'], ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setData((prev) =>
              prev.map((item) =>
                (item as any).id === (payload.new as any).id
                  ? (payload.new as Tables[T]['Row'])
                  : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((prev) =>
              prev.filter((item) => (item as any).id !== (payload.old as any).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, refetch]);

  return { data, loading, error, refetch };
}

// CRUD Mutation hooks
export function useSupabaseMutation<T extends keyof Tables>(
  table: T,
  onSuccess?: () => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: Tables[T]['Insert']) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create record');
      }
      
      const result = await response.json();
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Tables[T]['Update']) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update record');
      }
      
      const result = await response.json();
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete record');
      }
      
      onSuccess?.();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    create,
    update,
    remove,
    loading,
    error,
  };
}

// Utility hook for single record fetch
export function useSupabaseRecord<T extends keyof Tables>(
  table: T,
  id: string,
  options?: { select?: string }
) {
  const [data, setData] = useState<Tables[T]['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const response = await fetch(`/api/${endpoint}/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch record');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [table, id]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return { data, loading, error, refetch };
}

// Specific hooks with combined data and mutations
export const useIngredients = () => {
  const data = useSupabaseData('ingredients');
  const mutations = useSupabaseMutation('ingredients', data.refetch);
  return { ...data, ...mutations };
};

export const useRecipes = () => {
  const data = useSupabaseData('recipes', {
    select: `
      *,
      recipe_ingredients(
        quantity,
        ingredient:ingredients(name, unit)
      )
    `
  });
  const mutations = useSupabaseMutation('recipes', data.refetch);
  return { ...data, ...mutations };
};

export const useInventory = () => {
  const data = useSupabaseData('inventory', {
    select: `
      *,
      ingredient:ingredients(name, unit)
    `
  });
  const mutations = useSupabaseMutation('inventory', data.refetch);
  return { ...data, ...mutations };
};

export const useProductionBatches = () => {
  const data = useSupabaseData('production_batches', {
    select: `
      *,
      recipe:recipes(name)
    `,
    orderBy: { column: 'created_at', ascending: false }
  });
  const mutations = useSupabaseMutation('production_batches', data.refetch);
  return { ...data, ...mutations };
};

export const useSales = () => {
  const data = useSupabaseData('sales', {
    select: `
      *,
      recipe:recipes(name)
    `,
    orderBy: { column: 'date', ascending: false }
  });
  const mutations = useSupabaseMutation('sales', data.refetch);
  return { ...data, ...mutations };
};

export const useExpenses = () => {
  const data = useSupabaseData('expenses', {
    select: `
      *,
      supplier:suppliers(name)
    `,
    orderBy: { column: 'date', ascending: false }
  });
  const mutations = useSupabaseMutation('expenses', data.refetch);
  return { ...data, ...mutations };
};

export const useSuppliers = () => {
  const data = useSupabaseData('suppliers');
  const mutations = useSupabaseMutation('suppliers', data.refetch);
  return { ...data, ...mutations };
};

// Bulk operations hook
export function useSupabaseBulkOperations<T extends keyof Tables>(
  table: T,
  onSuccess?: () => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreate = async (items: Tables[T]['Insert'][]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const promises = items.map(item => 
        fetch(`/api/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        })
      );
      
      const responses = await Promise.all(promises);
      
      // Check if all requests were successful
      const results = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create record');
          }
          return response.json();
        })
      );
      
      onSuccess?.();
      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdate = async (updates: { id: string; data: Tables[T]['Update'] }[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const promises = updates.map(({ id, data }) => 
        fetch(`/api/${endpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      );
      
      const responses = await Promise.all(promises);
      
      // Check if all requests were successful
      const results = await Promise.all(
        responses.map(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update record');
          }
          return response.json();
        })
      );
      
      onSuccess?.();
      return results;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkDelete = async (ids: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert table name to API endpoint format
      const endpoint = table.replace(/_/g, '-');
      
      const promises = ids.map(id => 
        fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
      );
      
      const responses = await Promise.all(promises);
      
      // Check if all requests were successful
      responses.forEach((response, index) => {
        if (!response.ok) {
          throw new Error(`Failed to delete record with id: ${ids[index]}`);
        }
      });
      
      onSuccess?.();
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkCreate,
    bulkUpdate,
    bulkDelete,
    loading,
    error,
  };
}

// Form validation hook
export function useFormValidation<T>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (field: keyof T, value: any) => {
    const rule = validationRules[field];
    if (rule) {
      return rule(value);
    }
    return null;
  };

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    
    Object.keys(validationRules).forEach(field => {
      const key = field as keyof T;
      newTouched[key] = true;
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setTouched(newTouched);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    isValid: Object.keys(errors).length === 0,
  };
}