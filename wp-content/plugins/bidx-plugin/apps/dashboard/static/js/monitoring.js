;(function( $ )
{
    var $element                    = $("#group-dashboard")
    ,   $elementHelp                = $(".startpage")
    ,   $views                      = $element.find(".view")
    ,   $modals                     = $element.find(".modalView")
    ,   $modal
    ,   $frmCompose                 = $modals.find("form")
    ,   $btnComposeSubmit           = $frmCompose.find(".compose-submit")
    ,   $btnComposeCancel           = $frmCompose.find(".compose-cancel")
    ,   $currentView
    ,   bidx                        = window.bidx
    ,   appName                     = "dashboard"
    ,   currentGroupId              = bidx.common.getCurrentGroupId()
    ,   message                     = {}
    ,   listItems                   = {}
    ,   listItemsAll                = {}
    ,   $list                       = $(".dlist")
    ,   listMembers                 = []
    ;


    //public functions
     var _oneTimeSetup = function()
    {

        $frmCompose.validate(
        {
            rules:
            {
                "contacts":
                {
                    tagsinputRequired: true
                }
            ,   "subject":
                {
                    required: true
                }
            ,   "content":
                {
                    required: true
                }

            }
            , messages:
            {
                // Anything that is app specific, the general validations should have been set
                // in common.js already
            }
            , submitHandler: function()
            {
                if ($btnComposeSubmit.hasClass("disabled"))
                {
                    return;
                }

                $btnComposeSubmit.addClass("disabled");


                _doSend(
                        {
                            error: function()
                            {
                                alert("Something went wrong during submit");

                                $btnComposeSubmit.removeClass("disabled");
                                $btnComposeCancel.removeClass("disabled");
                            }
                        } );
            }
        } );

        $(".searchname").delayKeyup( function( $searchname )
        {

            if( $searchname.val().length >= $searchname.data('maxlength') )
            {

                var listType          =    $searchname.data('searchtype')
                ,   loadType          =    'load' + listType
                ,   composeBtn        =    '.compose-' + listType
                ,   pagerContainer    =    '.pagercontainer-' + listType
                ,   pagerHtml         =    "<div class='pager-" +  listType + "' ></div>"
                ;

                $( composeBtn ).toggleClass( 'btn-primary' );
                _showMainView(loadType, listType);

                $( pagerContainer ).html( pagerHtml );
                getMembers(
                {
                    list:        listType
                ,   view:        listType
                ,   load:        loadType
                ,   searchName:  $searchname.val()
                ,   callback:    function()
                    {
                        _showMainView(listType, loadType);
                        $( composeBtn ).toggleClass( 'btn-primary' );

                    }
                } );
            }
        }
        ,  1000 );
    }

    var getMembers = function(options)
    {
        var $listItem       = $($("#dashboard-listitem").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $listEmpty      = $($("#dashboard-empty").html().replace(/(<!--)*(-->)*/g, ""))
        ,   $list           = $("." + options.list)
        ,   $view           = $views.filter(bidx.utils.getViewName(options.view))
        ,   messages
        ,   viewName        = options.view
        ,   searchName      = ""
        ;

        if(options.searchName)
        {

            searchName = "+AND+firstname_s:" + options.searchName + "*";
        }

        var extraUrlParameters =
            [
                {
                    label: "q"
                ,   value: "user:*"
                }
            ,   {
                    label: "fq",
                    value: "type:bidxMemberProfile+AND+groupIds:" + currentGroupId + searchName
                }
            ,   {
                    label: "rows",
                    value: "5"
                }
            ];
        if (options.start)
        {
            extraUrlParameters.push(
            {
                label: "start",
                value: options.start
            } );
        }

        if (options.view === 'list')
        {
            extraUrlParameters.push(
            {
                label: "sort",
                value: "created desc"
            } );
        }

        bidx.api.call(
            "groupMembers.fetch"
        ,   {
                groupId: currentGroupId
            ,   groupDomain: bidx.common.groupDomain
            ,   extraUrlParameters: extraUrlParameters
            ,   success: function(response)
                {
                    var item
                    ,   element
                    ,   cls
                    ,   textValue
                    ,   nextPageStart
                    ,   pagerOptions
                    ,   numberOfPages  =   5
                    ,   numberFound    = response.numFound
                    ,   totalPages     =   Math.round(response.numFound / numberOfPages)
                    ;

                    //clear listing
                    $list.empty();

                    // now format it into array of objects with value and label
                    //
                    if ( response && response.docs && !$.isEmptyObject( response.docs ) )
                    {

                        var $input = $frmCompose.find("[name='contacts']");

                        $.each(response.docs, function( idx, item )
                        {

                            listMembers.push(
                            {
                                value: item.userId
                            ,   label: item.user
                            });

                            item.location = item.countrylabel_s;
                            item.membersince = bidx.utils.parseISODateTime(item.created, "date");
                            item.lastlogin = bidx.utils.parseISODateTime(item.modified, "date");
                            item.role = 'Member';

                            if ( item.isentrepreneur_b === true )
                            {
                                item.role = 'Entrepreneur ';

                            }
                            if ( item.isinvestor_b === true )
                            {
                                item.role = 'Investor';
                            }


                            //$input.addTag(item.user);
                            // $input.tagsManager( "addtag", item.user );

                            // Member Display
                            element = $listItem.clone();
                            //search for placeholders in snippit
                            element.find(".placeholder").each(function(i, el)
                            {

                                //isolate placeholder key
                                cls = $(el).attr("class").replace("placeholder ", "");

                                //if key if available in item response
                                if ( item[cls] )
                                {

                                    textValue = item[cls];
                                    //add hyperlink on sendername for now (to read email)
                                    if ( cls === "user" )
                                    {
                                        textValue = "<a href=\"" + document.location.hash + "/" + item.userId + "\" >" + textValue + "</a>";
                                    }
                                    if ( cls === "location" )
                                    {
                                        textValue = item.location;
                                    }
                                    element.find( "span." + cls ).replaceWith(textValue);

                                }
                            });

                            element.find(":checkbox").data("id", item.userId);
                            //  add mail element to list
                            $list.append(element);

                            //  load checkbox plugin on element
                            var $checkboxes = $list.find('[data-toggle="checkbox"]');
                            //  enable flatui checkbox
                            $checkboxes.checkbox();
                            //  set change event which add/removes the checkbox ID in the listElements variable
                            $checkboxes.bind('change', function( )
                            {
                                var $this = $(this);

                                if ( $this.attr("checked") )
                                {
                                    if ( viewName === 'list' && !listItems[ $this.data("id") ] )
                                    {
                                        listItems[ $this.data("id") ] = true;
                                    }
                                    if ( viewName === 'all' && !listItemsAll[ $this.data("id") ] )
                                    {
                                        listItemsAll[ $this.data("id") ] = true;
                                    }

                                }
                                else
                                {
                                    if ( viewName === 'list' && listItems[ $this.data("id") ] )
                                    {
                                        delete listItems[ $this.data("id") ];
                                    }
                                    if ( viewName === 'all' && listItemsAll[ $this.data("id") ] )
                                    {
                                        delete listItemsAll[ $this.data("id") ];
                                    }
                                }

                            });

                            //bind event to change all checkboxes from toolbar checkbox
                            $view.find(".messagesCheckall").change(function()
                            {
                                var masterCheck = $(this).attr("checked");
                                $list.find(":checkbox").each(function( )
                                {
                                    var $this = $(this);
                                    if ( masterCheck )
                                    {
                                        $this.checkbox('check');
                                        if ( viewName === 'list' && listItems )
                                        {

                                            if ( !listItems[ $this.data("id") ] )
                                            {
                                                listItems[ $this.data("id") ] = true;
                                            }

                                        }
                                        if ( viewName === 'all' && listItemsAll )
                                        {

                                            if ( !listItemsAll[ $this.data("id") ] )
                                            {
                                                listItemsAll[ $this.data("id") ] = true;
                                            }

                                        }


                                    }
                                    else
                                    {
                                        $this.checkbox('uncheck');
                                        if ( viewName === 'list' && listItems[ $this.data("id") ] )
                                        {
                                            delete listItems[ $this.data("id") ];
                                        }
                                        if ( viewName === 'all' && listItemsAll[ $this.data("id") ] )
                                        {
                                            delete listItemsAll[ $this.data("id") ];
                                        }

                                    }
                                } );
                            } );



                        } );

                        if( numberFound >= 5 )
                        {
                            numberOfPages = ( totalPages <= 5 ) ? totalPages : numberOfPages;
                            pagerOptions  =
                            {
                                currentPage:            1
                            ,   totalPages:             totalPages
                            ,   numberOfPages:          numberOfPages
                            ,   itemContainerClass:     function ( type, page, current )
                                                        {
                                                            return (page === current) ? "active" : "pointer-cursor";
                                                        }
                            ,   useBootstrapTooltip:    true
                            ,   onPageClicked:          function( e, originalEvent, type, page )
                                                        {
                                                            nextPageStart = ( (page - 1) * 5 ) + 1;
                                                            bidx.utils.log("Page item clicked, type: "+type+" page: "+nextPageStart);
                                                            bidx.utils.log("Options List: "+options.list+" Options Load: "+options.load);
                                                            _showMainView(options.load, options.list);
                                                            getMembers(
                                                            {
                                                                list:       options.list
                                                            ,   view:       options.list
                                                            ,   start:      nextPageStart
                                                            ,   load :      options.load
                                                            ,   searchName: options.searchName
                                                            ,   callback: function()
                                                                {
                                                                    _showMainView(options.list, options.load);
                                                                                                                                                    }
                                                            } );
                                                       }
                            };
                        }

                        $( '.pager-' + options.list ).bootstrapPaginator( pagerOptions );
                    }
                    else
                    {
                        $list.append($listEmpty);
                    }

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback();
                    }
                }
            ,   error: function(jqXhr, textStatus)
                {
                    var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    _showError("Something went wrong while retrieving contactlist of the member: " + status);
                }
            }
        );
    };




    // actual sending of message to API
    var _doSend = function(params)
    {
        if (!message)
        {
            return;
        }

        _prepareMessage();

        var extraUrlParameters =
            [
                {
                    label: "mailType",
                    value: "PLATFORM"
                }
            ];

        var key = "sendingMessage";
        bidx.i18n.getItem(key, function(err, label)
        {
            if (err)
            {
                bidx.utils.error("Problem translating", key, err);
                label = key;
                _showError(label);
            }
        });

        bidx.common.notifyCustom(key);

        bidx.api.call(
            "mailboxMail.send"
        ,   {
                groupDomain:            bidx.common.groupDomain
            ,   extraUrlParameters:     extraUrlParameters
            ,   data:                   message
            ,   success: function(response)
                {

                    bidx.utils.log( "[mail] mail send", response );
                    //var key = "messageSent";
                    bidx.common.notifyCustomSuccess( bidx.i18n.i( "messageSent", 'mail' ) );

                    listItems = {};
                    bidx.controller.updateHash("#dashboard/list", true, false);
                }
            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        _showError( "Something went wrong while sending the email: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        _showError( "Something went wrong while sending the email: " + response.text );
                    }

                }
             }
        );

    };

    // this function prepares the message package for the API to accept
    //
    var _prepareMessage = function()
    {
        /*
            API expected format
            {
                "userIds": ["number"]
            ,   "subject": "string"
            ,   "content": "string"
            }
        */
        message = {}; // clear message because it can still hold the reply content

        $currentView = $element.find(".modalDashboardCompose");

        var to = [];
        var recipients = $currentView.find("[ name=contacts ]").tagsinput('getValues');

        $.each(recipients, function(index, item)
        {
            to.push(item.value);
        });

        bidx.utils.setValue(message, "userIds", to);
        bidx.utils.setValue(message, "subject", $currentView.find("[name=subject]").val());
        bidx.utils.setValue(message, "content", $currentView.find("[name=content]").val());


    };

    // Setup compose form by resetting all values and binding the submit handler with validation
    //
    var _initComposeForm = function(listCompose, listType)
    {

        //  reset formfield values
        //
        //Add Default Tag values to the compose form dropdown values
        bidx.data.setItem('members', listMembers);
        $element.find("input.bidx-tagsinput.defer").tagsinput();

        $frmCompose.find(":input").val("");

        $frmCompose.find(".bidx-tagsinput").tagsinput("reset");
        $btnComposeSubmit.removeClass("disabled");
        $btnComposeCancel.removeClass("disabled");

        $frmCompose.validate().resetForm();

        var $input = $frmCompose.find("[name='contacts']");

        $.each(listCompose, function(idx, item)
        {
            bidx.utils.setElementValue($input, idx);
        } );

        if (listType === 'list') {
            var keySubject = "welcomesubject";
            bidx.i18n.getItem(keySubject, 'templates', function(err, labelSubject) {
                $frmCompose.find("[name='subject']").val(labelSubject);
            });


            var keyBody = "welcomebody";
            bidx.i18n.getItem(keyBody, 'templates', function(err, labelBody) {
                $frmCompose.find("[name='content']").val(labelBody);
            });

        }
    };

    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showModal( options )
    {
        var href;

        if( options.id )
        {
            var id = options.id;
        }

        bidx.utils.log("[mail] show modal", options );

        $modal = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

        $modal.find( ".btn[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" )
                    .replace( "%state%", options.state )
                    .replace( "%id%", options.id );
            $this.attr( "href", href );
        } );

        $modal.modal( {} );

        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.one( 'hide', options.onHide );
        }
    }


    //  closing of modal view state
    var _closeModal = function(options)
    {
        if ($modal)
        {
            if (options && options.unbindHide)
            {
                $modal.unbind('hide');
            }
            $modal.modal('hide');
        }
    };

    var _showView = function(view, showAll)
    {

        //  show title of the view if available
        if (!showAll)
        {
            $views.hide();
        }
         var $view = $views.filter(bidx.utils.getViewName(view)).show();
    };

    var _showMainView = function(view, hideview)
    {

        $views.filter(bidx.utils.getViewName(hideview)).hide();
        var $view = $views.filter(bidx.utils.getViewName(view)).show();

    };

    // display generic error view with msg provided
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    // debug

    // end debug


    // ROUTER

    var state;

    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("routing options", options);
        var state
        ,   dashboardId
        ,   action
        ;

        state = action = options.state;

        if ( !$.isEmptyObject( options.params ) )
        {
            if ( options.params.id )
            {
                dashboardId = options.params.id;
            }

            // only override action when an action is provided in params
            //
            if( options.params.action )
            {
                action = options.params.action;
            }

        }


        switch (state)
        {
            case "load" :

                _showView("loadlist");

                break;
            case "list":

                _closeModal(
                {
                    unbindHide: true
                } );

                _showView("loadlist");
                _showView("loadall", true);
                $( '.compose-list' ).toggleClass( 'btn-primary' );
                $( '.compose-all' ).toggleClass( 'btn-primary' );
                // _updateMenu();

                getMembers(
                {
                    list: "list"
                ,   view: "list"
                ,   load: "loadlist"
                ,   callback: function()
                    {
                        _showMainView("list", "loadlist");
                        $( '.compose-list' ).toggleClass( 'btn-primary' );
                        //bidx.data.setItem('members',listMembers);
                        // $element.find( "input.bidx-tagsinput.defer" ).tagsinput();
                    }
                } );



                getMembers(
                {
                    list: "all"
                ,   view: "all"
                ,   load: "loadall"
                ,   callback: function()
                    {
                        _showMainView("all", "loadall");
                        $( '.compose-all' ).toggleClass( 'btn-primary' );
                    }
                } );
                break;

            case "dashboardCompose":

                _closeModal(
                {
                    unbindHide: true
                } );

                _initComposeForm(listItems, 'list');
                _showModal(
                {
                    view: "dashboardCompose"
                ,   state:      state
                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#dashboard/list", false, false);
                    }
                } );

                break;
            case "dashboardComposeAll":

                _closeModal(
                {
                    unbindHide: true
                } );

                _initComposeForm(listItemsAll, 'all');
                _showModal(
                {
                    view: "dashboardCompose"
                ,   state:      state
                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#dashboard/list", false, false);
                    }
                } );

                break;
            case "discardConfirm":

                _closeModal(
                {
                    unbindHide: true
                } );

                _showModal(
                {
                    view : "discardConfirm"
                ,   id   : dashboardId
                ,   state: state
                ,   onHide: function()
                    {
                        window.bidx.controller.updateHash("#dashboard/list", false, false);
                    }
                } );

                break;

            default:

                _showView("undefined");

                break;
        }
    };

    //expose
    var dashboard =
    {
        navigate:     navigate
    ,   $element:     $element
    ,   listItems:    listItems //storage for selection of emails in listview. I chose object because so that I can check if key exists
    ,   listItemsAll: listItemsAll
    };

    if (!window.bidx)
    {
        window.bidx = { };
    }

    window.bidx.dashboard = dashboard;

    // Initialize handlers
    _oneTimeSetup();

    if ($("body.wp-admin").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#dashboard/list";
    }


} ( jQuery ))