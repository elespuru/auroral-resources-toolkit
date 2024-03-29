/*************************************************************************

COPYRIGHTS:

Copyright (c) 2010, National Geophysical Data Center, NOAA
Copyright (c) 2010, Geophysical Center, Russian Academy of Sciences
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer. Redistributions in binary
form must reproduce the above copyright notice, this list of conditions and
the following disclaimer in the documentation and/or other materials
provided with the distribution. Neither the names of the National Geophysical
Data Center, NOAA and the Geophysical Center, RAS nor the names of their
contributors may be used to endorse or promote products derived from this
software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.

LICENSE:

LGPL: http://www.gnu.org/licenses/lgpl.html
or
EPL: http://www.eclipse.org/org/documents/epl-v10.php

AUTHOR(S) OF THIS FILE:
Peter Elespuru - peter.elespuru@noaa.gov

*************************************************************************/

qx.Class.define("auroral_resources.messaging.TimeBus",
{

    //
    // This class is largely a placeholder if/when we need more
    // functionality boiled into the messaging bus for unified time.
    // It implements the singleton design pattern.
    //
    type: "singleton",
    extend : qx.core.Object,


    /*
    *****************************************************************************
        CONSTRUCTOR
    *****************************************************************************
    */
    construct : function()
    {
        this.base(arguments);
        this.__bus = qx.event.message.Bus;
        this.__bus.subscribe("time.startDate", this._startDateChangeBusCallback, this);
        this.__bus.subscribe("time.now", this._nowChangeBusCallback, this);
        this.__bus.subscribe("time.stopDate", this._stopDateChangeBusCallback, this);
        return this;
    },


    /*
    *****************************************************************************
        CLASS VARIABLES AND METHODS
    *****************************************************************************
    */
    members :
    {
        __bus : null,
        __startDate : null,
        __stopDate : null,
        __now : null,

        //
        // wraps the get instance and dispatch into a convenience function
        //
        dispatch : function(msg) {
            this.__bus.getInstance().dispatch(msg);
        },

        //
        // bus reference getter
        //
        getBus : function() {
            return this.__bus;
        },

        //
        // start date setter
        //
        setStartDate : function(date) {
            this.__startDate = date;
        },

        //
        // start date getter
        //
        getStartDate : function() {
            return this.__startDate;
        },

        //
        // start date getter, in the format SPIDR GetData2 WS format 2008-08-01T00:00:00UTC
        //
        getStartDateForSPIDRWS2 : function() {
            var start = this.__startDate;
            start = new Date(start);
            //var mo = start.getUTCMonth() + 1;
            var mo = start.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            //var dy = start.getUTCDate();
            var dy = start.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // start = start.getUTCFullYear() + "" + mo + "" + dy;
            var ymd = start.getFullYear() + "-" + mo + "-" + dy + "T";
            var hr = start.getHours();
            if (hr.length == 1 ) { hr = "0" + hr; }
            ymd += hr + ":";
            var mn = start.getMinutes();
            if (mn.length == 1 ) { mn = "0" + mn; }
            ymd += mn + ":";
            var sc = start.getSeconds();
            if (sc.length == 1 ) { sc = "0" + sc; }
            ymd += sc + "UTC";
            return ymd;
        },

        //
        // start date getter, in the format SPIDR WS needs
        //
        getStartDateForSPIDRWS : function() {
            var start = this.__startDate;
            start = new Date(start);
            //var mo = start.getUTCMonth() + 1;
            var mo = start.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            //var dy = start.getUTCDate();
            var dy = start.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // start = start.getUTCFullYear() + "" + mo + "" + dy;
            start = start.getFullYear() + "" + mo + "" + dy;
            return start;
        },

        //
        // start date getter, in the format LISIRD WS needs
        //
        getStartDateForLISIRD : function() {
            var start = this.__startDate;
            start = new Date(start);
            //var mo = start.getUTCMonth() + 1;
            var mo = start.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            //var dy = start.getUTCDate();
            var dy = start.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // start = start.getUTCFullYear() + "" + mo + "" + dy;
            start = start.getFullYear() + "-" + mo + "-" + dy;
            return start;
        },
        
        //
        // stop date getter, in the format SPIDR GetData2 WS format 2008-08-01T00:00:00UTC
        //
        getStopDateForSPIDRWS2 : function() {
            var stop = this.__stopDate;
            stop = new Date(stop);
            var mo = stop.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            var dy = stop.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            var ymd = stop.getFullYear() + "-" + mo + "-" + dy + "T";
            var hr = stop.getHours();
            if (hr.length == 1 ) { hr = "23" + hr; }
            ymd += hr + ":";
            var mn = stop.getMinutes();
            if (mn.length == 1 ) { mn = "59" + mn; }
            ymd += mn + ":";
            var sc = stop.getSeconds();
            if (sc.length == 1 ) { sc = "59" + sc; }
            ymd += sc + "UTC";

            return ymd;
        },

        //
        // stop date getter, in the format SPIDR WS needs
        //
        getStopDateForSPIDRWS : function() {
            var stop = this.__stopDate;
            stop = new Date(stop);
            // var mo = stop.getUTCMonth() + 1;
            var mo = stop.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            // var dy = stop.getUTCDate();
            var dy = stop.getDate();
            dy = new Date(stop.valueOf()-86400).getDate(); // a bit more than a day
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // stop = stop.getUTCFullYear() + "" + mo + "" + dy;
            stop = stop.getFullYear() + "" + mo + "" + dy;
            return stop;
        },

        //
        // stop date getter, in the format LISIRD WS needs
        //
        getStopDateForLISIRD : function() {
            var stop = this.__stopDate;
            stop = new Date(stop);
            // var mo = stop.getUTCMonth() + 1;
            var mo = stop.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            // var dy = stop.getUTCDate();
            var dy = stop.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // stop = stop.getUTCFullYear() + "" + mo + "" + dy;
            stop = stop.getFullYear() + "-" + mo + "-" + dy;
            return stop;
        },
        
        //
        //
        //
        convertToSPIDRWS : function(timeinmillis) {
            var time = timeinmillis;
            time = new Date(time);
            // var mo = time.getUTCMonth() + 1;
            var mo = time.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            // var dy = time.getUTCDate();
            var dy = time.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // time = time.getUTCFullYear() + "" + mo + "" + dy;
            time = time.getFullYear() + "" + mo + "" + dy;
            return time;
        },      

        //
        //
        //
        convertToSPIDRWS2 : function(timeinmillis) {
            var time = timeinmillis;
            time = new Date(time);
            // var mo = time.getUTCMonth() + 1;
            var mo = time.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            // var dy = time.getUTCDate();
            var dy = time.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // time = time.getUTCFullYear() + "" + mo + "" + dy;
            var ymd = time.getFullYear() + "-" + mo + "-" + dy + "T";
            var hr = time.getHours();
            if (hr.length == 1 ) { hr = "0" + hr; }
            ymd += hr + ":";
            var mn = time.getMinutes();
            if (mn.length == 1 ) { mn = "0" + mn; }
            ymd += mn + ":";
            var sc = time.getSeconds();
            if (sc.length == 1 ) { sc = "0" + sc; }
            ymd += sc + "UTC";
            return ymd;
        },

        //
        //
        //
        convertToLISIRD : function(timeinmillis) {
            var time = timeinmillis;
            time = new Date(time);
            // var mo = time.getUTCMonth() + 1;
            var mo = time.getMonth() + 1;
            mo = "" + mo;
            if (mo.length == 1 ) { mo = "0" + mo; }
            // var dy = time.getUTCDate();
            var dy = time.getDate();
            dy = "" + dy;
            if (dy.length == 1) { dy = "0" + dy; }
            // time = time.getUTCFullYear() + "" + mo + "" + dy;
            time = time.getFullYear() + "-" + mo + "-" + dy;
            return time;
        },      
        
        //
        //
        //
        getCurrentTime : function() {
            return new Date().getTime();
        },
        
        //
        //
        //
        getNowUTC : function() {
            var d = new Date();
            return Date.UTC(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                d.getHours(),
                d.getMinutes(),
                d.getSeconds(),
                d.getMilliseconds()
            );
        },
                
        //
        //
        //
        getUTCfromDate : function(d) {
            return Date.UTC(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
                d.getHours(),
                d.getMinutes(),
                d.getSeconds(),
                d.getMilliseconds()
            );
        },
        
        //
        // now date setter
        //
        setNow : function(date) {
            this.__now = date;
        },

        //
        // now date getter
        //
        getNow : function() {
            return this.__now;
        },

        //
        // stop date setter
        //
        setStopDate : function(date) {
            this.__stopDate = date;
        },

        //
        //  stop date getter
        //
        getStopDate : function() {
            return this.__stopDate;
        },

        //
        // callback for the 'startDate' message channel
        //
        _startDateChangeBusCallback : function(e) {
            //alert(parseInt(e.getData()) + '|||' + new Date(parseInt(e.getData())).toUTCString());
            this.__startDate = parseInt(e.getData());
        },

        //
        // callback for the 'now' message channel
        //
        _nowChangeBusCallback : function(e) {
            //alert(parseInt(e.getData()) + '|||' + new Date(parseInt(e.getData())).toUTCString());
            // round to nearest 5 min
            var cur = parseInt(e.getData());
            cur = Math.ceil(cur/(5000*60))*(5000*60);
            this.__now = cur;
        },

        //
        // callback for the 'stopDate' message channel
        //
        _stopDateChangeBusCallback : function(e) {
            //  alert(parseInt(e.getData()) + '|||' + new Date(parseInt(e.getData())).toUTCString());
            this.__stopDate = parseInt(e.getData());
        }	  
    }

});
