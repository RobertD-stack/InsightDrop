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
        
        # Bonus for known file types with any detection
        if filetype != 'unknown' and score > 0:
            score = max(score, 0.50)
        
        # Higher confidence for media files detected by extension
        # Videos, images, and audio files are usually correctly identified by extension
        media_types = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg', 'm4v',
                      'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'tiff',
                      'mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus']
        if filetype in media_types and confidence_factors.get('extension_match', False):
            # Media files with matching extension get high confidence
            score = max(score, 0.70)  # At least 70% for media files with extension match
        
        # Minimum score for files with extension (even if unknown type)
        # This ensures unstructured files get at least a small score
        if filetype == 'unknown' and confidence_factors.get('extension_match', False):
            score = max(score, 0.10)  # At least 10% if extension exists
        
        # Cap at 0.99 for known types (never 100% certain)
        if filetype != 'unknown':
            score = min(score, 0.99)
        else:
            # For unknown files, cap at 0.30 but ensure minimum of 0.05 if we have any info
            if score > 0:
                score = min(score, 0.30)
            else:
                # Give a tiny score for completely unknown files to show they were processed
                score = 0.05
        
        return round(score, 2)