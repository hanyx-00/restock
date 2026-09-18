package com.restock.scenario;

import com.restock.scenario.dto.ScenarioCompareRequest;
import com.restock.scenario.dto.ScenarioCompareResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {
	
	private final ScenarioService scenarioService;
	
	public ScenarioController(
			ScenarioService scenarioService
	) {
		this.scenarioService = scenarioService;
	}
	
	@PostMapping("/compare")
	public ScenarioCompareResponse compare(
			@Valid
			@RequestBody
			ScenarioCompareRequest request
	) {
		return scenarioService.compare(request);
	}
}