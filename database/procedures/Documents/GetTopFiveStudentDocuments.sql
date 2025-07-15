--------------------------------------------------------------------------
-- Author:       m.alejandro00@estudiantec.cr
-- Date:         2025-05-13
-- Description:  Get top five documents.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Documents_GetTopFiveStudentDocuments]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
        RAISERROR('unauthorized', 16, 1);
    END;

        -- START TRANSACTION
        
        BEGIN
        SET @transactionStarted = 1;
        BEGIN TRANSACTION;
    END;

	-- GET DOCUMENTS	
	SELECT TOP (5)
		D.documentId,
		D.title,
		D.description,
		JSON_QUERY(D.labels) AS labels,
		CD.userId,
		D.createdDate,
		D.modifiedDate,
		D.firebaseUrl
	FROM [dbo].[StudentDocument] AS CD
		JOIN [dbo].[Document] AS D ON CD.documentId = D.documentId
	WHERE CD.userId = @IN_currentUserId
		AND D.isDeleted IS NULL
	ORDER BY D.createdDate DESC
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
    END;
