--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-30
-- Description:  Evaluate a question.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Questions_EvaluateQuestion]
    -- Parameters
    @IN_evaluation BIT,
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_questionId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;
    
	-- VARIABLE DECLARATION
	DECLARE @documentId UNIQUEIDENTIFIER;
	DECLARE @documentName NVARCHAR(128);

    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_questionId IS NULL
        BEGIN
            RAISERROR ('id_question_required', 16, 1);
        END;

        IF @IN_evaluation IS NULL
        BEGIN
            RAISERROR ('evaluation_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- EVALUATE QUESTION
        UPDATE [Question] SET evaluation = @IN_evaluation WHERE questionId = @IN_questionId

		SELECT
			@documentId = documentId
		FROM [dbo].[Question]
		WHERE questionId = @IN_questionId

		SELECT
			@documentName = title
		FROM [dbo].[Document]
		WHERE documentId = documentId

		-- INSERT THE NOTIFICATION
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
				@IN_currentUserId,  
				'Pregunta evaluada', 
				'Se evaluo una pregunta en el documento ' + @documentName, 
				0,
				'Question',
				@IN_questionId,
				0,  
				GETUTCDATE()
			);


		SELECT questionId AS [affectedEntityId]
		FROM [dbo].[View_ExistingQuestions]
		WHERE [questionId] = @IN_questionId;

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
END;