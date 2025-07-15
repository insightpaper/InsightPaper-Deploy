--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-03-24
-- Description:  Join in a new course.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_JoinCourse]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_courseCode VARCHAR(32) = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
	DECLARE @courseId UNIQUEIDENTIFIER;
	DECLARE @courseStudentId UNIQUEIDENTIFIER;
    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        IF @IN_courseCode IS NULL OR @IN_courseCode = '' OR NOT EXISTS(SELECT 1 FROM [dbo].[Course] WHERE [code] = @IN_courseCode)
        BEGIN
            RAISERROR ('course_code_required', 16, 1);
        END;

		SET @courseId = (SELECT [courseId] from [dbo].[Course] WHERE [code] = @IN_courseCode);

		IF EXISTS(SELECT 1 FROM [CourseStudent] WHERE [courseId] = @courseId AND [studentId] = @IN_currentUserId AND ([idDeleted] IS NULL))
		 BEGIN
            RAISERROR ('student_already_in_course', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		SET @courseId = (SELECT [courseId] from [dbo].[Course] WHERE [code] = @IN_courseCode);

        -- INSERT COURSESTUDENT
        INSERT INTO [dbo].[CourseStudent]
        (
            [courseId],
            [studentId],
			[createdDate],
			[modifiedDate]
        )
        VALUES
        (
			@courseId,
            @IN_currentUserId,
			GETDATE(),
			GETDATE()
        );

		SET @courseStudentId = (SELECT courseStudentId FROM [dbo].[CourseStudent] 
										WHERE [courseId] = @courseId AND [studentId] = @IN_currentUserId
												AND ([idDeleted] IS NULL));

		SELECT courseStudentId AS [affectedEntityId]
		FROM [dbo].[View_ExistingCourseStudents]
		WHERE [courseStudentId] = @courseStudentId;

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