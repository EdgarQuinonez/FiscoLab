import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  curp: string | null

  constructor(private storageService: StorageService) {
    this.curp = this.storageService.getItem("curp")
  }
  
  
  
  getFormState(formId: string) {
    // retrieve it from local storage or database using CURP and formId
    if (!this.curp) {
      console.error("No curp stored in localStorage.")
      return
    }

    // TODO: call to backend API to retrieve the obj with the form state for the curp and form id selected


  }

  setFormState(formId: string) {
    // TODO: POST to backend API to set the formState.

  }
}
