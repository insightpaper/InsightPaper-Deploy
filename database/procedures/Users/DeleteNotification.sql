--------------------------------------------------------------------------
-- Author:       2021046572@estudiantec.cr
-- Date:         2025-04-30
-- Description:  Delete a user's notification
--------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE [dbo].[SP_Users_DeleteNotification]
    -- Parameters
    @IN_currentUserId UNIQUEIDENTIFIER = NULL,
	@IN_notificationId UNIQUEIDENTIFIER = NULL
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

		IF @IN_notificationId IS NULL
        BEGIN
            RAISERROR('notification_id_required', 16, 1);
        END;

		-- START TRANSACTION
        BEGIN
            SET @transactionStarted = 1;
            BEGIN TRANSACTION;
        END;

		-- DELETE NOTIFICATION
        UPDATE [dbo].[Notifications]
			SET isDeleted = 1
		WHERE objectId = @IN_notificationId;

		SELECT objectId AS [affectedEntityId]
		FROM [dbo].[Notifications]
		WHERE [objectId] = @IN_notificationId;

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
