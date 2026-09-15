package com.restock.demand;

import com.restock.item.Item;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
		name = "demand_histories",
		uniqueConstraints = {
				@UniqueConstraint(
						name = "uk_demand_history_item_date",
						columnNames = {"item_id", "demand_date"}
				)
		}
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DemandHistory {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "item_id", nullable = false)
	private Item item;
	
	@Column(name = "demand_date", nullable = false)
	private LocalDate demandDate;
	
	@Column(nullable = false)
	private Integer quantity;
	
	public DemandHistory(
			Item item,
			LocalDate demandDate,
			Integer quantity
	) {
		this.item = item;
		this.demandDate = demandDate;
		this.quantity = quantity;
	}
	
	public void update(
			LocalDate demandDate,
			Integer quantity
	) {
		this.demandDate = demandDate;
		this.quantity = quantity;
	}
}