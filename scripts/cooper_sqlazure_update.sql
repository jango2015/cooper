-------------------------------------------------------------------------------
--20120822
--1. Add new tables, including:
--       Cooper_Team, Cooper_TeamMember, Cooper_Project, Cooper_TaskProjectRelationship,
--2. Alter Cooper_Task table.

CREATE TABLE [dbo].[Cooper_Team](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NULL,
    [CreateTime] [datetime] NULL,
 CONSTRAINT [PK_Cooper_Team] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)

CREATE TABLE [dbo].[Cooper_TeamMember](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NULL,
    [Email] [nvarchar](255) NULL,
    [CreateTime] [datetime] NULL,
    [TeamId] [int] NULL,
    [AssociatedAccountId] [int] NULL,
    [MemberType] [nvarchar](255) NULL,
 CONSTRAINT [PK_Cooper_TeamMember] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)

CREATE TABLE [dbo].[Cooper_Project](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NULL,
    [IsPublic] [bit] NULL,
    [TeamId] [int] NULL,
    [CreateTime] [datetime] NULL,
    [Extensions] [nvarchar](max) NULL,
 CONSTRAINT [PK_Cooper_Project] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
CREATE TABLE [dbo].[Cooper_TaskProjectRelationship](
    [TaskId] [bigint] NOT NULL,
    [ProjectId] [int] NOT NULL,
 CONSTRAINT [PK_Cooper_TaskProjectRelationship] PRIMARY KEY CLUSTERED 
(
    [TaskId] ASC,
    [ProjectId] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)

ALTER TABLE dbo.Cooper_Task ADD TaskType nvarchar(255) NULL
ALTER TABLE dbo.Cooper_Task ADD TeamId int NULL
ALTER TABLE dbo.Cooper_Task ADD CreatorMemberId int NULL
ALTER TABLE dbo.Cooper_Task ADD AssigneeId int NULL
UPDATE Cooper_Task SET TaskType = 'personal'

INSERT INTO Cooper_Lock (id) values('GitHubConnection')
INSERT INTO Cooper_Lock (id) VALUES('Member')
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
--20120824 add new table Cooper_TaskComment
CREATE TABLE [dbo].[Cooper_TaskComment](
    [ID] [bigint] IDENTITY(1,1) NOT NULL,
    [Body] [nvarchar](max) NOT NULL,
    [CreateTime] [datetime] NOT NULL,
    [TaskId] [bigint] NULL,
    [CreatorId] [int] NULL,
 CONSTRAINT [PK_Cooper_TaskComment] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------

------------------------------------------------------------------------------
--20120911 Alter Table Cooper_Task
ALTER TABLE dbo.Cooper_Task ADD Tags nvarchar(1000) NULL
ALTER TABLE dbo.Cooper_Task ADD IsTrashed [bit] NULL
ALTER TABLE dbo.Cooper_Team ADD Extensions nvarchar(max) NULL
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
--20121015 Alter Table Cooper_Project
ALTER TABLE dbo.Cooper_Project ADD Description nvarchar(max) NULL
-------------------------------------------------------------------------------