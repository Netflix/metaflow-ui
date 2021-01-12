// Open the indexedDB.
import { openDB, DBSchema, IDBPDatabase, deleteDB } from 'idb';
import { downloadString } from '../components/LogList/LogActionBar';

let db: IDBPDatabase<MyDB> | null;

interface MyDB extends DBSchema {
  logs: { key: string; value: string };
}

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

export function setLogItem(str: string): void {
  if (db) {
    db.add('logs', `[${new Date().toISOString()}] ${str}`);
  }
}

export async function getLogs(): Promise<void> {
  if (db) {
    const all = await db.getAll('logs');
    downloadString(all.join('\n'), 'text/plain', `logs-${new Date().toISOString()}}.txt`);
  }
}
