"""
Model Dispatcher - Routes classification requests to different AI models
Supports: Signature-based, Google Gemini, Ollama
"""

from src.pipeline import FileClassificationPipeline
from src.utils import FileClassificationResult
import os

class ModelDispatcher:
    def __init__(self):
        # Initialize base pipeline (signature-based)
        self.signature_pipeline = FileClassificationPipeline()
        
        # Initialize Gemini if API key available
        self.gemini_available = False
        self.gemini_model = None
        try:
            import google.generativeai as genai
            api_key = os.environ.get('GEMINI_API_KEY')
            if api_key:
                genai.configure(api_key=api_key)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                self.gemini_available = True
                print("✅ Google Gemini model initialized")
            else:
                print("⚠️  GEMINI_API_KEY not set - Gemini model unavailable")
        except ImportError:
            print("⚠️  google-generativeai not installed - Gemini model unavailable")
        except Exception as e:
            print(f"⚠️  Gemini initialization failed: {e}")
        
        # Initialize Ollama if available
        self.ollama_available = False
        try:
            import ollama
            # Test if Ollama is running
            ollama.list()
            self.ollama_available = True
            print("✅ Ollama is running and available")
        except ImportError:
            print("⚠️  ollama-python not installed - Ollama model unavailable")
        except Exception as e:
            print(f"⚠️  Ollama not available: {e}")
    
    def classify(self, binary_data: bytes, filename: str, model: str = 'signature-based') -> FileClassificationResult:
        """
        Classify file using specified model
        """
        if model == 'gemini' and self.gemini_available:
            return self._classify_with_gemini(binary_data, filename)
        elif model == 'ollama' and self.ollama_available:
            return self._classify_with_ollama(binary_data, filename)
        else:
            # Default to signature-based
            return self.signature_pipeline.process_file(binary_data, filename)
    
    def _classify_with_gemini(self, binary_data: bytes, filename: str) -> FileClassificationResult:
        """Use Google Gemini to classify file"""
        try:
            # Get signature-based baseline
            baseline = self.signature_pipeline.process_file(binary_data, filename)
            
            # For text files, use Gemini to analyze content
            if len(binary_data) < 100000 and self._is_likely_text(binary_data):
                try:
                    content = binary_data.decode('utf-8', errors='ignore')[:2000]  # First 2000 chars
                    
                    prompt = f"""Analyze this file content and determine:
1. File type (e.g., python, javascript, csv, json, html, etc.)
2. Content category (code, document, structured, media, executable, archive)

Filename: {filename}
Content preview:
{content}

Return ONLY: filetype|category
Example: python|code"""

                    response = self.gemini_model.generate_content(prompt)
                    result_text = response.text.strip()
                    
                    if '|' in result_text:
                        filetype, category = result_text.split('|')[:2]
                        baseline.filetype = filetype.strip().lower()
                        baseline.content_category = category.strip().lower()
                        baseline.confidence_score = min(baseline.confidence_score + 0.05, 0.99)  # Boost confidence
                        
                        if not baseline.metadata:
                            baseline.metadata = {}
                        baseline.metadata['ai_model'] = 'gemini-1.5-flash'
                except Exception as e:
                    print(f"Gemini analysis failed, using baseline: {e}")
            
            return baseline
            
        except Exception as e:
            print(f"Error with Gemini classification: {e}")
            return self.signature_pipeline.process_file(binary_data, filename)
    
    def _classify_with_ollama(self, binary_data: bytes, filename: str) -> FileClassificationResult:
        """Use Ollama (local Llama model) to classify file"""
        try:
            import ollama
            
            # Get signature-based baseline
            baseline = self.signature_pipeline.process_file(binary_data, filename)
            
            # For text files, use Ollama to analyze
            if len(binary_data) < 50000 and self._is_likely_text(binary_data):
                try:
                    content = binary_data.decode('utf-8', errors='ignore')[:1500]
                    
                    prompt = f"""Analyze this file and identify its type and category.

Filename: {filename}
Content: {content}

Respond with only: filetype|category
Examples:
- python|code
- json|structured
- html|code
- csv|structured"""

                    response = ollama.generate(model='llama3.2', prompt=prompt)
                    result_text = response['response'].strip()
                    
                    if '|' in result_text:
                        filetype, category = result_text.split('|')[:2]
                        baseline.filetype = filetype.strip().lower()
                        baseline.content_category = category.strip().lower()
                        
                        if not baseline.metadata:
                            baseline.metadata = {}
                        baseline.metadata['ai_model'] = 'llama3.2-local'
                except Exception as e:
                    print(f"Ollama analysis failed, using baseline: {e}")
            
            return baseline
            
        except Exception as e:
            print(f"Error with Ollama classification: {e}")
            return self.signature_pipeline.process_file(binary_data, filename)
    
    def _is_likely_text(self, data: bytes) -> bool:
        """Quick check if data is likely text"""
        try:
            sample = data[:512]
            sample.decode('utf-8')
            printable = sum(1 for b in sample if 32 <= b <= 126 or b in (9, 10, 13))
            return printable / len(sample) > 0.7 if sample else False
        except:
            return False

