import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Custom500() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <AlertTriangle className="h-24 w-24 text-destructive" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">500</h1>
                    <h2 className="text-2xl font-semibold">Server Error</h2>
                    <p className="text-muted-foreground">
                        Maaf, terjadi kesalahan pada server. Tim kami sudah diberitahu dan sedang memperbaikinya.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                        <Link href="/dashboard">
                            Kembali ke Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            Ke Halaman Utama
                        </Link>
                    </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                    Jika masalah berlanjut, silakan hubungi support.
                </p>
            </div>
        </div>
    )
}
