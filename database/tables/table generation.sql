--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Generates the tables for the database.
--------------------------------------------------------------------------

CREATE TABLE Errors
(
    errorId INT IDENTITY PRIMARY KEY,
    username VARCHAR(128),
    errorNumber INT,
    errorState INT,
    errorSeverity INT,
    errorLine INT,
    errorProcedure VARCHAR(MAX),
    errorMessage NVARCHAR(MAX),
    errorDate DATETIME NOT NULL
);

CREATE TABLE Users
(
    userId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    userId_int INT NOT NULL IDENTITY,
    name NVARCHAR(64) COLLATE Latin1_General_CI_AI NOT NULL,
    email NVARCHAR(128) NOT NULL,
    password NVARCHAR(128) NOT NULL,
    passwordChanged BIT NOT NULL DEFAULT 0,
    pictureUrl NVARCHAR(256),
    securityCode NVARCHAR(128),
    securityCodeExpiration DATETIME,
    doubleFactorEnabled BIT NOT NULL DEFAULT 0,
    otpSecret NVARCHAR(128),
    createdDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    modifiedDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    isDeleted BIT DEFAULT 0,
)

CREATE INDEX idx_users_email ON Users (email);

CREATE TABLE SystemLog
(
    logId INT PRIMARY KEY IDENTITY,
    userId UNIQUEIDENTIFIER NOT NULL,
    affectedEntity NVARCHAR(64) NOT NULL,
    affectedEntityId INT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT GETUTCDATE(),
    rowData NVARCHAR(MAX) NOT NULL,
    ipAddress VARCHAR(64),
    userAgent VARCHAR(256),
    FOREIGN KEY (userId) REFERENCES Users (userId)
);

CREATE TABLE Roles
(
    roleId INT IDENTITY PRIMARY KEY,
    name NVARCHAR(32) NOT NULL
);

CREATE TABLE UserRoles
(
    userRoleId INT IDENTITY PRIMARY KEY,
    userId UNIQUEIDENTIFIER NOT NULL,
    roleId INT NOT NULL,
    enabled BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (roleId) REFERENCES Roles(roleId)
);

CREATE TABLE Notifications
(
    notificationId INT IDENTITY(1,1) PRIMARY KEY,
    userId UNIQUEIDENTIFIER NOT NULL,
    title NVARCHAR(100) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    isRead BIT NOT NULL DEFAULT 0,
    objectId UNIQUEIDENTIFIER,
    objectType NVARCHAR(50) NOT NULL,
    isDeleted BIT NOT NULL DEFAULT 0,
    createdDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE Tokens
(
    tokenId NVARCHAR(32) PRIMARY KEY NOT NULL,
    isUsed BIT NOT NULL DEFAULT 0,
    createdDate DATETIME NOT NULL DEFAULT GETUTCDATE(),
);

CREATE TABLE AdminProfessor
(
    adminProfessorId UNIQUEIDENTIFIER PRIMARY KEY,
    adminrId UNIQUEIDENTIFIER NOT NULL,
    professorId UNIQUEIDENTIFIER NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    idDeleted BIT NULL,
    FOREIGN KEY (adminrId) REFERENCES Users(userId),
    FOREIGN KEY (professorId) REFERENCES Users(userId)
);

CREATE TABLE Course
(
    courseId UNIQUEIDENTIFIER PRIMARY KEY,
    professorId UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(64) NOT NULL,
    description NVARCHAR(128) NOT NULL,
    semester NUMERIC(1, 0) NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    idDeleted BIT NULL,
    code VARCHAR(32) NOT NULL,
    FOREIGN KEY (professorId) REFERENCES Users(userId)
);

CREATE TABLE CourseStudent
(
    courseStudentId UNIQUEIDENTIFIER PRIMARY KEY,
    courseId UNIQUEIDENTIFIER NOT NULL,
    studentId UNIQUEIDENTIFIER NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    idDeleted BIT NULL,
    FOREIGN KEY (courseId) REFERENCES Course(courseId),
    FOREIGN KEY (studentId) REFERENCES Users(userId)
);

CREATE TABLE Document
(
    documentId UNIQUEIDENTIFIER PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description VARCHAR(1028) NOT NULL,
    labels VARCHAR(512) NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    isDeleted BIT NULL,
    firebaseUrl NVARCHAR(512) NULL
);

CREATE TABLE History
(
    historyId UNIQUEIDENTIFIER PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description VARCHAR(1028) NOT NULL,
    labels VARCHAR(512) NOT NULL,
    createdDate DATETIME NOT NULL,
    documentId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (documentId) REFERENCES Document(documentId)
);

CREATE TABLE CourseDocument
(
    courseDocumentId UNIQUEIDENTIFIER PRIMARY KEY,
    courseId UNIQUEIDENTIFIER NOT NULL,
    documentId UNIQUEIDENTIFIER NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    studentId UNIQUEIDENTIFIER NULL,
    isDeleted BIT NULL,
    FOREIGN KEY (courseId) REFERENCES Course(courseId),
    FOREIGN KEY (documentId) REFERENCES Document(documentId),
    FOREIGN KEY (studentId) REFERENCES Users(userId)
);

CREATE TABLE Question
(
    questionId UNIQUEIDENTIFIER PRIMARY KEY,
    userId UNIQUEIDENTIFIER NOT NULL,
    documentId UNIQUEIDENTIFIER NOT NULL,
    question NVARCHAR(MAX) NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    isDeleted BIT NULL,
    evaluation BIT NULL,
    FOREIGN KEY (documentId) REFERENCES Document(documentId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
);

CREATE TABLE Response
(
    responseId UNIQUEIDENTIFIER PRIMARY KEY,
    questionId UNIQUEIDENTIFIER NOT NULL,
    response NVARCHAR(MAX) NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    isDeleted BIT NULL,
    FOREIGN KEY (questionId) REFERENCES Question(questionId)
);

CREATE TABLE StudentDocument
(
    studentDocumentId UNIQUEIDENTIFIER PRIMARY KEY,
    userId UNIQUEIDENTIFIER NOT NULL,
    documentId UNIQUEIDENTIFIER NOT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    isDeleted BIT NULL,
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (documentId) REFERENCES Document(documentId)
);

CREATE TABLE Comment
(
    commentId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    commentary NVARCHAR(2048) NOT NULL,
    isPrivate BIT NULL,
    isDeleted BIT NULL,
    createdDate DATETIME NOT NULL,
    modifiedDate DATETIME NOT NULL,
    questionId UNIQUEIDENTIFIER NOT NULL,
    FOREIGN KEY (questionId) REFERENCES Question(questionId)
);

CREATE TABLE Model
(
    modelId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(64) NOT NULL,
    provider NVARCHAR(64) NOT NULL,
    isDeleted BIT NULL
);