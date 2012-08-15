﻿//Copyright (c) CodeSharp.  All rights reserved. - http://www.icodesharp.com/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CodeSharp.Core.RepositoryFramework;
using Castle.Services.Transaction;
using Cooper.Model.Accounts;
using CodeSharp.Core;
using CodeSharp.Core.Services;

namespace Cooper.Model.Teams
{
    /// <summary>团队任务领域服务定义
    /// </summary>
    public interface ITaskService
    {
        /// <summary>创建任务
        /// </summary>
        /// <param name="task"></param>
        void Create(Task task);
        /// <summary>更新任务
        /// </summary>
        /// <param name="task"></param>
        void Update(Task task);
        /// <summary>删除任务
        /// </summary>
        /// <param name="task"></param>
        void Delete(Task task);
        /// <summary>根据标识获取任务
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task GetTask(long id);
        /// <summary>获取指定团队的所有任务
        /// </summary>
        /// <param name="team"></param>
        /// <returns></returns>
        IEnumerable<Task> GetTasksByTeam(Team team);
        /// <summary>获取指定项目的所有任务
        /// </summary>
        /// <param name="project"></param>
        /// <returns></returns>
        IEnumerable<Task> GetTasksByProject(Project project);
        /// <summary>获取指定团队成员的所有任务
        /// </summary>
        /// <param name="teamMember"></param>
        /// <returns></returns>
        IEnumerable<Task> GetTasksByTeamMember(TeamMember teamMember);
    }
    /// <summary>团队任务领域服务
    /// </summary>
    [Transactional]
    public class TaskService : ITaskService
    {
        private static ITaskRepository _repository;
        private ILog _log;

        static TaskService()
        {
            _repository = RepositoryFactory.GetRepository<ITaskRepository, long, Task>();
        }
        public TaskService(ILoggerFactory factory)
        {
            this._log = factory.Create(typeof(TaskService));
        }

        #region ITaskService Members
        [Transaction(TransactionMode.Requires)]
        void ITaskService.Create(Task task)
        {
            _repository.Add(task);
            if (this._log.IsInfoEnabled)
                this._log.InfoFormat("新增团队任务#{0}|{1}|{2}", task.ID, task.Subject, task.CreatorAccountId);
        }
        [Transaction(TransactionMode.Requires)]
        void ITaskService.Update(Task task)
        {
            _repository.Update(task);
        }
        [Transaction(TransactionMode.Requires)]
        void ITaskService.Delete(Task task)
        {
            _repository.Remove(task);
            if (this._log.IsInfoEnabled)
                this._log.InfoFormat("删除团队任务#{0}", task.ID);
        }
        Task ITaskService.GetTask(long id)
        {
            return _repository.FindBy(id);
        }
        IEnumerable<Task> ITaskService.GetTasksByTeam(Team team)
        {
            return _repository.FindBy(team);
        }
        IEnumerable<Task> ITaskService.GetTasksByProject(Project project)
        {
            return _repository.FindBy(project);
        }
        IEnumerable<Task> ITaskService.GetTasksByTeamMember(TeamMember teamMember)
        {
            return _repository.FindBy(teamMember);
        }
        #endregion
    }
}
