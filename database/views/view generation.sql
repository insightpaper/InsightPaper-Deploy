CREATE OR ALTER VIEW View_ExistingUsers AS
SELECT *
FROM Users
WHERE isDeleted = 0;

CREATE OR ALTER VIEW View_ExistingNotifications AS
SELECT *
FROM Notifications
WHERE isDeleted = 0;

CREATE OR ALTER VIEW [dbo].[View_ExistingCourses] AS
SELECT *
FROM Course
WHERE idDeleted IS NULL;
GO

CREATE OR ALTER VIEW [dbo].[View_ExistingCourseStudents] AS
SELECT *
FROM Course
WHERE idDeleted IS NULL;
GO

CREATE   VIEW [dbo].[View_ExistingDocuments] AS
SELECT *
FROM Document
WHERE isDeleted IS NULL;
GO

CREATE   VIEW [dbo].[View_ExistingQuestions] AS
SELECT *
FROM Question
WHERE isDeleted IS NULL;
GO

CREATE   VIEW [dbo].[View_ExistingResponses] AS
SELECT *
FROM Response
WHERE isDeleted IS NULL;
GO