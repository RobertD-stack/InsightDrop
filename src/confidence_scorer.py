class ConfidenceScorer:
    def calculate(self, confidence_factors: dict, filetype: str) -> float:
        """
        Calculate confidence score based on multiple factors
        Returns: float between 0.0 and 1.0
        """
        score = 0.0
        
        # Magic number match (40% weight)
        if confidence_factors.get('magic_match', False):
            score += 0.40
        
        # Extension match (30% weight)
        if confidence_factors.get('extension_match', False):
            score += 0.30
        
        # Structure validation (30% weight)
        if confidence_factors.get('structure_valid', False):
            score += 0.30
        
        # Bonus for unknown files with any detection
        if filetype != 'unknown' and score > 0:
            score = max(score, 0.50)
        
        # Cap at 0.99 for known types (never 100% certain)
        if filetype != 'unknown':
            score = min(score, 0.99)
        else:
            score = min(score, 0.30)  # Low confidence for unknown
        
        return round(score, 2)