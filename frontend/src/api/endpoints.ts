import { apiClient } from './client'
import type { AbcResultResponse, BomRequest, BomResponse, DemandHistoryRequest, DemandHistoryResponse, InventoryPolicyRequest, InventoryPolicyResponse, ItemRequest, ItemResponse, MrpResponse, PlannedDemandRequest, PlannedDemandResponse, ScenarioCompareRequest, ScenarioCompareResponse } from '@/types/api'

export const inventoryApi = {
  items: () => apiClient.get<ItemResponse[]>('/items'),
  createItem: (body: ItemRequest) => apiClient.post<ItemResponse>('/items', body),
  updateItem: (id: number, body: ItemRequest) => apiClient.put<ItemResponse>(`/items/${id}`, body),
  deleteItem: (id: number) => apiClient.delete<void>(`/items/${id}`),
  demandsByItem: (itemId: number) => apiClient.get<DemandHistoryResponse[]>(`/demands/item/${itemId}`),
  createDemand: (body: DemandHistoryRequest) => apiClient.post<DemandHistoryResponse>('/demands', body),
  updateDemand: (id: number, body: DemandHistoryRequest) => apiClient.put<DemandHistoryResponse>(`/demands/${id}`, body),
  deleteDemand: (id: number) => apiClient.delete<void>(`/demands/${id}`),
  abc: (year: number) => apiClient.get<AbcResultResponse[]>('/abc', { params: { year } }),
  calculatePolicy: (body: InventoryPolicyRequest) => apiClient.post<InventoryPolicyResponse>('/inventory-policies/calculate', body),
  bomByParent: (parentItemId: number) => apiClient.get<BomResponse[]>(`/boms/parent/${parentItemId}`),
  createBom: (body: BomRequest) => apiClient.post<BomResponse>('/boms', body),
  updateBomQuantity: (id: number, quantityPer: number) => apiClient.put<BomResponse>(`/boms/${id}`, { quantityPer }),
  deleteBom: (id: number) => apiClient.delete<void>(`/boms/${id}`),
  productionPlans: () => apiClient.get<PlannedDemandResponse[]>('/planned-demands'),
  createProductionPlan: (body: PlannedDemandRequest) => apiClient.post<PlannedDemandResponse>('/planned-demands', body),
  updateProductionPlan: (id: number, body: PlannedDemandRequest) => apiClient.put<PlannedDemandResponse>(`/planned-demands/${id}`, body),
  deleteProductionPlan: (id: number) => apiClient.delete<void>(`/planned-demands/${id}`),
  mrp: (plannedDemandId: number) => apiClient.get<MrpResponse>(`/mrp/planned-demand/${plannedDemandId}`),
  compareScenarios: (body: ScenarioCompareRequest) => apiClient.post<ScenarioCompareResponse>('/scenarios/compare', body),
}
