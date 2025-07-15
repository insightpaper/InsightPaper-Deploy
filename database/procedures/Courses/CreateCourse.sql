--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-03-24
-- Description:  Creates a new course.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Courses_CreateCourse]
    -- Parameters
    @IN_name NVARCHAR(64),
    @IN_description NVARCHAR(1500),
    @IN_semester NUMERIC(1, 0),
    @IN_currentUserId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
	DECLARE @code INTEGER = 10000;
	DECLARE @lastCode INTEGER;
    DECLARE @courseId UNIQUEIDENTIFIER;
    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

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
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		SELECT @lastCode = ISNULL(MAX(CONVERT(INTEGER, [code])), 9999) FROM [dbo].[Course];
		SET @code = @lastCode + 1;

		WHILE EXISTS (SELECT 1 FROM [dbo].[Course] WHERE [code] = CONVERT(VARCHAR, @code))
		BEGIN
			SET @code = @code + 1;
		END

        -- INSERT COURSE
        INSERT INTO [dbo].[Course]
        (
            [name],
            [description],
            [semester],
			[createdDate],
			[modifiedDate],
			[code],
			[professorId]
        )
        VALUES
        (
            @IN_name,
            @IN_description,
            @IN_semester,
			GETDATE(),
			GETDATE(),
			CONVERT(VARCHAR, @code),
			@IN_currentUserId
        );

        SET @courseId = (SELECT courseId FROM [dbo].[Course] WHERE [code] = @code)

		SELECT courseId AS [affectedEntityId],
			code AS [courseCode]
		FROM [dbo].[View_ExistingCourses]
		WHERE [courseId] = @courseId;

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