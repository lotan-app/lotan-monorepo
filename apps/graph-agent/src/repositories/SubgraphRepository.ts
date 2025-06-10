import { Service } from 'typedi';
import { SubgraphModel } from '../databases/mongodb/models/models';
import { Subgraph } from '../databases/mongodb/models/Subgraph';
import { IPaginateResult } from '../libs/types/IPaginateResult';
import { getSkip } from '../libs/utils/getSkip';

@Service()
export class SubgraphRepository {
  async getSubgraphByApiKey(apiKey: string): Promise<Subgraph> {
    return SubgraphModel.findOne({ apiKey }, {}, { lean: true });
  }

  async createSubgraph(data: Partial<Subgraph>) {
    const doc = await SubgraphModel.create(data);

    return doc.toObject();
  }

  async updateSubgraph(id: string, data: Partial<Subgraph>): Promise<Subgraph> {
    const doc = await SubgraphModel.findOneAndUpdate({ id }, { $set: { ...data } }, { new: true, lean: true });

    return doc;
  }

  async getSubgraphs(query: { page: number; size: number }): Promise<IPaginateResult<Subgraph>> {
    const { page, size } = query;
    const skip = getSkip(page, size);

    const [items, total] = await Promise.all([
      SubgraphModel.find({}, {}, { lean: true }).sort({ createdAt: -1 }).skip(skip).limit(size),
      SubgraphModel.countDocuments({}),
    ]);

    return {
      total,
      items,
    };
  }

  async getSubgraphById(id: string): Promise<Subgraph> {
    return SubgraphModel.findOne({ id }, {}, { lean: true });
  }
}
