import { ListTree } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function BomPage() { return <FeaturePlaceholder index="05" title="BOM 구성" description="완제품 한 개를 만들 때 필요한 부품과 소요량을 정의합니다. BOM은 자재소요계획(MRP)의 계산 기준입니다." icon={ListTree} steps={['상위 완제품을 선택합니다.', '필요한 부품과 단위 소요량을 등록합니다.', '제품별 자재 구성을 검토합니다.']} endpoint="GET /api/boms/parent/{parentItemId}" /> }
