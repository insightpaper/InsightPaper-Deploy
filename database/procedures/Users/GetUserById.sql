--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Get a user by id
--------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[SP_Users_GetUserById]
    -- Parameters
    @IN_userId UNIQUEIDENTIFIER,
    @IN_currentUserId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON; -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION

    BEGIN TRY

        -- VALIDATIONS

        IF @IN_currentUserId <> @IN_userId AND (dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0 AND dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0)
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        IF @IN_userId IS NULL
        BEGIN
            RAISERROR('user_id_required', 16, 1);
        END;

        -- Check if the user exists
        IF NOT EXISTS (
            SELECT 1
            FROM [dbo].[View_ExistingUsers]
            WHERE [userId] = @IN_userId
        )
        BEGIN
            RAISERROR('user_not_found', 16, 1);
        END;

        -- Return the user data in JSON format
        SELECT
            u.[userId],
            u.[name],
            u.[email],
            u.[password],
            u.[pictureUrl],
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
            u.[userId] = @IN_userId
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