import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables first
config({ path: ".env.local" });

// Complete 78-card Rider-Waite Tarot Deck
const COMPLETE_RIDER_WAITE_DECK = [
  // MAJOR ARCANA (22 cards)
  {
    name: "The Fool",
    card_number: 0,
    arcana_type: "major",
    suit: null,
    meaning_upright: "New beginnings, innocence, spontaneity, free spirit",
    meaning_reversed: "Holding back, recklessness, risk-taking",
    image_url: "/tarot/deck-rider-waite/major/00-the-fool.jpg",
    keywords: ["beginning", "journey", "innocence", "faith"],
  },
  {
    name: "The Magician",
    card_number: 1,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Manifestation, resourcefulness, power, inspired action",
    meaning_reversed: "Manipulation, poor planning, untapped talents",
    image_url: "/tarot/deck-rider-waite/major/01-magician.jpg",
    keywords: ["manifestation", "power", "skill", "concentration"],
  },
  {
    name: "The High Priestess",
    card_number: 2,
    arcana_type: "major",
    suit: null,
    meaning_upright:
      "Intuition, sacred knowledge, divine feminine, subconscious mind",
    meaning_reversed: "Secrets, disconnected from intuition, withdrawal",
    image_url: "/tarot/deck-rider-waite/major/02-high-priestess.jpg",
    keywords: ["intuition", "mystery", "subconscious", "inner knowing"],
  },
  {
    name: "The Empress",
    card_number: 3,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Femininity, beauty, nature, nurturing, abundance",
    meaning_reversed: "Creative block, dependence on others",
    image_url: "/tarot/deck-rider-waite/major/03-empress.jpg",
    keywords: ["fertility", "femininity", "beauty", "nature"],
  },
  {
    name: "The Emperor",
    card_number: 4,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Authority, establishment, structure, father figure",
    meaning_reversed: "Domination, excessive control, lack of discipline",
    image_url: "/tarot/deck-rider-waite/major/04-emperor.jpg",
    keywords: ["authority", "structure", "control", "father"],
  },
  {
    name: "The Hierophant",
    card_number: 5,
    arcana_type: "major",
    suit: null,
    meaning_upright:
      "Spiritual wisdom, religious beliefs, conformity, tradition",
    meaning_reversed: "Personal beliefs, freedom, challenging the status quo",
    image_url: "/tarot/deck-rider-waite/major/05-hierophant.jpg",
    keywords: ["tradition", "conformity", "morality", "ethics"],
  },
  {
    name: "The Lovers",
    card_number: 6,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Love, harmony, relationships, values alignment",
    meaning_reversed: "Self-love, disharmony, imbalance, misalignment",
    image_url: "/tarot/deck-rider-waite/major/06-lovers.jpg",
    keywords: ["love", "union", "relationships", "choices"],
  },
  {
    name: "The Chariot",
    card_number: 7,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Control, willpower, success, determination",
    meaning_reversed: "Self-discipline, opposition, lack of direction",
    image_url: "/tarot/deck-rider-waite/major/07-chariot.jpg",
    keywords: ["control", "willpower", "success", "determination"],
  },
  {
    name: "Strength",
    card_number: 8,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Strength, courage, persuasion, influence, compassion",
    meaning_reversed: "Self doubt, lack of confidence, inadequacy",
    image_url: "/tarot/deck-rider-waite/major/08-strength.jpg",
    keywords: ["strength", "courage", "patience", "control"],
  },
  {
    name: "The Hermit",
    card_number: 9,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Soul searching, introspection, inner guidance",
    meaning_reversed: "Isolation, loneliness, withdrawal",
    image_url: "/tarot/deck-rider-waite/major/09-hermit.jpg",
    keywords: ["introspection", "searching", "guidance", "solitude"],
  },
  {
    name: "Wheel of Fortune",
    card_number: 10,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Good luck, karma, life cycles, destiny, turning point",
    meaning_reversed: "Bad luck, lack of control, clinging to control",
    image_url: "/tarot/deck-rider-waite/major/10-wheel-of-fortune.jpg",
    keywords: ["fate", "destiny", "change", "cycles"],
  },
  {
    name: "Justice",
    card_number: 11,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Justice, fairness, truth, cause and effect, law",
    meaning_reversed: "Unfairness, lack of accountability, dishonesty",
    image_url: "/tarot/deck-rider-waite/major/11-justice.jpg",
    keywords: ["justice", "fairness", "truth", "law"],
  },
  {
    name: "The Hanged Man",
    card_number: 12,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Surrender, letting go, new perspective",
    meaning_reversed: "Delays, resistance, stalling",
    image_url: "/tarot/deck-rider-waite/major/12-hanged-man.jpg",
    keywords: ["surrender", "letting go", "pause", "new perspective"],
  },
  {
    name: "Death",
    card_number: 13,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Endings, beginnings, change, transformation",
    meaning_reversed:
      "Resistance to change, personal transformation, inner purging",
    image_url: "/tarot/deck-rider-waite/major/13-death.jpg",
    keywords: ["transformation", "endings", "change", "transition"],
  },
  {
    name: "Temperance",
    card_number: 14,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Balance, moderation, patience, purpose",
    meaning_reversed: "Imbalance, excess, self-healing, re-alignment",
    image_url: "/tarot/deck-rider-waite/major/14-temperance.jpg",
    keywords: ["balance", "moderation", "patience", "purpose"],
  },
  {
    name: "The Devil",
    card_number: 15,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Shadow self, attachment, addiction, restriction",
    meaning_reversed:
      "Releasing limiting beliefs, exploring dark thoughts, detachment",
    image_url: "/tarot/deck-rider-waite/major/15-devil.jpg",
    keywords: ["bondage", "addiction", "sexuality", "materialism"],
  },
  {
    name: "The Tower",
    card_number: 16,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Sudden change, upheaval, chaos, revelation, awakening",
    meaning_reversed:
      "Personal transformation, fear of change, averting disaster",
    image_url: "/tarot/deck-rider-waite/major/16-tower.jpg",
    keywords: ["sudden change", "upheaval", "chaos", "revelation"],
  },
  {
    name: "The Star",
    card_number: 17,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Hope, faith, purpose, renewal, spirituality",
    meaning_reversed: "Lack of faith, despair, self-trust, disconnection",
    image_url: "/tarot/deck-rider-waite/major/17-star.jpg",
    keywords: ["hope", "faith", "purpose", "renewal"],
  },
  {
    name: "The Moon",
    card_number: 18,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Illusion, fear, anxiety, subconscious, intuition",
    meaning_reversed: "Release of fear, repressed emotion, inner confusion",
    image_url: "/tarot/deck-rider-waite/major/18-moon.jpg",
    keywords: ["illusion", "fear", "anxiety", "intuition"],
  },
  {
    name: "The Sun",
    card_number: 19,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Optimism, fun, warmth, success, positivity",
    meaning_reversed: "Inner child, feeling down, overly optimistic",
    image_url: "/tarot/deck-rider-waite/major/19-sun.jpg",
    keywords: ["optimism", "fun", "warmth", "success"],
  },
  {
    name: "Judgement",
    card_number: 20,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Judgement, rebirth, inner calling, absolution",
    meaning_reversed: "Self-doubt, inner critic, ignoring the call",
    image_url: "/tarot/deck-rider-waite/major/20-judgement.jpg",
    keywords: ["judgement", "rebirth", "inner calling", "absolution"],
  },
  {
    name: "The World",
    card_number: 21,
    arcana_type: "major",
    suit: null,
    meaning_upright: "Completion, integration, accomplishment, travel",
    meaning_reversed: "Seeking personal closure, short-cut to success",
    image_url: "/tarot/deck-rider-waite/major/21-world.jpg",
    keywords: ["completion", "integration", "accomplishment", "travel"],
  },

  // MINOR ARCANA - CUPS (14 cards)
  {
    name: "Ace of Cups",
    card_number: 1,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Love, new relationships, compassion, creativity",
    meaning_reversed: "Self-love, intuition, repressed emotions",
    image_url: "/tarot/deck-rider-waite/minor/ace-cups.jpg",
    keywords: ["love", "emotion", "intuition", "spirituality"],
  },
  {
    name: "Two of Cups",
    card_number: 2,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Unified love, partnership, mutual attraction",
    meaning_reversed: "Self-love, break-ups, disharmony",
    image_url: "/tarot/deck-rider-waite/minor/two-cups.jpg",
    keywords: ["partnership", "unity", "love", "attraction"],
  },
  {
    name: "Three of Cups",
    card_number: 3,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Celebration, friendship, creativity, collaborations",
    meaning_reversed:
      "Independence, alone time, hardcore partying, three's a crowd",
    image_url: "/tarot/deck-rider-waite/minor/three-cups.jpg",
    keywords: ["celebration", "friendship", "creativity", "collaboration"],
  },
  {
    name: "Four of Cups",
    card_number: 4,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Meditation, contemplation, apathy, reevaluation",
    meaning_reversed: "Retreat, withdrawal, checking in with yourself",
    image_url: "/tarot/deck-rider-waite/minor/four-cups.jpg",
    keywords: ["meditation", "contemplation", "apathy", "reevaluation"],
  },
  {
    name: "Five of Cups",
    card_number: 5,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Regret, failure, disappointment, pessimism",
    meaning_reversed: "Personal setbacks, self-forgiveness, moving on",
    image_url: "/tarot/deck-rider-waite/minor/five-cups.jpg",
    keywords: ["regret", "failure", "disappointment", "pessimism"],
  },
  {
    name: "Six of Cups",
    card_number: 6,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Revisiting the past, childhood memories, innocence, joy",
    meaning_reversed: "Living in the past, forgiveness, lacking playfulness",
    image_url: "/tarot/deck-rider-waite/minor/six-cups.jpg",
    keywords: ["nostalgia", "childhood", "innocence", "joy"],
  },
  {
    name: "Seven of Cups",
    card_number: 7,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Opportunities, choices, wishful thinking, illusion",
    meaning_reversed: "Alignment, personal values, overwhelmed by choices",
    image_url: "/tarot/deck-rider-waite/minor/seven-cups.jpg",
    keywords: ["opportunities", "choices", "wishful thinking", "illusion"],
  },
  {
    name: "Eight of Cups",
    card_number: 8,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Disappointment, abandonment, withdrawal, escapism",
    meaning_reversed: "Trying one more time, indecision, aimless drifting",
    image_url: "/tarot/deck-rider-waite/minor/eight-cups.jpg",
    keywords: ["disappointment", "abandonment", "withdrawal", "escapism"],
  },
  {
    name: "Nine of Cups",
    card_number: 9,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Contentment, satisfaction, gratitude, wish come true",
    meaning_reversed: "Inner happiness, materialism, dissatisfaction",
    image_url: "/tarot/deck-rider-waite/minor/nine-cups.jpg",
    keywords: ["contentment", "satisfaction", "gratitude", "wish"],
  },
  {
    name: "Ten of Cups",
    card_number: 10,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Divine love, blissful relationships, harmony, alignment",
    meaning_reversed:
      "Disconnection, misaligned values, struggling relationships",
    image_url: "/tarot/deck-rider-waite/minor/ten-cups.jpg",
    keywords: ["divine love", "blissful relationships", "harmony", "alignment"],
  },
  {
    name: "Page of Cups",
    card_number: 11,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright:
      "Creative opportunities, intuitive messages, curiosity, possibility",
    meaning_reversed: "New ideas, doubting intuition, creative blocks",
    image_url: "/tarot/deck-rider-waite/minor/page-cups.jpg",
    keywords: [
      "creative opportunities",
      "intuitive messages",
      "curiosity",
      "possibility",
    ],
  },
  {
    name: "Knight of Cups",
    card_number: 12,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright: "Creativity, romance, charm, imagination, beauty",
    meaning_reversed: "Overactive imagination, unrealistic, jealous, moody",
    image_url: "/tarot/deck-rider-waite/minor/knight-cups.jpg",
    keywords: ["creativity", "romance", "charm", "imagination"],
  },
  {
    name: "Queen of Cups",
    card_number: 13,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright:
      "Compassionate, caring, emotionally stable, intuitive, in flow",
    meaning_reversed: "Inner feelings, self-care, self-love, codependency",
    image_url: "/tarot/deck-rider-waite/minor/queen-cups.jpg",
    keywords: ["compassionate", "caring", "emotionally stable", "intuitive"],
  },
  {
    name: "King of Cups",
    card_number: 14,
    arcana_type: "minor",
    suit: "cups",
    meaning_upright:
      "Emotionally balanced, compassionate, generous, diplomatic",
    meaning_reversed:
      "Self-compassion, inner feelings, moodiness, emotionally manipulative",
    image_url: "/tarot/deck-rider-waite/minor/king-cups.jpg",
    keywords: [
      "emotionally balanced",
      "compassionate",
      "generous",
      "diplomatic",
    ],
  },

  // MINOR ARCANA - PENTACLES (14 cards)
  {
    name: "Ace of Pentacles",
    card_number: 1,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Manifestation, new financial opportunity, abundance",
    meaning_reversed:
      "Lost opportunity, lack of planning, poor financial decisions",
    image_url: "/tarot/deck-rider-waite/minor/ace-pentacles.jpg",
    keywords: ["manifestation", "prosperity", "new venture", "abundance"],
  },
  {
    name: "Two of Pentacles",
    card_number: 2,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright:
      "Multiple priorities, time management, prioritization, adaptability",
    meaning_reversed: "Over-committed, disorganization, reprioritization",
    image_url: "/tarot/deck-rider-waite/minor/two-pentacles.jpg",
    keywords: [
      "multiple priorities",
      "time management",
      "prioritization",
      "adaptability",
    ],
  },
  {
    name: "Three of Pentacles",
    card_number: 3,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Teamwork, collaboration, learning, implementation",
    meaning_reversed: "Disharmony, misalignment, working alone",
    image_url: "/tarot/deck-rider-waite/minor/three-pentacles.jpg",
    keywords: ["teamwork", "collaboration", "learning", "implementation"],
  },
  {
    name: "Four of Pentacles",
    card_number: 4,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Saving money, security, conservatism, scarcity, control",
    meaning_reversed: "Over-spending, greed, self-protection",
    image_url: "/tarot/deck-rider-waite/minor/four-pentacles.jpg",
    keywords: ["saving money", "security", "conservatism", "control"],
  },
  {
    name: "Five of Pentacles",
    card_number: 5,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Financial loss, poverty, lack mindset, isolation, worry",
    meaning_reversed: "Recovery from financial loss, spiritual poverty",
    image_url: "/tarot/deck-rider-waite/minor/five-pentacles.jpg",
    keywords: ["financial loss", "poverty", "lack mindset", "isolation"],
  },
  {
    name: "Six of Pentacles",
    card_number: 6,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Giving, receiving, sharing wealth, generosity, charity",
    meaning_reversed: "Self-care, unpaid debts, one-sided charity",
    image_url: "/tarot/deck-rider-waite/minor/six-pentacles.jpg",
    keywords: ["giving", "receiving", "sharing wealth", "generosity"],
  },
  {
    name: "Seven of Pentacles",
    card_number: 7,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright:
      "Sustainable results, long-term view, perseverance, investment",
    meaning_reversed: "Lack of long-term vision, limited success or reward",
    image_url: "/tarot/deck-rider-waite/minor/seven-pentacles.jpg",
    keywords: [
      "sustainable results",
      "long-term view",
      "perseverance",
      "investment",
    ],
  },
  {
    name: "Eight of Pentacles",
    card_number: 8,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright:
      "Apprenticeship, repetitive tasks, mastery, skill development",
    meaning_reversed: "Lack of focus, perfectionism, misdirected activity",
    image_url: "/tarot/deck-rider-waite/minor/eight-pentacles.jpg",
    keywords: [
      "apprenticeship",
      "repetitive tasks",
      "mastery",
      "skill development",
    ],
  },
  {
    name: "Nine of Pentacles",
    card_number: 9,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright:
      "Abundance, luxury, self-sufficiency, financial independence",
    meaning_reversed: "Self-worth, over-investment in work, hustling",
    image_url: "/tarot/deck-rider-waite/minor/nine-pentacles.jpg",
    keywords: [
      "abundance",
      "luxury",
      "self-sufficiency",
      "financial independence",
    ],
  },
  {
    name: "Ten of Pentacles",
    card_number: 10,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Wealth, financial security, family, long-term success",
    meaning_reversed: "The dark side of wealth, financial failure or loss",
    image_url: "/tarot/deck-rider-waite/minor/ten-pentacles.jpg",
    keywords: ["wealth", "financial security", "family", "long-term success"],
  },
  {
    name: "Page of Pentacles",
    card_number: 11,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Manifestation, financial opportunity, skill development",
    meaning_reversed: "Lack of progress, procrastination, learn from failure",
    image_url: "/tarot/deck-rider-waite/minor/page-pentacles.jpg",
    keywords: ["manifestation", "financial opportunity", "skill development"],
  },
  {
    name: "Knight of Pentacles",
    card_number: 12,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Hard work, productivity, routine, conservatism",
    meaning_reversed: "Self-discipline, boredom, feeling stuck, perfectionism",
    image_url: "/tarot/deck-rider-waite/minor/knight-pentacles.jpg",
    keywords: ["hard work", "productivity", "routine", "conservatism"],
  },
  {
    name: "Queen of Pentacles",
    card_number: 13,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright:
      "Nurturing, practical, providing financially, a working parent",
    meaning_reversed: "Self-care, work-home imbalance",
    image_url: "/tarot/deck-rider-waite/minor/queen-pentacles.jpg",
    keywords: [
      "nurturing",
      "practical",
      "providing financially",
      "working parent",
    ],
  },
  {
    name: "King of Pentacles",
    card_number: 14,
    arcana_type: "minor",
    suit: "pentacles",
    meaning_upright: "Financial success, business acumen, security, leadership",
    meaning_reversed:
      "Financial failure, lack of ambition, bribery, corruption",
    image_url: "/tarot/deck-rider-waite/minor/king-pentacles.jpg",
    keywords: [
      "financial success",
      "business acumen",
      "security",
      "leadership",
    ],
  },

  // MINOR ARCANA - SWORDS (14 cards)
  {
    name: "Ace of Swords",
    card_number: 1,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright: "Breakthrough, clarity, sharp mind",
    meaning_reversed: "Confusion, chaos, lack of clarity",
    image_url: "/tarot/deck-rider-waite/minor/ace-swords.jpg",
    keywords: ["breakthrough", "clarity", "sharp mind", "concentration"],
  },
  {
    name: "Two of Swords",
    card_number: 2,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Difficult decisions, weighing up options, an impasse, avoidance",
    meaning_reversed: "Indecision, confusion, information overload",
    image_url: "/tarot/deck-rider-waite/minor/two-swords.jpg",
    keywords: [
      "difficult decisions",
      "weighing options",
      "impasse",
      "avoidance",
    ],
  },
  {
    name: "Three of Swords",
    card_number: 3,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright: "Heartbreak, emotional pain, sorrow, grief, hurt",
    meaning_reversed:
      "Negative self-talk, releasing pain, optimism, forgiveness",
    image_url: "/tarot/deck-rider-waite/minor/three-swords.jpg",
    keywords: ["heartbreak", "emotional pain", "sorrow", "grief"],
  },
  {
    name: "Four of Swords",
    card_number: 4,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Rest, relaxation, meditation, contemplation, recuperation",
    meaning_reversed: "Exhaustion, burn-out, deep contemplation, stagnation",
    image_url: "/tarot/deck-rider-waite/minor/four-swords.jpg",
    keywords: ["rest", "relaxation", "meditation", "contemplation"],
  },
  {
    name: "Five of Swords",
    card_number: 5,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Conflict, disagreements, competition, defeat, winning at all costs",
    meaning_reversed: "Reconciliation, making amends, past resentment",
    image_url: "/tarot/deck-rider-waite/minor/five-swords.jpg",
    keywords: ["conflict", "disagreements", "competition", "defeat"],
  },
  {
    name: "Six of Swords",
    card_number: 6,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright: "Transition, change, rite of passage, releasing baggage",
    meaning_reversed:
      "Personal transition, resistance to change, unfinished business",
    image_url: "/tarot/deck-rider-waite/minor/six-swords.jpg",
    keywords: ["transition", "change", "rite of passage", "releasing baggage"],
  },
  {
    name: "Seven of Swords",
    card_number: 7,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Betrayal, deception, getting away with something, acting strategically",
    meaning_reversed: "Imposter syndrome, self-deceit, keeping secrets",
    image_url: "/tarot/deck-rider-waite/minor/seven-swords.jpg",
    keywords: ["betrayal", "deception", "getting away", "strategic action"],
  },
  {
    name: "Eight of Swords",
    card_number: 8,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Negative thoughts, self-imposed restriction, imprisonment, victim mentality",
    meaning_reversed:
      "Self-limiting beliefs, inner critic, releasing negative thoughts",
    image_url: "/tarot/deck-rider-waite/minor/eight-swords.jpg",
    keywords: [
      "negative thoughts",
      "restriction",
      "imprisonment",
      "victim mentality",
    ],
  },
  {
    name: "Nine of Swords",
    card_number: 9,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright: "Anxiety, worry, fear, depression, nightmares",
    meaning_reversed:
      "Inner turmoil, deep-seated fears, secrets, releasing worry",
    image_url: "/tarot/deck-rider-waite/minor/nine-swords.jpg",
    keywords: ["anxiety", "worry", "fear", "depression"],
  },
  {
    name: "Ten of Swords",
    card_number: 10,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright: "Painful endings, deep wounds, betrayal, loss, crisis",
    meaning_reversed: "Recovery, regeneration, resisting an inevitable end",
    image_url: "/tarot/deck-rider-waite/minor/ten-swords.jpg",
    keywords: ["painful endings", "deep wounds", "betrayal", "loss"],
  },
  {
    name: "Page of Swords",
    card_number: 11,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "New ideas, curiosity, thirst for knowledge, new ways of communicating",
    meaning_reversed:
      "Self-expression, all talk and no action, haphazard action",
    image_url: "/tarot/deck-rider-waite/minor/page-swords.jpg",
    keywords: [
      "new ideas",
      "curiosity",
      "thirst for knowledge",
      "communication",
    ],
  },
  {
    name: "Knight of Swords",
    card_number: 12,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Ambitious, action-oriented, driven to succeed, fast-thinking",
    meaning_reversed: "Restless, unfocused, impulsive, burn-out",
    image_url: "/tarot/deck-rider-waite/minor/knight-swords.jpg",
    keywords: ["ambitious", "action-oriented", "driven", "fast-thinking"],
  },
  {
    name: "Queen of Swords",
    card_number: 13,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright:
      "Independent, unbiased judgement, clear boundaries, direct communication",
    meaning_reversed:
      "Overly emotional, easily influenced, bitchy, cold-hearted",
    image_url: "/tarot/deck-rider-waite/minor/queen-swords.jpg",
    keywords: [
      "independent",
      "unbiased judgement",
      "clear boundaries",
      "direct communication",
    ],
  },
  {
    name: "King of Swords",
    card_number: 14,
    arcana_type: "minor",
    suit: "swords",
    meaning_upright: "Mental clarity, intellectual power, authority, truth",
    meaning_reversed: "Quiet power, inner truth, misuse of power, manipulation",
    image_url: "/tarot/deck-rider-waite/minor/king-swords.jpg",
    keywords: ["mental clarity", "intellectual power", "authority", "truth"],
  },

  // MINOR ARCANA - WANDS (14 cards)
  {
    name: "Ace of Wands",
    card_number: 1,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Inspiration, new opportunities, growth",
    meaning_reversed: "Lack of energy, lack of passion, boredom",
    image_url: "/tarot/deck-rider-waite/minor/ace-wands.jpg",
    keywords: ["inspiration", "power", "creation", "beginnings"],
  },
  {
    name: "Two of Wands",
    card_number: 2,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Future planning, making decisions, leaving comfort zone",
    meaning_reversed: "Personal goals, inner alignment, fear of unknown",
    image_url: "/tarot/deck-rider-waite/minor/two-wands.jpg",
    keywords: ["future planning", "making decisions", "leaving comfort zone"],
  },
  {
    name: "Three of Wands",
    card_number: 3,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Progress, expansion, foresight, overseas opportunities",
    meaning_reversed: "Playing small, lack of foresight, unexpected delays",
    image_url: "/tarot/deck-rider-waite/minor/three-wands.jpg",
    keywords: ["progress", "expansion", "foresight", "overseas opportunities"],
  },
  {
    name: "Four of Wands",
    card_number: 4,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Celebration, joy, harmony, relaxation, homecoming",
    meaning_reversed:
      "Personal celebration, inner harmony, conflict with others",
    image_url: "/tarot/deck-rider-waite/minor/four-wands.jpg",
    keywords: ["celebration", "joy", "harmony", "relaxation"],
  },
  {
    name: "Five of Wands",
    card_number: 5,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Conflict, disagreements, competition, tension, diversity",
    meaning_reversed: "Inner conflict, conflict avoidance, tension release",
    image_url: "/tarot/deck-rider-waite/minor/five-wands.jpg",
    keywords: ["conflict", "disagreements", "competition", "tension"],
  },
  {
    name: "Six of Wands",
    card_number: 6,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Success, public recognition, progress, self-confidence",
    meaning_reversed:
      "Private achievement, personal definition of success, fall from grace",
    image_url: "/tarot/deck-rider-waite/minor/six-wands.jpg",
    keywords: ["success", "public recognition", "progress", "self-confidence"],
  },
  {
    name: "Seven of Wands",
    card_number: 7,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Challenge, competition, protection, perseverance",
    meaning_reversed: "Exhaustion, giving up, overwhelmed",
    image_url: "/tarot/deck-rider-waite/minor/seven-wands.jpg",
    keywords: ["challenge", "competition", "protection", "perseverance"],
  },
  {
    name: "Eight of Wands",
    card_number: 8,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Swiftness, speed, progress, movement, quick decisions",
    meaning_reversed:
      "Delays, frustration, resisting change, internal alignment",
    image_url: "/tarot/deck-rider-waite/minor/eight-wands.jpg",
    keywords: ["swiftness", "speed", "progress", "movement"],
  },
  {
    name: "Nine of Wands",
    card_number: 9,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright:
      "Resilience, courage, persistence, test of faith, boundaries",
    meaning_reversed:
      "Inner resources, struggle, overwhelm, defensive, paranoia",
    image_url: "/tarot/deck-rider-waite/minor/nine-wands.jpg",
    keywords: ["resilience", "courage", "persistence", "test of faith"],
  },
  {
    name: "Ten of Wands",
    card_number: 10,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Burden, extra responsibility, hard work, completion",
    meaning_reversed: "Doing it all, carrying the burden, delegation, release",
    image_url: "/tarot/deck-rider-waite/minor/ten-wands.jpg",
    keywords: ["burden", "extra responsibility", "hard work", "completion"],
  },
  {
    name: "Page of Wands",
    card_number: 11,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright:
      "Inspiration, ideas, discovery, limitless potential, free spirit",
    meaning_reversed:
      "Newly formed ideas, redirecting energy, self-limiting beliefs",
    image_url: "/tarot/deck-rider-waite/minor/page-wands.jpg",
    keywords: ["inspiration", "ideas", "discovery", "limitless potential"],
  },
  {
    name: "Knight of Wands",
    card_number: 12,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Action, impulsiveness, adventure, energy, fearlessness",
    meaning_reversed:
      "Passion project, haste, scattered energy, delays, frustration",
    image_url: "/tarot/deck-rider-waite/minor/knight-wands.jpg",
    keywords: ["action", "impulsiveness", "adventure", "energy"],
  },
  {
    name: "Queen of Wands",
    card_number: 13,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright:
      "Courage, confidence, independence, social butterfly, determination",
    meaning_reversed:
      "Self-respect, self-confidence, introverted, re-establish sense of self",
    image_url: "/tarot/deck-rider-waite/minor/queen-wands.jpg",
    keywords: ["courage", "confidence", "independence", "social butterfly"],
  },
  {
    name: "King of Wands",
    card_number: 14,
    arcana_type: "minor",
    suit: "wands",
    meaning_upright: "Natural leader, vision, entrepreneur, honour",
    meaning_reversed: "Impulsiveness, haste, ruthless, high expectations",
    image_url: "/tarot/deck-rider-waite/minor/king-wands.jpg",
    keywords: ["natural leader", "vision", "entrepreneur", "honour"],
  },
];

/**
 * Seed the tarot cards into the database
 * This script populates the cards table with the complete 78-card Rider-Waite deck
 */
async function seedTarotCards() {
  console.log("🌟 Starting tarot deck seeding...");

  try {
    // Create Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Clear existing cards first (optional - remove if you want to keep existing data)
    console.log("🗑️ Clearing existing cards...");
    const { error: deleteError } = await supabase
      .from("cards")
      .delete()
      .eq("deck_id", "00000000-0000-0000-0000-000000000001"); // Delete cards for this deck only

    if (deleteError) {
      console.error("❌ Error clearing existing cards:", deleteError);
      return;
    }

    // Insert all cards with the Rider-Waite deck ID
    console.log(`📦 Inserting ${COMPLETE_RIDER_WAITE_DECK.length} cards...`);

    const cardsWithDeckId = COMPLETE_RIDER_WAITE_DECK.map((card) => ({
      ...card,
      deck_id: "00000000-0000-0000-0000-000000000001", // Rider-Waite deck ID from migration
    }));

    const { data, error } = await supabase
      .from("cards")
      .insert(cardsWithDeckId)
      .select("id, name");

    if (error) {
      console.error("❌ Error inserting cards:", error);
      return;
    }

    console.log(`✅ Successfully inserted ${data?.length || 0} tarot cards!`);

    // Verify the insertion
    const { count } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true });

    console.log(`📊 Total cards in database: ${count}`);
  } catch (error) {
    console.error("💥 Unexpected error during seeding:", error);
  }
}

// Run the seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTarotCards()
    .then(() => {
      console.log("🎉 Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { COMPLETE_RIDER_WAITE_DECK, seedTarotCards };
