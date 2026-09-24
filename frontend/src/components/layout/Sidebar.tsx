import { Boxes, ChartNoAxesCombined, ClipboardList, GitCompareArrows, LayoutDashboard, ListTree, PackageSearch, PanelLeftClose, Settings2, Sigma, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface NavigationItem { to: string; label: string; icon: LucideIcon; end?: boolean }

const navigation: Array<{ label: string; items: NavigationItem[] }> = [
  { label: 'WORKSPACE', items: [{ to: '/', label: '대시보드', icon: LayoutDashboard, end: true }] },
  { label: 'DATA FOUNDATION', items: [
    { to: '/items', label: '품목 관리', icon: Boxes },
    { to: '/demands', label: '수요 이력', icon: ChartNoAxesCombined },
    { to: '/bom', label: 'BOM', icon: ListTree },
    { to: '/production-plan', label: '생산 계획', icon: ClipboardList },
  ] },
  { label: 'DECISION ENGINE', items: [
    { to: '/abc', label: 'ABC 분석', icon: Sigma },
    { to: '/inventory-policy', label: '재고 정책', icon: Settings2 },
    { to: '/mrp', label: 'MRP', icon: PackageSearch },
    { to: '/scenario-compare', label: '시나리오 비교', icon: GitCompareArrows },
  ] },
]

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <button aria-label="메뉴 닫기" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/5 bg-[#0c0f13] text-zinc-100 shadow-[8px_0_24px_rgba(15,23,42,0.12)] transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-17 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3"><span className="grid h-7 w-7 grid-cols-2 gap-[2px] bg-zinc-900 p-1.5"><i className="bg-white" /><i className="bg-zinc-600" /><i className="bg-[#4169e1]" /><i className="bg-zinc-400" /></span><div><p className="text-[14px] font-semibold tracking-[0.1em]">RESTOCK</p><p className="mt-0.5 text-[8px] tracking-[0.24em] text-zinc-600">DECISION SYSTEM</p></div></div>
          <button type="button" aria-label="메뉴 닫기" className="rounded-md p-2 text-zinc-400 hover:bg-white/10 lg:hidden" onClick={onClose}><PanelLeftClose size={18} /></button>
        </div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {navigation.map((section) => <div key={section.label}><p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.18em] text-zinc-600">{section.label}</p><div className="space-y-0.5">{section.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => cn('group flex items-center gap-3 border px-3 py-2 text-[13px] transition-all', isActive ? 'rounded-lg border-white/10 bg-gradient-to-b from-white/[0.11] to-white/[0.055] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_4px_12px_rgba(0,0,0,0.18)]' : 'rounded-lg border-transparent text-zinc-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-zinc-200')}>
              <Icon size={15} strokeWidth={1.7} /><span>{label}</span>
            </NavLink>
          ))}</div></div>)}
        </nav>
        <div className="border-t border-white/10 px-5 py-4"><p className="text-[10px] font-semibold tracking-[0.14em] text-zinc-600">WORKSPACE</p><p className="mt-1.5 text-xs text-zinc-400">재고 의사결정 시뮬레이터</p></div>
      </aside>
    </>
  )
}
