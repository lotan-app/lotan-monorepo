import { Service } from 'typedi';
import { Edge } from '../databases/mongodb/models/Edge';
import { EdgeModel } from '../databases/mongodb/models/models';
import { IPaginateResult } from '../libs/types/IPaginateResult';
import { getSkip } from '../libs/utils/getSkip';
import { env } from 'src/libs/env';

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
    const edge = await EdgeModel.findOne({ id }, {}, { lean: true });

    return edge;
  }

  async updateEdgeById(data: Partial<Edge>): Promise<Edge> {
    const {
      id,
      subgraphId,
      subgraphUrl,
      backupDbUrl,
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
          backupDbUrl,
          deployState,
          agentId,
          containerId,
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

  async updateEdgesByIds(data: Partial<Edge>[]) {
    const writer = data.map(item => {
      const {
        id,
        subgraphId,
        subgraphUrl,
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
      } = item;

      return {
        updateOne: {
          filter: { id },
          update: {
            $set: {
              subgraphId,
              subgraphUrl,
              deployState,
              agentId,
              containerId,
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
        },
      };
    });

    await EdgeModel.bulkWrite(writer);
  }

  async getAllEdges(): Promise<Edge[]> {
    return EdgeModel.find({ agentId: env.agentId }, { id: 1, containerId: 1, state: 1 }, { lean: true });
  }
}
