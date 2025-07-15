export interface StudentActivityStats {
  generalStats: {
    documentsViewed: number;
    numberOfChats: number;
    numberOfQuestions: number;
    numberOfResponses: number;
  };
  documentsStats: DocumentStats[];
  activityTimeline: ActivityTimelineEntry[];
}

export interface DocumentStats {
  documentId: string;
  title: string;
  questions: number;
  responses: number;
}

export interface ActivityTimelineEntry {
  activityDate: string; // Formato 'YYYY-MM-DD'
  questions: number;
  responses: number;
}