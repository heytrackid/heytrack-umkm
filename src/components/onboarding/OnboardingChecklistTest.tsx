'use client'

import { Sparkles } from '@/components/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

/**
 * Simple test component to verify rendering works
 * Remove this after debugging
 */
export function OnboardingChecklistTest() {
  return (
    <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg text-green-700">
            🎉 Test Widget - Checklist Component Works!
          </CardTitle>
        </div>
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Test Progress</span>
            <span className="font-medium text-green-600">50%</span>
          </div>
          <Progress value={50} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">
          Kalau kamu lihat widget ini, berarti component rendering works. 
          Masalahnya ada di data fetching atau conditional logic.
        </p>
      </CardContent>
    </Card>
  )
}
