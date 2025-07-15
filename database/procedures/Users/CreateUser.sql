--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-11
-- Description:  Creates a new Brand user.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_CreateUser]
    -- Parameters
    @IN_name NVARCHAR(128),
    @IN_email NVARCHAR(128),
    @IN_password NVARCHAR(128),
    @IN_securityCode VARCHAR(128) = NULL,
    @IN_securityCodeExpiration DATETIME = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @studenRoleId INT;
    DECLARE @userId UNIQUEIDENTIFIER;
    
    BEGIN TRY

        -- VALIDATIONS
        IF @IN_name IS NULL OR @IN_name = ''
        BEGIN
            RAISERROR ('name_required', 16, 1);
        END;

        IF @IN_email IS NULL OR @IN_email = ''
        BEGIN
            RAISERROR ('email_required', 16, 1);
        END;

        IF @IN_password IS NULL OR @IN_password = ''
        BEGIN
            RAISERROR ('password_required', 16, 1);
        END;

        IF EXISTS (SELECT 1 FROM [dbo].[View_ExistingUsers] WHERE [email] = @IN_email)
        BEGIN
            RAISERROR ('email_exists', 16, 1);
        END;

        SET @studenRoleId = (SELECT [roleId] FROM [dbo].[Roles] WHERE [name] = 'Student');

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- INSERT USER
        INSERT INTO [dbo].[Users]
        (
            [name],
            [email],
            [password],
            [securityCode],
            [securityCodeExpiration]
        )
        VALUES
        (
            @IN_name,
            @IN_email,
            @IN_password,
            @IN_securityCode,
            @IN_securityCodeExpiration
        );

        SET @userId = (SELECT [userId] FROM [dbo].[View_ExistingUsers] WHERE [email] = @IN_email);

        -- INSERT USER ROLE
        INSERT INTO [dbo].[UserRoles]
        (
            [userId],
            [roleId]
        )
        VALUES
        (
            @userId,
            @studenRoleId
        );

        SELECT userId_int AS [affectedEntityId],
               @userId         AS [userId]
        FROM [dbo].[View_ExistingUsers]
        WHERE [email] = @IN_email;

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