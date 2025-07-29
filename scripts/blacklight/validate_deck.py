#!/usr/bin/env python3
"""
Blacklight Tarot Deck Validation Pipeline
Advanced validation using YOLO object detection and perceptual hashing.
"""

import json
import os
import hashlib
from typing import Dict, List, Tuple, Optional, Any
from PIL import Image
import numpy as np
import imagehash
from pathlib import Path
import logging
from datetime import datetime

# Optional YOLO import (graceful fallback if not available)
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: YOLO not available. Object detection will be skipped.")

class BlacklightDeckValidator:
    def __init__(self, deck_path: str = "output/composed", report_path: str = "validation_report.json"):
        self.deck_path = deck_path
        self.report_path = report_path
        self.validation_results = {
            'timestamp': datetime.now().isoformat(),
            'deck_path': deck_path,
            'total_cards': 0,
            'validation_passed': False,
            'errors': [],
            'warnings': [],
            'card_analysis': {},
            'duplicate_analysis': {},
            'object_detection_results': {},
            'perceptual_hash_analysis': {},
            'suit_consistency': {}
        }
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
        # Load YOLO model if available
        self.yolo_model = None
        if YOLO_AVAILABLE:
            try:
                # Use YOLOv8 nano model for general object detection
                self.yolo_model = YOLO('yolov8n.pt')
                self.logger.info("YOLO model loaded successfully")
            except Exception as e:
                self.logger.warning(f"Failed to load YOLO model: {e}")
                YOLO_AVAILABLE = False
    
    def validate_card_exists(self, card_name: str) -> bool:
        """Check if a card file exists."""
        card_path = os.path.join(self.deck_path, f"{card_name}.png")
        exists = os.path.exists(card_path)
        if not exists:
            self.validation_results['errors'].append(f"Missing card: {card_name}")
        return exists
    
    def get_expected_cards(self) -> List[str]:
        """Generate list of expected 56 Minor Arcana cards."""
        suits = ['wands', 'cups', 'swords', 'pentacles']
        cards = []
        
        # Numbered cards (1-10)
        for suit in suits:
            for number in range(1, 11):
                cards.append(f"{number:02d}_of_{suit}")
        
        # Court cards
        court_names = ['page', 'knight', 'queen', 'king']
        for suit in suits:
            for court in court_names:
                cards.append(f"{court}_of_{suit}")
        
        return cards
    
    def calculate_perceptual_hash(self, image_path: str) -> str:
        """Calculate perceptual hash for duplicate detection."""
        try:
            with Image.open(image_path) as img:
                # Convert to RGB to ensure consistent hashing
                rgb_img = img.convert('RGB')
                # Use difference hash for better duplicate detection
                hash_value = imagehash.dhash(rgb_img, hash_size=16)
                return str(hash_value)
        except Exception as e:
            self.logger.error(f"Error calculating hash for {image_path}: {e}")
            return ""
    
    def detect_objects_yolo(self, image_path: str) -> Dict[str, Any]:
        """Use YOLO to detect and count objects in the image."""
        if not self.yolo_model:
            return {'error': 'YOLO model not available'}
        
        try:
            results = self.yolo_model(image_path, verbose=False)
            
            if not results:
                return {'objects': [], 'count': 0}
            
            result = results[0]
            objects = []
            
            if result.boxes is not None:
                for box in result.boxes:
                    # Get class name and confidence
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = self.yolo_model.names[class_id]
                    
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    objects.append({
                        'class': class_name,
                        'confidence': confidence,
                        'bbox': [x1, y1, x2, y2],
                        'area': (x2 - x1) * (y2 - y1)
                    })
            
            return {
                'objects': objects,
                'count': len(objects),
                'total_confidence': sum(obj['confidence'] for obj in objects)
            }
            
        except Exception as e:
            self.logger.error(f"YOLO detection error for {image_path}: {e}")
            return {'error': str(e)}
    
    def analyze_card_composition(self, card_path: str, card_name: str) -> Dict[str, Any]:
        """Analyze individual card composition."""
        analysis = {
            'file_size': 0,
            'dimensions': (0, 0),
            'color_channels': 0,
            'has_transparency': False,
            'perceptual_hash': '',
            'objects_detected': {},
            'expected_objects': 0,
            'validation_status': 'pending'
        }
        
        try:
            # Basic image analysis
            with Image.open(card_path) as img:
                analysis['dimensions'] = img.size
                analysis['color_channels'] = len(img.getbands())
                analysis['has_transparency'] = 'A' in img.getbands()
                analysis['file_size'] = os.path.getsize(card_path)
            
            # Perceptual hash
            analysis['perceptual_hash'] = self.calculate_perceptual_hash(card_path)
            
            # Expected object count based on card type
            if '_of_' in card_name:
                # Parse card number/type
                parts = card_name.split('_of_')
                card_type = parts[0]
                
                if card_type.isdigit() or (card_type.startswith('0') and card_type[1:].isdigit()):
                    # Numbered card
                    number = int(card_type.lstrip('0')) if card_type.lstrip('0') else 10
                    analysis['expected_objects'] = number
                else:
                    # Court card - expect 1 main object
                    analysis['expected_objects'] = 1
            
            # YOLO object detection
            if YOLO_AVAILABLE:
                detection_results = self.detect_objects_yolo(card_path)
                analysis['objects_detected'] = detection_results
                
                # Validate object count if detection succeeded
                if 'count' in detection_results:
                    detected_count = detection_results['count']
                    expected_count = analysis['expected_objects']
                    
                    # Allow some tolerance for detection accuracy
                    if abs(detected_count - expected_count) <= 1:
                        analysis['validation_status'] = 'passed'
                    else:
                        analysis['validation_status'] = 'failed'
                        self.validation_results['errors'].append(
                            f"{card_name}: Expected ~{expected_count} objects, detected {detected_count}"
                        )
            else:
                analysis['validation_status'] = 'skipped_no_yolo'
            
            # Dimension validation (should be 512x768)
            if analysis['dimensions'] != (512, 768):
                self.validation_results['warnings'].append(
                    f"{card_name}: Unexpected dimensions {analysis['dimensions']}, expected (512, 768)"
                )
            
        except Exception as e:
            analysis['validation_status'] = 'error'
            analysis['error'] = str(e)
            self.validation_results['errors'].append(f"{card_name}: Analysis error - {e}")
        
        return analysis
    
    def find_duplicate_cards(self) -> Dict[str, List[str]]:
        """Find duplicate cards using perceptual hashing."""
        hash_to_cards = {}
        duplicates = {}
        
        for card_name, analysis in self.validation_results['card_analysis'].items():
            hash_value = analysis.get('perceptual_hash', '')
            if hash_value:
                if hash_value not in hash_to_cards:
                    hash_to_cards[hash_value] = []
                hash_to_cards[hash_value].append(card_name)
        
        # Find groups with multiple cards (duplicates)
        for hash_value, cards in hash_to_cards.items():
            if len(cards) > 1:
                duplicates[hash_value] = cards
                self.validation_results['warnings'].append(
                    f"Potential duplicates found: {', '.join(cards)}"
                )
        
        return duplicates
    
    def analyze_suit_consistency(self) -> Dict[str, Dict[str, Any]]:
        """Analyze consistency within each suit."""
        suits = ['wands', 'cups', 'swords', 'pentacles']
        suit_analysis = {}
        
        for suit in suits:
            suit_cards = [name for name in self.validation_results['card_analysis'].keys() 
                         if f'_of_{suit}' in name]
            
            if not suit_cards:
                continue
            
            # Analyze visual consistency metrics
            dimensions = []
            file_sizes = []
            detection_counts = []
            
            for card_name in suit_cards:
                analysis = self.validation_results['card_analysis'][card_name]
                dimensions.append(analysis.get('dimensions', (0, 0)))
                file_sizes.append(analysis.get('file_size', 0))
                
                if 'objects_detected' in analysis and 'count' in analysis['objects_detected']:
                    detection_counts.append(analysis['objects_detected']['count'])
            
            # Calculate consistency metrics
            unique_dimensions = set(dimensions)
            avg_file_size = sum(file_sizes) / len(file_sizes) if file_sizes else 0
            avg_detection_count = sum(detection_counts) / len(detection_counts) if detection_counts else 0
            
            suit_analysis[suit] = {
                'card_count': len(suit_cards),
                'dimension_consistency': len(unique_dimensions) == 1,
                'unique_dimensions': list(unique_dimensions),
                'avg_file_size': avg_file_size,
                'avg_detection_count': avg_detection_count,
                'cards': suit_cards
            }
            
            # Add warnings for inconsistencies
            if len(unique_dimensions) > 1:
                self.validation_results['warnings'].append(
                    f"Suit {suit}: Inconsistent dimensions across cards"
                )
        
        return suit_analysis
    
    def run_validation(self) -> bool:
        """Run complete deck validation."""
        self.logger.info("Starting Blacklight Tarot deck validation...")
        
        # Check if deck directory exists
        if not os.path.exists(self.deck_path):
            self.validation_results['errors'].append(f"Deck directory not found: {self.deck_path}")
            return False
        
        # Get expected cards
        expected_cards = self.get_expected_cards()
        self.validation_results['total_cards'] = len(expected_cards)
        
        self.logger.info(f"Validating {len(expected_cards)} expected cards...")
        
        # Validate each card
        for card_name in expected_cards:
            if self.validate_card_exists(card_name):
                card_path = os.path.join(self.deck_path, f"{card_name}.png")
                analysis = self.analyze_card_composition(card_path, card_name)
                self.validation_results['card_analysis'][card_name] = analysis
        
        # Find duplicates
        self.validation_results['duplicate_analysis'] = self.find_duplicate_cards()
        
        # Analyze suit consistency
        self.validation_results['suit_consistency'] = self.analyze_suit_consistency()
        
        # Determine overall validation status
        error_count = len(self.validation_results['errors'])
        warning_count = len(self.validation_results['warnings'])
        
        self.validation_results['validation_passed'] = error_count == 0
        
        self.logger.info(f"Validation complete: {error_count} errors, {warning_count} warnings")
        
        return self.validation_results['validation_passed']
    
    def generate_report(self) -> str:
        """Generate comprehensive validation report."""
        # Save JSON report
        with open(self.report_path, 'w') as f:
            json.dump(self.validation_results, f, indent=2, default=str)
        
        # Generate human-readable summary
        summary = []
        summary.append("=" * 60)
        summary.append("BLACKLIGHT TAROT DECK VALIDATION REPORT")
        summary.append("=" * 60)
        summary.append(f"Timestamp: {self.validation_results['timestamp']}")
        summary.append(f"Deck Path: {self.validation_results['deck_path']}")
        summary.append(f"Total Expected Cards: {self.validation_results['total_cards']}")
        summary.append("")
        
        # Overall status
        status = "PASSED" if self.validation_results['validation_passed'] else "FAILED"
        summary.append(f"VALIDATION STATUS: {status}")
        summary.append("")
        
        # Error summary
        error_count = len(self.validation_results['errors'])
        warning_count = len(self.validation_results['warnings'])
        summary.append(f"Errors: {error_count}")
        summary.append(f"Warnings: {warning_count}")
        summary.append("")
        
        # Detailed results
        if error_count > 0:
            summary.append("ERRORS:")
            for error in self.validation_results['errors']:
                summary.append(f"  ❌ {error}")
            summary.append("")
        
        if warning_count > 0:
            summary.append("WARNINGS:")
            for warning in self.validation_results['warnings']:
                summary.append(f"  ⚠️  {warning}")
            summary.append("")
        
        # Suit consistency summary
        summary.append("SUIT CONSISTENCY:")
        for suit, analysis in self.validation_results['suit_consistency'].items():
            consistency = "✅" if analysis['dimension_consistency'] else "❌"
            summary.append(f"  {consistency} {suit.title()}: {analysis['card_count']} cards")
        summary.append("")
        
        # Duplicate detection summary
        duplicate_count = len(self.validation_results['duplicate_analysis'])
        summary.append(f"DUPLICATE DETECTION: {duplicate_count} potential duplicate groups found")
        summary.append("")
        
        # YOLO detection summary
        if YOLO_AVAILABLE:
            detection_results = [analysis.get('objects_detected', {}) 
                               for analysis in self.validation_results['card_analysis'].values()]
            successful_detections = sum(1 for result in detection_results if 'count' in result)
            summary.append(f"OBJECT DETECTION: {successful_detections}/{len(detection_results)} cards analyzed")
        else:
            summary.append("OBJECT DETECTION: Skipped (YOLO not available)")
        
        summary.append("")
        summary.append("=" * 60)
        
        summary_text = "\n".join(summary)
        
        # Save summary to file
        summary_path = self.report_path.replace('.json', '_summary.txt')
        with open(summary_path, 'w') as f:
            f.write(summary_text)
        
        return summary_text

def main():
    """Main execution function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Validate Blacklight Tarot deck')
    parser.add_argument('--deck-path', default='output/composed', 
                       help='Path to composed deck directory')
    parser.add_argument('--report-path', default='validation_report.json',
                       help='Path to output validation report')
    
    args = parser.parse_args()
    
    # Create validator and run validation
    validator = BlacklightDeckValidator(args.deck_path, args.report_path)
    validation_passed = validator.run_validation()
    
    # Generate and display report
    summary = validator.generate_report()
    print(summary)
    
    # Return appropriate exit code
    return 0 if validation_passed else 1

if __name__ == "__main__":
    exit(main())