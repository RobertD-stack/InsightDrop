from src.file_type_identifier import FileTypeIdentifier
from src.content_classifier import ContentCategoryClassifier
from src.confidence_scorer import ConfidenceScorer
from src.utils import FileClassificationResult
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

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
    
    def process_batch(self, file_list: list, max_workers: int = None, use_parallel: bool = True) -> list:
        """
        Process multiple files in parallel using ThreadPoolExecutor
        Input: list of tuples [(binary_data, filename), ...]
        Output: list of FileClassificationResult objects
        
        Args:
            file_list: List of (binary_data, filename) tuples
            max_workers: Maximum number of threads (default: CPU count + 4, capped at 32)
            use_parallel: Whether to use parallel processing (default: True)
        """
        # For small batches or when parallel is disabled, use sequential processing
        if not use_parallel or len(file_list) < 3:
            return self._process_batch_sequential(file_list)
        
        # Determine optimal number of worker threads
        if max_workers is None:
            # Use Python's recommended default: min(32, CPU count + 4)
            max_workers = min(32, (os.cpu_count() or 1) + 4)
        
        print(f"🔄 Processing {len(file_list)} files with {max_workers} worker threads...")
        
        results = []
        
        # Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks and create a mapping of future -> (index, filename)
            future_to_file = {}
            for index, (binary_data, filename) in enumerate(file_list):
                future = executor.submit(self._process_file_safe, binary_data, filename)
                future_to_file[future] = (index, filename)
            
            # Collect results as they complete
            completed_results = {}
            for future in as_completed(future_to_file):
                index, filename = future_to_file[future]
                try:
                    result = future.result()
                    completed_results[index] = result
                except Exception as e:
                    print(f"❌ Error processing {filename}: {e}")
                    # Return error result for failed files
                    completed_results[index] = FileClassificationResult(
                        filetype='error',
                        content_category='unknown',
                        confidence_score=0.0,
                        metadata={'error': str(e), 'filename': filename}
                    )
            
            # Sort results by original order
            results = [completed_results[i] for i in sorted(completed_results.keys())]
        
        print(f"✅ Completed processing {len(results)} files")
        return results
    
    def _process_file_safe(self, binary_data: bytes, filename: str) -> FileClassificationResult:
        """
        Thread-safe wrapper for process_file with error handling
        """
        try:
            return self.process_file(binary_data, filename)
        except Exception as e:
            print(f"⚠️  Error in thread processing {filename}: {e}")
            raise
    
    def _process_batch_sequential(self, file_list: list) -> list:
        """
        Sequential batch processing (fallback for small batches or when parallel is disabled)
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