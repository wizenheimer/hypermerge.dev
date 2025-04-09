'use client'

import React from 'react'
import { useSidebar } from './ui/sidebar'

const Section = ({children}: {children: React.ReactNode}) => {
  const { open } = useSidebar()
  return (
    <div data-open={open} className='flex flex-col h-full data-[open=true]:max-w-[calc(100%-16rem)] data-[open=false]:w-full px-4'>
      {children}
    </div>
  )
}

export default Section