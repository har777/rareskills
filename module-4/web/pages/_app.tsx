import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex p-8 bg-white text-gray-900">
      <Component {...pageProps} />
    </div>
  )
}
