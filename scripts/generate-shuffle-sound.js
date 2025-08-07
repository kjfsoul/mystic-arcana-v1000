/**
 * Generate a card shuffle sound using Web Audio API
 * This creates a programmatic shuffle sound to avoid copyright issues
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Web Audio API is not available in Node.js, so we'll create a simple placeholder
// The actual sound generation should be done in the browser
const generateShuffleSound = () => {
  console.log("Creating placeholder shuffle sound...");

  // Create a simple JSON description of the sound for now
  const soundDescription = {
    type: "shuffle",
    duration: 2.0,
    components: [
      { type: "rustling", frequency: 200, duration: 0.5, volume: 0.3 },
      { type: "card_flip", frequency: 800, duration: 0.2, volume: 0.4 },
      { type: "rustle_end", frequency: 150, duration: 0.3, volume: 0.2 },
    ],
    fallback: "Web Audio API generated sound",
  };

  const soundsDir = path.join(__dirname, "..", "public", "sounds");
  const descriptionPath = path.join(soundsDir, "card-shuffle-description.json");

  // Ensure sounds directory exists
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  // Write the sound description
  fs.writeFileSync(descriptionPath, JSON.stringify(soundDescription, null, 2));
  console.log("Created sound description at:", descriptionPath);

  // Create a minimal MP3 placeholder (silence) using a data URL approach
  const silentMp3Base64 =
    "SUQzAwAAAAAAEFRJVDIAAAAIAAAAc2lsZW5jZQAA//uSwAAAAAAAAAAAAAAAAAAAAAAAAGGkYAAAAP" +
    "AAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uSwAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

  const mp3Path = path.join(soundsDir, "card-shuffle.mp3");
  const mp3Buffer = Buffer.from(silentMp3Base64, "base64");
  fs.writeFileSync(mp3Path, mp3Buffer);

  console.log("Created minimal MP3 file at:", mp3Path);
  console.log(
    "Note: This is a silent placeholder. The actual shuffle sound will be generated in the browser using Web Audio API.",
  );
};

generateShuffleSound();
