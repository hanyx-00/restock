package com.restock.scenario.dto;

import java.math.BigDecimal;

public record ScenarioDifference(
		
		BigDecimal economicOrderQuantityDifference,
		BigDecimal safetyStockDifference,
		BigDecimal reorderPointDifference

) {
}