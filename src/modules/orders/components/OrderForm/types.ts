import type { Order, PaymentMethod } from '@/app/orders/types/orders-db.types'

export interface FormState {
  customer_name: string
  customer_phone: string
  customer_address: string
  order_date: string
  delivery_date: string
  delivery_time: string
  delivery_fee: number
  discount: number
  tax_amount: number
  payment_method: PaymentMethod
  paid_amount: number
  priority: Order['priority']
  notes: string
  special_instructions: string
}

export interface OrderFormTabProps {
  formData: FormState
  onInputChange: <K extends keyof FormState>(field: K, value: FormState[K]) => void
  fieldErrors: Record<string, string>
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}
