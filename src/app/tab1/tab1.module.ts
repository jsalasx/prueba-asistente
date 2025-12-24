import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab1Page } from './tab1.page';

import { SuggestionCardComponent } from '../components/suggestion-card/suggestion-card.component';
import { Tab1PageRoutingModule } from './tab1-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    SuggestionCardComponent,
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}
