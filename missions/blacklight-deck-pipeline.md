# MISSION: Blacklight Tarot Deck - Full Generation Pipeline

## OBJECTIVE

Execute the complete, enhanced Blacklight Tarot asset pipeline as defined in the "MYSTIC ARCANA TAROT DECK NEW METHOD" document. This involves generating a thematic blueprint, creating master assets, programmatically composing cards, and performing advanced validation to ensure deck uniformity and integrity.

## CONTEXT

This mission operationalizes the definitive 5-step plan for creating the custom tarot deck. It requires a combination of the Claude-Flow swarm for scripting and orchestration, and CrewAI agents (`DataOracle`, `UIEnchanter`, `CardWeaver`, `QualityGuardian`) for specialized generative and validation tasks. The final output is a complete "kit" for a human operator to generate the images with AUTOMATIC1111.

## EXECUTION PLAN

The mission will be executed by the swarm in sequential phases, mirroring the structure of the source document.

---

### PHASE 1: Generate Thematic Blueprint (DataOracle)

* **Task 1.1 (CrewAI - DataOracle):** Generate the complete, detailed thematic blueprint as `blueprint.json`. This file must define visual specifications for all 78 cards, including Major Arcana archetypes, Minor suits, master items (e.g., cup, wand), backgrounds, color palettes, and Rider-Waite fidelity notes, per the prompt in the methodology document.
* **Deliverable:** The file is saved to `/assets/decks/blacklight/blueprint.json`.

---

### PHASE 2: Generate Master Assets & Prompts (UIEnchanter)

* **Task 2.1 (CrewAI - UIEnchanter):** Based on the `blueprint.json`, generate a markdown file named `A1111_master_asset_prompts.md`. This file will contain the exact, copy-pasteable AUTOMATIC1111 prompts for creating the master suit items (cup, wand, sword, pentacle). The prompts must include all specified parameters like style, transparent background, dimensions, LoRA usage, and fixed seed.
* **Deliverable:** The file is saved to `/assets/decks/blacklight/A1111_master_asset_prompts.md`.

---

### PHASE 3: Programmatic Composition & Blending (CardWeaver)

* **Task 3.1 (Swarm - BackendDev):** Create a robust, fully functional Python script named `compose_cards.py`. This script must programmatically place the master assets for all 56 Minor Arcana cards according to the logic in the methodology document.
* **Task 3.2 (CrewAI - UIEnchanter):** Generate a markdown file named `A1111_blending_prompts.md`. This file will contain the detailed `img2img` prompts for blending the 56 composited cards and the `txt2img` prompts for the 22 Major Arcana cards.
* **Deliverables:**
  * The file `/scripts/blacklight/compose_cards.py`.
  * The file `/assets/decks/blacklight/A1111_blending_prompts.md`.

---

### PHASE 4: Advanced Validation Pipeline (QualityGuardian)

* **Task 4.1 (Swarm - BackendDev/QAEngineer):** Create a complete, runnable Python script named `validate_deck.py`. This script must implement the advanced validation using YOLO for object counting and `imagehash` for perceptual hashing to ensure item count and identicality, as specified in the methodology. It must produce a `validation_report.json`.
* **Task 4.2 (Swarm - SystemDesigner):** Create the necessary Python environment setup files: `requirements.txt` and `setup_environment.sh` to support the composition and validation scripts.
* **Deliverables:**
  * The file `/scripts/blacklight/validate_deck.py`.
  * The file `/scripts/blacklight/requirements.txt`.
  * The file `/scripts/blacklight/setup_environment.sh`.

## FINAL DELIVERABLES

Upon successful completion, the following files must be created and ready for the handoff to the human operator:

1. `/assets/decks/blacklight/blueprint.json`
2. `/assets/decks/blacklight/A1111_master_asset_prompts.md`
3. `/assets/decks/blacklight/A1111_blending_prompts.md`
4. `/scripts/blacklight/compose_cards.py`
5. `/scripts/blacklight/validate_deck.py`
6. `/scripts/blacklight/requirements.txt`
7. `/scripts/blacklight/setup_environment.sh`
8. A final mission summary appended to `claude.md`.
