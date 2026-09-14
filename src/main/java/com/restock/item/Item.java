package com.restock.item;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Item {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, unique = true, length = 50)
	private String itemCode;
	
	@Column(nullable = false, length = 100)
	private String name;
	
	@Column(nullable = false, precision = 19, scale = 2)
	private BigDecimal unitPrice;
	
	@Column(nullable = false)
	private Integer leadTimeDays;
	
	@Column(nullable = false)
	private Integer onHandQuantity;
	
	public Item(
			String itemCode,
			String name,
			BigDecimal unitPrice,
			Integer leadTimeDays,
			Integer onHandQuantity
	) {
		this.itemCode = itemCode;
		this.name = name;
		this.unitPrice = unitPrice;
		this.leadTimeDays = leadTimeDays;
		this.onHandQuantity = onHandQuantity;
	}
	
	public void update(
			String itemCode,
			String name,
			BigDecimal unitPrice,
			Integer leadTimeDays,
			Integer onHandQuantity
	) {
		this.itemCode = itemCode;
		this.name = name;
		this.unitPrice = unitPrice;
		this.leadTimeDays = leadTimeDays;
		this.onHandQuantity = onHandQuantity;
	}
}