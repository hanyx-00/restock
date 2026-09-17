package com.restock.planneddemand;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PlannedDemandRepository
		extends JpaRepository<PlannedDemand, Long> {
	
	List<PlannedDemand> findAllByOrderByRequiredDateAsc();
	
	List<PlannedDemand> findAllByItemIdOrderByRequiredDateAsc(
			Long itemId
	);
	
	boolean existsByItemIdAndRequiredDate(
			Long itemId,
			LocalDate requiredDate
	);
	
	boolean existsByItemIdAndRequiredDateAndIdNot(
			Long itemId,
			LocalDate requiredDate,
			Long id
	);
}