﻿//Copyright (c) CodeSharp.  All rights reserved. - http://www.icodesharp.com/

///<reference path="task.js" />
///<reference path="task_detail.js" />
///<reference path="task_bind.js" />
///<reference path="task_bind_shortcuts.js" />
///<reference path="task_bind_team.js" />
///<reference path="task_row.js" />

//任务列表UI模式 通用
var UI_List_Common = function () { }
UI_List_Common.prototype = {
    //标识列表模式
    mode: 'common',
    $wrapper: null, //列表容器
    $wrapper_detail: null, //详情容器
    $focusRow: null, //记录焦点行元素
    $batchDetail: null, //批量详情
    $cancel_delete: null, //撤销删除区域元素
    deletes: null, //上一次任务删除记录
    deletes_timer: null, //删除恢复期间的定时器
    deletes_timer2: null, //删除恢复期间的定时器
    detail_timer: null, //详情区域渲染延时timer
    detail_timer_enable: true, //为unittest而设计的属性
    batch_id_dueTime: 'dueTime_batch',
    //常用任务属性
    today: '0',
    upcoming: '1',
    later: '2',
    ////////////////////////////////////////////////////////////////////////////////////////
    //关键样式名：row_task,row_active,todolist
    //屏蔽常用部分的UI影响
    getRow: function ($e) { return $e.parents('tr').eq(0); },
    getTaskId: function ($r) { return $r.attr('id'); },
    getRegionOfRow: function ($r) { return $r.parents('table.todolist').eq(0); },
    getTasks: function ($e) { if ($e) return $e.find('tr.row_task'); else return this.$wrapper.find('tr.row_task'); },
    getTaskVal: function ($r) { return $r.find('input').val(); },
    isTask: function ($r) { return $r.hasClass('row_task'); },
    getActives: function () { return this.$wrapper.find('tr.row_active'); },
    isActive: function ($r) { return $r.hasClass('row_active'); },
    setActive: function ($r) { return $r.addClass('row_active'); },
    removeActive: function ($r) { return $r.removeClass('row_active'); },
    focusRow: function ($r) { this._expandRowRegion($r); return $r.find('input').focus(); },
    //ui模式显示切换
    setHidenInMode: function ($e) { return $e.addClass('disabled_in_this_mode').hide(); },
    removeHidenInMode: function () { return this.$wrapper.find('.disabled_in_this_mode').removeClass('disabled_in_this_mode').show(); },
    //全局缓存/数据操作部分
    commitDeletes: null,
    eachTask: null,
    getTaskById: null,
    getSortKeys: null,
    getSortByKey: null,
    setTask: null,
    addTag: function (t) { },
    getTags: function () { return ['']; },
    getProjects: null,
    getProject: null,
    getTeamMembers: null,
    getTeamMember: null,
    getTask: function ($r) { return this.getTaskById(this.getTaskId($r)); },
    getSort: function ($region) { return this.getSortByKey($region.attr('key')); },
    ////////////////////////////////////////////////////////////////////////////////////////
    //主体渲染
    _renderBySort: function (k) {
        this.getSortByKey(k).render();
        this.$wrapper.append(this.getSortByKey(k).el());
    },
    //详情区域渲染
    _renderDetail: function (fn) {
        if (this.detail_timer)
            clearTimeout(this.detail_timer);
        var base = this;
        if (this.detail_timer_enable)
            this.detail_timer = setTimeout(fn, 100);//增加timer延迟优化UI感受性能
        else
            fn();
    },
    ////////////////////////////////////////////////////////////////////////////////////////
    //批量对wrapper中的当前region执行flush操作
    _flushSorts: function () {
        var base = this;
        this.$wrapper.find('.todolist:visible').each(function () {
            var sort = base.getSort($(this));
            if (sort != undefined) {
                debuger.debug('flush sort of region', sort);
                sort.flush(true);
            }
        });
        //允许额外的实现
        if (this.onFlushSorts)
            this.onFlushSorts();
    },
    ////////////////////////////////////////////////////////////////////////////////////////
    //wrapper主体事件绑定，处理全局事件
    _prepareBinds: function () {
        //取消所有已有bind
        this.$wrapper.unbind();
        this.$wrapper.find('tr.row_task').unbind();
        this.$wrapper.find('input').unbind();
        this.$wrapper_detail.unbind();
        //基本绑定
        this._bind();
        //键盘快捷键绑定
        this._bindShortcuts();
        //团队功能绑定
        if (this._bindTeam)
            this._bindTeam();
        //允许额外的实现
        if (this.onPrepareBinds)
            this.onPrepareBinds();
    },
    _expandRegion: function ($r) { $r.show(); },
    _expandRowRegion: function ($row) {
        $row.parents('tbody').eq(0).show();
    },
    _setEditable: function ($el) {
        //HACK:task管理自身的可编辑性，此处只负责处理列表的可编辑性，如：排序
    },
    _appendTaskToRow: function ($row, t, a) {
        var active = a == undefined ? this.getTask($row) : a;
        var $input = $row.find('input');
        t.el()[$input[0].selectionStart == 0 && $input.val() != '' ? 'insertBefore' : 'insertAfter']($row);
        if ($input[0].selectionStart > 0) {
            //若出现截断则拆分任务
            var prevVal = $input.val().substring(0, $input[0].selectionStart);
            var nextVal = $input.val().substring($input[0].selectionStart);
            debuger.debug('prevVal=' + prevVal);
            debuger.debug('nextVal=' + nextVal);
            active.setSubject(prevVal, true);
            t.setSubject(nextVal, true);
        }
    },
    ////////////////////////////////////////////////////////////////////////////////////////
    //行为和主要差异部分 不做实现
    //判断区域合法性
    _isValidRegion: function ($r) { return true; },
    _isRowOfValidRegion: function ($r) { return true; },
    //完整渲染
    render: function () { },
    //新建
    appendTask: function () { },
    //归档
    archiveTasks: function () { },
    ////////////////////////////////////////////////////////////////////////////////////////
    //行为和主要差异部分 部分实现
    //删除
    deleteTask: function (b) {
        var $actives = this.getActives();
        if ($actives.length == 0) return;
        var base = this;
        //先清空上一次的删除缓冲
        base.continueDelete();
        base.deletes = [];
        //批量删除
        $actives.each(function () {
            var active = base.getTask($(this));
            if (!active.editable) return;
            var id = active.id();
            base.setTask(id, null);
            //追加删除变更
            base.deletes = $.merge(base.deletes, [{ 'Type': 1, 'ID': id }]);
            active.el().remove();
        });

        var l = this.deletes.length;
        if (l == 0)
            return l;
        if (b) {
            this.continueDelete();
        } else {
            //给予一定时间的撤销机会 
            //注意：由于定时原因，会导致重新加载操作时删除记录未被提交
            var i = 10;
            this.$cancel_delete.show().find('span').eq(0).html(l);
            this.deletes_timer = setTimeout(function () { base.continueDelete(); }, i * 1000);
            //优化体验 给出倒计时
            clearInterval(this.deletes_timer2);
            var $temp = this.$cancel_delete.show().find('span').eq(1).html(i);
            this.deletes_timer2 = setInterval(function () { if (i-- > 0) $temp.html(i) }, 1000);

            this._flushSorts();
            this.$wrapper_detail.empty();
        }
        return l;
    },
    cancelDelete: function () {
        debuger.info('cancel deletes', this.deletes);
        clearTimeout(this.deletes_timer);
        this.deletes_timer = null;
        this.deletes = null;
        this.$cancel_delete.hide();
    },
    continueDelete: function () {
        debuger.info('continue deletes', this.deletes);
        clearTimeout(this.deletes_timer);
        //填充进全局删除记录
        if (this.deletes)
            this.commitDeletes(this.deletes);
        this.deletes_timer = null;
        this.deletes = null;
        this.$cancel_delete.hide();
    },
    toggleTasks: function () {
        var display = this.$wrapper.find('tbody').first().css('display');
        this.$wrapper.find('tbody')[display == 'none' ? 'show' : 'hide']();
    },
    setEditable: function (b) {
        debuger.debug('setEditable=' + b);
        this.modeArgs.editable = b;
        this._prepareBinds();
        this._setEditable(this.$wrapper);
    }
}