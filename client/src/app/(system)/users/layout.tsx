import UserProvider from '@/modules/user/context/UserProvider'
import React from 'react'

export default function layout({children}: {children: React.ReactNode}) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
