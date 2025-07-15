--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Creates a functions that checks if a user has a specific role.
--------------------------------------------------------------------------
CREATE OR ALTER FUNCTION [CheckUserRole](
    @IN_userId UNIQUEIDENTIFIER, 
    @IN_roleName VARCHAR(64)      
)
    RETURNS BIT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM [dbo].[UserRoles] ur
        INNER JOIN [dbo].[Roles] r ON ur.[roleId] = r.[roleId]
        WHERE ur.[userId] = @IN_userId
          AND r.[name] = @IN_roleName
          AND ur.[enabled] = 1  
    )
        RETURN 1; 
    RETURN 0;
END;