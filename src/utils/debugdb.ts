// This file contains seting up and using indexedDB for debug mode. In debug mode we are logging all HTTP requests and errors
// so we can download logs later. Using indexed db to user this has access to logs even if application crashes.
import { openDB, DBSchema, IDBPDatabase, deleteDB } from 'idb';
import { downloadString } from './file';

let db: IDBPDatabase<MyDB> | null;

interface MyDB extends DBSchema {
  logs: { key: string; value: string };
}

/**
 * Initialise indexedDB to start logging
 */
async function init() {
  db = await openDB<MyDB>('debugdb', 1, {
    upgrade(db) {
      db.createObjectStore('logs', {
        autoIncrement: true,
      });
    },
  });
  db.add('logs', `[${new Date().toISOString()}] Logging started`);
}

export function startLogging(): void {
  init();
}

/**
 * Remove indexed db when ending logging.
 */
export function endLogging(): void {
  if (db) {
    db.close();
  }
  deleteDB('debugdb', {
    blocked() {
      console.log('blocked?');
    },
  });
  db = null;
}

/**
 * Add new item to indexed db
 */
export function setLogItem(str: string): void {
  if (db) {
    db.add('logs', `[${new Date().toISOString()}] ${str}`);
  }
}

/**
 * Download all logs as text file.
 */
export async function getLogs(): Promise<void> {
  if (db) {
    const all = await db.getAll('logs');
    downloadString(all.join('\n'), 'text/plain', `logs-${new Date().toISOString()}}.txt`);
  }
}
