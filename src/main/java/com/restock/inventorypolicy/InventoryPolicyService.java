package com.restock.inventorypolicy;

import com.restock.abc.AbcAnalysisService;
import com.restock.abc.dto.AbcResultResponse;
import com.restock.demand.DemandHistory;
import com.restock.demand.DemandHistoryRepository;
import com.restock.inventorypolicy.dto.InventoryPolicyRequest;
import com.restock.inventorypolicy.dto.InventoryPolicyResponse;
import com.restock.item.Item;
import com.restock.item.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class InventoryPolicyService {
	
	private final ItemRepository itemRepository;
	private final DemandHistoryRepository demandHistoryRepository;
	private final AbcAnalysisService abcAnalysisService;
	
	public InventoryPolicyService(
			ItemRepository itemRepository,
			DemandHistoryRepository demandHistoryRepository,
			AbcAnalysisService abcAnalysisService
	) {
		this.itemRepository = itemRepository;
		this.demandHistoryRepository = demandHistoryRepository;
		this.abcAnalysisService = abcAnalysisService;
	}
	
	public InventoryPolicyResponse calculate(
			InventoryPolicyRequest request
	) {
		
		Item item = itemRepository.findById(request.itemId())
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"품목을 찾을 수 없습니다."
				));
		
		LocalDate startDate =
				LocalDate.of(request.year(), 1, 1);
		
		LocalDate endDate =
				LocalDate.of(request.year(), 12, 31);
		
		List<DemandHistory> histories =
				demandHistoryRepository
						.findAllByItemIdAndDemandDateBetween(
								request.itemId(),
								startDate,
								endDate
						);
		
		if (histories.isEmpty()) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"해당 연도의 수요 데이터가 없습니다."
			);
		}
		
		long annualDemand = histories.stream()
				.mapToLong(DemandHistory::getQuantity)
				.sum();
		
		if (annualDemand <= 0) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"연간 수요량은 0보다 커야 합니다."
			);
		}
		
		int daysInYear =
				Year.of(request.year()).length();
		
		BigDecimal averageDailyDemand =
				BigDecimal.valueOf(annualDemand)
						.divide(
								BigDecimal.valueOf(daysInYear),
								6,
								RoundingMode.HALF_UP
						);
		
		BigDecimal dailyDemandStandardDeviation =
				calculateDailyStandardDeviation(
						histories,
						startDate,
						endDate,
						averageDailyDemand
				);
		
		String abcGrade =
				findAbcGrade(
						request.itemId(),
						request.year()
				);
		
		ServiceLevelInfo serviceLevelInfo =
				determineServiceLevel(abcGrade);
		
		BigDecimal eoq =
				calculateEoq(
						annualDemand,
						request.orderingCost(),
						request.annualHoldingCostPerUnit()
				);
		
		BigDecimal safetyStock =
				calculateSafetyStock(
						dailyDemandStandardDeviation,
						item.getLeadTimeDays(),
						serviceLevelInfo.zScore()
				);
		
		BigDecimal leadTimeDemand =
				averageDailyDemand.multiply(
						BigDecimal.valueOf(
								item.getLeadTimeDays()
						)
				);
		
		BigDecimal reorderPoint =
				leadTimeDemand
						.add(safetyStock)
						.setScale(
								2,
								RoundingMode.HALF_UP
						);
		
		return new InventoryPolicyResponse(
				item.getId(),
				item.getItemCode(),
				item.getName(),
				request.year(),
				
				abcGrade,
				serviceLevelInfo.serviceLevel(),
				
				annualDemand,
				averageDailyDemand.setScale(
						2,
						RoundingMode.HALF_UP
				),
				dailyDemandStandardDeviation,
				
				eoq,
				safetyStock,
				reorderPoint
		);
	}
	
	private BigDecimal calculateEoq(
			long annualDemand,
			BigDecimal orderingCost,
			BigDecimal annualHoldingCostPerUnit
	) {
		
		double d = annualDemand;
		double s = orderingCost.doubleValue();
		double h = annualHoldingCostPerUnit.doubleValue();
		
		double result =
				Math.sqrt((2.0 * d * s) / h);
		
		return BigDecimal.valueOf(result)
				.setScale(
						2,
						RoundingMode.HALF_UP
				);
	}
	
	private BigDecimal calculateSafetyStock(
			BigDecimal standardDeviation,
			int leadTimeDays,
			BigDecimal zScore
	) {
		
		double result =
				zScore.doubleValue()
						* standardDeviation.doubleValue()
						* Math.sqrt(leadTimeDays);
		
		return BigDecimal.valueOf(result)
				.setScale(
						2,
						RoundingMode.HALF_UP
				);
	}
	
	private BigDecimal calculateDailyStandardDeviation(
			List<DemandHistory> histories,
			LocalDate startDate,
			LocalDate endDate,
			BigDecimal averageDailyDemand
	) {
		
		Map<LocalDate, Integer> demandByDate =
				histories.stream()
						.collect(
								Collectors.toMap(
										DemandHistory::getDemandDate,
										DemandHistory::getQuantity
								)
						);
		
		double average =
				averageDailyDemand.doubleValue();
		
		double squaredDifferenceSum = 0.0;
		
		int numberOfDays = 0;
		
		for (
				LocalDate date = startDate;
				!date.isAfter(endDate);
				date = date.plusDays(1)
		) {
			
			int quantity =
					demandByDate.getOrDefault(date, 0);
			
			double difference =
					quantity - average;
			
			squaredDifferenceSum +=
					difference * difference;
			
			numberOfDays++;
		}
		
		double variance =
				squaredDifferenceSum / numberOfDays;
		
		double standardDeviation =
				Math.sqrt(variance);
		
		return BigDecimal.valueOf(standardDeviation)
				.setScale(
						2,
						RoundingMode.HALF_UP
				);
	}
	
	private String findAbcGrade(
			Long itemId,
			int year
	) {
		
		return abcAnalysisService
				.analyze(year)
				.stream()
				.filter(result ->
						result.itemId().equals(itemId)
				)
				.map(AbcResultResponse::grade)
				.findFirst()
				.orElseThrow(() ->
						new ResponseStatusException(
								HttpStatus.BAD_REQUEST,
								"ABC 등급을 계산할 수 없습니다."
						)
				);
	}
	
	private ServiceLevelInfo determineServiceLevel(
			String grade
	) {
		
		return switch (grade) {
			
			case "A" ->
					new ServiceLevelInfo(
							new BigDecimal("99"),
							new BigDecimal("2.3263")
					);
			
			case "B" ->
					new ServiceLevelInfo(
							new BigDecimal("95"),
							new BigDecimal("1.6449")
					);
			
			case "C" ->
					new ServiceLevelInfo(
							new BigDecimal("90"),
							new BigDecimal("1.2816")
					);
			
			default ->
					throw new IllegalArgumentException(
							"지원하지 않는 ABC 등급입니다."
					);
		};
	}
	
	private record ServiceLevelInfo(
			BigDecimal serviceLevel,
			BigDecimal zScore
	) {
	}
}