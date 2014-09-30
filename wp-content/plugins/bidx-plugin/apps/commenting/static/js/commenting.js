/**
 * TODO Sakis code formatter? (I only added the HTML to avoid my Eclipse formatter from merging all into one line.)
 * 
 * Commenting, including private notes, administrator annotations, and
 * mentor/investor feedback.
 * 
 * This app triggers its own Backbone routing, by taking control over all links
 * that define the following attributes:
 * 
 * <ul>
 * <li>href="#commenting" or href="#commenting/viewComments" to view comments</li>
 * <li>href="#commenting/writeComment" to write new comments</li>
 * <li>entity: data-entityid=123 or href="#commenting/.../entityId=123"</li>
 * <li>scopes for new comments and display:
 * data-scopes="general,bsOverview,bsFinancial"</li>
 * <li>scopes for new comment, but display all:
 * data-scopes="*general,bsOverview,bsFinancial"</li>
 * <li>optional: data-setcount=true to rewrite the link text if comments exist</li>
 * <li>optional: data-setdisplay=true to show/hide the link based on the user's
 * visibilities and the optional value for data-visibilty</li>
 * <li>optional visibilities to include:
 * data-visibilities="private,groupAdmin,mentor,investor" (will be converted
 * into a proper API enum value)</li>
 * <li>or, optional visibilities to exclude:
 * data-visibilities="!private,groupAdmin"</li>
 * </ul>
 * 
 * This approach allows for using multiple links, possibly for the same entity,
 * on a single page. When the app is initialized, it will:
 * 
 * <ul>
 * <li>Search for all data-setcounts links, if needed call the API to
 * determine the current counts and add those numbers to the link texts</li>
 * <li>Search for all href="#commenting/..." links, and bind their onclick to
 * its own routing, to ensure this works nicely within other apps</li>
 * </ul>
 * 
 * As for the server load, calling the API from the client is not more expensive
 * than having WordPress do that on page load. However, it implies the comments
 * cannot be indexed by search engines, and that the user's browser might use
 * some more data traffic.
 * 
 */
;( function ( $ )
{
    "use strict";
    var $body               = $( "body" )
    ,   $mainElement        = $( "#commenting" )
    
    // ,   $mainViews          = $mainElement.find( ".view" )
    // ,   $mainModals         = $mainElement.find( ".modalView" )
    // ,   $mainModal
    // ,   $editForm           = $mainElement.find( ".frmsendFeedback" )
    // ,   $scopeDropdown      = $mainElement.find( "[name='feedbackpurpose']" )
    // ,   $visibilityDropdown = $mainElement.find( "[name='feedbackvisibility']" )

    ,   bidx                = window.bidx
    ,   currentGroupId      = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId       = bidx.common.getCurrentUserId( "id" )
    ,   entityId            = parseInt( $( "#businessSummary" ).attr("data-bsid"), 10 )
    ,   appName             = "commenting"
        // Exact match for href="#commenting", or starts-with match for href="#commenting/..."
    // ,   selector            = "a[href=#" + appName + "],a[href^='#" + appName + "/']"
    // ,   memberData          = {}
    // ,   commentCache        = []
    // ,   commentPromises     = []
    // ,   currentParams

    ,   $panelFeedback      = $( ".panel-feedback" )
    ;

    function _oneTimeSetup()
    {
        // _setCountsAndDisplays();

        // $body.delegate( selector, "click", function( e )
        // {
        //     e.preventDefault();

        //     var $elem           = $( this )
        //     ,   params          = _parseParams( $elem )
        //     ;

        //     navigate(
        //     {
        //         state   : params.state
        //     ,   params  : params
        //     } );
        // } );

        _createFeedbackPanelStructure();

        _showHideFeedbackPanel( ".btn-feedback" );

        _hideAlerts();

        // _selectVisibility();

        _getFeedbackComments(
                        { params :
                            {
                                entityId  : entityId
                            }
                        });
    }

    // function _selectVisibility()
    // {
    //     $( ".feedback-visibilities button" ).on('click', function()
    //     {
    //         var $el = $(this)
    //         ,   $visibilitiesGroup = $el.closest( ".feedback-visibilities" )
    //         ;

    //         if ( !$el.hasClass( "active" ) )
    //         {
    //             $visibilitiesGroup.find( "button" ).removeClass( "active" );
    //             $el.addClass( "active" );
    //         }

    //     });
    // }

    function _showHideFeedbackPanel( element )
    {
        var $btnFeedback = $( element );
        
        $btnFeedback.on('click', function()
        {
            var $el = $(this)
            ,   $feedbackPanel  = $el.closest(".panel-feedback")
            ,   $feedbackBox    = $feedbackPanel.find(".feedback-box")
            ,   $feedbackScope  = $feedbackPanel.find(".feedback-scope")
            ,   $attachmentItem = $feedbackScope.find(".attachmentItem")
            ,   txt             = $feedbackBox.is( ":visible" ) ? bidx.i18n.i( "showFeedback" ) : bidx.i18n.i( "hideFeedback" )
            ;

            if ( $feedbackBox.hasClass( "hide" ) )
            {
                $feedbackBox.removeClass( "hide" );
                $feedbackScope.removeClass( "col-sm-12" ).addClass( "col-sm-8" );
                $attachmentItem.removeClass( "col-md-4" ).addClass( "col-md-6" );
            }
            else
            {
                $feedbackBox.addClass( "hide" );
                $feedbackScope.removeClass( "col-sm-8" ).addClass( "col-sm-12" );
                $attachmentItem.removeClass( "col-md-6" ).addClass( "col-md-4" );
            }

            $el.find( "span" ).text( txt );
            $feedbackPanel.find(".panel-body").css( { overflow: 'hidden' } );
        });
    }

    function _handleClicked()
    {
        var $clickedBtn = $( ".btn-add-feedback, .btn-cancel-feedback, .btn-submit-feedback, .btn-delete-feedback, .btn-edit-feedback" );

        $clickedBtn.on('click', function( e )
        {
            e.preventDefault();

            var $el = $( this )
            ,   purpose = $el.attr( "data-purpose" )
            ,   target = _getTargetedParams( $el )
            ;

            switch (purpose)
            {
                case "addFeedback":

                    _handleNotificationMessages( target, "" );

                    _resetFeedbackSubmitForm( target );

                    _showFeedbackSubmitionForm( target );

                    break;

                case "cancelFeedback" :

                    _resetFeedbackSubmitForm( target );

                    _hideFeedbackSubmitionForm( target );

                    break;

                case "submitFeedback" :

                    _submitFeedbackPost( target );

                    break;

                case "deleteFeedback" :

                    _handleNotificationMessages( target, "" );

                    _destroyFeedbackPost( target.feedbackId, target );

                    break;

                case "editFeedback" :

                    _handleNotificationMessages( target, "" );

                    _editFeedbackPost( target );

                    break;
            }
        });
    }

    function _hideAlerts()
    {
        $body.delegate( ".feedback-notifications .close" , "click", function( e )
        {
            e.preventDefault();
            $(this).parent().addClass( "hide" );
        });
    }

    function _createFeedbackPanelStructure()
    {
        var $btnFeedbackSnippet   = $( "<button />", { "class": "btn btn-warning btn-xs btn-feedback" })
                                    .prepend
                                    (
                                        $("<i/>", { "class": "fa fa-comments" })
                                    )
                                    .append
                                    (
                                        $("<span/>", { text: bidx.i18n.i( "showFeedback" ) })
                                    )
        ,   $addFeedbackBtn       = $( "<button />", { "class": "btn btn-primary btn-add-feedback btn-sm btn-block", "data-purpose": "addFeedback", html: bidx.i18n.i( "addNewFeedback" ) } )
        ,   $textarea             = $( "<textarea />", { "class": "form-control" } )
        ,   $divCol12             = $( "<div />", { "class": "col-sm-12 feedback-scope" } )
        ,   $divRow               = $( "<div />", { "class": "row" } )
        ,   $cancelFeedbackBtn    = $( "<button />", { "class": "btn btn-link btn-cancel-feedback btn-xs pull-right", "data-purpose": "cancelFeedback", html: bidx.i18n.i( "btnCancel" ) } )
        ,   $submitFeedbackBtn    = $( "<button />", { "class": "btn btn-success btn-submit-feedback btn-xs pull-left", "data-purpose": "submitFeedback", html: bidx.i18n.i( "submitFeedback" ) } )
        ,   $visibilities         = $( "<div />", { "class": "btn-group btn-group-justified feedback-visibilities hide" } )
                                    .append
                                    (
                                        $( "<div />", { "class": "btn-group" } )
                                        .append
                                        (
                                            $( "<button />", { "class": "btn btn-warning btn-xs active", text: "Private", "data-visibility": "PRIVATE" })
                                        )
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "btn-group" } )
                                        .append
                                        (
                                            $( "<button />", { "class": "btn btn-warning btn-xs", text: "Mentor", "data-visibility": "MENTOR" })
                                        )
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "btn-group" } )
                                        .append
                                        (
                                            $( "<button />", { "class": "btn btn-warning btn-xs", text: "Investor", "data-visibility": "INVESTOR" })
                                        )
                                    )
        ,   $feedbackBoxSnippet   = $( "<div />", { "class": "col-sm-4 main-padding feedback-box bg-warning hide" } )
                                    .append
                                    (
                                        $( "<div />", { "class": "feedback-notifications" } )
                                        .append
                                        (
                                            $( "<div />", { "class": "feedback-notification-success-add alert alert-success hide", html: bidx.i18n.i( "successAddingMsgFeedback" ) } )
                                            .append
                                            (
                                                 $( "<button />", { "class": "close", "type": "button" })
                                                .append
                                                (
                                                    $( "<span />", { "aria-hidden": "true", html: "&times;" })
                                                )
                                            )
                                        )
                                        .append
                                        (
                                            $( "<div />", { "class": "feedback-notification-success-delete alert alert-info hide", html: bidx.i18n.i( "successDeletingMsgFeedback" ) } )
                                            .append
                                            (
                                                 $( "<button />", { "class": "close", "type": "button" })
                                                .append
                                                (
                                                    $( "<span />", { "aria-hidden": "true", html: "&times;" })
                                                )
                                            )
                                        )
                                        .append
                                        (
                                            $( "<div />", { "class": "feedback-notification-error alert alert-danger hide", html: bidx.i18n.i( "errorMsgFeedback" ) } )
                                            .append
                                            (
                                                 $( "<button />", { "class": "close", "type": "button" })
                                                .append
                                                (
                                                    $( "<span />", { "aria-hidden": "true", html: "&times;" })
                                                )
                                            )
                                        )
                                    )
                                    .append
                                    (
                                        $addFeedbackBtn
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "feedback-submit hide-overflow hide" } )
                                        .append
                                        (
                                            $textarea
                                        )
                                        .append
                                        (
                                            $visibilities
                                        )
                                        .append
                                        (
                                            $submitFeedbackBtn
                                        )
                                        .append
                                        (
                                            $cancelFeedbackBtn
                                        )
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "feedback-posts" } )
                                    )
        ;

        $.each( $panelFeedback, function( index, panel )
        {
            var $panelHeading  = $(panel).find( ".panel-heading" ).first()
            ,   $panelShowView = $(panel).find( ".panel-body .viewShow" )
            ,   panelScope     = "bs" + $panelHeading.find( "a" ).attr("href").split("-")[1]
            ;

            $panelHeading.append( $btnFeedbackSnippet.clone() );

            $panelShowView
                .wrapInner( $divCol12.clone() )
                .wrapInner( $divRow.clone() )
                .children().first()
                .append( $feedbackBoxSnippet.clone() );

            $panelShowView.find( ".feedback-box" ).attr( "data-scope", panelScope );
        });
    }

    function _createFeedbackPost( feedback )
    {
        var $html = $("<div/>", { "class": "feedback-post", "data-feedbackid": feedback.feedbackId })
                    .append
                    (
                        $("<div/>", { "class": "feedback-commentor" })
                        .append
                        (
                            $("<strong/>")
                            .append
                            (
                                $("<small/>")
                                .append
                                (
                                    $("<span/>", { "class": "feedback-date", text: bidx.utils.parseTimestampToDateTime( feedback.created, "date" ) + " by " })
                                )
                                .append
                                (
                                    $("<a/>", { "class": "feedback-commentor-name", href: "/member/" + feedback.commentorId, text: feedback.commentorDisplayName })
                                )
                            )
                        )
                    )
        ;

        if ( feedback.canDelete )
        {
            $html.find( ".feedback-commentor" )
            .append
            (
                $("<div/>", { "class": "feedback-actions pull-right" })
                .append
                (
                    $("<button/>", { "class": "btn btn-xs btn-success btn-edit-feedback", "data-purpose": "editFeedback" })
                    .append
                    (
                        $("<i/>", { "class": "fa fa-pencil" })
                    )
                )
                .append
                (
                    $("<span/>", { html: "&nbsp;" })
                )
                .append
                (
                    $("<button/>", { "class": "btn btn-xs btn-danger btn-delete-feedback", "data-purpose": "deleteFeedback" })
                    .append
                    (
                        $("<i/>", { "class": "fa fa-trash-o" })
                    )
                )
            );
        }

        $html
            .append(
            $("<div/>", { "class": "feedback-comment" })
                .append
                (
                    _parseComment ( feedback.comment )
                )
            );

        $('*[data-scope="'+feedback.scope+'"]').find( ".feedback-posts" ).prepend( $html.fadeIn( "slow" ) );
    }

    function _parseComment( comment )
    {
        var $htmlParser = $( "<div/>", { "class": "feedback-temp-parse-comment", html: comment } );

        return $htmlParser.text().replace( /\n/g, "<br/>" );
    }

    function _unParseComment( comment )
    {
        var $htmlParser = $( "<div/>", { "class": "feedback-temp-unparse-comment", html: comment } );

        return $htmlParser.text().replace( /<br\s*[\/]?>/gi, "\n" );
    }

    function _showFeedbackSubmitionForm( $elem )
    {
        $elem.$feedbackSubmitBox.removeClass( "hide" );
        $elem.$element.hide();
        $elem.$textarea.focus();
    }

    function _hideFeedbackSubmitionForm( $elem )
    {
        $elem.$feedbackSubmitBox.addClass( "hide" );
        $elem.$element.show();
    }

    function _submitFeedbackPost( $elem )
    {
        var toRemoveId
        ,   postData   = {
                             commentorId:     currentUserId
                         ,   comment:         $elem.message
                         ,   scope:           $elem.scope
                         ,   visibility:      $elem.visibility
                         }
        ;

        toRemoveId = $elem.$feedbackBox.find( ".feedback-to-remove" ).length ? $elem.$feedbackBox.find( ".feedback-to-remove" ).data( "feedbackid" ) : false;

        if ( $elem.message )
        {
            $elem.$btnSubmitFeedback.addClass( "disabled" );
            $elem.$textarea.attr( "disabled" , true);

            _doPostFeedback( postData, $elem, toRemoveId );
        }

    }

    function _destroyFeedbackPost( feedbackId, $elem )
    {
            var postData  =  {
                                feedbackId:     feedbackId
                             };

            _doDestroyFeedback( postData, $elem );
    }

    function _editFeedbackPost( target )
    {
        if ( target.$feedbackSubmitBox.hasClass( "hide" ) )
        {
            target.$btnAddFeedback.click();
        }

        target.$textarea.val( _unParseComment( target.comment ) );

        target.$feedbackBox.find( ".btn-edit-feedback" ).removeClass( "disabled" );
        target.$feedbackBox.find( ".btn-delete-feedback" ).removeClass( "disabled" );
        target.$feedbackBox.find( ".feedback-post" ).removeClass( "feedback-to-remove" );

        target.$feedbackPost.addClass( "feedback-to-remove" );
        target.$btnDeleteFeedback.addClass( "disabled" );
        target.$btnEditFeedback.addClass( "disabled" );
    }

    function _resetFeedbackSubmitForm ( $elem )
    {
        $elem.$btnSubmitFeedback.removeClass( "disabled" );
        $elem.$textarea.val( "" ).attr( "disabled" , false);
        $elem.$feedbackSubmitBox.addClass( "hide" );
        $elem.$feedbackBox.find( ".btn-edit-feedback" ).removeClass( "disabled" );
        $elem.$feedbackBox.find( ".btn-delete-feedback" ).removeClass( "disabled" );
        $elem.$feedbackBox.find( ".feedback-post" ).removeClass( "feedback-to-remove" );
        $elem.$btnAddFeedback.show();
    }

    function _handleNotificationMessages( $elem, state )
    {
        $elem.$notifications.find( ".alert" ).removeClass( "hide" ).addClass( "hide" );

        switch (state)
        {
            case "added":

                $elem.$notiAdded.removeClass( "hide" );

                break;

            case "deleted" :

                $elem.$notiDeleted.removeClass( "hide" );

                break;

            case "error" :

                $elem.$notiError.removeClass( "hide" );

                break;
        }
    }

    // actual sending of message to API -> SAKIS
    //
    function _doPostFeedback( postData, $elem, toRemoveId )
    {
        if ( !postData.comment )
        {
            return;
        }

        bidx.api.call(
            "feedback.create"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   id:                       entityId
            ,   data:                     postData

            ,   success: function( response )
                {
                    bidx.utils.log( "[commenting] Comment sent", response );

                    if ( toRemoveId )
                    {
                        _destroyFeedbackPost( toRemoveId, false );
                    }

                    _createFeedbackPost( response.data );

                    var $newAddedFeedback  = $( "[data-feedbackid="+ response.data.feedbackId +"]" )
                    ,   $btnDeleteFeedback = $newAddedFeedback.find( ".btn-delete-feedback" )
                    ,   $btnEditFeedback   = $newAddedFeedback.find( ".btn-edit-feedback" )
                    ;

                    $btnDeleteFeedback.on('click', function()
                    {
                        _destroyFeedbackPost( response.data.feedbackId, _getTargetedParams( this ) );
                    });

                    $btnEditFeedback.on('click', function()
                    {
                        _editFeedbackPost( _getTargetedParams( this ) );
                    });

                    _resetFeedbackSubmitForm( $elem );

                    _handleNotificationMessages( $elem, "added" );
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );
                    }

                    _resetFeedbackSubmitForm( $elem );

                    _handleNotificationMessages( $elem, "error" );
                }
            }
        );
    }

    // actual sending of message to API -> SAKIS
    //
    function _doDestroyFeedback( postData, $elem )
    {
        if ( !postData )
        {
            return;
        }

        bidx.api.call(
            "feedback.cancel"
        ,   {
                groupDomain:              bidx.common.groupDomain
            ,   id:                       entityId
            ,   data:                     postData

            ,   success: function( response )
                {
                    bidx.utils.log( "[commenting] Comment destroyed ", postData.feedbackId );

                    $('*[data-feedbackid="'+postData.feedbackId+'"]').fadeOut( "slow", function() { this.remove(); } );

                    _handleNotificationMessages( $elem, "deleted" );
                }

            ,   error: function( jqXhr, textStatus )
                {
                    var response = $.parseJSON( jqXhr.responseText);

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client  error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );

                        _handleNotificationMessages( $elem, "error" );
                    }
                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        // _showMainError( "Something went wrong while sending the feedback: " + response.text );

                        _handleNotificationMessages( $elem, "error" );
                    }
                }
            }
        );
    }


    /**
     * Gets the comments from cache, or invokes the API to get them, using
     * the current user's access rights.
     */
    function _getFeedbackComments( options )
    {

        var params                  = options.params
        ,   $d                      = $.Deferred()
        ;

        bidx.utils.log( "[commenting] fetching comments ", options );

        bidx.api.call(
            "feedback.fetch"
        ,   {
                id:                entityId
            ,   groupDomain:       bidx.common.groupDomain
            ,   success: function( response )
                {
                    if( response )
                    {
                        bidx.utils.log( "[commenting] following comments received", response.data );

                        $.each( response.data.feedbacks , function( index, feedback )
                        {
                            _createFeedbackPost( feedback );
                        });

                        _handleClicked();

                    }
                }

            ,   error: function( jqXhr, textStatus )
                {

                    var response = $.parseJSON( jqXhr.responseText );

                    if ( jqXhr.status >= 400 && jqXhr.status < 500 )
                    {
                        bidx.utils.error( "Client  error occured", response );
                        // _showMainError( "Something went wrong while retrieving the comments: " + response.text );
                    }

                    if ( jqXhr.status >= 500 && jqXhr.status < 600 )
                    {
                        bidx.utils.error( "Internal Server error occured", response );
                        // _showMainError( "Something went wrong while retrieving the comments: " + response.text );
                    }

                    $d.reject();
                }
            }
        );

        return $d.promise();
    }

    function _getTargetedParams( elem )
    {
        var $elem = $(elem)
        ,   $feedbackPanel          = $elem.closest(".panel-feedback")
        ,   $feedbackBox            = $feedbackPanel.find(".feedback-box")
        ,   $feedbackSubmitBox      = $feedbackPanel.find(".feedback-submit")
        ,   $feedbackPost           = $elem.closest( ".feedback-post" )
        ,   $textarea               = $feedbackPanel.find( ".feedback-submit textarea" )
        ,   $btnAddFeedback         = $feedbackPanel.find( ".btn-add-feedback" )
        ,   $btnSubmitFeedback      = $feedbackPanel.find( ".btn-submit-feedback" )
        ,   $btnDeleteFeedback      = $feedbackPost.find( ".btn-delete-feedback" )
        ,   $btnEditFeedback        = $feedbackPost.find( ".btn-edit-feedback" )
        ,   $notifications          = $feedbackBox.find( ".feedback-notifications" )
        ,   $notiAdded              = $notifications.find( ".feedback-notification-success-add" )
        ,   $notiDeleted            = $notifications.find( ".feedback-notification-success-delete" )
        ,   $notiError              = $notifications.find( ".feedback-notification-error" )
        ,   comment                 = $feedbackPost.find( ".feedback-comment" ).html()
        ,   feedbackId              = $feedbackPost.attr( "data-feedbackid" )
        ,   scope                   = $feedbackBox.attr( "data-scope" )
        ,   visibility              = $feedbackPanel.find( ".feedback-visibilities .active" ).attr( "data-visibility" )
        ,   message                 = $textarea.val()
        ,   params
        ;

        params =
        {
            entityId            : entityId
        ,   scope               : scope
        ,   visibility          : visibility
        ,   message             : message
        ,   feedbackId          : feedbackId
        ,   comment             : comment

        ,   $feedbackPanel      : $feedbackPanel
        ,   $feedbackBox        : $feedbackBox
        ,   $feedbackSubmitBox  : $feedbackSubmitBox
        ,   $feedbackPost       : $feedbackPost
        ,   $textarea           : $textarea
        ,   $btnAddFeedback     : $btnAddFeedback
        ,   $btnSubmitFeedback  : $btnSubmitFeedback
        ,   $btnDeleteFeedback  : $btnDeleteFeedback
        ,   $btnEditFeedback    : $btnEditFeedback
        ,   $notifications      : $notifications
        ,   $notiAdded          : $notiAdded
        ,   $notiDeleted        : $notiDeleted
        ,   $notiError          : $notiError
        ,   $element            : $elem

        };

        return params;
    }






    /**
     * Parses parameters from a link holding
     * <a href=... data-entityId=... data-scopes=... data-visibilites=...>
     *
     * @param $elem
     */
    // function _parseParams( $elem )
    // {
    //     var href                = $elem.attr( "href" )
    //     ,   entityId            = $elem.data( "entityid" )
    //     ,   scopes              = $elem.data( "scopes" )
    //     ,   showAllScopes       = scopes && /^\*/.test( scopes )
    //     ,   visibilities        = $elem.data( "visibilities" )
    //     ,   negateVisibilities  = visibilities && /^!/.test( visibilities )
    //         // Match #commenting, #commenting/action, or #commenting/action/splat/until/the/end
    //     ,   matcher             = href.match( "^#" + appName + "(?:/([^/]*)/?(.*))?$" )
    //     ,   state               = matcher && matcher[1] ? matcher[1] : "viewComments"
    //     ,   splat               = matcher && matcher[2] ? matcher[2] : ""
    //     ,   params
    //     ;

    //     // Any ".../entityId=.../..." in the URL overrides data-entityid
    //     matcher             = splat.match( /entityId=(\d+)/ );
    //     entityId            = matcher ? matcher[1] : entityId;

    //     // Remove the optional "*" or "!" prefix, and split into an array. As
    //     // "".split returns an array containing one empty string (rather than an
    //     // empty array), make sure the matcher returns null for "" and "*".
    //     scopes = scopes ? scopes.match( /(\*?)([^\*].*)/ ) : null;
    //     scopes = scopes && scopes[2].split( /\s*,\s*/ );

    //     // For Visibility, also map "general,groupAdmin" to "GENERAL,GROUP_ADMIN".
    //     visibilities = visibilities ? _enumize( visibilities ).match( /(!?)([^!].*)/ ) : null;
    //     visibilities = visibilities && visibilities[2].split( /\s*,\s*/ );

    //     params =
    //     {
    //         entityId            : entityId
    //     ,   state               : state
    //         // If the link text should be changed to include the count
    //     ,   setCount            : $elem.data( "setcount" ) || false
    //         // If the link should be hidden if the user has no visibilities
    //     ,   setDisplay          : $elem.data( "setdisplay" ) || false
    //         // The scopes to show, and to allow when writing a new comment
    //     ,   scopes              : scopes
    //         // If (old, obsolete) scopes that are not in data-scopes, should be displayed
    //     ,   showAllScopes       : showAllScopes
    //         // The visbilities to (not) show, and to (not) allow when writing a new comment
    //     ,   visibilities        : visibilities
    //         // If the given list of visibilities should be excluded rather than included
    //     ,   negateVisibilities  : negateVisibilities
    //         // If the list of visibilities should be hidden when there's only one choice
    //         // TODO Arjan remove
    //     ,   hideVisibilities    : $elem.data( "hidevisibilities" ) || false
    //     };

    //     return params;
    // }

    /**
     * Filters the given visibilities as allowed for the user, by the optional
     * list as set in data-visibilities on the link. This could yield an empty
     * list.
     */
    // function _filterVisibilities( allowedVisibilities, params )
    // {
    //     return params.visibilities ? _.intersection( allowedVisibilities, params.visibilities ) : allowedVisibilities;
    // }

    /**
     * Filters the given list of comments by scope and visibility.
     */
    // function _filterComments( comments, params )
    // {
    //     if( !comments )
    //     {
    //         return [];
    //     }

    //     return _.filter( comments, function( comment )
    //     {
    //         if( !params.showAllScopes && params.scopes && ! _.contains( params.scopes, comment.scope ) )
    //         {
    //             return false;
    //         }

    //         // We don't need to take allowedVisibilities into account here, as
    //         // the API will already have filtered on that.
    //         if( params.negateVisibilities )
    //         {
    //             if( _.contains( params.visibilities, comment.visibility ) )
    //             {
    //                 return false;
    //             }
    //         }
    //         else if( params.visibilities && ! _.contains( params.visibilities, comment.visibility ) )
    //         {
    //             return false;
    //         }

    //         return true;
    //     });
    // }

    /** 
     * Determines if showing an "Add comment" button makes sense.
     */
    // function _canAddComment( comments, params )
    // {
    //     var visibilities = _filterVisibilities( comments.allowedVisibilities, params );
    //     return params.scopes !== null && visibilities.length > 0;
    // }

    /**
     * Updates the counters for all links that define data-setcount=true, and
     * hides those that have data-setdisplay=true but have no visibilities.
     */
    // function _setCountsAndDisplays()
    // {
    //     bidx.utils.log( "[commenting] updating counts" );

    //     $( selector ).filter( "a[data-setcount='true'],a[data-setdisplay='true']" ).each( function()
    //     {
    //         var $elem                   = $( this )
    //         ,   params                  = _parseParams( $elem )
    //         ,   count
    //         ,   display
    //         ;

    //         bidx.utils.log( "[commenting] updating $elem", $elem );

    //         _getComments (
    //         {
    //             params : params
    //         })
    //         .done( function( comments )
    //         {
    //             count = _filterComments(comments.feedbacks, params).length;
    //             display = _filterVisibilities( comments.allowedVisibilities, params ).length > 0;
    //             _setCountAndDisplay( $elem, params, count, display );
    //         });
    //     } );
    // }

    /**
     * Removes any " (nn)" from "Comments (nn)" and appends the new
     * (filtered) total count.
     */
    // function _setCountAndDisplay( $elem, params, count, display )
    // {
    //     // TODO Sakis Adjust for whatever design is used? Beware that it's used on both mentor dashboard and business summary.
    //     if ( params.setCount && count > 0 )
    //     {
    //         $elem.text( $elem.text().replace( /\(\s?\d+\)/, "" ) + " (" + count + ")" );
    //     }

    //     // If data-visibilities has no match with allowedVisibilities, hide it.
    //     if ( params.setDisplay )
    //     {
    //         $elem.toggle( display );
    //     }
    // }


    /**
     * Gets the comments from cache, or invokes the API to get them, using
     * the current user's access rights.
     */
    // function _getComments( options )
    // {

    //     var params                  = options.params
    //     ,   entityId                = params.entityId
    //     ,   cached                  = commentCache[ entityId ]
    //     ,   $d                      = $.Deferred()
    //     ;

    //     if ( cached && cached.feedbacks )
    //     {
    //         $d.resolve( cached );
    //         return $d.promise( );
    //     }

    //     if ( cached && cached.promises )
    //     {
    //         // The very same entityId might be used on a page multiple times; we
    //         // already fired the API request for this entityId
    //         cached.promises.push( $d );
    //         return $d.promise( );
    //     }

    //     bidx.utils.log( "[commenting] fetching comments ", options );

    //     commentCache[ entityId ] = {};
    //     commentCache[ entityId ].promises = [ $d ];

    //     bidx.api.call(
    //         "feedback.fetch"
    //     ,   {
    //             id:                entityId
    //         ,   groupDomain:       bidx.common.groupDomain
    //         ,   success: function( response )
    //             {
    //                 if( response )
    //                 {
    //                     bidx.utils.log( "[commenting] following comments received", response.data );

    //                     $.each( commentCache[ entityId ].promises, function( idx, $p )
    //                     {
    //                         // This includes the current request
    //                         $p.resolve( response.data );
    //                     });

    //                     commentCache[entityId] = response.data;
    //                 }
    //             }

    //         ,   error: function( jqXhr, textStatus )
    //             {

    //                 var response = $.parseJSON( jqXhr.responseText );

    //                 if ( jqXhr.status >= 400 && jqXhr.status < 500 )
    //                 {
    //                     bidx.utils.error( "Client  error occured", response );
    //                     _showMainError( "Something went wrong while retrieving the comments: " + response.text );
    //                 }

    //                 if ( jqXhr.status >= 500 && jqXhr.status < 600 )
    //                 {
    //                     bidx.utils.error( "Internal Server error occured", response );
    //                     _showMainError( "Something went wrong while retrieving the comments: " + response.text );
    //                 }

    //                 $d.reject();
    //             }
    //         }
    //     );

    //     return $d.promise();
    // }

    /**
     * Changes "lorem_IPSUM-dolor" into "LoremIpsumDolor".
     */
    // function _camelize( s )
    // {
    //     return s.toLowerCase().replace( /(?:^|[-_]+)(.)?/g, function( match, c ){ return c.toUpperCase(); } );
    // }

    /**
     * Uppercases the first letter of the string.
     */
    // function _titleize( s )
    // {
    //     return s[0].toUpperCase() + s.substring(1);
    // }

    /**
     * Changes "loremIpsumDolor" into an API-like enum value such as "LOREM_IPSUM_DOLOR".
     */
    // function _enumize( s )
    // {
    //     return s.replace( /([a-z\d])([A-Z]+)/g, '$1_$2' ).toUpperCase();
    // }

    /**
     * Gets an i18n label for "prefixCamelCase", given a prefix like "prefix"
     * and a scope like "bsSummary" or a visibility like "GROUP_ADMIN".
     */
    // function _getLabel( key, i18nPrefix ) {
    //     var i18nKey;

    //     if( i18nPrefix === "visibility" )
    //     {
    //         // Visibility like "PRIVATE" or "GROUP_ADMIN"
    //         i18nKey = _camelize( key );
    //     }
    //     else
    //     {
    //         // Scope like "general" or "bsSummary"
    //         i18nKey = _titleize ( key );
    //     }
    //     return bidx.i18n.i( i18nPrefix + i18nKey, appName ) || key;
    // }

    // function _fillDropdown( $dropdown, items, i18nPrefix )
    // {
    //     var listArrItems = []
    //     ,   option
    //     ,   label
    //     ;

    //     $dropdown.find( "option" ).remove();
    //     $dropdown.trigger("chosen:updated");

    //     if ( _.isString(items) ) {
    //         items = items.split(",");
    //     }

    //     if( items ) {
    //         $.each( items, function( idx, bpIdx )
    //         {
    //             option = $( "<option/>",
    //             {
    //                 value: bpIdx
    //             } );
    //             option.text( _getLabel( bpIdx, i18nPrefix ) );

    //             listArrItems.push( option );
    //         } );
    //     }

    //     // add the options to the select
    //     $dropdown.append( listArrItems );

    //     // init bidx_chosen plugin
    //     $dropdown.bidx_chosen();
    // }

    // function _initAddFeedback( options )
    // {
    //     var $btnSave    = $mainElement.find('.btn-feedback-submit')
    //     ,   $btnCancel  = $mainElement.find('.btn-feedback-cancel')
    //     ,   params      = options.params
    //     ,   visibilities
    //     ,   $d          = $.Deferred()
    //     ;

    //     // Wire the submit button which can be anywhere in the DOM
    //     //
    //     $btnSave.click( function( e )
    //     {
    //         e.preventDefault();

    //         $editForm.submit();
    //     } );


    //     // Setup form
    //     //
    //     var $validator = $editForm.validate(
    //     {
    //         debug: false
    //     ,   rules:
    //         {
    //             "scope":
    //             {
    //                 required:               true
    //             }
    //         ,   "visibility":
    //             {
    //                 required:               true
    //             }
    //         ,   "feedback":
    //             {
    //                 required:               true
    //             }
    //         }
    //     ,   submitHandler: function( e )
    //         {
    //             if ( $btnSave.hasClass( "disabled" ) )
    //             {
    //                 return;
    //             }

    //             $btnSave.addClass( "disabled" );
    //             $btnCancel.addClass( "disabled" );

    //             _closeMainModal(
    //             {
    //                 unbindHide: true
    //             } );

    //             _showMainModal(
    //             {
    //                 view  : "confirmComment"
    //             ,   params: options.params
    //             ,   onHide: function()
    //                 {
    //                     $btnSave.removeClass( "disabled" );
    //                     $btnCancel.removeClass( "disabled" );
    //                 }
    //             } );
    //         }
    //     } );

    //     // Add scopes dropdown options
    //     //
    //     bidx.utils.log( "[commenting] filling scopes", options.params.scopes );
    //     _fillDropdown( $scopeDropdown, options.params.scopes, "scope" );

    //     _getComments(
    //         { params :
    //             {
    //                 entityId  : params.entityId
    //             }
    //         })
    //         .done( function( comments )
    //         {
    //             // If data-visibilites has been set, then use only those from
    //             // the list of allowed visibilities for this user. This could
    //             // yield an empty list.
    //             visibilities = _filterVisibilities( comments.allowedVisibilities, params );
    //             bidx.utils.log( "[commenting] filling visibility", visibilities );

    //             _fillDropdown( $visibilityDropdown, visibilities, "visibility" );

    //             // TODO Sakis This is just a temporary workaround to mimic the current behaviour in the mentoring dashboard.
    //             // TODO Arjan remove.
    //             // 
    //             // If there is only one choice for visibility, hide the dropdown if 
    //             // wanted. This can be quite confusing when one can only leave private 
    //             // comments, as then one might not understand that it's actually private.
    //             $visibilityDropdown.parent( ".form-group" )
    //                 .toggle( !params.hideVisibilities || visibilities.length > 1 );

    //             $d.resolve();
    //         });

    //     return $d.promise();
    // }


    // actual sending of message to API
    //
    // function _doSendFeedback( options )
    // {

    //     var params  =   options.params
    //     ,   postData
    //     ,   message =   bidx.utils.getElementValue( $editForm.find( "[name=feedback]" ) )
    //     ,   scope   =   bidx.utils.getElementValue( $editForm.find( "[name=feedbackpurpose]" ) )
    //     ,   visibility  = bidx.utils.getElementValue( $editForm.find( "[name=feedbackvisibility]" ) )
    //     ;

    //     if ( !message )
    //     {
    //         return;
    //     }

    //     postData =  {
    //                     commentorId:     currentUserId
    //                 ,   comment:         message
    //                 ,   scope:           (scope) ? scope : params.scopes[0]
    //                 ,   visibility:      visibility || 'PRIVATE'
    //                 };

    //     bidx.api.call(
    //         "feedback.create"
    //     ,   {
    //             groupDomain:              bidx.common.groupDomain
    //         ,   id:                       params.entityId
    //         ,   data:                     postData

    //         ,   success: function( response )
    //             {

    //                 bidx.utils.log( "[commenting] Comment sent", response );
    //                 //var key = "messageSent";

    //                 bidx.common.notifyCustomSuccess( bidx.i18n.i( "commentSent", appName ) );

    //                 if (options && options.callback)
    //                 {
    //                     options.callback();
    //                 }
    //             }

    //         ,   error: function( jqXhr, textStatus )
    //             {

    //                 var response = $.parseJSON( jqXhr.responseText);

    //                 // 400 errors are Client errors
    //                 //
    //                 if ( jqXhr.status >= 400 && jqXhr.status < 500)
    //                 {
    //                     bidx.utils.error( "Client  error occured", response );
    //                     _showMainError( "Something went wrong while sending the feedback: " + response.text );
    //                 }
    //                 // 500 erors are Server errors
    //                 //
    //                 if ( jqXhr.status >= 500 && jqXhr.status < 600)
    //                 {
    //                     bidx.utils.error( "Internal Server error occured", response );
    //                     _showMainError( "Something went wrong while sending the feedback: " + response.text );
    //                 }

    //                 if (options && options.callback)
    //                 {
    //                     options.callback();
    //                 }

    //             }
    //         }
    //     );

    // }

    // TODO Arjan TODO Altaf This is repeated in many, many places?
    // function showMemberProfile( options )
    // {
    //     var bidxMeta
    //     ,   item        = options.item
    //     ;

    //     if($.isEmptyObject( memberData[ item.commentorId ] ))
    //     {
    //         bidx.api.call(
    //             "member.fetch"
    //         ,   {
    //                 id:          item.commentorId
    //             ,   requesteeId: item.commentorId
    //             ,   groupDomain: bidx.common.groupDomain
    //             ,   success:     function( itemResult )
    //                 {
    //                     // now format it into array of objects with value and label

    //                     if ( !$.isEmptyObject(itemResult.bidxMemberProfile) )
    //                     {
    //                         //if( item.bidxEntityType == 'bidxBusinessSummary') {
    //                         bidxMeta       = bidx.utils.getValue( itemResult, "bidxMemberProfile.bidxMeta" );

    //                         if ( bidxMeta )
    //                         {
    //                             memberData[ item.commentorId ]   = itemResult.member.displayName;
    //                         }
    //                     }

    //                     //  execute callback if provided
    //                     if ( options && options.callback )
    //                     {
    //                         options.callback( item );
    //                     }

    //                 }
    //             ,   error: function( jqXhr, textStatus )
    //                 {
    //                     return false;
    //                 }
    //             }
    //         );
    //     }
    //     else
    //     {

    //         //  execute callback if provided
    //         if ( options && options.callback )
    //         {
    //             options.callback( item );
    //         }

    //     }

    //     return;

    // }

    // function _getMemberData ()
    // {
    //     var  mentorMemberData
    //     ,   entrepreneurMemberData
    //     ,   groupOwnersArr = []
    //     ;

    //     // Add member that are already retrieved through entrepreneur/mentor calls
    //     mentorMemberData            = bidx.utils.getValue( bidx, "entrepreneurmentordashboard.memberData" );
    //     entrepreneurMemberData      = bidx.utils.getValue( bidx, "mentormentordashboard.memberData" );

    //     mentorMemberData            = (mentorMemberData) ? mentorMemberData : {};
    //     entrepreneurMemberData      = (entrepreneurMemberData) ? entrepreneurMemberData : {};

    //     //Add current user
    //     memberData                  = _.extend(mentorMemberData, entrepreneurMemberData);
    //     memberData [currentUserId ] =  bidx.common.getSessionValue( 'displayName' );

    //     // Add Groupowners
    //     groupOwnersArr = bidx.common.getSessionValue( 'groupOwners' );
    //     $.each( groupOwnersArr, function( index, item )
    //     {
    //         memberData [item.id ] =  item.displayName;
    //     } );

    //     return memberData;

    // }

    // function _prepareFeedbackListing( options )
    // {

    //     var     $elementList
    //     ,       $filteredElementList
    //     ,       $scopeList
    //     ,       $orderedList = []
    //     ,       newScopeItem
    //     ,       params = options.params
    //     ,       listDropdownFeedback = params.scopes
    //     ,       $newScopeItem
    //     ,       scopeItem   =  $( "#comments-scopeitem" ).html().replace( /(<!--)*(-->)*/g, "" )
    //     ,       $elements   =  options.elements
    //     ;

        /*
         * To ensure we don't ignore scopes that are no longer known: first
         * group by scope, then iterate through all known scopes in the order as
         * given in data-scopes, and finally handle any left overs if applicable
         * and wanted.
         */
    //     var grouped = _.groupBy( $elements, 'scope' );

    //     if( params.scopes )
    //     {
    //         $.each( params.scopes, function( idx, scope )
    //         {
    //             _addFeedbackItem( grouped, scope, scopeItem, $orderedList );
    //         } );
    //     }

    //     if ( params.showAllScopes )
    //     {
    //         // If anything is left, then we don't know the preferred display order.
    //         $.each( _.keys( grouped ), function ( idx, scope )
    //         {
    //             _addFeedbackItem( grouped, scope, scopeItem, $orderedList );
    //         });
    //     }

    //     if( options && options.callback )
    //     {
    //         options.callback( $orderedList );
    //     }

    // }

    // function _addFeedbackItem( groupedItems, key, scopeItem, $orderedList )
    // {
    //     var $filteredElementList = groupedItems[ key ]
    //     ,   newScopeItem
    //     ,   $newScopeItem
    //     ;

    //     if( $filteredElementList && $filteredElementList.length )
    //     {
    //         delete groupedItems[key];
    //         $filteredElementList = _.sortBy( $filteredElementList, 'updatedDate' );

    //         newScopeItem     = scopeItem
    //                           .replace( /%feedbackScopeName%/g, _getLabel( key, "scope" ) )
    //                           .replace( /%feedbackScopeId%/g, $orderedList.length )
    //                           ;

    //         $newScopeItem    = $( newScopeItem );

    //         $filteredElementList = _.pluck($filteredElementList, 'newListItem'); // Picku new list item to add html

    //         $newScopeItem.find( ".scopefeedback" ).append( $filteredElementList );

    //         $orderedList.push( $newScopeItem );
    //     }

    // }


    // function _doViewFeedbackRequest( options )
    // {
    //         bidx.utils.log( "[commenting] view comments ", options );

    //         var $view                   = $mainModals.filter( bidx.utils.getViewName( options.view, "modal" ) )
    //         ,   $list                   = $view.find( ".list" )
    //         ,   listItem                =  $( "#comments-listitem" ).html().replace( /(<!--)*(-->)*/g, "" )
    //         ,   $listEmpty              = $( $( "#comments-empty") .html().replace( /(<!--)*(-->)*/g, "" ) )
    //         ,   $feedbackBtn            = $view.find( ".btn-feedback-submit" )
    //         ,   params                  = options.params
    //         ,   entityId                = params.entityId
    //         ,   scopes                  = params.scopes
    //         ,   $d                      = $.Deferred()
    //         ,   messages
    //         ,   newListItem
    //         ;


    //         memberData = ( memberData.length ) ? memberData : _getMemberData();

    //         _getComments(
    //                 { params :
    //                     {
    //                         entityId  : entityId
    //                     }
    //                 })
    //                 .done( function( comments )
    //                     {
    //                         bidx.utils.log( "[commenting] rendering following comments", comments );
    //                         var item
    //                         ,   $element
    //                         ,   senderReceiverName
    //                         ,   $elements           = []
    //                         ,   counter             = 1
    //                         ,   filtered            = _filterComments( comments.feedbacks ? comments.feedbacks : null, params )
    //                         ,   feedbackLength      = filtered.length
    //                         ;

    //                         // clear listing
    //                         //
    //                         $list.empty();

    //                         // check if there are emails, otherwise show listEmpty
    //                         //
    //                         if( feedbackLength > 0 )
    //                         {
    //                             // loop through response
    //                             //
    //                             $.each( filtered, function( index, item )
    //                             {

    //                                 bidx.utils.log( 'id', currentUserId, 'comid', item.commentorId);

    //                                 showMemberProfile(
    //                                 {
    //                                     item     :   item
    //                                  ,  callback    :   function ( itemMember )
    //                                                     {
    //                                                         bidx.utils.log('itemMember', itemMember);
    //                                                         itemMember.senderReceiverName = memberData[ itemMember.commentorId ];
    //                                                         newListItem = listItem;
    //                                                         newListItem             = newListItem
    //                                                                                 .replace( /%accordion-id%/g, ( itemMember.feedbackId ) ? itemMember.feedbackId: "" )
    //                                                                                 .replace( /%senderReceiverName%/g, itemMember.senderReceiverName )
    //                                                                                 .replace( /%dateCreated%/g, bidx.utils.parseTimestampToDateTime( itemMember.created, "date" ) )
    //                                                                                 .replace( /%timeCreated%/g, bidx.utils.parseTimestampToDateTime( itemMember.created, "time" ) )
    //                                                                                 .replace( /%comment%/g, itemMember.comment )
    //                                                                                 .replace( /%visibility%/g, _getLabel( itemMember.visibility, "visibility" ) )
    //                                                                                 .replace( /%classVisibility%/g, "visibility" + _camelize( itemMember.visibility) );

    //                                                         $element                =   {
    //                                                                                         newListItem: newListItem
    //                                                                                     ,   updatedDate: itemMember.updated
    //                                                                                     ,   scope      : ( itemMember.scope ) ? itemMember.scope : 'feedbackGeneral'
    //                                                                                     };

    //                                                         $elements.push( $element );

    //                                                         if( counter === feedbackLength )
    //                                                         {
    //                                                             _prepareFeedbackListing(
    //                                                             {
    //                                                                 elements:   $elements
    //                                                             ,   params:     params
    //                                                             ,   callback:   function( $orderedList )
    //                                                                             {
    //                                                                                 bidx.utils.log( 'orderedList', $orderedList );
    //                                                                                 $list.append( $orderedList );
    //                                                                                 $d.resolve();
    //                                                                             }
    //                                                             } );

    //                                                         }

    //                                                         counter = counter + 1;

    //                                                     }
    //                                 } );

    //                             } );
    //                         }
    //                         else
    //                         {
    //                             $list.append( $listEmpty );
    //                             $d.resolve( );
    //                         }

    //                         // If there are no scopes or visibilities, hide the "Add comment" button
    //                         //
    //                         $feedbackBtn.toggle( _canAddComment( comments, params ) );

    //                         // execute callback if provided
    //                         //
    //                         if( options && options.callback )
    //                         {
    //                             options.callback( response);
    //                         }
    //                     });

    //         return $d.promise( );
    //     }

    // function _resetFeedbackForm()
    // {
    //     //  reset formfield values
    //     //
    //     $editForm.find( ":input" ).val("");
    //     $scopeDropdown.val();
    //     $scopeDropdown.bidx_chosen();
    //     $visibilityDropdown.val();
    //     $visibilityDropdown.bidx_chosen();
    //     $editForm.validate().resetForm();

    // }


    //  ################################## MODAL #####################################  \\


    /*************** Main Views *************************/

    //  show modal view with optionally and ID to be appended to the views buttons
    // function _showMainModal( options )
    // {
    //     var href
    //     ,   replacedModal
    //     ,   action
    //     ,   redirect
    //     ,   actionKey
    //     ,   actionMsg
    //     ,   btnKey
    //     ,   btnTxt
    //     ,   params = {}
    //     ;

    //     if(options.params)
    //     {
    //         params  =   options.params;
    //         action  =   options.params.action;
    //         redirect =   bidx.utils.getValue(options.params, 'redirect');
    //     }

    //     bidx.utils.log("[commenting] show modal", options );

    //     $mainModal        = $mainModals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");

    //     if( action )
    //     {
    //         // Modal popup message
    //         action      =   action.replace( /ed/g, '');
    //         actionKey   =   'modal' + action.substring(0,1).toUpperCase() + action.substring(1); // ex 'modalAccept, modalCancel, modalIgnore', 'modalStop'
    //         actionMsg   =   bidx.i18n.i( actionKey ) ;
    //        // bidx.utils.log("action", bidx.utils.getViewName ( options.view, "modal" )  );
    //         $mainModal.find(".modal-body").empty().append( actionMsg );

    //         //Modal Primary Button Text
    //         btnKey      =   'modalBtn' + action.substring(0,1).toUpperCase() + action.substring(1); // ex 'modalBtnAccept, modalBtnCancel, modalBtnIgnore', 'modalBtnStop'
    //         btnTxt      =   bidx.i18n.i( btnKey );
    //         $mainModal.find(".btn-primary").html(btnTxt);

    //         //Modal header change
    //         $mainModal.find("#myModalLabel").html(btnTxt);

    //         //Change the cancel button link if refresh exists
    //         if( redirect )
    //         {
    //             $mainModal.find(".btn-request-cancel").attr( 'href' , redirect + '/cancel=true') ;
    //         }
    //     }

    //     $mainModal.find( ".btn-primary[href], .btn-cancel[href]" ).each( function()
    //     {
    //         var $this = $( this );

    //          href = $this.attr( "data-href" );

    //          $this.attr( "href", href );
    //     } );

    //     if( options.onHide )
    //     {
    //         //  to prevent duplicate attachments bind event only onces
    //         $mainModal.on( 'hidden.bs.modal', options.onHide );
    //     }

    //     if( options.onShow )
    //     {

    //         $mainModal.on( 'show.bs.modal' ,options.onShow );
    //     }

    //     $mainModal.modal( {} );

    // }

    //  closing of modal view state
    // var _closeMainModal = function(options)
    // {
    //     if ($mainModal)
    //     {
    //         if (options && options.unbindHide)
    //         {
    //             $mainModal.unbind('hide');
    //         }
    //         $mainModal.modal('hide');
    //     }
    // };

    // var _showMainView = function(view, showAll)
    // {

    //     //  show title of the view if available
    //     if (!showAll)
    //     {
    //         $mainViews.hide();
    //     }
    //      var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();
    // };

    // var _showMainHideView = function(view, hideview)
    // {

    //     $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
    //     var $mainView = $mainViews.filter(bidx.utils.getViewName(view)).show();

    // };

    // var _hideMainView = function(hideview)
    // {
    //     $mainViews.filter(bidx.utils.getViewName(hideview)).hide();
    // };

    // display generic error view with msg provided
    //
    // function _showMainError( msg )
    // {
    //     $mainViews.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
    //     _showMainView( "error" , true);
    // }


    // ROUTER


    // var navigate = function( options )
    // {
    //     bidx.utils.error("[commenting] routing options", options);

    //     var state = options.state;

    //     if ( options.params && options.params.entityId )
    //     {
    //         currentParams = options.params;
    //     }
    //     else
    //     {
    //         // The user clicked a link in the modal window. At this point we
    //         // don't have any of the data-xx attributes, and cannot easily get
    //         // to the link through which the modal window was opened. However,
    //         // we already cached the paramaters, so can safely use those.
    //         options.params = currentParams;
    //     }

    //     switch (state)
    //     {
    //         case "cancel":
    //             bidx.utils.log( "[commenting] cancel", options );

    //             _closeMainModal(
    //             {
    //                 unbindHide: true
    //             } );

    //             break;

    //         case "writeComment" :
    //             bidx.utils.log( "[commenting] writing new comment", options );

    //             var $feedbackBtn = $mainElement.find( '.btn-feedback-submit' );

    //             _closeMainModal(
    //             {
    //                 unbindHide: true
    //             } );

    //             _initAddFeedback(
    //                 {
    //                     params: options.params
    //                 } )
    //                 .done( function() {

    //                     _showMainModal(
    //                     {
    //                         view  : "writeComment"
    //                     ,   params: options.params
    //                     } );
    //                 });

    //             break;

    //         case "postComment" :

    //             var btnFeedbackText
    //             ,   $btnSave                  = $mainElement.find('.btn-feedback-submit')
    //             ,   $btnCancel                = $mainElement.find('.btn-feedback-cancel')
    //             ,   $btnConfirmFeedbackSave   = $mainElement.find('.btn-send-feedback')
    //             ,   $btnConfirmFeedbackCancel = $mainElement.find('.btn-cancel-feedback')
    //             ;

    //             btnFeedbackText = $btnConfirmFeedbackSave.text();

    //             $btnConfirmFeedbackSave.addClass( "disabled" ).i18nText("msgWaitForSave");
    //             $btnConfirmFeedbackCancel.addClass( "disabled" );

    //             _doSendFeedback(
    //             {
    //                 params: options.params
    //             ,   callback: function()
    //                 {
    //                     $btnSave.removeClass( "disabled" );
    //                     $btnCancel.removeClass( "disabled" );
    //                     $btnConfirmFeedbackSave.removeClass( "disabled" ).text( btnFeedbackText );
    //                     $btnConfirmFeedbackCancel.removeClass( "disabled" );
    //                     _resetFeedbackForm();

    //                     commentCache[options.params.entityId] = null;
    //                     _setCountsAndDisplays();

    //                     _closeMainModal(
    //                     {
    //                         unbindHide: true
    //                     } );

    //                 }
    //             } );

    //             break;

    //         case 'confirmComment' :

    //             _closeMainModal(
    //             {
    //                 unbindHide: true
    //             } );

    //             _showMainModal(
    //             {
    //                 view  : "confirmComment"
    //             ,   params: options.params
    //             } );

    //             break;

    //         case 'viewComments' :

    //             _closeMainModal(
    //             {
    //                 unbindHide: true
    //             } );

    //             _doViewFeedbackRequest(
    //             {
    //                 params: options.params
    //             ,   view: 'listComments'
    //             } )
    //             .done( function( )
    //             {
    //                 _showMainModal(
    //                     {
    //                         view  : "listComments"
    //                     ,   params: options.params
    //                     } );
    //             } );

    //             break;

    //      }
    // };

    //expose
    // var commenting =
    //         {
    //             navigate    : navigate
    //         ,   refresh     : _setCountsAndDisplays
    //         };


    // if (!window.bidx)
    // {
    //     window.bidx = {};
    // }
    // window.bidx.commenting = commenting;

    // Make sure the i18n translations for this app are available before initing
    //
    bidx.i18n.load( [ "__global", appName ] )
            .done( function()
            {
                if ( $panelFeedback )
                {
                    _oneTimeSetup();
                }
            } );

}(jQuery));

