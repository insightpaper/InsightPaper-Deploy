--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-28
-- Description:  Creates a new question.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Questions_CreateQuestion]
    -- Parameters
    @IN_question NVARCHAR(MAX),
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_documentId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
	DECLARE @documentName NVARCHAR(128);

	-- VARIABLE DECLARATION
	DECLARE @questionId UNIQUEIDENTIFIER;
    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_question IS NULL
        BEGIN
            RAISERROR ('question_required', 16, 1);
        END;

        IF @IN_documentId IS NULL
        BEGIN
            RAISERROR ('id_document_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- INSERT QUESTION
        INSERT INTO [dbo].[Question]
        (
            [userId],
            [documentId],
            [question],
			[createdDate],
			[modifiedDate]
        )
        VALUES
        (
            @IN_currentUserId,
            @IN_documentId,
            @IN_question,
			GETDATE(),
			GETDATE()
        );

		SET @questionId  = (SELECT TOP 1 questionId FROM [dbo].[Question] ORDER BY createdDate DESC);

		SELECT
			@documentName = title
		FROM [dbo].[Document]
		WHERE documentId = @IN_documentId

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
				'Pregunta guardada', 
				'Se guardo una pregunta en el documento ' + @documentName, 
				0,
				'Question',
				@questionId,
				0,  
				GETUTCDATE()
			);

		SELECT questionId AS [affectedEntityId]
		FROM [dbo].[View_ExistingQuestions]
		WHERE [questionId] = @questionId;

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