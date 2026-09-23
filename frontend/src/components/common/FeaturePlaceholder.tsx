import type { LucideIcon } from 'lucide-react'
import { ArrowRight, CircleDot, CornerDownRight } from 'lucide-react'
import { PageHeader } from './PageHeader'

interface FeaturePlaceholderProps {
  index: string
  title: string
  description: string
  icon: LucideIcon
  steps: string[]
  endpoint: string
}

export function FeaturePlaceholder({ index, title, description, icon: Icon, steps, endpoint }: FeaturePlaceholderProps) {
  return (
    <>
      <PageHeader index={index} title={title} description={description} />
      <section className="overflow-hidden rounded-[14px] border border-white bg-white shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_14px_36px_rgba(15,23,42,0.09)]">
        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-100 text-zinc-900 shadow-[0_4px_12px_rgba(15,23,42,0.1)]"><Icon size={19} /></div>
              <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[9px] tracking-[0.12em] text-zinc-500">MODULE {index}</span>
            </div>
            <p className="mt-8 text-[10px] font-bold tracking-[0.2em] text-[#4169e1]">WORKFLOW MAP</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-zinc-950">분석 흐름</h2>
            <div className="mt-7">
              {steps.map((step, stepIndex) => (
                <div key={step} className="group grid grid-cols-[32px_1fr] gap-3 border-t border-zinc-200 py-4 first:border-t-0 first:pt-0">
                  <span className="font-mono text-[10px] font-semibold text-zinc-400">0{stepIndex + 1}</span>
                  <div className="flex items-start justify-between gap-3"><p className="text-sm leading-5 text-zinc-700">{step}</p><ArrowRight size={14} className="mt-0.5 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#4169e1]" /></div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-2 rounded-lg border border-zinc-200 bg-[#f5f7f8] px-3 py-2.5 text-[10px] text-zinc-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)_inset]"><CornerDownRight size={13} /><span className="font-semibold tracking-wide">API</span><code className="truncate font-mono text-zinc-700">{endpoint}</code></div>
          </div>

          <div className="relative min-h-[390px] overflow-hidden border-t border-zinc-200 bg-gradient-to-br from-[#252b32] via-[#15191f] to-[#080a0d] p-6 text-white lg:border-t-0 lg:border-l lg:border-zinc-800 md:p-8 lg:p-10">
            <div className="relative z-10 flex items-center justify-between"><div className="flex items-center gap-2"><CircleDot size={14} className="text-[#738eff]" /><span className="text-[10px] font-bold tracking-[0.18em] text-zinc-400">DECISION WORKBENCH</span></div><span className="font-mono text-[9px] text-zinc-600">IDLE / READY</span></div>
            <div className="relative z-10 mt-12 grid grid-cols-3 gap-2">
              {['INPUT', 'PROCESS', 'RESULT'].map((label, labelIndex) => <div key={label} className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-3 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"><p className="font-mono text-[9px] text-zinc-600">0{labelIndex + 1}</p><p className="mt-4 text-[10px] font-semibold tracking-[0.15em] text-zinc-400">{label}</p></div>)}
            </div>
            <div className="relative z-10 mt-4 h-40 overflow-hidden rounded-xl border border-white/[0.08] bg-black/20 shadow-[0_8px_24px_rgba(0,0,0,0.22)_inset]">
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              <svg viewBox="0 0 520 160" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true"><path d="M0 126 C55 126 70 105 115 109 C165 114 177 72 225 78 C276 84 290 52 338 63 C390 75 420 24 520 35" fill="none" stroke="#738eff" strokeWidth="2" vectorEffect="non-scaling-stroke" /><path d="M0 140 C68 136 100 130 148 131 C213 132 251 113 302 116 C377 121 417 85 520 94" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" /></svg>
              <span className="absolute bottom-3 left-3 rounded-md border border-[#738eff]/30 bg-[#738eff]/10 px-2 py-1 font-mono text-[8px] tracking-[0.12em] text-[#9badff]">AWAITING PARAMETERS</span>
            </div>
            <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[9px] tracking-[0.14em] text-zinc-600"><span>RESTOCK ANALYTICS CORE</span><span>NO RUN ACTIVE</span></div>
            <div className="pointer-events-none absolute -bottom-24 -right-14 h-72 w-72 rounded-full border-[46px] border-[#333cd1]/[0.08]" />
          </div>
        </div>
      </section>
    </>
  )
}
