package com.restock.scenario;

import com.restock.inventorypolicy.InventoryPolicyService;
import com.restock.inventorypolicy.dto.InventoryPolicyRequest;
import com.restock.inventorypolicy.dto.InventoryPolicyResponse;
import com.restock.scenario.dto.ScenarioCompareRequest;
import com.restock.scenario.dto.ScenarioCompareResponse;
import com.restock.scenario.dto.ScenarioPolicyInput;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ScenarioServiceTest {

	@Test
	void 주문비용이_증가하면_EOQ_차이를_계산한다() {

		// given
		InventoryPolicyService inventoryPolicyService =
				mock(InventoryPolicyService.class);

		ScenarioService scenarioService =
				new ScenarioService(inventoryPolicyService);

		ScenarioCompareRequest request =
				new ScenarioCompareRequest(
						4L,
						2026,
						new ScenarioPolicyInput(
								new BigDecimal("20000"),
								new BigDecimal("5000")
						),
						new ScenarioPolicyInput(
								new BigDecimal("80000"),
								new BigDecimal("5000")
						)
				);

		InventoryPolicyResponse baseline =
				new InventoryPolicyResponse(
						4L,
						"ABC-MOTOR-001",
						"ABC 테스트 모터",
						2026,
						"B",
						new BigDecimal("95"),
						200,
						new BigDecimal("0.55"),
						new BigDecimal("10.45"),
						new BigDecimal("40"),
						new BigDecimal("45.48"),
						new BigDecimal("49.32")
				);

		InventoryPolicyResponse alternative =
				new InventoryPolicyResponse(
						4L,
						"ABC-MOTOR-001",
						"ABC 테스트 모터",
						2026,
						"B",
						new BigDecimal("95"),
						200,
						new BigDecimal("0.55"),
						new BigDecimal("10.45"),
						new BigDecimal("80"),
						new BigDecimal("45.48"),
						new BigDecimal("49.32")
				);

		when(inventoryPolicyService.calculate(any(InventoryPolicyRequest.class)))
				.thenReturn(baseline)
				.thenReturn(alternative);

		// when
		ScenarioCompareResponse result =
				scenarioService.compare(request);

		// then
		assertThat(result.baseline().economicOrderQuantity())
				.isEqualByComparingTo("40");

		assertThat(result.alternative().economicOrderQuantity())
				.isEqualByComparingTo("80");

		assertThat(
				result.difference()
						.economicOrderQuantityDifference()
		).isEqualByComparingTo("40");

		assertThat(
				result.difference()
						.safetyStockDifference()
		).isEqualByComparingTo("0");

		assertThat(
				result.difference()
						.reorderPointDifference()
		).isEqualByComparingTo("0");

		verify(inventoryPolicyService, times(2))
				.calculate(any(InventoryPolicyRequest.class));
	}
}