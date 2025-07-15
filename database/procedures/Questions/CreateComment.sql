--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-05-27
-- Description:  Creates a new comment.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Questions_CreateComment]
    -- Parameters
    @IN_comment NVARCHAR(MAX),
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_questionId UNIQUEIDENTIFIER = NULL,
	@IN_isPrivate BIT

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
	DECLARE @documentName NVARCHAR(128);
	DECLARE @commentId UNIQUEIDENTIFIER;
    DECLARE @questionId UNIQUEIDENTIFIER;

    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_questionId IS NULL
        BEGIN
            RAISERROR ('question_id_required', 16, 1);
        END;

        IF @IN_comment IS NULL OR @IN_comment = ''
        BEGIN
            RAISERROR ('comment_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- INSERT QUESTION
        INSERT INTO [dbo].[Comment]
        (
            [commentary],
            [isPrivate],
            [questionId],
			[createdDate],
			[modifiedDate]
        )
        VALUES
        (
            @IN_comment,
            @IN_isPrivate,
            @IN_questionId,
			GETDATE(),
			GETDATE()
        );

		SET @commentId  = (SELECT TOP 1 commentId FROM [dbo].[Comment] ORDER BY createdDate DESC);
		SET @questionId  = (SELECT TOP 1 questionId FROM [dbo].[Question] ORDER BY createdDate DESC);

		SELECT
			@documentName = D.title
		FROM [dbo].[Document] AS D
		INNER JOIN [dbo].[Question] AS Q ON Q.documentId = D.documentId
		WHERE Q.questionId = @questionId

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
				'Comentario creado', 
				'Se agrego un comentario a una respuesta del documento ' + @documentName, 
				0,
				'Commentary',
				@commentId,
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