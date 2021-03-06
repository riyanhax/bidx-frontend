;( function ( $ )
{
    "use strict";
    var $mainElement         = $("#mentor-dashboard")
     ,  $mainViews           = $mainElement.find(".view")
    ,   $mainModals          = $mainElement.find(".modalView")
    ,   $mainModal

    ,   $element             = $mainElement.find(".mentor-mentordashboard")
    ,   $views               = $element.find(".view")
    ,   bidx                 = window.bidx
    ,   $modals              = $element.find(".modalView")
    ,   $modal
    ,   focusExpertise
    ,   currentGroupId       = bidx.common.getCurrentGroupId( "currentGroup ")
    ,   currentUserId        = bidx.common.getCurrentUserId( "id" )
    ,   currentMentorId      = bidx.common.getMentorProfileId()
    ,   memberData           = {}
    ,   appName              = 'mentor'

    ,   respond              = []
    ,   wait                 = []
    ,   ongoing              = []
    ,   allRequest           = []

    ,   dataArr              =  {
                                    'industry'         : 'industry'
                                ,   'countryOperation' : 'country'
                                ,   'stageBusiness'    : 'stageBusiness'
                                ,   'productService'   : 'productService'
                                ,   'envImpact'        : 'envImpact'
                                ,   'summaryRequestStatus' : 'summaryRequestStatus'
                                ,   'expertiseNeeded'  : 'mentorExpertise'
                                }
    ,   $searchPagerContainer   = $views.filter( ".viewMatch" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )
    ,   paging                  =
        {
            search:
            {
                offset:         0
            ,   totalPages:     null
            }
        }
    ;

    // Constants
    //
    var CONSTANTS =
        {
            SEARCH_LIMIT:                       5
        ,   NUMBER_OF_PAGES_IN_PAGINATOR:       10
        ,   LOAD_COUNTER:                       0
        ,   VISIBLE_FILTER_ITEMS:               4 // 0 index (it will show +1)
        ,   ENTITY_TYPES:                       [
                                                    {
                                                        "type": "bidxBusinessSummary"
                                                    }
                                                ]
        }

    ,   tempLimit = CONSTANTS.SEARCH_LIMIT

    ;

    /*
        {
            "searchTerm"    :   "text:*"
        ,   "sort"          :   [
                                  {
                                    "field": "entityId",
                                    "order": "asc"
                                  }
                                ]
        ,   "maxResult"     :   10
        ,   "offset"        :   0
        ,   "entityTypes"   :   [
                                    {
                                        "type": "bidxBusinessSummary"
                                    }
                                ]
        ,   "scope"         :   "local"
        }

    */

    var placeBusinessThumb = function( $listItem, imageSource )
    {
        var $el = $listItem.find("[data-role='businessImage']");

        $el.empty();
        $el.append
            (
                $( "<div />", { "class": "img-cropper" })
                .append
                (
                    $( "<img />", { "src": imageSource, "class": "center-img" })
                )
            );
        $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
    };



    function _getSearchCriteria ( params ) {

        var q
        ,   sort
        ,   facetFilters
        ,   criteria
        ,   criteriaQ
        ,   paramFilter
        ,   search
        ,   sep                     = ''
        ,   filterFocusExpertise    = ''
        ,   sortQuery               = []
        ,   filters                 = []
        ,   criteriaSort            = []
        ,   entityFilters           = CONSTANTS.ENTITY_TYPES
        ;

        // 1. Search paramete
        // ex searchTerm:text:altaf
        //
        // See if its coming from the search page itself(if) or from the top(else)
        //

        // 2. Sort criteria
        // ex sort:["field":"entity", "order": asc ]
        //
        sort = bidx.utils.getValue( params, 'sort' );

        if( sort )
        {

            $.each( sort, function( sortField, sortOrder )
            {
                criteriaSort.push( {
                                            "field" : sortField
                                        ,   "order":  sortOrder
                                    });


            } );

        }

        entityFilters[0].filters = [];

        if(focusExpertise)
        {
            filterFocusExpertise    =   'expertiseNeeded:(';

            $.each( focusExpertise, function( idx, item )
            {
                filterFocusExpertise   +=   sep + item;
                sep                     =   ' OR ';
            });

            filterFocusExpertise   +=   ')';

            entityFilters[0].filters = [filterFocusExpertise]; //Uncomment when bas fixes the expetise filter
        }

        // 3. Filter
        // ex facetFilters:["0": "facet_language:fi" ]
        //

        //facetFilters = bidx.utils.getValue(facetFilters, 'facetFilters' );

        //Exclude active users

        filters.push('-ownerId:' + currentUserId); //Why do we want current user business summaries, EXCLUDE IT...

        if ( allRequest )
        {
            $.each( allRequest , function ( id, item)
            {
                filters.push('-entityId:' + item.entityId);
            });
        }

        search =    {
                        criteria    :   {
                                            "searchTerm"    :   "text:*"
                                        ,   "filters"       :   filters
                                        ,   "sort"          :   criteriaSort
                                        ,   "maxResult"     :   tempLimit
                                        ,   "offset"        :   paging.search.offset
                                        ,   "entityTypes"   :   entityFilters
                                        ,   "scope"         :   "global"
                                        }
                    };


        return search;

    }

    function _getMentorExpertise( options )
    {
        var $d              =  $.Deferred()
        ;
        bidx.api.call(
                "member.fetch"
            ,   {
                    memberId:       currentUserId
                ,   groupDomain:    bidx.common.groupDomain
                ,   success:        function( response )
                    {
                        focusExpertise =   bidx.utils.getValue(response, 'bidxMentorProfile.focusExpertise');

                        $d.resolve( focusExpertise );

                    }
                ,   error:          function( jqXhr, textStatus )
                    {
                        var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                        ,   msg     = "Something went wrong while retrieving the business summary: " + status
                        ,   error   = new Error( msg )
                        ;

                        _showError( msg );

                        $d.reject( error );
                    }
                }
            );

        return $d.promise( );
    }

    function _getMentorProposals( options )
    {

        var search
        ;

        search = _getSearchCriteria( options.params );

        bidx.api.call(
            "search.get"
        ,   {
                    groupDomain:          bidx.common.groupDomain
                ,   data:                 search.criteria
                ,   success: function( response )
                    {
                        bidx.utils.log("[searchList] retrieved results ", response );
                         _doSearchListing(
                        {
                            response    :   response
                        ,   q           :   search.q
                        ,   sort        :   search.sort
                        ,   criteria    :   search.criteria
                        ,   list        :   'matching'
                        ,   cb          : _getContactsCallback( 'match' )
                        } )
                        .done(  function(  )
                        {
                            //  execute callback if provided
                            if (options && options.cb)
                            {
                                options.cb(  );
                            }
                        } );

                    }
                    ,
                    error: function( jqXhr, textStatus )
                    {

                        var response = $.parseJSON( jqXhr.responseText)
                        ,   responseText = response && response.text ? response.text : "Status code " + jqXhr.status
                        ;

                        // 400 errors are Client errors
                        //
                        if ( jqXhr.status >= 400 && jqXhr.status < 500)
                        {
                            bidx.utils.error( "Client  error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }
                        // 500 erors are Server errors
                        //
                        if ( jqXhr.status >= 500 && jqXhr.status < 600)
                        {
                            bidx.utils.error( "Internal Server error occured", response );
                            _showError( "Something went wrong while retrieving the members relationships: " + responseText );
                        }

                    }
            }
        );
    }


    function _doSearchListing( options )
    {
        var pagerOptions    = {}
        ,   fullName
        ,   nextPageStart
        ,   criteria        = options.criteria
        ,   snippit          = $("#mentor-bp-matches").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        // ,   actionData       = $("#mentor-match-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   $list            = $element.find("." + options.list)
        ,   matchLength
        ,   emptyVal         = '*'
        ,   counter          = 1
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   externalVideoPitch
        ,   $el
        ,   countHtml
        ,   $d              =  $.Deferred()
        ;

        bidx.utils.log("[response] retrieved results $list ", $list );

        if ( response.docs && response.docs.length )
        {
            // if ( response.totalMembers > currentPage size  --> show paging)
            //
            $list.empty();

            matchLength      = response.docs.length;

            pagerOptions  =
            {
                currentPage:            ( paging.search.offset / tempLimit  + 1 ) // correct for api value which starts with 0
            ,   totalPages:             Math.ceil( response.numFound / tempLimit )
            ,   numberOfPages:          CONSTANTS.NUMBER_OF_PAGES_IN_PAGINATOR
            ,   useBootstrapTooltip:    true

            ,   itemContainerClass:     function ( type, page, current )
                {
                    return ( page === current ) ? "active" : "pointer-cursor";
                }

            ,   onPageClicked:          function( e, originalEvent, type, page )
                {
                    bidx.utils.log("Page Clicked", page);

                    // Force it to scroll to top of the page before the removal and addition of the results
                    //
                    $(document).scrollTop(0);

                    // update internal page counter for businessSummaries
                    //
                    paging.search.offset = ( page - 1 ) * tempLimit;

                    _showAllView( "loadmatch" );

                     _getMentorProposals(
                    {
                        params  :   {
                                        q           :   options.q
                                    ,   sort        :   options.sort
                                    }
                    ,   cb      :   function()
                                    {
                                        _hideView( "loadmatch" );
                                        _showAllView( "pager" );
                                        tempLimit = CONSTANTS.SEARCH_LIMIT;
                                    }
                    });
                }
            };

            tempLimit = response.docs.length;

            bidx.utils.log("pagerOptions", pagerOptions);

           if( response.numFound ) {
                countHtml = bidx.i18n.i( "matchCount", appName ).replace( /%count%/g,  response.numFound);
                $searchPagerContainer.find('.pagerTotal').empty( ).append('<h5>' + countHtml + '</h5>');
                //$searchPagerContainer.find('.pagerTotal').empty().append('<h5>' + response.numFound + ' results found</h5>');
            }

            $searchPager.bootstrapPaginator( pagerOptions );

            // create member listitems
            //

            $.each( response.docs, function( idx, item )
            {
                var logo
                ,   logoDocument
                ,   cover
                ,   coverDocument
                ,   toRemove
                ;

                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {

                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );

                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if( itemMember )
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;


                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%slogan%/g,                  itemSummary.slogan                   ? itemSummary.slogan      : emptyVal )
                                                                        .replace( /%yearSalesStarted%/g,        itemSummary.yearSalesStarted         ? itemSummary.yearSalesStarted      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName        ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               itemMember.member.bidxMeta.bidxMemberId        ? itemMember.member.bidxMeta.bidxMemberId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "receivedRequest", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxLastUpdateDateTime%/g,  itemSummary.bidxMeta.bidxLastUpdateDateTime    ? bidx.utils.parseTimestampToDateStr(itemSummary.bidxMeta.bidxLastUpdateDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%completeness%/g,            itemSummary.bidxMeta.bidxCompletionMesh   ? itemSummary.bidxMeta.bidxCompletionMesh     : emptyVal )
                                                                        .replace( /%expertiseNeeded%/g,         i18nItem.expertiseNeeded   ? i18nItem.expertiseNeeded     : emptyVal )
                                                                        .replace( /%expertiseNeededDetail%/g,   i18nItem.expertiseNeededDetail   ? i18nItem.expertiseNeededDetail     : emptyVal )
                                                                        // .replace( /%action%/g,                  actionData )
                                                                        .replace( /%document%/g,                ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;

                                                                        // execute cb function                //
                                                                        $listItem = $( listItem );

                                                                        toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                                                                        toRemove.each( function( index, el)
                                                                        {
                                                                            $(el).parent().remove();
                                                                        });

                                                                        logo = bidx.utils.getValue( i18nItem, "logo");
                                                                        logoDocument = bidx.utils.getValue( i18nItem, "logo.document");

                                                                        cover = bidx.utils.getValue( i18nItem, "cover");
                                                                        coverDocument = bidx.utils.getValue( i18nItem, "cover.document");

                                                                        if ( logo && logoDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, logoDocument );
                                                                        }
                                                                        else if ( cover && coverDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, coverDocument );
                                                                        }

                                                                        // externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                                                                        // if ( externalVideoPitch )
                                                                        // {
                                                                        //     $el         = $listItem.find("[data-role='businessImage']");
                                                                        //     _addVideoThumb( externalVideoPitch, $el );
                                                                        // }

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, currentUserId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if( counter === matchLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;

                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === matchLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            $list.empty();
            // $list.append($listEmpty);

            _hideView( "pager" );
            _hideView( "loadmatch" );
            $d.reject( );
        }

        return $d.promise( );


        // execute cb function
        //

    }

    //
    // This function is a collection of callbacks for the contact categories. It is meant to execute contact-category specific code
    //
    function _getContactsCallback( contactCategory )
    {
        // these function are executed within the _createListItems function and will therefor have the following variables at their disposal:
        //      this         = current API contact
        //      $listItem    = jQuery object of the contact category listItem
        //
        var callbacks =
        {
            ongoing:     function(  $listItem, item, entityOwnerId )
            {
                var $contactBtn         =   $listItem.find( ".btn-bidx-contact")
                ,   $stopBtn            =   $listItem.find( ".btn-bidx-stop")
                ,   hrefContact         =   $contactBtn.attr( "data-href" )
                ,   hrefStop            =   $stopBtn.attr( 'data-href' )
                ;

                /* 1 View Feedback and Add Feedback */
                $listItem.find( "[href=#commenting],[href^='#commenting/']")
                    .data( "entityid", item.entityId );

                /* 2 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      entityOwnerId );
                $contactBtn.attr( "href", hrefContact );

                /* 3 Cancel request */
                hrefStop = hrefStop
                            .replace( /%requestId%/g,      item.requestId )
                            .replace( /%entityId%/g,      item.entityId )
                          //  .replace( /%initiatorId%/g,   item.initiatorId )

                            ;

                $stopBtn.attr( "href", hrefStop );


            }
        ,   pending:    function(  $listItem, item, entityOwnerId )
            {
                var $reminderBtn    =   $listItem.find( ".btn-bidx-reminder")
                ,   $cancelBtn      =   $listItem.find( ".btn-bidx-cancel")
                ,   $contactBtn     =   $listItem.find( ".btn-bidx-contact")
                ,   hrefReminder    =   $reminderBtn.attr( "data-href" )
                ,   hrefCancel      =   $cancelBtn.attr( "data-href" )
                ,   hrefContact     =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Reminder Link */
                hrefReminder = hrefReminder.replace( /%receipientId%/g,      entityOwnerId );
                $reminderBtn.attr( "href", hrefReminder );

                /* 2 Ignore Link */
                hrefCancel = hrefCancel
                            .replace( /%requestId%/g,      item.requestId )
                            .replace( /%entityId%/g,       item.entityId )
                            ;

                $cancelBtn.attr( "href", hrefCancel );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      entityOwnerId );
                $contactBtn.attr( "href", hrefContact );

            }
        ,   ignored:    function()
            {
            }
        ,   incoming:   function(  $listItem, item )
            {
                var $acceptBtn  =   $listItem.find( ".btn-bidx-accept")
                ,   $ignoreBtn  =   $listItem.find( ".btn-bidx-ignore")
                ,   $contactBtn =   $listItem.find( ".btn-bidx-contact")
                ,   hrefAccept  =   $acceptBtn.attr( "data-href" )
                ,   hrefIgnore  =   $ignoreBtn.attr( "data-href" )
                ,   hrefContact =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Accept Link */
                hrefAccept = hrefAccept
                            .replace( /%requestId%/g,     item.requestId )
                            .replace( /%entityId%/g,      item.entityId )
                           // .replace( /%initiatorId%/g,   item.initiatorId )
                           ;

                $acceptBtn.attr( "href", hrefAccept );


                /* 2 Ignore Link */
                hrefIgnore = hrefIgnore
                            .replace( /%requestId%/g,      item.requestId )
                            .replace( /%entityId%/g,      item.entityId )
                            //.replace( /%initiatorId%/g,   item.initiatorId )
                            ;

                $ignoreBtn.attr( "href", hrefIgnore );

                /* 3 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      item.initiatorId );
                $contactBtn.attr( "href", hrefContact );

            }
        ,   renew:   function(  $listItem, item )
            {

                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
                ,   type:            'mentor'
                ,   action:          "renew"
                };

                /* 1 View  Feedback */
                $listItem.find( "[href=#commenting],[href^='#commenting/']" )
                    .data( "entityid", item.entityId )
                ;

                /* 2 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;

                /* 3 Renew Link */
                params.action = "renew";
                $listItem.find( ".btn-bidx-renew")
                    .attr( "href", "/mentor-dashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

                /* 4 Stop Link */
                params.action = "stop";
                $listItem.find( ".btn-bidx-stop")
                    .attr( "href", "/mentor-dashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

            }
        ,   ended:   function(  $listItem, item )
            {

                var params =
                {
                    requesterId:     item.id
                ,   requesteeId:     currentUserId
                ,   type:            'mentor'
                ,   action:          "delete"
                };

                /* 1 View  Feedback */
                $listItem.find( "[href=#commenting],[href^='#commenting/']" )
                    .data( "entityid", item.entityId )
                ;

                /* 2 Contact Entrepreneur */
                $listItem.find( ".btn-bidx-contact")
                    .attr( "href", "/mail/#mail/compose/recipients=" + params.requesterId )
                ;

                /* 3 Delete Link */
                params.action = "renew";
                $listItem.find( ".btn-bidx-delete")
                    .attr( "href", "/mentor-dashboard/#dashboard/confirmRequest/" +$.param( params ) )
                   // .click( _doMutateContactRequest )
                ;

            }
        ,   match:  function(  $listItem, item, userId, ownerId )
            {
                var $acceptBtn  =   $listItem.find( ".btn-bidx-send")
                ,   $contactBtn =   $listItem.find( ".btn-bidx-contact")
                ,   hrefAccept  =   $acceptBtn.attr( "data-href" )
                ,   hrefContact =   $contactBtn.attr( "data-href" )
                ;

                /* 1 Accept Link */
                hrefAccept = hrefAccept
                            .replace( /%entityId%/g,    item.entityId )
                            .replace( /%mentorId%/g,    currentUserId)
                            .replace( /%initiatorId%/g, currentUserId);

                $acceptBtn.attr( "href", hrefAccept );

                /* 2 Contact Entrepreneur */
                hrefContact = hrefContact.replace( /%receipientId%/g,      ownerId );
                $contactBtn.attr( "href", hrefContact );

            }

        };

        return callbacks[ contactCategory ];
    }


    function respondRequest( options )
    {
        var snippit          = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty       = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData       = $("#mentor-respond-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response         = options.response
        ,   incomingResponse = response.respond
        ,   $list            = $element.find("." + options.list)
        ,   emptyVal         = '*'
        ,   counter          = 1
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   externalVideoPitch
        ,   $el
        ,   $d              =  $.Deferred()
        ,   incomingLength      = incomingResponse.length
        ;

        $list.empty();

        if ( incomingResponse && incomingLength )

        {
            $.each( incomingResponse , function ( idx, item)
            {
                var logo
                ,   logoDocument
                ,   cover
                ,   coverDocument
                ,   toRemove
                ;

                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {
bidx.utils.log('itemSummary respondRequest', itemSummary);
                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if(itemMember)
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;

                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId   ? itemSummary.bidxMeta.bidxEntityId     : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId   ? itemSummary.bidxMeta.bidxEntityId     : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                    ? itemSummary.name                      : emptyVal )
                                                                        .replace( /%slogan%/g,                  itemSummary.slogan                  ? itemSummary.slogan                    : emptyVal )
                                                                        .replace( /%yearSalesStarted%/g,        itemSummary.yearSalesStarted         ? itemSummary.yearSalesStarted         : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName       ? itemMember.member.displayName         : emptyVal )
                                                                        .replace( /%creatorId%/g,               entityOwnerId                       ? entityOwnerId                         : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "receivedRequest", appName )  )
                                                                        .replace( /%statusMessage%/g,           bidx.i18n.i( "receivedRequestFrom", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry                   ? i18nItem.industry                     : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation           ? i18nItem.countryOperation             : emptyVal )
                                                                        .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator                    ? i18nItem.creator                      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService             ? i18nItem.productService               : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded            ? i18nItem.financingNeeded + ' USD'     : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness              ? i18nItem.stageBusiness                : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact                  ? i18nItem.envImpact                    : emptyVal )
                                                                        .replace( /%action%/g,                  actionData )
                                                                        .replace( /%document%/g,                ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) ) ? itemSummary.company.logo.document : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;

                                                                        // execute cb function                //
                                                                        $listItem = $( listItem );

                                                                        toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                                                                        toRemove.each( function( index, el)
                                                                        {
                                                                            $(el).parent().remove();
                                                                        });

                                                                        logo = bidx.utils.getValue( i18nItem, "logo");
                                                                        logoDocument = bidx.utils.getValue( i18nItem, "logo.document");

                                                                        cover = bidx.utils.getValue( i18nItem, "cover");
                                                                        coverDocument = bidx.utils.getValue( i18nItem, "cover.document");

                                                                        if ( logo && logoDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, logoDocument );
                                                                        }
                                                                        else if ( cover && coverDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, coverDocument );
                                                                        }

                                                                        // externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                                                                        // if ( externalVideoPitch )
                                                                        // {
                                                                        //     $el         = $listItem.find("[data-role='businessImage']");
                                                                        //     _addVideoThumb( externalVideoPitch, $el );
                                                                        // }

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, currentUserId, entityOwnerId );
                                                                        }

                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if( counter === incomingLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;
                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === incomingLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            // $list.append($listEmpty);

            $d.resolve( );
        }

        return $d.promise( );
    }



    function waitingRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-wait-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   waitingResponse = response.wait
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '*'
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   externalVideoPitch
        ,   $el
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   waitLength      = waitingResponse.length
        ;

        $list.empty();

        if ( waitingResponse && waitLength )

        {
            $.each( waitingResponse , function ( idx, item)
            {
                var logo
                ,   logoDocument
                ,   cover
                ,   coverDocument
                ,   toRemove
                ;

                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {
bidx.utils.log('itemSummary waitingRequest', itemSummary);

                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if( itemMember )
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;
                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%slogan%/g,                  itemSummary.slogan                   ? itemSummary.slogan      : emptyVal )
                                                                        .replace( /%yearSalesStarted%/g,        itemSummary.yearSalesStarted         ? itemSummary.yearSalesStarted      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               itemMember.member.bidxMeta.bidxMemberId        ? itemMember.member.bidxMeta.bidxMemberId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "mentoringRequestPending", appName )  )
                                                                        .replace( /%statusMessage%/g,           bidx.i18n.i( "pendingRequestTo", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%action%/g,              actionData )
                                                                        .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;

                                                                        // execute cb function                //
                                                                        $listItem = $( listItem );

                                                                        toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                                                                        toRemove.each( function( index, el)
                                                                        {
                                                                            $(el).parent().remove();
                                                                        });

                                                                        logo = bidx.utils.getValue( i18nItem, "logo");
                                                                        logoDocument = bidx.utils.getValue( i18nItem, "logo.document");

                                                                        cover = bidx.utils.getValue( i18nItem, "cover");
                                                                        coverDocument = bidx.utils.getValue( i18nItem, "cover.document");

                                                                        if ( logo && logoDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, logoDocument );
                                                                        }
                                                                        else if ( cover && coverDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, coverDocument );
                                                                        }

                                                                        // externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                                                                        // if ( externalVideoPitch )
                                                                        // {
                                                                        //     $el         = $listItem.find("[data-role='businessImage']");
                                                                        //     _addVideoThumb( externalVideoPitch, $el );
                                                                        // }

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, ownerId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if(counter === waitLength )
                                                                    {

                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;
                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === waitLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            // $list.append($listEmpty);

            $d.resolve( );
        }

        return $d.promise( );
    }

    function ongoingRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-ongoing-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   ongoingResponse = response.ongoing
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '*'
        ,   $listItem
        ,   listItem
        ,   itemSummary
        ,   itemMember
        ,   ownerId
        ,   i18nItem
        ,   entityOwnerId
        ,   externalVideoPitch
        ,   $el
        ,   $d              =  $.Deferred()
        ,   counter         = 1
        ,   ongoingLength   = ongoingResponse.length
        ;

        $list.empty();

        if ( ongoingResponse && ongoingLength )

        {
            $.each( ongoingResponse , function ( idx, item)
            {
                var logo
                ,   logoDocument
                ,   cover
                ,   coverDocument
                ,   toRemove
                ;

                showEntity(
                {
                    entityId    :   item.entityId
                ,   entityType  :   'bidxBusinessSummary'
                ,   callback    :   function ( itemSummary )
                                    {
bidx.utils.log('itemSummary ongoingRequest', itemSummary);

                                        if( itemSummary )
                                        {
                                            ownerId    = bidx.utils.getValue( itemSummary, "bidxMeta.bidxOwnerId" );
                                             showMemberProfile(
                                            {
                                                ownerId     :   ownerId
                                             ,  callback    :   function ( itemMember )
                                                                {
                                                                    if( itemMember )
                                                                    {
                                                                        entityOwnerId = itemMember.member.bidxMeta.bidxMemberId;
                                                                        memberData[ entityOwnerId ]   = itemMember.member.displayName;

                                                                        bidx.data.getStaticDataVal(
                                                                        {
                                                                            dataArr    : dataArr
                                                                          , item       : itemSummary
                                                                          , callback   : function (label)
                                                                                        {
                                                                                            i18nItem = label;
                                                                                        }
                                                                        });

                                                                        listItem = snippit
                                                                        .replace( /%accordion-id%/g,            itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%entityId%/g,                itemSummary.bidxMeta.bidxEntityId    ? itemSummary.bidxMeta.bidxEntityId    : emptyVal )
                                                                        .replace( /%name%/g,                    itemSummary.name                     ? itemSummary.name      : emptyVal )
                                                                        .replace( /%slogan%/g,                  itemSummary.slogan                   ? itemSummary.slogan      : emptyVal )
                                                                        .replace( /%yearSalesStarted%/g,        itemSummary.yearSalesStarted         ? itemSummary.yearSalesStarted      : emptyVal )
                                                                        .replace( /%creator%/g,                 itemMember.member.displayName       ? itemMember.member.displayName      : emptyVal )
                                                                        .replace( /%creatorId%/g,               itemMember.member.bidxMeta.bidxMemberId        ? itemMember.member.bidxMeta.bidxMemberId      : emptyVal )
                                                                        .replace( /%status%/g,                  bidx.i18n.i( "ongoing", appName )  )
                                                                        .replace( /%statusMessage%/g,           bidx.i18n.i( "mentoringActive", appName )  )
                                                                        .replace( /%industry%/g,                i18nItem.industry    ? i18nItem.industry      : emptyVal )
                                                                        .replace( /%countryOperation%/g,        i18nItem.countryOperation  ? i18nItem.countryOperation    : emptyVal )
                                                                        .replace( /%bidxCreationDateTime%/g,    itemSummary.bidxCreationDateTime    ? bidx.utils.parseISODateTime(itemSummary.bidxCreationDateTime, "date") : emptyVal )
                                                                        .replace( /%creator%/g,                 i18nItem.creator    ? i18nItem.creator      : emptyVal )
                                                                        .replace( /%productService%/g,          i18nItem.productService    ? i18nItem.productService      : emptyVal)
                                                                        .replace( /%financingNeeded%/g,         i18nItem.financingNeeded   ? i18nItem.financingNeeded + ' USD'    : emptyVal )
                                                                        .replace( /%stageBusiness%/g,           i18nItem.stageBusiness  ? i18nItem.stageBusiness    : emptyVal )
                                                                        .replace( /%envImpact%/g,               i18nItem.envImpact   ? i18nItem.envImpact     : emptyVal )
                                                                        .replace( /%action%/g,              actionData )
                                                                        .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                                                                        ;


                                                                        // execute cb function
                                                                        //
                                                                        $listItem = $( listItem );

                                                                        toRemove = $listItem.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                                                                        toRemove.each( function( index, el)
                                                                        {
                                                                            $(el).parent().remove();
                                                                        });

                                                                        logo = bidx.utils.getValue( i18nItem, "logo");
                                                                        logoDocument = bidx.utils.getValue( i18nItem, "logo.document");

                                                                        cover = bidx.utils.getValue( i18nItem, "cover");
                                                                        coverDocument = bidx.utils.getValue( i18nItem, "cover.document");

                                                                        if ( logo && logoDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, logoDocument );
                                                                        }
                                                                        else if ( cover && coverDocument )
                                                                        {
                                                                            placeBusinessThumb( $listItem, coverDocument );
                                                                        }

                                                                        // externalVideoPitch = bidx.utils.getValue( i18nItem, "externalVideoPitch");
                                                                        // if ( externalVideoPitch )
                                                                        // {
                                                                        //     $el         = $listItem.find("[data-role='businessImage']");
                                                                        //     _addVideoThumb( externalVideoPitch, $el );
                                                                        // }

                                                                        if( $.isFunction( options.cb ) )
                                                                        {
                                                                            // call Callback with current contact item as this scope and pass the current $listitem
                                                                            //
                                                                            options.cb.call( this, $listItem, item, ownerId, entityOwnerId );
                                                                        }
                                                                        //  add mail element to list
                                                                        $list.append( $listItem );
                                                                    }

                                                                    if(counter === ongoingLength )
                                                                    {
                                                                        // Update the counts, if applicable
                                                                        // window.bidx.commenting.refresh();
                                                                        $d.resolve( );
                                                                    }

                                                                     counter = counter + 1;
                                                                }
                                            } );
                                        }
                                        else
                                        {
                                            if(counter === ongoingLength )
                                            {
                                                $d.resolve( );
                                            }
                                            counter = counter + 1;
                                        }
                                    }
                } );

            });
        }
        else
        {
            // $list.append($listEmpty);

            $d.resolve( );
        }

        return $d.promise( );

    }


    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var getPreference = function(options)
    {
        var snippit       = $("#mentor-preferenceitem").html().replace(/(<!--)*(-->)*/g, "")
        ,   emptySnippet  = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   $list         = $("." + options.list)
        ,   listItem
        ,   i18nItem
        ,   emptyVal      = '*'
        ,   toRemove
        ;

        bidx.api.call(
            "entity.fetch"
          , {
            entityId          : currentMentorId
          , groupDomain       : bidx.common.groupDomain
          , async             : false
          , success           : function(item)
            {

                //clear listing
                $list.empty();

                // now format it into array of objects with value and label
                if (item)
                {

                    var dataArr = {
                                        'focusLanguage':        'language',
                                        'focusCountry':         'country',
                                        'focusIndustry':        'industry',
                                        'focusExpertise':       'mentorExpertise',
                                        'focusGender':          'gender',
                                        'focusStageBusiness':   'stageBusiness',
                                        'focusSocialImpact':    'socialImpact',
                                        'focusEnvImpact':       'envImpact',
                                  };

                    bidx.data.getStaticDataVal(
                     {
                         dataArr    : dataArr
                       , item       : item
                       , callback   : function (label) {
                                         i18nItem = label;
                                      }
                     });

                     //search for placeholders in snippit
                     listItem = snippit
                         .replace( /%focusLanguage%/g,          i18nItem.focusLanguage          ? i18nItem.focusLanguage            : emptyVal )
                         .replace( /%focusCountry%/g,           i18nItem.focusCountry           ? i18nItem.focusCountry             : emptyVal )
                         .replace( /%focusCity%/g,              i18nItem.focusCity              ? i18nItem.focusCity                : emptyVal )
                         .replace( /%focusIndustry%/g,          i18nItem.focusIndustry          ? i18nItem.focusIndustry            : emptyVal )
                         .replace( /%focusExpertise%/g,         i18nItem.focusExpertise         ? i18nItem.focusExpertise           : emptyVal )
                         .replace( /%focusGender%/g,            i18nItem.focusGender            ? i18nItem.focusGender              : emptyVal )
                         .replace( /%focusStageBusiness%/g,     i18nItem.focusStageBusiness     ? i18nItem.focusStageBusiness       : emptyVal )
                         .replace( /%focusSocialImpact%/g,      i18nItem.focusSocialImpact      ? i18nItem.focusSocialImpact        : emptyVal )
                         .replace( /%focusEnvImpact%/g,         i18nItem.focusEnvImpact         ? i18nItem.focusEnvImpact           : emptyVal )
                         .replace( /%focusPreferences%/g,       i18nItem.focusPreferences       ? i18nItem.focusPreferences         : emptyVal )
                      ;

                    $list.append( listItem );

                    toRemove = $list.find( "td:contains("+emptyVal+"), .bs-slogan:contains("+emptyVal+")" );
                    toRemove.each( function( index, el)
                    {
                        $(el).parent().remove();
                    });
                }
                else
                {
                    $list.append(emptySnippet);
                }

                //  execute callback if provided
                if (options && options.callback)
                {
                    options.callback();
                }
            }

            , error: function(jqXhr, textStatus)
            {
                var status = bidx.utils.getValue(jqXhr, "status") || textStatus;

                _showError("Something went wrong while retrieving contactlist of the member: " + status);
            }
        }
        );
    };




    function renewRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-renew-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   renewResponse   = response.relationshipType.mentor.types.active
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ;

        $list.empty();

        if ( renewResponse && renewResponse.length )
        {

            $.each( renewResponse , function ( idx, item)
            {

                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'On going'     : emptyVal )
                    .replace( /%action%/g,      actionData )
                    //.replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                    ;


                // execute cb function
                //
                $listItem = $( listItem );

                if( $.isFunction( options.cb ) )
                {
                    // call Callback with current contact item as this scope and pass the current $listitem
                    //
                    options.cb.call( this, $listItem, item );
                }


                //  add mail element to list
                $list.append( $listItem );

            });
        }
        else
        {
            // $list.append($listEmpty);
        }
    }

    function endedRequest( options )
    {
        var snippit         = $("#mentor-activities").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listEmpty      = $("#mentor-empty").html().replace(/(<!--)*(-->)*/g, "")
        ,   actionData      = $("#mentor-ended-action").html().replace(/(<!--)*(-->)*/g, "")
        ,   response        = options.response
        ,   endedResponse   = response.relationshipType.mentor.types.active
        ,   $list           = $element.find("." + options.list)
        ,   emptyVal        = '-'
        ,   $listItem
        ,   listItem
        ;

        $list.empty();

        if ( endedResponse && endedResponse.length )
        {
            // Add Default image if there is no image attached to the bs

            $.each( endedResponse , function ( idx, item)
            {

                listItem = snippit
                    .replace( /%accordion-id%/g,      item.id   ? item.id     : emptyVal )
                    .replace( /%name_s%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creator%/g,       item.name    ? item.name      : emptyVal )
                    .replace( /%creatorId%/g,       item.id    ? item.id      : emptyVal )
                    .replace( /%status%/g,      item.id   ? 'On going'     : emptyVal )
                    .replace( /%action%/g,      actionData )
                   // .replace( /%document%/g,            ( !$.isEmptyObject( itemSummary.company ) && !$.isEmptyObject( itemSummary.company.logo ) && !$.isEmptyObject( itemSummary.company.logo.document ) )   ? itemSummary.company.logo.document     : '/wp-content/themes/bidx-group-template/assets/img/mock/new-business.png' )
                    ;



                // execute cb function
                //
                $listItem = $( listItem );

                if( $.isFunction( options.cb ) )
                {
                    // call Callback with current contact item as this scope and pass the current $listitem
                    //
                    options.cb.call( this, $listItem, item );
                }


                //  add mail element to list
                $list.append( $listItem );

            });
        }
        else
        {
            // $list.append($listEmpty);
        }
    }

    function showEntity( options )
    {
        var  bidxMeta
        ;

        bidx.api.call(
            "entity.fetch"
        ,   {
                entityId:       options.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   success:        function( itemSummary )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(itemSummary) )
                    {

                        bidxMeta       = bidx.utils.getValue( itemSummary, "bidxMeta" );

                        if( bidxMeta && bidxMeta.bidxEntityType === options.entityType )
                        {

                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( itemSummary );
                            }

                        }
                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false );
                    }
                    return false;
                }
            }
        );

    }


    function showMemberProfile( options )
    {
        var bidxMeta
        ;

        bidx.api.call(
            "member.fetch"
        ,   {
                id:          options.ownerId
            ,   requesteeId: options.ownerId
            ,   groupDomain: bidx.common.groupDomain
            ,   success:        function( item )
                {
                    // now format it into array of objects with value and label

                    if ( !$.isEmptyObject(item.bidxMemberProfile) )
                    {
                        //if( item.bidxEntityType == 'bidxBusinessSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false );
                    }
                    return false;
                }
            }
        );
    }

    var _initRequestVariables = function( options )
    {
        var result  =   options.result
        ;

        wait        =   [];
        respond     =   [];
        ongoing     =   [];
        allRequest  =   [];

        $.each( result , function ( idx, item)
            {
                if ( ( item.status      === 'requested' ) &&
                     ( item.mentorId    === currentUserId ) &&
                     ( item.initiatorId === currentUserId ) )
                {
                    wait.push( item );
                    allRequest.push (item);
                }
                else if( ( item.status      === 'requested' ) &&
                         ( item.mentorId    === currentUserId ) &&
                         ( item.initiatorId !== currentUserId ) )
                {
                    respond.push( item );
                    allRequest.push (item);
                }
                else if( ( item.status     === 'accepted')  &&
                         ( item.mentorId    === currentUserId )
                 )
                {
                    ongoing.push ( item );
                    allRequest.push (item);
                }
        });
    };

    // function that retrieves group members returned in an array of key/value objects
    // NOTE: @19-8-2013 currently the search function is used. This needs to be revised when API exposes new member functions
    //
    var _getMentorRequest = function(options)
    {


        // now format it into array of objects with value and label
        //
        var     result      = options.result
        ,       response    =  {}
        ;

        if ( result  )
        {
          //  _showView("load");
          //  _showView("loadcontact", true);
         //   _showView("loadpreference", true );

            response    =   {
                                wait    : wait
                            ,   respond : respond
                            ,   ongoing : ongoing
                            };


           respondRequest(
            {
                response : response,
                list     : "respond",
                cb       : _getContactsCallback( 'incoming' )

            } )
           .done( function(  )
            {
                _hideView("loadrespond");

            } );

            waitingRequest(
            {
                response : response,
                list     : "wait",
                cb       : _getContactsCallback( 'pending' )

            } )
            .done( function(  )
            {
                _hideView("loadwait");

            } );

            ongoingRequest(
            {
                response : response,
                list     : "ongoing",
                cb       : _getContactsCallback( 'ongoing' )

            } )
            .done( function(  )
            {
                _hideView("loadongoing");

            } );



            /*
            renewRequest(
            {
                response : response,
                list     : "renew",
                cb       : _getContactsCallback( 'renew' )

            } );
            endedRequest(
            {
                response : response,
                list     : "ended",
                cb       : _getContactsCallback( 'ended' )

            } );*/

        }

        //  execute callback if provided
        /*if (options && options.callback)
        {
            options.callback( result );
        }*/

    return ;
    };



    //  ################################## MODAL #####################################  \\

    //  show modal view with optionally and ID to be appended to the views buttons
    function _showModal( options )
    {
        var href
        ,   replacedModal
        ,   action
        ,   params = {};

        if(options.params)
        {
            params = options.params;
            action = options.params.action;
        }

        bidx.utils.log("[dashboard] show modal", options );

        $modal        = $modals.filter( bidx.utils.getViewName ( options.view, "modal" ) ).find( ".bidx-modal");
        replacedModal = $modal.html()
                        .replace( /%action%/g, action );

        $modal.html(  replacedModal );

        $modal.find( ".btn-primary[href]" ).each( function()
        {
            var $this = $( this );

            href = $this.attr( "data-href" ) + $.param( params ) ;

            $this.attr( "href", href );
        } );

        $modal.modal( {} );

        if( options.onHide )
        {
            //  to prevent duplicate attachments bind event only onces
            $modal.on( 'hidden.bs.modal', options.onHide );
        }
        if( options.onShow )
        {

            $modal.on( 'show.bs.modal' ,options.onShow );
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

    function _showAllView( view )
    {
        var $view = $views.filter( bidx.utils.getViewName( view ) ).show();
    }

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    };

    var _showHideView = function(view, hideview)
    {

        $views.filter(bidx.utils.getViewName(hideview)).hide();
        var $view = $views.filter(bidx.utils.getViewName(view)).show();

    };

    // display generic error view with msg provided
    //
    function _showError( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" , true);
    }

    function _menuActivateWithTitle ( menuItem,pageTitle) {
        //Remove active class from li and add active class to current menu
        $element.find(".limenu").removeClass('active').filter(menuItem).addClass('active');
        /*Empty page title and add currentpage title
        $element.find(".pagetitle").empty().append(pageTitle);*/

    }

    function _addVideoThumb( url, element )
    {
        // This may fail if the URL is not actually a URL, or an unsupported video URL.
        var matches     = url.match(/(http|https):\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be))\/(video\/|embed\/|watch\?v=)?([A-Za-z0-9._%-]*)(\&\S+)?/)
        ,   provider    = bidx.utils.getValue(matches, "3")
        ,   id          = bidx.utils.getValue(matches, "6")
        ,   $el         = element
        ;

        if ( provider === "vimeo.com" )
        {
            var videoUrl = "http://vimeo.com/api/v2/video/" + id + ".json?callback=?";
            $.getJSON( videoUrl, function(data)
                {
                    if ( data )
                    {
                        $el.find( ".icons-rounded" ).remove();
                        $el.append( $( "<div />", { "class": "img-cropper" } ) );
                        $el.find( ".img-cropper" ).append( $( "<img />", { "src": data[0].thumbnail_large } ) );
                        $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
                    }
                }
            );
        }
        else if ( provider === "youtube.com" )
        {
            $el.find( ".icons-rounded" ).remove();
            $el.append( $( "<div />", { "class": "img-cropper" } ) );
            $el.find( ".img-cropper" ).append( $( "<img />", { "src": "http://img.youtube.com/vi/"+ id +"/0.jpg" } ) );
            $el.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }
        else
        {
            bidx.utils.log('_addVideoThumb:: ', 'No matches' + matches );
        }
    }

    // ROUTER


    //var navigate = function( requestedState, section, id )
    var navigate = function(options)
    {
        bidx.utils.log("mentor mentoring routing options", options);
        var state
        ;

        state  = options.state;

        switch (state)
        {
            case "load" :

                _showView("load");
                break;

             case "help" :
                 _menuActivateWithTitle(".Help","My mentor Helppage");
                _showView("help");
                break;

            case "mentor": // Called from common-mentordashboard mentor navigate
                 _closeModal(
                {
                    unbindHide: true
                } );

                _showView( 'match', true );
                _showView("loadmatch", true );

                _showView( 'respond', true );
                _showView( 'loadrespond', true);

                _showView( 'wait', true );
                _showView('loadwait', true);

                _showView( 'ongoing', true );
                _showView("loadongoing", true );

                /* owView( 'renew', true );
                _showView("loadrenew", true );

                _showView("ended", true );
                _showView("loadended", true ); */
                _initRequestVariables(
                {
                    result  :  options.result
                });

                _getMentorExpertise( )
                    .always( function()
                    {
                        _getMentorRequest(
                        {
                            result  :  options.result

                        } );
                    })
                    .fail( function()
                    {
                        _hideView( "loadmatch" );
                    })
                    .done( function( expertiseNeeded )
                    {
                        _getMentorProposals(
                            {
                                params: { }
                            ,   cb     : function( )
                                        {
                                             _hideView("loadmatch");
                                             _showAllView( "pager" );
                                        }
                            }) ;
                    })
                ;

                getPreference(
                {
                list: "preference"
                ,   view: "preference"
                ,   callback: function()
                    {
                        _showView("preference", true);
                    }
                } );

                break;

         }
    };

    //expose
    var dashboard =
            {
                navigate:       navigate
              , $element:       $mainElement
              , memberData:     memberData
            };


    if (!window.bidx)
    {
        window.bidx = {};
    }

    window.bidx.mentorDashboard = dashboard;

    //Initialize Handlers
    //_initHandlers();


    if ($("body.bidx-mentor-dashboard").length && !bidx.utils.getValue(window, "location.hash").length)
    {

        document.location.hash = "#mentoring/mentor";
    }


}(jQuery));

