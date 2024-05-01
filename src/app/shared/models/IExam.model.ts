export interface IExam {
  id: number;
  arabicDescription: string;
  arabicTitle: string;
  createdOn: string;
  englishDescription: string;
  englishTitle: string;
  passingRate: number;
  timeout: number;
  courseId: number;
  questions: any[];
  maxRetryCount: number;
}
