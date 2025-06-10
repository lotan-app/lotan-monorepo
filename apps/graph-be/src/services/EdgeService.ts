import { Service } from 'typedi';
import { Edge } from '../databases/mongodb/models/Edge';
import { BusinessLogicError } from '../errors/BusinessLogicError';
import { ErrorCode } from '../errors/ErrorCode';
import { CreateEdgeBody } from '../libs/dto/CreateEdgeBody';
import { genId } from '../libs/utils/genId';
import { EdgeRepository } from '../repositories/EdgeRepository';

@Service()
export class EdgeService {
  constructor(private readonly edgeRepo: EdgeRepository) {}

  async createEdge(data: CreateEdgeBody): Promise<Edge> {
    const id = genId();
    const { agentId, port, subgraphId, limitCpu, limitMem } = data;

    //check subgraphId exists

    //check agentId exists

    //check totalMem

    //check port exists

    const existEdge = await this.edgeRepo.getEdgeByPort(agentId, port);

    if (existEdge) {
      throw new BusinessLogicError(ErrorCode.PORT_IS_ALREADY_USED);
    }

    const edge = await this.edgeRepo.createEdge({ id, agentId, port, subgraphId, limitCpu, limitMem });

    return edge;
  }

  getEdges(query: { agentId: string; page: number; size: number }) {
    return this.edgeRepo.getEdges(query);
  }
}
