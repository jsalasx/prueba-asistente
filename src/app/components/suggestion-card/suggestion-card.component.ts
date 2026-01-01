import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-suggestion-card',
  templateUrl: './suggestion-card.component.html',
  styleUrls: ['./suggestion-card.component.scss'],
})
export class SuggestionCardComponent  implements OnInit {

  @Input() text: string = '';
  @Input() textSize: string = 'text-base'; // Tamaños Tailwind: text-sm, text-base, text-lg, text-xl, etc.
  @Input() textColor: string = 'text-gray-800';
  @Input() bgColor: string = 'bg-white';
  @Input() hoverBgColor: string = 'hover:bg-gray-50';
  @Input() hoverTextColor: string = 'hover:text-gray-900';
  @Input() borderColor: string = 'border-gray-200';
  @Input() shadow: string = 'shadow-md';
  @Input() rounded: string = 'rounded-2xl'; // rounded-lg, rounded-xl, rounded-2xl, rounded-3xl
  @Input() padding: string = 'p-2';
  @Input() bgDarkColor: string = 'dark:bg-gray-800';
  @Input() darkTextColor: string = 'dark:text-gray-200';

  @Output() cardClick = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {}

  onClick() {
    this.cardClick.emit(this.text);
  }
}
