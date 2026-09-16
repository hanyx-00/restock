package com.restock.bom;

import com.restock.bom.dto.BomRequest;
import com.restock.bom.dto.BomResponse;
import com.restock.item.Item;
import com.restock.item.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BomService {
	
	private final BomComponentRepository bomComponentRepository;
	private final ItemRepository itemRepository;
	
	public BomService(
			BomComponentRepository bomComponentRepository,
			ItemRepository itemRepository
	) {
		this.bomComponentRepository = bomComponentRepository;
		this.itemRepository = itemRepository;
	}
	
	@Transactional
	public BomResponse create(BomRequest request) {
		
		if (request.parentItemId().equals(request.componentItemId())) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"품목 자신을 자신의 부품으로 등록할 수 없습니다."
			);
		}
		
		Item parentItem = findItem(request.parentItemId());
		Item componentItem = findItem(request.componentItemId());
		
		if (bomComponentRepository
				.existsByParentItemIdAndComponentItemId(
						request.parentItemId(),
						request.componentItemId()
				)) {
			
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"이미 등록된 BOM 구성품입니다."
			);
		}
		
		BomComponent bom = new BomComponent(
				parentItem,
				componentItem,
				request.quantityPer()
		);
		
		return BomResponse.from(
				bomComponentRepository.save(bom)
		);
	}
	
	public List<BomResponse> findByParentItemId(
			Long parentItemId
	) {
		
		findItem(parentItemId);
		
		return bomComponentRepository
				.findAllByParentItemIdOrderByComponentItemItemCodeAsc(
						parentItemId
				)
				.stream()
				.map(BomResponse::from)
				.toList();
	}
	
	@Transactional
	public BomResponse updateQuantity(
			Long id,
			BigDecimal quantityPer
	) {
		
		if (quantityPer == null
				|| quantityPer.compareTo(BigDecimal.ZERO) <= 0) {
			
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"필요 수량은 0보다 커야 합니다."
			);
		}
		
		BomComponent bom = findBom(id);
		
		bom.updateQuantity(quantityPer);
		
		return BomResponse.from(bom);
	}
	
	@Transactional
	public void delete(Long id) {
		
		BomComponent bom = findBom(id);
		
		bomComponentRepository.delete(bom);
	}
	
	private Item findItem(Long id) {
		return itemRepository.findById(id)
				.orElseThrow(() ->
						new ResponseStatusException(
								HttpStatus.NOT_FOUND,
								"품목을 찾을 수 없습니다."
						)
				);
	}
	
	private BomComponent findBom(Long id) {
		return bomComponentRepository.findById(id)
				.orElseThrow(() ->
						new ResponseStatusException(
								HttpStatus.NOT_FOUND,
								"BOM 구성품을 찾을 수 없습니다."
						)
				);
	}
}