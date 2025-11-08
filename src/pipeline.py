from src.file_type_identifier import FileTypeIdentifier
from src.content_classifier import ContentCategoryClassifier
from src.confidence_scorer import ConfidenceScorer
from src.pii_detector import PIIDetector
from src.utils import FileClassificationResult
from datetime import datetime

class FileClassificationPipeline:
    def __init__(self):
        self.type_identifier = FileTypeIdentifier()
        self.category_classifier = ContentCategoryClassifier()
        self.confidence_scorer = ConfidenceScorer()
        self.pii_detector = PIIDetector()
    
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
        
        # Step 4: Detect PII (Stretch Goal)
        # Only scan text-based files for PII (not binary media files)
        pii_summary = None
        text_based_types = ['txt', 'csv', 'json', 'xml', 'html', 'pdf', 'doc', 'docx', 
                           'xls', 'xlsx', 'log', 'md', 'yaml', 'yml', 'sql', 'py', 'js',
                           'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'sql']
        
        if type_result['type'] in text_based_types or content_category in ['document', 'structured', 'code']:
            try:
                pii_detections = self.pii_detector.detect_in_binary(binary_data)
                pii_summary = self.pii_detector.summarize(pii_detections)
            except Exception as e:
                # PII detection failed, continue without it
                print(f"PII detection warning for {filename}: {e}")
                pii_summary = {'has_pii': False, 'error': str(e)}
        
        # Step 5: Build result object
        metadata = {
            'file_size': len(binary_data),
            'filename': filename,
            'analyzed_at': datetime.now().isoformat(),
            'extension': type_result.get('extension')
        }
        
        # Add PII information to metadata
        if pii_summary:
            metadata['pii_detection'] = pii_summary
        
        result = FileClassificationResult(
            filetype=type_result['type'],
            content_category=content_category,
            confidence_score=confidence,
            mime_type=type_result.get('mime_type'),
            metadata=metadata
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