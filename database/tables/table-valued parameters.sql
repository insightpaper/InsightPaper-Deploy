--------------------------------------------------------------------------
-- Author:       andres.quesada@estudiantec.cr
-- Date:         2025-03-08
-- Description:  Creates the table-valued parameters for the database.
--------------------------------------------------------------------------

CREATE TYPE LogEntryType AS TABLE
(
    affectedEntityId INT
);

CREATE TYPE StringListType AS TABLE
(
    value NVARCHAR(64) NOT NULL
);

CREATE TYPE UuidListType AS TABLE
(
    value UNIQUEIDENTIFIER NOT NULL
);

CREATE TYPE RoleListType AS TABLE
(
    roleName INT NOT NULL,
    enabled BIT NOT NULL
);

CREATE TYPE BitNameEnabledListType AS TABLE
(
    name NVARCHAR(64) NOT NULL,
    enabled BIT NOT NULL
);

CREATE TYPE IntListType AS TABLE
(
    value INT NOT NULL
);

CREATE TYPE DatetimeRangeListType AS TABLE
(
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL
);