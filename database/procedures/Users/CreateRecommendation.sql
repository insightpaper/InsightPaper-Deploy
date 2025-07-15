--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-06-01
-- Description:  Create new recommendation.
--------------------------------------------------------------------------

CREATE OR ALTER   PROCEDURE [dbo].[SP_Users_CreateRecommendation]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_courseId UNIQUEIDENTIFIER = NULL,
	@IN_documentId UNIQUEIDENTIFIER = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
    DECLARE @courseName NVARCHAR(64);
	DECLARE @documentName NVARCHAR(128);
    
    BEGIN TRY

        -- VALIDATIONS
        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_courseId IS NULL
        BEGIN
            RAISERROR ('course_required', 16, 1);
        END;
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		SELECT 
			@courseName = name
		FROM [dbo].[Course] 
		WHERE courseId = @IN_courseId;

		SELECT
			@documentName = title
		FROM [dbo].[Document]
		WHERE documentId = @IN_documentId;

		-- INSERT THE NOTIFICATION
			INSERT INTO [dbo].[Notifications] 
			(
				userId,
				title,
				message,
				isRead,
				objectType,
				objectNotificatedId,
				isDeleted,
				createdDate
			)
			SELECT 
				CS.studentId,  
				'Nueva recomendacion de documento', 
				'Se les recomienda el documento' + @documentName + ' del curso ' + @courseName, 
				0,
				'Recommendation',
				@IN_documentId,
				0,  
				GETUTCDATE()  
			FROM [dbo].[CourseStudent] AS CS
			WHERE CS.courseId = @IN_courseId
			AND CS.idDeleted != 1;

		SELECT SCOPE_IDENTITY() AS lastNotificationId;

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