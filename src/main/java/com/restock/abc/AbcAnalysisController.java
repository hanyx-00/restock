package com.restock.abc;

import com.restock.abc.dto.AbcResultResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/abc")
public class AbcAnalysisController {
	
	private final AbcAnalysisService abcAnalysisService;
	
	public AbcAnalysisController(
			AbcAnalysisService abcAnalysisService
	) {
		this.abcAnalysisService = abcAnalysisService;
	}
	
	@GetMapping
	public List<AbcResultResponse> analyze(
			@RequestParam int year
	) {
		return abcAnalysisService.analyze(year);
	}
}