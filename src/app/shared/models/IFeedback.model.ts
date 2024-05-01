import { IFeedbackElement } from './IFeedbackElement.model';

export interface IFeedback {
  id: number;
  userId: string;
  feedbackFormId: number;
  feedbackForTypeId: number;
  parentId: number;
  name: string;
  createdOn: string;
  startOn: string;
  endOn: string;
  isActive: boolean;
  isEnabled: boolean;
  feedbackForTypeViewModel: IFeedbackFormViewModel;
  feedbackFormViewModel: IFeedbackFormViewModel;
}

export interface IFeedbackFormViewModel {
  id: number;
  supportedLanguage: number;
  arabicTitle: string;
  englishTitle: string;
  title: string;
  userId: string;
  createdOn: string;
  feedbackElements: IFeedbackElement[];
}
