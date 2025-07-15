--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-03-27
-- Description:  Delete a course.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_DeleteCourse]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER,
	@IN_courseId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    BEGIN TRY

        -- VALIDATE CURRENT USER
        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;
        
        -- VALIDATIONS
        IF NOT EXISTS(SELECT 1 FROM [dbo].[Course] WHERE [courseId] = @IN_courseId)
        BEGIN
            RAISERROR ('course_id_required', 16, 1);
        END;       
            
        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
                SET @transactionStarted = 1;
                BEGIN TRANSACTION;
            END;

        -- DELETE COURSE
        UPDATE [dbo].[Course]
        SET [idDeleted] = 1
        WHERE [courseId] = @IN_courseId;

		SELECT courseId AS [affectedEntityId]
		FROM [dbo].[Course]
		WHERE [courseId] = @IN_courseId;

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
                VALUES (SUSER_NAME(),
                        ERROR_NUMBER(),
                        ERROR_STATE(),
                        ERROR_SEVERITY(),
                        ERROR_LINE(),
                        ERROR_PROCEDURE(),
                        ERROR_MESSAGE(),
                        GETUTCDATE());
            END;

        RAISERROR ('%s - Error Number: %i',
            @errorSeverity, @errorState, @errorMessage, @errorNumber);

    END CATCH;
END;