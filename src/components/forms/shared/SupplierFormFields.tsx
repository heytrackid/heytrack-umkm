import { FormGrid, FormSection } from '@/components/ui/crud-form'
import { FormField } from '@/components/forms/shared/FormField'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { SupplierForm } from '@/lib/validations/form-validations'

import type { UseFormRegister, FieldErrors } from 'react-hook-form'

/**
 * Shared Form Fields Components
 * Reusable form field components to reduce duplicate code
 */


interface SupplierFormFieldsProps {
  register: UseFormRegister<SupplierForm>
  errors: FieldErrors<SupplierForm>
  showNotes?: boolean
}

/**
 * Supplier form fields
 */
export const SupplierFormFields = ({
  register,
  errors,
  showNotes = true
}: SupplierFormFieldsProps) => (
    <>
      <FormSection
        title="Informasi Dasar"
        description="Masukkan informasi dasar supplier"
      >
        <FormField
          label="Nama Supplier"
          error={errors.name?.message}
          required
        >
          <Input
            type="text"
            placeholder="Nama supplier atau perusahaan"
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Contact Person"
          error={errors.contact_person?.message}
        >
          <Input
            type="text"
            placeholder="Nama orang yang bisa dihubungi"
            {...register('contact_person')}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Informasi Kontak"
        description="Informasi kontak supplier"
      >
        <FormGrid cols={2}>
          <FormField
            label="Nomor Telepon"
            error={errors.phone?.message}
          >
            <Input
              type="tel"
              placeholder="Nomor telepon yang bisa dihubungi"
              {...register('phone')}
            />
          </FormField>

          <FormField
            label="Email (Opsional)"
            error={errors.email?.message}
          >
            <Input
              type="email"
              placeholder="Masukkan email jika ada (opsional)"
              {...register('email')}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Alamat">
        <FormField
          label="Alamat"
          error={errors.address?.message}
        >
          <Textarea
            placeholder="Alamat lengkap supplier"
            rows={3}
            {...register('address')}
          />
        </FormField>
      </FormSection>

      {showNotes && (
        <FormSection title="Catatan Tambahan">
          <FormField
            label="Catatan"
            error={errors.notes?.message}
          >
            <Textarea
              placeholder="Catatan tambahan tentang supplier (opsional)"
              rows={2}
              {...register('notes')}
            />
          </FormField>
        </FormSection>
      )}
    </>
  )
