﻿//Copyright (c) CodeSharp.  All rights reserved. - http://www.icodesharp.com/

///<reference path="../jquery/jquery-1.7.2.min.js" />
///<reference path="../jquery/jquery.mobile-1.1.0.min.js" />
///<reference path="../jquery/jquery.json-2.3.min.js" />
///<reference path="hybrid.js" />
///<reference path="lang.js" />

/////////////////////////////////////////////////////////////////////////////////////////

//Task的ChangeLog以及Sort信息的格式示例
//        var changeLogs =
//                    [
//                        {"ID":"temp_1","Name":"subject","Value":"new task 001","Type":0},
//                        {"ID":"temp_1","Name":"body","Value":"task description","Type":0}
//                    ];
//        var sorts =
//                  [
//                      {"By":"priority","Key":"0","Name":"尽快完成","Indexs":["temp_1","temp_2"]},
//                      {"By":"priority","Key":"1","Name":"稍后完成","Indexs":["temp_3","temp_4"]},
//                      {"By":"priority","Key":"2","Name":"迟些再说","Indexs":["temp_5","temp_6"]}
//                  ];

/////////////////////////////////////////////////////////////////////////////////////////

(function () {

    //新增的本地任务的id的前缀
    var newTaskTempIdPrefix = "temp_";
    //标识网络是否可用的状态标记变量
    var isNetworkAvailable = true;

    //创建一个唯一标识
    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }
    //Task修改日志信息对象
    var ChangeLog = function () {
        this.Type = 0;
        this.ID = "";
        this.Name = "";
        this.Value = "";
    };
    //Task排序信息
    var Sort = function () {
        this.By = 0;
        this.Key = "";
        this.Name = "";
        this.Indexs = [];
    };
    //任务对象定义
    var Task = function () {
        this.id = newTaskTempIdPrefix + generateUUID();
        this.subject = "";
        this.body = "";
        this.priority = "0";
        this.dueTime = "";
        this.isCompleted = "false";
        this.tags = [];
        this.isEditable = true;
        this.isDeleted = false;
    };

    //更新当前网络是否可用的状态，Native code会调用该函数更新网络是否可用的状态
    function changeNetworkAvailableStatus(isAvailable) {
        isNetworkAvailable = isAvailable;
    }

    //返回给定的单个Task的ChangeLog信息
    function getSingleTaskChanges(task) {
        var changeLogs = [];
        var changeLog = new ChangeLog();

        if (task.isDeleted) {
            changeLog.Type = 1;
            changeLog.ID = task.id;
            changeLogs.push(changeLog);
            return changeLogs;
        }

        changeLog.ID = task.id;
        changeLog.Name = "subject";
        changeLog.Value = task.subject;
        changeLogs.push(changeLog);

        changeLog = new ChangeLog();
        changeLog.ID = task.id;
        changeLog.Name = "body";
        changeLog.Value = task.body;
        changeLogs.push(changeLog);

        changeLog = new ChangeLog();
        changeLog.ID = task.id;
        changeLog.Name = "priority";
        changeLog.Value = task.priority;
        changeLogs.push(changeLog);

        changeLog = new ChangeLog();
        changeLog.ID = task.id;
        changeLog.Name = "dueTime";
        changeLog.Value = task.dueTime;
        changeLogs.push(changeLog);

        changeLog = new ChangeLog();
        changeLog.ID = task.id;
        changeLog.Name = "isCompleted";
        changeLog.Value = task.isCompleted;
        changeLogs.push(changeLog);

        return changeLogs;
    };
    //返回给定的所有Tasks的ChangeLog信息
    function getChanges(tasks) {
        var totalChangeLogs = [];
        for (var index = 0; index < tasks.length; index++) {
            var changeLogs = getSingleTaskChanges(tasks[index]);
            for (var i = 0; i < changeLogs.length; i++) {
                totalChangeLogs.push(changeLogs[i]);
            }
        }
        return totalChangeLogs;
    }
    //返回给定Task数组的Sort信息
    function getSorts(tasks) {
        var sorts = [];

        var sort1 = new Sort();  //存放所有priority="0"的Task
        sort1.By = "priority";
        sort1.Key = "0";
        sort1.Name = "尽快完成";

        var sort2 = new Sort();  //存放所有priority="1"的Task
        sort2.By = "priority";
        sort2.Key = "1";
        sort2.Name = "稍后完成";

        var sort3 = new Sort();  //存放所有priority="2"的Task
        sort3.By = "priority";
        sort3.Key = "2";
        sort3.Name = "迟些再说";

        for (var index = 0; index < tasks.length; index++) {
            if (tasks[index].priority == sort1.Key) {
                sort1.Indexs.push(tasks[index].id);
            }
            else if (tasks[index].priority == sort2.Key) {
                sort2.Indexs.push(tasks[index].id);
            }
            else if (tasks[index].priority == sort3.Key) {
                sort3.Indexs.push(tasks[index].id);
            }
        }

        sorts.push(sort1);
        sorts.push(sort2);
        sorts.push(sort3);

        return sorts;
    }

    //验证用户有效性
    function validateUser(userName, password, callback) {
        postRequest(
            loginUrl,
            { userName: userName, password: password },
            function (result) {
                if (callback != null) {
                    if (result == true) {
                        callback({ 'success': true, 'message': null });
                    }
                    else {
                        callback({ 'success': false, 'message': lang.loginFailed });
                    }
                }
            }
        );
    }
    //获取所有任务列表
    function loadAllTaskList(callback) {
        postRequest(
            getTasklistsUrl,
            null,
            function (result) {
                var taskLists = [];
                for (key in result) {
                    var taskList = {};
                    taskList.id = key;
                    taskList.name = result[key];
                    taskList.taskCount = 0;
                    taskLists.push(taskList);
                }
                if (callback != null) {
                    callback({ 'success': true, 'taskLists': taskLists, 'message': null });
                }
            }
        );
    }
    //获取指定任务表内的指定状态的所有任务
    function loadTasks(listId, isCompleted, callback) {
        postRequest(
            getTasksUrl,
            { tasklistId: listId },
            function (result) {
                var tasks = [];
                var tasksFromServer = result != null && result.List != null ? result.List : [];
                for (var index = 0; index < tasksFromServer.length; index++) {
                    var taskFromServer = tasksFromServer[index];

                    //过滤出不符合是否完成条件的任务
                    if (isCompleted == "true" || isCompleted == "false") {
                        if (taskFromServer["IsCompleted"] == null || taskFromServer["IsCompleted"].toString() != isCompleted) {
                            continue;
                        }
                    }

                    var task = new Task();
                    task.id = taskFromServer["ID"];
                    task.subject = taskFromServer["Subject"] == null ? "" : taskFromServer["Subject"];
                    task.body = taskFromServer["Body"] == null ? "" : taskFromServer["Body"];
                    task.dueTime = taskFromServer["DueTime"] == null ? "" : taskFromServer["DueTime"];
                    task.priority = taskFromServer["Priority"] == null ? "" : taskFromServer["Priority"];
                    task.isCompleted = taskFromServer["IsCompleted"] == null ? "" : taskFromServer["IsCompleted"];
                    task.isEditable = taskFromServer["Editable"] == null ? "" : taskFromServer["Editable"];
                    tasks.push(task);
                }
                if (callback != null) {
                    callback({ 'success': true, 'tasks': tasks, 'message': 'success' });
                }
            }
        );
    }
    //新增一个TaskList
    function addTaskList(taskListName, callback) {
        postRequest(
            createTaskListUrl,
            { name: taskListName, type: "personal" },
            function (result) {
                if (callback != null) {
                    callback({ 'success': true, 'message': null });
                }
            }
        );
    }
    //同步指定任务表中的最新任务信息
    function syncTasks(listId, tasks, callback) {
        //获取修改信息
        var changes = getChanges(tasks);
        //获取排序信息
        var sorts = getSorts(tasks);

        //发送ajax请求
        postRequest(
            syncTaskUrl,
            { tasklistId: listId, tasklistChanges: null, changes: $.toJSON(changes), by: "ByPriority", sorts: $.toJSON(sorts) },
            function (result) {
                //修正新增Task的ID
                for (var index = 0; index < result.length; index++) {
                    var correction = result[index];
                    for (var index = 0; index < tasks.length; index++) {
                        if (correction.OldId == tasks[index].id) {
                            tasks[index].id = correction.NewId;
                            break;
                        }
                    }
                }
                //调用回调函数
                if (callback != null) {
                    callback({ 'success': true, 'message': null });
                }
            }
        );
    }

    //浏览器缓存当前任务表内的所有任务，使用这个变量是因为在新增或修改任务时，
    //调用服务器的Sync接口时，需要传入当前任务表内的所有任务的排序信息。
    var tasksInCurrentList = null;

    //获取当前任务列表内的所有任务，存放在本地内存
    function loadTasksInCurrentList(listId, callback) {
        loadTasks(listId, "all", function (result) {
            if (result.success) {
                tasksInCurrentList = result.tasks;
                if (callback != null) {
                    callback();
                }
            }
        });
    }
    //从当前的本地js内存中缓存的当前任务表的所有任务中查找指定的任务
    function loadTaskFromLocal(taskId) {
        for (var index = 0; index < tasksInCurrentList.length; index++) {
            if (tasksInCurrentList[index].id == taskId) {
                return tasksInCurrentList[index];
            }
        }
    }
    //获取指定ID的任务，从本地内存加载
    function loadTask(taskId, callback) {
        if (tasksInCurrentList == null) {
            loadTasksInCurrentList(pageData.listId, function () {
                var task = loadTaskFromLocal(taskId);
                callback(task);
            });
        }
        else {
            var task = loadTaskFromLocal(taskId);
            callback(task);
        }
    }

    //----------------------------------------------------------------
    //以下函数用于显示数据到界面或者更新界面的数据
    //----------------------------------------------------------------

    //清空taskListPage
    function clearTaskListPage() {
        $("#taskListPage #taskListUl > li").remove();
    }
    //清空taskPage
    function clearTaskPage() {
        $("#taskPage #taskPageTitle").html("");
        $("#taskPage #taskUl > li").remove();
    }
    //清空任务详情页面
    function clearTaskDetailPage() {
        $("#taskDetailPage #taskSubject").html("");
        $("#taskDetailPage #taskBody").html("");
        $("#taskDetailPage #radio-taskPriority-0").attr('checked', true);
        $("#taskDetailPage #radio-taskPriority-1").attr('checked', false);
        $("#taskDetailPage #radio-taskPriority-2").attr('checked', false);
        $("input[name='taskPriority']").checkboxradio("refresh");
        $("#taskDetailPage #taskDueTime").val("");
        $("#taskDetailPage #isTaskCompleted").val("false");
        $("#taskDetailPage #isTaskCompleted").slider('refresh');
    }
    //清空任务编辑页面
    function clearTaskEditPage() {
        $("#taskEditPage #subject").val("");
        $("#taskEditPage #body").val("");
        $("#taskEditPage #radio-priority-0").attr('checked', true);
        $("#taskEditPage #radio-priority-1").attr('checked', false);
        $("#taskEditPage #radio-priority-2").attr('checked', false);
        $("input[name='priority']").checkboxradio("refresh");
        $("#taskEditPage #duetime").val("");
        $("#taskEditPage #isCompleted").val("false");
        $("#taskEditPage #isCompleted").slider('refresh');
    }
    //将给定的任务列表显示到界面
    function showTaskLists(taskLists) {
        //清空任务列表
        clearTaskListPage();

        //填充任务列表
        var ul = $('#taskListPage #taskListUl');
        var liArray = [];
        for (var index = 0; index < taskLists.length; index++) {
            var taskList = taskLists[index];
            var li = '<li id="' + taskList.id + '"><a data-transition="slide" href="#taskPage?listId=' + taskList.id + '&isCompleted=all">' + taskList.name + '</a></li>';
            liArray[liArray.length] = li;
        }
        ul.append(liArray.join(''));

        //刷新任务列表
        ul.listview('refresh');
    }
    //加载并显示任务列表
    function loadAndShowTaskLists() {
        showLoading();
        loadAllTaskList(function (result) {
            if (result.success) {
                showTaskLists(result.taskLists);
                hideLoading();
            }
            else {
                hideLoading();
                showErrorMessage(result.message);
            }
        });
    }
    //在任务页面显示当前的任务表的名称
    function showTaskListName(listId) {
        loadAllTaskList(function (result) {
            if (result.success) {
                for (var index = 0; index < result.taskLists.length; index++) {
                    if (result.taskLists[index].id == listId) {
                        taskList = result.taskLists[index];
                        $("#taskPage #taskPageTitle").html(taskList.name);
                        break;
                    }
                }
            }
        });
    }
    //显示指定任务列表中的任务
    function showTasks(listId, tasks, isCompleted) {
        //清空任务
        clearTaskPage();

        //显示任务列表的标题
        showTaskListName(listId);

        var li1 = '<li style="background-color: #ebebeb">尽快完成<span class="ui-li-count">{0}</span></li>';
        var li2 = '<li style="background-color: #ebebeb">稍后完成<span class="ui-li-count">{0}</span></li>';
        var li3 = '<li style="background-color: #ebebeb">迟些再说<span class="ui-li-count">{0}</span></li>';

        var items1 = [];
        var items2 = [];
        var items3 = [];

        //填充任务
        for (var index = 0; tasks != null && index < tasks.length; index++) {
            var task = tasks[index];
            var img = null;
            if (task.isCompleted.toString() == "true") {
                img = "complete-small.png";
            }
            else {
                img = "incomplete-small.png";
            }
            var li = '<li id="' + listId + '|' + task.id + '"><a><h3><img id="' + task.id + '" src="images/' + img + '"><span>' + task.subject + '</span></h3><p>' + task.body + '</p><p><strong>' + task.dueTime + '</strong></p></a></li>';

            if (task.priority == "0") {
                items1[items1.length] = li;
            }
            else if (task.priority == "1") {
                items2[items2.length] = li;
            }
            else if (task.priority == "2") {
                items3[items3.length] = li;
            }
        }

        var ul = $("#taskPage #taskUl");
        var totalItems = [];

        if (items1.length > 0 || items2.length > 0 || items3.length > 0) {
            totalItems[totalItems.length] = li1.replace("{0}", items1.length);
            for (var index = 0; index < items1.length; index++) {
                totalItems[totalItems.length] = items1[index];
            }
            totalItems[totalItems.length] = li2.replace("{0}", items2.length);
            for (var index = 0; index < items2.length; index++) {
                totalItems[totalItems.length] = items2[index];
            }
            totalItems[totalItems.length] = li3.replace("{0}", items3.length);
            for (var index = 0; index < items3.length; index++) {
                totalItems[totalItems.length] = items3[index];
            }

            ul.append(totalItems.join(''));
        }

        //刷新ul
        ul.listview('refresh');

        //设置列表每行的表示任务是否完成状态的Click响应函数，为了实现在用户点击是否完成的图标时，能够自动切换任务的状态
        $('#taskUl img').click(function (event) {
            var taskId = $(this).attr("id");
            var imgUrl = $(this).attr("src");
            if (imgUrl.indexOf('images/complete-small.png') != -1) {
                updateTaskProperty(taskId, 'isCompleted', 'false', function (result) {
                    if (result.success) {
                        $('#taskUl #' + taskId).attr("src", 'images/incomplete-small.png');
                    }
                    else {
                        showErrorMessage(result.message);
                    }
                });
            }
            else if (imgUrl.indexOf('images/incomplete-small.png') != -1) {
                updateTaskProperty(taskId, 'isCompleted', 'true', function (result) {
                    if (result.success) {
                        $('#taskUl #' + taskId).attr("src", 'images/complete-small.png');
                    }
                    else {
                        showErrorMessage(result.message);
                    }
                });
            }
            //停止冒泡，确保不会跳转到任务详情页
            event.stopPropagation();
        });

        //设置列表每行的Click响应函数
        $('#taskUl li').click(function (event) {
            var entry = $(this).attr("id").split('|');
            var listId = entry[0];
            var taskId = entry[1];
            showPage("taskDetailPage", 'listId=' + listId + '&taskId=' + taskId);
        });

        //根据任务是否存在现实友好信息
        $("#addFirstTaskButton").hide();
        $("#displayInfoWhenNoTaskExist").html("");
        if (isCompleted == "all") {
            if (items1.length == 0 && items2.length == 0 && items3.length == 0) {
                $("#addFirstTaskButton").show();
            }
        }
        else if (isCompleted == "true") {
            if (items1.length == 0 && items2.length == 0 && items3.length == 0) {
                $("#displayInfoWhenNoTaskExist").html(lang.noCompletedTaskPromptInfo);
            }
        }
        else if (isCompleted == "false") {
            if (items1.length == 0 && items2.length == 0 && items3.length == 0) {
                $("#displayInfoWhenNoTaskExist").html(lang.noUnCompletedTaskPromptInfo);
            }
        }
    }
    //加载并显示指定任务列表中的符合条件的所有任务
    function loadAndShowTasks(listId, isCompleted) {

        $("#taskPage #addNewTaskButton").attr("href", "#taskEditPage?listId=" + listId + "&isCompleted=" + isCompleted);
        $("#taskPage #addFirstTaskButton").attr("href", "#taskEditPage?listId=" + listId + "&isCompleted=" + isCompleted);
        $("#taskPage #showAllTasksButton").attr("href", "#taskPage?listId=" + listId + "&isCompleted=all");
        $("#taskPage #showCompletedTasksButton").attr("href", "#taskPage?listId=" + listId + "&isCompleted=true");
        $("#taskPage #showUnCompletedTasksButton").attr("href", "#taskPage?listId=" + listId + "&isCompleted=false");

        showLoading();
        loadTasks(listId, isCompleted, function (result) {
            if (result.success) {
                showTasks(listId, result.tasks, isCompleted);
                //将任务缓存在本地
                tasksInCurrentList = result.tasks;
                hideLoading();
            }
            else {
                hideLoading();
                showErrorMessage(result.message);
            }
        });
    }
    //根据指定的任务ID将任务数据显示到任务详情页面
    function showTaskOnDetailPage(taskId) {
        //先清空页面
        clearTaskDetailPage();

        //如果当前存在任务ID，则加载并显示在任务详情页面
        if (taskId != null && taskId != "") {
            loadTask(taskId, function (task) {
                if (task != null) {
                    $("#taskDetailPage #taskSubject").html(task.subject);
                    $("#taskDetailPage #taskBody").html(task.body);

                    if (task.priority == "0" || task.priority == "1" || task.priority == "2") {
                        $("#taskDetailPage #radio-taskPriority-" + task.priority).attr('checked', true);
                        $("input[name='taskPriority']").checkboxradio("refresh");
                    }

                    $("#taskDetailPage #taskDueTime").val(task.dueTime);
                    $("#taskDetailPage #isTaskCompleted").val(task.isCompleted.toString());
                    $("#taskDetailPage #isTaskCompleted").slider('refresh');

                    $("#taskDetailPage #gotoTaskEditPage").attr("href", "#taskEditPage?listId=" + pageData.listId + "&taskId=" + task.id);
                }
            });
        }
    }
    //根据指定的任务ID初始化任务编辑页面
    function showTaskOnEditPage(taskId) {
        //先清空页面
        clearTaskEditPage();

        //如果当前存在任务ID，则加载并显示在任务编辑页面
        if (taskId != null && taskId != "") {
            loadTask(taskId, function (task) {
                if (task != null) {
                    $("#taskEditPage #subject").val(task.subject);
                    $("#taskEditPage #body").val(task.body);

                    if (task.priority == "0" || task.priority == "1" || task.priority == "2") {
                        $("#taskEditPage #radio-priority-" + task.priority).attr('checked', true);
                        $("input[name='priority']").checkboxradio("refresh");
                    }

                    $("#taskEditPage #duetime").val(task.dueTime);
                    $("#taskEditPage #isCompleted").val(task.isCompleted.toString());
                    $("#taskEditPage #isCompleted").slider('refresh');
                }
            });
        }
    }
    //新增一个Task
    function addTask(listId, subject, body, priority, dueTime, isCompleted, callback) {
        //实例化一个Task对象
        var task = new Task();
        task.subject = subject;
        task.body = body;
        task.priority = priority;
        task.dueTime = dueTime;
        task.isCompleted = isCompleted;

        //同步任务
        if (tasksInCurrentList == null) {
            loadTasksInCurrentList(listId, function () {
                tasksInCurrentList.push(task);
                syncTasks(listId, tasksInCurrentList, function (result) {
                    if (callback != null) {
                        callback({ 'success': true, 'message': null });
                    }
                });
            });
        }
        else {
            tasksInCurrentList.push(task);
            syncTasks(listId, tasksInCurrentList, function (result) {
                if (callback != null) {
                    callback({ 'success': true, 'message': null });
                }
            });
        }
    }
    //更新一个Task，taskEditPage会调用该函数
    function updateTask(listId, id, subject, body, priority, dueTime, isCompleted, callback) {
        loadTask(id, function (task) {
            //如果不存在则直接退出
            if (task == null) {
                return;
            }

            //更新Task信息
            task.subject = subject;
            task.body = body;
            task.priority = priority;
            task.dueTime = dueTime;
            task.isCompleted = isCompleted;

            //同步到服务器
            syncTasks(listId, tasksInCurrentList, function (result) {
                if (callback != null) {
                    callback({ 'success': true, 'message': null });
                }
            });
        });
    }
    //删除一个Task，taskDetailPage会调用该函数
    function deleteTask(listId, id, callback) {
        loadTask(id, function (task) {
            //如果不存在则直接退出
            if (task == null) {
                return;
            }

            //设置删除标记
            task.isDeleted = true;
            //同步到服务器
            syncTasks(listId, tasksInCurrentList, function (result) {
                if (callback != null) {
                    callback({ 'success': true, 'message': null });
                }
            });
        });
    }
    //更新一个Task的单个属性，任务详情页面会用到此函数
    function updateTaskProperty(taskId, propertyName, propertyValue, callback) {
        loadTask(taskId, function (task) {
            //如果不存在则直接退出
            if (task == null) {
                return;
            }

            //根据判断更新相应属性
            if (propertyName == "priority") {
                task.priority = propertyValue;
            }
            else if (propertyName == "dueTime") {
                task.dueTime = propertyValue;
            }
            else if (propertyName == "isCompleted") {
                task.isCompleted = propertyValue;
            }

            //同步到服务器
            syncTasks(pageData.listId, tasksInCurrentList, function (result) {
                if (callback != null) {
                    callback({ 'success': true, 'message': null });
                }
            });
        });
    }

    //显示指定页面
    function showPage(pageId, params, transition, direction) {
        if (transition == undefined || transition == null || transition == "") {
            transition = "slide";
        }

        var targetPage = "";
        if (params != null && params != undefined && params != "") {
            targetPage = '#' + pageId + "?" + params;
        }
        else {
            targetPage = '#' + pageId;
        }

        if (direction != undefined && direction != null && direction != "") {
            $.mobile.changePage(targetPage, { transition: transition, direction: direction });
        }
        else {
            $.mobile.changePage(targetPage, { transition: transition });
        }
    }
    //显示Loading效果
    function showLoading() {
        $.mobile.loadingMessageTextVisible = true;
        $.mobile.loadingMessage = "页面加载中...";
        $.mobile.showPageLoadingMsg();
    }
    //隐藏Loading效果
    function hideLoading() {
        $.mobile.hidePageLoadingMsg();
    }
    //显示错误提示弹出框
    function showErrorMessage(message) {
        $("#errorDialog #closeButton").attr("href", currentPageUrl);
        $("#errorDialog #content").html(message);
        $.mobile.changePage("#errorDialog", { transition: "pop" });
    }
    //判断当页面显示时，是否是因为关闭了Error Dialog而显示页面的
    function isShowFromClosingErrorDialog(data) {
        if (data != null && data.prevPage != null && data.prevPage.length > 0 && data.prevPage[0].id == "errorDialog") {
            return true;
        }
        return false;
    }
    //判断当前访问页面是否在移动设备
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    }

    //----------------------------------------------------------------
    //按钮事件响应绑定
    //----------------------------------------------------------------

    //登录页面:“确定”按钮事件响应
    $(document).delegate("#loginPage #loginButton", "click", function () {
        validateUser($("#username").val(), $("#password").val(), function (result) {
            if (!result.success) {
                showErrorMessage(result.message);
            }
            else {
                showPage("taskListPage");
            }
        });
    });
    //新增任务列表页面:“确定”按钮事件响应
    $(document).delegate("#addTaskListPage #saveNewTaskListButton", "click", function () {
        addTaskList($("#tasklistName").val(), function (result) {
            if (!result.success) {
                showErrorMessage(result.message);
            }
            else {
                history.back();
            }
        });
    });
    //任务列表页面:“刷新”按钮事件响应
    $(document).delegate("#taskListPage #refreshTaskListsButton", "click", function () {
        loadAndShowTaskLists();
    });
    //任务编辑页面:“确定”按钮事件响应
    $(document).delegate("#taskEditPage #saveTaskButton", "click", function () {
        var taskId = "";
        if (pageData != null && pageData.taskId != null && pageData.taskId != "") {
            taskId = pageData.taskId;
        }

        var subject = $("#taskEditPage #subject").val();
        var body = $("#taskEditPage #body").val();
        var selectedPriority = $("input[name='priority']:checked");
        var priority = selectedPriority != null ? selectedPriority.val() : 0;
        var dueTime = $("#taskEditPage #duetime").val();
        var isCompleted = $("#taskEditPage #isCompleted").val();

        if (taskId == "") {
            addTask(pageData.listId, subject, body, priority, dueTime, isCompleted, function (result) {
                if (result.success) {
                    history.back();
                }
                else {
                    showErrorMessage(result.message);
                }
            });
        }
        else {
            updateTask(pageData.listId, taskId, subject, body, priority, dueTime, isCompleted, function (result) {
                if (result.success) {
                    history.back();
                }
                else {
                    showErrorMessage(result.message);
                }
            });
        }
    });
    //任务页面:“刷新”按钮事件响应
    $(document).delegate("#taskPage #refreshTasksButton", "click", function () {
        loadAndShowTasks(pageData.listId, pageData.isCompleted);
    });
    //任务页面:“个人任务”Tab事件响应
    $(document).delegate("#taskPage #showAllTasksButton", "click", function () {
        if (!isMobileDevice()) {
            window.location = this.href;
        }
        loadAndShowTasks(pageData.listId, "all");
    });
    //任务页面:“已完成”Tab事件响应
    $(document).delegate("#taskPage #showCompletedTasksButton", "click", function () {
        if (!isMobileDevice()) {
            window.location = this.href;
        }
        loadAndShowTasks(pageData.listId, "true");
    });
    //任务页面:“未完成”Tab事件响应
    $(document).delegate("#taskPage #showUnCompletedTasksButton", "click", function () {
        if (!isMobileDevice()) {
            window.location = this.href;
        }
        loadAndShowTasks(pageData.listId, "false");
    });

    //任务详情页面:“删除”按钮事件响应
    $(document).delegate("#taskDetailPage #deleteTaskButton", "click", function () {
        deleteTask(pageData.listId, pageData.taskId, function (result) {
            if (result.success) {
                history.back();
            }
            else {
                showErrorMessage(result.message);
            }
        });
    });

    //以下三个事件响应函数用户在任务详情页面自动更新用户修改
    //优先级
    $(document).delegate("[name=taskPriority]", "change", function () {
        var priority = $('input[name=taskPriority]:checked').val();
        updateTaskProperty(pageData.taskId, "priority", priority, function (result) {
            if (!result.success) {
                showErrorMessage(result.message);
            }
        });
    });
    //是否完成
    $(document).delegate("#taskDetailPage #isTaskCompleted", "change", function () {
        var isCompleted = $(this).val();
        updateTaskProperty(pageData.taskId, "isCompleted", isCompleted, function (result) {
            if (!result.success) {
                showErrorMessage(result.message);
            }
        });
    });
    //截止时间
    $(document).delegate("#taskDetailPage #taskDueTime", "blur", function () {
        var dueTime = $(this).attr("value");
        updateTaskProperty(pageData.taskId, "dueTime", dueTime, function (result) {
            if (!result.success) {
                showErrorMessage(result.message);
            }
        });
    });

    //----------------------------------------------------------------
    //Jquery Mobile Event Binding
    //----------------------------------------------------------------

    $(document).delegate("#taskListPage", "pagebeforeshow", function (e, data) {
        if (isShowFromClosingErrorDialog(data)) {
            return;
        }
        loadAndShowTaskLists();
    });
    $(document).delegate("#addTaskListPage", "pagebeforeshow", function (e, data) {
        if (isShowFromClosingErrorDialog(data)) {
            return;
        }
        $("#tasklistName").val("");
    });
    $(document).delegate("#taskPage", "pagebeforeshow", function (e, data) {
        if (isShowFromClosingErrorDialog(data)) {
            return;
        }

        loadAndShowTasks(pageData.listId, pageData.isCompleted);

        if (pageData.isCompleted == null || pageData.isCompleted == "all") {
            $("#taskPage #showAllTasksButton").addClass("ui-btn-active");
        }
        else if (pageData.isCompleted == "true") {
            $("#taskPage #showCompletedTasksButton").addClass("ui-btn-active");
        }
        else if (pageData.isCompleted == "false") {
            $("#taskPage #showUnCompletedTasksButton").addClass("ui-btn-active");
        }
    });
    $(document).delegate("#taskDetailPage", "pagebeforeshow", function (e, data) {
        if (isShowFromClosingErrorDialog(data)) {
            return;
        }
        showTaskOnDetailPage(pageData.taskId);
    });
    $(document).delegate("#taskEditPage", "pagebeforeshow", function (e, data) {
        if (isShowFromClosingErrorDialog(data)) {
            return;
        }
        clearTaskEditPage();
        if (pageData != undefined && pageData.taskId != undefined && pageData.taskId != null && pageData.taskId != "") {
            showTaskOnEditPage(pageData.taskId);
        }
    });

    //在pageshow时修正page的content的高度不能自适应的问题
    $(document).bind("pageshow", function (e, data) {
        fixPageContentHeight();
    });
    function fixPageContentHeight() {
        /* Some orientation changes leave the scroll position at something
        * that isn't 0,0. This is annoying for user experience. */
        scroll(0, 0);

        /* Calculate the geometry that our content area should take */
        var header = $("div[data-role='header']:visible");
        var footer = $("div[data-role='footer']:visible");
        var content = $("div[data-role='content']:visible:visible");
        var viewport_height = $(window).height();

        var content_height = null;
        if (header.length > 0 && footer.length > 0) {
            content_height = viewport_height - header.outerHeight() - footer.outerHeight();
        }
        else if (header.length > 0) {
            content_height = viewport_height - header.outerHeight();
        }

        /* Fix by thomtomdup: when the block content is higher than the mobile screen, the footer hid it */
        if ((content.outerHeight() - header.outerHeight()) <= viewport_height) {
            /* Trim margin/border/padding height */
            content_height -= (content.outerHeight() - content.height());
            content.height(content_height);
        }
    }
})();