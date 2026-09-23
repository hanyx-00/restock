import { ArrowUpRight, Boxes, ChartNoAxesCombined, PackageCheck, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'

const metrics = [
  { label: '등록 품목', value: '—', unit: '개', icon: Boxes },
  { label: '분석 대상', value: '—', unit: '개', icon: ChartNoAxesCombined },
  { label: '발주 검토', value: '—', unit: '건', icon: PackageCheck },
  { label: '재고 주의', value: '—', unit: '건', icon: TriangleAlert },
]

export function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="OVERVIEW" index="00" title="재고 의사결정 대시보드" description="품목, 수요, 생산 계획을 한곳에서 살펴보고 다음 분석으로 이동합니다. 데이터가 연결되면 핵심 지표와 주의 항목이 이 화면에 표시됩니다." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, unit, icon: Icon }) => <section key={label} className="rounded-xl border border-white bg-gradient-to-br from-white to-[#f4f6f8] p-5 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_7px_20px_rgba(15,23,42,0.07),0_2px_5px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between"><p className="text-xs font-medium tracking-wide text-zinc-500">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white shadow-sm"><Icon size={15} className="text-zinc-500" /></span></div><p className="mt-7 text-3xl font-semibold tracking-tight text-zinc-950">{value} <span className="text-sm font-normal text-zinc-500">{unit}</span></p></section>)}
      </div>
      <section className="mt-6 rounded-[14px] border border-white/10 bg-gradient-to-br from-[#242a31] via-[#15191e] to-[#0d1014] p-6 text-white shadow-[0_14px_36px_rgba(15,23,42,0.18),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-zinc-500">RECOMMENDED FLOW</p>
        <h2 className="mt-3 text-xl font-semibold">품목 등록부터 시작하세요</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">품목과 수요 이력을 입력하면 ABC 등급, 적정 주문량, 안전재고, 재주문점을 순서대로 계산할 수 있습니다.</p>
        <Link to="/items" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 shadow-lg hover:bg-zinc-200">품목 관리 열기 <ArrowUpRight size={16} /></Link>
      </section>
    </>
  )
}
