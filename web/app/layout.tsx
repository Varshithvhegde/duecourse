import './globals.css'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Entitled — you are owed more than you think',
  description:
    'Find the Indian government welfare schemes you qualify for, in plain language, with official sources.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#faf9f7] text-stone-900 antialiased">
        {children}
      </body>
    </html>
  )
}
