import { getModelForClass } from '@typegoose/typegoose';
import { Agent } from './Agent';
import { Edge } from './Edge';
import { Subgraph } from './Subgraph';

export const SubgraphModel = getModelForClass(Subgraph, { schemaOptions: { collection: 'subgraphs' } });
export const AgentModel = getModelForClass(Agent, { schemaOptions: { collection: 'agents' } });
export const EdgeModel = getModelForClass(Edge, { schemaOptions: { collection: 'edges' } });
