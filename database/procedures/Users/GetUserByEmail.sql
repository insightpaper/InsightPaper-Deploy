--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Get a user by email
--------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[SP_Users_GetUserByEmail]
    -- Parameters
    @IN_email NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON; -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @userId UNIQUEIDENTIFIER = NULL;

    BEGIN TRY

        -- VALIDATIONS
        IF @IN_email IS NULL OR @IN_email = ''
        BEGIN
            RAISERROR('user_email_required', 16, 1);
        END;

        -- Get the user ID from the email
        SELECT @userId = [userId]
        FROM [dbo].[View_ExistingUsers]
        WHERE [email] = @IN_email;

        -- Check if the user exists
        IF @userId IS NULL
        BEGIN
            RAISERROR('user_not_found', 16, 1);
        END;

        -- Return the user data in JSON format
        SELECT
            u.[userId],
            u.[name],
            u.[email],
            u.[pictureUrl],
            u.[password],
            u.[doubleFactorEnabled],
            u.[passwordChanged],
            CONCAT(CONVERT(VARCHAR(32), u.[createdDate], 126), 'Z') as [createdDate],
            CONCAT(CONVERT(VARCHAR(32), u.[modifiedDate], 126), 'Z') as [modifiedDate],
            (
                SELECT r.[name]
                FROM [dbo].[UserRoles] ur
                INNER JOIN [dbo].[Roles] r ON ur.[roleId] = r.[roleId]
                WHERE ur.[userId] = u.[userId]
                AND ur.[enabled] = 1
                FOR JSON PATH
            ) AS roles
        FROM
            [dbo].[View_ExistingUsers] u
        WHERE
            u.[userId] = @userId
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER; -- Return as a single JSON object

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