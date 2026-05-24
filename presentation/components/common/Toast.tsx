'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function ToastProvider() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      duration={4000}
    />
  )
}