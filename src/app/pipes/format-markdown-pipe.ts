import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'formatMarkdown',
  standalone: true
})
export class FormatMarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    // Reemplaza **texto** por <b>texto</b>
    const formattedText = value.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Es vital usar el sanitizer porque Angular bloquea HTML por seguridad
    return this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }

}
