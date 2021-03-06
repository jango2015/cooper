﻿//Copyright (c) CodeSharp.  All rights reserved. - http://www.icodesharp.com/

///<reference path="lang.js" />
///<reference path="common.js" />
///<reference path="changelog.js" />
///<reference path="../Content/js/moment.min.js" />

var identity = 0;
//描述任务缓存项
// *****************************************************
// 遵循以下原则
// 完成task数据+显示逻辑处理（row+detail）
// 完整描述数据逻辑
// 部分完成DOM显示控制逻辑，于DOM高度耦合以及涉及task实例之外的全局相关处理由外部设置实现
// *****************************************************
var Task = function () { this._init.apply(this, arguments); }
Task.prototype = {
    $el_row: null,
    $el_detail: null,
    editable: true,
    _init: function () {
        var t = arguments.length > 0 ? arguments[0] : {};
        this.editable = t['Editable'] == undefined ? true : t['Editable'];
        //数据格式适配
        this['data'] = {
            'id': t['ID'] != undefined ? t['ID'].toString() : 'temp_' + (++identity) + '_' + new Date().getTime(), //可自动构建临时id 总是以string使用
            'subject': t['Subject'] != undefined ? t['Subject'] : '',
            'body': t['Body'] != undefined ? t['Body'] : '',
            'createTime': t['CreateTime'] || t['createTime'],
            'priority': t['Priority'] != undefined ? t['Priority'] : 0, //0=today 1=upcoming 2=later priority 总是以string使用
            'dueTime': t['DueTime'] != undefined && t['DueTime'] != null && t['DueTime'] != '' ? this._parseDate(t['DueTime']) : null,
            'isCompleted': t['IsCompleted'] != undefined ? t['IsCompleted'] : false,
            'tags': t['Tags'] || t['tags'] || [],
            //team模块相关
            //TODO:移植到扩展模块？
            'creator': t['Creator'] != undefined ? this._mapMember(t['Creator']) : null,
            'assignee': t['Assignee'] != undefined ? this._mapMember(t['Assignee']) : null,
            'assigneeId': t['Assignee'] ? t['Assignee']['ID'] || t['Assignee']['id'] : null,
            'projects': t['Projects'] ? $.map(t['Projects'], function (n) { return { 'id': n['ID'] || n['id'], 'name': n['Name'] || n['name'] }; }) : [],
            'comments': t['Comments'] ? $.map(t['Comments'], this._mapComment) : []
        }
        this.$el_row = this._generateItem(this['data']);
        this.$el_detail = null;

        try{
            if (debuger.isDebugEnable)
                this._getRowEl('subject').attr('placeholder', '#' + this.id());
        } catch (e) {
            debuger.error('placeholder not support', e);
        }
    },
    _mapMember: function (n) {
        return {
            'id': n['ID'] || n['id'],
            'name': n['Name'] || n['name'],
            'email': n['Email'] || n['email']
        };
    },
    _mapComment: function (n) {
        return {
            'id': n['ID'] || n['id'],
            'body': n['Body'] || n['body'],
            'createTime': n['CreateTime'] || n['createTime'],
            'creator': n['Creator'] || n['creator']//TODO:调整到_mapMember?或只提供creatorid
        };
    },
    _generateItem: function (d) { return $(render($('#tmp_region tbody').html(), d)); },
    _generateDetail: function (d) { d.dueTimeId = 'dueTime'; return $(render($('#tmp_detail').html(), d)); },
    _parseDate: function (t) { return typeof (t) == 'string' ? $.datepicker.parseDate('yy-mm-dd', t) : t; },
    _parseDateString: function (t) { return (t.getMonth() + 1) + '-' + t.getDate(); },
    _parseFullDateString: function (t) { return t.getFullYear() + '-' + (t.getMonth() + 1) + '-' + t.getDate(); },
    _getRowEl: function (p) {
        var k = '$' + p;
        if (!this.$el_row[k])
            this.$el_row[k] = this.$el_row.find('#' + p);
        return this.$el_row[k];
    },
    _getDetailEl: function (p) {
        var k = '$' + p;
        if (!this.$el_detail[k])
            this.$el_detail[k] = this.$el_detail.find('#' + p);
        return this.$el_detail[k];
    },
    _setClass: function ($e, b, c) { $e[b ? 'addClass' : 'removeClass'](c); },
    _pickString: function (a, n, s) {
        if (!a || a.length == 0)
            return '';
        var str = [a.length];
        for (var i = 0; i < a.length; i++)
            str[i] = a[i][n];
        return str.join(s);
    },
    _addDeleteChange: function (k, i, b) {
        if (!this.editable && !b) return;
        appendDeleteChange('task', this.id(), k, i);
    },
    _addInsertChange: function (k, i, b) {
        if (!this.editable && !b) return;
        appendInsertChange('task', this.id(), k, i);
    },
    _addUpdateChange: function (k, v) {
        appendUpdateChange('task', this.id(), k, v);
    },
    ///////////////////////////////////////////////////////////////////////////////
    renderRow: function () {
        //ie8下首次_generateItem导致内容显示截断
        this.setSubject(this.subject(),true);
        this.setCompleted(this.isCompleted());
        this.setPriority(this.priority());
        this.setDueTime(this.due());
        this.setAssignee(this.assignee());
        this.setTags(this.tags());
        this.setEditable(this.editable);
    },
    renderDetail: function () {
        if (!this.$el_detail)
            this.$el_detail = this._generateDetail(this['data']);
        //部分事件如blur无法全局因此在此执行一些额外的rebind
        if (this.bind_detail)
            this.bind_detail(this.$el_detail, this);
        if (this.bind_detail_team)
            this.bind_detail_team(this.$el_detail, this);
        //设置值
        this.setDetail_Completed(this.isCompleted());
        this.setDetail_Subject(this.subject());
        this.setDetail_Priority(this.priority());
        this.setDetail_DueTime(this.due());
        this.setDetail_Body(this.body());
        this.setDetail_Creator(this.creator());
        this.setDetail_Assignee(this.assignee());
        this.setDetail_Projects(this.projects());
        this.setDetail_Comments(this.comments());
        this.setDetail_Tags(this.tags());
        //设置编辑状态
        this.setDetail_Editable(this.editable);
        return this.$el_detail;
    },
    //额外修正一些显示问题 由于未呈现(append)导致的UI问题
    fixDetail: function () {
        //this.setDetail_Body(this.get('body'));
    },
    dispose: function () {
        if (this.$el_row) {
            this.$el_row.remove();
            this.$el_row = null;
        }
        if (this.$el_detail) {
            this.$el_detail.remove();
            this.$el_detail = null;
        }
    },
    get: function (k) { return this['data'][k]; },
    update: function (k, v) {
        if (this['data'][k] == v) return false;
        this['data'][k] = v;
        this._addUpdateChange(k, v);
        return true;
    },
    set: function (k, v) {
        if (k == 'priority')
            this.setPriority(v);
        if (k == 'dueTime')
            this.setDueTime(v);
    },
    ///////////////////////////////////////////////////////////////////////////////
    //常用属性
    el: function () { return this.$el_row; },
    id: function () { return this.get('id'); },
    isCompleted: function () { return this.get('isCompleted') },
    priority: function () { return this.get('priority') },
    due: function () { return this.get('dueTime'); },
    subject: function () { return this.get('subject'); },
    body: function () { return this.get('body'); },
    createTime: function () { return this.get('createTime'); },
    creator: function () { return this.get('creator'); },
    assignee: function () { return this.get('assignee'); },
    projects: function () { return this.get('projects'); },
    comments: function () { return this.get('comments'); },
    tags: function () { return this.get('tags'); },
    ///////////////////////////////////////////////////////////////////////////////
    //属性以及ui设置
    setId: function (i) {
        this['data']['id'] = i;
        this.$el_row.attr('id', i);
        this.setDetail_Id(i);

        try{
            if (debuger.isDebugEnable)
                //ie7以及以下没有placeholder属性
                this._getRowEl('subject').attr('placeholder', '#' + this.id());
        } catch (e) {
            debuger.error('placeholder not support', e);
        }
    },
    setIndex: function (i) { this._getRowEl('index').html(i); },
    setSubject: function (s, f) {
        var k = 'subject';
        this.update(k, s);
        //为双向同步而设置的f标识
        if (f == undefined || !f)
            this.setDetail_Subject(s);
        else if (f)
            this._getRowEl(k).val(s);
    },
    setBody: function (b) {
        this.update('body', b);
        this.setDetail_Body(b);
    },
    setCompleted: function (b) {
        var k = 'isCompleted';
        this.update(k, b);
        this._getRowEl(k).css('display', b ? 'block' : 'none');
        this._setClass(this.$el_row, b, 'row_completed');
        this.setDetail_Completed(b);
    },
    setPriority: function (p) {
        var k = 'priority';
        this.update(k, p.toString());
        //设置priority图标显示与否 避免出现inline
        this._getRowEl('priority').css('display', p == 0 ? 'block' : 'none');
        this.setDetail_Priority(p);
    },
    setDueTime: function (t) {
        var k = 'dueTime';
        //为避免与detail区域的input#deuTime重复id，而导致jqdatepicker异常
        //https://github.com/codesharp/cooper/issues/41
        var $e = this._getRowEl(k + 'Label');
        if (t == undefined || t == null) {
            this.update(k, null);
            $e.html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            return;
        }
        this.update(k, t);
        var today = $.datepicker.parseDate('yy-mm-dd', this._parseFullDateString(new Date())).getTime();
        var date = $.datepicker.parseDate('yy-mm-dd', this._parseFullDateString(t)).getTime();
        //优化用户化文本显示
        $e.html(today == date ? lang.today : this._parseDateString(t));
        //过期标记
        this._setClass($e, !this.isCompleted() && today >= date, 'cell_duetime_expired');
        this._setClass($e, this.isCompleted(), 'cell_duetime_completed');
        this.setDetail_DueTime(t);
    },
    setEditable: function (b) {
        this.editable = b;
        //使用keyup来屏蔽变更
        //HACK:设置readonly会导致del事件无法在list区域处理的问题
        if (!this.editable)
            this._getRowEl('subject').css('cursor', 'not-allowed');
        //.attr('readonly', !this.editable);
        this.setDetail_Editable(b);
    },
    setAssignee: function (u) {
        var k = 'assignee';
        this.update(k + 'Id', u ? u['id'] : null); //只更新assigneeId
        this['data'][k] = u; //直接更新assignee对象
        this._getRowEl(k).html(u ? u['name'] : '').css('display', u ? 'block' : 'none');
        this.setDetail_Assignee(u);
    },
    setProjects: function (ps) {
        if (!ps) return;
        this['data']['projects'] = ps; //直接更新projects数组
        this.setDetail_Projects(ps);
    },
    addProject: function (p) {
        debuger.assert(p);
        this._addInsertChange('projects', p['id']);
        this.setProjects($.merge($.grep(this.projects(), function (n, i) { return n['id'] != p['id']; }), [p]));
    },
    removeProject: function (p) {
        this._addDeleteChange('projects', p);
        this.setProjects($.grep(this.projects(), function (n, i) { return n['id'] != p; }));
    },
    setComments: function (cs) {
        if (!cs) return;
        this['data']['comments'] = cs; //直接更新comments数组
        this.setDetail_Comments(cs);
    },
    addComment: function (body) {
        this._addInsertChange('comments', body, true);
        this.setComments($.merge(this.comments(), [{
            body: body,
            createTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }]));
    },
    setTags: function (tags) {
        if (!tags) return;
        var k = 'tags';
        this['data'][k] = tags; //直接更新tags数组
        //渲染row_task
        this._getRowEl(k)[tags.length != 0 ? 'show' : 'hide']().empty();
        var color = [
            'label-info',
            'label-warning',
            'label-important',
            'label-success',
            'label-inverse',
            'label'];
        for (var i = 0; i < tags.length; i++) {
            var $i = $('<span class="label '
                //+ color[1]//UNDONE:色调过于混乱？
                + color[i % color.length]
                + '"></span> ');
            var max = i == 3;
            var t = max ? '...' : tags[i];
            //防止html/script注入
            this._getRowEl(k).append($i.text(t)).append('&nbsp;');
            if (max) break;
        }
        //渲染详情
        this.setDetail_Tags(tags);
    },
    addTag: function (t) {
        if ($.trim(t) == '') return;
        this._addInsertChange('tags', t);
        this.setTags($.merge($.grep(this.tags(), function (n, i) { return n.toLowerCase() != t.toLowerCase(); }), [t]));
    },
    removeTag: function (t) {
        this._addDeleteChange('tags', t);
        this.setTags($.grep(this.tags(), function (n, i) { return n.toLowerCase() != t.toLowerCase(); }));
    },
    ///////////////////////////////////////////////////////////////////////////////
    //detail设置
    setDetail_Id: function (i) {
        if (!this.$el_detail) return;
        this.$el_detail.attr('id', i);
    },
    setDetail_Subject: function (s) {
        if (!this.$el_detail) return;
        this._getDetailEl('subject').val(s);
    },
    setDetail_Body: function (b, f) {
        if (!this.$el_detail) return;
    },
    setDetail_Priority: function (p) {
        if (!this.$el_detail) return;
        this._getDetailEl('priority')
            .find('button')
            .removeClass('active')
            .eq(parseInt(p))
            .addClass('active');
    },
    setDetail_Completed: function (b) {
        if (!this.$el_detail) return;
        this._setClass(this._getDetailEl('isCompleted'), b, 'active');
        this._setClass(this._getDetailEl('isCompleted'), b, 'btn-success');
    },
    setDetail_DueTime: function (t) {
        if (!this.$el_detail) return;
        if (t != null)
            this._getDetailEl('dueTime').val(this._parseFullDateString(t));
    },
    setDetail_Creator: function (u) {
        if (!this.$el_detail) return;
        this._getDetailEl('creator').html(u ? '<i class="icon-info-sign"></i> '
            + u['name']
            + lang.create_task + ' - '
            + moment(this.createTime(), 'YYYY-MM-DD HH:mm:ss').fromNow() : '');
    },
    setDetail_Assignee: function (u) {
        if (!this.$el_detail) return;
        this._getDetailEl('assignee').html(u ? u['name'] : '');
    },
    setDetail_Projects: function (ps) {
        if (!this.$el_detail || !ps) return;
        if (this.render_detail_projects)
            this.render_detail_projects(this._getDetailEl('projects'), ps);
    },
    setDetail_Comments: function (cs) {
        if (!this.$el_detail || !cs) return;
        if (this.render_detail_comments)
            this.render_detail_comments(this._getDetailEl('comments'), cs);
    },
    setDetail_Editable: function (b) {
        if (!this.$el_detail) return;
        this._getDetailEl('subject').attr('disabled', !this.editable);
        this._getDetailEl('body').attr('disabled', !this.editable);
        this._getDetailEl('dueTime').attr('disabled', !this.editable);
        this._getDetailEl('priority').find('button').attr('disabled', !this.editable);
        this._getDetailEl('tags').find('.flag_remove')[this.editable ? 'show' : 'hide']();
        this._getDetailEl('tags_btn')[this.editable ? 'show' : 'hide']();
        this._getDetailEl('assignee_btn')[this.editable ? 'show' : 'hide']();
        this._getDetailEl('projects').find('.flag_remove')[this.editable ? 'show' : 'hide']();
        this._getDetailEl('projects_btn')[this.editable ? 'show' : 'hide']();
    },
    setDetail_Tags: function (tags) {
        if (!this.$el_detail || !tags) return;
        if (this.render_detail_tags)
            this.render_detail_tags(this._getDetailEl('tags'), tags);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////
//描述任务排序数据缓存
var Sort = function () { this._init.apply(this, arguments); }
Sort.prototype = {
    $el_region: null,
    _init: function () {
        this['by'] = arguments[0];//排序依据，对应task属性，如：priority，assignee
        this['key'] = arguments[1]; //0,1,2,{id:1,name:'wsky'}
        this['name'] = arguments[2]; //今天、稍后、迟些、项目1、团队1、wsky
        this['idx'] = arguments[3]; //[0,1,2,4]
        this.$el_region = $(render($('#tmp_region').html(), this));
        this._clearRegion();
    },
    _getTask: null, //涉及全局变量处理由全局UI指定此实现
    _getRows: function () { return this.el().find('tbody').find('tr') },
    _append: function (e) { this.el().find('tbody').append(e); },
    _prepend: function (e) { this.el().find('tbody').prepend(e); },
    _clearRegion: function () { this.el().find('tbody').empty() },
    dispose: function () {
        if (!this.$el_region) return;
        this.$el_region.remove();
        this.$el_region = null;
    },
    el: function () { return this.$el_region; },
    indexs: function (idx) { if (idx) this['idx'] = idx; return this['idx']; },
    render: function () {
        this._clearRegion();
        var idx = this.indexs();
        for (var i = 0; i < idx.length; i++) {
            var id = idx[i].toString();
            var task = this._getTask(id);
            if (!task) {
                debuger.error('wrong id ' + id, idx);
                continue;
            }
            task.renderRow();
            task.setIndex(i + 1); //设置索引显示
            this._append(task.el());
        }
        //总数
        this.el().find('#region_total').html(idx.length);
    },
    //根据el刷新索引数据以及对应索引显示
    flush: function (b) {
        var base = this;
        var $els = this._getRows();
        var ary = new Array($els.length);
        $els.each(function (i, n) {
            var id = $(n).attr('id');
            ary[i] = id;
            base._getTask(id).setIndex(i + 1); //设置索引显示
            //依据idx数据额外修正task数据
            if (b)
                base._getTask(id).set(base['by'], base['key']);
        });
        this['idx'] = ary;
        this.el().find('#region_total').html(ary.length);
    },
    //实时刷新并获取索引
    getIndexs: function () {
        var $els = this._getRows();
        var ary = new Array($els.length);
        $els.each(function (i, n) { ary[i] = $(n).attr('id'); });
        //this['idx'] = ary;
        this['idx'] = $.grep(ary, function (n) { return n.indexOf('temp_') < 0; });
        return this['idx'];
    },
    append: function (t, b) { this._append(t.el()); this.flush(b); }, //不可this.flush(true)
    prepend: function (t, b) { this._prepend(t.el()); this.flush(b); }
}