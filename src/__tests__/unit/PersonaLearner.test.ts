import { PersonaLearner } from "@/lib/PersonaLearner";
import { UserFeedback, UserInteraction } from "../../app/types";

describe("PersonaLearner", () => {
  let learner: PersonaLearner;
  const mockInteraction: UserInteraction = {
    id: "1",
    type: "prompt",
    timestamp: new Date(),
    readerId: "reader1",
    sessionTag: "session1",
    promptType: "career",
    promptContent: "What career path should I take?",
  };

  const mockFeedback: UserFeedback = {
    id: "1",
    content: "👍",
    timestamp: new Date(),
    readerId: "reader1",
    sessionTag: "session1",
  };

  beforeEach(() => {
    learner = new PersonaLearner();
  });

  it("should update persona based on user interaction", () => {
    // Initial state
    expect(learner.getPersona("reader1")).toBeUndefined();

    // Process interaction
    learner.processInteraction(mockInteraction);
    const persona = learner.getPersona("reader1");

    expect(persona).toBeDefined();
    expect(persona?.interests).toContain("career");
  });

  it("should adjust preferences based on feedback", () => {
    // First process interaction
    learner.processInteraction(mockInteraction);

    // Then process feedback
    learner.processFeedback(mockFeedback);
    const persona = learner.getPersona("reader1");

    expect(persona?.preferences?.feedbackStrength).toBe(1);
  });

  it("should handle multiple sessions", () => {
    // Process interaction from session1
    learner.processInteraction(mockInteraction);

    // Process interaction from different session
    const session2Interaction: UserInteraction = {
      ...mockInteraction,
      id: "2",
      sessionTag: "session2",
    };

    learner.processInteraction(session2Interaction);

    // Should have separate personas
    expect(learner.getPersona("reader1", "session1")).toBeDefined();
    expect(learner.getPersona("reader1", "session2")).toBeDefined();
  });
});
