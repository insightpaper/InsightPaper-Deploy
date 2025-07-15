--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Gets a token.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Tokens_GetToken]
    @IN_tokenId NVARCHAR(32)
AS
BEGIN
    SET NOCOUNT ON;         -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    -- 

    BEGIN TRY

        -- VALIDATIONS
        IF NOT EXISTS (
            SELECT 1
            FROM [dbo].[Tokens]
            WHERE [tokenId] = @IN_tokenId
        )
        BEGIN
            RAISERROR('token_not_found', 16, 1);
        END;

       SELECT
            [tokenId],
            [isUsed]
        FROM [dbo].[Tokens]
        WHERE [tokenId] = @IN_tokenId

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
            VALUES (
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