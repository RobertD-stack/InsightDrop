from src.file_type_identifier import FileTypeIdentifier
from src.content_classifier import ContentCategoryClassifier
from src.confidence_scorer import ConfidenceScorer
from src.utils import FileClassificationResult
from datetime import datetime

class FileClassificationPipeline:
    def __init__(self):
        self.type_identifier = FileTypeIdentifier()
        self.category_classifier = ContentCategoryClassifier()
        self.confidence_scorer = ConfidenceScorer()
    
    def process_file(self, binary_data: bytes, filename: str = None) -> FileClassificationResult:
        """
        Main processing pipeline
        Input: binary file data and optional filename
        Output: FileClassificationResult object
        """
        
        # Step 1: Identify file type
        type_result = self.type_identifier.identify(binary_data, filename)
        
        # Step 2: Classify content category
        content_category = self.category_classifier.classify(
            type_result['type'], 
            binary_data
        )
        
        # Step 3: Calculate confidence score
        confidence = self.confidence_scorer.calculate(
            type_result['confidence_factors'],
            type_result['type']
        )
        
        # Step 4: Build result object
        result = FileClassificationResult(
            filetype=type_result['type'],
            content_category=content_category,
            confidence_score=confidence,
            mime_type=type_result.get('mime_type'),
            metadata={
                'file_size': len(binary_data),
                'filename': filename,
                'analyzed_at': datetime.now().isoformat(),
                'extension': type_result.get('extension')
            }
        )
        
        return result
    
    def process_batch(self, file_list: list) -> list:
        """
        Process multiple files
        Input: list of tuples [(binary_data, filename), ...]
        Output: list of FileClassificationResult objects
        """
        results = []
        for binary_data, filename in file_list:
            try:
                result = self.process_file(binary_data, filename)
                results.append(result)
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                # Return a minimal result for failed files
                results.append(FileClassificationResult(
                    filetype='error',
                    content_category='unknown',
                    confidence_score=0.0,
                    metadata={'error': str(e), 'filename': filename}
                ))
        return results