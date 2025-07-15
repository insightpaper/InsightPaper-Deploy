--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-03-25
-- Description:  Get a course by id
--------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_GetCourseById]
    -- Parameters
    @IN_courseId UNIQUEIDENTIFIER,
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

        IF @IN_currentUserId IS NULL
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        IF @IN_courseId IS NULL
        BEGIN
            RAISERROR('course_id_required', 16, 1);
        END;

        -- Check if the course exists

        IF NOT EXISTS (
            SELECT 1
            FROM [dbo].[Course]
            WHERE [courseId] = @IN_courseId
        )
        BEGIN
            RAISERROR('course_not_found', 16, 1);
        END;

        -- Return the user data in JSON format
        SELECT
            c.[courseId],
            c.[professorId],
            c.[name],
			c.[description],
			c.[semester],
			c.[code],
            CONCAT(CONVERT(VARCHAR(32), c.[createdDate], 126), 'Z') as [createdDate],
            CONCAT(CONVERT(VARCHAR(32), c.[modifiedDate], 126), 'Z') as [modifiedDate]
        FROM
            [dbo].[Course] c
        WHERE
            c.[courseId] = @IN_courseId
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