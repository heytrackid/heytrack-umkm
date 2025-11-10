import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'


export const AuthFormSkeleton = (): JSX.Element => (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo/Brand Skeleton */}
                <div className="text-center space-y-2">
                    <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
                    <Skeleton className="h-8 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>

                <Card className="shadow-xl border">
                    <CardHeader className="space-y-1 pb-4">
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Form fields skeleton */}
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-11 w-full" />
                        </div>
                        <Skeleton className="h-11 w-full" />

                        {/* Separator */}
                        <div className="relative py-2">
                            <Skeleton className="h-px w-full" />
                        </div>

                        {/* OAuth button skeleton */}
                        <Skeleton className="h-11 w-full" />

                        {/* Footer link skeleton */}
                        <Skeleton className="h-4 w-48 mx-auto" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
