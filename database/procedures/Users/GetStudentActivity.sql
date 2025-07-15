--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-05-10
-- Description:  Get the student activity.
--------------------------------------------------------------------------

CREATE OR ALTER    PROCEDURE [dbo].[SP_Users_GetStudentActivity]
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
            RAISERROR('student_id_required', 16, 1);
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
        -- General KPIs
        SELECT
            COUNT(DISTINCT q.documentId) AS documentsViewed,
            COUNT(DISTINCT q.documentId) AS numberOfChats,
            COUNT(q.questionId) AS numberOfQuestions,
            COUNT(r.responseId) AS numberOfResponses
        FROM Question AS Q
		LEFT JOIN Response AS R ON R.questionId = Q.questionId
		WHERE Q.userId = @IN_studentId
		AND EXISTS (SELECT 1 FROM CourseDocument AS CD WHERE CD.courseId = @IN_courseId AND CD.documentId = Q.documentId AND CD.isDeleted IS NULL)
		AND EXISTS (SELECT 1 FROM CourseStudent AS CU WHERE CU.studentId = @IN_studentId AND CU.courseId = @IN_courseId AND CU.idDeleted IS NULL)
        FOR JSON PATH, ROOT('generalStats');

        -- Document stats (questions per document)
		SELECT
			d.documentId,
			d.title,
			COUNT(DISTINCT q.questionId) AS questions,
			COUNT(DISTINCT r.responseId) AS responses
		FROM Question q
		JOIN Document d ON d.documentId = q.documentId
		LEFT JOIN Response r ON r.questionId = q.questionId
		WHERE q.userId = @IN_studentId
		  AND q.documentId IN (
			  SELECT documentId FROM CourseDocument WHERE courseId = @IN_courseId
		  )
		  AND d.isDeleted IS NULL
		GROUP BY d.documentId, d.title

		UNION

		SELECT
			NULL AS documentId,
			'Sin datos' AS title,
			0 AS questions,
			0 AS responses
		WHERE NOT EXISTS (
			SELECT 1
			FROM Question q
			JOIN Document d ON d.documentId = q.documentId
			WHERE q.userId = @IN_studentId
			  AND q.documentId IN (
				  SELECT documentId FROM CourseDocument WHERE courseId = @IN_courseId
			  )
			  AND d.isDeleted IS NULL
		)FOR JSON PATH, ROOT('documentsStats');

        -- Timeline: activity grouped by date
        SELECT
            CAST(q.createdDate AS DATE) AS activityDate,
            COUNT(q.questionId) AS questions,
            COUNT(r.responseId) AS responses
        FROM Question q
        LEFT JOIN Response r ON r.questionId = q.questionId
        WHERE q.userId = @IN_studentId
            AND q.documentId IN (SELECT documentId FROM CourseDocument WHERE courseId = @IN_courseId)
        GROUP BY CAST(q.createdDate AS DATE)
        ORDER BY activityDate
        FOR JSON PATH, ROOT('activityTimeline');
        

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