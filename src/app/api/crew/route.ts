// API Route for CrewAI Orchestration
// Handles crew task execution and monitoring
import { NextRequest, NextResponse } from 'next/server';
import { crewRunner } from '../../../crew/runner';
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { task, params = {} } = body;
    if (!task) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Task parameter is required',
          availableTasks: [
            'generateCrewTarotDeck',
            'validateExistingDeck', 
            'healthCheck'
          ]
        },
        { status: 400 }
      );
    }
    console.log(`🚀 Starting crew task: ${task}`);
    const result = await crewRunner.runCrew(task, params);
    const duration = Date.now() - startTime;
    console.log(`✅ Crew task completed: ${task} (${duration}ms)`);
    return NextResponse.json({
      success: true,
      result,
      metadata: {
        taskName: task,
        duration,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ Crew task failed: ${errorMessage}`);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        metadata: {
          duration,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}
export async function GET(req: NextRequest) {
  try {
    // Health check endpoint
    const result = await crewRunner.runCrew('healthCheck');
    
    return NextResponse.json({
      success: true,
      status: 'CrewAI orchestration system operational',
      healthCheck: result,
      availableEndpoints: {
        'POST /api/crew': 'Execute crew tasks',
        'GET /api/crew': 'Health check',
        'GET /api/crew/logs': 'View operation logs'
      },
      availableTasks: [
        {
          name: 'generateCrewTarotDeck',
          description: 'Generate complete Crew Tarot Deck with all 78 cards',
          parameters: 'None required'
        },
        {
          name: 'validateExistingDeck',
          description: 'Validate existing deck structure',
          parameters: { cards: 'Array of TarotCardData' }
        },
        {
          name: 'healthCheck',
          description: 'Check system and agent health',
          parameters: 'None required'
        }
      ]
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        status: 'CrewAI orchestration system error'
      },
      { status: 500 }
    );
  }
}
