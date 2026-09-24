import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#e8ebee]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-60">
        <Header onOpenMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-[1480px] px-5 py-8 md:px-10 md:py-10 lg:px-14 lg:py-12"><Outlet /></main>
      </div>
    </div>
  )
}
