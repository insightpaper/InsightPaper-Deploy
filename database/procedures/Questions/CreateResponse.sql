--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-28
-- Description:  Creates a new response.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Questions_CreateResponse]
    -- Parameters
    @IN_response NVARCHAR(MAX),
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
	DECLARE @responseId UNIQUEIDENTIFIER;
	DECLARE @documentId UNIQUEIDENTIFIER;
	DECLARE @documentName NVARCHAR(128);
    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_response IS NULL
        BEGIN
            RAISERROR ('response_required', 16, 1);
        END;

        IF @IN_questionId IS NULL
        BEGIN
            RAISERROR ('id_document_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- INSERT RESPONSE
        INSERT INTO [dbo].[Response]
        (
            [questionId],
            [response],
			[createdDate],
			[modifiedDate]
        )
        VALUES
        (
            @IN_questionId,
            @IN_response,
			GETDATE(),
			GETDATE()
        );

		SET @responseId  = (SELECT TOP 1 responseId FROM [dbo].[Response] ORDER BY createdDate DESC);

		SELECT
			@documentId = documentId
		FROM [dbo].[Question]
		WHERE questionId = @IN_questionId

		SELECT
			@documentName = title
		FROM [dbo].[Document]
		WHERE documentId = @documentId

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
				'Respuesta generada', 
				'Se genero una respuesta en el documento ' + @documentName, 
				0,
				'Response',
				@responseId,
				0,  
				GETUTCDATE()
			);

		SELECT responseId AS [affectedEntityId]
		FROM [dbo].[View_ExistingResponses]
		WHERE [responseId] = @responseId;

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