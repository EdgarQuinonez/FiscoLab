import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // TODO: Use DB in Backend instead on production
  constructor() { }

  getItem(itemKey: string){
    return localStorage.getItem(itemKey)
  }

  setItem(key: string, value: string) {
    localStorage.setItem(key, value)    
  }

  removeItem(key: string) {
    localStorage.removeItem(key)
  }
}
