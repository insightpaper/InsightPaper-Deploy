--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Uses a token.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Tokens_UseToken]
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

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- Uses the token
        UPDATE [dbo].[Tokens]
        SET [isUsed] = 1
        WHERE [tokenId] = @IN_tokenId;

        SELECT @IN_tokenId AS [affectedEntityId];

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