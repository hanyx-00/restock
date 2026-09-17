package com.restock.planneddemand;

import com.restock.item.Item;
import com.restock.item.ItemRepository;
import com.restock.planneddemand.dto.PlannedDemandRequest;
import com.restock.planneddemand.dto.PlannedDemandResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PlannedDemandService {
	
	private final PlannedDemandRepository plannedDemandRepository;
	private final ItemRepository itemRepository;
	
	public PlannedDemandService(
			PlannedDemandRepository plannedDemandRepository,
			ItemRepository itemRepository
	) {
		this.plannedDemandRepository = plannedDemandRepository;
		this.itemRepository = itemRepository;
	}
	
	@Transactional
	public PlannedDemandResponse create(
			PlannedDemandRequest request
	) {
		
		Item item = findItem(request.itemId());
		
		if (plannedDemandRepository
				.existsByItemIdAndRequiredDate(
						request.itemId(),
						request.requiredDate()
				)) {
			
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"해당 품목의 날짜에 이미 생산계획이 존재합니다."
			);
		}
		
		PlannedDemand plannedDemand =
				new PlannedDemand(
						item,
						request.requiredDate(),
						request.quantity()
				);
		
		return PlannedDemandResponse.from(
				plannedDemandRepository.save(plannedDemand)
		);
	}
	
	public List<PlannedDemandResponse> findAll() {
		
		return plannedDemandRepository
				.findAllByOrderByRequiredDateAsc()
				.stream()
				.map(PlannedDemandResponse::from)
				.toList();
	}
	
	public PlannedDemandResponse findById(Long id) {
		
		return PlannedDemandResponse.from(
				findPlannedDemand(id)
		);
	}
	
	public List<PlannedDemandResponse> findByItemId(
			Long itemId
	) {
		
		findItem(itemId);
		
		return plannedDemandRepository
				.findAllByItemIdOrderByRequiredDateAsc(itemId)
				.stream()
				.map(PlannedDemandResponse::from)
				.toList();
	}
	
	@Transactional
	public PlannedDemandResponse update(
			Long id,
			PlannedDemandRequest request
	) {
		
		PlannedDemand plannedDemand =
				findPlannedDemand(id);
		
		if (!plannedDemand
				.getItem()
				.getId()
				.equals(request.itemId())) {
			
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"생산계획의 품목은 변경할 수 없습니다."
			);
		}
		
		if (plannedDemandRepository
				.existsByItemIdAndRequiredDateAndIdNot(
						request.itemId(),
						request.requiredDate(),
						id
				)) {
			
			throw new ResponseStatusException(
					HttpStatus.CONFLICT,
					"해당 품목의 날짜에 이미 생산계획이 존재합니다."
			);
		}
		
		plannedDemand.update(
				request.requiredDate(),
				request.quantity()
		);
		
		return PlannedDemandResponse.from(plannedDemand);
	}
	
	@Transactional
	public void delete(Long id) {
		
		PlannedDemand plannedDemand =
				findPlannedDemand(id);
		
		plannedDemandRepository.delete(plannedDemand);
	}
	
	private Item findItem(Long itemId) {
		
		return itemRepository.findById(itemId)
				.orElseThrow(() ->
						new ResponseStatusException(
								HttpStatus.NOT_FOUND,
								"품목을 찾을 수 없습니다."
						)
				);
	}
	
	private PlannedDemand findPlannedDemand(Long id) {
		
		return plannedDemandRepository.findById(id)
				.orElseThrow(() ->
						new ResponseStatusException(
								HttpStatus.NOT_FOUND,
								"생산계획을 찾을 수 없습니다."
						)
				);
	}
}