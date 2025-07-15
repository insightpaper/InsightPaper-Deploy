--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-05-01
-- Description:  Create notification for evaluated document.
--------------------------------------------------------------------------

CREATE OR ALTER TRIGGER trg_QuestionEvaluated
ON [dbo].[Question]
AFTER UPDATE
AS
BEGIN
    DECLARE @questionId UNIQUEIDENTIFIER;
    DECLARE @studentId UNIQUEIDENTIFIER;
    DECLARE @documentId UNIQUEIDENTIFIER;

    -- OBTAIN THE QUESTION
    SELECT 
        @questionId = questionId,
        @studentId = userId,  
        @documentId = documentId 
    FROM INSERTED;

        -- CREATE THE NOTIFICATION
        INSERT INTO [dbo].[Notifications] 
        (
            userId,
            title,
            message,
            isRead,
            objectType,
			objectNotificatedId,
            isDeleted,
            createdDate
        )
        VALUES
        (
            @studentId, 
            'Pregunta Evaluada', 
            'Tu pregunta ha sido evaluada por el profesor',  
            0,
            'Question',
			@documentId,
            0, 
            GETUTCDATE() 
        );
END;
GO