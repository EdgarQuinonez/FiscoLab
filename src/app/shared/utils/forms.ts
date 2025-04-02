import { FormGroup, FormArray, ValidatorFn } from '@angular/forms';
import isEmpty from 'lodash/isEmpty';

export function updateTreeValidity(
  group: FormGroup | FormArray,
  options?: { emitEvent?: boolean; onlySelf?: boolean }
): void {
  Object.keys(group.controls).forEach((key: string) => {
    const abstractControl = group.get(key);

    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      updateTreeValidity(abstractControl, options);
    } else {
      abstractControl?.updateValueAndValidity(options);
    }
  });
}

export function addTreeValidators(
  group: FormGroup | FormArray,
  validators: ValidatorFn | ValidatorFn[]
) {
  Object.keys(group.controls).forEach((key: string) => {
    const abstractControl = group.get(key);
    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      addTreeValidators(abstractControl, validators);
    } else {
      abstractControl?.addValidators(validators);
    }
  });
}

export function removeTreeValidators(
  group: FormGroup | FormArray,
  validators: ValidatorFn | ValidatorFn[]
) {
  Object.keys(group.controls).forEach((key: string) => {
    const abstractControl = group.get(key);
    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      removeTreeValidators(abstractControl, validators);
    } else {
      abstractControl?.removeValidators(validators);
    }
  });
}

export function checkAllValuesNull(group: Object): boolean {
  // checks for null or empty objects
  if (isEmpty(group)) {
    return true;
  }

  return !Object.values(group).some((value) => {
    let nestedObjResult = false; // initialy set as false (reversed as true in return statement) so it doesn't have any effect by default
    if (typeof value === 'object') {
      nestedObjResult = checkAllValuesNull(value);
    }

    // if nested obj is not null then trigger some() e.g. Object && true === true meaning not null
    return value && !nestedObjResult;
  });
}

export function markAllAsDirty(group: FormGroup | FormArray) {
  Object.keys(group.controls).forEach((key) => {
    const abstractControl = group.get(key);

    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      markAllAsDirty(abstractControl);
    } else {
      abstractControl?.markAsDirty();
    }
  });
}

export function markAllAsPristine(group: FormGroup | FormArray) {
  Object.keys(group.controls).forEach((key) => {
    const abstractControl = group.get(key);

    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      markAllAsPristine(abstractControl);
    } else {
      abstractControl?.markAsPristine();
    }
  });
}

export function disableAll(
  group: FormGroup | FormArray,
  options?: { emitEvent?: boolean; onlySelf?: boolean }
): void {
  Object.keys(group.controls).forEach((key: string) => {
    const abstractControl = group.get(key);

    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      disableAll(abstractControl, options);
    } else {
      console.log('disabled');
      abstractControl?.disable(options);
    }
  });
}

export function enableAll(
  group: FormGroup | FormArray,
  options?: { emitEvent?: boolean; onlySelf?: boolean }
): void {
  Object.keys(group.controls).forEach((key: string) => {
    const abstractControl = group.get(key);

    if (
      abstractControl instanceof FormGroup ||
      abstractControl instanceof FormArray
    ) {
      enableAll(abstractControl, options);
    } else {
      console.log('enabled');
      abstractControl?.enable(options);
    }
  });
}
