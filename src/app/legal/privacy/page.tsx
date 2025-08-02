import fs from 'fs';
import path from 'path';
import { LegalDocument } from '../../../components/legal/LegalDocument';
export default function PrivacyPolicyPage() {
  // Read the privacy policy markdown file
  const filePath = path.join(process.cwd(), 'src/content/legal', 'privacy.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  return (
    <LegalDocument 
      content={content} 
      title="Privacy Policy" 
    />
  );
}
