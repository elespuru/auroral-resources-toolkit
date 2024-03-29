/* ************************************************************************

COPYRIGHTS:

Copyright (c) 2011, National Geophysical Data Center, NOAA
Copyright (c) 2011, Geophysical Center, Russian Academy of Sciences
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
Peter R. Elespuru - peter.elespuru@noaa.gov

************************************************************************ */

/* ************************************************************************

#asset(auroral_resources/*)
#asset(collapsablepanel/*)
#asset(galleria/*)
#asset(qx/icon/${qx.icontheme}/16/actions/*)
#asset(qx/icon/${qx.icontheme}/22/actions/*)
#asset(qx/icon/${qx.icontheme}/16/apps/utilities-help.png)
#asset(qx/icon/${qx.icontheme}/22/apps/preferences-users.png)

************************************************************************ */

/*
*****************************************************************************
*****************************************************************************
*/
qx.Class.define("auroral_resources.Application",
{

    extend : qx.application.Standalone,

    /*
    *****************************************************************************
        STATIC METHODS AND VARIABLES
    *****************************************************************************
    */
    statics :
    {

        __N_WIDGETS_ON_WORKSPACE : 0,
        __MAX_WIDGETS_ALLOWED_ON_WORKSPACE : 10,
        __X_OFFSET : 285,
        __Y_OFFSET : 97,
        __mainWindow : null,
        __originalUrl : null,
        __shortUrl : null,
        __longUrl : null,
        __SAFE_FOR_IE : true,

        //
        // add a window to the workspace a 0,0 origin
        //
        addWindow : function(w) {
            auroral_resources.Application.__mainWindow.add( w, { left:0, top:0 });
            w.open();
        },

        //
        // I absolutely hate this implementation, but there is _NOT_
        // a method one could use to tie into either the Desktop or Manager
        // widget add/remove logic, without creating a custom class of either that is.
        //
        // Addressing it this way for add, and having each widget decrement on close
        // is more maintainable, even if uglier, since we won't have to worry about
        // merging in changes from Qx proper into a custom derived class. It keeps
        // maintenance in our realm solely, that's the desired tradeoff...
        //
        isWidgetDropAllowed : function() {

            if ( auroral_resources.Application.__N_WIDGETS_ON_WORKSPACE >= 
                (auroral_resources.Application.__MAX_WIDGETS_ALLOWED_ON_WORKSPACE) ) {

                dialog.Dialog.med_alert 
                (
                    "No more widgets can be added, you have already added the maximum number allowed ("+
                    auroral_resources.Application.__MAX_WIDGETS_ALLOWED_ON_WORKSPACE+")."
                );

                return false;
            }
            
            auroral_resources.Application.__N_WIDGETS_ON_WORKSPACE += 1;
            return true;
        },


        //
        //
        //
        checkForIE : function() 
        {
            if ( qx.core.Environment.get("browser.name").toUpperCase() === "IE" ) {

                var iemsg = "Older versions of Internet Explorer may have problems with this site. For the best experience, please download and use Internet Explorer 9+, or, any other modern web browser such as Chrome, Safari, FireFox, Opera etc...";
                var ver = qx.core.Environment.get("browser.version");
                // only care about the major version...
                ver = ver.substring(0,1);

                // IE 8 ?
                if ( ver === "8" ) {
                    alert(iemsg);
                } 
                // IE 6 or 7 ?
                else if ( ver === "6" || ver === "7" ) {
                    auroral_resources.Application.__SAFE_FOR_IE = false;
                    alert(iemsg);
                } else {
                    // do nothing ?
                }
            }
        },

        //
        //
        //
        getHost : function() 
        {
            if ( window.location.host.indexOf(".") < 0 ) {
                if ( window.location.host.substr(0,4) === "spidr" ) {
                    return window.location.host + ".ngdc.noaa.gov";
                }
            }

            return window.location.host;
        },


        //
        // supports JSONP callback for use by the bit.ly API
        // 
        bitlyJsonCallback : function(response) 
        {
            var sUrl = auroral_resources.Application.__shortUrl = response.data.url;
            var url = auroral_resources.Application.__longUrl;
            auroral_resources.Application.openUrlDialog(sUrl, url);
        },


        //
        // modularizes the dialog a tad better than bundling with/above
        //
        openUrlDialog : function(sUrl, url) 
        {
            var pageData = [{
                "message" : "The short URL and long encoded URL below BOTH represent your current workspace, they're pre-selected for copy+paste convenience",
                "formData" : {
                    'share_url'   : {
                        'type'    : "TextArea",
                        'label'   : "URL",
                        'lines'   : 14,
                        'value'   : sUrl + "\n\n" + url
                    }
                }
            }];
                
            var wizard = new dialog.BareWizard({
                width: 600,
                height: 300,
                maxWidth: 600,
                pageData : pageData,
                allowCancel: false,
                allowBack: false,
                allowNext: false,
                callback : function() {},
                context : null
            });

            wizard.start('share_url');
        }
    },

    /*
    *****************************************************************************
        CLASS VARIABLES AND METHODS
    *****************************************************************************
    */
    members :
    {
        __list : null,
        __currentListItem : null,
        __header : null,
        __footer : null,
        __toolBarView : null,
        __menuBarView : null,
        __timeBus : null,
        __horizontalSplitPane : null,
        __verticalSplitPane : null,
        __prefWindow : null,
        __sideBar : null,
        __sideBarScroller : null,
        __mouseX : null,
        __mouseY : null,
        __widgets : null,
        __toolBarHider : null,
        __sideBarHider : null,

        /**
        *****************************************************************************
        * This method contains the initial application code and gets called 
        * during startup of the application
        * 
        * @lint ignoreDeprecated(alert)
        *****************************************************************************
        */
        main : function()
        {
            auroral_resources.Application.__originalUrl = window.location.toString();  
            auroral_resources.Application.checkForIE();

            // Call super class
            this.base(arguments);

            // monkey patch the default namespace
            this.monkeyPatch();

            this.initializeTimeBus();
            this._parseQueryStringForTimes();
            
            this.__widgets = new Array();
            
            // support native logging capabilities, e.g. Firebug for Firefox
            //qx.log.appender.Native;

            // support additional cross-browser console. Press F7 to toggle visibility
            //qx.log.appender.Console;

            qx.io.PartLoader.getInstance().addListener("partLoaded", function(e) {
                this.debug("part loaded: " + e.getData().getName());
            }, this);

            // Load current locale part
            var currentLanguage = qx.locale.Manager.getInstance().getLanguage();
            var knownParts = qx.Part.getInstance().getParts();

            // if the locale is available as part
            if (knownParts[currentLanguage]) {
	
                // load this part
                qx.io.PartLoader.require([currentLanguage], function() {

                    // forcing identical locale
                    qx.locale.Manager.getInstance().setLocale(currentLanguage);

                    // build the GUI after the initial locals has been loaded
                    this.buildGui();

                    }, this);

            } else {

                // default to english
                qx.locale.Manager.getInstance().setLocale("en");

                this.buildGui();

            } // end if/else

            // nuke the initial loading element
            var element = document.getElementById("initial_loading");
            element.parentNode.removeChild(element);
            
        }, // end main


        /**
        *****************************************************************************
        * Add some extra functions to existing classes, mainly helpers that don't
        * already exist
        *****************************************************************************
        */
        monkeyPatch : function() 
        {
            //
            // load date.js, the ninja date library
            //
            var sl = new qx.io.ScriptLoader();
            sl.load("script/date.js.gz", function(status) {
//            sl.load("script/date.js", function(status) {
                if (status === 'success') {
                    Date.prototype.getDOY = function() {
                        return new Date().getDayOfYear();
                    }
                }
            });

            //
            // load canvas2image and deps
            //
            var sl = new qx.io.ScriptLoader();
            var script = "script/canvas2image/base64.js.gz";
//            var script = "script/canvas2image/base64.js";
            sl.load( script, function(status ) {
                if (status !== 'success') {
                    this.error("Unable to load "+script);
                }
            });
            sl = new qx.io.ScriptLoader();
            script = "script/canvas2image/canvas2image.js.gz";
//            script = "script/canvas2image/canvas2image.js";
            sl.load( script, function(status ) {
                if (status !== 'success') {
                    this.error("Unable to load "+script);
                }
            });

        }, // end monkey patch


        /**
        *****************************************************************************
        * Ensure the time messaging bus is in a good inital state
        *****************************************************************************
        */
        initializeTimeBus : function()
        {
            // initialize the time bus
            // var now = this.getNowUTC();
            this.__timeBus = auroral_resources.messaging.TimeBus.getInstance();
            var now = this.__timeBus.getCurrentTime();
            var begin = now;
            var nDays = 2;
            begin -= (((86400) * nDays) * 1000); // nDays of millis
            var end = now;
            var cur = end - (((86400) * nDays/2) * 1000); //half nDays of millis
            // round to nearest 5 minutes
            cur = Math.ceil(cur/(5000*60))*(5000*60);
            cur = cur - 1000000;

            // initialize the time bus
            this.__timeBus.setStartDate(begin);
            this.__timeBus.setNow(cur);
            this.__timeBus.setStopDate(end);
        }, // end initialize time bus


        /**
        *****************************************************************************
        * Main routine which builds the GUI.
        *****************************************************************************
        */
        buildGui : function() 
        {
            // Create main layout
            var dockLayout = new qx.ui.layout.Dock();
            dockLayout.setSeparatorY("separator-vertical");
            var dockLayoutComposite = new qx.ui.container.Composite(dockLayout);
            this.getRoot().add(dockLayoutComposite, {edge:0});

            // Create header
            this.__header = new auroral_resources.view.Header();
            dockLayoutComposite.add(this.__header, {edge: "north"});

            // Create footer
            this.__footer = new auroral_resources.view.Footer();
            this.__footer.setMargin(0);
            this.__footer.setPadding(2);
            this.__footer.setPaddingLeft(5);
            this.__footer.setPaddingRight(5);
            this.__footer.setHeight(20);
            this.__footer.setMinHeight(20);
            this.__footer.setMaxHeight(20);
            dockLayoutComposite.add(this.__footer, {edge: "south"});

            // create the toggle for the toolbar
            this.__toolBarHider = new qx.ui.form.Button("", "resource/auroral_resources/icons/up_arrow_orange.png");
            this.__toolBarHider.setFocusable("false");
            this.__toolBarHider.setDecorator(null);
            this.__toolBarHider.setMargin(0);
            this.__toolBarHider.setPadding(0);
            this.__toolBarHider.setHeight(12);
            this.__toolBarHider.setMinHeight(12);
            this.__toolBarHider.setMaxHeight(12);
            this.__toolBarHider.setToolTipText(this.tr("Hide/Show the menu bar"));
            dockLayoutComposite.add(this.__toolBarHider, {edge: "north"});

            this.__toolBarHider.addListener("execute", function(e) {
                if(this.__toolBarView.isExcluded()) {
                    this.__toolBarView.show();
                    this.__toolBarHider.setIcon("resource/auroral_resources/icons/up_arrow_orange.png");
                } else {
                    this.__toolBarView.exclude();
                    this.__toolBarHider.setIcon("resource/auroral_resources/icons/down_arrow_orange.png");
                }
            }, this);

            // Add the toolbar
            this.__toolBarView = new auroral_resources.view.ToolBar(this);
            dockLayoutComposite.add(this.__toolBarView, {edge: "north"});

            // Create horizontal splitpane
            this.__horizontalSplitPane = new qx.ui.splitpane.Pane();
            dockLayoutComposite.add(this.__horizontalSplitPane);

            this.__sideBarScroller = new qx.ui.container.Scroll();
            var box = new qx.ui.layout.Basic();

            var container = new qx.ui.container.Composite(box).set({
                allowStretchY : false,
                allowStretchX : false
            });

            // define the workspace container
            auroral_resources.Application.__mainWindow = new qx.ui.window.Desktop(new qx.ui.window.Manager());
            auroral_resources.Application.__mainWindow.set({
                decorator: "main", 
                backgroundColor: "silver",
                width: 700,
                droppable: true,
                enabled: true
            });
            // behavior is too annoying... removing this tooltip it's too intrusive
            // toolTipText: "Drag components from the 'Available Resources' area at left, to anywhere inside this gray box's boundaries (even on top of other widgets)",

            auroral_resources.Application.__mainWindow.addListener("drop", this._widgetDropListener, this);


            // create and add the date/time chooser
            //var utc = this.getNowUTC();
            var time = this.__timeBus.getCurrentTime();
            var chooser = new timechooser.TimeChooser(Math.floor(time/1000));
            chooser.setLayoutFormat("below/vertical");
            container.add(chooser);

            this.__sideBarScroller.add(container);
            this.__sideBarScroller.setBackgroundColor("silver");
            this.__sideBarScroller.setWidth(280);
            this.__sideBarScroller.setMinWidth(190);
            this.__sideBarScroller.setMaxWidth(600);
            this.__sideBarScroller.setHeight(document.body.clientHeight - 450);
            this.__sideBarScroller.setMinHeight(200);
            this.__sideBarScroller.setMaxHeight(1024);

            // add the sidebar
            this.__sideBar = new auroral_resources.view.SideBar(this, auroral_resources.Application.__mainWindow);
            this.__sideBarScroller.add(this.__sideBar);
            
            // LAST: add the introduction window if the user hasn't requested that it be ignored from now on
            // TODO: add a generic cookie get/set class(es) so we aren't doing this low level everywhere...
            /* this window is more annoying than helpful apparently
            var intro = auroral_resources.persistence.KVStore.getInstance().get("intro");            
            
            if (intro == null || intro != "false") {
                var iwin = new auroral_resources.ui.tree.IntroductionWindow("Introduction");
                iwin.open();
                auroral_resources.Application.__mainWindow.add( iwin, { left: 50, top: 50 } );
            }
            */

            // create the toggle for the sidebar
            this.__sideBarHider = new qx.ui.form.Button("", "resource/auroral_resources/icons/left_arrow_orange.png");
            this.__sideBarHider.setFocusable("false");
            this.__sideBarHider.setDecorator(null);
            this.__sideBarHider.setMargin(0);
            this.__sideBarHider.setPadding(0);
            this.__sideBarHider.setWidth(12);
            this.__sideBarHider.setMinWidth(12);
            this.__sideBarHider.setMaxWidth(12);
            this.__sideBarHider.setToolTipText(this.tr("Hide/Show the time settings and tools"));
            dockLayoutComposite.add(this.__sideBarHider, {edge: "west"});

            this.__sideBarHider.addListener("execute", function(e) {
                if(this.__sideBarScroller.isExcluded()) {
                    this.__sideBarScroller.show();
                    this.__sideBarHider.setIcon("resource/auroral_resources/icons/left_arrow_orange.png");
                } else {
                    this.__sideBarScroller.exclude();
                    this.__sideBarHider.setIcon("resource/auroral_resources/icons/right_arrow_orange.png");
                }
            }, this);

            // add side bar to the split pane
            this.__horizontalSplitPane.add(this.__sideBarScroller, 0);

            // main area
            var scroller2 = new qx.ui.container.Scroll();
            scroller2.add(auroral_resources.Application.__mainWindow);
            this.__horizontalSplitPane.add(scroller2, 1);

            // add any query added widgets to the display
            this._parseQueryStringForWidgets();
            
        }, // end buildGui

        //
        //
        //
        goFullScreen : function () {

            if (!this.__sideBarScroller.isExcluded()) {
                this.__sideBarHider.execute();
            }

            if (!this.__toolBarView.isExcluded()) {
                this.__toolBarHider.execute();
            }
        },
        
        //
        //
        //
        showUrl : function () {
            this.shareUrl("email-no");
        },

        //
        // empty the workspace, nuke all widgets
        //
        emptyWorkspace : function() {
            auroral_resources.Application.__N_WIDGETS_ON_WORKSPACE = 0;
            auroral_resources.Application.__mainWindow.removeAll();
        },

        //
        // revert workspace to its state when the session began
        //
        revertWorkspace : function() {
            window.location = auroral_resources.Application.__originalUrl;
        },

        //
        // toggle the tool area off/on
        //
        toggleTools : function() {
            if(this.__sideBarScroller.isExcluded()) {
                this.__sideBarScroller.show();
            } else {
                this.__sideBarScroller.exclude();
            }
        },

        //
        // parse the workspace for widgets and build a URL that can be copied+pasted
        // and shared via email etc.
        //
        // TODO: add server side serialization of the workspace so that sharing
        // doesn't involve such a long URL... as it stands now, it's parsed
        // and handled entirely from the client. currently using bit.ly as a URL
        // shortener to address this, which may be sufficient, need a decision on it
        //
        shareUrl : function(shorten) {
            
            var url = window.location.protocol + '//' + window.location.host + window.location.pathname;
            url = url + '?time.startDate=' + this.__timeBus.getStartDate();
            url = url + '&time.now=' + this.__timeBus.getNow();
            url = url + '&time.stopDate=' + this.__timeBus.getStopDate();
            
            /* not needed, the probe below gets them all and ensures that any changed x,y are captured too
            // add any widgets specified in the URL until can probe for them
            var i = 0;
            for (i=0;i<this.__widgets.length;i++) {
                url = url + "&w" + i + '=' + this.__widgets[i];
            }
            */
            
            // add widgets by probing the workspace for details
            var windows = auroral_resources.Application.__mainWindow.getWindows();
            
            if (windows == null || windows.length == 0) {
                dialog.Dialog.error("You don't have any widgets on your workspace, there's nothing to share!");
                return;
            } else {
                var i = 0;
                for (i=0; i<windows.length; i++) {
                    var win = windows[i];
                    var b = win.getBounds();
                    var x = b["left"];
                    var y = b["top"];
                    var w = b["width"];
                    var h = b["height"];
                    var className = win.constructor.classname;
                    //className = className.substring(className.lastIndexOf('.')+1,className.length);
                    
                    if (className.toLowerCase() != "introductionwindow") {
                        url = url + "&w" + i + '=' + x + ',' + y + ',' + className + ',' + w + ',' + h + ',' + win.getStatus();
                    }
                }
            }
            
            var bitly = new auroral_resources.io.shortener.Bitly();
            if(typeof shorten !== undefined && shorten !== null && shorten === "email-no") {

                // this encodes too much
                //url = encodeURIComponent(url);
                var unencUrl = url;
                url = encodeURI(url);
                auroral_resources.Application.__longUrl = url;
                var sUrl = bitly.shortenWithCallback(unencUrl);
                return;
                
            } else {

                bitly.shortenAndEmail(url);
                return;
                    
            }
        }, // end shareUrl

        //
        // does the request include modifications to time ?
        //
        _parseQueryStringForTimes : function() {
            // check for time mods
            var startDate = getQueryVariable("time.startDate");
            if (startDate != null) { this.__timeBus.setStartDate(parseInt(startDate)); }
            
            var now = getQueryVariable("time.now");
            if (now != null) { this.__timeBus.setNow(parseInt(now)); }
            
            var stopDate = getQueryVariable("time.stopDate");
            if (stopDate != null) { this.__timeBus.setStopDate(parseInt(stopDate)); }
            
            function getQueryVariable(variable) { 
                var query = window.location.search.substring(1); 
                var vars = query.split("&"); 

                var size = 0;
                if (typeof vars !== undefined && vars !== null) {
                    size = vars.length;
                } else {
                    this.warn("the query string didn't include anything extra");
                }

                for (var i=0;i<size;i++) { 
                    var pair = vars[i].split("="); 
                    if (pair[0] == variable) { 
                        return pair[1]; 
                    } 
                }
            }
        },

        //
        // does the request include any widgets 
        //
        _parseQueryStringForWidgets : function() {
            
            //
            // either the user has requested nothing...
            //
            if (window.location.toString().indexOf("?") == -1) {
                
                //
                // IE bombs on this window.location via AJAX call...
                // gotta build the UI manually afterall when doing
                // the initial page redirect :(
                //
                /*
                // add introductory/welcome text
                var req = new qx.io.remote.Request(
                    "resource/auroral_resources/static/html/startpage.html",
                    "GET",
                    "text/html"
                );

                // ensure this content is grabbed fresh
                req.setProhibitCaching(false);
                req.addListener("completed", function(result) {
                    window.location = result.getContent();
                });
                req.send();
                */

                var mW = auroral_resources.Application.__mainWindow;
                var wD = this.__widgets;
                var pieces = [];

                // don't show the default widgets if running in dev on spidrd or localhost (i.e. laptop)
                var host = window.location.host.substr(0,6);
                if ( typeof host !== undefined && host !== null && host === "spidrd") { return; }
//                if ( typeof host !== undefined && host !== null && host === "localh") { return; }

                /* GAE proxied examples
                pieces = [1,1,"auroral_resources.ui.window.GoogleGlobeWindow",400,400,"3D Ovation Auroral Forecast"];
                addWidget(stringToClass, mW, pieces, wD);

                pieces = [402,1,"auroral_resources.ui.window.TimeSeriesWindow",400,200,"iono_foF2.BC840","(Proxied) Boulder%20(BC840)%20foF2%20%7BMHz%7D","IonoStationsBC840"];
                addWidget(stringToClass, mW, pieces, wD);

                pieces = [402,201,"auroral_resources.ui.window.TimeSeriesWindow",400,200,"iono_hpF.SMJ67","(Proxied) Sondrestrom%20(SMJ67)%20hpF%20%7BKm%7D","IonoStationsSMJ67"];
                addWidget(stringToClass, mW, pieces, wD);
                */

                /* "normal" default */
                pieces = [0,0,"auroral_resources.ui.window.ExternalImageWindow",325,350,"http://www.ngdc.noaa.gov/stp/ovation_prime/data/north_forecast_aacgm.png","Latest Ovation%20Prime%20Real-Time%20Forecast"];
                addWidget(stringToClass, mW, pieces, wD);

                pieces = [327,0,"auroral_resources.ui.window.ExternalImageWindow",400,350,"http://www.swpc.noaa.gov/pmap/gif/pmapN.gif","Latest POES Northern%20Statistical%20Auroral%20Oval"];
                addWidget(stringToClass, mW, pieces, wD);                

                pieces = [0,377,"auroral_resources.ui.window.TimeSeriesIndexWindow",325,160,"index_kp.est","Kp","geomInd"];
                addWidget(stringToClass, mW, pieces, wD);                

                pieces = [327,377,"auroral_resources.ui.window.TimeSeriesWindow",400,160,"vsw_x.ACE_RT","ACE%20Flow%20%7BKm/s%7D","78A5B86C-71AF-3D4D-A054-EE8E765CF8D6"];
                addWidget(stringToClass, mW, pieces, wD);
                /**/

                /*
                pieces = [0,487,"auroral_resources.ui.window.TimeSeriesWindow",445,209,"vsw_x.ACE_RT","ACE%20Flow%20%7BKm/s%7D","78A5B86C-71AF-3D4D-A054-EE8E765CF8D6"];
                addWidget(stringToClass, mW, pieces, wD);

                pieces = [0,684,"auroral_resources.ui.window.TimeSeriesWindow",445,197,"imf_bz.ACE_RT","ACE%20Bz%20%7BnT%7D","78A5B86C-71AF-3D4D-A054-EE8E765CF8D6"];
                addWidget(stringToClass, mW, pieces, wD);

                pieces = [0,0,"auroral_resources.ui.window.TimeSeriesIndexWindow",445,161,"index_kp.est","Kp","geomInd"];
                addWidget(stringToClass, mW, pieces, wD);
                
                pieces = [0,161,"auroral_resources.ui.window.TimeSeriesWindow",445,161,"iono_foF2.BC840","Boulder%20(BC840)%20foF2%20%7BMHz%7D","IonoStationsBC840"];
                addWidget(stringToClass, mW, pieces, wD);
                
                pieces = [0,321,"auroral_resources.ui.window.TimeSeriesWindow",445,161,"iono_foF2.TR169","Tromso%20(TR169)%20foF2%20%7BMHz%7D","IonoStationsTR169"];
                addWidget(stringToClass, mW, pieces, wD);
                
                pieces = [446,0,"auroral_resources.ui.window.ExternalImageWindow",456,506,"http://www.swpc.noaa.gov/pmap/gif/pmapN.gif","Northern%20Statistical%20Auroral%20Oval"];
                addWidget(stringToClass, mW, pieces, wD);
                
                pieces = [447,480,"auroral_resources.ui.window.ExternalImageWindow",454,504,"http://www.ngdc.noaa.gov/stp/ovation_prime/data/north_nowcast_aacgm.png","Ovation%20Prime%20Real-Time%20Nowcast"];
                addWidget(stringToClass, mW, pieces, wD);
                */

                return;
                
            //
            // or they've requested a specific layout/workspace
            //
            } else {
                
                //
                // handle special initial pages
                // 
                var mW = auroral_resources.Application.__mainWindow;
                var wD = this.__widgets;
                var pieces = [];

                // check for special sites, like chapman 2011
                // TODO: make this more dynamic, so it doesn't require code changes here.
                // perhaps a separate file (rather than a DB or something similarly heavy)
                var special = getQueryVariable("special");
                if (special !== null) {
                    
                    if (special === "chapman2011") {
                        pieces = [0,0,"auroral_resources.ui.window.LocalImageGalleryWindow",625,450,"Chapman%20Conference%202011%20User%20Gallery"];
                        addWidget(stringToClass, mW, pieces, wD);
                        return;
                    } else if (special === "galaxy15") {
                        window.location = "http://1.usa.gov/mfZUWL";
                        return;
                    }
                }                

                // check for hides
                var hideMenuBar = getQueryVariable("hideMenuBar");
                if (hideMenuBar != null) {
                    if(hideMenuBar === "true") {
                        this.__toolBarView.exclude();
                        this.__toolBarHider.setIcon("resource/auroral_resources/icons/down_arrow_orange.png");
                    }
                }
                var hideSideBar = getQueryVariable("hideSideBar");
                if (hideSideBar != null) {
                    if(hideSideBar === "true") {
                        this.__sideBarScroller.exclude();
                        this.__sideBarHider.setIcon("resource/auroral_resources/icons/right_arrow_orange.png");
                    }
                }
                var hideCruft = getQueryVariable("hideCruft");
                if (hideCruft != null) {
                    if(hideCruft === "true") {
                        this.__header.exclude();
                        this.__footer.exclude();
                    }
                }
                var hideAll = getQueryVariable("hideAll");
                if (hideAll != null) {
                    if(hideAll === "true") {
                        this.__header.exclude();
                        this.__footer.exclude();
                        this.__sideBarScroller.exclude();
                        this.__toolBarView.exclude();
                        this.__toolBarHider.setIcon("resource/auroral_resources/icons/down_arrow_orange.png");
                        this.__sideBarHider.setIcon("resource/auroral_resources/icons/right_arrow_orange.png");
                    }
                }
            
                // parse get query for initial state modifications
                // check for widget additions
                var i = 0;

                // artificially limits to 16 widgets by URL at the moment
                for (i=0;i<16;i++) {

                    var w = getQueryVariable("w"+i);
                    if (w != null) {

                        // parse
                        var pieces = qx.util.StringSplit.split(w,',');

                        // instantiate
                        var x = parseInt(pieces[0]);
                        var y = parseInt(pieces[1]);
                        var className = pieces[2];
                        var instance = stringToClass(className);
                        var win = instance.fromArray(pieces);
                        win.open();

                        // add
                        auroral_resources.Application.__mainWindow.add(win, { left: x, top: y });

                        var wid = x + ',' + y + ',' + className;
                        var j = 3;

                        var size = 0;
                        if (typeof pieces !== undefined && pieces !== null) {
                            size = pieces.length;
                        } else {
                            this.warn(className+" didn't include any additional pieces to the serialized creation.");
                        }

                        // the first three are always present, the class name and
                        // initial x/y coordinate offsets
                        for(j=3;j<size;j++) {
                            wid = wid + ',' + pieces[j];
                        }

                        this.__widgets.push(wid);

                    } else {
                        // do nothing
                    }
                }
            }

            function getQueryVariable(variable) { 
                var query = window.location.search.substring(1); 
                var vars = query.split("&");
                for (var i=0;i<vars.length;i++) {
                    var pair = vars[i].split("=");
                    if (pair[0] == variable) {
                        return pair[1];
                    }
                }
            }
            
            function stringToClass(str) {
                var arr = str.split(".");
                var fn = (window || this);
                for (var i = 0, len = arr.length; i < len; i++) {
                    fn = fn[arr[i]];
                }
                if (typeof fn !== "function") {
                    throw new Error("function not found for str '"+str+"' and fn '"+fn+"'");
                }
                return fn;
            }
            
            function addWidget(stringToClass, mainWindow, pieces, widgets) {
                var instance = stringToClass(pieces[2]);
                var win = instance.fromArray(pieces);
                win.open();
                mainWindow.add(win, { left: pieces[0], top: pieces[1] });
                var wid = x + ',' + y + ',' + pieces[2];
                var j = 3;
                for(j=3;j<pieces.length;j++) {
                    wid = wid + ',' + pieces[j];
                }
                widgets.push(wid);
            }
 
        },

        //
        // add the widget to the workspace at the cursor
        //
        _widgetDropListener : function(e) {

            var w = e.getData("widget");
            if (typeof w !== undefined && w !== null && w === "launcher") { return; }
            if (typeof w !== undefined && w !== null && w === "ignore") { return; }

            var dx = e.getDocumentLeft();
            var dy = e.getDocumentTop(); 
            var x = 0;
            var y = 0;
             
            if (typeof dx !== undefined && dx !== null && typeof dy !== undefined && dy !== null) {
                x = dx - auroral_resources.Application.__X_OFFSET; // sub off extra to center it more
                y = dy - auroral_resources.Application.__Y_OFFSET;  // ditto
            }

            auroral_resources.Application.__mainWindow.add( w, { left:x, top:y });
            w.open();
            //auroral_resources.Application.__mainWindow.setBlockToolTip(true);

        } // end widgetDropListener
    }, // end members

    /*
    *****************************************************************************
        DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
        this.__list = null;
        this.__currentListItem = null;
        this.__header = null;
        this.__footer = null;
        this.__toolBarView = null;
        this.__menuBarView = null;
        this.__timeBus = null;
        this.__horizontalSplitPane = null;
        this.__verticalSplitPane = null;
        this.__prefWindow = null;
        this.__sideBar = null;
        this.__sideBarScroller = null;
        this.__mouseX = null;
        this.__mouseY = null;
        this.__widgets = null;
        this.__toolBarHider = null;
        this.__sideBarHider = null;        
    }

});
