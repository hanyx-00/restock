import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { inventoryApi } from '@/api/endpoints'
import { ConfirmDialog, DialogShell, EmptyPanel, ErrorPanel, Field, InlineError, LoadingPanel, MetricCard, Notice, Panel, integerFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'
import type { DemandHistoryRequest, DemandHistoryResponse } from '@/types/api'

const schema = z.object({ demandDate: z.string().min(1, '수요 날짜를 선택해 주세요.'), quantity: z.string().regex(/^\d+$/, '수요량은 0 이상의 정수여야 합니다.') })
type FormValues = z.infer<typeof schema>

export function DemandsPage() {
  const queryClient = useQueryClient()
  const [itemId, setItemId] = useState<number | null>(null)
  const [editor, setEditor] = useState<DemandHistoryResponse | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DemandHistoryResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: async () => (await inventoryApi.items()).data })
  const items = itemsQuery.data ?? []
  const selectedItemId = itemId ?? items[0]?.id ?? null
  const demandsQuery = useQuery({ queryKey: ['demands', selectedItemId], queryFn: async () => (await inventoryApi.demandsByItem(selectedItemId!)).data, enabled: selectedItemId !== null })
  const demands = useMemo(() => [...(demandsQuery.data ?? [])].sort((a, b) => a.demandDate.localeCompare(b.demandDate)), [demandsQuery.data])
  const deleteMutation = useMutation({ mutationFn: (id: number) => inventoryApi.deleteDemand(id), onSuccess: async () => { setDeleteTarget(null); setMessage('수요 이력이 삭제되었습니다.'); await queryClient.invalidateQueries({ queryKey: ['demands', selectedItemId] }) } })
  const total = demands.reduce((sum, row) => sum + row.quantity, 0)
  const average = demands.length ? total / demands.length : 0

  return <>
    <PageHeader eyebrow="DEMAND HISTORY" index="02" title="수요 이력" description="품목별 실제 수요를 날짜 단위로 기록하고, 분석과 재고 정책 계산에 사용할 흐름을 확인합니다." action={<button type="button" className="button-primary" onClick={() => setEditor('new')} disabled={!selectedItemId}><Plus size={16} /> 수요 등록</button>} />
    {message && <Notice onClose={() => setMessage(null)}>{message}</Notice>}
    {itemsQuery.isLoading ? <LoadingPanel label="품목을 불러오는 중입니다." /> : itemsQuery.isError ? <ErrorPanel error={itemsQuery.error} onRetry={() => void itemsQuery.refetch()} /> : items.length === 0 ? <Panel title="분석 품목"><EmptyPanel title="먼저 품목을 등록해 주세요" description="수요 이력은 등록된 품목을 기준으로 관리합니다." /></Panel> : <>
      <Panel eyebrow="DATA SOURCE" title="분석 품목" className="mb-6"><div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"><Field label="품목 선택" hint="품목을 바꾸면 해당 품목의 수요 이력을 즉시 불러옵니다."><select className="form-input" value={selectedItemId ?? ''} onChange={(event) => setItemId(Number(event.target.value))}>{items.map((item) => <option key={item.id} value={item.id}>{item.itemCode} · {item.name}</option>)}</select></Field><span className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-500">GET /demands/item/{selectedItemId}</span></div></Panel>
      {demandsQuery.isLoading ? <LoadingPanel label="수요 이력을 불러오는 중입니다." /> : demandsQuery.isError ? <ErrorPanel error={demandsQuery.error} onRetry={() => void demandsQuery.refetch()} /> : <>
        <section className="mb-6 grid gap-3 sm:grid-cols-3"><MetricCard index="01" label="기록 수" value={integerFormatter.format(demands.length)} unit="건" /><MetricCard index="02" label="누적 수요" value={integerFormatter.format(total)} unit="개" /><MetricCard index="03" label="기록당 평균" value={integerFormatter.format(average)} unit="개" /></section>
        {demands.length > 0 && <DemandChart rows={demands} />}
        <Panel eyebrow="DEMAND LEDGER" title="날짜별 수요" meta={<span className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[10px] text-zinc-500">{String(demands.length).padStart(3, '0')} RECORDS</span>}>
          {demands.length === 0 ? <EmptyPanel title="등록된 수요 이력이 없습니다" description="날짜와 실제 수요량을 등록하면 추이와 누적 수요를 확인할 수 있습니다." action={<button type="button" className="button-primary" onClick={() => setEditor('new')}><Plus size={15} /> 첫 수요 등록</button>} /> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left"><thead><tr className="bg-[#171b20] text-[10px] tracking-[0.14em] text-zinc-400"><th className="px-5 py-4">수요일</th><th className="px-5 py-4">품목</th><th className="px-5 py-4 text-right">수요량</th><th className="w-24 px-4 py-4"><span className="sr-only">작업</span></th></tr></thead><tbody>{[...demands].reverse().map((row) => <tr key={row.id} className="group border-b border-zinc-200 text-sm last:border-0 hover:bg-zinc-50"><td className="px-5 py-4 font-mono text-xs text-zinc-700">{row.demandDate}</td><td className="px-5 py-4"><strong className="font-semibold text-zinc-950">{row.itemName}</strong><span className="ml-2 font-mono text-xs text-zinc-400">{row.itemCode}</span></td><td className="px-5 py-4 text-right tabular-nums font-semibold">{integerFormatter.format(row.quantity)}개</td><td className="px-4 py-2 text-right"><button type="button" className="row-action" aria-label={`${row.demandDate} 수요 수정`} onClick={() => setEditor(row)}><Pencil size={15} /></button><button type="button" className="row-action row-action-danger" aria-label={`${row.demandDate} 수요 삭제`} onClick={() => setDeleteTarget(row)}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>}
        </Panel>
      </>}
    </>}
    {editor && selectedItemId && <DemandDialog itemId={selectedItemId} existing={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSaved={(text) => { setEditor(null); setMessage(text) }} />}
    {deleteTarget && <ConfirmDialog title="이 수요 이력을 삭제할까요?" description={<><strong>{deleteTarget.demandDate}</strong>의 수요 {integerFormatter.format(deleteTarget.quantity)}개가 삭제됩니다.</>} pending={deleteMutation.isPending} error={deleteMutation.error} onCancel={() => { if (!deleteMutation.isPending) { deleteMutation.reset(); setDeleteTarget(null) } }} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} />}
  </>
}

function DemandChart({ rows }: { rows: DemandHistoryResponse[] }) {
  const max = Math.max(...rows.map((row) => row.quantity), 1)
  const points = rows.map((row, index) => `${rows.length === 1 ? 50 : (index / (rows.length - 1)) * 100},${92 - (row.quantity / max) * 72}`).join(' ')
  return <Panel eyebrow="VISUAL TREND" title="수요 추이" className="mb-6" meta={<span className="text-xs text-zinc-500">최대 {integerFormatter.format(max)}개</span>}><div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#1c2127] to-[#0d1014] p-5"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="날짜별 수요량 추이"><defs><linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5d7df0" stopOpacity=".42"/><stop offset="1" stopColor="#5d7df0" stopOpacity="0"/></linearGradient></defs>{[20,44,68,92].map((y) => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#343a42" strokeWidth=".45"/>)}<polygon points={`0,100 ${points} 100,100`} fill="url(#demandFill)"/><polyline points={points} fill="none" stroke="#7590ff" strokeWidth="1.6" vectorEffect="non-scaling-stroke"/></svg><div className="absolute bottom-3 left-5 right-5 flex justify-between font-mono text-[9px] text-zinc-500"><span>{rows[0]?.demandDate}</span><span>{rows.at(-1)?.demandDate}</span></div></div></Panel>
}

function DemandDialog({ itemId, existing, onClose, onSaved }: { itemId: number; existing: DemandHistoryResponse | null; onClose: () => void; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { demandDate: existing?.demandDate ?? new Date().toISOString().slice(0, 10), quantity: existing ? String(existing.quantity) : '' } })
  const mutation = useMutation({ mutationFn: (body: DemandHistoryRequest) => existing ? inventoryApi.updateDemand(existing.id, body) : inventoryApi.createDemand(body), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['demands', itemId] }); onSaved(existing ? '수요 이력이 수정되었습니다.' : '수요 이력이 등록되었습니다.') } })
  return <DialogShell eyebrow={existing ? 'EDIT DEMAND' : 'NEW DEMAND'} title={existing ? '수요 이력 수정' : '수요 이력 등록'} pending={mutation.isPending} onClose={onClose}><form onSubmit={form.handleSubmit((values) => mutation.mutate({ itemId, demandDate: values.demandDate, quantity: Number(values.quantity) }))} noValidate><div className="space-y-5 px-6 py-6">{mutation.isError && <InlineError error={mutation.error} />}<Field label="수요 날짜" error={form.formState.errors.demandDate?.message}><input type="date" className="form-input" autoFocus {...form.register('demandDate')} /></Field><Field label="수요량" error={form.formState.errors.quantity?.message}><div className="relative"><input className="form-input pr-10 tabular-nums" inputMode="numeric" placeholder="0" {...form.register('quantity')} /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-zinc-500">개</span></div></Field></div><div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4"><button type="button" className="button-secondary" onClick={onClose} disabled={mutation.isPending}>취소</button><button type="submit" className="button-primary min-w-24" disabled={mutation.isPending}>{mutation.isPending ? <><LoaderCircle className="animate-spin" size={15}/> 저장 중</> : '저장'}</button></div></form></DialogShell>
}
