import { NgModule, provideAppInitializer, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ParseService } from './services/parse/parse-service';
import { ServiceWorkerModule } from '@angular/service-worker';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    TranslateModule.forRoot(), CommonModule, ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: !isDevMode(),
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
})
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideTranslateHttpLoader({
    prefix: './assets/i18n/',
    suffix: '.json'
  }), provideHttpClient(withInterceptorsFromDi()),
  provideAppInitializer(() => {
    const parseService = new ParseService();
    return Promise.resolve();
  })
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
