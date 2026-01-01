import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ViewItem } from '../components/chat/chat.component';
import { AgentMcpService } from '../services/agent/agent-mcp-service';
import { UserStateService } from '../services/state/user-state-service';
import { SpeechToTextService } from '../services/stt/speech-to-text-service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  userInput: string = '';
  isLoading: boolean = false;

  userId: string = '';
  languagePlace: string = '';
  preguntasParaIaPorDefecto: string[] = [];
  labelAdmin: string = '';
  labelAssistant: string = '';
  labelWaitingResponse: string = '';
  transcribedText: string = '';
  isListening: boolean = false;
  isSpeechAvailable: boolean = false;
  silenceRemainingMs = 0;
  silenceProgress = 0; // 0..1
  isFetchingTranslatedText: boolean = false;
  private ringRadius = 52;

  private subscription?: Subscription;
  private textSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private errorSubscription?: Subscription;
  private finishedSpeakingSubscription?: Subscription;
  private silenceSub?: Subscription;
  private silenceProgSub?: Subscription;

  private userSubscription?: Subscription;
  private placeSubscription?: Subscription;

  constructor(
    private translate: TranslateService,
    private agentMcpService: AgentMcpService,
    private speechService: SpeechToTextService,
    private userStateService: UserStateService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  get ringCircumference(): number {
    return 2 * Math.PI * this.ringRadius;
  }

  get ringDashOffset(): number {
    const progress = Math.min(1, Math.max(0, this.silenceProgress)); // 0..1
    return this.ringCircumference * (1 - progress);
  }

  async ngOnInit(): Promise<void> {
    this.userId = this.userStateService.getUserId() || '';
    this.languagePlace = this.userStateService.getPlaceData()?.lenguaje || 'es';
    this.translate.use(this.languagePlace || 'es');
    this.cargarPreguntas();
    this.userSubscription = this.userStateService.userData$.subscribe(
      (userData) => {
        if (userData) {
          this.userId = userData.userId;
        }
      }
    );

    this.placeSubscription = this.userStateService.placeData$.subscribe(
      (placeData) => {
        if (placeData) {
          this.languagePlace = placeData.lenguaje || 'es';
        }
      }
    );

    this.subscription = this.translate.onLangChange.subscribe(() => {
      this.cargarPreguntas();
    });

    this.isSpeechAvailable = this.speechService.isAvailable();

    this.speechService.setSilenceDelay(3000);

    // Suscribirse al texto
    this.textSubscription = this.speechService.getText().subscribe((text) => {
      this.transcribedText = text;
      this.userInput = text; // Actualizar el input
    });

    // Suscribirse al estado
    this.statusSubscription = this.speechService
      .getStatus()
      .subscribe((status) => {
        this.isListening = status;
      });

    // Suscribirse a errores
    this.errorSubscription = this.speechService
      .getErrors()
      .subscribe((error) => {
        console.error('Error de voz:', error);
        alert(`Error: ${error}`);
      });

    this.finishedSpeakingSubscription = this.speechService
      .getFinishedSpeaking()
      .subscribe((finalText) => {
        this.zone.run(() => {
          console.log('Usuario terminó de hablar:', finalText);

          this.transcribedText = finalText;

          this.isListening = false;

          // O mostrar una notificación visual
          this.mostrarIndicadorTextoCompleto();

          setTimeout(() => this.submitText(finalText), 0);
        });
      });

    this.silenceSub = this.speechService
      .getSilenceRemainingMs()
      .subscribe((ms) => {
        this.silenceRemainingMs = ms;
        this.cdr.detectChanges();
      });

    this.silenceProgSub = this.speechService
      .getSilenceProgress()
      .subscribe((p) => {
        this.silenceProgress = p;
        this.cdr.detectChanges();
      });
  }

  private cargarPreguntas() {
    this.isFetchingTranslatedText = true;
    this.translate
      .get([
        'ASISTANT_TAB_MAIN.IA_QUICK_LINK_1',
        'ASISTANT_TAB_MAIN.IA_QUICK_LINK_2',
        'ASISTANT_TAB_MAIN.IA_QUICK_LINK_3',
        'ASISTANT_TAB_MAIN.IA_QUICK_LINK_4',
        'ASISTANT_TAB_MAIN.IA_QUICK_LINK_5',
        'ASISTANT_TAB_MAIN.IA_QUICK_LINK_6',
        'ASISTANT_TAB_MAIN.LABEL_MSG_ADMINISTRATOR',
        'ASISTANT_TAB_MAIN.LABEL_MSG_ASSISTANT',
        'WAITING_FOR_RESPONSE',
      ])
      .subscribe((t) => {
        this.preguntasParaIaPorDefecto = [
          t['ASISTANT_TAB_MAIN.IA_QUICK_LINK_1'],
          t['ASISTANT_TAB_MAIN.IA_QUICK_LINK_2'],
          t['ASISTANT_TAB_MAIN.IA_QUICK_LINK_3'],
          t['ASISTANT_TAB_MAIN.IA_QUICK_LINK_4'],
          t['ASISTANT_TAB_MAIN.IA_QUICK_LINK_5'],
          t['ASISTANT_TAB_MAIN.IA_QUICK_LINK_6'],
        ];

        this.labelAdmin = t['ASISTANT_TAB_MAIN.LABEL_MSG_ADMINISTRATOR'];
        this.labelAssistant = t['ASISTANT_TAB_MAIN.LABEL_MSG_ASSISTANT'];
        this.labelWaitingResponse = t['WAITING_FOR_RESPONSE'];

        this.isFetchingTranslatedText = false;
        this.cdr.detectChanges();
      });
  }
  toggleListening() {
    if (this.isListening) {
      this.speechService.stopListening();
    } else {
      this.transcribedText = '';
      this.userInput = '';
      this.speechService.startListening(this.translate.getCurrentLang()); // o 'en-US' para inglés
    }
  }

  // Método opcional para indicar visualmente que el texto está completo
  private mostrarIndicadorTextoCompleto() {
    // Puedes agregar una animación, cambio de color, o cualquier feedback visual
    console.log('✓ Texto completo capturado');

    // Ejemplo: agregar un efecto visual temporal
    // this.textoCompleto = true;
    // setTimeout(() => this.textoCompleto = false, 1000);
  }

  ngOnDestroy() {
    // Limpiar suscripción
    this.subscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.placeSubscription?.unsubscribe();
    this.textSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
    this.finishedSpeakingSubscription?.unsubscribe();
    this.silenceSub?.unsubscribe();
    this.silenceProgSub?.unsubscribe();
  }

  messages: ViewItem[] = [];

  onSuggestionClick(pregunta: string) {
    console.log('Pregunta seleccionada:', pregunta);
    // Aquí puedes manejar la lógica cuando se hace clic
    this.userInput = pregunta;
    this.onSubmit();
  }

  onSubmit() {
    this.isLoading = true;

    if (
      this.userId === undefined ||
      this.userId === null ||
      this.userId.trim() === ''
    ) {
      console.error('User ID no está definido.');
      alert('Error: User ID no está definido.');
      this.isLoading = false;
      return;
    }

    if (this.userInput.trim()) {
      console.log('Mensaje:', this.userInput);

      if (this.isListening) {
        this.speechService.stopListening();
      }
      this.enviarMensaje(this.userInput);
      const textoInput = this.userInput;
      this.messages = [
        ...this.messages,
        {
          type: 'user',
          key: this.userId,
          message: textoInput,
          time: new Date().toISOString(),
          title: this.labelAdmin,
        },
        {
          type: 'assistant',
          key: this.userId + '_resp',
          message: this.labelWaitingResponse,
          time: new Date().toISOString(),
          title: this.labelAssistant,
          isLoading: true,
        },
      ];
      this.userInput = ''; // Limpiar
      this.isListening = false;
    } else {
      this.isLoading = false;
    }
  }
  enviarMensaje(mensaje: string) {
    // Tu lógica
    console.log('Enviando mensaje:', mensaje);
    this.agentMcpService
      .ask({
        question: mensaje,
        userId: this.userId,
        language: this.languagePlace,
      })
      .subscribe({
        next: (response) => {
          console.log('Respuesta de la IA:', response.answer);
          const msgFiltered = this.messages.filter(
            (msg) => !(msg.type === 'assistant' && msg.isLoading)
          );
          this.messages = [
            ...msgFiltered,
            {
              type: 'assistant',
              key: this.userId + '_resp_' + Date.now(),
              message: response.answer,
              time: new Date().toISOString(),
              title: this.labelAssistant,
              isLoading: false,
            },
          ];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al comunicarse con la IA:', error);
          this.isLoading = false;
        },
      });
  }

  submitText(text: string) {
    const message = (text || '').trim();
    if (!message) return;

    this.isLoading = true;

    if (!this.userId?.trim()) {
      this.isLoading = false;
      return;
    }

    this.enviarMensaje(message);

    this.messages = [
      ...this.messages,
      {
        type: 'user',
        key: this.userId,
        message,
        time: new Date().toISOString(),
        title: this.labelAdmin,
      },
      {
        type: 'assistant',
        key: this.userId + '_resp',
        message: this.labelWaitingResponse,
        time: new Date().toISOString(),
        title: this.labelAssistant,
        isLoading: true,
      },
    ];

    this.userInput = '';
    this.isListening = false;
  }
}
