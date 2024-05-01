import { ICity } from './ICity.model';

export interface ITicket {
  id: number;
  userType: string;
  userId?: any;
  user?: any;
  fullName?: any;
  email: string;
  city?: ICity;
  mobile: string;
  title: string;
  body: string;
  ticketCategoryId?: any;
  ticketCategory?: any;
  createdOn: string;
  createdOnString: string;
  ticketStatus: number;
  ticketStatusString: string;
  updatedOn?: any;
  updatedOnString: string;
  updatedNote?: any;
  updatedByUserId?: any;
  updatedByUser?: any;
}
