'use client'

import { Users } from 'lucide-react'

import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { BreadcrumbPatterns, PageBreadcrumb, PageHeader } from '@/components/ui/index'

const SuppliersPage = (): JSX.Element => {
    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <PageBreadcrumb items={BreadcrumbPatterns.suppliers} />

                {/* Header */}
                <PageHeader
                    title="Supplier"
                    description="Kelola data supplier dan vendor bahan baku"
                    actions={
                        <Button>
                            <Users className="h-4 w-4 mr-2" />
                            Add Supplier
                        </Button>
                    }
                />

                {/* Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Supplier</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Belum ada supplier yang ditambahkan. Klik tombol &quot;Add Supplier&quot; untuk menambah supplier baru.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    )
}

export default SuppliersPage
