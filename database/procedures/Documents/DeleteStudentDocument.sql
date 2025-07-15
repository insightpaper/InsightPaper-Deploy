--------------------------------------------------------------------------
-- Author:       m.alejandro00@estudiantec.cr
-- Date:         2025-05-13
-- Description:  Delete a personal document.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Documents_DeleteStudentDocument]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER,
    @IN_documentId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;


    BEGIN TRY

        -- VALIDATE CURRENT USER
        IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
        RAISERROR('unauthorized', 16, 1);
    END;
        
        -- VALIDATIONS
        IF NOT EXISTS(SELECT 1
    FROM [dbo].[Document]
    WHERE [documentId] = @IN_documentId)
        BEGIN
        RAISERROR ('document_id_required', 16, 1);
    END;       

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
        SET @transactionStarted = 1;
        BEGIN TRANSACTION;
    END;

        -- DELETE DOCUMENT
        UPDATE [dbo].[Document]
        SET [isDeleted] = 1
        WHERE [documentId] = @IN_documentId;

		UPDATE [dbo].[StudentDocument]
        SET [isDeleted] = 1
        WHERE [documentId] = @IN_documentId;

		SELECT documentId AS [affectedEntityId]
    FROM [dbo].[Document]
    WHERE [documentId] = @IN_documentId;

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
            (SUSER_NAME(),
                ERROR_NUMBER(),
                ERROR_STATE(),
                ERROR_SEVERITY(),
                ERROR_LINE(),
                ERROR_PROCEDURE(),
                ERROR_MESSAGE(),
                GETUTCDATE());
    END;

        RAISERROR ('%s - Error Number: %i',
            @errorSeverity, @errorState, @errorMessage, @errorNumber);

    END CATCH;
END;