--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-05-10
-- Description:  Get the course activity.
--------------------------------------------------------------------------

ALTER      PROCEDURE [dbo].[SP_Courses_GetCourseActivity]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_courseId  UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_courseId IS NULL
        BEGIN
            RAISERROR('course_id_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		-- GET ACTIVITY
		SELECT 
			COUNT(DISTINCT Q.documentId) AS numberOfChats, 
			COUNT(Q.questionId) AS numberOfQuestions,     
			COUNT(R.responseId) AS numberOfResponses       
		FROM 
			[dbo].[Question] AS Q
		LEFT JOIN 
			[dbo].[Response] AS R ON Q.questionId = R.questionId
		JOIN
			[dbo].[CourseDocument] AS D ON Q.documentId = D.documentId 
		WHERE 
			D.courseId = @IN_courseId    
		GROUP BY 
			D.courseId
		FOR JSON PATH;
        

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