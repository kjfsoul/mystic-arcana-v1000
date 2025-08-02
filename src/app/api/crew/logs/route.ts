// API Route for CrewAI Operation Logs
// Provides access to crew execution history and monitoring
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const operationId = searchParams.get('operationId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'operations'; // 'operations' or 'memory'
    if (type === 'memory') {
      return await getMemoryLogs(limit);
    }
    if (operationId) {
      return await getSpecificOperation(operationId);
    }
    return await getRecentOperations(limit);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
async function getSpecificOperation(operationId: string) {
  try {
    const logDir = path.join(process.cwd(), 'crew_memory_logs');
    const logFile = path.join(logDir, `${operationId}.json`);
    
    const logData = await fs.readFile(logFile, 'utf-8');
    const operation = JSON.parse(logData);
    return NextResponse.json({
      success: true,
      operation,
      metadata: {
        operationId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json(
        {
          success: false,
          error: `Operation log not found: ${operationId}`
        },
        { status: 404 }
      );
    }
    throw error;
  }
}
async function getRecentOperations(limit: number) {
  try {
    const logDir = path.join(process.cwd(), 'crew_memory_logs');
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
    const files = await fs.readdir(logDir);
    const operationFiles = files.filter(f => f.endsWith('.json'));
    // Sort by creation time (newest first)
    const operations = await Promise.allSettled(
      operationFiles
        .slice(0, limit)
        .map(async (file) => {
          const filePath = path.join(logDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(data);
        })
    );
    const validOperations = operations
      .filter(op => op.status === 'fulfilled')
      .map(op => (op as PromiseFulfilledResult<any>).value)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return NextResponse.json({
      success: true,
      operations: validOperations,
      metadata: {
        totalFound: operationFiles.length,
        returned: validOperations.length,
        limit,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      operations: [],
      metadata: {
        totalFound: 0,
        returned: 0,
        limit,
        note: 'No operations found - this is normal for a new system',
        timestamp: new Date().toISOString()
      }
    });
  }
}
async function getMemoryLogs(limit: number) {
  try {
    const memLogFile = path.join(process.cwd(), 'A-mem', 'crew-operations.log');
    
    try {
      const logData = await fs.readFile(memLogFile, 'utf-8');
      const lines = logData.trim().split('\n');
      const recentLines = lines.slice(-limit);
      
      const logs = recentLines
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            return { rawLine: line, parseError: true };
          }
        })
        .reverse(); // Most recent first
      return NextResponse.json({
        success: true,
        logs,
        metadata: {
          totalLines: lines.length,
          returned: logs.length,
          limit,
          logFile: memLogFile,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        logs: [],
        metadata: {
          totalLines: 0,
          returned: 0,
          limit,
          note: 'No memory logs found - this is normal for a new system',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    throw error;
  }
}
// DELETE endpoint to clean up old logs
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const olderThan = searchParams.get('olderThan'); // ISO date string
    const confirm = searchParams.get('confirm') === 'true';
    if (!confirm) {
      return NextResponse.json(
        {
          success: false,
          error: 'Add ?confirm=true to confirm log deletion'
        },
        { status: 400 }
      );
    }
    const logDir = path.join(process.cwd(), 'crew_memory_logs');
    const files = await fs.readdir(logDir);
    const operationFiles = files.filter(f => f.endsWith('.json'));
    let deletedCount = 0;
    const cutoffDate = olderThan ? new Date(olderThan) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago default
    for (const file of operationFiles) {
      const filePath = path.join(logDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }
    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} operation logs older than ${cutoffDate.toISOString()}`,
      deletedCount,
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
