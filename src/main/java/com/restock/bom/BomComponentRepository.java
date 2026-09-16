package com.restock.bom;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BomComponentRepository
		extends JpaRepository<BomComponent, Long> {
	
	List<BomComponent> findAllByParentItemIdOrderByComponentItemItemCodeAsc(
			Long parentItemId
	);
	
	boolean existsByParentItemIdAndComponentItemId(
			Long parentItemId,
			Long componentItemId
	);
}