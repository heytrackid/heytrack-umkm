import { Calculator, Factory, Percent, Receipt } from '@/components/icons'
import type { ComponentType } from 'react'

export interface WizardStep {
  id: number
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Pilih Resep', description: 'Pilih resep yang akan dihitung HPP-nya', icon: Receipt },
  { id: 2, title: 'Biaya Tambahan', description: 'Input biaya overhead dan operasional', icon: Factory },
  { id: 3, title: 'Set Margin', description: 'Tentukan margin keuntungan', icon: Percent },
  { id: 4, title: 'Review & Simpan', description: 'Periksa hasil dan simpan kalkulasi', icon: Calculator }
]

export interface OverheadCosts {
  labor: number
  operational: number
  packaging: number
  other: number
}

export interface HppWizardState {
  currentStep: number
  selectedRecipeId: string | null
  overheadCosts: OverheadCosts
  marginPercentage: number
}
