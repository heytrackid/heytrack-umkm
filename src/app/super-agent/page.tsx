'use client'

import { Bot, DollarSign, Sparkles } from '@/components/icons'
import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat } from 'lucide-react'
import { useRouter } from 'next/navigation'

const agents = [
  {
    id: 'ai-chatbot',
    title: 'ChatWise AI',
    description: 'Chat dengan asisten AI untuk bantuan bisnis kuliner dan operasional harian',
    icon: Bot,
    href: '/ai-chatbot',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    features: [
      'Konsultasi bisnis kuliner',
      'Analisis data penjualan',
      'Tips optimasi operasional',
      'Rekomendasi strategis'
    ]
  },
  {
    id: 'finance-wise',
    title: 'FinanceWise AI',
    description: 'Analisis keuangan cerdas dengan forecasting cash flow dan insights bisnis',
    icon: DollarSign,
    href: '/finance-wise',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    features: [
      'Cash flow forecasting',
      'Analisis kesehatan keuangan',
      'Budget planning & tracking',
      'AI insights & rekomendasi'
    ]
  },
  {
    id: 'chef-wise',
    title: 'ChefWise AI',
    description: 'Generator resep kuliner dengan AI yang disesuaikan dengan inventory dan preferensi Anda',
    icon: ChefHat,
    href: '/chef-wise',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    features: [
      'Generate resep otomatis',
      'Optimasi biaya bahan',
      'Substitusi ingredient pintar',
      'Integrasi inventory real-time'
    ]
  }
]

export default function SuperAgentPage() {
  const router = useRouter()

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Super Agent"
          description="Koleksi AI Agent untuk membantu optimasi bisnis kuliner Anda"
          actions={
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Powered by Advanced AI
              </span>
            </div>
          }
        />

        {/* Agents Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl ${agent.color} group-hover:scale-110 transition-transform duration-200`}>
                    <agent.icon className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      AI Agent
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {agent.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {agent.description}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Fitur Utama
                  </h4>
                  <ul className="space-y-1.5">
                    {agent.features.map((feature, index) => (
                      <li key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => router.push(agent.href)}
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
                  variant="outline"
                >
                  <agent.icon className="h-4 w-4 mr-2" />
                  Buka {agent.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Agent Baru Akan Datang</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Kami sedang mengembangkan agent-agent AI tambahan untuk membantu bisnis kuliner Anda berkembang lebih jauh.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
