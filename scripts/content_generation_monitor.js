const fs = require("fs");
const path = require("path");

console.log("Starting spiritual content validation monitor...");

// Monitor for AI-generated content that needs validation
const watchDirectories = ["src/app/api", "src/app/components"];

function validateSpiritualContent(filePath) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) return;

  const content = fs.readFileSync(filePath, "utf8");

  // Check for potential cultural appropriation or insensitive content
  const sensitiveTerms = ["chakra", "karma", "namaste", "shaman"];
  const warnings = [];

  sensitiveTerms.forEach((term) => {
    if (content.toLowerCase().includes(term)) {
      warnings.push(`Cultural sensitivity check needed for term: ${term}`);
    }
  });

  if (warnings.length > 0) {
    console.log(`⚠️  ${filePath}:`);
    warnings.forEach((warning) => console.log(`   ${warning}`));
  }
}

// Initial validation of existing files
watchDirectories.forEach((dir) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir, { recursive: true });
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isFile()) {
        validateSpiritualContent(fullPath);
      }
    });
  }
});

console.log(
  "Spiritual content monitoring active. Cultural sensitivity validation in progress...",
);
