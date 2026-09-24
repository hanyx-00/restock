import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRight, LoaderCircle, Play, Settings2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { inventoryApi } from '@/api/endpoints'
import { EmptyPanel, ErrorPanel, Field, InlineError, LoadingPanel, MetricCard, Panel, integerFormatter, numberFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'
import type { InventoryPolicyRequest, InventoryPolicyResponse } from '@/types/api'

const positive = z.string().min(1, '값을 입력해 주세요.').refine((value) => Number(value) > 0, '0보다 큰 숫자여야 합니다.')
const schema = z.object({ itemId: z.string().min(1, '품목을 선택해 주세요.'), year: z.string().refine((value) => Number(value) >= 2000, '2000년 이상이어야 합니다.'), orderingCost: positive, annualHoldingCostPerUnit: positive })
type FormValues = z.infer<typeof schema>

export function InventoryPolicyPage() {
  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: async () => (await inventoryApi.items()).data })
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { itemId: '', year: String(new Date().getFullYear()), orderingCost: '50000', annualHoldingCostPerUnit: '1000' } })
  useEffect(() => { if (!form.getValues('itemId') && itemsQuery.data?.[0]) form.setValue('itemId', String(itemsQuery.data[0].id)) }, [form, itemsQuery.data])
  const calculate = useMutation({ mutationFn: async (body: InventoryPolicyRequest) => (await inventoryApi.calculatePolicy(body)).data })
  const submit = form.handleSubmit((values) => calculate.mutate({ itemId: Number(values.itemId), year: Number(values.year), orderingCost: Number(values.orderingCost), annualHoldingCostPerUnit: Number(values.annualHoldingCostPerUnit) }))
  return <>
    <PageHeader eyebrow="POLICY ENGINE" index="04" title="재고 정책 계산" description="수요 변동과 비용 조건을 실제 데이터에 적용해 EOQ, 안전재고, 재주문점을 계산합니다." />
    {itemsQuery.isLoading ? <LoadingPanel /> : itemsQuery.isError ? <ErrorPanel error={itemsQuery.error} onRetry={() => void itemsQuery.refetch()} /> : (itemsQuery.data?.length ?? 0) === 0 ? <Panel title="계산 조건"><EmptyPanel title="먼저 품목과 수요를 등록해 주세요" description="재고 정책은 품목의 리드타임과 선택 연도의 수요 이력을 사용합니다." /></Panel> : <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Panel eyebrow="CONTROL PANEL" title="계산 조건"><form className="space-y-5 p-5" onSubmit={submit} noValidate>{calculate.isError && <InlineError error={calculate.error} />}<Field label="품목" error={form.formState.errors.itemId?.message}><select className="form-input" {...form.register('itemId')}>{itemsQuery.data?.map((item) => <option key={item.id} value={item.id}>{item.itemCode} · {item.name}</option>)}</select></Field><Field label="분석 연도" error={form.formState.errors.year?.message}><input type="number" min="2000" max="2100" className="form-input tabular-nums" {...form.register('year')} /></Field><Field label="1회 주문비용" hint="주문 한 번을 실행할 때 발생하는 고정 비용입니다." error={form.formState.errors.orderingCost?.message}><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">₩</span><input className="form-input pl-8 tabular-nums" inputMode="decimal" {...form.register('orderingCost')} /></div></Field><Field label="연간 단위당 보관비용" hint="품목 한 개를 1년간 보관하는 비용입니다." error={form.formState.errors.annualHoldingCostPerUnit?.message}><div className="relative"><span className="absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">₩</span><input className="form-input pl-8 tabular-nums" inputMode="decimal" {...form.register('annualHoldingCostPerUnit')} /></div></Field><button type="submit" className="button-primary w-full" disabled={calculate.isPending}>{calculate.isPending ? <><LoaderCircle className="animate-spin" size={15}/> 계산 중</> : <><Play size={15}/> 정책 계산</>}</button></form></Panel>
      <PolicyResult result={calculate.data} />
    </div>}
  </>
}

function PolicyResult({ result }: { result?: InventoryPolicyResponse }) {
  if (!result) return <Panel eyebrow="DECISION OUTPUT" title="계산 결과" className="min-h-[520px]"><EmptyPanel title="조건을 입력하고 계산을 실행하세요" description="결과에는 주문 단위, 변동 대응 재고, 발주 시작 기준과 계산 근거가 표시됩니다." action={<Settings2 className="mx-auto text-[#4169e1]" size={28}/>} /></Panel>
  return <div className="space-y-6"><section className="grid gap-3 sm:grid-cols-3"><MetricCard index="EOQ" label="경제적 주문량" value={numberFormatter.format(result.economicOrderQuantity)} unit="개" /><MetricCard index="SS" label="안전재고" value={numberFormatter.format(result.safetyStock)} unit="개" /><MetricCard index="ROP" label="재주문점" value={numberFormatter.format(result.reorderPoint)} unit="개" /></section><Panel eyebrow="POLICY INTERPRETATION" title={`${result.itemName} 운영 기준`}><div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]"><div className="bg-gradient-to-br from-[#1c2127] to-[#0d1014] p-6 text-white md:p-8"><p className="text-[10px] font-bold tracking-[0.18em] text-[#91a4ff]">ACTION GUIDE / GRADE {result.abcGrade}</p><h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight">재고가 {numberFormatter.format(result.reorderPoint)}개에 도달하면<br/><span className="text-[#91a4ff]">{numberFormatter.format(result.economicOrderQuantity)}개</span> 주문을 검토하세요.</h3><div className="mt-7 flex items-center gap-3 text-xs text-zinc-400"><span>재고 관찰</span><ArrowRight size={14}/><span>ROP 도달</span><ArrowRight size={14}/><span>EOQ 주문</span></div></div><dl className="grid grid-cols-2 gap-px bg-zinc-200"><Stat label="ABC 등급" value={result.abcGrade} /><Stat label="목표 서비스율" value={`${result.serviceLevel}%`} /><Stat label="연간 수요" value={`${integerFormatter.format(result.annualDemand)}개`} /><Stat label="일평균 수요" value={`${numberFormatter.format(result.averageDailyDemand)}개`} /><Stat label="일수요 표준편차" value={numberFormatter.format(result.dailyDemandStandardDeviation)} /><Stat label="분석 연도" value={`${result.year}년`} /></dl></div></Panel></div>
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="bg-white p-5"><dt className="text-[10px] font-bold tracking-[0.12em] text-zinc-500">{label}</dt><dd className="mt-2 tabular-nums text-lg font-semibold text-zinc-950">{value}</dd></div> }
