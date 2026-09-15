package com.restock.demand;

import com.restock.demand.dto.DemandHistoryRequest;
import com.restock.demand.dto.DemandHistoryResponse;
import com.restock.item.Item;
import com.restock.item.ItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class DemandHistoryService {
	
	private final DemandHistoryRepository demandHistoryRepository;
	private final ItemRepository itemRepository;
	
	public DemandHistoryService(
			DemandHistoryRepository demandHistoryRepository,
			ItemRepository itemRepository
	) {
		this.demandHistoryRepository = demandHistoryRepository;
		this.itemRepository = itemRepository;
	}
	
	@Transactional
	public DemandHistoryResponse create(DemandHistoryRequest request) {
		
		Item item = findItem(request.itemId());
		
		if (demandHistoryRepository.existsByItemIdAndDemandDate(
				request.itemId(),
				request.demandDate()
		)) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"해당 품목의 날짜에 이미 수요 기록이 존재합니다."
			);
		}
		
		DemandHistory demandHistory = new DemandHistory(
				item,
				request.demandDate(),
				request.quantity()
		);
		
		DemandHistory saved =
				demandHistoryRepository.save(demandHistory);
		
		return DemandHistoryResponse.from(saved);
	}
	
	public List<DemandHistoryResponse> findByItemId(Long itemId) {
		
		findItem(itemId);
		
		return demandHistoryRepository
				.findAllByItemIdOrderByDemandDateAsc(itemId)
				.stream()
				.map(DemandHistoryResponse::from)
				.toList();
	}
	
	public DemandHistoryResponse findById(Long id) {
		return DemandHistoryResponse.from(findDemandHistory(id));
	}
	
	@Transactional
	public DemandHistoryResponse update(
			Long id,
			DemandHistoryRequest request
	) {
		
		DemandHistory demandHistory = findDemandHistory(id);
		
		if (!demandHistory.getItem().getId().equals(request.itemId())) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"수요 기록의 품목은 변경할 수 없습니다."
			);
		}
		
		if (demandHistoryRepository.existsByItemIdAndDemandDateAndIdNot(
				request.itemId(),
				request.demandDate(),
				id
		)) {
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"해당 품목의 날짜에 이미 수요 기록이 존재합니다."
			);
		}
		
		demandHistory.update(
				request.demandDate(),
				request.quantity()
		);
		
		return DemandHistoryResponse.from(demandHistory);
	}
	
	@Transactional
	public void delete(Long id) {
		DemandHistory demandHistory = findDemandHistory(id);
		demandHistoryRepository.delete(demandHistory);
	}
	
	private Item findItem(Long itemId) {
		return itemRepository.findById(itemId)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"품목을 찾을 수 없습니다."
				));
	}
	
	private DemandHistory findDemandHistory(Long id) {
		return demandHistoryRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(
						HttpStatus.NOT_FOUND,
						"수요 기록을 찾을 수 없습니다."
				));
	}
}