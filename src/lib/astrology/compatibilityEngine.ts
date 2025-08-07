import { BirthData, PlanetPosition } from "@/types/astrology";

export interface SynastryAnalysis {
  connectionType:
    | "soulmate"
    | "growth"
    | "karmic"
    | "challenging"
    | "complementary";
  overallCompatibility: number;
  strengths: string[];
  challenges: string[];
  advice: string[];
}

interface ChartData {
  birthData: BirthData;
  planets: PlanetPosition[];
}

export class CompatibilityEngine {
  static analyzeSynastry(
    chart1: ChartData,
    chart2: ChartData,
  ): SynastryAnalysis {
    const aspects = this.getSynastryAspects(chart1.planets, chart2.planets);
    const connectionType = this.getConnectionType(aspects);
    const overallCompatibility = this.calculateCompatibilityScore(aspects);

    return {
      connectionType,
      overallCompatibility,
      strengths: this.getStrengths(aspects),
      challenges: this.getChallenges(aspects),
      advice: this.getAdvice(connectionType),
    };
  }

  private static getSynastryAspects(
    planets1: PlanetPosition[],
    planets2: PlanetPosition[],
  ): any[] {
    // This is a simplified synastry aspect calculation.
    // A real implementation would be much more complex.
    const aspects: any[] = [];
    const importantPlanets = ["Sun", "Moon", "Venus", "Mars"];

    for (const p1 of planets1) {
      if (!importantPlanets.includes(p1.name)) continue;
      for (const p2 of planets2) {
        if (!importantPlanets.includes(p2.name)) continue;

        const angle = Math.abs(p1.longitude - p2.longitude) % 180;
        if (angle < 10) aspects.push({ type: "conjunction", p1, p2 });
        else if (angle > 170) aspects.push({ type: "opposition", p1, p2 });
        else if (Math.abs(angle - 90) < 10)
          aspects.push({ type: "square", p1, p2 });
        else if (Math.abs(angle - 120) < 10)
          aspects.push({ type: "trine", p1, p2 });
      }
    }
    return aspects;
  }

  private static getConnectionType(
    aspects: any[],
  ): SynastryAnalysis["connectionType"] {
    const trines = aspects.filter((a) => a.type === "trine").length;
    const squares = aspects.filter((a) => a.type === "square").length;
    const conjunctions = aspects.filter((a) => a.type === "conjunction").length;

    if (trines > squares && trines > conjunctions) return "soulmate";
    if (squares > trines && squares > conjunctions) return "challenging";
    if (conjunctions > trines && conjunctions > squares) return "karmic";
    if (trines > 0 && squares > 0) return "growth";
    return "complementary";
  }

  private static calculateCompatibilityScore(aspects: any[]): number {
    let score = 50;
    for (const aspect of aspects) {
      if (aspect.type === "trine") score += 10;
      if (aspect.type === "conjunction") score += 5;
      if (aspect.type === "square") score -= 10;
      if (aspect.type === "opposition") score -= 5;
    }
    return Math.max(0, Math.min(100, score));
  }

  private static getStrengths(aspects: any[]): string[] {
    return aspects
      .filter((a) => a.type === "trine" || a.type === "conjunction")
      .map(
        (a) => `A harmonious ${a.type} between ${a.p1.name} and ${a.p2.name}`,
      )
      .slice(0, 2);
  }

  private static getChallenges(aspects: any[]): string[] {
    return aspects
      .filter((a) => a.type === "square" || a.type === "opposition")
      .map(
        (a) => `A challenging ${a.type} between ${a.p1.name} and ${a.p2.name}`,
      )
      .slice(0, 2);
  }

  private static getAdvice(
    connectionType: SynastryAnalysis["connectionType"],
  ): string[] {
    const advice: Record<SynastryAnalysis["connectionType"], string[]> = {
      soulmate: [
        "Lean into the natural harmony and celebrate your connection.",
      ],
      growth: ["Embrace the challenges as opportunities for mutual growth."],
      karmic: [
        "Be mindful of repeating past patterns and focus on conscious relating.",
      ],
      challenging: [
        "Practice patience and clear communication to navigate friction.",
      ],
      complementary: [
        "Appreciate your differences and learn from each other's perspectives.",
      ],
    };
    return advice[connectionType];
  }
}
