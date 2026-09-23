import { Sigma } from 'lucide-react'
import { FeaturePlaceholder } from '@/components/common/FeaturePlaceholder'
export function AbcPage() { return <FeaturePlaceholder index="03" title="ABC 분석" description="연간 사용금액을 기준으로 품목의 중요도를 A·B·C 등급으로 구분합니다. 중요한 품목에 관리 역량을 집중하기 위한 분석입니다." icon={Sigma} steps={['분석 연도를 선택합니다.', '연간 수요와 사용금액을 집계합니다.', '누적 비율과 ABC 등급을 확인합니다.']} endpoint="GET /api/abc?year={year}" /> }
