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
Peter R. Elespuru - peter.elespuru@noaa.gov

*************************************************************************/

/* ************************************************************************

#asset(auroral_resources/icons/*)

************************************************************************ */

qx.Class.define("auroral_resources.ui.tree.ImageryTreeFile",
{
    extend : qx.ui.tree.TreeFile,

    /*
    *****************************************************************************
        CONSTRUCTOR
    *****************************************************************************
    */
    construct : function(title)
    {
        this.base(arguments, title);
        this.setDraggable(true);
        this.addListener("dblclick", this._doubleClicked, this);
        this.addListener("dragstart", this._dragStart, this);
        this.addListener("droprequest", this._dropRequest, this);
        this.__title = title;
        this.setToolTipText("Drag this widget anywhere into the gray workspace to the right");
        this.setIcon(qx.util.ResourceManager.getInstance().toUri("auroral_resources/icons/pgallery.png"));
        return this;
    },


    /*
    *****************************************************************************
        CLASS VARIABLES AND MEMBERS
    *****************************************************************************
    */
    members :
    {
        __window : null,
        __title : null,

        _doubleClicked : function(e) {
            if (!auroral_resources.Application.isWidgetDropAllowed()) { return; }
            this.__window = new auroral_resources.ui.window.LocalImageGalleryWindow(625, 450, this.__title);
            var w = this.__window;
            auroral_resources.Application.addWindow(w);
        },

        _dragStart : function(e) {
            e.addAction("copy");
            e.addAction("move");
            e.addType("widget");
        },

        _dropRequest : function(e) {
            var action = e.getCurrentAction();
            var type = e.getCurrentType();
            var result = null;

            if (type === "widget") {
                if (!auroral_resources.Application.isWidgetDropAllowed()) { e.addData(type, "ignore"); return; }
                this.__window = new auroral_resources.ui.window.LocalImageGalleryWindow(625, 450, this.__title);
                result = this.__window;
                e.addData(type, result);
            }
        }
    },
    
    
    /*
    *****************************************************************************
        DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
        this.__window = null;
        this.__title = null;
    }
    

});
