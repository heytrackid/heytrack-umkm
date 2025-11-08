import { FormField, FormGrid, FormSection } from '@/components/ui/crud-form'
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
          name="name"
          label="Nama Supplier"
          error={errors.name?.message}
          required
        >
          <Input
            {...register('name')}
            type="text"
            placeholder="Nama supplier atau perusahaan"
          />
        </FormField>

        <FormField
          name="contact_person"
          label="Contact Person"
          error={errors.contact_person?.message}
        >
          <Input
            {...register('contact_person')}
            type="text"
            placeholder="Nama orang yang bisa dihubungi"
          />
        </FormField>
      </FormSection>

      <FormSection
        title="Informasi Kontak"
        description="Informasi kontak supplier"
      >
        <FormGrid cols={2}>
          <FormField
            name="phone"
            label="Nomor Telepon"
            error={errors.phone?.message}
          >
            <Input
              {...register('phone')}
              type="tel"
              placeholder="Nomor telepon yang bisa dihubungi"
            />
          </FormField>

          <FormField
            name="email"
            label="Email"
            error={errors.email?.message}
          >
            <Input
              {...register('email')}
              type="email"
              placeholder="Alamat email untuk komunikasi"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Alamat">
        <FormField
          name="address"
          label="Alamat"
          error={errors.address?.message}
        >
          <Textarea
            {...register('address')}
            placeholder="Alamat lengkap supplier"
            rows={3}
          />
        </FormField>
      </FormSection>

      {showNotes && (
        <FormSection title="Catatan Tambahan">
          <FormField
            name="notes"
            label="Catatan"
            error={errors.notes?.message}
          >
            <Textarea
              {...register('notes')}
              placeholder="Catatan tambahan tentang supplier (opsional)"
              rows={2}
            />
          </FormField>
        </FormSection>
      )}
    </>
  )
