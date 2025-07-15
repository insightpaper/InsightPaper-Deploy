--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-03-27
-- Description:  Updates a course information.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_UpdateCourse]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER,
	@IN_courseId UNIQUEIDENTIFIER,
    @IN_name VARCHAR(64),
    @IN_description NVARCHAR(1500),
    @IN_semester NUMERIC(1, 0)
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
        IF @IN_name IS NULL OR @IN_name = ''
        BEGIN
			RAISERROR ('name_required', 16, 1);
        END;

        IF @IN_description IS NULL OR @IN_description = ''
        BEGIN
            RAISERROR ('description_required', 16, 1);
        END;

        IF @IN_semester IS NULL OR @IN_semester > 2 OR @IN_semester < 1
        BEGIN
            RAISERROR ('semester_required', 16, 1);
        END;       
            
        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
                SET @transactionStarted = 1;
                BEGIN TRANSACTION;
            END;

        -- UPDATE COURSE
        UPDATE [dbo].[Course]
        SET [name] = @IN_name,
            [description] = @IN_description,
            [semester] = @IN_semester,
            [modifiedDate]   = GETDATE()
        WHERE [courseId] = @IN_courseId;

        SELECT [courseId] AS [affectedEntityId]
        FROM [dbo].[View_ExistingCourses]
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