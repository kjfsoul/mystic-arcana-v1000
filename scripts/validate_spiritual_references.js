const fs = require("fs");
const path = require("path");

console.log("Validating spiritual reference materials...");

const requiredFiles = [
  "docs/benebell-wen-astrology-quick-reference-sheets.md",
  "docs/learning-the-twelve-astrological-houses.md",
  "docs/learning-the-twelve-astrological-signs.md",
];

let allFilesPresent = true;

requiredFiles.forEach((file) => {
  if (!fs.existsSync(file)) {
    console.error(`Missing required spiritual reference: ${file}`);
    allFilesPresent = false;
  } else {
    console.log(`✓ Found: ${file}`);
  }
});

if (!allFilesPresent) {
  console.error(
    "Some spiritual reference files are missing. Please convert PDFs to Markdown.",
  );
  process.exit(1);
}

console.log("All spiritual reference materials validated successfully.");
