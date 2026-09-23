import { ChartNoAxesCombined } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function DemandsPage() { return <FeaturePlaceholder index="02" title="수요 이력" description="날짜별 실제 수요량을 기록합니다. 축적된 이력은 ABC 분석과 안전재고 계산의 근거가 됩니다." icon={ChartNoAxesCombined} steps={['분석할 품목을 선택합니다.', '날짜와 실제 수요량을 입력합니다.', '누적된 수요 흐름을 확인합니다.']} endpoint="GET /api/demands/item/{itemId}" /> }
