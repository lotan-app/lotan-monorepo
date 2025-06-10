import { AgentRepository } from 'src/repositories/AgentRepository';
import { Service } from 'typedi';
import { env } from '../libs/env';
import { getMemInfo } from '../libs/helpers/getMemInfo';
import { getCPUUsage } from '../libs/helpers/usageCpu';

@Service()
export class AgentService {
  constructor(private readonly agentRepo: AgentRepository) {}

  async updateAgentState() {
    const memInfo = getMemInfo();
    const cpuUsage = await getCPUUsage();

    const data = {
      agentId: env.agentId,
      agentHost: env.agentUrl,
      cpuUsage,
      memLimit: memInfo.total,
      memUsage: memInfo.total - memInfo.free,
      timestamp: Date.now(),
    };

    await this.agentRepo.updateAgent(data.agentId, {
      url: data.agentHost,
      cpuUsage: data.cpuUsage,
      totalMem: data.memLimit,
      memUsage: data.memUsage,
      latestPing: data.timestamp,
    });
  }
}
