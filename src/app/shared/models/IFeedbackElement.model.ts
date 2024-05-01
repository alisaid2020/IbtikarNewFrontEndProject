export interface IFeedbackElement {
  id: number;
  feedbackFormId: number;
  feedbackControlTypeId: number;
  supportedLanguage: number;
  questionArabic: string;
  questionEnglish: string;
  question: string;
  isRequired: boolean;
  feedbackControlTypeViewModel: IFeedbackForTypeViewModel;
  feedbackElementValues: IFeedbackElementValue[];
}

export interface IFeedbackElementValue {
  id: number;
  feedbackElementId: number;
  arabicAnswer: string;
  englishAnswer: string;
  answer: string;
}

export interface IFeedbackForTypeViewModel {
  id: number;
  arabicName: string;
  englishName: string;
  name: string;
}
