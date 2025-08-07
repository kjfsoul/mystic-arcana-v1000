import fs from "fs";
import path from "path";
import { LegalDocument } from "../../../components/legal/LegalDocument";
export default function TermsOfServicePage() {
  // Read the terms of service markdown file
  const filePath = path.join(process.cwd(), "src/content/legal", "terms.md");
  const content = fs.readFileSync(filePath, "utf-8");
  return <LegalDocument content={content} title="Terms of Service" />;
}
