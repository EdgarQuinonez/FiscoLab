import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { MessageService } from 'primeng/api';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    MessageService
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
