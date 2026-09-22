package com.restock.inventorypolicy;

import com.restock.abc.AbcAnalysisService;
import com.restock.abc.dto.AbcResultResponse;
import com.restock.demand.DemandHistory;
import com.restock.demand.DemandHistoryRepository;
import com.restock.inventorypolicy.dto.InventoryPolicyRequest;
import com.restock.inventorypolicy.dto.InventoryPolicyResponse;
import com.restock.item.Item;
import com.restock.item.ItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class InventoryPolicyServiceTest {

	@Test
	void EOQ_안전재고_ROP를_계산한다() {

		// given
		ItemRepository itemRepository =
				mock(ItemRepository.class);

		DemandHistoryRepository demandHistoryRepository =
				mock(DemandHistoryRepository.class);

		AbcAnalysisService abcAnalysisService =
				mock(AbcAnalysisService.class);

		InventoryPolicyService inventoryPolicyService =
				new InventoryPolicyService(
						itemRepository,
						demandHistoryRepository,
						abcAnalysisService
				);

		Item item = new Item(
				"ABC-MOTOR-001",
				"ABC 테스트 모터",
				new BigDecimal("35000"),
				7,
				100
		);

		DemandHistory demandHistory =
				new DemandHistory(
						item,
						LocalDate.of(2026, 1, 1),
						200
				);

		when(itemRepository.findById(4L))
				.thenReturn(Optional.of(item));

		when(
				demandHistoryRepository
						.findAllByItemIdAndDemandDateBetween(
								4L,
								LocalDate.of(2026, 1, 1),
								LocalDate.of(2026, 12, 31)
						)
		).thenReturn(
				List.of(demandHistory)
		);

		when(abcAnalysisService.analyze(2026))
				.thenReturn(
						List.of(
								new AbcResultResponse(
										1,
										4L,
										"ABC-MOTOR-001",
										"ABC 테스트 모터",
										200,
										new BigDecimal("35000"),
										new BigDecimal("7000000"),
										new BigDecimal("70"),
										new BigDecimal("70"),
										"B"
								)
						)
				);

		InventoryPolicyRequest request =
				new InventoryPolicyRequest(
						4L,
						2026,
						new BigDecimal("20000"),
						new BigDecimal("5000")
				);

		// when
		InventoryPolicyResponse result =
				inventoryPolicyService.calculate(request);

		// then
		assertThat(result.annualDemand())
				.isEqualTo(200);

		assertThat(result.abcGrade())
				.isEqualTo("B");

		assertThat(result.serviceLevel())
				.isEqualByComparingTo("95");

		assertThat(result.averageDailyDemand())
				.isEqualByComparingTo("0.55");

		assertThat(result.dailyDemandStandardDeviation())
				.isEqualByComparingTo("10.45");

		assertThat(result.economicOrderQuantity())
				.isEqualByComparingTo("40.00");

		assertThat(result.safetyStock())
				.isEqualByComparingTo("45.48");

		assertThat(result.reorderPoint())
				.isEqualByComparingTo("49.32");
	}

	@Test
	void 존재하지_않는_품목이면_404가_발생한다() {

		// given
		ItemRepository itemRepository =
				mock(ItemRepository.class);

		DemandHistoryRepository demandHistoryRepository =
				mock(DemandHistoryRepository.class);

		AbcAnalysisService abcAnalysisService =
				mock(AbcAnalysisService.class);

		InventoryPolicyService inventoryPolicyService =
				new InventoryPolicyService(
						itemRepository,
						demandHistoryRepository,
						abcAnalysisService
				);

		when(itemRepository.findById(999L))
				.thenReturn(Optional.empty());

		InventoryPolicyRequest request =
				new InventoryPolicyRequest(
						999L,
						2026,
						new BigDecimal("20000"),
						new BigDecimal("5000")
				);

		// when
		ResponseStatusException exception =
				assertThrows(
						ResponseStatusException.class,
						() -> inventoryPolicyService.calculate(request)
				);

		// then
		assertThat(exception.getStatusCode().value())
				.isEqualTo(404);
	}

	@Test
	void 해당_연도의_수요가_없으면_400이_발생한다() {

		// given
		ItemRepository itemRepository =
				mock(ItemRepository.class);

		DemandHistoryRepository demandHistoryRepository =
				mock(DemandHistoryRepository.class);

		AbcAnalysisService abcAnalysisService =
				mock(AbcAnalysisService.class);

		InventoryPolicyService inventoryPolicyService =
				new InventoryPolicyService(
						itemRepository,
						demandHistoryRepository,
						abcAnalysisService
				);

		Item item = new Item(
				"ABC-MOTOR-001",
				"ABC 테스트 모터",
				new BigDecimal("35000"),
				7,
				100
		);

		when(itemRepository.findById(4L))
				.thenReturn(Optional.of(item));

		when(
				demandHistoryRepository
						.findAllByItemIdAndDemandDateBetween(
								4L,
								LocalDate.of(2026, 1, 1),
								LocalDate.of(2026, 12, 31)
						)
		).thenReturn(List.of());

		InventoryPolicyRequest request =
				new InventoryPolicyRequest(
						4L,
						2026,
						new BigDecimal("20000"),
						new BigDecimal("5000")
				);

		// when
		ResponseStatusException exception =
				assertThrows(
						ResponseStatusException.class,
						() -> inventoryPolicyService.calculate(request)
				);

		// then
		assertThat(exception.getStatusCode().value())
				.isEqualTo(400);
	}
}