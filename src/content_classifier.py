from src.utils import FILETYPE_TO_CATEGORY

class ContentCategoryClassifier:
    def classify(self, filetype: str, binary_data: bytes = None) -> str:
        """
        Classify content category based on file type
        Returns: 'media', 'structured', 'document', 'executable', 'archive', 'code', or 'unstructured'
        """
        filetype_lower = filetype.lower()
        
        # Direct lookup from our mapping
        category = FILETYPE_TO_CATEGORY.get(filetype_lower, 'unstructured')
        
        # Additional logic for ambiguous cases
        if category == 'unstructured' and binary_data:
            # Try to detect if it's text-based
            if self._is_text_data(binary_data):
                category = 'document'
        
        return category
    
    def _is_text_data(self, binary_data: bytes) -> bool:
        """Check if data is primarily text"""
        try:
            # Try to decode as text
            sample = binary_data[:1024]
            sample.decode('utf-8')
            
            # Check if mostly printable
            printable = sum(1 for b in sample if 32 <= b <= 126 or b in (9, 10, 13))
            ratio = printable / len(sample) if sample else 0
            
            return ratio > 0.7
        except:
            return False