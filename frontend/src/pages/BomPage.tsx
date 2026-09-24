import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { inventoryApi } from '@/api/endpoints'
import { ConfirmDialog, DialogShell, EmptyPanel, ErrorPanel, Field, InlineError, LoadingPanel, MetricCard, Notice, Panel, numberFormatter } from '@/components/common/WorkbenchUi'
import { PageHeader } from '@/components/common/PageHeader'
import type { BomRequest, BomResponse, ItemResponse } from '@/types/api'

const schema = z.object({ componentItemId: z.string().min(1, '구성품을 선택해 주세요.'), quantityPer: z.string().min(1, '필요 수량을 입력해 주세요.').refine((value) => Number(value) > 0, '필요 수량은 0보다 커야 합니다.') })
type FormValues = z.infer<typeof schema>

export function BomPage() {
  const queryClient = useQueryClient()
  const [parentId, setParentId] = useState<number | null>(null)
  const [editor, setEditor] = useState<BomResponse | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BomResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: async () => (await inventoryApi.items()).data })
  const items = itemsQuery.data ?? []
  const selectedParentId = parentId ?? items[0]?.id ?? null
  const bomQuery = useQuery({ queryKey: ['bom', selectedParentId], queryFn: async () => (await inventoryApi.bomByParent(selectedParentId!)).data, enabled: selectedParentId !== null })
  const rows = bomQuery.data ?? []
  const deleteMutation = useMutation({ mutationFn: (id: number) => inventoryApi.deleteBom(id), onSuccess: async () => { setDeleteTarget(null); setMessage('BOM 구성품이 삭제되었습니다.'); await queryClient.invalidateQueries({ queryKey: ['bom', selectedParentId] }) } })
  const totalUnits = rows.reduce((sum, row) => sum + row.quantityPer, 0)
  return <>
    <PageHeader eyebrow="BILL OF MATERIALS" index="05" title="BOM 구성" description="완제품 한 개를 만드는 데 필요한 구성품과 단위 소요량을 정의합니다." action={<button type="button" className="button-primary" disabled={!selectedParentId || items.length < 2} onClick={() => setEditor('new')}><Plus size={16}/> 구성품 추가</button>} />
    {message && <Notice onClose={() => setMessage(null)}>{message}</Notice>}
    {itemsQuery.isLoading ? <LoadingPanel /> : itemsQuery.isError ? <ErrorPanel error={itemsQuery.error} onRetry={() => void itemsQuery.refetch()} /> : items.length === 0 ? <Panel title="완제품"><EmptyPanel title="먼저 품목을 등록해 주세요" description="상위 완제품과 구성품으로 사용할 품목이 필요합니다." /></Panel> : <>
      <Panel eyebrow="PARENT ASSEMBLY" title="완제품 선택" className="mb-6"><div className="p-5"><Field label="상위 품목" hint="선택한 품목을 생산하는 데 필요한 하위 구성품을 관리합니다."><select className="form-input" value={selectedParentId ?? ''} onChange={(event) => setParentId(Number(event.target.value))}>{items.map((item) => <option key={item.id} value={item.id}>{item.itemCode} · {item.name}</option>)}</select></Field></div></Panel>
      {bomQuery.isLoading ? <LoadingPanel /> : bomQuery.isError ? <ErrorPanel error={bomQuery.error} onRetry={() => void bomQuery.refetch()} /> : <><section className="mb-6 grid gap-3 sm:grid-cols-2"><MetricCard index="01" label="구성품 종류" value={rows.length} unit="종" /><MetricCard index="02" label="제품 1개당 총 단위" value={numberFormatter.format(totalUnits)} unit="단위" /></section><Panel eyebrow="COMPONENT DIRECTORY" title="구성품 목록" meta={<span className="font-mono text-[10px] text-zinc-500">{String(rows.length).padStart(3, '0')} COMPONENTS</span>}>{rows.length === 0 ? <EmptyPanel title="등록된 구성품이 없습니다" description="MRP 계산을 위해 이 완제품의 구성품과 필요 수량을 추가하세요." action={<button type="button" className="button-primary" onClick={() => setEditor('new')} disabled={items.length < 2}><Plus size={15}/> 첫 구성품 추가</button>} /> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="bg-[#171b20] text-[10px] tracking-[0.14em] text-zinc-400"><th className="px-5 py-4">구조</th><th className="px-5 py-4">구성품</th><th className="px-5 py-4 text-right">단위 소요량</th><th className="w-24 px-4 py-4"><span className="sr-only">작업</span></th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className="group border-b border-zinc-200 text-sm last:border-0 hover:bg-zinc-50"><td className="px-5 py-4 font-mono text-xs text-zinc-400">├─ {String(index + 1).padStart(2, '0')}</td><td className="px-5 py-4"><strong className="block font-semibold text-zinc-950">{row.componentItemName}</strong><span className="font-mono text-xs text-zinc-400">{row.componentItemCode}</span></td><td className="px-5 py-4 text-right tabular-nums font-semibold">{numberFormatter.format(row.quantityPer)}</td><td className="px-4 py-2 text-right"><button type="button" className="row-action" aria-label={`${row.componentItemName} 필요 수량 수정`} onClick={() => setEditor(row)}><Pencil size={15}/></button><button type="button" className="row-action row-action-danger" aria-label={`${row.componentItemName} 삭제`} onClick={() => setDeleteTarget(row)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}</Panel></>}
    </>}
    {editor && selectedParentId && <BomDialog parentId={selectedParentId} items={items} existing={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSaved={(text) => { setEditor(null); setMessage(text) }} />}
    {deleteTarget && <ConfirmDialog title="이 구성품을 삭제할까요?" description={<><strong>{deleteTarget.componentItemName}</strong> 구성품을 BOM에서 제거합니다.</>} pending={deleteMutation.isPending} error={deleteMutation.error} onCancel={() => { if (!deleteMutation.isPending) { deleteMutation.reset(); setDeleteTarget(null) } }} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} />}
  </>
}

function BomDialog({ parentId, items, existing, onClose, onSaved }: { parentId: number; items: ItemResponse[]; existing: BomResponse | null; onClose: () => void; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient()
  const components = items.filter((item) => item.id !== parentId)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { componentItemId: existing ? String(existing.componentItemId) : String(components[0]?.id ?? ''), quantityPer: existing ? String(existing.quantityPer) : '1' } })
  const mutation = useMutation({ mutationFn: (values: FormValues) => existing ? inventoryApi.updateBomQuantity(existing.id, Number(values.quantityPer)) : inventoryApi.createBom({ parentItemId: parentId, componentItemId: Number(values.componentItemId), quantityPer: Number(values.quantityPer) } satisfies BomRequest), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['bom', parentId] }); onSaved(existing ? '필요 수량이 수정되었습니다.' : '구성품이 추가되었습니다.') } })
  return <DialogShell eyebrow={existing ? 'EDIT COMPONENT' : 'NEW COMPONENT'} title={existing ? '필요 수량 수정' : '구성품 추가'} pending={mutation.isPending} onClose={onClose}><form onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><div className="space-y-5 px-6 py-6">{mutation.isError && <InlineError error={mutation.error} />}<Field label="구성품" error={form.formState.errors.componentItemId?.message}><select className="form-input" disabled={Boolean(existing)} {...form.register('componentItemId')}>{components.map((item) => <option key={item.id} value={item.id}>{item.itemCode} · {item.name}</option>)}</select></Field><Field label="제품 1개당 필요 수량" error={form.formState.errors.quantityPer?.message}><input className="form-input tabular-nums" inputMode="decimal" autoFocus={Boolean(existing)} {...form.register('quantityPer')} /></Field></div><div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4"><button type="button" className="button-secondary" onClick={onClose}>취소</button><button type="submit" className="button-primary" disabled={mutation.isPending}>{mutation.isPending ? <><LoaderCircle className="animate-spin" size={15}/> 저장 중</> : '저장'}</button></div></form></DialogShell>
}
