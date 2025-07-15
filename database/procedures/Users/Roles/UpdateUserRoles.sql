--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Updates the roles of a user
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_UserRoles_UpdateUserRoles]
    @IN_userId UNIQUEIDENTIFIER,
    @IN_roles [StringListType] READONLY,
    @IN_currentUserId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;  -- Do not return metadata

    -- ERROR HANDLING VARIABLES
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- Table to capture affected userRoleIds
    DECLARE @affectedIds TABLE 
    (
        userRoleId INT
    );

    -- Local table to store the new roles (all roles passed in are assumed enabled)
    DECLARE @newRoles TABLE 
    (
        roleName NVARCHAR(64)
    );

    BEGIN TRY
        -- VALIDATIONS

        -- Check if the current user is authorized (must have 'Admin' role)
        IF dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        -- Validate that the target user exists
        IF NOT EXISTS (
            SELECT 1
            FROM [dbo].[View_ExistingUsers]
            WHERE [userId] = @IN_userId
        )
        BEGIN
            RAISERROR('user_not_found', 16, 1);
        END;

        -- Validate that at least one role is provided
        IF NOT EXISTS (SELECT 1 FROM @IN_roles)
        BEGIN
            RAISERROR('one_role_required', 16, 1);
        END;

        -- Insert the roles from the TVP into the local table variable
        INSERT INTO @newRoles (roleName)
        SELECT value FROM @IN_roles;

        -- Validate that all provided roles exist in the Roles table
        IF EXISTS (
            SELECT nr.roleName
            FROM @newRoles nr
            LEFT JOIN [dbo].[Roles] r ON nr.roleName = r.[name]
            WHERE r.[roleId] IS NULL
        )
        BEGIN
            RAISERROR ('roles_not_found', 16, 1);
        END;

        -- START TRANSACTION if not already in one
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- Use MERGE to update existing roles (set enabled = 1), 
        -- insert new roles, and disable roles not in the incoming list (set enabled = 0)
        MERGE dbo.UserRoles AS target
        USING (
            SELECT r.roleId
            FROM @newRoles nr
            JOIN dbo.Roles r ON nr.roleName = r.[name]
        ) AS src
        ON target.userId = @IN_userId AND target.roleId = src.roleId
        WHEN MATCHED THEN
            UPDATE SET enabled = 1
        WHEN NOT MATCHED BY TARGET THEN
            INSERT (userId, roleId, enabled)
            VALUES (@IN_userId, src.roleId, 1)
        WHEN NOT MATCHED BY SOURCE AND target.userId = @IN_userId THEN
            UPDATE SET enabled = 0
        OUTPUT inserted.userRoleId INTO @affectedIds;

        -- Return the list of affected UserRole IDs
        SELECT [userRoleId] AS [affectedEntityId] 
        FROM @affectedIds;

        -- COMMIT TRANSACTION if we started it
        IF @transactionStarted = 1
        BEGIN
            COMMIT TRANSACTION;
        END;

    END TRY
    BEGIN CATCH
        -- Capture error information
        SET @errorNumber = ERROR_NUMBER();
        SET @errorSeverity = ERROR_SEVERITY();
        SET @errorState = ERROR_STATE();
        SET @errorMessage = ERROR_MESSAGE();

        IF @transactionStarted = 1
        BEGIN
            ROLLBACK;
        END;

        -- Log non-custom errors
        IF @errorNumber != 50000
        BEGIN
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

        RAISERROR('%s - Error Number: %i', @errorSeverity, @errorState, @errorMessage, @errorNumber);
    END CATCH;
END;
