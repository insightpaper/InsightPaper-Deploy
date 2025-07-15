--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Updates a user's information.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_UpdateUser]
    -- Parameters
    @IN_userId UNIQUEIDENTIFIER,
    @IN_name VARCHAR(128),
    @IN_email VARCHAR(256),
    @IN_password VARCHAR(128) = NULL,
    @IN_securityCode VARCHAR(128) = NULL,
    @IN_pictureUrl VARCHAR(256) = NULL,
    @IN_securityCodeExpiration DATETIME = NULL,
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
    DECLARE @typesIds TABLE (typeId INT);

    BEGIN TRY

        -- VALIDATE CURRENT USER
         IF @IN_currentUserId <> @IN_userId AND dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;
        
        -- VALIDATIONS
        IF @IN_name IS NULL OR @IN_name = ''
            BEGIN
                RAISERROR ('name_required', 16, 1);
            END;

        IF @IN_email IS NULL OR @IN_email = ''
            BEGIN
                RAISERROR ('email_required', 16, 1);
            END;

        
        IF @IN_password = ''
            BEGIN
                SET @IN_password = NULL;
            END;

        IF @IN_pictureUrl = ''
            BEGIN
                SET @IN_pictureUrl = NULL;
            END;

        IF NOT EXISTS (SELECT 1
                       FROM [dbo].[View_ExistingUsers]
                       WHERE [userId] = @IN_userId)
            BEGIN
                RAISERROR ('user_not_found', 16, 1);
            END;

        IF @IN_securityCode IS NULL AND @IN_securityCodeExpiration IS NOT NULL
            BEGIN
                RAISERROR ('security_code_required', 16, 1);
            END;

        IF @IN_securityCode IS NOT NULL AND @IN_securityCodeExpiration IS NULL
            BEGIN
                RAISERROR ('security_code_expiration_required', 16, 1);
            END;

        IF @IN_securityCodeExpiration IS NOT NULL AND @IN_securityCodeExpiration < GETUTCDATE()
            BEGIN
                RAISERROR ('code_expired', 16, 1);
            END;

        -- Verify if the user's information will be updated
        IF EXISTS (SELECT 1
                   FROM [dbo].[Users]
                   WHERE [userId] = @IN_userId
                     AND  [name] != @IN_name 
                       OR [email] != @IN_email
                       OR [pictureUrl] != @IN_pictureUrl
                       OR @IN_password IS NOT NULL)
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
        SET [name]         = @IN_name,
            [email]        = @IN_email,
            [password]     = IIF(@IN_password IS NOT NULL, @IN_password, [password]),
            [pictureUrl]   = IIF(@IN_pictureUrl IS NOT NULL, @IN_pictureUrl, [pictureUrl]),
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