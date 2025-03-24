import { FormGroup, FormArray } from '@angular/forms';

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
