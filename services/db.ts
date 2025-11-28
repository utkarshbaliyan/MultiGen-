import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { User, HistoryItem, ToolType } from '../types';

interface MultiGenDB extends DBSchema {
  users: {
    key: string;
    value: User & { password?: string; isGoogle?: boolean };
    indexes: { 'by-email': string };
  };
  history: {
    key: string;
    value: HistoryItem & { userId: string; toolType: ToolType };
    indexes: { 'by-user': string };
  };
}

const DB_NAME = 'MultiGenDB';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<MultiGenDB>> => {
  return openDB<MultiGenDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }
      // History store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('by-user', 'userId');
      }
    },
  });
};

export const dbService = {
    async getUser(email: string) {
        const db = await initDB();
        return db.getFromIndex('users', 'by-email', email);
    },
    async addUser(user: User & { password?: string; isGoogle?: boolean }) {
        const db = await initDB();
        return db.add('users', user);
    },
    async addHistoryItem(userId: string, toolType: ToolType, item: HistoryItem) {
        const db = await initDB();
        const dbItem = {
            ...item,
            userId,
            toolType
        };
        return db.add('history', dbItem);
    },
    async getUserHistory(userId: string) {
        const db = await initDB();
        return db.getAllFromIndex('history', 'by-user', userId);
    }
};