import { ICenter } from './ICenter.model';

export interface IHall {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  arabicDescription: string;
  englishDescription: string;
  description: string;
  centerId: number;
  center: ICenter;
  capacity: number;
}
