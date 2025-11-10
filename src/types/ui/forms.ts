export interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface FormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  validationSchema?: unknown;
  children?: React.ReactNode;
  className?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export interface FormFieldUpdate<T> {
  name: keyof T;
  value: T[keyof T];
}

export type FormFieldUpdater<T> = (update: FormFieldUpdate<T>) => void;

export interface ArrayItemUpdate<T> {
  index: number;
  item: T;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}

export type FormAction<T> =
  { type: 'RESET_FORM' } | { type: 'SET_ERRORS'; payload: Record<string, string> } | { type: 'SET_SUBMITTING'; payload: boolean } | { type: 'UPDATE_FIELD'; payload: FormFieldUpdate<T> };