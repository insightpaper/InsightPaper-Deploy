--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Gets a user's OTP by its email.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_GetUserOtpByEmail]
    -- Parameters
    @IN_email VARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @IN_userId UNIQUEIDENTIFIER = NULL;

    BEGIN TRY

        -- VALIDATIONS
        IF @IN_email IS NULL OR @IN_email = ''
            BEGIN
                RAISERROR ('user_email_required', 16, 1);
            END;

        SELECT @IN_userId = [userId]
        FROM [dbo].[View_ExistingUsers]
        WHERE [email] = @IN_email;

        IF @IN_userId IS NULL
            BEGIN
                RAISERROR ('user_not_found', 16, 1);
            END;

        SELECT [securityCode],
               [securityCodeExpiration]
        FROM [dbo].[View_ExistingUsers]
        WHERE [userId] = @IN_userId;

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
                VALUES (SUSER_NAME(),
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