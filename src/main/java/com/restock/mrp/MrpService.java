package com.restock.mrp;

import com.restock.bom.BomComponent;
import com.restock.bom.BomComponentRepository;
import com.restock.item.Item;
import com.restock.mrp.dto.MrpItemResult;
import com.restock.mrp.dto.MrpResponse;
import com.restock.planneddemand.PlannedDemand;
import com.restock.planneddemand.PlannedDemandRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class MrpService {
	
	private final PlannedDemandRepository plannedDemandRepository;
	private final BomComponentRepository bomComponentRepository;
	
	public MrpService(
			PlannedDemandRepository plannedDemandRepository,
			BomComponentRepository bomComponentRepository
	) {
		this.plannedDemandRepository = plannedDemandRepository;
		this.bomComponentRepository = bomComponentRepository;
	}
	
	public MrpResponse calculate(Long plannedDemandId) {
		
		PlannedDemand plannedDemand =
				plannedDemandRepository.findById(plannedDemandId)
						.orElseThrow(() ->
								new ResponseStatusException(
										HttpStatus.NOT_FOUND,
										"생산계획을 찾을 수 없습니다."
								)
						);
		
		Item parentItem = plannedDemand.getItem();
		
		List<BomComponent> bomComponents =
				bomComponentRepository
						.findAllByParentItemIdOrderByComponentItemItemCodeAsc(
								parentItem.getId()
						);
		
		if (bomComponents.isEmpty()) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"해당 품목에 등록된 BOM이 없습니다."
			);
		}
		
		List<MrpItemResult> materials =
				bomComponents.stream()
						.map(bom ->
								calculateMaterial(
										plannedDemand,
										bom
								)
						)
						.toList();
		
		return new MrpResponse(
				plannedDemand.getId(),
				
				parentItem.getId(),
				parentItem.getItemCode(),
				parentItem.getName(),
				
				plannedDemand.getRequiredDate(),
				plannedDemand.getQuantity(),
				
				materials
		);
	}
	
	private MrpItemResult calculateMaterial(
			PlannedDemand plannedDemand,
			BomComponent bom
	) {
		
		Item component =
				bom.getComponentItem();
		
		BigDecimal plannedQuantity =
				BigDecimal.valueOf(
						plannedDemand.getQuantity()
				);
		
		BigDecimal grossRequirement =
				bom.getQuantityPer()
						.multiply(plannedQuantity);
		
		BigDecimal onHand =
				BigDecimal.valueOf(
						component.getOnHandQuantity()
				);
		
		BigDecimal rawNetRequirement =
				grossRequirement.subtract(onHand);
		
		BigDecimal netRequirement;
		
		if (rawNetRequirement.compareTo(BigDecimal.ZERO) > 0) {
			netRequirement = rawNetRequirement;
		} else {
			netRequirement = BigDecimal.ZERO;
		}
		
		BigDecimal plannedOrderReceipt =
				netRequirement;
		
		LocalDate plannedOrderReleaseDate = null;
		
		if (netRequirement.compareTo(BigDecimal.ZERO) > 0) {
			plannedOrderReleaseDate =
					plannedDemand
							.getRequiredDate()
							.minusDays(
									component.getLeadTimeDays()
							);
		}
		
		return new MrpItemResult(
				component.getId(),
				component.getItemCode(),
				component.getName(),
				
				bom.getQuantityPer(),
				
				grossRequirement,
				component.getOnHandQuantity(),
				netRequirement,
				
				plannedOrderReceipt,
				
				component.getLeadTimeDays(),
				plannedDemand.getRequiredDate(),
				plannedOrderReleaseDate
		);
	}
}