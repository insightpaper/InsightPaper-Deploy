--------------------------------------------------------------------------
-- Author:       
-- Date:         2025-05-14
-- Description:  Get the chat history.
--------------------------------------------------------------------------

CREATE OR ALTER   PROCEDURE [dbo].[SP_Questions_GetStudentSingleChat]
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
    @IN_studentId UNIQUEIDENTIFIER = NULL,
    @IN_documentId UNIQUEIDENTIFIER = NULL    
AS
    SET NOCOUNT ON;

    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    BEGIN TRY
        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_studentId IS NULL
        BEGIN
            RAISERROR ('id_student_required', 16, 1);
        END;

        IF @IN_documentId IS NULL
        BEGIN
            RAISERROR ('id_document_required', 16, 1);
        END;

        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        SELECT 
			Q.questionId,
			Q.question,
			R.responseId,
			R.response,
			Q.evaluation,
			Q.createdDate AS questionCreatedDate,
			Q.modifiedDate AS questionModifiedDate,
			R.createdDate AS responseCreatedDate,
			R.modifiedDate AS responseModifiedDate,
			(
				SELECT 
					C.commentary,
                    C.isPrivate
				FROM [dbo].[Comment] AS C
				WHERE C.questionId = Q.questionId
				FOR JSON PATH
			) AS comments
		FROM 
			[dbo].[Question] AS Q
		LEFT JOIN 
			[dbo].[Response] AS R ON Q.questionId = R.questionId
		WHERE	
			Q.userId = @IN_studentId
			AND Q.documentId = @IN_documentId
		ORDER BY 
			Q.createdDate ASC,
			R.createdDate ASC 
		FOR JSON PATH;

        -- COMMIT TRANSACTION
        IF @transactionStarted = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

    END TRY
    BEGIN CATCH

        SET @errorNumber = ERROR_NUMBER();
        SET @errorSeverity = ERROR_SEVERITY();
        SET @errorState = ERROR_STATE();
        SET @errorMessage = ERROR_MESSAGE();

        IF @transactionStarted = 1
        BEGIN
        ROLLBACK;
    END;

        IF @errorNumber != 50000
        BEGIN
        -- If it's not a custom error, log the error
        INSERT INTO [dbo].[Errors]
        VALUES
            (
                SUSER_NAME(),
                ERROR_NUMBER(),
                ERROR_STATE(),
                ERROR_SEVERITY(),
                ERROR_LINE(),
                ERROR_PROCEDURE(),
                ERROR_MESSAGE(),
                GETUTCDATE()
            );
    END;

        RAISERROR('%s - Error Number: %i', 
            @errorSeverity, @errorState, @errorMessage, @errorNumber);

    END CATCH;
