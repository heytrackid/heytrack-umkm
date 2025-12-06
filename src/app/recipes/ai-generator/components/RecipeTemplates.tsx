'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecipeTemplate {
  id: string
  name: string
  type: string
  servings: number
  ingredients: string[]
  icon: string
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Spesial',
    type: 'main-dish',
    servings: 4,
    ingredients: ['nasi putih', 'telur ayam', 'bawang putih', 'bawang merah', 'kecap manis', 'sayuran'],
    icon: '🍚'
  },
  {
    id: 'ayam-goreng',
    name: 'Ayam Goreng Crispy',
    type: 'main-dish',
    servings: 6,
    ingredients: ['ayam', 'tepung terigu', 'telur ayam', 'bawang putih', 'ketumbar', 'minyak goreng'],
    icon: '🍗'
  },
  {
    id: 'jus-buah',
    name: 'Jus Buah Segar',
    type: 'beverage',
    servings: 4,
    ingredients: ['buah jeruk', 'buah apel', 'madu', 'air', 'es batu'],
    icon: '🧃'
  },
  {
    id: 'martabak-manis',
    name: 'Martabak Manis',
    type: 'dessert',
    servings: 8,
    ingredients: ['tepung terigu', 'telur ayam', 'gula pasir', 'susu', 'keju', 'meses'],
    icon: '🥞'
  },
  {
    id: 'sate-ayam',
    name: 'Sate Ayam Madura',
    type: 'main-dish',
    servings: 6,
    ingredients: ['ayam', 'kecap manis', 'bawang merah', 'bawang putih', 'ketumbar', 'tusuk sate'],
    icon: '🍢'
  },
  {
    id: 'bakso-malang',
    name: 'Bakso Malang',
    type: 'main-dish',
    servings: 8,
    ingredients: ['daging sapi', 'tepung tapioka', 'bawang putih', 'telur ayam', 'mie', 'tahu'],
    icon: '🥟'
  }
]

interface RecipeTemplatesProps {
  onSelectTemplate: (template: RecipeTemplate) => void
}

export function RecipeTemplates({ onSelectTemplate }: RecipeTemplatesProps) {
  return (
    <Card className="border-2 border-dashed border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            🚀
          </div>
          Contoh Resep UMKM
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pilih contoh untuk memulai lebih cepat
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RECIPE_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/50"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {template.servings} porsi • {template.ingredients.length} bahan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { RECIPE_TEMPLATES }
export type { RecipeTemplate }

