package com.restock.item;

import com.restock.item.dto.ItemRequest;
import com.restock.item.dto.ItemResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ItemService {
	
	private final ItemRepository itemRepository;
	
	public ItemService(ItemRepository itemRepository) {
		this.itemRepository = itemRepository;
	}
	
	@Transactional
	public ItemResponse create(ItemRequest request) {
		
		if (itemRepository.existsByItemCode(request.itemCode())) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"이미 존재하는 품목 코드입니다."
			);
		}
		
		Item item = new Item(
				request.itemCode(),
				request.name(),
				request.unitPrice(),
				request.leadTimeDays(),
				request.onHandQuantity()
		);
		
		Item savedItem = itemRepository.save(item);
		
		return ItemResponse.from(savedItem);
	}
	
	public List<ItemResponse> findAll() {
		return itemRepository.findAll()
				.stream()
				.map(ItemResponse::from)
				.toList();
	}
	
	public ItemResponse findById(Long id) {
		Item item = findItem(id);
		
		return ItemResponse.from(item);
	}
	
	@Transactional
	public ItemResponse update(Long id, ItemRequest request) {
		
		Item item = findItem(id);
		
		if (itemRepository.existsByItemCodeAndIdNot(request.itemCode(), id)) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"이미 존재하는 품목 코드입니다."
			);
		}
		
		item.update(
				request.itemCode(),
				request.name(),
				request.unitPrice(),
				request.leadTimeDays(),
				request.onHandQuantity()
		);
		
		return ItemResponse.from(item);
	}
	
	@Transactional
	public void delete(Long id) {
		Item item = findItem(id);
		
		itemRepository.delete(item);
	}
	
	private Item findItem(Long id) {
		return itemRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"품목을 찾을 수 없습니다."
				));
	}
}