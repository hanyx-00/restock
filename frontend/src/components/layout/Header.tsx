import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageMeta: Record<string, { code: string; label: string }> = {
  '/': { code: '00', label: 'OVERVIEW' },
  '/items': { code: '01', label: 'ITEM MASTER' },
  '/demands': { code: '02', label: 'DEMAND HISTORY' },
  '/abc': { code: '03', label: 'ABC ANALYSIS' },
  '/inventory-policy': { code: '04', label: 'INVENTORY POLICY' },
  '/bom': { code: '05', label: 'BILL OF MATERIALS' },
  '/production-plan': { code: '06', label: 'PRODUCTION PLAN' },
  '/mrp': { code: '07', label: 'MRP' },
  '/scenario-compare': { code: '08', label: 'SCENARIO LAB' },
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { pathname } = useLocation()
  const current = pageMeta[pathname] ?? pageMeta['/']
  return (
    <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-white/80 bg-[#edf0f2]/90 px-5 shadow-[0_1px_0_rgba(24,24,27,0.12)] backdrop-blur-xl md:px-10 lg:px-14">
      <div className="flex items-center gap-3">
        <button aria-label="메뉴 열기" className="p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden" onClick={onOpenMenu}><Menu size={20} /></button>
        <div className="hidden items-center gap-3 sm:flex"><span className="rounded border border-zinc-300 bg-white/70 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500 shadow-sm">{current.code}</span><p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500">SYSTEM / {current.label}</p></div>
      </div>
      <div className="flex items-center gap-3 rounded-full border border-white bg-white/65 px-3 py-1.5 text-[9px] font-semibold tracking-[0.14em] text-zinc-500 shadow-[0_1px_3px_rgba(15,23,42,0.1)]"><span>LIVE</span><span className="h-2 w-2 rounded-full bg-[#4169e1] shadow-[0_0_0_3px_rgba(65,105,225,0.12)]" /></div>
    </header>
  )
}
