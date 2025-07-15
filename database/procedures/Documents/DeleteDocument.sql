--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-08
-- Description:  Creates a new document.
--------------------------------------------------------------------------

ALTER OR CREATE PROCEDURE [dbo].[SP_Documents_CreateDocument]
    -- Parameters
    @IN_title NVARCHAR(128),
    @IN_description NVARCHAR(1028),
    @IN_labels NVARCHAR(512),
	@IN_firebaseUrl NVARCHAR(512),
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_courseId UNIQUEIDENTIFIER = NULL

AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- VARIABLE DECLARATION
	DECLARE @documentId UNIQUEIDENTIFIER;
	DECLARE @isStudent bit = 0;
	DECLARE @courseId UNIQUEIDENTIFIER;
    DECLARE @courseName NVARCHAR(64);
	DECLARE @documentName NVARCHAR(128);
    
    BEGIN TRY

        -- VALIDATIONS

        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0 AND dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

		IF @IN_courseId IS NULL
        BEGIN
            RAISERROR ('course_required', 16, 1);
        END;

        IF @IN_title IS NULL OR @IN_title = ''
        BEGIN
            RAISERROR ('title_required', 16, 1);
        END;

        IF @IN_description IS NULL OR @IN_description = ''
        BEGIN
            RAISERROR ('description_required', 16, 1);
        END;

        IF @IN_labels IS NULL OR @IN_labels = ''
        BEGIN
            RAISERROR ('labels_required', 16, 1);
        END;

        IF ISJSON(@IN_labels) = 0
		BEGIN
			RAISERROR ('invalid_labels_format', 16, 1);
		END;

		DECLARE @jsonArray NVARCHAR(MAX) = @IN_labels;

		-- IF @jsonArray = '[]'
		-- BEGIN
		-- 	RETURN;
		-- END
		-- ELSE
		-- 	BEGIN
		-- 	IF NOT EXISTS (
		-- 		SELECT 1
		-- 		FROM OPENJSON(@jsonArray) 
		-- 		WITH (label NVARCHAR(512) '$') AS jsonData
		-- 		WHERE jsonData.label IS NOT NULL AND ISJSON(jsonData.label) = 0
		-- 	)
		-- 	BEGIN
		-- 		RAISERROR ('invalid_labels_format', 16, 1);
		-- 	END;
		-- END;

        -- START TRANSACTION
        
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		-- USER TYPE
		IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 1
        BEGIN
            SET @isStudent = 1
        END;

        -- INSERT DOCUMENT
        INSERT INTO [dbo].[Document]
        (
            [title],
            [description],
            [labels],
			[createdDate],
			[modifiedDate],
			[firebaseUrl]
        )
        VALUES
        (
            @IN_title,
            @IN_description,
            @IN_labels,
			GETDATE(),
			GETDATE(),
			@IN_firebaseUrl
        );

		SET @documentId = (SELECT TOP 1 documentId FROM [dbo].[Document] ORDER BY createdDate DESC);

		IF @isStudent = 1
		BEGIN
			INSERT INTO [dbo].[CourseDocument]
			(
				[courseId],
				[documentId],
				[createdDate],
				[modifiedDate],
				[studentId]
			)
			VALUES
			(
				@IN_courseId,
				@documentId,
				GETDATE(),
				GETDATE(),
				@IN_currentUserId
			)
		END
		ELSE
		BEGIN
			INSERT INTO [dbo].[CourseDocument]
			(
				[courseId],
				[documentId],
				[createdDate],
				[modifiedDate]
			)
			VALUES
			(
				@IN_courseId,
				@documentId,
				GETDATE(),
				GETDATE()
			)
		END

        INSERT INTO [dbo].[History] (
            [title],
            [description],
            [labels],
            [createdDate],
            [documentId]
        )
        VALUES (
            @IN_title,
            @IN_description,
            @IN_labels,
            GETDATE(),
            @documentId
        );

		SELECT 
			@courseId = CD.courseId,
			@courseName = C.name 
		FROM [dbo].[CourseDocument] AS CD
		JOIN [dbo].[Course] AS C ON C.courseId = CD.courseId
		WHERE CD.documentId = @documentId;

		SELECT
			@documentName = title
		FROM [dbo].[Document]
		WHERE documentId = @documentId

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
				'Documento creado', 
				'Se creo un documento de nombre' + @documentName + 'en el curso ' + @courseName, 
				0,
				'Document',
				@documentId,
				0,  
				GETUTCDATE()  
			FROM [dbo].[CourseStudent] AS CS
			WHERE CS.courseId = @courseId
			AND CS.idDeleted = 1;

		SELECT documentId AS [affectedEntityId]
		FROM [dbo].[View_ExistingDocuments]
		WHERE [documentId] = @documentId;

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