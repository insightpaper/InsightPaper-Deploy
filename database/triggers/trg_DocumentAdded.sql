--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-05-01
-- Description:  Create notification for created document.
--------------------------------------------------------------------------

CREATE OR ALTER TRIGGER trg_DocumentAdded
ON [dbo].[Document]
AFTER INSERT
AS
BEGIN
    DECLARE @documentId UNIQUEIDENTIFIER;
    DECLARE @courseId UNIQUEIDENTIFIER;
    DECLARE @professorId UNIQUEIDENTIFIER;
    DECLARE @courseName NVARCHAR(64);
	DECLARE @studentId UNIQUEIDENTIFIER;

    -- OBTAIN DOCUMENT
    SELECT 
        @documentId = documentId
    FROM INSERTED;

    -- OBTAIN COURSE INFORMATION
    SELECT 
        @courseId = CD.courseId,
        @courseName = C.name 
    FROM [dbo].[CourseDocument] AS CD
    JOIN [dbo].[Course] AS C ON C.courseId = CD.courseId
    WHERE CD.documentId = @documentId;

	-- OBTAIN PROFESORID
    SELECT 
        @professorId = C.professorId
    FROM [dbo].[Course] AS C
    WHERE C.courseId = @courseId;

    -- OBTAIN THE STUDENT
    SELECT @studentId = studentId
    FROM [dbo].[CourseDocument] AS CD
    WHERE CD.documentId = @documentId
    AND CD.courseId = @courseId;

    -- IF THE STUDENTS UPLOAD THE DOCUMENT
    IF @studentId IS NOT NULL
    BEGIN
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
        VALUES
        (
            @professorId,
            'Nuevo Documento Agregado', 
            'El estudiante ha agregado un nuevo documento en el curso ' + @courseName,  
            0,
            'Document',
			@documentId,
            0, 
            GETUTCDATE() 
        );
    END
    ELSE
    BEGIN
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
            'Nuevo Documento Disponible', 
            'Se ha agregado un nuevo documento en el curso ' + @courseName, 
            0,
            'Document',
			@documentId,
            0,  
            GETUTCDATE()  
        FROM [dbo].[CourseStudent] AS CS
        WHERE CS.courseId = @courseId; 
    END

END;
GO