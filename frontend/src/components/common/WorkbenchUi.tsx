/* eslint-disable react-refresh/only-export-components */
import axios from 'axios'
import { AlertCircle, LoaderCircle, RefreshCw, X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ServerErrorBody {
  detail?: string
  message?: string
  errors?: Record<string, string | string[]>
  fieldErrors?: Array<{ field?: string; defaultMessage?: string; message?: string }>
}

export const numberFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })
export const integerFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 })
export const currencyFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 })

export function getApiErrorMessage(error: unknown, fallback = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.') {
  if (!axios.isAxiosError<ServerErrorBody>(error)) return fallback
  if (!error.response) return '서버에 연결할 수 없습니다. 실행 상태를 확인해 주세요.'
  const body = error.response.data
  const fieldError = body?.fieldErrors?.find((candidate) => candidate.defaultMessage || candidate.message)
  if (fieldError) return fieldError.defaultMessage ?? fieldError.message ?? fallback
  const validationEntry = body?.errors ? Object.values(body.errors)[0] : undefined
  const validationMessage = Array.isArray(validationEntry) ? validationEntry[0] : validationEntry
  return body?.detail || body?.message || validationMessage || fallback
}

export function useModalBehavior(onClose: () => void, locked = false) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !locked) onClose() }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [locked, onClose])
}

export function Panel({ eyebrow, title, meta, children, className = '' }: { eyebrow?: string; title: string; meta?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-[14px] border border-white bg-white shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_32px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.05)] ${className}`}><header className="flex flex-col gap-3 border-b border-zinc-200 bg-gradient-to-b from-white to-[#f7f8f9] px-5 py-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="text-[10px] font-bold tracking-[0.18em] text-[#4169e1]">{eyebrow}</p>}<h2 className={`${eyebrow ? 'mt-1' : ''} text-lg font-semibold tracking-tight text-zinc-950`}>{title}</h2></div>{meta && <div className="shrink-0">{meta}</div>}</header>{children}</section>
}

export function MetricCard({ index, label, value, unit, detail }: { index: string; label: string; value: ReactNode; unit?: string; detail?: string }) {
  return <div className="relative overflow-hidden rounded-xl border border-white/90 bg-gradient-to-br from-white to-[#f4f6f8] p-5 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_7px_20px_rgba(15,23,42,0.07),0_2px_5px_rgba(15,23,42,0.05)]"><div className="flex items-center justify-between"><p className="text-[10px] font-bold tracking-[0.14em] text-zinc-500">{label}</p><span className="rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-zinc-400 shadow-sm">{index}</span></div><p className="mt-6 tabular-nums text-[2rem] font-semibold leading-none tracking-[-0.04em] text-zinc-950 md:text-[2.35rem]">{value}{unit && <span className="ml-2 text-xs font-medium tracking-normal text-zinc-500">{unit}</span>}</p>{detail && <p className="mt-3 text-xs leading-5 text-zinc-500">{detail}</p>}<span className="absolute bottom-0 left-5 h-[3px] w-10 rounded-t-full bg-[#4169e1]" /></div>
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-zinc-800">{label}</span>{children}{error ? <span className="mt-1.5 block text-xs text-rose-700">{error}</span> : hint ? <span className="mt-1.5 block text-xs leading-5 text-zinc-500">{hint}</span> : null}</label>
}

export function Notice({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return <div className="mb-5 flex items-center justify-between rounded-lg border border-white bg-white/90 px-4 py-3 text-sm text-zinc-800 shadow-[0_4px_14px_rgba(15,23,42,0.07)]" role="status"><span className="flex items-center gap-3"><i className="h-2 w-2 rounded-full bg-[#4169e1] shadow-[0_0_0_4px_rgba(65,105,225,0.1)]" />{children}</span>{onClose && <button type="button" aria-label="알림 닫기" className="rounded p-1 text-zinc-500 hover:bg-zinc-100" onClick={onClose}><X size={15} /></button>}</div>
}

export function LoadingPanel({ label = '데이터를 불러오는 중입니다.' }: { label?: string }) {
  return <section className="grid min-h-64 place-items-center rounded-[14px] border border-white bg-white/80 shadow-[0_8px_28px_rgba(15,23,42,0.07)]" aria-live="polite"><div className="text-center"><LoaderCircle className="mx-auto animate-spin text-[#4169e1]" size={24} /><p className="mt-4 text-xs font-bold tracking-[0.12em] text-zinc-800">LOADING WORKBENCH</p><p className="mt-2 text-xs text-zinc-500">{label}</p></div></section>
}

export function ErrorPanel({ error, onRetry, title = '데이터를 불러오지 못했습니다' }: { error: unknown; onRetry?: () => void; title?: string }) {
  return <section className="rounded-[14px] border border-white bg-white px-7 py-12 shadow-[0_12px_34px_rgba(15,23,42,0.09)]"><AlertCircle className="text-[#4169e1]" size={25} /><p className="mt-6 text-[10px] font-bold tracking-[0.18em] text-zinc-500">REQUEST FAILED</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-zinc-950">{title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">{getApiErrorMessage(error)}</p>{onRetry && <button type="button" className="button-secondary mt-6" onClick={onRetry}><RefreshCw size={15} /> 다시 시도</button>}</section>
}

export function InlineError({ error }: { error: unknown }) {
  return <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-800" role="alert">{getApiErrorMessage(error)}</div>
}

export function EmptyPanel({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="px-6 py-14 text-center"><p className="text-[10px] font-bold tracking-[0.18em] text-[#4169e1]">NO DATA</p><h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">{title}</h3><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-500">{description}</p>{action && <div className="mt-6">{action}</div>}</div>
}

export function ConfirmDialog({ title, description, pending, error, onCancel, onConfirm }: { title: string; description: ReactNode; pending: boolean; error?: unknown; onCancel: () => void; onConfirm: () => void }) {
  useModalBehavior(onCancel, pending)
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onCancel() }}><section className="w-[min(92vw,440px)] overflow-hidden rounded-2xl border border-white bg-white shadow-[0_30px_80px_rgba(0,0,0,0.3)]" role="alertdialog" aria-modal="true"><div className="px-6 py-6"><h2 className="text-lg font-semibold tracking-tight text-zinc-950">{title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>{Boolean(error) && <div className="mt-4"><InlineError error={error} /></div>}</div><div className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-6 py-4"><button type="button" className="button-secondary" onClick={onCancel} disabled={pending}>취소</button><button type="button" className="button-danger min-w-20" onClick={onConfirm} disabled={pending}>{pending ? <><LoaderCircle className="animate-spin" size={15} /> 처리 중</> : '삭제'}</button></div></section></div>
}

export function DialogShell({ title, eyebrow, pending, onClose, children }: { title: string; eyebrow: string; pending?: boolean; onClose: () => void; children: ReactNode }) {
  useModalBehavior(onClose, Boolean(pending))
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) onClose() }}><section className="dialog-panel" role="dialog" aria-modal="true"><div className="flex items-start justify-between border-b border-zinc-200 px-6 py-5"><div><p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">{eyebrow}</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-950">{title}</h2></div><button type="button" className="-mr-2 rounded-md p-2 text-zinc-500 hover:bg-zinc-100" aria-label="닫기" onClick={onClose} disabled={pending}><X size={19} /></button></div>{children}</section></div>
}
