import Script from 'next/script'
import { getNonce } from '@/lib/nonce'

/**
 * Script component with CSP nonce support
 * Use this instead of regular <script> tags for inline scripts
 */
export async function NonceScript({
    children,
    id,
    ...props
}: {
    children: string
    id?: string
    strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload'
}) {
    const nonce = await getNonce()

    return (
        <Script
            id={id || 'inline-script'}
            nonce={nonce || undefined}
            {...props}
        >
            {children}
        </Script>
    )
}
