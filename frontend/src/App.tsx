import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AbcPage } from '@/pages/AbcPage'
import { BomPage } from '@/pages/BomPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DemandsPage } from '@/pages/DemandsPage'
import { InventoryPolicyPage } from '@/pages/InventoryPolicyPage'
import { ItemsPage } from '@/pages/ItemsPage'
import { MrpPage } from '@/pages/MrpPage'
import { ProductionPlanPage } from '@/pages/ProductionPlanPage'
import { ScenarioComparePage } from '@/pages/ScenarioComparePage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="demands" element={<DemandsPage />} />
        <Route path="abc" element={<AbcPage />} />
        <Route path="inventory-policy" element={<InventoryPolicyPage />} />
        <Route path="bom" element={<BomPage />} />
        <Route path="production-plan" element={<ProductionPlanPage />} />
        <Route path="mrp" element={<MrpPage />} />
        <Route path="scenario-compare" element={<ScenarioComparePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
