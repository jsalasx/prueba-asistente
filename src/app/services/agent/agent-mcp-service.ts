import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface AskRequest {
  question: string;
  userId: string;
  language: string;
}

export interface AskResponse {
  answer: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentMcpService {
  
  private apiUrl = environment.apiUrlAgent + '/api/v1/agent-mcp-rest/ask';
  private apiKey = environment.apiKey

  constructor(private http: HttpClient) {}

  ask(request: AskRequest) {
    return this.http.post<AskResponse>(this.apiUrl, request, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
    });
  }

}
