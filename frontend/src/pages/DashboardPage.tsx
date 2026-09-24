import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Boxes, ChartNoAxesCombined, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inventoryApi } from '@/api/endpoints'
import { ErrorPanel, LoadingPanel, MetricCard, Panel, integerFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'

export function DashboardPage() {
  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: async () => (await inventoryApi.items()).data })
  const plansQuery = useQuery({ queryKey: ['production-plans'], queryFn: async () => (await inventoryApi.productionPlans()).data })
  const itemIds = (itemsQuery.data ?? []).map((item) => item.id)
  const demandsQuery = useQuery({ queryKey: ['dashboard-demands', itemIds], queryFn: async () => (await Promise.all(itemIds.map((id) => inventoryApi.demandsByItem(id)))).flatMap((response) => response.data), enabled: itemsQuery.isSuccess })
  const error = itemsQuery.error ?? plansQuery.error ?? demandsQuery.error
  const loading = itemsQuery.isLoading || plansQuery.isLoading || demandsQuery.isLoading
  const items = itemsQuery.data ?? []
  const plans = plansQuery.data ?? []
  const demands = demandsQuery.data ?? []
  const totalStock = items.reduce((sum, item) => sum + item.onHandQuantity, 0)
  const totalPlanned = plans.reduce((sum, plan) => sum + plan.quantity, 0)
  const flow = [
    { index: '01', label: 'ITEMS', title: '품목 관리', description: `${items.length}개 품목 등록`, to: '/items', ready: items.length > 0 },
    { index: '02', label: 'DEMAND', title: '수요 이력', description: `${demands.length}건 이력 연결`, to: '/demands', ready: demands.length > 0 },
    { index: '03', label: 'POLICY', title: '재고 정책', description: '실시간 계산', to: '/inventory-policy', ready: false },
    { index: '04', label: 'SCENARIO', title: '시나리오 비교', description: '조건별 시뮬레이션', to: '/scenario-compare', ready: false },
  ]
  return (
    <>
      <PageHeader eyebrow="OVERVIEW" index="00" title="재고 의사결정 대시보드" description="실제 등록 데이터의 규모를 확인하고 입력, 분석, 계산, 시뮬레이션 흐름으로 이동합니다." />
      {loading ? <LoadingPanel label="운영 데이터를 집계하는 중입니다." /> : error ? <ErrorPanel error={error} onRetry={() => { void itemsQuery.refetch(); void plansQuery.refetch(); void demandsQuery.refetch() }} /> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard index="01" label="등록 품목" value={integerFormatter.format(items.length)} unit="개" /><MetricCard index="02" label="총 현재재고" value={integerFormatter.format(totalStock)} unit="개" /><MetricCard index="03" label="수요 기록" value={integerFormatter.format(demands.length)} unit="건" /><MetricCard index="04" label="계획 생산량" value={integerFormatter.format(totalPlanned)} unit="개" /></div>
      <section className="relative mt-6 overflow-hidden rounded-[14px] border border-white/10 bg-gradient-to-br from-[#242a31] via-[#15191e] to-[#0d1014] p-6 text-white shadow-[0_14px_36px_rgba(15,23,42,0.18),0_1px_0_rgba(255,255,255,0.08)_inset] md:p-8">
        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[#91a4ff]">RECOMMENDED FLOW</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">입력 데이터에서 발주 결정까지</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">품목과 수요를 쌓고 ABC·재고정책을 계산한 뒤 생산계획과 BOM으로 MRP를 실행하세요. 비용 가정은 시나리오 비교에서 검증할 수 있습니다.</p>
            <Link to={items.length > 0 ? '/demands' : '/items'} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg transition-colors hover:bg-zinc-200">{items.length > 0 ? '수요 이력 열기' : '품목 관리 열기'} <ArrowUpRight size={16} /></Link>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)_inset]">
            <div className="mb-4 flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[0.16em] text-zinc-500">DECISION PIPELINE</span><span className="font-mono text-[10px] text-zinc-600">LIVE DATA</span></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {flow.map((step, index) => <Link key={step.label} to={step.to} className="relative rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-4 transition-colors hover:bg-white/[0.08]"><span className="font-mono text-[10px] text-zinc-600">{step.index}</span><p className="mt-5 text-[10px] font-semibold tracking-[0.12em] text-zinc-300">{step.label}</p><p className="mt-2 text-[10px] leading-4 text-zinc-600">{step.description}</p>{step.ready && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#6f8aff]" />}{index < 3 && <span className="absolute -right-1.5 top-1/2 z-10 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#171b21] bg-[#526fdf]" />}</Link>)}
            </div>
          </div>
        </div>
        <span className="pointer-events-none absolute -bottom-28 -right-14 h-72 w-72 rounded-full border-[48px] border-[#333cd1]/[0.07]" />
      </section>
      <Panel eyebrow="OPERATING DATA" title="현재 연결 상태" className="mt-6"><div className="grid gap-px bg-zinc-200 sm:grid-cols-3"><DataState icon={Boxes} label="품목 마스터" value={`${items.length}개`} ready={items.length > 0} /><DataState icon={ChartNoAxesCombined} label="수요 이력" value={`${demands.length}건`} ready={demands.length > 0} /><DataState icon={ClipboardList} label="생산 계획" value={`${plans.length}건`} ready={plans.length > 0} /></div></Panel>
      </>}
    </>
  )
}

function DataState({ icon: Icon, label, value, ready }: { icon: typeof Boxes; label: string; value: string; ready: boolean }) { return <div className="flex items-center gap-4 bg-white p-5"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50"><Icon size={17} className="text-zinc-600" /></span><div><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 font-semibold text-zinc-950">{value}</p></div><span className={`ml-auto h-2.5 w-2.5 rounded-full ${ready ? 'bg-[#4169e1]' : 'bg-zinc-300'}`} aria-label={ready ? '데이터 있음' : '데이터 없음'} /></div> }
