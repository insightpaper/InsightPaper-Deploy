--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Creates a log entry in the system log.
--------------------------------------------------------------------------

CREATE OR ALTER PROCEDURE [dbo].[SP_SystemLog_CreateLog]
    -- Parameters
    @IN_userId UNIQUEIDENTIFIER,
    @IN_affectedEntity VARCHAR(64),
    @IN_affectedEntityIds LogEntryType READONLY,
    @IN_ipAddress VARCHAR(64) = NULL,
    @IN_userAgent VARCHAR(256) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION
    DECLARE @columnName VARCHAR(64);
    DECLARE @sql NVARCHAR(MAX);

    BEGIN TRY

        -- VALIDATIONS
        -- Get the name of the column with the INT data type
        SELECT TOP 1 @columnName = COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @IN_affectedEntity
          AND IS_NULLABLE = 'NO'
          AND DATA_TYPE = 'int'
        ORDER BY ORDINAL_POSITION;

        -- Create temporary tables
        CREATE TABLE #IN_affectedEntityIds
        (
            affectedEntityId INT
        );

        INSERT INTO #IN_affectedEntityIds
        SELECT affectedEntityId
        FROM @IN_affectedEntityIds;

        CREATE TABLE #dataForInsertion
        (
            affectedEntityId INT,
            rowData          NVARCHAR(MAX)
        );

        -- Construct the dynamic SQL query for JSON output
        SET @sql = N'
        INSERT INTO #dataForInsertion (affectedEntityId, rowData)
        SELECT ids.affectedEntityId,
               (SELECT *
                FROM ' + QUOTENAME(@IN_affectedEntity) + ' t
                WHERE t.' + QUOTENAME(@columnName) + ' = ids.affectedEntityId
                FOR JSON AUTO)
        FROM #IN_affectedEntityIds ids';

        -- Execute the dynamic SQL query
        EXEC sp_executesql @sql;

        -- START TRANSACTION
        IF @@TRANCOUNT = 0
            BEGIN
                SET @transactionStarted = 1;
                BEGIN TRANSACTION;
            END;

        -- Insert into SystemLog
        INSERT INTO SystemLog (userId, affectedEntity, affectedEntityId, timestamp, rowData, ipAddress, userAgent)
        SELECT @IN_userId, @IN_affectedEntity, affectedEntityId, GETUTCDATE(), rowData, @IN_ipAddress, @IN_userAgent
        FROM #dataForInsertion;

        -- COMMIT TRANSACTION
        IF @transactionStarted = 1
            BEGIN
                COMMIT TRANSACTION;
            END;

        -- Drop temporary tables
        DROP TABLE #IN_affectedEntityIds;
        DROP TABLE #dataForInsertion;

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