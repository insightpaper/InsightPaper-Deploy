--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Soft deletes a user and associated roles and entities.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_DeleteUser]
    @IN_userId UNIQUEIDENTIFIER,
    @IN_currentUserId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;         -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @creatorId UNIQUEIDENTIFIER;
    DECLARE @creatorRoleId INT;
    DECLARE @brandRoleId INT;
    DECLARE @hasCreatorRole BIT = 0;
    DECLARE @hasBrandRole BIT = 0;

    BEGIN TRY

        -- VALIDATIONS
        -- Validate current user has Admin role
        IF dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.[View_ExistingUsers]
            WHERE [userId] = @IN_userId
        )
        BEGIN
            RAISERROR('user_not_found', 16, 1);
        END;
        
        -- Get role IDs
        SELECT @creatorRoleId = [roleId] FROM dbo.[Roles] WHERE [name] = 'Creator';
        SELECT @brandRoleId = [roleId] FROM dbo.[Roles] WHERE [name] = 'Brand';

        SELECT @hasCreatorRole = CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM dbo.[UserRoles] WHERE [userId] = @IN_userId AND [roleId] = @creatorRoleId AND [enabled] = 1;

        SELECT @hasBrandRole = CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM dbo.[UserRoles] WHERE [userId] = @IN_userId AND [roleId] = @brandRoleId AND [enabled] = 1;

        -- Get creatorId if the user has Creator role
        IF @hasCreatorRole = 1
        BEGIN
            SELECT @creatorId = [creatorId] FROM dbo.[Creators] WHERE [userId] = @IN_userId;
        END;

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- Handle Creator role
        IF @hasCreatorRole = 1
        BEGIN
            UPDATE dbo.[CreatorTypeAssignments] SET [enabled] = 0 WHERE [creatorId] = @creatorId;
            UPDATE dbo.[Creators] SET [isDeleted] = 1 WHERE [creatorId] = @creatorId;
            UPDATE dbo.[ProjectCreators] SET [isDeleted] = 1 WHERE [creatorId] = @creatorId;
        END;

        -- Handle Brand role
        IF @hasBrandRole = 1
        BEGIN
            UPDATE dbo.[BrandUsers] SET [isDeleted] = 1 WHERE [userId] = @IN_userId;
        END;
        
        -- Soft delete the user
        UPDATE dbo.[UserRoles] SET [enabled] = 0 WHERE [userId] = @IN_userId;
        UPDATE dbo.[Users] SET [isDeleted] = 1 WHERE [userId] = @IN_userId;

        SELECT [userId_int] AS [affectedEntityId]
        FROM [dbo].[Users]
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
