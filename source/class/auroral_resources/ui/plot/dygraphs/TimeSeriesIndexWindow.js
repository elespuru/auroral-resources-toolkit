/*************************************************************************

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

*************************************************************************/


qx.Class.define("auroral_resources.ui.plot.dygraphs.TimeSeriesIndexWindow",
{

    extend : qx.ui.window.Window,


    /*
    *****************************************************************************
        STATICS
    *****************************************************************************
    */
    statics : 
    {
        getCsvUrl : function(parameter, start, stop) {
            return "http://"+auroral_resources.Application.getHost()+"/spidr/servlet/GetData?compress=true&param="+parameter+"&format=csv&header=false&fillmissing=false&dateFrom="+start+"&dateTo="+stop;
            //return "/art/resource/auroral_resources/ionofof2.txt";
        },

        fromArray : function(argArray) {
            return new auroral_resources.ui.plot.dygraphs.TimeSeriesIndexWindow(
                parseInt(decodeURI(argArray[3])),
                parseInt(decodeURI(argArray[4])),
                decodeURI(argArray[5]),
                decodeURI(argArray[6]),
                decodeURI(argArray[7])
            );
        }
    },
    

    /*
    *****************************************************************************
        CONSTRUCTOR
    *****************************************************************************
    */
    construct : function(width, height, parameter, title, mddocname)
    {
        this.base(arguments, title);

        this.__timeBus = auroral_resources.messaging.TimeBus.getInstance();
        this.__parameter = parameter;
        this.__mddocname = mddocname;
        this.__title = title;
        
        this.set({
            allowMaximize: false,
            allowMinimize: false,
            showMaximize: false,
            showMinimize: false,
            showClose: true,
            status: parameter + ',' + title + ',' + mddocname,
            layout: new qx.ui.layout.Grow()
        });
        
        this.setWidth(width);
        this.setHeight(height);
        
        this.__loading = new qx.ui.basic.Label().set({
            width: width,
            height: height,
            value: "<center><h1 style='color:red'>Loading...</h1></center>",
            rich : true
        });
        this.__nodata = new qx.ui.basic.Label().set({
            width: width,
            height: height,
            value: "<center><h1 style='color:red'>No Data!...</h1></center>",
            rich : true
        });

        this._showLoading();

        var start = this.__timeBus.getStartDateForSPIDRWS();
        var stop = this.__timeBus.getStopDateForSPIDRWS();
        var that = this;

        this.__startDate = start;
        this.__stopDate = stop;

        try {
            this.__plot = new qxdygraphs.Plot(
                auroral_resources.ui.plot.dygraphs.TimeSeriesIndexWindow.getCsvUrl(parameter,start,stop),
                {
                    labelsKMB: true,
                    errorBars: false,
                    stepPlot: true,
                    fillGraph: true,
                    lables: [title],
                    underlayCallback: this._vline,
                    zoomCallback: this._zoom
                },
                that
            );
            this.add(this.__plot);
        } catch (e) {
            this.remove(this.__loading);
            this.add(this.__nodata);
        }

        this.addListener("close", function(evt) { this.destroy() });
        this.addListener("mouseup", this._rightClick, this);

        this.__timeBus.getBus().subscribe("time.startDate", this._startDateChangeBusCallback, this);
        this.__timeBus.getBus().subscribe("time.now", this._nowChangeBusCallback, this);
        this.__timeBus.getBus().subscribe("time.stopDate", this._stopDateChangeBusCallback, this);

        return this;
    },


    /*
    *****************************************************************************
        CLASS VARIABLES AND METHODS
    *****************************************************************************
    */
    members :
    {
        __title : null,
        __loading : null,
        __nodata : null,
        __parameter : null,
        __mddocname : null,
        __timeBus : null,
        __startDate : null,
        __stopDate : null,
        __plot : null,
        __now : null,
        

        //
        //
        //
        _showLoading : function() {
            if ( this.indexOf(this.__loading) === -1 ) { 
                this.add(this.__loading);
            }
        },


        //
        //
        //
        _hideLoading : function() {
            if ( this.indexOf(this.__loading) !== -1 ) { 
                this.remove(this.__loading);
            }
        },


        //
        //
        //
        _showNoData : function() {
            if ( this.indexOf(this.__nodata) === -1 ) { 
                this.add(this.__nodata);
            }
        },


        //
        //
        //
        _hideNoData : function() {
            if ( this.indexOf(this.__nodata) !== -1 ) { 
                this.remove(this.__nodata);
            }
        },


        //
        //
        //
        _rightClick : function(evt) { 
            
            if(evt.isRightPressed()) {
                
                var popup = new qx.ui.popup.Popup(new qx.ui.layout.VBox()).set({
                     autoHide: true
                });
                
                var param = this.__parameter;
                var start = this.__startDate;
                var stop = this.__stopDate;
                var mddoc = this.__mddocname;
                
                var data = new qx.ui.form.Button("Download Data");
                data.addListener("click", function(evt) {
                    var dlurl ="http://"+auroral_resources.Application.getHost()+"/spidr/servlet/GetData?param="+param+"&format=zip&dateFrom="+start+"&dateTo="+stop;
                    window.open(dlurl,"");
                    popup.hide();
                });
                
                var mdata = new qx.ui.form.Button("View Metadata");
                mdata.addListener("click", function(evt) {
                    var mdurl = "http://"+auroral_resources.Application.getHost()+"/spidrvo/viewdata.do?docname="+mddoc;
                    window.open(mdurl,"");
                    popup.hide();
                });
                
                popup.add(new qx.ui.basic.Label("Additional Options"));
                popup.add(data);
                popup.add(mdata);
                popup.placeToMouse(evt);
                popup.show();            
            }
        },
        

        //
        //
        //
        _zoom : function(minDate, maxDate, minValue, maxValue) {
            // not doing anything here yet
        },


        //
        // vertical line function
        //
        _vline : function(canvas, area, g) {
            
            var timeBus = auroral_resources.messaging.TimeBus.getInstance();
            var now = timeBus.getNow();
            var xp = g.toDomCoords(parseInt(now),0); //only care about X
            xp = xp[0];
            
            canvas.beginPath();
            canvas.strokeStyle = "rgba(255, 0, 0, 1.0)";
            canvas.moveTo(xp, 0);
            canvas.lineTo(xp, area.h);
            canvas.closePath();
            canvas.stroke();
            
            function listProperties(obj) {
               var propList = "";
               for(var propName in obj) {
                  if(typeof(obj[propName]) != "undefined") {
                     propList += (propName + ", ");
                  }
               }
               return propList;
            }
        },
        

        //
        // callback for the 'startDate' message channel
        //
        _startDateChangeBusCallback : function(e) {

            this.remove(this.__plot);
            this._showLoading();
            
            qx.util.DisposeUtil.disposeObjects(this, "__plot", false);
            this.__plot = null;

            var start = this.__timeBus.convertToSPIDRWS(e.getData());
            this.__start = start;
            var stop = this.__timeBus.getStopDateForSPIDRWS();
            var now = this.__timeBus.getNow();
            var parameter = this.__parameter;
            var that = this;
    
            try {
                this.__plot = new qxdygraphs.Plot(
                    auroral_resources.ui.plot.dygraphs.TimeSeriesIndexWindow.getCsvUrl(parameter,start,stop),
                    {
                        labelsKMB: true,
                        errorBars: false,
                        stepPlot: true,
                        fillGraph: true,
                        lables: [this.__title],
                        underlayCallback: this._vline,
                        zoomCallback: this._zoom
                    },
                    that
                );
                this.add(this.__plot);
            } catch (e) {
                this._hideLoading();
                this._showNoData();
            }
        },


        //
        // callback for the 'stopDate' message channel
        //
        _stopDateChangeBusCallback : function(e) {

            this.remove(this.__plot);
            this.add(this.__loading);
            
            qx.util.DisposeUtil.disposeObjects(this, "__plot", false);
            this.__plot = null;
            
            var start = this.__timeBus.getStartDateForSPIDRWS();
            var stop = this.__timeBus.convertToSPIDRWS(e.getData());
            this.__stopDate = stop;
            var now = this.__timeBus.getNow();
            var parameter = this.__parameter;
            var that = this;

            try {
                this.__plot = new qxdygraphs.Plot(
                    auroral_resources.ui.plot.dygraphs.TimeSeriesIndexWindow.getCsvUrl(parameter,start,stop),
                    {
                        labelsKMB: true,
                        errorBars: false,
                        stepPlot: true,
                        fillGraph: true,
                        lables: [this.__title],
                        underlayCallback: this._vline,
                        zoomCallback: this._zoom
                    },
                    that
                );
                this.add(this.__plot);
            } catch(e) {
                this._hideLoading();
                this._showNoData();
            }
        },


        //
        //
        //
        _nowChangeBusCallback : function(e) {

            var g = this.__plot.getPlotObject();
            var start = this.__timeBus.getStartDateForSPIDRWS();
            var stop = this.__timeBus.getStopDateForSPIDRWS();
            var now = e.getData();
            this.__now = now;
            var that = this;
            var parameter = this.__parameter;

            var h = new qx.io.request.Xhr();
            h.setAsync(true);
            h.addListener("success", function() {
                that.__csvData = h.responseText;
                g.updateOptions({ 'file' : this.__csvData });
            });
            h.setMethod("GET");
            h.setUrl(auroral_resources.ui.plot.dygraphs.TimeSeriesIndexWindow.getCsvUrl(parameter,start,stop));
            h.send();

        }
    },


    /*
    *****************************************************************************
        DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
        // TODO: add destructor code...
    }


});
