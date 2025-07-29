#!/usr/bin/env python3
"""
Blacklight Tarot Card Composition Script
Programmatically composes 56 Minor Arcana cards using master suit assets.
"""

import json
import os
import math
from PIL import Image, ImageDraw, ImageEnhance
from typing import Dict, List, Tuple, Optional

class BlacklightCardComposer:
    def __init__(self, assets_dir: str = "assets/master", output_dir: str = "output/composed"):
        self.assets_dir = assets_dir
        self.output_dir = output_dir
        self.card_size = (512, 768)
        self.master_assets = {}
        
        # Load blueprint configuration
        self.blueprint = self._load_blueprint()
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
    def _load_blueprint(self) -> Dict:
        """Load the blueprint.json configuration."""
        blueprint_path = "assets/decks/blacklight/blueprint.json"
        try:
            with open(blueprint_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Blueprint not found at {blueprint_path}")
            return {}
    
    def load_master_assets(self) -> bool:
        """Load the four master suit items."""
        asset_files = {
            'wands': 'master_wand.png',
            'cups': 'master_cup.png', 
            'swords': 'master_sword.png',
            'pentacles': 'master_pentacle.png'
        }
        
        for suit, filename in asset_files.items():
            asset_path = os.path.join(self.assets_dir, filename)
            if os.path.exists(asset_path):
                try:
                    self.master_assets[suit] = Image.open(asset_path).convert('RGBA')
                    print(f"Loaded {suit} master asset: {filename}")
                except Exception as e:
                    print(f"Error loading {filename}: {e}")
                    return False
            else:
                # Create placeholder asset for testing
                self.master_assets[suit] = self._create_placeholder_asset(suit)
                print(f"Created placeholder for {suit}")
        
        return len(self.master_assets) == 4
    
    def _create_placeholder_asset(self, suit: str) -> Image.Image:
        """Create a placeholder asset for testing."""
        img = Image.new('RGBA', (100, 150), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Color mapping for suits
        colors = {
            'wands': (0, 255, 0, 200),    # Green
            'cups': (0, 255, 255, 200),   # Cyan  
            'swords': (128, 0, 255, 200), # Purple
            'pentacles': (255, 215, 0, 200) # Gold
        }
        
        color = colors.get(suit, (255, 255, 255, 200))
        draw.ellipse([10, 10, 90, 140], fill=color)
        draw.text((30, 70), suit.upper()[:4], fill=(255, 255, 255, 255))
        
        return img
    
    def get_positions_for_number(self, number: int, canvas_size: Tuple[int, int]) -> List[Tuple[int, int]]:
        """Calculate positions for items based on card number."""
        width, height = canvas_size
        center_x, center_y = width // 2, height // 2
        margin = 80
        
        positions = []
        
        if number == 1:  # Ace - single centered
            positions = [(center_x, center_y)]
            
        elif number == 2:  # Two diagonal
            positions = [
                (center_x - 80, center_y - 100),
                (center_x + 80, center_y + 100)
            ]
            
        elif number == 3:  # Triangle formation
            positions = [
                (center_x, center_y - 120),
                (center_x - 90, center_y + 60),
                (center_x + 90, center_y + 60)
            ]
            
        elif number == 4:  # Square formation
            positions = [
                (center_x - 80, center_y - 100),
                (center_x + 80, center_y - 100),
                (center_x - 80, center_y + 100),
                (center_x + 80, center_y + 100)
            ]
            
        elif number == 5:  # Pentagram points
            angle_offset = -math.pi / 2  # Start at top
            radius = 100
            for i in range(5):
                angle = angle_offset + (2 * math.pi * i / 5)
                x = center_x + int(radius * math.cos(angle))
                y = center_y + int(radius * math.sin(angle))
                positions.append((x, y))
                
        elif number == 6:  # Hexagonal harmony
            angle_offset = -math.pi / 2
            radius = 90
            for i in range(6):
                angle = angle_offset + (2 * math.pi * i / 6)
                x = center_x + int(radius * math.cos(angle))
                y = center_y + int(radius * math.sin(angle))
                positions.append((x, y))
                
        elif number == 7:  # Mystical arrangement (6 + 1 elevated)
            # Base 6 in smaller circle
            radius = 70
            for i in range(6):
                angle = (2 * math.pi * i / 6)
                x = center_x + int(radius * math.cos(angle))
                y = center_y + 40 + int(radius * math.sin(angle))
                positions.append((x, y))
            # Elevated center
            positions.append((center_x, center_y - 100))
            
        elif number == 8:  # Infinity symbol
            # Two overlapping circles forming infinity
            for i in range(8):
                if i < 4:
                    # Left circle
                    angle = 2 * math.pi * i / 4
                    x = center_x - 50 + int(60 * math.cos(angle))
                    y = center_y + int(60 * math.sin(angle))
                else:
                    # Right circle
                    angle = 2 * math.pi * (i - 4) / 4
                    x = center_x + 50 + int(60 * math.cos(angle))
                    y = center_y + int(60 * math.sin(angle))
                positions.append((x, y))
                
        elif number == 9:  # Three rows of three
            for row in range(3):
                for col in range(3):
                    x = center_x - 80 + (col * 80)
                    y = center_y - 100 + (row * 100)
                    positions.append((x, y))
                    
        elif number == 10:  # Tree of life formation with overflow
            # Tree of life positions (traditional Kabbalah)
            tree_positions = [
                (center_x, center_y - 180),      # Kether
                (center_x - 60, center_y - 120), # Binah
                (center_x + 60, center_y - 120), # Chokmah
                (center_x - 80, center_y - 40),  # Geburah
                (center_x + 80, center_y - 40),  # Chesed
                (center_x, center_y - 40),       # Tiphereth
                (center_x - 60, center_y + 40),  # Hod
                (center_x + 60, center_y + 40),  # Netzach
                (center_x, center_y + 80),       # Yesod
                (center_x, center_y + 160)       # Malkuth
            ]
            positions = tree_positions
            
        return positions
    
    def compose_numbered_card(self, suit: str, number: int) -> Image.Image:
        """Compose a numbered card (Ace through 10)."""
        # Create canvas with cosmic background
        canvas = Image.new('RGBA', self.card_size, (10, 5, 20, 255))  # Deep cosmic black
        
        # Get master asset for this suit
        master_asset = self.master_assets[suit]
        
        # Calculate positions
        positions = self.get_positions_for_number(number, self.card_size)
        
        # Resize master asset for composition
        asset_size = (80, 120) if number <= 3 else (60, 90) if number <= 6 else (50, 75)
        resized_asset = master_asset.resize(asset_size, Image.Resampling.LANCZOS)
        
        # Place items at calculated positions
        for i, (x, y) in enumerate(positions):
            # Add slight rotation variation for organic feel
            rotation = (i * 15 - 7.5) if number > 5 else 0
            if rotation != 0:
                rotated_asset = resized_asset.rotate(rotation, expand=True)
            else:
                rotated_asset = resized_asset
                
            # Calculate paste position (center the asset)
            paste_x = x - rotated_asset.width // 2
            paste_y = y - rotated_asset.height // 2
            
            # Ensure position is within canvas bounds
            paste_x = max(0, min(paste_x, self.card_size[0] - rotated_asset.width))
            paste_y = max(0, min(paste_y, self.card_size[1] - rotated_asset.height))
            
            # Paste with alpha blending
            canvas.paste(rotated_asset, (paste_x, paste_y), rotated_asset)
        
        return canvas
    
    def compose_court_card(self, suit: str, court: str) -> Image.Image:
        """Compose a court card (Page, Knight, Queen, King)."""
        # Create canvas with cosmic background  
        canvas = Image.new('RGBA', self.card_size, (10, 5, 20, 255))
        
        # Get master asset
        master_asset = self.master_assets[suit]
        
        # Position asset based on court type
        if court == 'page':
            # Small asset, learning position
            asset_size = (60, 90)
            position = (self.card_size[0] // 2, self.card_size[1] // 2 + 50)
        elif court == 'knight': 
            # Medium asset, dynamic position
            asset_size = (80, 120)
            position = (self.card_size[0] // 2 + 30, self.card_size[1] // 2)
        elif court == 'queen':
            # Large asset, centered position
            asset_size = (100, 150)
            position = (self.card_size[0] // 2, self.card_size[1] // 2 + 20)
        else:  # king
            # Largest asset, commanding position
            asset_size = (120, 180)
            position = (self.card_size[0] // 2, self.card_size[1] // 2)
        
        # Resize and place asset
        resized_asset = master_asset.resize(asset_size, Image.Resampling.LANCZOS)
        paste_x = position[0] - resized_asset.width // 2
        paste_y = position[1] - resized_asset.height // 2
        
        canvas.paste(resized_asset, (paste_x, paste_y), resized_asset)
        
        return canvas
    
    def compose_all_cards(self) -> Dict[str, str]:
        """Compose all 56 Minor Arcana cards."""
        if not self.load_master_assets():
            print("Failed to load master assets")
            return {}
        
        results = {}
        suits = ['wands', 'cups', 'swords', 'pentacles']
        
        # Generate numbered cards (Ace through 10)
        for suit in suits:
            for number in range(1, 11):
                card_name = f"{number:02d}_of_{suit}"
                print(f"Composing {card_name}...")
                
                card_image = self.compose_numbered_card(suit, number)
                output_path = os.path.join(self.output_dir, f"{card_name}.png")
                card_image.save(output_path, 'PNG')
                results[card_name] = output_path
        
        # Generate court cards
        court_names = ['page', 'knight', 'queen', 'king']
        for suit in suits:
            for court in court_names:
                card_name = f"{court}_of_{suit}"
                print(f"Composing {card_name}...")
                
                card_image = self.compose_court_card(suit, court)
                output_path = os.path.join(self.output_dir, f"{card_name}.png")
                card_image.save(output_path, 'PNG')
                results[card_name] = output_path
        
        print(f"Composed {len(results)} cards successfully")
        return results

def main():
    """Main execution function."""
    composer = BlacklightCardComposer()
    
    print("Starting Blacklight Tarot card composition...")
    print("=" * 50)
    
    composed_cards = composer.compose_all_cards()
    
    if composed_cards:
        print("\n" + "=" * 50)
        print(f"SUCCESS: Composed {len(composed_cards)} cards")
        print(f"Output directory: {composer.output_dir}")
        
        # Generate summary report
        report_path = os.path.join(composer.output_dir, "composition_report.json")
        with open(report_path, 'w') as f:
            json.dump({
                'total_cards': len(composed_cards),
                'composition_date': str(os.path.getctime(report_path)) if os.path.exists(report_path) else 'now',
                'cards': list(composed_cards.keys()),
                'asset_directory': composer.assets_dir,
                'output_directory': composer.output_dir
            }, f, indent=2)
        
        print(f"Composition report saved: {report_path}")
    else:
        print("FAILED: No cards were composed")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())