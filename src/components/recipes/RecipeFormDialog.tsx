import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import type { Row } from '@/types/database'

import { RecipeFormPage } from '@/components/recipes/RecipeFormPage'

type Recipe = Row<'recipes'>

interface RecipeFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    recipe?: Recipe | undefined
    onSuccess?: () => Promise<void> | undefined | void
}

export const RecipeFormDialog = ({
    open,
    onOpenChange,
    recipe,
    onSuccess
}: RecipeFormDialogProps) => {
    const mode = recipe ? 'edit' : 'create'

    const handleSuccess = async () => {
        try {
            onOpenChange(false)
            if (onSuccess) {
                await onSuccess()
            }
        } catch {
            // Error handling is done in the form component
        }
    }

    const handleClose = () => {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tambah Resep Baru' : 'Edit Resep'}
                    </DialogTitle>
                </DialogHeader>

                <RecipeFormPage
                    mode={mode}
                    {...(recipe?.id ? { recipeId: recipe.id } : {})}
                    onSuccess={handleSuccess}
                    onCancel={handleClose}
                    isDialog
                />
            </DialogContent>
        </Dialog>
    )
}