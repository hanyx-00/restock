package com.restock.abc;

import com.restock.abc.dto.AbcResultResponse;
import com.restock.demand.DemandHistory;
import com.restock.demand.DemandHistoryRepository;
import com.restock.item.Item;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AbcAnalysisService {
	
	private static final BigDecimal A_THRESHOLD =
			new BigDecimal("80");
	
	private static final BigDecimal B_THRESHOLD =
			new BigDecimal("95");
	
	private final DemandHistoryRepository demandHistoryRepository;
	
	public AbcAnalysisService(
			DemandHistoryRepository demandHistoryRepository
	) {
		this.demandHistoryRepository = demandHistoryRepository;
	}
	
	public List<AbcResultResponse> analyze(int year) {
		
		LocalDate startDate = LocalDate.of(year, 1, 1);
		LocalDate endDate = LocalDate.of(year, 12, 31);
		
		List<DemandHistory> histories =
				demandHistoryRepository.findAllByDemandDateBetween(
						startDate,
						endDate
				);
		
		if (histories.isEmpty()) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"해당 연도의 수요 데이터가 없습니다."
			);
		}
		
		Map<Long, Long> demandByItemId = new HashMap<>();
		Map<Long, Item> itemById = new HashMap<>();
		
		for (DemandHistory history : histories) {
			
			Item item = history.getItem();
			
			itemById.put(
					item.getId(),
					item
			);
			
			demandByItemId.merge(
					item.getId(),
					history.getQuantity().longValue(),
					Long::sum
			);
		}
		
		List<AbcCalculationItem> calculations =
				new ArrayList<>();
		
		for (Map.Entry<Long, Long> entry
				: demandByItemId.entrySet()) {
			
			Item item = itemById.get(entry.getKey());
			long totalDemand = entry.getValue();
			
			BigDecimal usageValue =
					item.getUnitPrice()
							.multiply(
									BigDecimal.valueOf(totalDemand)
							);
			
			calculations.add(
					new AbcCalculationItem(
							item,
							totalDemand,
							usageValue
					)
			);
		}
		
		calculations.sort(
				Comparator.comparing(
								AbcCalculationItem::usageValue
						)
						.reversed()
		);
		
		BigDecimal totalUsageValue =
				calculations.stream()
						.map(AbcCalculationItem::usageValue)
						.reduce(
								BigDecimal.ZERO,
								BigDecimal::add
						);
		
		if (totalUsageValue.compareTo(BigDecimal.ZERO) == 0) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"ABC 분석 대상 사용금액이 없습니다."
			);
		}
		
		List<AbcResultResponse> results =
				new ArrayList<>();
		
		BigDecimal cumulativeUsageValue =
				BigDecimal.ZERO;
		
		for (int i = 0; i < calculations.size(); i++) {
			
			AbcCalculationItem calculation =
					calculations.get(i);
			
			cumulativeUsageValue =
					cumulativeUsageValue.add(
							calculation.usageValue()
					);
			
			BigDecimal sharePercent =
					calculatePercent(
							calculation.usageValue(),
							totalUsageValue
					);
			
			BigDecimal cumulativePercent =
					calculatePercent(
							cumulativeUsageValue,
							totalUsageValue
					);
			
			String grade =
					determineGrade(cumulativePercent);
			
			Item item = calculation.item();
			
			results.add(
					new AbcResultResponse(
							i + 1,
							item.getId(),
							item.getItemCode(),
							item.getName(),
							calculation.totalDemand(),
							item.getUnitPrice(),
							calculation.usageValue(),
							sharePercent,
							cumulativePercent,
							grade
					)
			);
		}
		
		return results;
	}
	
	private BigDecimal calculatePercent(
			BigDecimal value,
			BigDecimal total
	) {
		return value
				.divide(
						total,
						6,
						RoundingMode.HALF_UP
				)
				.multiply(
						new BigDecimal("100")
				)
				.setScale(
						2,
						RoundingMode.HALF_UP
				);
	}
	
	private String determineGrade(
			BigDecimal cumulativePercent
	) {
		
		if (cumulativePercent.compareTo(A_THRESHOLD) <= 0) {
			return "A";
		}
		
		if (cumulativePercent.compareTo(B_THRESHOLD) <= 0) {
			return "B";
		}
		
		return "C";
	}
	
	private record AbcCalculationItem(
			Item item,
			long totalDemand,
			BigDecimal usageValue
	) {
	}
}