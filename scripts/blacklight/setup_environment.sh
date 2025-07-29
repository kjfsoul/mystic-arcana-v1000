#!/bin/bash

# Blacklight Tarot Asset Pipeline Environment Setup
# This script sets up the Python virtual environment and dependencies

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VENV_NAME="blacklight-tarot-env"
PYTHON_MIN_VERSION="3.8"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REQUIREMENTS_FILE="$SCRIPT_DIR/requirements.txt"

echo -e "${BLUE}🔮 Blacklight Tarot Asset Pipeline Environment Setup${NC}"
echo "============================================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Python is installed
check_python() {
    print_info "Checking Python installation..."
    
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    elif command -v python &> /dev/null; then
        PYTHON_CMD="python"
    else
        print_error "Python is not installed. Please install Python $PYTHON_MIN_VERSION or later."
        exit 1
    fi
    
    # Check Python version
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
    print_status "Found Python $PYTHON_VERSION"
    
    # Basic version check (simplified)
    MAJOR_VERSION=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    MINOR_VERSION=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [ "$MAJOR_VERSION" -lt 3 ] || ([ "$MAJOR_VERSION" -eq 3 ] && [ "$MINOR_VERSION" -lt 8 ]); then
        print_warning "Python version is $PYTHON_VERSION. Recommended: $PYTHON_MIN_VERSION or later."
        print_info "Continuing anyway..."
    fi
}

# Create virtual environment
create_venv() {
    print_info "Creating virtual environment: $VENV_NAME"
    
    if [ -d "$VENV_NAME" ]; then
        print_warning "Virtual environment already exists. Removing old one..."
        rm -rf "$VENV_NAME"
    fi
    
    $PYTHON_CMD -m venv "$VENV_NAME"
    print_status "Virtual environment created: $VENV_NAME"
}

# Activate virtual environment
activate_venv() {
    print_info "Activating virtual environment..."
    source "$VENV_NAME/bin/activate"
    print_status "Virtual environment activated"
    
    # Verify activation
    which python
    python --version
}

# Upgrade pip
upgrade_pip() {
    print_info "Upgrading pip..."
    python -m pip install --upgrade pip
    print_status "Pip upgraded successfully"
}

# Install requirements
install_requirements() {
    print_info "Installing Python dependencies..."
    
    if [ ! -f "$REQUIREMENTS_FILE" ]; then
        print_error "Requirements file not found: $REQUIREMENTS_FILE"
        exit 1
    fi
    
    print_info "Installing from: $REQUIREMENTS_FILE"
    pip install -r "$REQUIREMENTS_FILE"
    print_status "All dependencies installed successfully"
}

# Create necessary directories
create_directories() {
    print_info "Creating necessary directories..."
    
    # Create directories relative to script location
    mkdir -p "$SCRIPT_DIR/../assets/master"
    mkdir -p "$SCRIPT_DIR/output/composed"
    mkdir -p "$SCRIPT_DIR/output/validation"
    
    print_status "Directories created:
    - $SCRIPT_DIR/../assets/master (for master suit assets)
    - $SCRIPT_DIR/output/composed (for composed cards)  
    - $SCRIPT_DIR/output/validation (for validation reports)"
}

# Verify installation
verify_installation() {
    print_info "Verifying installation..."
    
    # Test critical imports
    python -c "
import sys
import os
failed_imports = []

# Test core dependencies
try:
    from PIL import Image
    print('✅ Pillow (PIL) - OK')
except ImportError as e:
    failed_imports.append(f'Pillow: {e}')

try:
    import numpy as np
    print('✅ NumPy - OK')
except ImportError as e:
    failed_imports.append(f'NumPy: {e}')

try:
    import cv2
    print('✅ OpenCV - OK')
except ImportError as e:
    failed_imports.append(f'OpenCV: {e}')

try:
    import imagehash
    print('✅ ImageHash - OK')  
except ImportError as e:
    failed_imports.append(f'ImageHash: {e}')

try:
    from ultralytics import YOLO
    print('✅ YOLO (ultralytics) - OK')
except ImportError as e:
    print('⚠️  YOLO (ultralytics) - Not available (optional)')

if failed_imports:
    print('❌ Failed imports:')
    for failure in failed_imports:
        print(f'   {failure}')
    sys.exit(1)
else:
    print('✅ All critical dependencies verified successfully')
"
    
    if [ $? -eq 0 ]; then
        print_status "Installation verification passed"
    else
        print_error "Installation verification failed"
        exit 1
    fi
}

# Generate activation script
generate_activation_script() {
    print_info "Generating activation script..."
    
    cat > activate_blacklight_env.sh << EOF
#!/bin/bash
# Blacklight Tarot Environment Activation Script
# Usage: source activate_blacklight_env.sh

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="\$SCRIPT_DIR/$VENV_NAME"

if [ -d "\$VENV_PATH" ]; then
    source "\$VENV_PATH/bin/activate"
    echo "🔮 Blacklight Tarot environment activated"
    echo "Python: \$(which python)"
    echo "Pip: \$(which pip)"
else
    echo "❌ Virtual environment not found at: \$VENV_PATH"
    echo "Run setup_environment.sh first"
    exit 1
fi
EOF
    
    chmod +x activate_blacklight_env.sh
    print_status "Activation script created: activate_blacklight_env.sh"
}

# Print usage instructions
print_usage() {
    echo ""
    echo -e "${BLUE}🎯 SETUP COMPLETE! Usage Instructions:${NC}"
    echo "============================================================"
    echo ""
    echo "1. Activate the environment:"
    echo "   source activate_blacklight_env.sh"
    echo ""
    echo "2. Generate master assets using AUTOMATIC1111:"
    echo "   - Use prompts from: assets/decks/blacklight/A1111_master_asset_prompts.md"
    echo "   - Save assets to: scripts/blacklight/assets/master/"
    echo ""
    echo "3. Compose Minor Arcana cards:"
    echo "   python compose_cards.py"
    echo ""
    echo "4. Validate the generated deck:"
    echo "   python validate_deck.py"
    echo ""
    echo "5. For help with any script:"
    echo "   python <script_name>.py --help"
    echo ""
    echo -e "${GREEN}Environment ready for Blacklight Tarot generation!${NC}"
}

# Main execution
main() {
    cd "$SCRIPT_DIR"
    
    check_python
    create_venv
    activate_venv
    upgrade_pip
    install_requirements
    create_directories
    verify_installation
    generate_activation_script
    print_usage
    
    print_status "Blacklight Tarot environment setup completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "Blacklight Tarot Asset Pipeline Environment Setup"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --verify-only    Only verify existing installation"
        echo "  --clean          Remove existing environment before setup"
        echo "  --help, -h       Show this help message"
        echo ""
        exit 0
        ;;
    --verify-only)
        if [ -d "$VENV_NAME" ]; then
            source "$VENV_NAME/bin/activate"
            verify_installation
        else
            print_error "Virtual environment not found. Run setup first."
            exit 1
        fi
        ;;
    --clean)
        print_info "Cleaning existing environment..."
        rm -rf "$VENV_NAME"
        rm -f activate_blacklight_env.sh
        print_status "Environment cleaned"
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac