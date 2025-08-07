import fs from 'fs';
import path from 'path';

class MemoryLogger {
  private logDirectory: string;

  constructor(logDirectory: string = './logs') {
    this.logDirectory = logDirectory;
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }
  }

  log(message: string): void {
    const date = new Date();
    const filename = `${date.toISOString().split('T')[0]}.log`;
    const logMessage = `[${date.toISOString()}] LOG: ${message}\n`;
    const filePath = path.join(this.logDirectory, filename);
    fs.appendFileSync(filePath, logMessage);
  }

  info(message: string): void {
    const date = new Date();
    const filename = `${date.toISOString().split('T')[0]}.log`;
    const logMessage = `[${date.toISOString()}] INFO: ${message}\n`;
    const filePath = path.join(this.logDirectory, filename);
    fs.appendFileSync(filePath, logMessage);
  }

  error(message: string): void {
    const date = new Date();
    const filename = `${date.toISOString().split('T')[0]}.log`;
    const logMessage = `[${date.toISOString()}] ERROR: ${message}\n`;
    const filePath = path.join(this.logDirectory, filename);
    fs.appendFileSync(filePath, logMessage);
  }
}

export const logger = new MemoryLogger();
