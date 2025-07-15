--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-03-27
-- Description:  Get all the courses of the professor.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_GetCoursesProfessor]
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

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;


        -- GET COURSES
		SELECT YEAR(createdDate) AS year,
		   (
			   SELECT courseId,
					  code,
					  name,
					  description,
					  semester,
					  professorId,
					  createdDate,
					  modifiedDate
			   FROM [dbo].[Course] AS C
			   WHERE C.professorId = @IN_currentUserId
			   AND C.idDeleted IS NULL
			   AND YEAR(C.createdDate) = YEAR(OuterQuery.createdDate)
			   ORDER BY C.semester DESC,  
						C.name ASC
			   FOR JSON PATH
		   ) AS courses
			FROM [dbo].[Course] AS OuterQuery
			WHERE professorId = @IN_currentUserId
			AND idDeleted IS NULL
			GROUP BY YEAR(createdDate)
			ORDER BY YEAR(createdDate) DESC
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