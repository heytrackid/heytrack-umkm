import { createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

type Tables = Database['public']['Tables'];
type ExtendedTableNames = keyof Tables | 'production_batches' | 'quality_checks' | 'production_equipment' | 'production_staff' | 'ingredient_allocations' | 'order_payments' | 'OrderItem' | 'OrderPayment' | 'ProductionBatch' | 'QualityCheck' | 'ProductionEquipment' | 'ProductionStaff' | 'IngredientAllocation' | 'Order';

// Map extended table names to actual database tables
const tableMap: Record<string, keyof Tables> = {
  'production_batches': 'productions',
  'quality_checks': 'productions', // These might need their own tables or be part of productions
  'production_equipment': 'productions',
  'production_staff': 'productions',
  'ingredient_allocations': 'productions',
  'order_payments': 'payments',
  'OrderItem': 'order_items',
  'OrderPayment': 'payments',
  'ProductionBatch': 'productions',
  'QualityCheck': 'productions',
  'ProductionEquipment': 'productions',
  'ProductionStaff': 'productions',
  'IngredientAllocation': 'productions',
  'Order': 'orders'
};

function getActualTableName(table: ExtendedTableNames): keyof Tables {
  return tableMap[table as string] || (table as keyof Tables);
}

// Base CRUD hook for any table
function useSupabaseDataInternal<T = any>(
  table: string,
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    initial?: any[];
    refetchOnMount?: boolean; // default true unless initial provided
    realtime?: boolean; // default true
  }
) {
  const [data, setData] = useState<any[]>(options?.initial ?? []);
  const [loading, setLoading] = useState(!options?.initial);
  const [error, setError] = useState<string | null>(null);

  // Memoize options to prevent infinite loops
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseClient();
      const actualTable = getActualTableName(table as any);
      let query = supabase.from(actualTable).select('*');

      // Apply filters
      if (optionsRef.current?.filter) {
        Object.entries(optionsRef.current.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (optionsRef.current?.orderBy) {
        query = query.order(optionsRef.current.orderBy.column, {
          ascending: optionsRef.current.orderBy.ascending ?? true,
        });
      }

      // Apply limit
      if (optionsRef.current?.limit) {
        query = query.limit(optionsRef.current.limit);
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    const supabase = createSupabaseClient();
    const actualTable = getActualTableName(table as any);

    // Initial fetch – skip if we have initial and refetchOnMount === false
    if (!(options?.initial && options.initial.length > 0 && options?.refetchOnMount === false)) {
      refetch();
    }

    // Set up real-time subscription unless disabled
    let channel: any | null = null;
    if (options?.realtime !== false) {
      channel = supabase
        .channel(`${actualTable}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: actualTable,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setData((prev) => [payload.new as any, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setData((prev) =>
                prev.map((item) =>
                  (item as any).id === (payload.new as any).id
                    ? (payload.new as any)
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
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [table, refetch]);

  return { data, loading, error, refetch };
}

// Export useSupabaseData for backward compatibility
export const useSupabaseData = useSupabaseDataInternal;

// CRUD Mutation hooks
export function useSupabaseMutation<T = any>(
  table: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      // Convert table name to API endpoint format
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to create record');
      }

      onSuccess?.();
      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: any) => {
    setLoading(true);
    setError(null);

    try {
      // Convert table name to API endpoint format
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to update record');
      }

      onSuccess?.();
      return result.data;
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
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to delete record');
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
export function useSupabaseRecord<T = any>(
  table: string,
  id: string,
  options?: { select?: string }
) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Convert table name to API endpoint format
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

      const response = await fetch(`/api/${endpoint}/${id}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to fetch record');
      }

      setData(result.data);
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

// Combined CRUD hook with data and mutations
export function useSupabaseCRUD<T = any, TInsert = any, TUpdate = any>(
  table: string | { table: string; relationConfig?: any; filter?: any; orderBy?: any },
  options?: {
    select?: string;
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  // Handle both string and object configurations
  const tableName = typeof table === 'string' ? table : table.table;
  const config = typeof table === 'object' ? table : undefined;

  // Use data hook for fetching
  const dataHook = useSupabaseDataInternal(tableName as any, options);

  // Use mutation hook for operations
  const mutationHook = useSupabaseMutation(tableName as any, dataHook.refetch);

  return {
    ...dataHook,
    ...mutationHook,
    refresh: dataHook.refetch
  };
}

// Specific hooks with combined data and mutations
export const useIngredients = (options?: { initial?: any[]; refetchOnMount?: boolean }) => {
  const initialData = Array.isArray(options?.initial) ? options.initial : []
  const data = useSupabaseData('ingredients', { ...options, initial: initialData });
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
  const data = useSupabaseData('stock_transactions', {
    select: `
      *,
      ingredient:ingredients(name, unit)
    `
  });
  const mutations = useSupabaseMutation('stock_transactions', data.refetch);
  return { ...data, ...mutations };
};

export const useProductionBatches = () => {
  const data = useSupabaseData('productions', {
    select: `
      *,
      recipe:recipes(name)
    `,
    orderBy: { column: 'created_at', ascending: false }
  });
  const mutations = useSupabaseMutation('productions', data.refetch);
  return { ...data, ...mutations };
};

export const useSales = () => {
  const data = useSupabaseData('orders', {
    select: `
      *,
      customer:customers(name)
    `,
    orderBy: { column: 'created_at', ascending: false }
  });
  const mutations = useSupabaseMutation('orders', data.refetch);
  return { ...data, ...mutations };
};

export const useExpenses = () => {
  const data = useSupabaseData('financial_records', {
    select: `*`,
    orderBy: { column: 'created_at', ascending: false }
  });
  const mutations = useSupabaseMutation('financial_records', data.refetch);
  return { ...data, ...mutations };
};

export const useSuppliers = () => {
  const data = useSupabaseData('customers');
  const mutations = useSupabaseMutation('customers', data.refetch);
  return { ...data, ...mutations };
};

// Bulk operations hook
export function useSupabaseBulkOperations<T = any>(
  table: string,
  onSuccess?: () => void,
  onError?: (error: string) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreate = async (items: any[]) => {
    setLoading(true);
    setError(null);

    try {
      // Convert table name to API endpoint format
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

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

  const bulkUpdate = async (updates: { id: string; data: any }[]) => {
    setLoading(true);
    setError(null);

    try {
      // Convert table name to API endpoint format
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

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
      const actualTable = getActualTableName(table as any);
      const endpoint = actualTable.replace(/_/g, '-');

      const promises = ids.map(id =>
        fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
      );

      const responses = await Promise.all(promises);

      // Check if all requests were successful
      responses.forEach((response, index: number) => {
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

  const handleChange = (field: string, value: any) => {
    const key = field as keyof T;
    setValues(prev => ({ ...prev, [key]: value }));

    // Validate if field has been touched
    if (touched[key]) {
      const error = validateField(key, value);
      setErrors(prev => ({ ...prev, [key]: error }));
    }
  };

  const handleBlur = (field: string) => {
    const key = field as keyof T;
    setTouched(prev => ({ ...prev, [key]: true }));
    const error = validateField(key, values[key]);
    setErrors(prev => ({ ...prev, [key]: error }));
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