import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DateUtils } from 'src/app/utils/date.utils';



export type ViewItem =
  | { type: 'user'; key: string; title?: string; message: string; time: string }
  | { type: 'assistant'; key: string; title?: string; message: string; time: string, isLoading?: boolean };

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: false,
})
export class ChatComponent implements OnInit, OnChanges {

  @Input() messages: ViewItem[] = [];
  today: string = ""
  constructor() { }

  ngOnInit(): void { 
    this.today = DateUtils.formatFechaLargaPorIdiomaLocalStorage(new Date());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages']) {
      // Aquí puedes hacer procesamiento adicional si lo necesitas
      console.log('Mensajes actualizados:', this.messages);
      this.messages = [...this.messages]; // Crear una nueva referencia para detectar cambios
    }
  }

  trackByKey(_: number, item: ViewItem): string {
    return item.key;
  }

  async copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  
}