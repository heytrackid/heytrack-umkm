/**
 * Shared Form Fields Components
 * Reusable form field components to reduce duplicate code
 */

import { FormField, FormGrid, FormSection } from '@/components/ui/crud-form'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { SupplierForm } from '@/lib/validations/form-validations'

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
          name="name"
          type="text"
          {...register('name')}
          error={errors.name?.message}
          required
          hint="Nama supplier atau perusahaan"
        />

        <FormField
          label="Contact Person"
          name="contact_person"
          type="text"
          {...register('contact_person')}
          error={errors.contact_person?.message}
          hint="Nama orang yang bisa dihubungi"
        />
      </FormSection>

      <FormSection
        title="Informasi Kontak"
        description="Informasi kontak supplier"
      >
        <FormGrid cols={2}>
          <FormField
            label="Nomor Telepon"
            name="phone"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            hint="Nomor telepon yang bisa dihubungi"
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            hint="Alamat email untuk komunikasi"
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Alamat">
        <FormField
          label="Alamat Lengkap"
          name="address"
          type="textarea"
          {...register('address')}
          error={errors.address?.message}
          rows={3}
          hint="Alamat lengkap supplier"
        />
      </FormSection>

      {showNotes && (
        <FormSection title="Catatan Tambahan">
          <FormField
            label="Catatan"
            name="notes"
            type="textarea"
            {...register('notes')}
            error={errors.notes?.message}
            rows={2}
            hint="Catatan tambahan tentang supplier (opsional)"
          />
        </FormSection>
      )}
    </>
  )
