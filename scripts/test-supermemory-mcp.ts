import { PersonaLearnerAgent } from '../src/agents/PersonaLearner';
import { ConversationSession } from '../src/agents/sophia';
import { v4 as uuidv4 } from 'uuid';

const SUPERMEMORY_MCP_URL = process.env.SUPERMEMORY_MCP_URL || 'http://localhost:4001';

async function testSupermemoryMcpE2E() {
  console.log('Starting Supermemory MCP E2E Test...');

  const personaLearner = new PersonaLearnerAgent();
  const testUserId = uuidv4();
  const testSessionId = uuidv4();

  // 1. Simulate a reading completion and log it
  console.log(`Simulating reading completion for user ${testUserId} and session ${testSessionId}...`);
  const mockConversationSession: ConversationSession = {
    sessionId: testSessionId,
    userId: testUserId,
    spreadType: 'three-card',
    cards: [
      { id: 'fool-card', name: 'The Fool', arcana: 'major', suit: undefined, meaning: { upright: 'Beginnings', reversed: 'Recklessness', keywords: ['new beginnings', 'innocence'] }, isReversed: false, frontImage: '', backImage: '', description: '' },
      { id: 'magician-card', name: 'The Magician', arcana: 'major', suit: undefined, meaning: { upright: 'Manifestation', reversed: 'Manipulation', keywords: ['willpower', 'creation'] }, isReversed: false, frontImage: '', backImage: '', description: '' },
      { id: 'high-priestess-card', name: 'The High Priestess', arcana: 'major', suit: undefined, meaning: { upright: 'Intuition', reversed: 'Hidden agendas', keywords: ['mystery', 'subconscious'] }, isReversed: false, frontImage: '', backImage: '', description: '' },
    ],
    currentState: null as any,
    currentCardIndex: 0,
    userResponses: [],
    cardInterpretations: [
      { base_interpretation: 'Beginnings', personalized_guidance: 'Embrace the new.', spiritual_wisdom: '', practical_advice: '', reader_notes: '', confidence_score: 1, source_references: [] },
      { base_interpretation: 'Manifestation', personalized_guidance: 'Create your reality.', spiritual_wisdom: '', practical_advice: '', reader_notes: '', confidence_score: 1, source_references: [] },
      { base_interpretation: 'Intuition', personalized_guidance: 'Trust your inner voice.', spiritual_wisdom: '', practical_advice: '', reader_notes: '', confidence_score: 1, source_references: [] },
    ],
    startTime: new Date(),
    context: { userId: testUserId, spreadType: 'three-card', sessionId: testSessionId, timestamp: new Date(), cards: [] },
  };

  try {
    await personaLearner.logInteraction(testUserId, mockConversationSession, {
      rating: 5,
      helpful_cards: ['The Fool', 'The Magician'],
      session_notes: 'Test reading for Supermemory MCP E2E.',
    });
    console.log('Successfully logged interaction to Supermemory MCP.');

    // Give a moment for the database to process (optional, but good for E2E)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. Retrieve the user's journey entries
    console.log(`Retrieving journey entries for user ${testUserId}...`);
    const retrievedMemories = await personaLearner.retrieveUserMemories(testUserId);

    // 3. Verify the memory was persisted and is retrievable
    if (retrievedMemories.length > 0) {
      const foundEntry = retrievedMemories.find(mem => {
        try {
          const contentData = JSON.parse(mem.content);
          return contentData.reading_summary?.id === testSessionId || contentData.interaction_data?.session_id === testSessionId;
        } catch (e) {
          return false;
        }
      });

      if (foundEntry) {
        console.log('✅ Test Passed: Memory successfully persisted and retrieved from Supermemory MCP.');
        console.log('Retrieved Entry:', foundEntry);
      } else {
        console.error('❌ Test Failed: Logged memory not found in retrieved entries.');
        console.log('Retrieved Memories:', retrievedMemories);
        process.exit(1);
      }
    } else {
      console.error('❌ Test Failed: No memories retrieved for the user.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test Failed: An error occurred during the E2E test:', error);
    process.exit(1);
  }
}

testSupermemoryMcpE2E();
