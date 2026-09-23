export interface ItemRequest {
  itemCode: string
  name: string
  unitPrice: number
  leadTimeDays: number
  onHandQuantity: number
}

export interface ItemResponse extends ItemRequest {
  id: number
}
export interface DemandHistoryRequest { itemId: number; demandDate: string; quantity: number }
export interface DemandHistoryResponse extends DemandHistoryRequest { id: number; itemCode: string; itemName: string }
export interface PlannedDemandRequest { itemId: number; requiredDate: string; quantity: number }
export interface PlannedDemandResponse extends PlannedDemandRequest { id: number; itemCode: string; itemName: string }
export interface AbcResultResponse { rank: number; itemId: number; itemCode: string; itemName: string; totalDemand: number; unitPrice: number; usageValue: number; sharePercent: number; cumulativePercent: number; grade: string }
export interface InventoryPolicyRequest { itemId: number; year: number; orderingCost: number; annualHoldingCostPerUnit: number }
export interface InventoryPolicyResponse { itemId: number; itemCode: string; itemName: string; year: number; abcGrade: string; serviceLevel: number; annualDemand: number; averageDailyDemand: number; dailyDemandStandardDeviation: number; economicOrderQuantity: number; safetyStock: number; reorderPoint: number }
export interface BomRequest { parentItemId: number; componentItemId: number; quantityPer: number }
export interface BomResponse extends BomRequest { id: number; parentItemCode: string; parentItemName: string; componentItemCode: string; componentItemName: string }
export interface MrpItemResult { componentItemId: number; componentItemCode: string; componentItemName: string; quantityPer: number; grossRequirement: number; onHandQuantity: number; netRequirement: number; plannedOrderReceipt: number; leadTimeDays: number; requiredDate: string; plannedOrderReleaseDate: string }
export interface MrpResponse { plannedDemandId: number; parentItemId: number; parentItemCode: string; parentItemName: string; requiredDate: string; plannedQuantity: number; materials: MrpItemResult[] }
export interface ScenarioPolicyInput { orderingCost: number; annualHoldingCostPerUnit: number }
export interface ScenarioCompareRequest { itemId: number; year: number; baseline: ScenarioPolicyInput; alternative: ScenarioPolicyInput }
export interface ScenarioDifference { economicOrderQuantityDifference: number; safetyStockDifference: number; reorderPointDifference: number }
export interface ScenarioCompareResponse { baseline: InventoryPolicyResponse; alternative: InventoryPolicyResponse; difference: ScenarioDifference }
