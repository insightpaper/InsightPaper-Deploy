--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Updates a user otp secret.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_UpdateUserOtpSecret]
    -- Parameters
    @IN_userId UNIQUEIDENTIFIER,
    @IN_otpSecret VARCHAR(64),
    @IN_currentUserId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @willUpdateModifiedDate BIT = 0;

    BEGIN TRY

        -- VALIDATE CURRENT USER
        IF @IN_currentUserId != @IN_userId
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        IF NOT EXISTS (SELECT 1
                       FROM [dbo].[View_ExistingUsers]
                       WHERE [userId] = @IN_userId)
        BEGIN
            RAISERROR ('user_not_found', 16, 1);
        END;

        IF @IN_otpSecret IS NULL OR @IN_otpSecret = ''
            BEGIN
                RAISERROR ('otp_secret_required', 16, 1);
            END;

        -- Verify if the user's information will be updated
        IF EXISTS (SELECT 1
                   FROM [dbo].[Users]
                   WHERE [userId] = @IN_userId
                   AND  [otpSecret] != @IN_otpSecret)
            BEGIN
                SET @willUpdateModifiedDate = 1;
            END;

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
                SET @transactionStarted = 1;
                BEGIN TRANSACTION;
            END;

        -- UPDATE USER
        UPDATE [dbo].[Users]
        SET [otpSecret] = @IN_otpSecret,
            [modifiedDate] = IIF(@willUpdateModifiedDate = 1, GETUTCDATE(), [modifiedDate])
        WHERE [userId] = @IN_userId;

        SELECT IIF(@willUpdateModifiedDate = 1, [userId_int], NULL) AS [affectedEntityId]
        FROM [dbo].[View_ExistingUsers]
        WHERE [userId] = @IN_userId;

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