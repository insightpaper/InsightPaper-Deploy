--------------------------------------------------------------------------
-- Author:       m.alejandro00@estudiantec.cr
-- Date:         2025-05-13
-- Description:  Get all the documents.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_Documents_GetStudentDocuments]
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
    @IN_pageNumber INT = 1,
    @IN_pageSize INT = 10,
    @IN_orderBy VARCHAR(50) = 'createdDate',
    @IN_orderDirection VARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    BEGIN TRY
        -- VALIDACIONES
        IF dbo.CheckUserRole(@IN_currentUserId, 'Student') = 0
        BEGIN
            RAISERROR('unauthorized', 16, 1);
        END;

        IF @IN_pageNumber IS NOT NULL AND @IN_pageNumber < 1
        BEGIN
            RAISERROR('page_number_invalid', 16, 1);
        END;

        IF @IN_pageSize IS NOT NULL AND @IN_pageSize < 1
        BEGIN
            RAISERROR('page_size_invalid', 16, 1);
        END;

        IF @IN_pageNumber IS NULL AND @IN_pageSize IS NOT NULL
        BEGIN
            RAISERROR('page_number_required', 16, 1);
        END;

        IF @IN_pageSize IS NULL AND @IN_pageNumber IS NOT NULL
        BEGIN
            RAISERROR('page_size_required', 16, 1);
        END;

        IF @IN_orderBy NOT IN ('title', 'description', 'createdDate', 'modifiedDate')
        BEGIN
            RAISERROR('order_by_column_invalid', 16, 1);
        END;

        IF @IN_orderDirection NOT IN ('ASC', 'DESC')
        BEGIN
            RAISERROR('order_by_direction_invalid', 16, 1);
        END;

        -- VALORES POR DEFECTO
        IF @IN_pageNumber IS NULL AND @IN_pageSize IS NULL
        BEGIN
            SET @IN_pageNumber = 1;
            SET @IN_pageSize = (SELECT COUNT(*)
                                FROM [dbo].[StudentDocument] SD
                                JOIN [dbo].[Document] D ON SD.documentId = D.documentId
                                WHERE SD.userId = @IN_currentUserId AND D.isDeleted IS NULL);
        END;

        SET @IN_pageNumber = @IN_pageNumber - 1; -- Índice base cero

        -- INICIO DE TRANSACCIÓN
        SET @transactionStarted = 1;
        BEGIN TRANSACTION;

        DECLARE @sql NVARCHAR(MAX) = N'';
        DECLARE @params NVARCHAR(MAX) = N'
            @IN_currentUserId UNIQUEIDENTIFIER,
            @IN_pageNumber INT,
            @IN_pageSize INT
        ';

        SET @sql = N'
        SELECT (
            SELECT 
                D.documentId,
                D.title,
                D.description,
                JSON_QUERY(D.labels) AS labels,
                SD.userId,
                CONCAT(CONVERT(VARCHAR(32), D.createdDate, 126), ''Z'') AS createdDate,
                CONCAT(CONVERT(VARCHAR(32), D.modifiedDate, 126), ''Z'') AS modifiedDate,
                D.firebaseUrl
            FROM [dbo].[StudentDocument] SD
            JOIN [dbo].[Document] D ON SD.documentId = D.documentId
            WHERE SD.userId = @IN_currentUserId AND D.isDeleted IS NULL
            ORDER BY ' + QUOTENAME(@IN_orderBy) + ' ' + @IN_orderDirection + '
            OFFSET (@IN_pageNumber * @IN_pageSize) ROWS
            FETCH NEXT @IN_pageSize ROWS ONLY
            FOR JSON PATH
        ) AS documents,
        (
            SELECT ISNULL(CEILING(COUNT(*) * 1.0 / @IN_pageSize), 0)
            FROM [dbo].[StudentDocument] SD
            JOIN [dbo].[Document] D ON SD.documentId = D.documentId
            WHERE SD.userId = @IN_currentUserId AND D.isDeleted IS NULL
        ) AS totalPages
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;
        ';

        EXEC sp_executesql
            @sql,
            @params,
            @IN_currentUserId = @IN_currentUserId,
            @IN_pageNumber = @IN_pageNumber,
            @IN_pageSize = @IN_pageSize;

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
            INSERT INTO [dbo].[Errors]
            VALUES (
                SUSER_NAME(),
                @errorNumber,
                @errorState,
                @errorSeverity,
                ERROR_LINE(),
                ERROR_PROCEDURE(),
                @errorMessage,
                GETUTCDATE()
            );
        END;

        RAISERROR('%s - Error Number: %i',
            @errorSeverity, @errorState, @errorMessage, @errorNumber);
    END CATCH;
END;
