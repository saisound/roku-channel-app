import localForage from "localforage";
import memoryStorageDriver from 'localforage-memoryStorageDriver';

// CHANGED FROM ORIGINAL: add memoryStorageDriver to localForage as fallback for private browsing (Figma plugin)
// one more change below vs. original: https://gitlab.eng.roku.com/UX/uxe-kit/-/blob/main/packages/rk-streaming-data-api/src/module/Cache.js
localForage.defineDriver(memoryStorageDriver)
localForage.config({ driver: [localForage.INDEXEDDB, localForage.WEBSQL, localForage.LOCALSTORAGE, memoryStorageDriver._driver] });

const cache = new Map();

export default class Cache {
  static async setItem(key, data) {
    try {
      cache.set(key, data);
      await localForage.setItem(key, { createdOn: new Date(), data });
      return true;
    } catch (ex) {
      return false;
    }
  }
  static async getItem(key) {
    let result = null;
    if (cache.has(key)) {
      result = cache.get(key);
    } else {
      let value = await localForage.getItem(key);
      if (value && value.data) {
        cache.set(key, value.data);
        result = value.data;
      }
    }
    return result;
  }
  static async removeItem(key) {
    await localForage.removeItem(key);
    return cache.delete(key);
  }
  static async clearAll() {
    try {
      await localForage.clear();
      cache.clear();
      return true;
    } catch (ex) {
      return false;
    }
  }
  static async exists(key) {
    let result = false;
    if (cache.has(key)) {
      result = true;
    } else {
      const value = await localForage.getItem(key);
      // CHANGED FROM ORIGINAL: because the memoryStorageDriver returns undefined instead of null
      result = value !== null && value !== undefined;
    }
    return result;
  }
  static async cleanupOldRecords() {
    try {
      const today = new Date();
      today.setMonth(today.getMonth() - 1);
      const lastMonth = today;
      const keys = await localForage.keys();
      for (const key of keys) {
        const value = await localForage.getItem(key);
        if (value.createdOn < lastMonth) {
          await localForage.removeItem(key);
        }
      }
      return true;
    } catch (ex) {
      return false;
    }
  }
}

// Cleanup when the script loads.
Cache.cleanupOldRecords();
