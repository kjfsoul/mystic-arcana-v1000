import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { BirthData } from '@/types/astrology';

interface HoroscopeRequest {
  birthData: BirthData;
}

interface HoroscopeData {
  sign: string;
  degrees: number;
  daily: string;
}

interface HoroscopeResult {
  success: boolean;
  data?: {
    sun_sign: string;
    sun_degrees: number;
    birth_chart_data?: {
      planets?: Record<string, unknown>;
    };
  };
  error?: string;
}

// Daily interpretation templates for each zodiac sign
const getDailyInterpretations = (): Record<string, string[]> => ({
  aries: [
    "Today you are feeling the fire of initiative burning bright within you. Channel your natural leadership to tackle new challenges with confidence and determination.",
    "Your pioneering spirit is awakened today. Trust your instincts and take bold action toward your goals - the universe supports your courage.",
    "Mars energy fuels your ambition today. Direct your passionate nature toward creative projects and watch them flourish under your dynamic influence."
  ],
  taurus: [
    "Today you are feeling deeply grounded and connected to the earth's nurturing energy. Focus on building lasting foundations for your future prosperity.",
    "Venus blesses your sensual nature today. Indulge in beauty, comfort, and the finer things in life while maintaining your practical wisdom.",
    "Your steady determination is your greatest asset today. Patience and persistence will bring the security and stability you seek."
  ],
  gemini: [
    "Today you are feeling mentally agile and socially vibrant. Your quick wit and communication skills open doors to exciting new connections.",
    "Mercury enhances your natural curiosity today. Embrace learning opportunities and share your knowledge with others who can benefit from your insights.",
    "Your adaptability is your superpower today. Flow with changing circumstances and discover unexpected opportunities for growth."
  ],
  cancer: [
    "Today you are feeling deeply intuitive and emotionally wise. Trust your inner voice to guide you toward nurturing relationships and meaningful connections.",
    "The Moon illuminates your compassionate heart today. Create a sanctuary of comfort for yourself and those you love.",
    "Your emotional intelligence shines today. Use your natural empathy to heal and support others while honoring your own needs for security."
  ],
  leo: [
    "Today you are feeling radiant and ready to shine your light on the world. Your natural charisma attracts positive opportunities and admiring attention.",
    "The Sun magnifies your creative powers today. Express yourself authentically and inspire others with your generous spirit and warm heart.",
    "Your dramatic flair serves you well today. Take center stage in areas that matter to you and let your confidence lead the way."
  ],
  virgo: [
    "Today you are feeling methodical and perfectly aligned with productive energy. Your attention to detail reveals important insights that others miss.",
    "Mercury sharpens your analytical mind today. Use your practical wisdom to solve problems and improve systems in your daily life.",
    "Your service-oriented nature brings fulfillment today. Help others while maintaining healthy boundaries and self-care practices."
  ],
  libra: [
    "Today you are feeling harmonious and naturally drawn to beauty in all its forms. Your diplomatic skills help restore balance in challenging situations.",
    "Venus enhances your charm and social grace today. Build bridges between different perspectives and create win-win solutions.",
    "Your aesthetic sense is heightened today. Surround yourself with beauty and create environments that reflect your refined taste."
  ],
  scorpio: [
    "Today you are feeling intensely focused and ready to transform any obstacles into opportunities. Your depth of perception reveals hidden truths.",
    "Pluto empowers your investigative nature today. Dig beneath the surface to uncover the valuable insights that lead to meaningful change.",
    "Your magnetic presence draws authentic connections today. Trust your ability to see through superficiality to the heart of matters."
  ],
  sagittarius: [
    "Today you are feeling adventurous and philosophically inspired. Your optimistic outlook attracts exciting opportunities for expansion and growth.",
    "Jupiter expands your horizons today. Embrace new learning experiences and share your wisdom with those ready to receive it.",
    "Your freedom-loving spirit guides you today. Explore new territories, whether physical, mental, or spiritual, with confidence and joy."
  ],
  capricorn: [
    "Today you are feeling ambitious and structurally sound in your approach to goals. Your disciplined nature builds the success you've been working toward.",
    "Saturn rewards your patience and hard work today. Take practical steps toward long-term objectives with confidence in your abilities.",
    "Your leadership skills are recognized today. Use your natural authority to guide projects and people toward meaningful achievements."
  ],
  aquarius: [
    "Today you are feeling innovatively inspired and connected to the collective consciousness. Your unique perspective offers solutions others haven't considered.",
    "Uranus sparks your revolutionary spirit today. Embrace your individuality and use your originality to benefit your community.",
    "Your humanitarian instincts are activated today. Work toward causes that uplift humanity while honoring your need for intellectual freedom."
  ],
  pisces: [
    "Today you are feeling deeply intuitive and artistically inspired. Your compassionate nature creates healing energy for yourself and others.",
    "Neptune enhances your psychic sensitivity today. Trust your dreams and subtle impressions to guide you toward spiritual understanding.",
    "Your empathetic heart is your gift to the world today. Use your emotional depth to create beauty and bring comfort to those in need."
  ]
});

function getRandomDailyInterpretation(sign: string): string {
  const interpretations = getDailyInterpretations();
  const signInterpretations = interpretations[sign.toLowerCase()] || interpretations['aries'];
  const randomIndex = Math.floor(Math.random() * signInterpretations.length);
  return signInterpretations[randomIndex];
}

function callPythonScript(action: string, data: object): Promise<HoroscopeResult> {
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
    const body: HoroscopeRequest = await request.json();
    
    // Validate input
    if (!body.birthData) {
      return NextResponse.json(
        { success: false, error: "Birth data is required" },
        { status: 400 }
      );
    }

    // Convert birth data to proper format for Python script
    const birthDate = new Date(body.birthData.date || body.birthData.birthDate);
    const birthData = {
      name: body.birthData.name || 'User',
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
      hour: birthDate.getHours(),
      minute: birthDate.getMinutes(),
      city: body.birthData.city,
      country: body.birthData.country || ""
    };

    // Call Python script for sun sign calculation
    const horoscopeResult = await callPythonScript('birth_chart', birthData);

    if (!horoscopeResult.success || !horoscopeResult.data) {
      // Fallback to data temporarily unavailable
      return NextResponse.json({
        success: true,
        data: {
          sign: "Horoscope temporarily unavailable",
          degrees: 0,
          daily: "Our astrological calculation service is currently offline. We use authentic astronomical calculations with Swiss Ephemeris data to determine your real sun sign and provide personalized insights. Please try again in a few moments.",
          isUnavailable: true
        }
      });
    }

    // Extract sun sign and degrees from Python response
    const sunSign = horoscopeResult.data.sun_sign;
    const sunDegrees = horoscopeResult.data.sun_degrees;

    // Generate daily interpretation based on real sun sign
    const dailyInterpretation = getRandomDailyInterpretation(sunSign);

    const horoscopeData: HoroscopeData = {
      sign: sunSign,
      degrees: sunDegrees,
      daily: dailyInterpretation
    };

    return NextResponse.json({
      success: true,
      data: horoscopeData
    });

  } catch (error) {
    console.error('Horoscope API error:', error);
    
    // Fail-safe fallback
    return NextResponse.json({
      success: true,
      data: {
        sign: "Horoscope temporarily unavailable", 
        degrees: 0,
        daily: "We're currently experiencing technical difficulties with our astrological calculation service. Please try again in a few moments.",
        isUnavailable: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}