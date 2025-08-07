
import { EmotionalAnalyzer } from '../../sentiment/emotional-analyzer';

describe('EmotionalAnalyzer', () => {
  it('should analyze text and return themes and sentiment', () => {
    const result = EmotionalAnalyzer.analyzeText('I am so happy and full of love');
    expect(result.themes).toContain('love');
    expect(result.themes).toContain('happiness');
    expect(result.sentiment).toBe('positive');
  });
});
