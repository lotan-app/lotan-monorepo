import { Service } from 'typedi';
import { Agent } from '../databases/mongodb/models/Agent';
import { AgentModel } from '../databases/mongodb/models/models';
import { IPaginateResult } from '../libs/types/IPaginateResult';
import { getSkip } from '../libs/utils/getSkip';

@Service()
export class AgentRepository {
  async getAgents(query: { page: number; size: number }): Promise<IPaginateResult<Agent>> {
    const { page, size } = query;
    const skip = getSkip(page, size);

    const [items, total] = await Promise.all([
      AgentModel.find({}, {}, { lean: true }).sort({ createdAt: -1 }).skip(skip).limit(size),
      AgentModel.countDocuments({}),
    ]);

    return {
      total,
      items,
    };
  }

  async getAgentById(id: string): Promise<Agent> {
    return AgentModel.findOne({ id }, {}, { lean: true });
  }

  async updateAgent(id: string, data: Partial<Agent>) {
    await AgentModel.findOneAndUpdate(
      { id },
      {
        $set: {
          ...data,
        },
      },
      { upsert: true },
    );
  }

  async getAllAgents(): Promise<Agent[]> {
    return AgentModel.find({}, {}, { lean: true });
  }
}
