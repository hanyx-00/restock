import { useMutation } from '@tanstack/react-query'
import { BarChart3, LoaderCircle, Play } from 'lucide-react'
import { useState } from 'react'
import { inventoryApi } from '@/api/endpoints'
import { EmptyPanel, InlineError, MetricCard, Panel, currencyFormatter, integerFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'
import type { AbcResultResponse } from '@/types/api'

const currentYear = new Date().getFullYear()

export function AbcPage() {
  const [year, setYear] = useState(currentYear)
  const analysis = useMutation({ mutationFn: async (targetYear: number) => (await inventoryApi.abc(targetYear)).data })
  const rows = analysis.data ?? []
  const counts = (grade: string) => rows.filter((row) => row.grade === grade).length
  const totalValue = rows.reduce((sum, row) => sum + row.usageValue, 0)
  return <>
    <PageHeader eyebrow="ABC CLASSIFICATION" index="03" title="ABC 분석" description="연간 수요와 단가를 결합해 사용가치가 높은 품목부터 A·B·C 등급으로 분류합니다." />
    <Panel eyebrow="ANALYSIS INPUT" title="분석 조건" className="mb-6"><div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><label><span className="mb-2 block text-sm font-medium text-zinc-800">분석 연도</span><input className="form-input tabular-nums" type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} /></label><button type="button" className="button-primary" disabled={analysis.isPending || year < 2000} onClick={() => analysis.mutate(year)}>{analysis.isPending ? <><LoaderCircle className="animate-spin" size={15}/> 분석 중</> : <><Play size={15}/> ABC 분석 실행</>}</button></div></Panel>
    {analysis.isError && <div className="mb-6"><InlineError error={analysis.error} /></div>}
    {analysis.isSuccess && <>
      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard index="A" label="핵심 관리" value={counts('A')} unit="품목" detail="누적 사용가치 80% 이내" /><MetricCard index="B" label="중점 관리" value={counts('B')} unit="품목" detail="누적 사용가치 95% 이내" /><MetricCard index="C" label="일반 관리" value={counts('C')} unit="품목" detail="나머지 사용가치 구간" /><MetricCard index="Σ" label="총 사용가치" value={`₩${currencyFormatter.format(totalValue)}`} /></section>
      <Panel eyebrow="CLASSIFICATION RESULT" title={`${year}년 분석 결과`} meta={<span className="font-mono text-[10px] text-zinc-500">{String(rows.length).padStart(3, '0')} ITEMS</span>}>{rows.length === 0 ? <EmptyPanel title="분석 결과가 없습니다" description="선택한 연도의 수요 데이터를 확인해 주세요." /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="bg-[#171b20] text-[10px] tracking-[0.13em] text-zinc-400"><th className="px-5 py-4">순위</th><th className="px-5 py-4">등급</th><th className="px-5 py-4">품목</th><th className="px-5 py-4 text-right">연간 수요</th><th className="px-5 py-4 text-right">단가</th><th className="px-5 py-4 text-right">사용가치</th><th className="px-5 py-4 text-right">비중</th><th className="px-5 py-4 text-right">누적</th></tr></thead><tbody>{rows.map((row) => <AbcRow key={row.itemId} row={row} />)}</tbody></table></div>}</Panel>
    </>}
    {!analysis.isSuccess && !analysis.isPending && <Panel title="분석 대기"><EmptyPanel title="연도를 선택하고 분석을 실행하세요" description="수요 이력이 있는 연도를 선택하면 품목별 사용가치와 누적 비율을 실제 데이터로 계산합니다." action={<BarChart3 className="mx-auto text-[#4169e1]" size={26}/>} /></Panel>}
  </>
}

function AbcRow({ row }: { row: AbcResultResponse }) {
  const gradeStyle = row.grade === 'A' ? 'bg-[#4169e1] text-white' : row.grade === 'B' ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-700'
  return <tr className="border-b border-zinc-200 text-sm last:border-0 hover:bg-zinc-50"><td className="px-5 py-4 font-mono text-xs text-zinc-500">#{String(row.rank).padStart(2, '0')}</td><td className="px-5 py-4"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono font-bold ${gradeStyle}`}>{row.grade}</span></td><td className="px-5 py-4"><strong className="block font-semibold text-zinc-950">{row.itemName}</strong><span className="font-mono text-xs text-zinc-400">{row.itemCode}</span></td><td className="px-5 py-4 text-right tabular-nums">{integerFormatter.format(row.totalDemand)}</td><td className="px-5 py-4 text-right tabular-nums">₩{currencyFormatter.format(row.unitPrice)}</td><td className="px-5 py-4 text-right tabular-nums font-semibold">₩{currencyFormatter.format(row.usageValue)}</td><td className="px-5 py-4 text-right tabular-nums">{row.sharePercent.toFixed(2)}%</td><td className="px-5 py-4 text-right"><div className="ml-auto w-28"><div className="mb-1 text-right tabular-nums text-xs">{row.cumulativePercent.toFixed(2)}%</div><div className="h-1.5 overflow-hidden rounded-full bg-zinc-200"><span className="block h-full bg-[#4169e1]" style={{ width: `${Math.min(row.cumulativePercent, 100)}%` }} /></div></div></td></tr>
}
