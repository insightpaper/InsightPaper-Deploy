--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-08
-- Description:  Updates a document information.
--------------------------------------------------------------------------

ALTER OR CREATE PROCEDURE [dbo].[SP_Documents_UpdateDocument]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER,
	@IN_documentId UNIQUEIDENTIFIER,
    @IN_title VARCHAR(128),
    @IN_description VARCHAR(1000),
    @IN_labels VARCHAR(512),
	--@IN_firebaseUrl NVARCHAR(512)
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

	-- DECLARATONS
    DECLARE @courseId UNIQUEIDENTIFIER;
    DECLARE @courseName NVARCHAR(64);
	DECLARE @documentName NVARCHAR(128);

    BEGIN TRY

        -- VALIDATE CURRENT USER
        IF dbo.CheckUserRole(@IN_currentUserId, 'Professor') = 0 AND dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;
        
        -- VALIDATIONS
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
            
        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
                SET @transactionStarted = 1;
                BEGIN TRANSACTION;
            END;

        -- UPDATE DOCUMENT
        UPDATE [dbo].[Document]
        SET [title] = @IN_title,
            [description] = @IN_description,
            [labels] = @IN_labels,
			--[firebaseUrl] = @IN_firebaseUrl,
            [modifiedDate] = GETDATE()
        WHERE [documentId] = @IN_documentId;

        -- INSERT HISTORY RECORD
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
            @IN_documentId
        );

		SELECT 
			@courseId = CD.courseId,
			@courseName = C.name 
		FROM [dbo].[CourseDocument] AS CD
		JOIN [dbo].[Course] AS C ON C.courseId = CD.courseId
		WHERE CD.documentId = @IN_documentId;

		SELECT
			@documentName = title
		FROM [dbo].[Document]
		WHERE documentId = @IN_documentId

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
				'Documento actualizado', 
				'Se modifico un documento de nombre' + @documentName + 'en el curso ' + @courseName, 
				0,
				'Document',
				@IN_documentId,
				0,  
				GETUTCDATE()  
			FROM [dbo].[CourseStudent] AS CS
			WHERE CS.courseId = @courseId
			AND CS.idDeleted = 1;

        SELECT [documentId] AS [affectedEntityId]
        FROM [dbo].[View_ExistingDocuments]
        WHERE [documentId] = @IN_documentId;

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
