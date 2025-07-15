--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-06-02
-- Description:  Get the professors activity.
--------------------------------------------------------------------------

CREATE OR ALTER    PROCEDURE [dbo].[SP_Users_GetProfesorsActivity]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    
    BEGIN TRY

        -- VALIDATIONS
        IF dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        -- START TRANSACTION
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		-- GET ACTIVITY
        SELECT 
			u.userId AS professorId,
			u.name AS professorName,
			ISNULL((
				SELECT COUNT(*)
				FROM Question q
				JOIN Comment c ON c.questionId = q.questionId
				JOIN CourseDocument cd ON cd.documentId = q.documentId
				JOIN Course Cu ON cu.courseId = cd.courseId
				WHERE c.isPrivate = 1
					AND Cu.professorId = u.userId
			), 0) AS privateComments,
			ISNULL((
				SELECT COUNT(*)
				FROM Question q
				JOIN Comment c ON c.questionId = q.questionId
				JOIN CourseDocument cd ON cd.documentId = q.documentId
				JOIN Course cu ON cu.courseId = cd.courseId
				WHERE (c.isPrivate = 0 OR c.isPrivate IS NULL)
				  AND cu.professorId = u.userId
			), 0) AS publicComments,
			ISNULL((
				SELECT COUNT(*)
				FROM Question q
				JOIN CourseDocument cd ON cd.documentId = q.documentId
				JOIN Course cu ON cu.courseId = cd.courseId
				WHERE cu.professorId = u.userId AND q.evaluation = 1
			), 0) AS evaluations,
			ISNULL((
				SELECT COUNT(*)
				FROM Course c
				WHERE c.professorId = u.userId AND c.idDeleted IS NULL
			), 0) AS courses,
			ISNULL((
				SELECT COUNT(*)
				FROM Course c
				JOIN CourseDocument cd ON cd.courseId = c.courseId
				WHERE c.professorId = u.userId AND cd.isDeleted IS NULL
			), 0) AS documentsUploaded,
			ISNULL((
				SELECT COUNT(DISTINCT cs.studentId)
				FROM Course c
				JOIN CourseStudent cs ON cs.courseId = c.courseId
				WHERE c.professorId = u.userId AND cs.idDeleted IS NULL
			), 0) AS students,
			(
				SELECT 
					c.name AS courseName,
					COUNT(DISTINCT cs.studentId) AS studentCount
				FROM Course c
				LEFT JOIN CourseStudent cs ON cs.courseId = c.courseId AND cs.idDeleted IS NULL
				WHERE c.professorId = u.userId AND c.idDeleted IS NULL
				GROUP BY c.name
				FOR JSON PATH
			) AS [studentsPerCourse (JSON)]
		FROM Users AS U
		INNER JOIN UserRoles AS UR ON UR.userId = U.userId
		INNER JOIN Roles AS R ON R.roleId = UR.roleId
		WHERE R.roleId = 2 AND U.isDeleted != 1
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