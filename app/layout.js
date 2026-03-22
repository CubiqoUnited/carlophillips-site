import './globals.css'

export const metadata = {
  title: 'CARLOPHILLIPS | Luxury Lifestyle Brand',
  description: 'Premium clothing, jewelry, accessories, and home items. A modern luxury fashion brand.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  )
}
