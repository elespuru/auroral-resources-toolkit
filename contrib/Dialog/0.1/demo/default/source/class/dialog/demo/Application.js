/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(dialog/*)
#asset(qx/icon/Tango/48/status/dialog-information.png)
#asset(qx/icon/Tango/22/actions/dialog-ok.png)
#asset(qx/icon/Tango/22/actions/dialog-cancel.png)

************************************************************************ */

/**
 * This is the main application class of your custom application "dialog"
 */
qx.Class.define("dialog.demo.Application",
{
  extend : qx.application.Standalone,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

    members :
    {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);
    
      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }
    
      
      /*
       * create shortcut commands
       */
      dialog.Dialog.init();
      
      /*
       * button data
       */
      var buttons = 
      [
         {
           label : "Alert",
           method : "createAlert"
         },
         {
           label : "Confirm",
           method : "createConfirm"
         },
         {
           label : "Prompt",
           method : "createPrompt"
         },
         {
           label : "Dialog Chain",
           method : "createDialogChain"
         },
         {
           label : "Select among choices",
           method : "createSelect"
         },            
         {
           label : "Form",
           method : "createForm"
         },             
         {
           label : "Wizard",
           method : "createWizard"
         }
       ];
    
      /*
       * button layout
       */
      var vbox = new qx.ui.container.Composite();
      vbox.setLayout(new qx.ui.layout.VBox(5));
      var title = new qx.ui.basic.Label("<h2>Dialog Demo</h2>");
      title.setRich(true);
      vbox.add( title );
      buttons.forEach(function(button){
        var btn = new qx.ui.form.Button( button.label );
        btn.addListener("execute",this[button.method],this);
        if ( button.enabled != undefined )
        {
          btn.setEnabled(button.enabled);
        }
        vbox.add(btn);
      },this);
      this.getRoot().add(vbox,{ left: 100, top: 100} );
    
    },
    
    createAlert : function()
    {
      dialog.alert( "Hello World!" );
//      same as:
//      (new dialog.Alert({
//        message : "Hello World!"
//      })).show();      
    },
    
    createConfirm : function()
    {
      dialog.confirm("Do you really want to erase your hard drive?", function(result){
        dialog.alert("Your answer was: " + result );
      });
//      (new dialog.Confirm({
//        message : "Do you really want to erase your hard drive?",
//        callback : function(result)
//        {
//          (new dialog.Alert({
//            message : "Your answer was:" + result
//          })).show();
//        }
//      })).show();
    },   
    
    createPrompt : function()
    {
      dialog.prompt("Please enter the root password for your server",function(result){
        dialog.alert("Your answer was: " + result );
      });
      
//      same as:      
//      (new dialog.Prompt({
//        message : "Please enter the root password for your server",
//        callback : function(result)
//        {
//          (new dialog.Alert({
//            message : "Your answer was:" + result
//          })).show();
//        }
//      })).show();
    },     
    
    /**
     * Example for nested callbacks
     */
    createDialogChain : function()
    {
      dialog.alert( "This demostrates a series of 'nested' dialogs ",function(){
        dialog.confirm( "Do you believe in the Loch Ness monster?", function(result){
          dialog.confirm( "You really " + (result?"":"don't ")  + "believe in the Loch Ness monster?", function(result){
            dialog.alert( result ? 
              "I tell you a secret: It doesn't exist." :
              "All the better." );
          });
        });
      });
      
      
//      (new dialog.Alert({
//        message  : "This demostrates a series of 'nested' dialogs ",
//        callback : function(){
//          (new dialog.Confirm({
//            message  : "Do you believe in the Loch Ness monster?",
//            callback : function(result){
//              (new dialog.Confirm({
//                message  : "You really " + (result?"":"don't ")  + "believe in the Loch Ness monster?",
//                callback : function(result){
//                  (new dialog.Alert({
//                    message  : result ? 
//                      "I tell you a secret: It doesn't exist." :
//                      "All the better."
//                  })).show();                             
//                }
//              })).show();                           
//            }
//          })).show();  
//        }
//      })).show();
    },    
    
    /**
     * Offer a selection of choices to the user
     */
    createSelect : function()
    {
      dialog.select( "Select the type of record to create:", [
          { label:"Database record", value:"database" },
          { label:"World record", value:"world" },
          { label:"Pop record", value:"pop" }
        ], function(result){
          dialog.alert("You selected: '" + result + "'");
        } 
      );
        
//      (new dialog.Select({
//        message : "Select the type of record to create:",
//        options : [
//          { label:"Database record", value:"database" },
//          { label:"World record", value:"world" },
//          { label:"Pop record", value:"pop" }
//        ],
//        allowCancel : true,
//        callback : function(result){
//          (new dialog.Alert({
//            message  : "You selected: '" + result + "'"
//          })).show();
//        }
//      })).show();
    },
    
    createForm : function()
    {
      var formData =  
      {
        'username' : 
        {
          'type'  : "TextField",
          'label' : "User Name", 
          'value' : ""
        },
        'address' :
        {
          'type'  : "TextArea",
          'label' : "Address",
          'lines' : 3,
          'value' : ""
        },
        'domain'   : 
        {
          'type'  : "SelectBox", 
          'label' : "Domain",
          'value' : 1,
          'options' : [
             { 'label' : "Company", 'value' : 0 }, 
             { 'label' : "Home",    'value' : 1 }
           ]
        },
        'commands'   : 
        {
         'type'  : "ComboBox", 
          'label' : "Shell command to execute",
          'value' : "",
          'options' : [
             { 'label' : "ln -s *" }, 
             { 'label' : "rm -Rf /" }
           ]
        }
      };
      dialog.form("Please fill in the form",formData, function( result )
      {
        dialog.alert("Thank you for your input:" + qx.util.Json.stringify(result).replace(/\\/g,"") );
      }
    );      
//    (new dialog.Form({
//      message : "Please fill in the form",
//      formData : formData,
//      allowCancel : true,
//      callback : function( result )
//      {
//        dialog.alert("Thank you for your input:" + qx.util.Json.stringify(result).replace(/\\/g,"") );
//      }
//    })).show();      
    },
    
    createWizard : function()
    {
      /*
       * wizard widget
       */
      var pageData = 
      [
       {
         "message" : "<p style='font-weight:bold'>Create new account</p><p>Please create a new mail account.</p><p>Select the type of account you wish to create</p>",
         "formData" : {
           "accountTypeLabel" : {
             "type" : "label",
             "label" : "Please select the type of account you wish to create."
           },         
           "accountType" : {
             "type" : "radiogroup",
             "label": "Account Type",
             "options" : 
             [
              { "label" : "E-Mail", "value" : "email" },
              { "label" : ".mac", "value" : ".mac" },
              { "label" : "RSS-Account", "value" : "rss" },
              { "label" : "Google Mail", "value" : "google" },
              { "label" : "Newsgroup Account", "value" : "news" }
             ]
           }
         }
       },
       {
         "message" : "<p style='font-weight:bold'>Identity</p><p>This information will be sent to the receiver of your messages.</p>",
         "formData" : {
           "label1" : {
             "type" : "label",
             "label" : "Please enter your name as it should appear in the 'From' field of the sent message. "
           },
           "fullName" : {
             "type" : "textfield",
             "label": "Your Name",
             "validation" : {
               "required" : true
             }
           },
           "label2" : {
             "type" : "label",
             "label" : "Please enter your email address. This is the address used by others to send you messages."
           },
           "email" : {
             "type" : "textfield",
             "label": "E-Mail Address",
             "validation" : {
               "required" : true,
               "validator" : qx.util.Validate.email()
             }
           }
         }
       },
       {
         "message" : "<p style='font-weight:bold'>Account</p><p>Bla bla bla.</p>",
         "formData" : {
           "serverType" : {
             "type" : "radiogroup",
             "orientation" : "horizontal",
             "label": "Select the type of email server",
             "options" : 
               [
                { "label" : "POP", "value" : "pop" },
                { "label" : "IMAP", "value" : "imap" }
               ]
           },
           "serverAddressLabel" : {
             "type" : "label",
             "label" : "Please enter the server for the account."
           },
           "serverAddress" : {
             "type" : "textfield",
             "label": "E-Mail Server",
             "validation" : {
               "required" : true
             }
           }
         }
       },
       {
         "message" : "<p style='font-weight:bold'>Username</p><p>Bla bla bla.</p>",
         "formData" : {
           "emailUserName" : {
             "type" : "textfield",
             "label": "Inbox server user name:"
           }
         }
       }       
      ];
      var wizard = new dialog.Wizard({
        width       : 500,
        maxWidth    : 500,
        pageData    : pageData, 
        allowCancel : true,
        callback : qx.lang.Function.bind( function( map ){
          dialog.alert("Thank you for your input:" + qx.util.Json.stringify(map).replace(/\\/g,"") );
        },this)
      });
      wizard.start();        
    }
  }
});