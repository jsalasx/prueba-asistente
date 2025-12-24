import { TestBed } from '@angular/core/testing';

import { AgentMcpService } from './agent-mcp-service';

describe('AgentMcpService', () => {
  let service: AgentMcpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentMcpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
