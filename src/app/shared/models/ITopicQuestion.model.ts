export interface ITopicQuestion {
  id: number;
  questionType: number;
  englishTitle: string;
  englishDescription: string;
  createdOn: string;
  courseExamId: string;
  correctAnswer: string;
  arabicTitle: string;
  arabicDescription: string;
  answers: string;
  answerSeprator: string;
}
