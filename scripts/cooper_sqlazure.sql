
--Scripts to drop all tables
-------------------------------------------------------------------------------
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_AccountProfile]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_AccountProfile]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_AccountConnection]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_AccountConnection]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Account]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Account]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Contact]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Contact]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_ContactGroup]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_ContactGroup]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_AddressBook]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_AddressBook]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Lock]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Lock]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_SyncInfo]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_SyncInfo]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_TaskProjectRelationship]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_TaskProjectRelationship]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_TaskComment]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_TaskComment]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Project]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Project]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Task]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Task]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Tasklist]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Tasklist]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_TeamMember]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_TeamMember]
GO
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Cooper_Team]') AND type in (N'U'))
DROP TABLE [dbo].[Cooper_Team]
GO
-------------------------------------------------------------------------------

--Scripts to create all tables
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_Account](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NULL,
	[Password] [nvarchar](255) NULL,
	[CreateTime] [datetime] NULL
 CONSTRAINT [PK_Cooper_Account] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_Lock](
	[ID] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_Cooper_Lock] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_AccountProfile](
	[AccountId] [int] NOT NULL,
	[Profile] [nvarchar](max) NULL,
 CONSTRAINT [PK_Cooper_AccountProfile] PRIMARY KEY CLUSTERED 
(
	[AccountId] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_Task](
	[ID] [bigint] IDENTITY(1,1) NOT NULL,
	[Subject] [nvarchar](500) NULL,
	[Body] [nvarchar](max) NULL,
	[Priority] [tinyint] NULL,
	[DueTime] [datetime] NULL,
	[IsCompleted] [bit] NULL,
	[CreateTime] [datetime] NULL,
	[LastUpdateTime] [datetime] NULL,
	[CreatorAccountId] [int] NULL,
	[CreatorMemberId] [int] NULL,
	[TasklistId] [int] NULL,
	[TaskType] [nvarchar](255) NULL,
	[TeamId] [int] NULL,
	[AssigneeId] [int] NULL,
 CONSTRAINT [PK_Cooper_Task] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_AccountConnection](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NULL,
	[AccountId] [int] NULL,
	[CreateTime] [datetime] NULL,
	[ConnectionType] [nvarchar](10) NULL,
	[Token] [nvarchar](1000) NULL,
 CONSTRAINT [PK_Cooper_AccountConnection] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_SyncInfo](
	[AccountId] [int] NOT NULL,
	[LocalDataId] [nvarchar](10) NOT NULL,
	[SyncDataId] [nvarchar](300) NOT NULL,
	[SyncDataType] [int] NOT NULL,
 CONSTRAINT [PK_Cooper_SyncInfo] PRIMARY KEY CLUSTERED 
(
	[AccountId] ASC,
	[LocalDataId] ASC,
	[SyncDataId] ASC,
	[SyncDataType] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)

-------------------------------------------------------------------------------
--changes
-------------------------------------------------------------------------------
--20120723 add tasklist
CREATE TABLE [dbo].[Cooper_Tasklist](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NULL,
	[CreateTime] [datetime] NULL,
	[Extensions] [nvarchar](max) NULL,
	[ListType] [nvarchar](10) NULL,
	[OwnerAccountId] [int] NULL,
 CONSTRAINT [PK_Cooper_Tasklist] PRIMARY KEY CLUSTERED 
(
	[ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------

-------------------------------------------------------------------------------
--20120822 add new tables:
--       Cooper_AddressBook, Cooper_Contact, Cooper_ContactGroup
--       Cooper_Team, Cooper_TeamMember, Cooper_Project, Cooper_TaskProjectRelationship
CREATE TABLE [dbo].[Cooper_AddressBook](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NOT NULL,
    [ParentId] [int] NULL,
    [OwnerAccountId] [int] NULL,
    [AddressBookType] [nvarchar](10) NOT NULL,
    [CreateTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Cooper_AddressBook_1] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_Contact](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [AccountId] [int] NULL,
    [AddressBookId] [int] NOT NULL,
    [GroupId] [int] NULL,
    [FullName] [nvarchar](255) NOT NULL,
    [Email] [nvarchar](255) NOT NULL,
    [Phone] [nvarchar](100) NULL,
    [CreateTime] [datetime] NOT NULL,
    [LastUpdateTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Cooper_Contact_1] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_ContactGroup](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NOT NULL,
    [AddressBookId] [int] NOT NULL,
    [CreateTime] [datetime] NOT NULL,
 CONSTRAINT [PK_Cooper_ContactGroup_1] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_Team](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [Name] [nvarchar](255) NULL,
    [CreateTime] [datetime] NULL,
 CONSTRAINT [PK_Cooper_Team] PRIMARY KEY CLUSTERED 
(
    [ID] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
-------------------------------------------------------------------------------
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
-------------------------------------------------------------------------------
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
-------------------------------------------------------------------------------
CREATE TABLE [dbo].[Cooper_TaskProjectRelationship](
    [TaskId] [int] NOT NULL,
    [ProjectId] [int] NOT NULL,
 CONSTRAINT [PK_Cooper_TaskProjectRelationship] PRIMARY KEY CLUSTERED 
(
    [TaskId] ASC,
    [ProjectId] ASC
)WITH (PAD_INDEX  = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON)
)
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

--initialize table data
-------------------------------------------------------------------------------
--locks
insert into Cooper_Lock (id) values('Account')
insert into Cooper_Lock (id) values('AccountConnection')
insert into Cooper_Lock (id) values('ArkConnection')
insert into Cooper_Lock (id) values('GoogleConnection')
insert into Cooper_Lock (id) values('GitHubConnection')
insert into Cooper_Lock (id) values('Member')
-------------------------------------------------------------------------------