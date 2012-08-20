﻿/// Copyright (c) CodeSharp.  All rights reserved. - http://www.icodesharp.com/
/// <reference path="../../Content/angular/angular-1.0.1.min.js" />
/// <reference path="../../Content/jquery/jquery-1.7.2.min.js" />
/// <reference path="../../Scripts/common.js" />
/// <reference path="../../Scripts/lang.js" />
/// <reference path="../controllers/Main.js" />

if (!window.url_root)
    url_root = '';
if (!window.url_root_webui)
    url_root_webui = '/webui';

var cooper = angular.module('cooper', []);

cooper.value('lang', lang);

cooper.value('tmp', {
    left: url_root_webui + '/left.htm',
    team_list: url_root_webui + '/team/list.htm',
    team_detail: url_root_webui + '/team/detail.htm',
    task_list: url_root_webui + '/task/list.htm',
    task_detail: url_root_webui + '/task/detail.htm',
    task_templates: url_root_webui + '/task/templates.htm'
});

cooper.value('urls', {
    personal: url_root + '/per',
    account: url_root + '/account',
    team: function (t) { if (t) return url_root + '/t/' + t.id; },
    member: function (t, m) { if (t && m) return url_root + '/t/' + t.id + '/m/' + m.id; },
    project: function (t, p) { if (t && p) return url_root + '/t/' + t.id + '/p/' + p.id; }
});

cooper.value('params', { teamId: currentTeamId, projectId: currentProjectId, memberId: currentMemberId });

cooper.config([
    '$routeProvider',
    '$locationProvider',
    function ($routeProvider, $locationProvider) {
        var url = url_root_webui + '/team/full.htm';
        $routeProvider.
        when('/t/:teamId', {
            templateUrl: url,
            controller: MainCtrl
        }).
        when('/t/:teamId/p/:projectId', {
            templateUrl: url,
            controller: MainCtrl
        }).
        when('/t/:teamId/m/:memberId', {
            templateUrl: url,
            controller: MainCtrl
        }).
        otherwise({
            controller: MainCtrl
        });
        $locationProvider.html5Mode(true);
    }
]);