import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Tab2Page } from './tab2.page';

import { TranslateModule } from '@ngx-translate/core';
import { ChatComponent } from '../components/chat/chat.component';
import { SuggestionCardComponent } from '../components/suggestion-card/suggestion-card.component';
import { FormatMarkdownPipe } from '../pipes/format-markdown-pipe';
import { Tab2PageRoutingModule } from './tab2-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab2PageRoutingModule,
    TranslateModule,  
    SuggestionCardComponent,
    FormatMarkdownPipe
  ],
  declarations: [Tab2Page, ChatComponent,  ]
})
export class Tab2PageModule {}
