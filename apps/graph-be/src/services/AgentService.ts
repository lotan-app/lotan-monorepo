import { Service } from 'typedi';
import { AgentRepository } from '../repositories/AgentRepository';

@Service()
export class AgentService {
  constructor(private readonly agentRepo: AgentRepository) {}

  getAgents(query: { page: number; size: number }) {
    return this.agentRepo.getAgents(query);
  }
}
