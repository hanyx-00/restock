import type { ReactNode } from 'react'

interface PageHeaderProps { eyebrow?: string; index?: string; title: string; description: string; action?: ReactNode }

export function PageHeader({ eyebrow = 'RESTOCK', index = '00', title, description, action }: PageHeaderProps) {
  return (
    <header className="page-header relative mb-8 grid gap-6 overflow-hidden rounded-[14px] border border-white/90 bg-white/55 px-6 py-7 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.05)] backdrop-blur md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-8">
      <div className="flex gap-5 md:gap-8">
        <span className="mt-1 h-11 w-1 shrink-0 rounded-full bg-[#4169e1] shadow-[0_0_0_3px_rgba(65,105,225,0.1)]" />
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-[0.24em] text-zinc-500">{eyebrow} / {index}</p>
          <h1 className="text-[2.5rem] font-semibold leading-none tracking-[-0.055em] text-zinc-950 md:text-[3.35rem]">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0 md:pb-1">{action}</div>}
      <span className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full border-[30px] border-zinc-200/35" />
    </header>
  )
}
