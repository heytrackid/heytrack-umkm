import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export function RegistrationSuccess() {
  return (
    <div className="min-h-screen mobile-min-vh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 animate-fade-in-scale">
        <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6">
          <div className="text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-success-pulse">
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                Silakan check email Anda untuk konfirmasi akun.
              </p>
              <Link href="/auth/login">
                <Button className="mt-4 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
