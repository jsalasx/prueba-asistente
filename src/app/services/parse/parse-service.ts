import { Injectable } from '@angular/core';
import * as Parse from 'parse';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ParseService {

  constructor() {
    this.initializeParse();
  }

  private initializeParse() {
    console.log('Initializing Parse...');
    (Parse as any).serverURL = environment.parseServerUrl; 
    Parse.initialize(
      environment.parseAppId
    );
    console.log('Parse initialized with server URL:', Parse.serverURL);
  }
}
