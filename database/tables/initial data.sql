--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Inserts the initial data for the database.
--------------------------------------------------------------------------

INSERT INTO [Roles]
    ([name])
VALUES
    ('Admin'),
    ('Professor'),
    ('Student');

INSERT INTO [FileStatuses]
    ([name])
VALUES
    ('Expiring'),
    ('Cold storage'),
    ('Deleted');