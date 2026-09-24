import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosError } from 'axios'
import { AlertCircle, LoaderCircle, PackagePlus, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { inventoryApi } from '@/api/endpoints'
import { PageHeader } from '@/components/common/PageHeader'
import type { ItemRequest, ItemResponse } from '@/types/api'

const itemKeys = { all: ['items'] as const }
const decimalPattern = /^(?:\d+|\d*\.\d+)$/
const integerPattern = /^\d+$/

const itemSchema = z.object({
  itemCode: z.string().trim().min(1, '품목 코드는 필수입니다.').max(50, '품목 코드는 50자 이하여야 합니다.'),
  name: z.string().trim().min(1, '품목명은 필수입니다.').max(100, '품목명은 100자 이하여야 합니다.'),
  unitPrice: z.string().trim().min(1, '단가는 필수입니다.').refine((value) => decimalPattern.test(value) && Number(value) >= 0, '단가는 0 이상의 숫자여야 합니다.'),
  leadTimeDays: z.string().trim().min(1, '리드타임은 필수입니다.').refine((value) => integerPattern.test(value), '리드타임은 0 이상의 정수여야 합니다.'),
  onHandQuantity: z.string().trim().min(1, '현재 재고량은 필수입니다.').refine((value) => integerPattern.test(value), '현재 재고량은 0 이상의 정수여야 합니다.'),
})

type ItemFormValues = z.infer<typeof itemSchema>
type EditorState = { mode: 'create' } | { mode: 'edit'; item: ItemResponse }

interface ServerErrorBody {
  detail?: string
  message?: string
  errors?: Record<string, string | string[]>
  fieldErrors?: Array<{ field?: string; defaultMessage?: string; message?: string }>
}

const fieldLabels: Record<string, string> = {
  itemCode: '품목 코드', name: '품목명', unitPrice: '단가', leadTimeDays: '리드타임', onHandQuantity: '현재 재고',
}

function firstServerValidationMessage(body: ServerErrorBody | undefined) {
  const fieldError = body?.fieldErrors?.find((candidate) => candidate.defaultMessage || candidate.message)
  if (fieldError) return `${fieldError.field ? `${fieldLabels[fieldError.field] ?? fieldError.field}: ` : ''}${fieldError.defaultMessage ?? fieldError.message}`
  const entry = body?.errors ? Object.entries(body.errors)[0] : undefined
  if (!entry) return undefined
  const [field, value] = entry
  const message = Array.isArray(value) ? value[0] : value
  return message ? `${fieldLabels[field] ?? field}: ${message}` : undefined
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError<ServerErrorBody>(error)) return fallback
  const { response } = error
  if (!response) return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
  if (response.status === 409) return response.data?.detail || response.data?.message || '이미 사용 중인 품목 코드입니다.'
  if (response.status === 404) return response.data?.detail || response.data?.message || '해당 품목을 찾을 수 없습니다. 목록을 새로고침해 주세요.'
  if (response.status === 400) return firstServerValidationMessage(response.data) || response.data?.detail || '입력 내용을 다시 확인해 주세요.'
  return response.data?.detail || response.data?.message || fallback
}

function logDevelopmentError(context: string, error: unknown) {
  if (import.meta.env.DEV) console.error(`[Items] ${context}`, error)
}

const numberFormatter = new Intl.NumberFormat('ko-KR')
const priceFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

function toRequest(values: ItemFormValues): ItemRequest {
  return { itemCode: values.itemCode.trim(), name: values.name.trim(), unitPrice: Number(values.unitPrice), leadTimeDays: Number(values.leadTimeDays), onHandQuantity: Number(values.onHandQuantity) }
}

export function ItemsPage() {
  const queryClient = useQueryClient()
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ItemResponse | null>(null)
  const [pageMessage, setPageMessage] = useState<string | null>(null)
  const itemsQuery = useQuery({
    queryKey: itemKeys.all,
    queryFn: async () => {
      const response = await inventoryApi.items()
      if (!Array.isArray(response.data)) throw new Error('Unexpected items response')
      return response.data
    },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => inventoryApi.deleteItem(id),
    onSuccess: async () => { setDeleteTarget(null); setPageMessage('품목이 삭제되었습니다.'); await queryClient.invalidateQueries({ queryKey: itemKeys.all }) },
    onError: (error: AxiosError<ServerErrorBody>) => logDevelopmentError('delete failed', error),
  })
  const items = itemsQuery.data ?? []
  const averageLeadTime = items.length ? items.reduce((sum, item) => sum + item.leadTimeDays, 0) / items.length : 0
  const totalStock = items.reduce((sum, item) => sum + item.onHandQuantity, 0)

  return (
    <>
      <PageHeader eyebrow="ITEM MASTER" index="01" title="품목 관리" description="재고 의사결정의 기준이 되는 품목 정보와 현재 재고를 관리합니다." action={<button type="button" className="button-primary" onClick={() => setEditor({ mode: 'create' })}><Plus size={16} /> 품목 등록</button>} />
      {pageMessage && <div className="mb-5 flex items-center justify-between rounded-lg border border-white bg-white/85 px-4 py-3 text-sm text-zinc-800 shadow-[0_4px_14px_rgba(15,23,42,0.07)]" role="status"><span className="flex items-center gap-3"><i className="h-2 w-2 rounded-full bg-[#4169e1] shadow-[0_0_0_4px_rgba(65,105,225,0.1)]" />{pageMessage}</span><button type="button" aria-label="알림 닫기" className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950" onClick={() => setPageMessage(null)}><X size={15} /></button></div>}
      {itemsQuery.isLoading ? <LoadingState /> : itemsQuery.isError ? <ErrorState error={itemsQuery.error} onRetry={() => void itemsQuery.refetch()} /> : items.length === 0 ? <EmptyState onCreate={() => setEditor({ mode: 'create' })} /> : <><section className="mb-8 grid gap-3 sm:grid-cols-3" aria-label="품목 요약"><Metric index="01" label="총 품목 수" value={numberFormatter.format(items.length)} unit="개" /><Metric index="02" label="평균 리드타임" value={averageLeadTime.toLocaleString('ko-KR', { maximumFractionDigits: 1 })} unit="일" /><Metric index="03" label="총 현재재고" value={numberFormatter.format(totalStock)} unit="개" /></section><ItemsTable items={items} onEdit={(item) => setEditor({ mode: 'edit', item })} onDelete={setDeleteTarget} /></>}
      {editor && <ItemEditorDialog key={editor.mode === 'edit' ? editor.item.id : 'create'} editor={editor} onClose={() => setEditor(null)} onSaved={(message) => { setEditor(null); setPageMessage(message) }} />}
      {deleteTarget && <ConfirmDeleteDialog item={deleteTarget} pending={deleteMutation.isPending} error={deleteMutation.isError ? getErrorMessage(deleteMutation.error, '품목을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.') : null} onCancel={() => { if (!deleteMutation.isPending) { deleteMutation.reset(); setDeleteTarget(null) } }} onConfirm={() => deleteMutation.mutate(deleteTarget.id)} />}
    </>
  )
}

function Metric({ index, label, value, unit }: { index: string; label: string; value: string; unit: string }) {
  return <div className="group relative overflow-hidden rounded-xl border border-white/90 bg-gradient-to-br from-white to-[#f4f6f8] p-5 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_7px_20px_rgba(15,23,42,0.07),0_2px_5px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-0.5 md:p-6"><div className="flex items-center justify-between"><p className="text-[10px] font-bold tracking-[0.16em] text-zinc-500">{label}</p><span className="flex h-5 min-w-5 items-center justify-center rounded-md border border-zinc-200 bg-white px-1 font-mono text-[9px] text-zinc-400 shadow-sm">{index}</span></div><p className="mt-7 tabular-nums text-[2rem] font-semibold leading-none tracking-[-0.04em] text-zinc-950 md:text-[2.5rem]">{value}<span className="ml-2 text-xs font-medium tracking-normal text-zinc-500">{unit}</span></p><span className="absolute bottom-0 left-5 h-[3px] w-10 rounded-t-full bg-[#4169e1] shadow-[0_-2px_8px_rgba(65,105,225,0.28)]" /><span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full border border-zinc-300 bg-zinc-100 shadow-[0_1px_1px_rgba(255,255,255,0.9)_inset]" /></div>
}

function LoadingState() {
  return <section className="grid min-h-80 place-items-center rounded-[14px] border border-white bg-white/80 shadow-[0_8px_28px_rgba(15,23,42,0.07)]" aria-live="polite"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-[#4169e1]" size={24} /><p className="mt-4 text-xs font-bold tracking-[0.12em] text-zinc-800">LOADING ITEM MASTER</p><p className="mt-2 text-xs text-zinc-500">품목 정보를 불러오는 중입니다.</p></div></section>
}

function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  useEffect(() => logDevelopmentError('list fetch failed', error), [error])
  return <section className="grid min-h-80 overflow-hidden rounded-[14px] border border-white bg-white shadow-[0_12px_34px_rgba(15,23,42,0.09)] md:grid-cols-[0.8fr_1.2fr]"><div className="relative hidden bg-gradient-to-br from-[#20252b] to-[#0d1014] md:block"><span className="absolute left-8 top-8 font-mono text-[10px] tracking-[0.18em] text-zinc-500">CONNECTION / FAILED</span><span className="absolute -bottom-14 -right-8 h-52 w-52 rounded-full border-[36px] border-zinc-800" /><span className="absolute bottom-12 left-8 h-px w-32 bg-[#4169e1]" /></div><div className="flex items-center px-7 py-14 md:px-12"><div><AlertCircle className="text-[#4169e1]" size={25} /><p className="mt-7 text-[10px] font-bold tracking-[0.18em] text-zinc-500">DATA SOURCE UNAVAILABLE</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-zinc-950">품목 정보를 불러오지 못했습니다</h2><p className="mt-3 max-w-md text-sm leading-6 text-zinc-600">{getErrorMessage(error, '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')}</p><button type="button" className="button-secondary mt-7" onClick={onRetry}><RefreshCw size={15} /> 다시 시도</button></div></div></section>
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return <section className="grid min-h-[390px] overflow-hidden rounded-[14px] border border-white bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_36px_rgba(15,23,42,0.1)] lg:grid-cols-[0.9fr_1.1fr]"><div className="relative min-h-52 overflow-hidden bg-gradient-to-br from-[#242a31] via-[#15191e] to-[#0d1014] p-7 md:p-10"><p className="font-mono text-[10px] tracking-[0.2em] text-zinc-500">EMPTY SET / 000</p><div className="absolute bottom-0 right-0 h-4/5 w-3/4 border-l border-t border-zinc-700"><span className="absolute left-[22%] top-0 h-full w-px bg-zinc-800" /><span className="absolute left-[52%] top-0 h-full w-px bg-zinc-800" /><span className="absolute left-0 top-[38%] h-px w-full bg-zinc-800" /><span className="absolute left-[22%] top-[38%] h-2.5 w-2.5 rounded-sm bg-[#4169e1] shadow-[0_0_12px_rgba(65,105,225,0.65)]" /><span className="absolute bottom-8 right-8 text-[5.5rem] font-semibold leading-none tracking-[-0.09em] text-zinc-800">00</span></div></div><div className="flex items-center px-7 py-12 md:px-12 lg:px-16"><div><div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-gradient-to-b from-white to-zinc-100 text-zinc-900 shadow-[0_3px_8px_rgba(15,23,42,0.1)]"><PackagePlus size={18} strokeWidth={1.7} /></div><p className="mt-8 text-[10px] font-bold tracking-[0.18em] text-[#4169e1]">READY FOR FIRST INPUT</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-zinc-950 md:text-3xl">첫 번째 품목을<br />등록해 주세요.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">품목을 등록하면 재고 수량과 리드타임을 한눈에 관리하고 의사결정 분석을 시작할 수 있습니다.</p><button type="button" className="button-primary mt-8" onClick={onCreate}><Plus size={16} /> 첫 품목 등록</button></div></div></section>
}

function ItemsTable({ items, onEdit, onDelete }: { items: ItemResponse[]; onEdit: (item: ItemResponse) => void; onDelete: (item: ItemResponse) => void }) {
  return <section className="overflow-hidden rounded-[14px] border border-white bg-white shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_32px_rgba(15,23,42,0.09),0_2px_6px_rgba(15,23,42,0.05)]" aria-labelledby="items-table-title"><div className="flex flex-col gap-3 border-b border-zinc-200 bg-gradient-to-b from-white to-[#f7f8f9] px-5 py-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold tracking-[0.18em] text-[#4169e1]">ITEM DIRECTORY</p><h2 id="items-table-title" className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">등록 품목</h2></div><div className="flex items-center gap-4"><p className="hidden text-xs text-zinc-500 sm:block">단가·수량 우측 정렬</p><span className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[10px] text-zinc-500 shadow-sm">{String(items.length).padStart(3, '0')} RECORDS</span></div></div><div className="overflow-x-auto bg-white"><table className="w-full min-w-[840px] border-collapse text-left"><thead><tr className="bg-gradient-to-b from-[#242930] to-[#111419] text-[10px] font-bold tracking-[0.14em] text-zinc-400 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]"><th className="px-5 py-4">품목 코드</th><th className="px-5 py-4">품목명</th><th className="px-5 py-4 text-right">단가</th><th className="px-5 py-4 text-right">리드타임</th><th className="px-5 py-4 text-right">현재재고</th><th className="w-24 px-4 py-4 text-right"><span className="sr-only">행 작업</span></th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="group border-b border-zinc-200 text-sm last:border-b-0 hover:bg-[#f2f5f8]"><td className="border-l-[3px] border-transparent px-5 py-4 font-mono text-xs font-semibold tracking-wide text-zinc-700 group-hover:border-[#4169e1]">{item.itemCode}</td><td className="px-5 py-4 font-semibold text-zinc-950">{item.name}</td><td className="px-5 py-4 text-right tabular-nums text-zinc-600">₩{priceFormatter.format(item.unitPrice)}</td><td className="px-5 py-4 text-right tabular-nums text-zinc-600">{numberFormatter.format(item.leadTimeDays)}<span className="ml-1 text-[10px] text-zinc-400">D</span></td><td className="px-5 py-4 text-right tabular-nums font-semibold text-zinc-950">{numberFormatter.format(item.onHandQuantity)}</td><td className="px-4 py-2 text-right"><div className="inline-flex items-center opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><button type="button" className="row-action" aria-label={`${item.name} 수정`} onClick={() => onEdit(item)}><Pencil size={15} /></button><button type="button" className="row-action row-action-danger" aria-label={`${item.name} 삭제`} onClick={() => onDelete(item)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></section>
}

function useModalBehavior(onClose: () => void, locked: boolean) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !locked) onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [locked, onClose])
}

function ItemEditorDialog({ editor, onClose, onSaved }: { editor: EditorState; onClose: () => void; onSaved: (message: string) => void }) {
  const queryClient = useQueryClient()
  const existing = editor.mode === 'edit' ? editor.item : null
  const form = useForm<ItemFormValues>({ resolver: zodResolver(itemSchema), defaultValues: existing ? { itemCode: existing.itemCode, name: existing.name, unitPrice: String(existing.unitPrice), leadTimeDays: String(existing.leadTimeDays), onHandQuantity: String(existing.onHandQuantity) } : { itemCode: '', name: '', unitPrice: '', leadTimeDays: '', onHandQuantity: '' } })
  const saveMutation = useMutation({
    mutationFn: (body: ItemRequest) => existing ? inventoryApi.updateItem(existing.id, body) : inventoryApi.createItem(body),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: itemKeys.all }); onSaved(existing ? '품목 정보가 수정되었습니다.' : '새 품목이 등록되었습니다.') },
    onError: (error: AxiosError<ServerErrorBody>) => logDevelopmentError(existing ? 'update failed' : 'create failed', error),
  })
  useModalBehavior(onClose, saveMutation.isPending)
  const submit = form.handleSubmit((values) => saveMutation.mutate(toRequest(values)))
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saveMutation.isPending) onClose() }}><section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="item-dialog-title"><div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5"><div><p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">{existing ? 'EDIT ITEM' : 'NEW ITEM'}</p><h2 id="item-dialog-title" className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">{existing ? '품목 정보 수정' : '품목 등록'}</h2></div><button type="button" className="-mr-2 rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950" aria-label="닫기" onClick={onClose} disabled={saveMutation.isPending}><X size={19} /></button></div><form onSubmit={submit} noValidate><div className="space-y-5 px-6 py-6">{saveMutation.isError && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800" role="alert">{getErrorMessage(saveMutation.error, '품목을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.')}</div>}<div className="grid gap-5 sm:grid-cols-2"><Field label="품목 코드" error={form.formState.errors.itemCode?.message}><input className="form-input font-mono" autoFocus autoComplete="off" maxLength={50} placeholder="예: RM-001" {...form.register('itemCode')} /></Field><Field label="품목명" error={form.formState.errors.name?.message}><input className="form-input" autoComplete="off" maxLength={100} placeholder="예: 알루미늄 케이스" {...form.register('name')} /></Field></div><Field label="단가" error={form.formState.errors.unitPrice?.message}><div className="relative"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">₩</span><input className="form-input pl-8 tabular-nums" inputMode="decimal" placeholder="0" {...form.register('unitPrice')} /></div></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="리드타임" hint="주문 후 실제 입고까지 걸리는 기간입니다." error={form.formState.errors.leadTimeDays?.message}><div className="relative"><input className="form-input pr-10 tabular-nums" inputMode="numeric" placeholder="0" {...form.register('leadTimeDays')} /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-zinc-500">일</span></div></Field><Field label="현재 재고" error={form.formState.errors.onHandQuantity?.message}><div className="relative"><input className="form-input pr-10 tabular-nums" inputMode="numeric" placeholder="0" {...form.register('onHandQuantity')} /><span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-zinc-500">개</span></div></Field></div></div><div className="flex justify-end gap-2 border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-4"><button type="button" className="button-secondary" onClick={onClose} disabled={saveMutation.isPending}>취소</button><button type="submit" className="button-primary min-w-24" disabled={saveMutation.isPending}>{saveMutation.isPending ? <><LoaderCircle className="animate-spin" size={15} /> 저장 중</> : existing ? '변경 저장' : '품목 등록'}</button></div></form></section></div>
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-zinc-800">{label}</span>{children}{error ? <span className="mt-1.5 block text-xs text-rose-700">{error}</span> : hint ? <span className="mt-1.5 block text-xs leading-5 text-zinc-500">{hint}</span> : null}</label>
}

function ConfirmDeleteDialog({ item, pending, error, onCancel, onConfirm }: { item: ItemResponse; pending: boolean; error: string | null; onCancel: () => void; onConfirm: () => void }) {
  useModalBehavior(onCancel, pending)
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onCancel() }}><section className="w-[min(92vw,440px)] overflow-hidden rounded-2xl border border-white bg-white shadow-[0_30px_80px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.9)_inset]" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description"><div className="px-6 py-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-200 bg-gradient-to-b from-rose-50 to-rose-100 text-rose-700 shadow-sm"><Trash2 size={17} /></div><h2 id="delete-dialog-title" className="mt-5 text-lg font-semibold tracking-tight text-zinc-950">이 품목을 삭제할까요?</h2><p id="delete-dialog-description" className="mt-2 text-sm leading-6 text-zinc-600"><strong className="font-semibold text-zinc-900">{item.name}</strong> <span className="font-mono text-xs text-zinc-500">({item.itemCode})</span> 품목이 목록에서 삭제됩니다.</p>{error && <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800" role="alert">{error}</p>}</div><div className="flex justify-end gap-2 border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-4"><button type="button" className="button-secondary" onClick={onCancel} disabled={pending}>취소</button><button type="button" className="button-danger min-w-20" onClick={onConfirm} disabled={pending}>{pending ? <><LoaderCircle className="animate-spin" size={15} /> 삭제 중</> : '삭제'}</button></div></section></div>
}
