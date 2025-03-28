import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeng/themes/material';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { kibanApiKeyInterceptor } from './interceptors/kiban-api-key.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(withFetch(), withInterceptors([kibanApiKeyInterceptor])),
    providePrimeNG({
      theme: {
        preset: Material,
        options: {
          darkModeSelector: false,
          // cssLayer: {
          //   name: 'primeng',
          //   order: 'tailwind, primeng'
          // }
        }
      }
    })
  ]

};
