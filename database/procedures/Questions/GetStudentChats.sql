--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-28
-- Description:  Get the student's chats.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Questions_GetStudentChats]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_studentId UNIQUEIDENTIFIER = NULL,
	@IN_courseId UNIQUEIDENTIFIER = NULL

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

		IF @IN_studentId IS NULL
        BEGIN
            RAISERROR ('id_student_required', 16, 1);
        END;

		IF @IN_courseId IS NULL
        BEGIN
            RAISERROR ('id_course_required', 16, 1);
        END;

        -- START TRANSACTION
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

        -- SELECT CHATS HISTORY
        SELECT 
            D.documentId AS documentId,
			D.title AS documentTitle,          
			COUNT(Q.questionId) AS questionCount 
		FROM
			[dbo].[Question] AS Q
		INNER JOIN 
			[dbo].[Document] AS D ON Q.documentId = D.documentId
		INNER JOIN 
			[dbo].[CourseDocument] AS CD ON CD.documentId = D.documentId
		INNER JOIN 
			[dbo].[CourseStudent] AS CS ON CS.courseId = CD.courseId
		WHERE 
			CS.studentId = @IN_studentId
			AND Q.userId = @IN_studentId
			AND CD.courseId = @IN_courseId
			AND CS.courseId = @IN_courseId    
			AND D.isDeleted IS NULL
			AND CD.isDeleted IS NULL
			AND CS.idDeleted IS NULL
		GROUP BY 
			D.title, D.createdDate, D.documentId       
		ORDER BY 
			D.createdDate DESC
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