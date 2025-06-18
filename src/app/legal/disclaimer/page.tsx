import fs from 'fs';
import path from 'path';
import { LegalDocument } from '../../../components/legal/LegalDocument';

export default function DisclaimerPage() {
  // Read the disclaimer markdown file
  const filePath = path.join(process.cwd(), 'src/content/legal', 'disclaimer.md');
  const content = fs.readFileSync(filePath, 'utf-8');

  return (
    <LegalDocument 
      content={content} 
      title="Disclaimer" 
    />
  );
}
