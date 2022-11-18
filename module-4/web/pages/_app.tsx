import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex h-screen p-8 text-slate-900">
      <Component {...pageProps} />
    </div>
  )
}
