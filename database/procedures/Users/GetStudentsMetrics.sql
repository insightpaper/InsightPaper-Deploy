--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-06-02
-- Description:  Get the students metrics.
--------------------------------------------------------------------------

CREATE OR ALTER    PROCEDURE [dbo].[SP_Users_GetStudentsMetrics]
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

		-- GET METRICS
        SELECT 
			u.userId AS studentId,
			u.name AS studentName,
			ISNULL((
				SELECT COUNT(*)
				FROM Question q
				JOIN CourseDocument cd ON cd.documentId = q.documentId
				WHERE q.evaluation = 1 AND q.userId = u.userId AND cd.courseId = cs.courseId
			), 0) AS positiveEvaluations,
			ISNULL((
				SELECT COUNT(*)
				FROM Question q
				JOIN CourseDocument cd ON cd.documentId = q.documentId
				WHERE q.evaluation = 0 AND q.userId = u.userId AND cd.courseId = cs.courseId
			), 0) AS negativeEvaluations,
			ISNULL((
				SELECT COUNT(DISTINCT q.documentId)
				FROM Question q
				JOIN CourseDocument cd ON cd.documentId = q.documentId
				WHERE q.userId = u.userId AND cd.courseId = cs.courseId
			), 0) AS numberOfChats,
			ISNULL((
				SELECT COUNT(*)
				FROM CourseDocument cd
				WHERE cd.studentId = u.userId AND cd.courseId = cs.courseId AND cd.isDeleted IS NULL
			), 0) AS ownDocuments
		FROM CourseStudent cs
		JOIN Users u ON u.userId = cs.studentId
		WHERE cs.courseId = @IN_courseId AND cs.idDeleted IS NULL AND u.isDeleted != 1
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