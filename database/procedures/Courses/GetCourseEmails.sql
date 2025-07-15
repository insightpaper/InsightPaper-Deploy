--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-06-02
-- Description:  Get all the emails of a course.
--------------------------------------------------------------------------

CREATE OR ALTER  PROCEDURE [dbo].[SP_Courses_GetCourseEmails]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_courseId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- DECLARATIONS
	 DECLARE @courseName NVARCHAR(64);

    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_courseId IS NULL
        BEGIN
            RAISERROR('course_ id_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;


        -- GET EMAILS

		SELECT @courseName = name
		FROM Course
		WHERE courseId = @IN_courseId AND idDeleted IS NULL;

		SELECT 
			@courseName AS courseName,
			u.email AS studentEmail
		FROM CourseStudent cs
		JOIN Users u ON u.userId = cs.studentId
		WHERE cs.courseId = @IN_courseId 
		  AND cs.idDeleted IS NULL 
		  AND u.isDeleted = 0;
        

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