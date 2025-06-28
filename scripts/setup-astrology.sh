#!/bin/bash

echo "Setting up Python astrology services..."

# Create Python virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv-astrology

# Activate virtual environment
source venv-astrology/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r src/services/astrology-python/requirements.txt

# Create ephemeris directory
echo "Creating ephemeris directory..."
mkdir -p src/services/astrology-python/ephemeris

# Download Swiss Ephemeris data files
echo "Downloading ephemeris data files..."
cd src/services/astrology-python/ephemeris

# Download essential ephemeris files from astro.com
# These are the compressed ephemeris files for 1800-2400
wget -q https://www.astro.com/ftp/swisseph/ephe/semo_18.se1
wget -q https://www.astro.com/ftp/swisseph/ephe/sepl_18.se1
wget -q https://www.astro.com/ftp/swisseph/ephe/seas_18.se1

# Download additional files for asteroids
wget -q https://www.astro.com/ftp/swisseph/ephe/seast1_18.se1

echo "Ephemeris files downloaded."

cd ../../../../

# Test the installation
echo "Testing Python services..."
python src/services/astrology-python/ephemeris_service.py

echo "Setup complete!"
echo ""
echo "To use the Python services, make sure to:"
echo "1. Set PYTHON_PATH environment variable to the virtual environment:"
echo "   export PYTHON_PATH=$(pwd)/venv-astrology/bin/python"
echo "2. Add to your .env.local file:"
echo "   PYTHON_PATH=$(pwd)/venv-astrology/bin/python"