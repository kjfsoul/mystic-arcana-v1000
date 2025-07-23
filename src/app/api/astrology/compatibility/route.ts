import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { BirthData } from "@/types/astrology";

interface CompatibilityRequest {
  person1: BirthData;
  person2: BirthData;
}

interface PlanetaryData {
  sign: string;
  degree: number;
  retrograde: boolean;
}

interface SynastryAspect {
  aspect: string;
  planet1: string;
  planet2: string;
  orb?: number;
}

interface SynastryResult {
  success: boolean;
  data?: {
    person1: string;
    person2: string;
    synastry_aspects: SynastryAspect[];
    compatibility_score: number;
    score_description: string;
    svg_chart: string;
    planets?: {
      person1: Record<string, PlanetaryData>;
      person2: Record<string, PlanetaryData>;
    };
  };
  error?: string;
}

function getDefaultScores() {
  return {
    love: { rating: 0, description: "Data unavailable" },
    friendship: { rating: 0, description: "Data unavailable" },
    teamwork: { rating: 0, description: "Data unavailable" },
    overall: { summary: "Data unavailable", keyAspects: ["Service unavailable"] }
  };
}

function calculateCompatibilityScores(synastryData: SynastryResult['data']): {
  love: { rating: number; description: string };
  friendship: { rating: number; description: string };
  teamwork: { rating: number; description: string };
  overall: { summary: string; keyAspects: string[] };
} {
  if (!synastryData) return getDefaultScores();
  
  // Extract compatibility score from synastry data
  const baseScore = synastryData.compatibility_score || 75;
  
  // Analyze aspects for different compatibility types
  const aspects = synastryData.synastry_aspects || [];
  
  // Calculate love compatibility (Venus-Mars, Sun-Moon aspects)
  let loveScore = baseScore;
  let friendshipScore = baseScore;
  let teamworkScore = baseScore;
  
  // Adjust scores based on aspect analysis
  const harmonicAspects = aspects.filter((a: SynastryAspect) => 
    a.aspect === 'trine' || a.aspect === 'sextile' || a.aspect === 'conjunction'
  ).length;
  
  const challengingAspects = aspects.filter((a: SynastryAspect) => 
    a.aspect === 'square' || a.aspect === 'opposition'
  ).length;
  
  // Boost scores for harmonic aspects, reduce for challenging ones
  const aspectModifier = (harmonicAspects * 5) - (challengingAspects * 3);
  loveScore = Math.max(1, Math.min(5, (loveScore + aspectModifier) / 20));
  friendshipScore = Math.max(1, Math.min(5, (friendshipScore + aspectModifier * 0.8) / 20));
  teamworkScore = Math.max(1, Math.min(5, (teamworkScore + aspectModifier * 0.9) / 20));
  
  return {
    love: {
      rating: Math.ceil(loveScore),
      description: getLoveDescription(loveScore)
    },
    friendship: {
      rating: Math.ceil(friendshipScore),
      description: getFriendshipDescription(friendshipScore)
    },
    teamwork: {
      rating: Math.ceil(teamworkScore),
      description: getTeamworkDescription(teamworkScore)
    },
    overall: {
      summary: getOverallSummary(loveScore, friendshipScore, teamworkScore),
      keyAspects: extractKeyAspects(aspects)
    }
  };
}

function getLoveDescription(score: number): string {
  if (score >= 4.5) return "Incredible romantic chemistry! Your hearts beat in cosmic harmony, creating a passionate and deeply fulfilling connection.";
  if (score >= 3.5) return "Strong romantic potential with natural attraction and emotional understanding. Your love story has beautiful cosmic support.";
  if (score >= 2.5) return "Good romantic compatibility with some areas of growth. Communication and patience will strengthen your bond over time.";
  if (score >= 1.5) return "Moderate romantic connection that requires effort and understanding. Different approaches to love can create both challenges and growth.";
  return "Romantic compatibility may require significant work and compromise. Focus on building friendship and understanding first.";
}

function getFriendshipDescription(score: number): string {
  if (score >= 4.5) return "Exceptional friendship potential! You understand each other intuitively and bring out the best in one another.";
  if (score >= 3.5) return "Strong friendship compatibility with shared values and mutual respect. You'll create lasting memories together.";
  if (score >= 2.5) return "Good friendship foundation with complementary qualities. Your differences can create interesting and enriching exchanges.";
  if (score >= 1.5) return "Moderate friendship compatibility. Building trust and finding common ground will strengthen your connection over time.";
  return "Friendship may require patience and understanding. Focus on respecting differences and finding shared interests.";
}

function getTeamworkDescription(score: number): string {
  if (score >= 4.5) return "Outstanding teamwork potential! You complement each other's strengths and work toward goals with unified energy.";
  if (score >= 3.5) return "Strong collaborative compatibility with shared work ethics and complementary skills. Projects together will flourish.";
  if (score >= 2.5) return "Good teamwork potential with some areas to navigate. Clear communication about roles and expectations will help.";
  if (score >= 1.5) return "Moderate teamwork compatibility. Success will come through patience, compromise, and leveraging individual strengths.";
  return "Teamwork may face challenges. Focus on clear communication, defined roles, and respecting different working styles.";
}

function getOverallSummary(love: number, friendship: number, teamwork: number): string {
  const average = (love + friendship + teamwork) / 3;
  
  if (average >= 4.5) {
    return "Your cosmic connection is truly exceptional! The stars have aligned to create a harmonious and supportive relationship across all areas of life. This is a rare and precious bond that can weather any storm and celebrate every joy together.";
  }
  if (average >= 3.5) {
    return "You share a wonderful cosmic connection with strong potential for lasting happiness. While every relationship has its seasons, your charts suggest natural harmony and mutual support that will help you grow together.";
  }
  if (average >= 2.5) {
    return "Your relationship has solid cosmic foundations with room for growth and discovery. The challenges you face together will strengthen your bond and help you both evolve as individuals and as a partnership.";
  }
  if (average >= 1.5) {
    return "Your cosmic connection offers opportunities for learning and growth. While it may require more effort and understanding, the rewards of working through differences can lead to a deeply meaningful relationship.";
  }
  return "Your relationship will require patience, communication, and mutual respect to flourish. The cosmos encourages you to approach this connection with open hearts and realistic expectations, focusing on building understanding over time.";
}

function extractKeyAspects(aspects: SynastryAspect[]): string[] {
  const keyAspects: string[] = [];
  
  // Look for significant aspects
  aspects.forEach((aspect: SynastryAspect) => {
    if (aspect.aspect === 'conjunction') {
      keyAspects.push(`${aspect.planet1}-${aspect.planet2} conjunction creating powerful unified energy`);
    } else if (aspect.aspect === 'trine') {
      keyAspects.push(`${aspect.planet1}-${aspect.planet2} trine bringing natural harmony and flow`);
    } else if (aspect.aspect === 'sextile') {
      keyAspects.push(`${aspect.planet1}-${aspect.planet2} sextile offering opportunities for growth and cooperation`);
    } else if (aspect.aspect === 'square') {
      keyAspects.push(`${aspect.planet1}-${aspect.planet2} square providing dynamic tension that catalyzes growth`);
    } else if (aspect.aspect === 'opposition') {
      keyAspects.push(`${aspect.planet1}-${aspect.planet2} opposition creating complementary yet challenging dynamics`);
    }
  });
  
  // Ensure we have at least 3 aspects
  if (keyAspects.length < 3) {
    keyAspects.push("Unique cosmic patterns creating opportunities for mutual growth and discovery");
    keyAspects.push("Planetary positions suggesting the importance of patience and open communication");
    keyAspects.push("Astrological indicators pointing toward building trust through shared experiences");
  }
  
  return keyAspects.slice(0, 5);
}

function callPythonScript(action: string, data: object): Promise<SynastryResult> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = path.join(process.cwd(), 'src/services/astrology-python/simple_astrology.py');
    
    const pythonProcess = spawn(pythonPath, [scriptPath, action, JSON.stringify(data)]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        resolve({
          success: false,
          error: `Python script failed with code ${code}: ${stderr}`
        });
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        resolve({
          success: false,
          error: `Failed to parse Python output: ${error}`
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Failed to spawn Python process:', error);
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${error.message}`
      });
    });
    
    // Set timeout for long-running processes
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'Python script timeout'
      });
    }, 30000); // 30 second timeout
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: CompatibilityRequest = await request.json();
    
    // Validate input
    if (!body.person1 || !body.person2) {
      return NextResponse.json(
        { success: false, error: "Both person1 and person2 data are required" },
        { status: 400 }
      );
    }

    // Convert dates to proper format for Python script
    const person1Data = {
      name: body.person1.name,
      year: new Date(body.person1.date).getFullYear(),
      month: new Date(body.person1.date).getMonth() + 1,
      day: new Date(body.person1.date).getDate(),
      hour: new Date(body.person1.date).getHours(),
      minute: new Date(body.person1.date).getMinutes(),
      city: body.person1.city,
      country: body.person1.country || ""
    };

    const person2Data = {
      name: body.person2.name,
      year: new Date(body.person2.date).getFullYear(),
      month: new Date(body.person2.date).getMonth() + 1,
      day: new Date(body.person2.date).getDate(),
      hour: new Date(body.person2.date).getHours(),
      minute: new Date(body.person2.date).getMinutes(),
      city: body.person2.city,
      country: body.person2.country || ""
    };

    // Call Python script for synastry calculation
    const synastryResult = await callPythonScript('synastry', {
      person1: person1Data,
      person2: person2Data
    });

    if (!synastryResult.success) {
      // Fallback to data temporarily unavailable
      return NextResponse.json({
        success: true,
        data: {
          love: {
            rating: 0,
            description: "Compatibility data temporarily unavailable. Please try again later."
          },
          friendship: {
            rating: 0,
            description: "Compatibility data temporarily unavailable. Please try again later."
          },
          teamwork: {
            rating: 0,
            description: "Compatibility data temporarily unavailable. Please try again later."
          },
          overall: {
            summary: "We're currently unable to access the astronomical calculation service. Please try again in a few moments.",
            keyAspects: ["Service temporarily unavailable"]
          },
          isUnavailable: true
        }
      });
    }

    // Calculate compatibility scores from synastry data
    const compatibilityScores = calculateCompatibilityScores(synastryResult.data!);

    return NextResponse.json({
      success: true,
      data: {
        ...compatibilityScores,
        rawSynastryData: synastryResult.data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Compatibility API error:', error);
    
    // Fail-safe fallback
    return NextResponse.json({
      success: true,
      data: {
        love: {
          rating: 0,
          description: "Compatibility data temporarily unavailable. Please try again later."
        },
        friendship: {
          rating: 0,
          description: "Compatibility data temporarily unavailable. Please try again later."
        },
        teamwork: {
          rating: 0,
          description: "Compatibility data temporarily unavailable. Please try again later."
        },
        overall: {
          summary: "We're currently experiencing technical difficulties with our astrological calculation service. Please try again in a few moments.",
          keyAspects: ["Service temporarily unavailable"]
        },
        isUnavailable: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}