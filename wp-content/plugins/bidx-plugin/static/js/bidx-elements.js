// globalchecks.js is a miscelaneous home for 'state full' utilities
//
( function( $ )
{
    "use strict";

    var bidx                = window.bidx || {}
    ,   bidxConfig          = window.bidxConfig || {}
    ;




    var placeBusinessThumb = function( item )
    {
        var thumb
        ,   logo
        ,   logoDocument
        ,   cover
        ,   coverDocument
        ;

        logo = bidx.utils.getValue( item, "logo");
        logoDocument = bidx.utils.getValue( item, "logo.document");

        cover = bidx.utils.getValue( item, "cover");
        coverDocument = bidx.utils.getValue( item, "cover.document");


        if ( logo && logoDocument )
        {
            thumb = $( "<div />", { "class": "img-cropper" } )
                        .append
                        (
                            $( "<img />", { "src": logoDocument, "class": "center-img" })
                        );
        }
        else if ( cover && coverDocument )
        {
            thumb = $( "<div />", { "class": "img-cropper" } )
                        .append
                        (
                            $( "<img />", { "src": coverDocument, "class": "center-img" })
                        );
        }
        else
        {
            thumb = $( "<div />", { "class": "icons-rounded" } )
                        .append
                        (
                            $( "<i />", { "class": "fa fa-suitcase text-primary-light" } )
                        );
        }

        thumb.find( "img" ).fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );

        return thumb;
    };

    var _getStaticDataVal = function ( data )
    {
        var dataArr
        ,   i18nItem
        ;

        dataArr =   {       'industry'             : 'industry'
                        ,   'countryOperation'     : 'country'
                        ,   'stageBusiness'        : 'stageBusiness'
                        ,   'productService'       : 'productService'
                        ,   'envImpact'            : 'envImpact'
                        ,   'consumerType'         : 'consumerType'
                        ,   'investmentType'       : 'investmentType'
                        ,   'investorType'         : 'investorType'
                        ,   'summaryRequestStatus' : 'summaryRequestStatus'
                        ,   'legalFormBusiness'    : 'legalForm'
                    };

        bidx.data.getStaticDataVal(
        {
            dataArr    : dataArr
          , item       : data
          , callback   : function (label) {
                            i18nItem = label;
                         }
        });
    };

    var constructBusinessCardView = function ( item )
    {
        var card;

        _getStaticDataVal( item );

        card =
            $( "<div />", { "class": "cardView", "data-bsid": item.bidxMeta.bidxEntityId } )
                .append
                (
                    $( "<div />", { "class": "cardHeader hide-overflow" } )
                    .append
                    (
                        $( "<div />", { "class": "info-cell pull-left" + (item.bidxMeta.bidxCompletionMesh ? "" : " hide"), "html": "Completed" + ": " + item.bidxMeta.bidxCompletionMesh + "%" } )
                    )
                    .append
                    (
                        $( "<div />", { "class": "info-cell pull-left", "html": "Finance Needed" + ": " + item.financingNeeded + " USD" } )
                    )
                    .append
                    (
                        $( "<a />", { "href": "/businesssummary/" + item.bidxMeta.bidxEntityId, "class": "btn btn-primary btn-xs pull-right info-action main-margin-half", "html": "View Business" } )
                    )
                )
                .append
                (
                    $( "<div />", { "class": "cardContent main-padding" } )
                    .append
                    (
                        $( "<div />", { "class": "cardTop" } )
                        .append
                        (
                            $( "<div />", { "class": "row" } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-3" } )
                                .append
                                (
                                    $( "<a />", { "href": "/businesssummary/" + item.bidxMeta.bidxEntityId, "class": "pull-left main-margin-half", "data-role": "businessImage" } )
                                    .append
                                    (
                                        placeBusinessThumb( item )
                                    )
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-9" } )
                                .append
                                (
                                    $( "<h3 />", { "class": "top-0", "html": item.name } )
                                )
                                .append
                                (
                                    $( "<h4 />" )
                                    .append
                                    (
                                        $( "<span />", { "class": "bs-slogan", "html": item.slogan } )
                                    )
                                )
                                .append
                                (
                                    $( "<table />", { "class": "table table-condensed table-bottom-border" } )
                                    .append
                                    (
                                        $( "<tbody />" )
                                        .append
                                        (
                                            $( "<tr />" )
                                            .append
                                            (
                                                $( "<td />", { "html": "Business stage" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.stageBusiness })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />" )
                                            .append
                                            (
                                                $( "<td />", { "html": "Year sales started" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.yearSalesStarted })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.industry ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": "Industry" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.industry })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.countryOperation ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": "Country of business" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.countryOperation })
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
                .append
                (
                    $( "<div />", { "class": "cardFooter" } )
                )
            ;

        return card;
    };

    var constructCompanyCardView = function ( item )
    {
        var card;

        _getStaticDataVal( item );

        card =
            $( "<div />", { "class": "cardView", "data-compid": item.bidxMeta.bidxEntityId } )
                .append
                (
                    $( "<div />", { "class": "cardHeader hide-overflow" } )
                    .append
                    (
                        $( "<div />", { "class": "info-cell pull-left" + (item.dateCompanyEstab ? "" : " hide"), "html": "Date of registration" + ": " + item.dateCompanyEstab } )
                    )
                    .append
                    (
                        $( "<a />", { "href": "/company/" + item.bidxMeta.bidxEntityId, "class": "btn btn-primary btn-xs pull-right info-action main-margin-half", "html": "View Company" } )
                    )
                )
                .append
                (
                    $( "<div />", { "class": "cardContent main-padding" } )
                    .append
                    (
                        $( "<div />", { "class": "cardTop" } )
                        .append
                        (
                            $( "<div />", { "class": "row" } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-3" } )
                                .append
                                (
                                    $( "<a />", { "href": "/company/" + item.bidxMeta.bidxEntityId, "class": "pull-left main-margin-half", "data-role": "businessImage" } )
                                    .append
                                    (
                                        placeBusinessThumb( item )
                                    )
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-9" } )
                                .append
                                (
                                    $( "<h3 />", { "class": "top-0", "html": item.name } )
                                )
                                .append
                                (
                                    $( "<p />", { "class": (item.website ? "" : " hide") })
                                    .append
                                    (
                                        $( "<a />", { "href": item.website, "target": "_blank", "html": item.website } )
                                    )
                                )
                                .append
                                (
                                    $( "<table />", { "class": "table table-condensed table-bottom-border" } )
                                    .append
                                    (
                                        $( "<tbody />" )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.registrationNumber ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": "Registration number" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.registrationNumber })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.fiscalNumber ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": "Fiscal number" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.fiscalNumber })
                                            )
                                        )
                                        .append
                                        (
                                            $( "<tr />", { "class": (item.legalFormBusiness ? "" : " hide") })
                                            .append
                                            (
                                                $( "<td />", { "html": "Legal form of business" })
                                            )
                                            .append
                                            (
                                                $( "<td />", { "html": item.legalFormBusiness })
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            ;

        return card;
    };

    var connectActionBox = function (  request )
    {
        bidx.utils.log( " request ", request);

        var $mentorItem
        ,   $memberLink
        ,   $actions
        ,   $bsElement
        //,   canInteract             = relChecks.isThereRelationship ? true : false
        ,   $bpElement              = $("div.container #myProfile")
        ,   $mentorActivities       = $( ".js-connect" )
        ,   currentUserId           = bidx.common.getCurrentUserId()
        ,   isTheInitiator          = ( request.initiatorId === currentUserId ) ? true : false
        ,   statusText
        ;


        request.status = 'accepted';
        if ( $bpElement.length )
        {
            $bsElement = $bpElement.find( "#tab-member" );
        }

        //Pending on Business Summary page
        /*if ( $mpElement.length )
        {
            $bsElement = $mpElement.find( '*[data-bsid="'+ relChecks.businessId +'"]' );
        }*/

        $memberLink = $( "<a />", { "href": "/member/" + request.id, "html": request.name } );

        $mentorItem =
            $( "<div />", { "class": "alert alert-sm hide-overflow bg-" + bidx.common.capitalizeFirstLetter( request.status ), "data-requestId": request.id } )
                .append
                (
                    $( "<div />", { "class": "pull-left" } )
                )
                .append
                (
                    $( "<div />", { "class": "pull-right mentor-actions" } )
                )
            ;

        $bsElement.last().append( $mentorItem );


        // Construct message and action buttons
        switch ( request.status )
        {
            case "accepted":

                    $actions = $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "stop", "html": bidx.i18n.i( "btnStopConnect" ) } );

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $( "<span />", { "html": " " + bidx.i18n.i( "youAreInContact" )  } )
                        )
                    ;
            break;

            case "requested":

                if ( isTheInitiator )
                {
                    $actions =
                        $( "<span />" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "cancel", "html": bidx.i18n.i( "btnCancelRequest" ) } )
                            )
                            .append( "&nbsp;" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-warning", "data-btn": "remind", "html": bidx.i18n.i( "btnRemind" ) } )
                            )
                    ;

                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $( "<span />", { "html": bidx.i18n.i( "youAskedMentor" ) + " " } )
                        )
                        .append
                        (
                            $memberLink
                        )
                    ;
                }
                else
                {
                    $actions =
                        $( "<span />" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "accept", "html": bidx.i18n.i( "btnAccept" ) } )
                            )
                            .append( "&nbsp;" )
                            .append
                            (
                                $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "reject", "html": bidx.i18n.i( "btnReject" ) } )
                            )
                    ;
                    $bsElement.find( ".pull-left" ).last()
                        .append
                        (
                            $memberLink
                        )
                        .append
                        (
                            $( "<span />", { "html":  " " + bidx.i18n.i( "wantsToMentor" ) } )
                        )
                    ;
                }

            break;

            case "rejected":

            break;
        }

        $bsElement.find( ".mentor-actions" ).last().append( $actions );

    };


    var constructActionBox = function ( data, item )
    {
        var box
        ,   $memberLink
        ,   $actions
        ,   $message
        ;

        $memberLink = $( "<a />", { "href": "/member/" + data.user.id, "html": data.user.displayName } );

        if ( data.status === "pending" )
        {
            $message = $( "<span />", { "html": " " + bidx.i18n.i( "wantsFullAccess" )  } );
            $actions =
                $( "<span />" )
                    .append
                    (
                        $( "<button />", { "class": "btn btn-xs btn-success", "data-btn": "accept", "html": bidx.i18n.i( "btnAccept" ) } )
                    )
                    .append( "&nbsp;" )
                    .append
                    (
                        $( "<button />", { "class": "btn btn-xs btn-danger", "data-btn": "reject", "html": bidx.i18n.i( "btnReject" ) } )
                    )
            ;
        }

        if ( data.status === "granted" )
        {
            $message = $( "<span />", { "html": " " + bidx.i18n.i( "hasFullAccess" )  } );
        }

        box =
            $( "<div />", { "class": "alert alert-sm hide-overflow bg-" + bidx.common.capitalizeFirstLetter( data.status ), "data-investorid": data.user.id } )
                .append
                (
                    $( "<div />", { "class": "pull-left" } )
                        .append
                        (
                            $memberLink
                        )
                        .append
                        (
                            $message
                        )
                )
                .append
                (
                    $( "<div />", { "class": "pull-right investor-actions" } )
                        .append
                        (
                            $actions
                        )
                )
            ;

        return box;
    };


    // Expose
    //
    if ( !window.bidx )
    {
        window.bidx = bidx;
    }

    bidx.construct =
    {
        constructBusinessCardView:          constructBusinessCardView
    ,   constructCompanyCardView:           constructCompanyCardView
    ,   constructActionBox:                 constructActionBox
    ,   connectActionBox:                   connectActionBox
    };

} ( jQuery ));