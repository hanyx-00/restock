package com.restock.demand;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DemandHistoryRepository
		extends JpaRepository<DemandHistory, Long> {
	
	List<DemandHistory> findAllByItemIdOrderByDemandDateAsc(Long itemId);
	
	boolean existsByItemIdAndDemandDate(Long itemId, LocalDate demandDate);
	
	boolean existsByItemIdAndDemandDateAndIdNot(
			Long itemId,
			LocalDate demandDate,
			Long id
	);
}