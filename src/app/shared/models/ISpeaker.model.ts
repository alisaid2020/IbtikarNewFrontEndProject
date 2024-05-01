import { IUser } from './IUser.model';

export interface ISpeaker {
  id: number;
  description: string;
  rate: number;
  resume: string;
  user: IUser;
}
