export interface ICourse {
  id: number;
  arabicName: string;
  englishName: string;
  arabicDescription: string;
  englishDescription: string;
  arabicObjectives: string;
  englishObjectives: string;
  contactInfo: string;
  isHaveCertificate: boolean;
  lunchOn: string;
  courseSpecailityId: number;
  courseSpecailityName: string;
  totalCreditedsHours: number;
  totalDurationsInMinutes: number;
  status: number;
  statusString: string;
  paymentType: number;
  paymentTypeString: string;
  coursePrice: number;
  oldCoursePrice: number;
  totalCourseEnrollments: number;
  totalCourseRates: number;
  totalCourseRatesAverage: number;
  userProgressOnCourse: number;
  englishCourseCoverImage: string;
  arabicCourseCoverImage?: any;
  cityId: number;
  postExamId: number;
  preExamId: number;
  postExamName?: any;
  preExamName?: any;
  certificateTitle: string;
  certificateTemplateId: number;
  contents: any[];
  speakers: any[];
  sections: any[];
  specaility: Specaility;
  lastUpdatedByUserFullName?: string;
  lastUpdatedByUserEmail?: string;
  lastUpdatedOn?: string;
  supportedLanguage: string;
  feedbackFormId: number;
  forceingUserWatchFullCourseToTakeActions: boolean;
}

interface Specaility {
  id: number;
  name: string;
  arabicName: string;
  englishName: string;
  arabicDescription: string;
  englishDescription: string;
}
