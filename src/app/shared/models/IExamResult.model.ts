export interface IExamResult {
  userFullName: string;
  email: string;
  occupation?: any;
  examName: string;
  courseName: string;
  takedOn: string;
  examResult: number;
  isUserPassingExam: boolean;
  userExamId: number;
}
