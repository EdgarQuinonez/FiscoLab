import { Injectable } from '@angular/core';
import {
  StorageKey,
  StorageValueType,
  LOCAL_STORAGE_KEYS,
} from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // TODO: Use DB in Backend instead on production
  constructor() {}

  getItem(itemKey: string) {
    return localStorage.getItem(itemKey);
  }

  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  // retrieves parsed json, string or null from localStorage.
  getItemValue<T extends StorageKey>(key: T): StorageValueType<T> | null {
    const storageKey = LOCAL_STORAGE_KEYS[key];
    const value = this.getItem(storageKey.key);

    if (value === null) return null;

    return storageKey.isJSON ? JSON.parse(value) : value;
  }

  // Helper method to set item with proper type handling
  setItemValue<T extends StorageKey>(key: T, value: StorageValueType<T>): void {
    const storageKey = LOCAL_STORAGE_KEYS[key];
    const valueToStore = storageKey.isJSON
      ? JSON.stringify(value)
      : (value as string);

    this.setItem(storageKey.key, valueToStore);
  }
}
