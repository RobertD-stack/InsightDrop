from src.pipeline import FileClassificationPipeline
from pathlib import Path
import json

def test_single_file(filepath: str):
    """Test a single file"""
    pipeline = FileClassificationPipeline()
    
    with open(filepath, 'rb') as f:
        binary_data = f.read()
    
    result = pipeline.process_file(binary_data, Path(filepath).name)
    
    print(f"\n{'='*60}")
    print(f"File: {filepath}")
    print(f"{'='*60}")
    print(json.dumps(result.to_dict(), indent=2))
    print(f"{'='*60}\n")
    
    return result

def test_folder(folder_path: str):
    """Test all files in a folder"""
    pipeline = FileClassificationPipeline()
    folder = Path(folder_path)
    
    files = []
    for file_path in folder.rglob('*'):
        if file_path.is_file():
            with open(file_path, 'rb') as f:
                files.append((f.read(), file_path.name))
    
    print(f"\nProcessing {len(files)} files from {folder_path}...\n")
    results = pipeline.process_batch(files)
    
    # Summary
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    for result in results:
        print(f"{result.metadata.get('filename', 'unknown'):30} | "
              f"{result.filetype:10} | "
              f"{result.content_category:12} | "
              f"Confidence: {result.confidence_score:.2f}")
    print(f"{'='*60}\n")
    
    return results

if __name__ == "__main__":
    # Test with a single file
    # test_single_file("path/to/your/test/file.pdf")
    
    # Test with a folder of files
    test_folder("tests/test_files")