export interface QuestionInterface {
  questionId: string;          
  question: string;     
  responseId: string;           
  response: string;       
  evaluation: number;
  questionCreatedDate: Date;
  questionModifiedDate: Date;    
  responseCreatedDate: Date;
  responseModifiedDate: Date;   
  comment: string;
}

export interface ChatInterface {
  documentTitle: string;     
  questionCount: number;  
}
