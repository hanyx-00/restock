import { useMutation, useQuery } from '@tanstack/react-query'
import { CalendarClock, CheckCircle2, LoaderCircle, PackageSearch, Play, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { inventoryApi } from '@/api/endpoints'
import { EmptyPanel, ErrorPanel, Field, InlineError, LoadingPanel, MetricCard, Panel, integerFormatter, numberFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'
import type { MrpItemResult, MrpResponse } from '@/types/api'

export function MrpPage() {
  const [planId, setPlanId] = useState<number | null>(null)
  const plansQuery = useQuery({ queryKey: ['production-plans'], queryFn: async () => (await inventoryApi.productionPlans()).data })
  const plans = plansQuery.data ?? []
  const selectedPlanId = planId ?? plans[0]?.id ?? null
  const calculate = useMutation({ mutationFn: async (id: number) => (await inventoryApi.mrp(id)).data })
  return <>
    <PageHeader eyebrow="MATERIAL REQUIREMENTS" index="07" title="MRP 자재소요계획" description="생산계획, BOM, 현재고와 리드타임을 결합해 부족 수량과 발주 시점을 계산합니다." />
    {plansQuery.isLoading ? <LoadingPanel /> : plansQuery.isError ? <ErrorPanel error={plansQuery.error} onRetry={() => void plansQuery.refetch()} /> : plans.length === 0 ? <Panel title="생산 계획"><EmptyPanel title="먼저 생산 계획을 등록해 주세요" description="MRP는 생산할 품목, 필요일, 계획 수량을 기준으로 계산합니다." /></Panel> : <>
      <Panel eyebrow="CALCULATION INPUT" title="생산 계획 선택" className="mb-6"><div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><Field label="계산 대상"><select className="form-input" value={selectedPlanId ?? ''} onChange={(event) => { setPlanId(Number(event.target.value)); calculate.reset() }}>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.requiredDate} · {plan.itemCode} {plan.itemName} · {integerFormatter.format(plan.quantity)}개</option>)}</select></Field><button type="button" className="button-primary" disabled={!selectedPlanId || calculate.isPending} onClick={() => selectedPlanId && calculate.mutate(selectedPlanId)}>{calculate.isPending ? <><LoaderCircle className="animate-spin" size={15}/> 계산 중</> : <><Play size={15}/> MRP 계산</>}</button></div></Panel>
      {calculate.isError && <div className="mb-6"><InlineError error={calculate.error} /></div>}
      {calculate.data ? <MrpResult result={calculate.data} /> : !calculate.isError && <Panel eyebrow="DECISION OUTPUT" title="계산 결과"><EmptyPanel title="생산 계획을 선택하고 계산하세요" description="BOM이 등록된 생산 품목에 대해 총소요량, 부족량, 계획입고량과 발주일을 계산합니다." action={<PackageSearch className="mx-auto text-[#4169e1]" size={28}/>} /></Panel>}
    </>}
  </>
}

function MrpResult({ result }: { result: MrpResponse }) {
  const shortages = result.materials.filter((material) => material.netRequirement > 0)
  const totalNet = shortages.reduce((sum, material) => sum + material.netRequirement, 0)
  return <><section className="mb-6 grid gap-3 sm:grid-cols-3"><MetricCard index="01" label="자재 종류" value={result.materials.length} unit="종" /><MetricCard index="02" label="부족 자재" value={shortages.length} unit="종" /><MetricCard index="03" label="총 순소요량" value={numberFormatter.format(totalNet)} unit="단위" /></section><Panel eyebrow="MRP RESULT" title={`${result.parentItemName} · ${integerFormatter.format(result.plannedQuantity)}개 생산`} meta={<span className="font-mono text-xs text-zinc-500">NEED BY {result.requiredDate}</span>}><div className="grid gap-px bg-zinc-200 lg:grid-cols-2">{result.materials.map((material) => <MaterialDecision key={material.componentItemId} material={material} />)}</div><div className="overflow-x-auto border-t border-zinc-200"><table className="w-full min-w-[980px] text-left"><thead><tr className="bg-[#171b20] text-[10px] tracking-[0.13em] text-zinc-400"><th className="px-5 py-4">자재</th><th className="px-5 py-4 text-right">단위소요</th><th className="px-5 py-4 text-right">총소요량</th><th className="px-5 py-4 text-right">현재고</th><th className="px-5 py-4 text-right">순소요량</th><th className="px-5 py-4 text-right">계획입고</th><th className="px-5 py-4">발주일</th></tr></thead><tbody>{result.materials.map((material) => <tr key={material.componentItemId} className="border-b border-zinc-200 text-sm last:border-0"><td className="px-5 py-4"><strong className="block font-semibold text-zinc-950">{material.componentItemName}</strong><span className="font-mono text-xs text-zinc-400">{material.componentItemCode}</span></td><td className="px-5 py-4 text-right tabular-nums">{numberFormatter.format(material.quantityPer)}</td><td className="px-5 py-4 text-right tabular-nums">{numberFormatter.format(material.grossRequirement)}</td><td className="px-5 py-4 text-right tabular-nums">{integerFormatter.format(material.onHandQuantity)}</td><td className="px-5 py-4 text-right tabular-nums font-semibold">{numberFormatter.format(material.netRequirement)}</td><td className="px-5 py-4 text-right tabular-nums">{numberFormatter.format(material.plannedOrderReceipt)}</td><td className="px-5 py-4 font-mono text-xs">{material.plannedOrderReleaseDate ?? '발주 불필요'}</td></tr>)}</tbody></table></div></Panel></>
}

function MaterialDecision({ material }: { material: MrpItemResult }) {
  const shortage = material.netRequirement > 0
  return <article className="bg-white p-5 md:p-6"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] tracking-[0.13em] text-zinc-400">{material.componentItemCode}</p><h3 className="mt-1 font-semibold text-zinc-950">{material.componentItemName}</h3></div>{shortage ? <TriangleAlert className="text-amber-600" size={19}/> : <CheckCircle2 className="text-emerald-600" size={19}/>}</div>{shortage ? <><p className="mt-5 text-xl font-semibold tracking-tight text-zinc-950"><span className="text-[#4169e1]">{numberFormatter.format(material.netRequirement)}개 부족</span>합니다.</p><p className="mt-2 flex items-center gap-2 text-sm text-zinc-600"><CalendarClock size={15}/><strong className="text-zinc-900">{material.plannedOrderReleaseDate}</strong>까지 발주하세요.</p><p className="mt-3 text-xs leading-5 text-zinc-500">필요일 {material.requiredDate}에서 리드타임 {material.leadTimeDays}일을 역산했습니다.</p></> : <><p className="mt-5 text-xl font-semibold tracking-tight text-zinc-950">현재고로 충당 가능합니다.</p><p className="mt-2 text-sm text-zinc-600">총소요 {numberFormatter.format(material.grossRequirement)}개 · 현재고 {integerFormatter.format(material.onHandQuantity)}개</p><p className="mt-3 text-xs text-zinc-500">순소요량이 0이므로 별도 발주가 필요하지 않습니다.</p></>}</article>
}
