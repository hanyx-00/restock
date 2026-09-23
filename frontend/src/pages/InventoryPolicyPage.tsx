import { Settings2 } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function InventoryPolicyPage() { return <FeaturePlaceholder index="04" title="재고 정책 계산" description="주문비용과 보관비용을 반영해 경제적 주문량(EOQ), 안전재고, 재주문점을 계산합니다. 언제 얼마나 주문할지 판단하는 기준입니다." icon={Settings2} steps={['품목과 분석 연도를 선택합니다.', '주문비용과 연간 보관비용을 입력합니다.', 'EOQ·안전재고·재주문점을 확인합니다.']} endpoint="POST /api/inventory-policies/calculate" /> }
