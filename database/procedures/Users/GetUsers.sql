--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Gets a list of users.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_GetUsers]
    @IN_pageNumber INT = NULL,
    @IN_pageSize INT = NULL,
    @IN_filter VARCHAR(256) = NULL,
    @IN_orderBy VARCHAR(50) = 'createdDate',
    @IN_orderDirection VARCHAR(4) = 'ASC',
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
    @IN_roles [StringListType] READONLY
AS
BEGIN
    SET NOCOUNT ON;  -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    BEGIN TRY

        -- VALIDATE CURRENT USER
        IF dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;
        
        -- VALIDATE ROLE TVP: if any role is provided, verify that it exists in the Roles table
        IF EXISTS (SELECT 1 FROM @IN_roles)
        BEGIN
            IF EXISTS (
                SELECT r.value
                FROM @IN_roles r
                LEFT JOIN [dbo].[Roles] ro ON r.value = ro.[name]
                WHERE ro.[roleId] IS NULL
            )
            BEGIN
                RAISERROR('role_not_found', 16, 1);
            END;
        END;

        -- VALIDATIONS
        IF @IN_pageNumber IS NOT NULL AND @IN_pageNumber < 1
        BEGIN
            RAISERROR ('page_number_invalid', 16, 1);
        END;

        IF @IN_pageSize IS NOT NULL AND @IN_pageSize < 1
        BEGIN
            RAISERROR ('page_size_invalid', 16, 1);
        END;

        IF @IN_pageNumber IS NOT NULL AND @IN_pageSize IS NULL
        BEGIN
            RAISERROR ('page_size_required', 16, 1);
        END;

        IF @IN_pageNumber IS NULL AND @IN_pageSize IS NOT NULL
        BEGIN
            RAISERROR ('page_number_required', 16, 1);
        END;

        IF @IN_pageNumber IS NULL AND @IN_pageSize IS NULL
        BEGIN
            SET @IN_pageNumber = 1;
            SET @IN_pageSize = (SELECT COUNT(*) FROM [dbo].[View_ExistingUsers]);
        END;

        -- Subtract 1 from the page number to make it 0-based
        SET @IN_pageNumber = @IN_pageNumber - 1;

        -- Validate @IN_orderBy
        IF @IN_orderBy IS NULL OR @IN_orderBy = ''
        BEGIN
            SET @IN_orderBy = 'createdDate';
        END;

        IF @IN_orderBy NOT IN ('name', 'email', 'createdDate', 'modifiedDate')
        BEGIN
            RAISERROR ('order_by_column_invalid', 16, 1);
        END;

        -- Validate @IN_orderDirection
        IF @IN_orderDirection IS NULL OR @IN_orderDirection = ''
        BEGIN
            SET @IN_orderDirection = 'ASC';
        END;

        IF @IN_orderDirection NOT IN ('ASC', 'DESC')
        BEGIN
            RAISERROR ('order_by_direction_invalid', 16, 1);
        END;

        -- Initialize dynamic SQL components
        DECLARE @sql NVARCHAR(MAX) = N'';
        DECLARE @whereClause NVARCHAR(MAX) = N'';
        DECLARE @orderClause NVARCHAR(MAX) = N'';
        DECLARE @params NVARCHAR(MAX) = N'@IN_filter VARCHAR(256), @IN_pageNumber INT, @IN_pageSize INT, @IN_roles [StringListType] READONLY';

        -- Handle filtering (search by name, phone, country or email)
        IF @IN_filter IS NOT NULL
        BEGIN
            SET @whereClause += N' AND EXISTS (
                SELECT 1 FROM STRING_SPLIT(@IN_filter, '' '') AS F
                WHERE
                    [name] LIKE ''%'' + F.value + ''%'' OR
                    [email] LIKE ''%'' + F.value + ''%''
            )';
        END

        -- Handle roles filtering using the TVP (if any roles are provided)
        IF EXISTS (SELECT 1 FROM @IN_roles)
        BEGIN
            SET @whereClause += N' AND EXISTS (
                SELECT 1 
                FROM [dbo].[UserRoles] UR
                INNER JOIN [dbo].[Roles] R ON UR.roleId = R.roleId
                INNER JOIN @IN_roles rfilter ON R.name = rfilter.value
                WHERE UR.userId = [View_ExistingUsers].[userId]
                  AND UR.enabled = 1
            )';
        END

        -- Handle ordering with proper sanitization
        SET @orderClause = N' ORDER BY ' + QUOTENAME(@IN_orderBy) + ' ' + @IN_orderDirection;

        -- Handle pagination
        IF @IN_pageSize IS NOT NULL AND @IN_pageNumber IS NOT NULL
        BEGIN
            SET @sql = @sql + N'
            SELECT 
                [userId],
                [name],
                [email],
                [pictureUrl],
                CONCAT(CONVERT(VARCHAR(32), [createdDate], 126), ''Z'') AS [createdDate],
                CONCAT(CONVERT(VARCHAR(32), [modifiedDate], 126), ''Z'') AS [modifiedDate],
                (
                    SELECT R.name
                    FROM [dbo].[UserRoles] UR
                    INNER JOIN [dbo].[Roles] R ON UR.roleId = R.roleId
                    WHERE UR.userId = [View_ExistingUsers].[userId]
                      AND UR.enabled = 1
                    FOR JSON PATH
                ) AS roles
            FROM [dbo].[View_ExistingUsers]
            WHERE 1=1 ' + @whereClause + '
            ' + @orderClause + '
            OFFSET (@IN_pageNumber * @IN_pageSize) ROWS
            FETCH NEXT @IN_pageSize ROWS ONLY;

            SELECT ISNULL(CEILING(COUNT(*) * 1.0 / @IN_pageSize), 0) AS [totalPages]
            FROM [dbo].[View_ExistingUsers]
            WHERE 1=1 ' + @whereClause + ';';
        END
        ELSE
        BEGIN
            SET @sql = @sql + N'
            SELECT 
                [userId],
                [name],
                [email],
                [pictureUrl],
                [doubleFactorEnabled],
                [passwordChanged],
                CONCAT(CONVERT(VARCHAR(32), [createdDate], 126), ''Z'') AS [createdDate],
                CONCAT(CONVERT(VARCHAR(32), [modifiedDate], 126), ''Z'') AS [modifiedDate],
                (
                    SELECT R.name
                    FROM [dbo].[UserRoles] UR
                    INNER JOIN [dbo].[Roles] R ON UR.roleId = R.roleId
                    WHERE UR.userId = [View_ExistingUsers].[userId]
                      AND UR.enabled = 1
                    FOR JSON PATH
                ) AS roles
            FROM [dbo].[View_ExistingUsers]
            WHERE 1=1 ' + @whereClause + '
            ' + @orderClause + ';';

            SET @sql = @sql + N'
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM [dbo].[View_ExistingUsers]
                WHERE 1=1 ' + @whereClause + '
            ) THEN 1 ELSE 0 END AS [totalPages];';
        END

        -- Execute dynamic SQL
        EXEC sp_executesql
             @sql,
             @params,
             @IN_filter = @IN_filter,
             @IN_pageNumber = @IN_pageNumber,
             @IN_pageSize = @IN_pageSize,
             @IN_roles = @IN_roles;

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