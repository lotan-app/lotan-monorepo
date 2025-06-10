import { Service } from 'typedi';
import { SubgraphRepository } from '../repositories/SubgraphRepository';
import { Subgraph } from '../databases/mongodb/models/Subgraph';
import { genId } from '../libs/utils/genId';
import { genApiKey } from '../libs/utils/genApiKey';

@Service()
export class SubgraphService {
  constructor(private readonly subgraphRepo: SubgraphRepository) {}

  async createSubgraph(data: { name: string }): Promise<Subgraph> {
    const id = genId();
    const apiKey = genApiKey();

    const { name } = data;

    const doc = await this.subgraphRepo.createSubgraph({
      id,
      name,
      apiKey,
    });

    return doc;
  }

  async getSubgraphs(query: { page: number; size: number }) {
    return this.subgraphRepo.getSubgraphs(query);
  }
}
