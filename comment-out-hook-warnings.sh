#!/bin/bash

# List of files and line numbers from your log
declare -A file_lines

file_lines["src/components/astrology/MercuryRetrogradeBanner.tsx"]="93"
file_lines["src/components/profile/EnhancedProfileForm.tsx"]="59"
file_lines["src/components/readers/VirtualReaderDisplay.tsx"]="48"
file_lines["src/components/tarot/CardSelectionSpreadUI.tsx"]="153"
file_lines["src/components/tarot/DynamicInterpretationPanel.tsx"]="173"
file_lines["src/components/tarot/EnhancedShuffleAnimation.tsx"]="118 140"
file_lines["src/components/tarot/EnhancedTarotPanel.tsx"]="74"
file_lines["src/components/tarot/InteractiveReadingSurface.tsx"]="75 76 139 185 386 431 485 508"
file_lines["src/components/tarot/UnifiedTarotPanelV2.tsx"]="407 470"

for file in "${!file_lines[@]}"; do
  for line in ${file_lines[$file]}; do
    # Insert the disable comment above the specified line
    sed -i '' "${line}i\\
    // eslint-disable-next-line react-hooks/exhaustive-deps
    " "$file"
    echo "Commented out dependency warning in $file at line $line"
  done
done
