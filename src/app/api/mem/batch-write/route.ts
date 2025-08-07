import { NextRequest, NextResponse } from 'next/server';
import { createClient as _createClient } from '@/lib/supabase/server';
import { MemoryLogEntry } from '@/types/UserInteraction';

export async function POST(request: NextRequest) {
  try {
    const supabase = await _createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { entries } = await request.json() as { entries: MemoryLogEntry[] };

    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Store to database for persistence
    const memoryRecords = entries.map(entry => ({
      user_id: user.id,
      key: entry.key,
      value: entry.value,
      namespace: entry.namespace,
      session_id: entry.sessionId,
      ttl: entry.ttl || 2592000, // Default 30 days
      created_at: entry.timestamp || new Date().toISOString()
    }));

    // Check if memory_logs table exists, if not use a fallback
    const { error: insertError } = await supabase
      .from('memory_logs')
      .insert(memoryRecords);

    if (insertError) {
      // Fallback to event_logs table if memory_logs doesn't exist
      console.warn('memory_logs table not found, using event_logs fallback');
      
      const eventRecords = entries.map(entry => ({
        user_id: user.id,
        event_type: `memory_${entry.namespace}`,
        metadata: {
          key: entry.key,
          value: entry.value,
          session_id: entry.sessionId,
          ttl: entry.ttl
        },
        created_at: entry.timestamp || new Date().toISOString()
      }));

      const { error: fallbackError } = await supabase
        .from('event_logs')
        .insert(eventRecords);

      if (fallbackError) {
        console.error('Failed to store memory logs:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to store memory logs' },
          { status: 500 }
        );
      }
    }

    // Also attempt to send to Supermemory MCP if available
    if (process.env.SUPERMEMORY_MCP_URL) {
      try {
        const mcpUrl = process.env.SUPERMEMORY_MCP_URL;
        
        for (const entry of entries) {
          await fetch(`${mcpUrl}/record`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: user.id,
              entryType: entry.namespace,
              data: entry.value,
              synthesisPrompt: `Memory entry from ${entry.namespace}`
            })
          }).catch(err => {
            console.warn('Supermemory MCP not available:', err.message);
          });
        }
      } catch (mcpError) {
        console.warn('Failed to sync with Supermemory MCP:', mcpError);
        // Don't fail the request if MCP is unavailable
      }
    }

    return NextResponse.json({
      success: true,
      count: entries.length,
      message: 'Memory entries stored successfully'
    });

  } catch (error) {
    console.error('Error in batch-write endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}