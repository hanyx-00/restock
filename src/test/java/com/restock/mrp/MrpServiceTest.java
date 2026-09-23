package com.restock.mrp;

import com.restock.bom.BomComponent;
import com.restock.bom.BomComponentRepository;
import com.restock.item.Item;
import com.restock.mrp.dto.MrpItemResult;
import com.restock.mrp.dto.MrpResponse;
import com.restock.planneddemand.PlannedDemand;
import com.restock.planneddemand.PlannedDemandRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class MrpServiceTest {

	@Test
	void BOM을_전개하여_총소요량과_순소요량을_계산한다() {

		// given
		PlannedDemandRepository plannedDemandRepository =
				mock(PlannedDemandRepository.class);

		BomComponentRepository bomComponentRepository =
				mock(BomComponentRepository.class);

		MrpService mrpService =
				new MrpService(
						plannedDemandRepository,
						bomComponentRepository
				);

		Item parentItem = mock(Item.class);

		when(parentItem.getId()).thenReturn(7L);
		when(parentItem.getItemCode()).thenReturn("PRODUCT-A");
		when(parentItem.getName()).thenReturn("완제품 A");

		PlannedDemand plannedDemand =
				mock(PlannedDemand.class);

		when(plannedDemand.getId()).thenReturn(1L);
		when(plannedDemand.getItem()).thenReturn(parentItem);
		when(plannedDemand.getRequiredDate())
				.thenReturn(LocalDate.of(2026, 10, 1));
		when(plannedDemand.getQuantity()).thenReturn(100);

		Item motor = mock(Item.class);

		when(motor.getId()).thenReturn(4L);
		when(motor.getItemCode()).thenReturn("ABC-MOTOR-001");
		when(motor.getName()).thenReturn("모터");
		when(motor.getOnHandQuantity()).thenReturn(100);
		when(motor.getLeadTimeDays()).thenReturn(7);

		Item gear = mock(Item.class);

		when(gear.getId()).thenReturn(5L);
		when(gear.getItemCode()).thenReturn("ABC-GEAR-001");
		when(gear.getName()).thenReturn("기어");
		when(gear.getOnHandQuantity()).thenReturn(100);
		when(gear.getLeadTimeDays()).thenReturn(5);

		Item bolt = mock(Item.class);

		when(bolt.getId()).thenReturn(6L);
		when(bolt.getItemCode()).thenReturn("ABC-BOLT-001");
		when(bolt.getName()).thenReturn("볼트");
		when(bolt.getOnHandQuantity()).thenReturn(500);
		when(bolt.getLeadTimeDays()).thenReturn(3);

		BomComponent motorBom = mock(BomComponent.class);

		when(motorBom.getComponentItem()).thenReturn(motor);
		when(motorBom.getQuantityPer())
				.thenReturn(new BigDecimal("1"));

		BomComponent gearBom = mock(BomComponent.class);

		when(gearBom.getComponentItem()).thenReturn(gear);
		when(gearBom.getQuantityPer())
				.thenReturn(new BigDecimal("2"));

		BomComponent boltBom = mock(BomComponent.class);

		when(boltBom.getComponentItem()).thenReturn(bolt);
		when(boltBom.getQuantityPer())
				.thenReturn(new BigDecimal("8"));

		when(plannedDemandRepository.findById(1L))
				.thenReturn(Optional.of(plannedDemand));

		when(
				bomComponentRepository
						.findAllByParentItemIdOrderByComponentItemItemCodeAsc(7L)
		).thenReturn(
				List.of(
						motorBom,
						gearBom,
						boltBom
				)
		);

		// when
		MrpResponse result =
				mrpService.calculate(1L);

		// then
		assertThat(result.plannedQuantity())
				.isEqualTo(100);

		assertThat(result.requiredDate())
				.isEqualTo(LocalDate.of(2026, 10, 1));

		assertThat(result.materials())
				.hasSize(3);

		MrpItemResult motorResult =
				findMaterial(
						result,
						"ABC-MOTOR-001"
				);

		assertThat(motorResult.grossRequirement())
				.isEqualByComparingTo("100");

		assertThat(motorResult.onHandQuantity())
				.isEqualTo(100);

		assertThat(motorResult.netRequirement())
				.isEqualByComparingTo("0");

		assertThat(motorResult.plannedOrderReceipt())
				.isEqualByComparingTo("0");
		
		assertThat(motorResult.plannedOrderReleaseDate())
				.isNull();

		MrpItemResult gearResult =
				findMaterial(
						result,
						"ABC-GEAR-001"
				);

		assertThat(gearResult.grossRequirement())
				.isEqualByComparingTo("200");

		assertThat(gearResult.onHandQuantity())
				.isEqualTo(100);

		assertThat(gearResult.netRequirement())
				.isEqualByComparingTo("100");

		assertThat(gearResult.plannedOrderReceipt())
				.isEqualByComparingTo("100");

		assertThat(gearResult.plannedOrderReleaseDate())
				.isEqualTo(
						LocalDate.of(2026, 9, 26)
				);

		MrpItemResult boltResult =
				findMaterial(
						result,
						"ABC-BOLT-001"
				);

		assertThat(boltResult.grossRequirement())
				.isEqualByComparingTo("800");

		assertThat(boltResult.onHandQuantity())
				.isEqualTo(500);

		assertThat(boltResult.netRequirement())
				.isEqualByComparingTo("300");

		assertThat(boltResult.plannedOrderReceipt())
				.isEqualByComparingTo("300");

		assertThat(boltResult.plannedOrderReleaseDate())
				.isEqualTo(
						LocalDate.of(2026, 9, 28)
				);
	}

	@Test
	void 존재하지_않는_생산계획이면_404가_발생한다() {

		// given
		PlannedDemandRepository plannedDemandRepository =
				mock(PlannedDemandRepository.class);

		BomComponentRepository bomComponentRepository =
				mock(BomComponentRepository.class);

		MrpService mrpService =
				new MrpService(
						plannedDemandRepository,
						bomComponentRepository
				);

		when(plannedDemandRepository.findById(999L))
				.thenReturn(Optional.empty());

		// when
		ResponseStatusException exception =
				assertThrows(
						ResponseStatusException.class,
						() -> mrpService.calculate(999L)
				);

		// then
		assertThat(exception.getStatusCode().value())
				.isEqualTo(404);
	}

	@Test
	void BOM이_없으면_400이_발생한다() {

		// given
		PlannedDemandRepository plannedDemandRepository =
				mock(PlannedDemandRepository.class);

		BomComponentRepository bomComponentRepository =
				mock(BomComponentRepository.class);

		MrpService mrpService =
				new MrpService(
						plannedDemandRepository,
						bomComponentRepository
				);

		Item parentItem = mock(Item.class);

		when(parentItem.getId())
				.thenReturn(7L);

		PlannedDemand plannedDemand =
				mock(PlannedDemand.class);

		when(plannedDemand.getItem())
				.thenReturn(parentItem);

		when(plannedDemandRepository.findById(1L))
				.thenReturn(Optional.of(plannedDemand));

		when(
				bomComponentRepository
						.findAllByParentItemIdOrderByComponentItemItemCodeAsc(7L)
		).thenReturn(List.of());

		// when
		ResponseStatusException exception =
				assertThrows(
						ResponseStatusException.class,
						() -> mrpService.calculate(1L)
				);

		// then
		assertThat(exception.getStatusCode().value())
				.isEqualTo(400);
	}

	private MrpItemResult findMaterial(
			MrpResponse response,
			String itemCode
	) {

		return response.materials()
				.stream()
				.filter(material ->
						material.componentItemCode()
								.equals(itemCode)
				)
				.findFirst()
				.orElseThrow();
	}
}