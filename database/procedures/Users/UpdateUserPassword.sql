--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Updates a user's password by its UUID.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_UpdateUserPassword]
    -- Parameters
    @IN_userId UNIQUEIDENTIFIER,
    @IN_password VARCHAR(128),
    @IN_currentUserId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    BEGIN TRY

        IF @IN_currentUserId <> @IN_userId AND dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
            BEGIN
                RAISERROR ('unauthorized', 16, 1);
            END;
            
        -- VALIDATIONS
        IF @IN_password IS NULL OR @IN_password = ''
            BEGIN
                RAISERROR ('password_required', 16, 1);
            END;

        IF NOT EXISTS (SELECT 1
                       FROM [dbo].[View_ExistingUsers]
                       WHERE [userId] = @IN_userId)
            BEGIN
                RAISERROR ('user_not_found', 16, 1);
            END;

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
                SET @transactionStarted = 1;
                BEGIN TRANSACTION;
            END;

        -- UPDATE USER PASSWORD
        UPDATE [dbo].[Users]
        SET [password] = @IN_password,
            [passwordChanged] = 1
        WHERE [userId] = @IN_userId;

        SELECT [userId_int] AS [affectedEntityId]
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