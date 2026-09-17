package com.restock.planneddemand;

import com.restock.item.Item;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(
		name = "planned_demands",
		uniqueConstraints = {
				@UniqueConstraint(
						name = "uk_planned_demand_item_date",
						columnNames = {
								"item_id",
								"required_date"
						}
				)
		}
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlannedDemand {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "item_id", nullable = false)
	private Item item;
	
	@Column(name = "required_date", nullable = false)
	private LocalDate requiredDate;
	
	@Column(nullable = false)
	private Integer quantity;
	
	public PlannedDemand(
			Item item,
			LocalDate requiredDate,
			Integer quantity
	) {
		this.item = item;
		this.requiredDate = requiredDate;
		this.quantity = quantity;
	}
	
	public void update(
			LocalDate requiredDate,
			Integer quantity
	) {
		this.requiredDate = requiredDate;
		this.quantity = quantity;
	}
}