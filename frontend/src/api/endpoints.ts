import { apiClient } from './client'
import type { AbcResultResponse, BomResponse, DemandHistoryResponse, InventoryPolicyRequest, InventoryPolicyResponse, ItemRequest, ItemResponse, MrpResponse, PlannedDemandResponse, ScenarioCompareRequest, ScenarioCompareResponse } from '@/types/api'

export const inventoryApi = {
  items: () => apiClient.get<ItemResponse[]>('/items'),
  createItem: (body: ItemRequest) => apiClient.post<ItemResponse>('/items', body),
  updateItem: (id: number, body: ItemRequest) => apiClient.put<ItemResponse>(`/items/${id}`, body),
  deleteItem: (id: number) => apiClient.delete<void>(`/items/${id}`),
  demandsByItem: (itemId: number) => apiClient.get<DemandHistoryResponse[]>(`/demands/item/${itemId}`),
  abc: (year: number) => apiClient.get<AbcResultResponse[]>('/abc', { params: { year } }),
  calculatePolicy: (body: InventoryPolicyRequest) => apiClient.post<InventoryPolicyResponse>('/inventory-policies/calculate', body),
  bomByParent: (parentItemId: number) => apiClient.get<BomResponse[]>(`/boms/parent/${parentItemId}`),
  productionPlans: () => apiClient.get<PlannedDemandResponse[]>('/planned-demands'),
  mrp: (plannedDemandId: number) => apiClient.get<MrpResponse>(`/mrp/planned-demand/${plannedDemandId}`),
  compareScenarios: (body: ScenarioCompareRequest) => apiClient.post<ScenarioCompareResponse>('/scenarios/compare', body),
}
