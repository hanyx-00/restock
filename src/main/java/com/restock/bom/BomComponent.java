package com.restock.bom;

import com.restock.item.Item;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(
		name = "bom_components",
		uniqueConstraints = {
				@UniqueConstraint(
						name = "uk_bom_parent_component",
						columnNames = {
								"parent_item_id",
								"component_item_id"
						}
				)
		}
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BomComponent {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "parent_item_id", nullable = false)
	private Item parentItem;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "component_item_id", nullable = false)
	private Item componentItem;
	
	@Column(
			name = "quantity_per",
			nullable = false,
			precision = 19,
			scale = 4
	)
	private BigDecimal quantityPer;
	
	public BomComponent(
			Item parentItem,
			Item componentItem,
			BigDecimal quantityPer
	) {
		this.parentItem = parentItem;
		this.componentItem = componentItem;
		this.quantityPer = quantityPer;
	}
	
	public void updateQuantity(BigDecimal quantityPer) {
		this.quantityPer = quantityPer;
	}
}