--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-04-14
-- Description:  Remove a student from a course (professor action).
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_RemoveStudent]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
    @IN_courseId UNIQUEIDENTIFIER = NULL,
    @IN_studentId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @courseStudentId UNIQUEIDENTIFIER;

    BEGIN TRY
        -- VALIDATIONS

        -- Check role
        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        -- Check course exists
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Course] WHERE courseId = @IN_courseId)
        BEGIN
            RAISERROR('course_not_found', 16, 1);
        END;

        -- Check professor is the owner of the course
        IF NOT EXISTS (
            SELECT 1 FROM [dbo].[Course]
            WHERE courseId = @IN_courseId AND professorId = @IN_currentUserId
        )
        BEGIN
            RAISERROR('not_course_owner', 16, 1);
        END;

        -- Check if student is enrolled in course
        SELECT @courseStudentId = courseStudentId
        FROM [dbo].[CourseStudent]
        WHERE courseId = @IN_courseId AND studentId = @IN_studentId AND idDeleted IS NULL;

        IF @courseStudentId IS NULL
        BEGIN
            RAISERROR('student_not_enrolled', 16, 1);
        END;

        -- START TRANSACTION
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- DELETE LOGIC (soft delete)
        UPDATE [dbo].[CourseStudent]
        SET idDeleted = 1
        WHERE courseStudentId = @courseStudentId;

        -- OUTPUT AFFECTED ENTITY
        SELECT courseStudentId AS [affectedEntityId]
        FROM [dbo].[CourseStudent]
        WHERE courseStudentId = @courseStudentId;

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
