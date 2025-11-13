'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--surface)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'white',
          },
        },
      }}
    />
  )
}
