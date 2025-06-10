import { Service } from 'typedi';
import { Edge } from '../databases/mongodb/models/Edge';
import { EdgeModel } from '../databases/mongodb/models/models';
import { IPaginateResult } from '../libs/types/IPaginateResult';
import { getSkip } from '../libs/utils/getSkip';

@Service()
export class EdgeRepository {
  async getEdges(query: { agentId: string; page: number; size: number }): Promise<IPaginateResult<Edge>> {
    const { page, size } = query;
    const skip = getSkip(page, size);

    const [items, total] = await Promise.all([
      EdgeModel.find({ agentId: query.agentId }, {}, { lean: true }).sort({ createdAt: -1 }).skip(skip).limit(size),
      EdgeModel.countDocuments({ agentId: query.agentId }),
    ]);

    return {
      total,
      items,
    };
  }

  async getEdgeById(id: string): Promise<Edge | null> {
    return EdgeModel.findOne({ id }, {}, { lean: true });
  }

  async createEdge(data: Partial<Edge>) {
    const doc = await EdgeModel.create(data);

    return doc.toObject();
  }

  async updateEdgeById(data: Partial<Edge>): Promise<Edge> {
    const {
      id,
      subgraphId,
      subgraphUrl,
      port,
      deployState,
      agentId,
      containerId,
      containerName,
      apiPath,
      limitMem,
      limitCpu,
      logs,
      errorLogs,
      state,
    } = data;
    return EdgeModel.findOneAndUpdate(
      { id },
      {
        $set: {
          subgraphId,
          subgraphUrl,
          agentId,
          port,
          containerId,
          deployState,
          containerName,
          apiPath,
          limitMem,
          limitCpu,
          logs,
          errorLogs,
          'state.status': state?.status,
          'state.running': state?.running,
          'state.paused': state?.paused,
          'state.restarting': state?.restarting,
          'state.dead': state?.dead,
        },
      },
      { new: true, lean: true },
    );
  }

  async getEdgeByPort(agentId: string, port: number): Promise<Edge> {
    return EdgeModel.findOne({ agentId, port }, {}, { lean: true });
  }

  async getAllPortByAgent(agentId: string): Promise<number[]> {
    const edges = await EdgeModel.find({ agentId }, { port: 1 }, { lean: true, sort: { port: 1 } });

    return edges.map(edge => edge.port);
  }

  async getLatestVersionEdgeBySubgraphId(subgraphId: string): Promise<Edge> {
    return EdgeModel.findOne({ subgraphId }, {}, { lean: true, sort: { deployVersion: -1 } });
  }
}
