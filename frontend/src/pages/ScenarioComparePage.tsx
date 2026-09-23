import { GitCompareArrows } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function ScenarioComparePage() { return <FeaturePlaceholder index="08" title="시나리오 비교" description="서로 다른 주문비용과 보관비용 조건을 나란히 계산합니다. 정책을 바꿨을 때 주요 재고 지표가 얼마나 달라지는지 비교합니다." icon={GitCompareArrows} steps={['품목과 분석 연도를 선택합니다.', '기준안과 대안을 각각 입력합니다.', 'EOQ·안전재고·재주문점 차이를 비교합니다.']} endpoint="POST /api/scenarios/compare" /> }
