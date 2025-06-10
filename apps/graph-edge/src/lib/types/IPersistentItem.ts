import { ACTION } from '../enums/Action';
import { ID } from './ID';

export interface IPersistentItem {
  entity: string;
  action: ACTION;
  id: ID;
  data: any;
}
