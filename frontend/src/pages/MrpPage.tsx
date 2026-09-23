import { PackageSearch } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function MrpPage() { return <FeaturePlaceholder index="07" title="MRP 자재소요계획" description="생산 계획, BOM, 현재고와 리드타임을 결합해 필요한 자재 수량과 발주일을 계산합니다." icon={PackageSearch} steps={['계산할 생산 계획을 선택합니다.', '총소요량과 순소요량을 계산합니다.', '계획입고량과 발주 예정일을 확인합니다.']} endpoint="GET /api/mrp/planned-demand/{plannedDemandId}" /> }
