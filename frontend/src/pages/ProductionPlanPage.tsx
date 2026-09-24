import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { inventoryApi } from '@/api/endpoints'
import { ConfirmDialog, DialogShell, EmptyPanel, ErrorPanel, Field, InlineError, LoadingPanel, MetricCard, Notice, Panel, integerFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'
import type { ItemResponse, PlannedDemandRequest, PlannedDemandResponse } from '@/types/api'

const schema = z.object({ itemId: z.string().min(1, '생산 품목을 선택해 주세요.'), requiredDate: z.string().min(1, '필요일을 선택해 주세요.'), quantity: z.string().regex(/^[1-9]\d*$/, '계획 수량은 0보다 큰 정수여야 합니다.') })
type FormValues = z.infer<typeof schema>

export function ProductionPlanPage() {
  const queryClient = useQueryClient()
  const [editor, setEditor] = useState<PlannedDemandResponse | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlannedDemandResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: async () => (await inventoryApi.items()).data })
  const plansQuery = useQuery({ queryKey: ['production-plans'], queryFn: async () => (await inventoryApi.productionPlans()).data })
  const plans = plansQuery.data ?? []
  const deleteMutation = useMutation({ mutationFn: (id: number) => inventoryApi.deleteProductionPlan(id), onSuccess: async () => { setDeleteTarget(null); setMessage('생산 계획이 삭제되었습니다.'); await queryClient.invalidateQueries({ queryKey: ['production-plans'] }) } })
  const totalQuantity = plans.reduce((sum, plan) => sum + plan.quantity, 0)
  const upcoming = plans.filter((plan) => plan.requiredDate >= new Date().toISOString().slice(0, 10)).length
  return <>
    <PageHeader eyebrow="PRODUCTION SCHEDULE" index="06" title="생산 계획" description="완제품의 필요일과 계획 수량을 등록해 MRP 계산의 출발점을 만듭니다." action={<button type="button" className="button-primary" disabled={(itemsQuery.data?.length ?? 0) === 0} onClick={() => setEditor('new')}><Plus size={16}/> 계획 등록</button>} />
    {message && <Notice onClose={() => setMessage(null)}>{message}</Notice>}
    {itemsQuery.isError ? <ErrorPanel error={itemsQuery.error} onRetry={() => void itemsQuery.refetch()} /> : plansQuery.isLoading || itemsQuery.isLoading ? <LoadingPanel /> : plansQuery.isError ? <ErrorPanel error={plansQuery.error} onRetry={() => void plansQuery.refetch()} /> : <><section className="mb-6 grid gap-3 sm:grid-cols-3"><MetricCard index="01" label="전체 계획" value={plans.length} unit="건" /><MetricCard index="02" label="계획 생산량" value={integerFormatter.format(totalQuantity)} unit="개" /><MetricCard index="03" label="예정 계획" value={upcoming} unit="건" /></section><Panel eyebrow="PLAN DIRECTORY" title="생산 일정" meta={<span className="font-mono text-[10px] text-zinc-500">{String(plans.length).padStart(3, '0')} PLANS</span>}>{plans.length === 0 ? <EmptyPanel title="등록된 생산 계획이 없습니다" description="생산할 품목, 필요일, 수량을 등록하면 MRP에서 자재 소요량을 계산할 수 있습니다." action={<button type="button" className="button-primary" onClick={() => setEditor('new')} disabled={(itemsQuery.data?.length ?? 0) === 0}><Plus size={15}/> 첫 계획 등록</button>} /> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-[#171b20] text-[10px] tracking-[0.14em] text-zinc-400"><th className="px-5 py-4">계획 ID</th><th className="px-5 py-4">생산 품목</th><th className="px-5 py-4">필요일</th><th className="px-5 py-4 text-right">계획 수량</th><th className="w-24 px-4 py-4"><span className="sr-only">작업</span></th></tr></thead><tbody>{plans.map((plan) => <tr key={plan.id} className="group border-b border-zinc-200 text-sm last:border-0 hover:bg-zinc-50"><td className="px-5 py-4 font-mono text-xs text-zinc-500">PLAN-{String(plan.id).padStart(4, '0')}</td><td className="px-5 py-4"><strong className="block font-semibold text-zinc-950">{plan.itemName}</strong><span className="font-mono text-xs text-zinc-400">{plan.itemCode}</span></td><td className="px-5 py-4 font-mono text-xs text-zinc-700">{plan.requiredDate}</td><td className="px-5 py-4 text-right tabular-nums font-semibold">{integerFormatter.format(plan.quantity)}개</td><td className="px-4 py-2 text-right"><button type="button" className="row-action" aria-label={`${plan.itemName} 생산 계획 수정`} onClick={() => setEditor(plan)}><Pencil size={15}/></button><button type="button" className="row-action row-action-danger" aria-label={`${plan.itemName} 생산 계획 삭제`} onClick={() => setDeleteTarget(plan)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}</Panel></>}
    {editor && <PlanDialog items={itemsQuery.data ?? []} existing={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSaved={(text) => { setEditor(null); setMessage(text) }} />}
    {deleteTarget && <ConfirmDialog title="이 생산 계획을 삭제할까요?" description={<><strong>{deleteTarget.itemName}</strong> {integerFormatter.format(deleteTarget.quantity)}개 계획이 삭제됩니다.</>} pending={deleteMutation.isPending} error={deleteMutation.error} onCancel={() => { if (!deleteMutation.isPending) { deleteMutation.reset(); setDeleteTarget(null) } }} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} />}
  </>
}

function PlanDialog({ items, existing, onClose, onSaved }: { items: ItemResponse[]; existing: PlannedDemandResponse | null; onClose: () => void; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient()
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { itemId: String(existing?.itemId ?? items[0]?.id ?? ''), requiredDate: existing?.requiredDate ?? new Date().toISOString().slice(0, 10), quantity: existing ? String(existing.quantity) : '' } })
  const mutation = useMutation({ mutationFn: (body: PlannedDemandRequest) => existing ? inventoryApi.updateProductionPlan(existing.id, body) : inventoryApi.createProductionPlan(body), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['production-plans'] }); onSaved(existing ? '생산 계획이 수정되었습니다.' : '생산 계획이 등록되었습니다.') } })
  return <DialogShell eyebrow={existing ? 'EDIT PLAN' : 'NEW PLAN'} title={existing ? '생산 계획 수정' : '생산 계획 등록'} pending={mutation.isPending} onClose={onClose}><form onSubmit={form.handleSubmit((values) => mutation.mutate({ itemId: Number(values.itemId), requiredDate: values.requiredDate, quantity: Number(values.quantity) }))}><div className="space-y-5 px-6 py-6">{mutation.isError && <InlineError error={mutation.error} />}<Field label="생산 품목" error={form.formState.errors.itemId?.message}><select className="form-input" autoFocus {...form.register('itemId')}>{items.map((item) => <option key={item.id} value={item.id}>{item.itemCode} · {item.name}</option>)}</select></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="필요일" error={form.formState.errors.requiredDate?.message}><input type="date" className="form-input" {...form.register('requiredDate')} /></Field><Field label="계획 수량" error={form.formState.errors.quantity?.message}><input className="form-input tabular-nums" inputMode="numeric" placeholder="0" {...form.register('quantity')} /></Field></div></div><div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4"><button type="button" className="button-secondary" onClick={onClose}>취소</button><button type="submit" className="button-primary" disabled={mutation.isPending}>{mutation.isPending ? <><LoaderCircle className="animate-spin" size={15}/> 저장 중</> : '저장'}</button></div></form></DialogShell>
}
