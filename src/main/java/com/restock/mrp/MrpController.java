package com.restock.mrp;

import com.restock.mrp.dto.MrpResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mrp")
public class MrpController {
	
	private final MrpService mrpService;
	
	public MrpController(MrpService mrpService) {
		this.mrpService = mrpService;
	}
	
	@GetMapping("/planned-demand/{plannedDemandId}")
	public MrpResponse calculate(
			@PathVariable Long plannedDemandId
	) {
		return mrpService.calculate(plannedDemandId);
	}
}
