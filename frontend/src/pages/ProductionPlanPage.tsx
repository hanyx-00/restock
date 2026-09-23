import { ClipboardList } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function ProductionPlanPage() { return <FeaturePlaceholder index="06" title="생산 계획" description="완제품이 필요한 날짜와 생산 수량을 등록합니다. 계획 수요는 MRP가 부품 발주 시점을 역산하는 출발점입니다." icon={ClipboardList} steps={['생산할 품목을 선택합니다.', '필요일과 계획 수량을 입력합니다.', '등록된 생산 일정을 검토합니다.']} endpoint="GET /api/planned-demands" /> }
