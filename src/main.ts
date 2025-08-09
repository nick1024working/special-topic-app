import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import localeZhTw from '@angular/common/locales/zh-Hant';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeZhTw, 'zh-TW');

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
