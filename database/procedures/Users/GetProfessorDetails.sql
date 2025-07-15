--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-22
-- Description:  Get the professor details.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Users_GetProfessorDetails]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_professorId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
	DECLARE @professorData NVARCHAR(MAX);
	DECLARE @coursesData NVARCHAR(MAX);
	DECLARE @documentsData NVARCHAR(MAX);
	DECLARE @studentsData NVARCHAR(MAX);

    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Admin') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_professorId IS NULL
        BEGIN
            RAISERROR('professor_id_required', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		-- GET PROFESSOR DETAILS
		-- GENERAL DATA
        SELECT @professorData = (
		SELECT 
            P.userId AS professorId,
            P.name AS professorName,
            P.email AS professorEmail,
            P.createdDate AS professorCreatedDate,
            P.modifiedDate AS professorModifiedDate
        FROM [dbo].[Users] AS P
        WHERE P.userId = @IN_professorId
		FOR JSON PATH
		);
		
		-- COURSE DATA
        SELECT @coursesData = (
		SELECT 
            C.courseId,
            C.name AS courseName,
            C.description AS courseDescription,
            C.semester AS courseSemester,
            C.createdDate AS courseCreatedDate,
            C.modifiedDate AS courseModifiedDate
        FROM [dbo].[Course] AS C
        WHERE C.professorId = @IN_professorId
		AND C.idDeleted IS NULL
		FOR JSON PATH
		);

		-- DOCUMENT DATA
		SELECT @documentsData = (
		SELECT 
			C.courseId,
			D.documentId,
			D.title AS documentTitle,
			D.description AS documentDescription,
			D.labels AS documentLabels,
			D.createdDate AS documentCreatedDate,
			D.modifiedDate AS documentModifiedDate,
			D.firebaseUrl AS documentFirebaseUrl
		FROM [dbo].[CourseDocument] AS CD
		JOIN [dbo].[Document] AS D ON CD.documentId = D.documentId
		JOIN [dbo].[Course] AS C ON CD.courseId = C.courseId
		WHERE C.professorId = @IN_professorId
		AND D.isDeleted IS NULL
		AND CD.studentId IS NULL
		ORDER BY C.courseId, D.createdDate DESC
		FOR JSON PATH
		);

		-- STUDENT DATA
		SELECT @studentsData = (
		SELECT 
            S.userId AS studentId,
            S.name AS studentName,
            S.email AS studentEmail,
            S.createdDate AS studentCreatedDate
        FROM [dbo].[Users] AS S
        JOIN [dbo].[CourseStudent] AS CS ON S.userId = CS.studentId
        JOIN [dbo].[Course] AS C ON CS.courseId = C.courseId
        WHERE C.professorId = @IN_professorId 
		AND CS.idDeleted IS NULL
		FOR JSON PATH
		);
		
		SET @professorData = REPLACE(@professorData, '\\', '');
		SET @coursesData = REPLACE(@coursesData, '\\', '');
		SET @documentsData = REPLACE(@documentsData, '\\', '');
		SET @studentsData = REPLACE(@studentsData, '\\', '');

        -- FINAL DATA
		SELECT 
			professorData = @professorData,
			courses = @coursesData,
			documents = @documentsData,
			students = @studentsData
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