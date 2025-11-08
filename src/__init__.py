"""
File Classifier Package

A comprehensive file classification system that identifies file types,
classifies content categories, and calculates confidence scores.
"""

from src.pipeline import FileClassificationPipeline
from src.file_type_identifier import FileTypeIdentifier
from src.content_classifier import ContentCategoryClassifier
from src.confidence_scorer import ConfidenceScorer
from src.utils import FileClassificationResult, FILETYPE_TO_CATEGORY

__all__ = [
    'FileClassificationPipeline',
    'FileTypeIdentifier',
    'ContentCategoryClassifier',
    'ConfidenceScorer',
    'FileClassificationResult',
    'FILETYPE_TO_CATEGORY',
]

__version__ = '1.0.0'

