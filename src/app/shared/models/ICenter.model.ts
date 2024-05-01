import { ICity } from './ICity.model';

export interface ICenter {
  id: number;
  name: string;
  address: string;
  arabicAddress: string;
  arabicName: string;
  cityId: number;
  englishAddress: string;
  englishName: string;
  longitude: number;
  latitude: number;
  locationImage: string;
  cityViewModel: ICity;
}
