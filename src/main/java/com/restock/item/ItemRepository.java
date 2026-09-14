package com.restock.item;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {
	
	boolean existsByItemCode(String itemCode);
	
	boolean existsByItemCodeAndIdNot(String itemCode, Long id);
}