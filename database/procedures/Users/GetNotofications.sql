--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-30
-- Description:  Get user's notifications by id
--------------------------------------------------------------------------
CREATE OR ALTER   PROCEDURE [dbo].[SP_Users_GetNotifications]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
    @IN_readStatus BIT = NULL  
AS
BEGIN
    SET NOCOUNT ON; -- Do not return metadata

    -- ERROR HANDLING
    DECLARE @errorNumber INT, @errorSeverity INT, @errorState INT, @errorMessage NVARCHAR(200);
    DECLARE @transactionStarted BIT = 0;

    -- VARIABLE DECLARATION

    BEGIN TRY

        -- VALIDATIONS
        IF @IN_currentUserId IS NULL
        BEGIN
            RAISERROR('user_id_required', 16, 1);
        END;

		-- RETURN DE NOTIFICATIONS
        SELECT 
			notificationId,
			title,
			message,
			isRead,
			objectId,
			objectType,
			CONCAT(CONVERT (VARCHAR(32), [createdDate], 126), 'Z') AS [createdDate]
		FROM 
			[dbo].[Notifications]
		WHERE 
			userId = @IN_currentUserId
        AND (@IN_readStatus IS NULL OR [isRead] = @IN_readStatus)
		AND isDeleted = 0
		ORDER BY 
			createdDate DESC
        FOR JSON PATH;

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
            VALUES (
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
