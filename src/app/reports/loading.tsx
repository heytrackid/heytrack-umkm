import { LoadingState } from '@/components/ui/loading-state'

export default function ReportsLoading() {
  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <LoadingState message="Memuat laporan..." size="lg" />
    </div>
  )
}
