/* global bidx */
;( function( $ )
{
    "use strict";

    var competitionVars             = window.__bidxCompetition || {}
    ,   applicationObj
    ,   actorsObj
    ,   competitionBidxMeta
    ,   table

    ,   $element                    = $( "#competitionSummary" )
    ,   $snippets                   = $element.find( ".snippets" )

    ,   $views                      = $element.find( ".view" )

    ,   $editControls               = $element.find( ".editControls" )

    ,   $industry                   = $element.find( "[name='competitionIndustry']" )

    ,   $regional                   = $element.find( "[name='competitionCountry']" )
    ,   $visibilityDropdown         = $element.find( "[name='visibility']" )

    ,   $gender                     = $element.find( "[name='competitionGender']" )
    ,   $envImpact                  = $element.find( "[name='competitionEnvImpact']" )
    ,   $socialImpact               = $element.find( "[name='competitionSocialImpact']" )

    ,   $btnSave
    ,   $btnCancel
    ,   $btnFullAccessRequest       = $element.find( ".bidxRequestFullAccess")
    ,   $bidxAccessRequestPending   = $element.find( ".bidxAccessRequestPending")
    ,   $btnParticipate             = $element.find( ".btn-participate")
    ,   $btnCreateBp                = $element.find( ".btn-business")
    ,   $btnApply                   = $element.find( ".btn-apply")

    ,   $appliedCount               = $element.find( "#appliedcount" )
    ,   $submittedCount             = $element.find( "#submittedcount" )

    ,   $btnPhase                   = $element.find( ".btn-phase" )
    ,   $btnEndPhase                = $element.find( ".endPhase" )
    ,   $btnJudgePhase              = $element.find( ".judgePhase" )
    ,   $successLabel               = $element.find('.successLabel')

    ,   $roles                      = $element.find( "[name='roles']" )
    ,   $roleButton                 = $element.find(".js-btn-add-role" )


    ,   $controlsForEdit            = $editControls.find( ".viewEdit" )
    ,   $controlsForError           = $editControls.find( ".viewError" )

    ,   $ratingWrapper              = $element.find( ".rating-wrapper" )
    ,   $ratingAverage              = $ratingWrapper.find( ".rating-average" )
    ,   $ratingVote                 = $ratingWrapper.find( ".rating-vote" )
    ,   $ratingTotalVoters          = $ratingWrapper.find( ".rating-total-voters-count" )
    ,   $ratingUserLabel            = $ratingWrapper.find( ".rating-user-label" )
    ,   $ratingScore                = $ratingWrapper.find( ".rating-score" )
    ,   $ratingNoScore              = $ratingWrapper.find( ".rating-no-score" )
    ,   $raty                       = $ratingWrapper.find( ".raty" )

    ,   $fakecrop                   = $views.find( ".bidx-profilepicture img" )

    ,   loggedInMemberRoles         = bidx.utils.getValue( bidxConfig, "session.roles" )

    ,   loggedInMemberId            = bidx.common.getCurrentUserId()

    ,   $businessSummary            = $element.find( "[name='businessSummary']" )

    ,   $competitionEndTimeDisplay  = $element.find( ".endDateTimeDisplay" )

    ,   listDropdownBp              = bidx.utils.getValue( bidxConfig, "session.wp.entities.bidxBusinessSummary" )

    ,   active                      = []
    ,   wait                        = []
    ,   respond                     = []
    ,   rejectByEntrepreneur        = []
    ,   rejectByMentor              = []
    ,   timeouts                    = []
    ,   actorArr                    = {}
    ,   canParticipate              = {}
    ,   updateActorsList            = {
                                            'judges':       []
                                        ,   'assessors':    []
                                        ,   'administrators':     []
                                      }
    ,   actorIdList                 = {
                                            'judges':       []
                                        ,   'assessors':    []
                                        ,   'administrators':     []
                                      }

    ,   roleType                    = ['assessors', 'judges', 'administrators']

    ,   forms                       =
        {
            generalOverview:
            {
                $el:                    $element.find( "#frmCompetition-GeneralOverview" )
            }
        /*,   management:
            {
                $el:                    $element.find( "#frmCompetition-Management" )
            }*/
        ,   aboutParticipants:
            {
                $el:                    $element.find( "#frmCompetition-AboutParticipants" )
            }
        }


        // Cover Image
        //
    ,   $coverImage                         = $element.find( ".competitionCover" )
    ,   $coverImageBtn                      = $coverImage.find( "[href$='#coverImage']" )
    ,   $coverRemoveBtn                     = $coverImage.find( "[href$='#coverRemove']" )
    ,   $coverImageModal                    = $coverImage.find( ".coverModal" )
    ,   $coverImageContainer                = $coverImage.find( ".coverImageContainer" )

        // competitionLogo
        //
    ,   $bscompetitionLogo                             = $element.find( ".bscompetitionLogo" )
    ,   $bscompetitionLogoBtn                          = $bscompetitionLogo.find( "[href$='#addcompetitionLogo']" )
    ,   $bscompetitionLogoModal                        = $bscompetitionLogo.find( ".addcompetitionLogoImage" )
    ,   $competitionLogoContainer                      = $bscompetitionLogo.find( ".competitionLogoContainer" )



        // Mentoring Details
        //
    ,   $toggles                            = $element.find( ".toggle" ).hide()

        // Buttons under to control the add company form

        // Documents component
        //
    ,   $documents                          = $element.find( "#competitionSummaryCollapse-Documents" )
    ,   $btnAddFiles                        = $documents.find( "a[href$='addFiles']" )
    ,   $addFiles                           = $documents.find( ".addFiles" )
    ,   $attachmentContainer                = $documents.find( ".attachmentContainer" )

        // Edit document modal
        //
    ,   $editDocument                       = $element.find( ".js-edit-document" )

        // Industy Sectors
        //
    ,   $industrySectors                    = $element.find( ".industrySectors" )

    ,   visibilityArr                       = ['public','closed','invited']

    ,   currentUserBusinessSummaryList      = []
    ,   competitionSummary
    ,   competitionSummaryId

    ,   companies

    ,   state
    ,   currentView
    ,   snippets                    = {}

    ,   appName                     = "competition"


    ,   $searchPagerContainer   = $element.find( "#incomingRequests" ).find( ".pagerContainer")
    ,   $searchPager            = $searchPagerContainer.find( ".pager" )

    ,   paging                      =
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
            SEARCH_LIMIT:   100
        ,   OFFSET:         0
        }

    ;
    // Form fields
    //
    var fields =
    {
        "generalOverview":
        {
            "_root":
            [
                "name"
            ,   "description"
            ,   "startDateTime"
            ,   "endDateTime"
            ]
        }
    /*,   "management":
        {
            "_root":
            [
                "visibility"
            ]
        }
    */
    ,   "aboutParticipants":
        {
            "_root":
            [
                "competitionIndustry"
            ,   "competitionCountry"
            ,   "competitionSocialImpact"
            ,   "competitionEnvImpact"
            ,   "competitionGender"
            ,   "competitionComplementaryCriteria"
            ]
        }
    };

    function _setupApplyButton( )
    {
        var entityId
        ,   status
        ;
       /* Partcipate button Button Click */
        _assignBtnAction(
        {
            $btnAction: $btnApply
        ,   action:     'apply'
        ,   success:    function( response )
                        {
                            entityId    = response.data.id;
                            status      = response.data.status;

                            _appendCardValues({
                                                list:           'viewOwnCard'
                                            ,   entityId:       entityId
                                            ,   applicationObj: [response.data]
                            });

                            _hideView('apply');
                            $successLabel.empty().i18nText('SUCCESS_APPLIED', appName);
                            $appliedCount.text( parseInt($appliedCount.html(), 10) + 1 );
                            _showAllView('participate');
                            _showAllView('success');

                            canParticipate  =   _.omit( canParticipate, entityId.toString( ));

                            //If more business plan then popup the current  entity id and display others in dropdown
                            if( !$.isEmptyObject( canParticipate ) )
                            {
                                $businessSummary.find("option[value='" + entityId + "']").remove( );
                                $businessSummary.trigger( "chosen:updated" );
                                $btnParticipate.removeClass('hide');
                            }
                            else
                            {
                                $btnParticipate.addClass('hide');
                            }
                        }
        });
    }

    function _loadBpSummaries()
    {
        var bpLength
        ,   isEntrepreneur
        ;
        if( $businessSummary )
        {
            _showAllView( "participate" ); // Display participate Bar

            $businessSummary.chosen({
                                        placeholder_text_single : bidx.i18n.i( "msgWaitForSave" )
                                    ,   width                   : "100%"
                                    ,   disable_search_threshold : 10
                                    });

            bpLength    = _.size(canParticipate); //Have to add the condition because when user is mentor and viewing normal profile then we dont want to populate dropdown

            if( bpLength )
            {
                $btnParticipate.removeClass( 'hide');

                _getBusinessPlans( )
                .done( function( listBpItems )
                {
                    $businessSummary.append( listBpItems );
                    $businessSummary.trigger( "chosen:updated" );
                    $btnParticipate.removeClass( 'disabled');
                } );
            }
            else
            {
                isEntrepreneur = bidx.utils.getValue( bidxConfig.session, "wp.entities.bidxEntrepreneurProfile" );

                if(isEntrepreneur)
                {
                    $btnCreateBp.removeClass( 'hide');
                }
            }

            $btnParticipate.click( function( e )
            {
                e.preventDefault();
                _showAllView('apply');
                _hideView( 'participate');

            });
        }
    }

     // Perform an API call to join the group
    //
    var _sendToNextPhase = function( options )
    {
        var data    = options.data;
         bidx.api.call(
            "competition.nextPhase"
        ,   {
                competitionId:  competitionSummaryId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           data
            ,   success:        function( response )
                {
                    // Do we have edit perms?
                    //
                    bidx.utils.log( "bidx::requestAccess::save::success", response );

                    //cb ( response );
                    if (options && options.success)
                    {
                        options.success( response.data );
                    }

                }
                , error: function(jqXhr, textStatus)
                {
                    var errorTxt;

                    if( jqXhr.responseJSON.code )
                    {
                        errorTxt    =   jqXhr.responseJSON.text;

                        if(jqXhr.responseJSON.code === 'operationNotAllowed')
                        {
                            errorTxt    =   bidx.i18n.i( 'errorToNextPhase', appName );
                        }
                    }
                    else
                    {
                        errorTxt    =   "Problem parsing error response from phase update";
                    }

                    if (options && options.error)
                    {
                        options.error( errorTxt ) ;
                    }
                }
            }
        );
    };


    var _loadCompetitionVars = function ( competitionVars )
    {
        if ( !$.isEmptyObject( competitionVars) )
        {
            applicationObj              = bidx.utils.getValue( competitionVars, 'applications');

            actorsObj                   = bidx.utils.getValue( competitionVars, 'actors');

            competitionBidxMeta         = bidx.utils.getValue( competitionVars, 'bidxMeta');

        }
    };

    // Setup function for doing work that should only be done once
    //
    function _oneTimeSetup( )
    {
         var option
         ,   visibilityArrItems  =   [ ]
         ;

         _loadCompetitionVars( competitionVars );

         //Display Winners if round is ended.
        if( competitionBidxMeta.bidxCompetitionRoundStatus === 'JUDGING')
        {
            _displayWinners('finalist');
        }

        //Display Winners if round is ended.
        if( competitionBidxMeta.bidxCompetitionRoundStatus === 'ENDED')
        {
            _displayWinners('winner');
        }

        _setupApplyButton();
        _snippets();
        _setupValidation();
        _coverImage();
        _documents();
        _loadMyApplications( ); // Load My applications now
        _loadActors();
        _initApplicationsView( );
        _loadBpSummaries( );



        // On any changes, how little doesn't matter, notify that we have a pending change
        // But no need to track the changes when doing a member data load
        //
        $element.bind( "change", function()
        {
            if ( currentView === "edit" )
            {
                bidx.common.addAppWithPendingChanges( appName );
            }
        } );



        // Confinmation for ending the competition phase
        //
        $btnPhase.click( function( e )
        {
            var data
            ,   $this = $(this)
            ,   phase = $this.data('roundstatus')
            ;

            e.preventDefault();

            data    =   {
                            "round": 1
                        ,   "roundStatus": $this.data('roundstatus')
                        };

           // data.roundStatus = 'test';

            bidx.common._notify(
            {
                text:       bidx.i18n.i( "PHASE_" + phase, appName )
            ,   modal:      true
            ,   type:       "confirm"
            ,   layout:     "center"
            ,   buttons:
                [
                    {
                        addClass:       "btn btn-primary"
                    ,   text:           bidx.i18n.i("btnOk")
                    ,   onClick: function( $noty )
                        {
                            $noty.close();

                            bidx.common.notifyInformationModal( bidx.i18n.i('msgWaitforPhaseUpdate', appName));

                            _sendToNextPhase({
                                                data :  data
                                            ,   success: function( competitionVars )
                                                        {
                                                            _loadCompetitionVars( competitionVars );

                                                            //location.reload();


                                                            if( competitionBidxMeta.bidxCompetitionRoundStatus === 'JUDGING')
                                                            {
                                                                _displayWinners( 'finalist');
                                                            }

                                                            //Display Winners if round is ended.
                                                            if( competitionBidxMeta.bidxCompetitionRoundStatus === 'ENDED')
                                                            {
                                                                _displayWinners( 'winner');
                                                            }

                                                            _initApplicationsView();

                                                            bidx.common.closeNotifications();
                                                            bidx.common.notifyCustomSuccess( bidx.i18n.i('msgSuccessforPhaseUpdate', appName));


                                                        }
                                            ,   error:  function ( err )
                                                        {
                                                            bidx.common.closeNotifications();
                                                            bidx.common.notifyError( err );
                                                            /*if ( err )
                                                           {
                                                                alert( err );
                                                            }*/
                                                        }
                                            });


                        }
                    }
                ,   {
                        addClass:       "btn btn-danger"
                    ,   text:           bidx.i18n.i("btnCancel")
                    ,   onClick: function( $noty )
                        {
                            $noty.close();
                        }
                    }
                ]
            } );
        } );

        $regional.bidx_chosen(
        {
            dataKey:            "country"
        });

        $envImpact.bidx_chosen(
        {
            dataKey:            "envImpact"
        });

        $socialImpact.bidx_chosen(
        {
            dataKey:            "socialImpact"
        });

        // Run the industry widget on the selector
        //
        $industrySectors.industries();
        // Collect snippets from the DOM
        // sort the array, if not empty

        $.each( visibilityArr, function( idx, listVisibility )
        {
            option = $( "<option/>",
            {
                value: listVisibility
            } );

            option.text( bidx.i18n.i(listVisibility ,appName) );

            visibilityArrItems.push( option );
        } );

        // add the options to the select
        $visibilityDropdown.append( visibilityArrItems );

        // init bidx_chosen plugin
        $visibilityDropdown.bidx_chosen();

        function _snippets()
        {
            // Grab the snippets from the DOM
            //

            snippets.$attachment            = $snippets.children( ".attachmentItem"    ).remove();

            // Did we find all of the snippets?
            // Not really app logic, but just a protection / early warning system
            //
            $.each( snippets, function( prop, $snippet )
            {
                if ( !$snippet.length )
                {
                    bidx.utils.error( "[competitionSummary] Snippet not found! ", prop );
                }
            } );
        }

        // Setup initial form validation
        //
        function _setupValidation()
        {
            // General Overview
            //
            forms.generalOverview.$el.validate(
            {
                ignore:         ""
            ,   debug:          false
            ,   rules:
                {
                    name:
                    {
                        required:               true
                    ,   maxlength:              60
                    }
                ,   description:
                    {
                        required:               true
                    ,   maxlength:              900
                    }
                ,   startdate:
                    {
                        // TODO: datepicker validation
                    }
                ,   enddate:
                    {
                       // TODO: datepicker validation

                    }
                }
            ,   messages:
                {

                }
            ,   submitHandler:          function( e )
                {
                    _doSave();
                }
            } );

            // About your business
            //
            forms.aboutParticipants.$el.validate(
            {
                debug:          false
            ,   ignore:         ""
            ,   rules:
                {
                    competitionIndustry:
                    {
                        // required:      true
                    }
                ,   regional:
                    {
                        // required:      true
                    }
                }
            ,   messages:
                {

                }
            ,   submitHandler:          function( e )
                {
                    _doSave();
                }
            } );
        }

        function _coverImage()
        {
            $coverImageContainer.cover();

            $coverImageBtn.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal container
                //
                $( "#media" ).appendTo( $coverImageModal.find( ".modal-body" ) );

                var $selectBtn = $coverImageModal.find(".btnSelectFile")
                ,   $cancelBtn = $coverImageModal.find(".btnCancelSelectFile");

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            false
                ,   showEditBtn:            false
                ,   onlyImages:             true
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[Cover Image] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $coverImageModal.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[Cover Image] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( file )
                        {
                            bidx.utils.log( "[Cover Image] selected cover", file );

                            $coverImageContainer.data( "bidxData", file );

                            $coverImageModal.modal( "hide" );

                            if ( $coverImageContainer.find( "img" ).length )
                            {
                                $coverImageContainer.cover( "updateCover", file );
                            }
                            else
                            {
                                $coverImageContainer.cover( "constructHtml", file );
                            }

                            $coverImageContainer.find( "[href$='#coverRemove']" ).removeClass( "hide" );
                        }
                    }
                } );

                $coverImageModal.modal();
            } );

            $coverRemoveBtn.click( function( e )
            {
                e.preventDefault();

                $coverImageContainer.find( "img" ).hide();
                $coverImageContainer.find( "[href$='#coverRemove']" ).addClass( "hide" );
            } );
        }


        // competitionLogo
        //
        $bscompetitionLogoBtn.click( function( e )
        {
            e.preventDefault();

            // Make sure the media app is within our modal container
            //
            $( "#media" ).appendTo( $bscompetitionLogoModal.find( ".modal-body" ) );

            var $selectBtn = $bscompetitionLogoModal.find( ".btnSelectFile" )
            ,   $cancelBtn = $bscompetitionLogoModal.find( ".btnCancelSelectFile" )
            ;

            // Navigate the media app into list mode for selecting files
            //
            bidx.media.navigate(
            {
                requestedState:         "list"
            ,   slaveApp:               true
            ,   selectFile:             true
            ,   multiSelect:            false
            ,   showEditBtn:            false
            ,   onlyImages:             true
            ,   btnSelect:              $selectBtn
            ,   btnCancel:              $cancelBtn
            ,   callbacks:
                {
                    ready:                  function( state )
                    {
                        bidx.utils.log( "[competitionLogo] ready in state", state );
                    }

                ,   cancel:                 function()
                    {
                        // Stop selecting files, back to previous stage
                        //
                        $bscompetitionLogoModal.modal('hide');
                    }

                ,   success:                function( file )
                    {
                        bidx.utils.log( "[competitionLogo] uploaded", file );

                        // NOOP.. the parent app is not interested in when the file is uploaded
                        // only when it is attached / selected
                    }

                ,   select:               function( file )
                    {
                        bidx.utils.log( "[competitionLogo] selected profile picture", file );

                        $competitionLogoContainer.data( "bidxData", file );
                        $competitionLogoContainer.html( $( "<img />", { "src": file.document, "data-filebusinessPlanEntityId": file.fileUpload } ));

                        $bscompetitionLogoModal.modal( "hide" );
                    }
                }
            } );

            $bscompetitionLogoModal.modal();
        } );

        function _getMemberforActorRole( params)
        {
            var criteria
            ,   $d      = $.Deferred()
            ,   matches = []
            ,   q
            ,   criteriaQ
            ;

            q = bidx.utils.getValue( params, 'q' );
            criteriaQ = (q) ? q : '*';

            bidx.api.call(
                "search.found"
            ,   {
                    groupDomain: bidx.common.groupDomain
                ,   data: {
                                "searchTerm"    :   criteriaQ + "*"
                            ,   "sort"          :   []
                            ,   "maxResult"     :   CONSTANTS.SEARCH_LIMIT
                            ,   "offset"        :   CONSTANTS.OFFSET
                            ,   "entityType"    :   ["bdxmember"]
                            ,   "scope"         :   "LOCAL"
                    }
                ,   success: function( response )
                    {
                        bidx.utils.log( "[Member List for Criteria] ", params.q,  response );

                        $.each( response.found, function( id, item )
                        {
                            matches.push(
                            {
                                value: item.properties.name
                            ,   id:    item.properties.userId
                            });

                            actorArr[item.properties.userId] = 
                            {
                                userId:     item.properties.userId
                            ,   name:       item.properties.name
                            //,   actorType:  ''                                
                            }; // Store at global array for later use
                        });

                        $d.resolve( matches  );
                    }

                ,   error: function( jqXhr, textStatus )
                    {

                       var status  = bidx.utils.getValue( jqXhr, "status" ) || textStatus
                        ,   msg     = "Something went wrong while retrieving the companies: " + status
                        ,   error   = new Error( msg )
                        ;

                        //_showError( msg );

                        $d.reject( error );

                    }
                }
            );

            return $d;
        }

        // TEMP - REPLACE THIS WITH THE REAL DATA
        //
        var substringMatcher = function(strs)
        {
            return function findMatches(q, cb)
            {
                var params  =   {
                                    q:  q
                                }
                                ;
               _getMemberforActorRole( params )
               .done( function( matches )
                {
                    bidx.utils.log('matches', matches);
                    cb ( matches );
                } )
                ;
            };
        };

        $('.typeahead').typeahead(
        {
            hint: true
        ,   highlight: true
        ,   minLength: 3
        }
    ,
        {
          name: 'states',
          displayKey: 'value',
          source: substringMatcher( )

        }

        ).removeClass( "disabled" ).removeAttr( "disabled" );

        $('.typeahead').on('typeahead:selected', onSelected);


        function onSelected($e, data)
        {
          $roles.data('id', data.id);
          $roles.addClass('disabled').attr('disabled','disabled');
          $roleButton.removeClass('disabled');
        }

        function _loadActors( )
        {
            var data
            ,   actorData
            ,   actorExist
            ;
            if( !$.isEmptyObject ( actorsObj ) )
            {

                $.each( actorsObj, function( actorType, actorList )
                {

                    $.each( actorList, function( idx, actorData )
                    {
                        if ( !$.isEmptyObject ( actorData ) )
                        {
                            actorExist  =   ( !$.isEmptyObject ( actorArr[ actorData.userId ] ) ) ? actorArr[ actorData.userId ]: false;

                            if( !actorExist )
                            {
                                data    =   {
                                                userId:     actorData.userId
                                            ,   name:       actorData.userDisplayName
                                            };

                                actorArr [ actorData.userId ]  =  data;

                            }

                            actorArr [ actorData.userId ][actorType]  =  actorType; // To enable buttons infront of each row , used in appendActorCard

                            updateActorsList[actorType].push({
                                                                "userId": actorData.userId
                                                             } );
                            actorIdList[actorType].push({
                                                                "actorId": actorData.actorId
                                                            ,   "userDisplayName": actorData.userDisplayName
                                                             } );
                        }
                    });
                });

                $.each( actorArr, function( actorId, actorData )
                {
                    _appendActorCard( actorId ); // continue
                });
            }

            _showAllView('actors');
        }

        function _appendActorCard ( actorId )
        {
            var listItem
            ,   $listItem
            ,   $btnActor
            ,   item
            ,   data
            ,   emptyVal            = ''
            ,   $list               = $element.find( ".showActors" )
            ,   snippet             = $("#actors-snippet").html().replace(/(<!--)*(-->)*/g, "")
            ,   $listError          = $("#error-card").html().replace(/(<!--)*(-->)*/g, "")
            ,   $ratingWrapper

            ,   $raty
            ;

            data                    = bidx.utils.getValue(actorArr, actorId.toString());

            if ( !$.isEmptyObject(data) )
            {

                listItem    =   snippet
                                .replace( /%userId%/g,    data.userId )
                                .replace( /%memberName%/g,  data.name )
                                ;

                $listItem   =   $(listItem);

                $.each( roleType, function( idx, role )
                {
                    if ( !$.isEmptyObject ( data[ role ] ) )
                    {
                        $btnActor   =   $listItem.find( '.btn-' + role);

                        $btnActor.addClass ('active');
                    }
                } );

                /* Assign Next Action According to Role */
                _addActorAction(
                {
                    $listItem: $listItem
                ,   callback:   function( response )
                                {


                                }
                });

            }
            else
            {
                $listItem = $listError;
            }

            $list.append( $listItem );

        }

        $roleButton.click ( function ( e )
        {
            var  $this = $(this)
            ,    actorId             = $roles.data('id')
            ;

            $roles.removeClass('disabled').removeAttr("disabled");
            $roles.val('');
            _appendActorCard( actorId );



        } );

        function _addActorAction( options  )
        {
            var $listItem       =   options.$listItem
            ,   $btnActorAction =   $listItem.find('.btn-actor-action')
            ;

            $btnActorAction.click( function( e )
            {
                var updateActorsArr
                ,   params      =   options.params
                ,   $this       =   $( this )
                ,   role        =   $(this).data('role')
                ,   userId      =   $(this).data('userid')
                ,   data        =   {}
                ,   orgText     =   $this.text()
                ,   userObj     =   {
                                        "userId": userId
                                    }
                ;
                if( role === 'all') // If  close button
                {
                    $.each( roleType, function( idx, roleLbl )
                    {
                        updateActorsArr                 = updateActorsList [ roleLbl ] ;
                        updateActorsList [ roleLbl ]    =  _.without(updateActorsArr, _.findWhere(updateActorsArr, userObj));
                    });
                }
                else
                {
                    if($this.hasClass('active'))
                    {
                        updateActorsArr             = updateActorsList [ role ] ;
                        updateActorsList [ role ]   =  _.without(updateActorsArr, _.findWhere(updateActorsArr, userObj));
                    }
                    else
                    {
                        updateActorsList [ role ].push( userObj );
                    }
                    $this.i18nText('loadingLbl');

                }

                bidx.api.call(
                    "competition.assignActorToCompetition"
                ,   {
                        competitionId:  competitionSummaryId
                    ,   groupDomain:    bidx.common.groupDomain
                    ,   data:           updateActorsList
                    ,   success:        function( response )
                        {

                            $this.text(orgText);

                            if( role === 'all') // If  close button
                            {
                                $element.find('.row-' + userId).hide("slow", function(){ $(this).remove(); });
                            }
                            else
                            {
                                if($this.hasClass ( 'active' ) )
                                {
                                    $this.removeClass('active');
                                }
                                else
                                {
                                    $this.addClass('active');
                                }
                            }

                            $.each( roleType, function( idx, role )
                            {
                                if ( !$.isEmptyObject ( data[ role ] ) )
                                {
                                    actorIdList[role]   =  _.pick(data[role], 'actorId', 'userDisplayName' ) ;
                                }
                            } );
                            bidx.utils.log( actorIdList);
                        }
                        , error: function(jqXhr, textStatus)
                        {
                            var errorTxt
                            ;

                            $this.text(orgText);

                            if( jqXhr.responseJSON.code )
                            {
                                errorTxt    =   jqXhr.responseJSON.code + ' ' + jqXhr.responseJSON.text;
                                bidx.common.notifyError( errorTxt );
                            }
                            else
                            {
                                bidx.utils.error( "Problem parsing error response from phase update" );
                            }
                        }
                    }
                );
            });
        }


        //
        // TEMP - REPLACE THIS WITH THE REAL DATA



        // Setup the Documents component
        //
        function _documents()
        {
            $( window.bidx ).bind( "updated.media", function( e, data )
            {
                var businessPlanEntityId = bidx.utils.getValue( data, "bidxMeta.bidxbusinessPlanEntityId" );

                if ( !businessPlanEntityId )
                {
                    bidx.utils.error( "No businessPlanEntityId found on updated media event!", data );
                    return;
                }

                $attachmentContainer.find( "[data-businessPlanEntityId='" + businessPlanEntityId + "']" ).each( function()
                {
                    var $attachment     = $( this )
                    ,   attachment      = $attachment.data( "bidxData" )
                    ;

                    $.each( [ "purpose", "documentType" ], function( i, prop )
                    {
                        attachment[ prop ] = data[ prop ];
                    } );

                    _updateAttachment( $attachment, attachment );
                } );
            } );

            // Clicking the add files button will load the media library
            //
            $btnAddFiles.click( function( e )
            {
                e.preventDefault();

                // Make sure the media app is within our modal
                //
                $( "#media" ).appendTo( $addFiles.find( ".modal-body" ) );

                var $selectBtn = $documents.find(".btnSelectFile");
                var $cancelBtn = $documents.find(".btnCancelSelectFile");

                // Navigate the media app into list mode for selecting files
                //
                bidx.media.reset();
                bidx.media.navigate(
                {
                    requestedState:         "list"
                ,   slaveApp:               true
                ,   selectFile:             true
                ,   multiSelect:            true
                ,   showEditBtn:            false
                ,   onlyImages:             false
                ,   btnSelect:              $selectBtn
                ,   btnCancel:              $cancelBtn
                ,   callbacks:
                    {
                        ready:                  function( state )
                        {
                            bidx.utils.log( "[documents] ready in state", state );
                        }

                    ,   cancel:                 function()
                        {
                            // Stop selecting files, back to previous stage
                            //
                            $addFiles.modal('hide');
                        }

                    ,   success:                function( file )
                        {
                            bidx.utils.log( "[documents] uploaded", file );

                            // NOOP.. the parent app is not interested in when the file is uploaded
                            // only when it is attached / selected
                        }

                    ,   select:               function( files )
                        {
                            bidx.utils.log( "[documents] select", files );

                            // Attach the file to the entity
                            // By adding it to the reflowrower we can pick it up as soon
                            // as the entity is created or saved. The reflowrower keeps a list of
                            // added items
                            //

                            if ( files )
                            {
                                $.each( files, function( idx, file )
                                {
                                    _addAttachment( file );
                                } );
                            }

                            $addFiles.modal('hide');
                        }
                    }
                } );

                $addFiles.modal();
            } );

            // Setup an 'edit' button per document
            //
            $attachmentContainer.delegate( "a[href$=#editDocument]", "click", function( e )
            {
                e.preventDefault();

                var $btn        = $( this )
                ,   $item       = $btn.closest( ".attachmentItem" )
                ,   doc         = $item.data( "bidxData" )
                ;

                _editDocument( doc );
            } );

            // Initiate the reflowrower for the attachment list
            //
            $attachmentContainer.reflowrower(
            {
                itemsPerRow:        2
            ,   itemClass:          "attachmentItem"
            } );

        }

        if ( $fakecrop )
        {
            $fakecrop.fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} );
        }

        }

function _addReview( review )
{
    var reviewItem                  =   ''
    ,   snippet                     =   $("#recommendation-display-snippet").html().replace(/(<!--)*(-->)*/g, "")
    ,   reviewRating                =   bidx.utils.getValue( review, 'reviewRating' )
    ,   competitionRecommendation   =   bidx.utils.getValue( review, 'competitionRecommendation' )
    ,   comment                     =   bidx.utils.getValue( review, 'comment' )
    ;

    reviewItem  +=   snippet
                    .replace ( /%id%/g, review.id )
                    .replace ( /%recommendationTitle%/g,        bidx.i18n.i( 'assessorRecommendation', appName) )
                    .replace( /%userDisplayName%/g,             review.userDisplayName )
                    .replace( /%reviewRating%/g,                (reviewRating) ? reviewRating : 0)
                    .replace( /%competitionRecommendation%/g,   (competitionRecommendation) ? bidx.i18n.i(competitionRecommendation, appName) : bidx.i18n.i( 'statusPending' ) )
                    .replace( /%comment%/g,                     (comment) ? comment : bidx.i18n.i( 'commentPending', appName ) )
                    .replace( /%warningClass%/g,                (!competitionRecommendation) ? 'bg-warning' : '')
                    ;

    return reviewItem;
}

function _displayRecommendations( reviews )
{
    var reviewRating
    ,   competitionRecommendation
    ,   displayReview
    ,   assessorReviews
    ,   assessorReviewItem   =   ''
    ,   judgeReviewItem     =   ''
    ,   judgeReviews
    ,   comment
    ;

    assessorReviews     =   _.where(  reviews
                            ,   {
                                    competitionRoundStatus:   "ASSESSMENT"
                                }  );

    judgeReviews        =   _.where(  reviews
                            ,   {
                                    competitionRoundStatus:   "JUDGING"
                                }  );

    $.each( assessorReviews, function( idx, assessorReview )
    {
        assessorReviewItem   +=  _addReview( assessorReview );
    });

    $.each( judgeReviews, function( idx, judgeReview )
    {
        judgeReviewItem     +=  _addReview( judgeReview);
    });

    displayReview   =   {
                            'assessor':     assessorReviewItem
                        ,   'judge':        judgeReviewItem
                        };

    return displayReview;

}


function currentUserRecommendationForCurrentPhase( response )
{

    var competitionRoundStatus
    ,   isCompetitionManager
    ,   currentPhaseReview
    ,   competitionRecommendation
    ,   isHavingAssessorReview
    ,   isHavingJudgeReview
    ,   reviews                     =   response.reviews
    ,   status                      =   response.status
    ,   recommendation              =   bidx.i18n.i( 'statusPending' )
    ,   reviewRating                =   0
    ,   loggedInCompetitionRoles    =   competitionBidxMeta.bidxCompetitionRoles
    ;

    isCompetitionManager        =   _.contains( loggedInCompetitionRoles, 'COMPETITION_ADMIN');


    isHavingAssessorReview      =   _.findWhere(  reviews
                                            ,   {
                                                    role:   "COMPETITION_ASSESSOR"
                                                ,   userId: loggedInMemberId
                                                }  );

    isHavingJudgeReview         =   _.findWhere(  reviews
                                            ,   {
                                                    role:   "COMPETITION_JUDGE"
                                                ,   userId: loggedInMemberId
                                                }  );


    switch(true)
    {
        case isCompetitionManager :

            //If status is rejected or its ended directly shows status in recommendation then
            if( status === 'REJECTED' || competitionBidxMeta.bidxCompetitionRoundStatus === 'ENDED')
            {
                recommendation = bidx.i18n.i( status,  appName );

            }
            else
            {
                //If round is ended then display Judging recommendatin for admin
                competitionRoundStatus      =   competitionBidxMeta.bidxCompetitionRoundStatus;

                currentPhaseReview          =   _.findWhere(  reviews
                                                ,   {
                                                        role:                       "COMPETITION_ADMIN"
                                                    ,   competitionRoundStatus:     competitionRoundStatus
                                                    }  );

                competitionRecommendation   =   bidx.utils.getValue( currentPhaseReview, 'competitionRecommendation');

                if( competitionRecommendation )
                {
                    recommendation  = bidx.i18n.i( currentPhaseReview.competitionRecommendation, appName );
                    reviewRating    = bidx.utils.getValue(currentPhaseReview, 'reviewRating');
                }
            }

        break;

        case !_.isEmpty ( isHavingJudgeReview ):

            competitionRecommendation   =   bidx.utils.getValue( isHavingJudgeReview, 'competitionRecommendation');

            if( competitionRecommendation )
            {
                recommendation  = bidx.i18n.i( isHavingJudgeReview.competitionRecommendation,  appName );
                reviewRating    = bidx.utils.getValue(isHavingJudgeReview, 'reviewRating');
            }
            else
            {
                competitionRecommendation   =   bidx.utils.getValue( isHavingAssessorReview, 'competitionRecommendation');

                if( competitionRecommendation )
                {
                    recommendation  = bidx.i18n.i( isHavingAssessorReview.competitionRecommendation,  appName );
                    reviewRating    = bidx.utils.getValue(  isHavingAssessorReview, 'reviewRating' );
                }
            }

        break;

        case !_.isEmpty ( isHavingAssessorReview ):

            competitionRecommendation   =   bidx.utils.getValue( isHavingAssessorReview, 'competitionRecommendation');

            if( competitionRecommendation )
            {
                recommendation  = bidx.i18n.i( isHavingAssessorReview.competitionRecommendation,  appName );
                reviewRating    = bidx.utils.getValue( isHavingAssessorReview, 'reviewRating' );
            }

        break;
    }

    return  {
                recommendation:  recommendation
            ,   reviewRating:    reviewRating
            };
}


/* Formatting function for row details - modify as you need */
function format ( data, row )
{
    var snippet
    ,   assessorReviewItem           =   ''
    ,   $wrapperAssessor
    ,   $wrapperJudge
    ,   $listError                  =   $("#error-card").html().replace(/(<!--)*(-->)*/g, "")
    ,   isGroupAdmin                =   _.contains( loggedInMemberRoles, 'GroupAdmin')
    ,   loggedInCompetitionRoles    =   competitionBidxMeta.bidxCompetitionRoles
    ,   status                      =   data.status
    ,   reviews                     =   data.reviews
    ,   $listItem                   =   ''
    ,   isHavingAssessorReview
    ,   isHavingJudgeReview
    ,   bidxMeta
    ,   listItem
    ,   ratingClass
    ,   reviewRating
    ,   regularExp
    ,   displayReview
    ,   displayAssessorReview
    ,   displayJudgeReview
    ,   isAdminAssessorReview
    ,   isAdminJudgeReview
    ,   reviewObj
    ,   isCompetitionManager
    ;

    isCompetitionManager        =   _.contains( loggedInCompetitionRoles, 'COMPETITION_ADMIN');


    isHavingAssessorReview      =   _.findWhere(  reviews
                                                ,   {
                                                        role:   "COMPETITION_ASSESSOR"
                                                    ,   userId: loggedInMemberId
                                                    }  );

    isHavingJudgeReview         =   _.findWhere(  reviews
                                                ,   {
                                                        role:   "COMPETITION_JUDGE"
                                                    ,   userId: loggedInMemberId
                                                    }  );


    displayReview               =   _displayRecommendations( reviews );

    switch(true)
    {
        case isCompetitionManager :

            isAdminAssessorReview   =   _.findWhere(  reviews
                                                    ,   {
                                                            role:                   "COMPETITION_ADMIN"
                                                        ,   competitionRoundStatus: "ASSESSMENT"
                                                        }  );

            isAdminJudgeReview      =   _.findWhere(  reviews
                                                    ,   {
                                                            role:                   "COMPETITION_ADMIN"
                                                        ,   competitionRoundStatus: "JUDGING"
                                                        }  );

            snippet                 =   $("#admin-card-snippet").html().replace(/(<!--)*(-->)*/g, "");
            ratingClass             =   "%bidx" + status + "RatingAverage%"; //Start from here
            regularExp              =   new RegExp ( ratingClass, "g" ) ;

            listItem                =   snippet
                                        .replace( /%entityId%/g,                data.entityId )
                                        .replace( /%assessorsRecommendation%/g, displayReview.assessor )
                                        .replace( /%judgesRecommendation%/g,   displayReview.judge )
                                        ;

            $listItem               =   $(listItem);


            /* Assign Next Action According to Role */
            reviewObj   =   {
                                isAdminAssessorReview:  isAdminAssessorReview
                            ,   isAdminJudgeReview:     isAdminJudgeReview
                            };

            _assignManagerActions( $listItem,  data, row, reviewObj);

            if( displayReview.assessor !== '' )
            {
                /* Dislay Assessor Review if it exists */
                $wrapperAssessor        =   $listItem.find('.wrapper-recommend-assessor-' + data.entityId);
                $wrapperAssessor.removeClass('hide');
            }

            if( displayReview.judge !== '' )
            {
                /* Dislay Judge Review if it exists */
                $wrapperJudge           =   $listItem.find('.wrapper-recommend-judge-' + data.entityId);
                $wrapperJudge.removeClass('hide');
            }

            break;

        case !_.isEmpty ( isHavingJudgeReview ):

            snippet         =   $("#judge-card-snippet").html().replace(/(<!--)*(-->)*/g, "");
            ratingClass     =   '/%bidx' + status + 'RatingAverage%/g';
            reviewRating    =   bidx.utils.getValue( isHavingJudgeReview, 'reviewRating' );
            listItem        =   snippet
                                .replace( /%entityId%/g,                data.entityId )
                                .replace( ratingClass,                  ( reviewRating )  ? reviewRating : 0)
                                .replace( /%assessorsRecommendation%/g, displayReview.assessor)
                                .replace( /%judgesRecommendation%/g,    displayReview.judge )
                                ;

            $listItem       =   $(listItem);

            if( displayReview.assessor !== '' ) // && competitionBidxMeta.bidxCompetitionRoundStatus !== 'ASSESSMENT', in case you only want to display it other than assessment phases
            {
                /* Dislay Assessor Review if it exists */
                $wrapperAssessor        =   $listItem.find('.wrapper-recommend-assessor-' + data.entityId);
                $wrapperAssessor.removeClass('hide');
            }

            if( displayReview.judge !== '' ) // && competitionBidxMeta.bidxCompetitionRoundStatus !== 'JUDGING', in case you only want to display it other than Judging phases
            {
                /* Dislay Judge Review if it exists */
                $wrapperJudge           =   $listItem.find('.wrapper-recommend-judge-' + data.entityId);
                $wrapperJudge.removeClass('hide');
            }

            if( competitionBidxMeta.bidxCompetitionRoundStatus === 'JUDGING' )
            {

                /* Assign Next Action According to Role */
                data.role       =   'COMPETITION_JUDGE';
                data.action     =   'winner';

                _assignAssessorJudgeActions( {
                                                $listItem:  $listItem
                                            ,   review:     isHavingJudgeReview
                                            ,   data:       data
                                            ,   row:        row
                                            });
            }

            break;

        case !_.isEmpty ( isHavingAssessorReview ):


            snippet     =   $("#assessor-card-snippet").html().replace(/(<!--)*(-->)*/g, "");
            ratingClass     =   '/%bidx' + status + 'RatingAverage%/g';
            reviewRating    =   bidx.utils.getValue(isHavingAssessorReview, 'reviewRating' );

            listItem    =   snippet
                            .replace( /%entityId%/g,                data.entityId )
                            .replace( /%assessorsRecommendation%/g, displayReview.assessor )
                            .replace( ratingClass,                  ( reviewRating )  ? reviewRating : 0)
                            ;

            $listItem   =   $(listItem);

            if( displayReview.assessor !== '' ) //  && competitionBidxMeta.bidxCompetitionRoundStatus !== 'ASSESSMENT', in case you only want to display it other than assessment phases
            {
                /* Dislay Assessor Review if it exists */
                $wrapperAssessor        =   $listItem.find('.wrapper-recommend-assessor-' + data.entityId);
                $wrapperAssessor.removeClass('hide');
            }

            if( competitionBidxMeta.bidxCompetitionRoundStatus === 'ASSESSMENT' )
            {

                /* Assign Next Action According to Role */
                data.role      =   'COMPETITION_ASSESSOR';
                data.action    =   'finalist';

                _assignAssessorJudgeActions( {
                                                $listItem:  $listItem
                                            ,   review:     isHavingAssessorReview
                                            ,   data:       data
                                            ,   row:        row
                                        });
            }

        break;

    }

    return $listItem;

}

function _displayButtonsAccordingToPhases(  )
{
    var     roundStatus  =   bidx.utils.getValue( competitionBidxMeta, 'bidxCompetitionRoundStatus' )
    ;

    switch (roundStatus)
    {
        case 'ASSESSMENT':

        $btnJudgePhase.removeClass('hide');
        $btnEndPhase.addClass('hide');
        break;

        case 'JUDGING':

        $btnEndPhase.removeClass('hide');
        $btnJudgePhase.addClass('hide');
        break;

    }

    return;
}

function _initApplicationsView( )
{
    var data        =   []
    ,   displayRows
    ,   bidxMeta
    ,   business
    ,   entrepreneur
    ,   rating
    ,   reviews
    ,   entrepreneurData
    ,   businessData
    ,   entityId
    ,   ownerId
    ,   roleReview
    ,   destroy               =  false
    ,   competitionRoles      =  competitionBidxMeta.bidxCompetitionRoles
    ,   isCompetitionManager  = _.contains( competitionRoles, 'COMPETITION_ADMIN')
    ;

    $.each( applicationObj, function( idx, response )
    {
        reviews             =   response.reviews;

        if( reviews.length || isCompetitionManager )
        {
                entityId            =   bidx.utils.getValue( response, 'entityId');
                bidxMeta            =   bidx.utils.getValue( response, 'bidxMeta');
                business            =   bidx.utils.getValue( bidxMeta, 'bidxEntityDisplayName');
                entrepreneur        =   bidx.utils.getValue( bidxMeta, 'bidxOwnerDisplayName');
                ownerId             =   bidx.utils.getValue( bidxMeta, 'bidxOwnerId');
                rating              =   bidx.utils.getValue( bidxMeta, 'bidxRatingAverage');

                businessData        = '<a href="' + bidx.common.url('businesssummary') + entityId +  '" target="_blank">' + business + '</a>';
                entrepreneurData    = '<a href="' + bidx.common.url('member') + ownerId + '" target="_blank">' + entrepreneur + '</a>';

                roleReview          =  currentUserRecommendationForCurrentPhase( response );

                displayRows         =   {
                                            business:       businessData
                                        ,   entrepreneur:   entrepreneurData
                                        ,   rating:         (roleReview.reviewRating)? roleReview.reviewRating : 0
                                        ,   recommendation: roleReview.recommendation
                                        ,   state:          bidx.i18n.i(response.status, appName)
                                        ,   status:         response.status
                                        ,   entityId:       entityId
                                        ,   reviews:        response.reviews

                                        };

                data.push( displayRows );
        }
    });



    if( data.length )
    {
        _displayButtonsAccordingToPhases( );

        if ( $.fn.dataTable.isDataTable( '.viewApplications' ) )
        {
            destroy     =   true;
            //$('.viewApplications tbody').empty();
        }

        table = $('.viewApplications').DataTable(
        {
            destroy:            destroy  // "bDestroy": true
        ,   bPaginate:          true
        ,   aLengthMenu:        [
                                    [10, 25, 50, 100, -1],
                                    [10, 25, 50, 100, bidx.i18n.i("paginationAll") ]
                                ]
        ,   data:               data
        ,   columns:            [
                                    {
                                        "className":      'details-control',
                                        "orderable":      false,
                                        "data":           null,
                                        "defaultContent": '<i class="fa fa-plus-square-o"></i>'
                                    },
                                    {   "data": "business"      },
                                    {   "data": "entrepreneur"  },
                                    {   "data": "rating"        },
                                    {   "data": "recommendation"},
                                    {   "data": "state"         }
                                ]
        ,   order:              [
                                    [1, 'asc']
                                ]
        ,   fnRowCallback:      function( nRow, aData, iDisplayIndex )
                                {
                                    nRow.classList.add( aData.status );
                                    return nRow;
                                }
        ,   language:           {
                                    url: '/wp-content/plugins/bidx-plugin/lang/vendor/datatables/' + bidx.common.getCurrentLanguage() + '.json'
                                }
        ,   fnInitComplete:     function(oSettings, json)
                                {
                                    $( ".dataTables_length select" ).bidx_chosen();
                                    $('.viewApplications').removeClass( 'hide' );
                                }
        } );

        if ( !destroy )
        {
            // Add event listener for opening and closing details
            $('.viewApplications tbody').on('click', 'td.details-control', function ( )
            {
                var formatHtml
                ,   tr          =   $(this).closest('tr')
                ,   row         =   table.row( tr )
                ;

                if ( row.child.isShown() )
                {
                    // This row is already open - close it
                    row.child.hide();

                    tr.removeClass('shown');

                    tr.next().removeClass('extrapanel');

                    $(this).find('.fa').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
                }
                else
                {

                    if( tr.hasClass ("data-visible") )
                    {
                        row.child.show();
                    }
                    else
                    {
                        formatHtml  =   format(row.data(), row );

                        row.child(  formatHtml ).show( );

                        tr.addClass("data-visible");
                    }

                    tr.addClass('shown');

                    if ( tr.hasClass( "withdrawn" ) )
                    {
                        tr.next().addClass('extrapanel withdrawn');
                    }
                    else
                    {
                        tr.next().addClass('extrapanel');
                    }

                    $(this).find('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');

                    tr.next().find( ".selectAssessors" ).bidx_chosen();
                }
            } );
        }
    }
}




var _handleToggleChange = function( show, group )
{
    var fn = show ? "fadeIn" : "hide";

    $toggles.filter( ".toggle-" + group )[ fn ]();
};




// Open the media library in edit mode for a specific file
//
function _editDocument( doc )
{
    var $modal = $editDocument;

    // Make sure the media app is within our modal
    //
    $( "#media" ).appendTo( $modal.find( ".modal-body" ) );

    // Navigate the media app into list mode for selecting files
    //
    bidx.media.reset();
    bidx.media.navigate(
    {
        requestedState:         "edit"
    ,   onlyEdit:               true
    ,   slaveApp:               true
    ,   selectFile:             true
    ,   multiSelect:            true
    ,   onlyImages:             false
    ,   showEditBtn:            false
    ,   showDeleteBtn:          false
    ,   showDownloadBtn:        false

    ,   id:                     doc.bidxMeta.bidxbusinessPlanEntityId

    ,   callbacks:
        {
            ready:                  function( state )
            {
                bidx.utils.log( "[documents] ready in state", state );
            }

        ,   cancel:                 function()
            {
                // Stop selecting files, back to previous stage
                //
                $modal.modal('hide');
            }

        ,   success:                function( file )
            {
                bidx.utils.log( "[documents] updated", file );



                $modal.modal('hide');
            }
        }
    } );

    $modal.modal();
}

// Add an attachment to the screen
//
function _addAttachment( attachment )
{
    if ( attachment === null )
    {
        bidx.util.warn( "competitionSummary::_addAttachmentToScreen: attachment is null!" );
        return;
    }

    var $attachment         = snippets.$attachment.clone();

    _updateAttachment( $attachment, attachment );

    $attachmentContainer.reflowrower( "addItem", $attachment );
}

function _updateAttachment( $attachment, attachment )
{
    var createdDateTime     = bidx.utils.parseTimestampToDateStr( attachment.uploadedDateTime )
    ,   $documentLink       = $attachment.find( ".documentLink" )
    ,   $documentImage      = $attachment.find( ".documentImage" )
    ,   $documentDefault    = $attachment.find( ".attachmentDefault" )
    ,   $documentMissing    = $attachment.find( ".attachmentMissing" )
    ,   deletedDoc          = false
    ;

    if ( !attachment.bidxMeta.bidxUploadId )
    {
        bidx.utils.warn( "competitionSummary::_updateAttachment: attachment has been deleted!" );
        deletedDoc = true;
    }

    // Store the data so we can later use it to merge the updated data in
    //
    $attachment.data( "bidxData", attachment );

    // Set the upload ID on the DOM so we can find this later when we get an update from the media library
    //
    $attachment.attr( "data-businessPlanEntityId", bidx.utils.getValue( attachment, "fileUpload" ));

    $attachment.find( ".documentName"       ).text( attachment.documentName );
    $attachment.find( ".createdDateTime"    ).text( createdDateTime );
    $attachment.find( ".purpose"            ).text( attachment.purpose );
    $attachment.find( ".documentType"       ).text( bidx.data.i( attachment.documentType, "documentType" ) );

    if ( attachment.mimeType && attachment.mimeType.match( /^image/ ) )
    {
        $documentDefault.remove();
        $documentMissing.remove();

        $documentImage
            .attr( "src", attachment.document )
            .fakecrop( {fill: true, wrapperWidth: 90, wrapperHeight: 90} )
        ;
    }
    else
    {
        $documentImage.remove();

        // Check if the file has been removed
        //
        if ( deletedDoc )
        {
            $attachment.find( ".documentName" ).text( bidx.i18n.i( "docDeleted" ) ).addClass( "text-danger" );
            $documentLink.remove();
        }
        else
        {
            $documentMissing.remove();
        }
    }

    $documentLink.attr( "href", attachment.document );

}


function _competitionTimer (  )
{
    var countTime       =   $element.find('.counter' )
    ,   endDateObj     =   new Date( competitionVars.endDateTime )
    ,   endDateTime
    ;

    endDateTime     =   bidx.utils.getISODateTime( endDateObj, 'datetime' );
    /* Display End Date Time for Apply Before */
    $competitionEndTimeDisplay.text( endDateTime );

    countTime.each( function()
    {
        var el = $(this)
        ,   datatime = el.attr('data-time')
        ;

        countdown( datatime, el );

        setInterval( function()
                    {
                        countdown( datatime, el );
                    }, 1000)
        ;
    });

    function countdown ( datatime, el )
    {

        var now = new moment()
        ,   then = moment.unix( datatime )
        ,   ms = then.diff(now, 'milliseconds', true)
        ,   days = Math.floor(moment.duration(ms).asDays())
        ,   then = then.subtract('days', days)
        ,   ms = then.diff(now, 'milliseconds', true)
        ,   hours = Math.floor(moment.duration(ms).asHours())
        ,   then = then.subtract('hours', hours)
        ,   ms = then.diff(now, 'milliseconds', true)
        ,   minutes = Math.floor(moment.duration(ms).asMinutes())
        ,   then = then.subtract('minutes', minutes)
        ,   ms = then.diff(now, 'milliseconds', true)
        ,   seconds = Math.floor(moment.duration(ms).asSeconds())
        ;

        el.find('.days').text(days);
        el.find('.hours').text(hours);
        el.find('.minutes').text(minutes);
        el.find('.seconds').text(seconds);
    }
}

    function _getBusinessPlans(  )
    {
        var option
        ,   bpLength    = _.size(canParticipate)
        ,   counter     = 0
        ,   promises    = []
        ,   listBpItems = []
        ,   $d          = $.Deferred()
        ;



            $.each( canParticipate, function( idx, entityId )
            {
                bidx.api.call(
                    "entity.fetch"
                ,   {
                        entityId    :   entityId
                    ,   groupDomain :   bidx.common.groupDomain
                    ,   success:        function( item )
                        {
                            // now format it into array of objects with value and label

                            if ( !$.isEmptyObject(item) )
                            {
                                option  =   $( "<option/>",
                                            {
                                                value: entityId
                                            } );

                                option.text( item.name );

                                listBpItems.push( option );

                                counter = counter + 1;

                                currentUserBusinessSummaryList.push (   {
                                                                            'entityId' : item.bidxMeta.bidxEntityId
                                                                        ,   'data'     : item
                                                                     } );

                                if(counter === bpLength )
                                {
                                    $d.resolve( listBpItems );
                                }

                            }
                        }

                    ,   error: function(jqXhr, textStatus)
                        {
                            var response = $.parseJSON( jqXhr.responseText);

                            bidx.utils.log("Error retrieving the data for entityid", entityId);

                            counter = counter + 1;

                            if(counter === bpLength )
                            {

                                $d.resolve( listBpItems );
                            }
                        }
                    });
            } );

            return $d.promise();
    }



    // Use the retrieved competitionSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        // Go iteratively over all the forms and there fields
        //
        var dateTimeValue
        ;
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input = $form.find( "[name^='" + f + "']" )
                    ,   value  = bidx.utils.getValue( competitionSummary, f )
                    ;

                    bidx.utils.setElementValue( $input, value );
                } );
            }
        } );

        // Industry Sectors
        var data = bidx.utils.getValue( competitionSummary, "competitionIndustry", true );

        if ( data )
        {
            $industrySectors.industries( "populateInEditScreen",  data );
        }

        var competitionLogoImage = bidx.utils.getValue( competitionSummary, "competitionLogo" );

        if ( competitionLogoImage )
        {
            $competitionLogoContainer.empty();
            $competitionLogoContainer.append( "<img src='"+ competitionLogoImage.document +"' />");
        }


        var coverImage = bidx.utils.getValue( competitionSummary, "competitionLogo" );

        if ( coverImage )
        {
            $coverImageContainer.cover( "repositionCover" );
            $coverImageContainer.find( "[href$='#coverRemove']" ).removeClass( "hide" );
        }
        else
        {
            $coverImageContainer.cover( "constructEmpty" );
        }

        // Documents are not using a form, just a reflowrower
        //
        var attachment = bidx.utils.getValue( competitionSummary, "competitionDocument", true );

        if ( attachment )
        {
            var attached            = $attachmentContainer.find( ".attachmentItem" )
            ,   attachmentExists    = []
            ;

            // Prevent documents to be added again by checking the previously added data attribute "data-businessPlanEntityId"
            //
            if ( attached.length ) {
                $.each( attached, function( idx, a )
                {
                    var bidxbusinessPlanEntityId = $(this).context.dataset.businessplanentityid;
                    if ( $.inArray( bidxbusinessPlanEntityId, attachmentExists ) === -1 )
                    {
                        attachmentExists.push( bidxbusinessPlanEntityId );
                    }
                } );
            }

            $.each( attachment, function( idx, a )
            {
                if ( a.fileUpload && $.inArray( a.fileUpload.toString(), attachmentExists ) === -1 )
                {
                    _addAttachment( a );
                }
            } );
        }

        // Update the chosen components with our set values
        //
        $industry.trigger( "chosen:updated" );
        $regional.trigger( "chosen:updated" );
        $envImpact.trigger( "chosen:updated" );
        $socialImpact.trigger( "chosen:updated" );
    }

    // Convert the form values back into the member object
    //
    function _getFormValues()
    {
        // Iterate over the form fields, not all fields are using forms. Financial Summary
        // is a repeating list, but not a
        //
        $.each( fields, function( form, formFields )
        {
            var $form       = forms[ form ].$el
            ;

            // Unbox
            //
            form += "";

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var date
                    ,   $input = $form.find( "[name^='" + f + "']" )
                    ,   value
                    ;

                    if( $input.attr( 'data-type' ) === 'datetime')
                    {
                        date    = $input.datetimepicker( "getDate" );

                        //date    = $input.datetimepicker( "getUTCDate" );

                        value   = bidx.utils.convertLocalDateToUTCDate( date );

                        value   = bidx.utils.getISODateTime(value);

                    }
                    else
                    {
                        value  = bidx.utils.getElementValue( $input );
                    }

                    bidx.utils.setValue( competitionSummary, f, value );
                } );
            }

            //Gender
            /*var genderValue = bidx.utils.getElementValue( $gender );

            if( genderValue === 'both' )
            {
                genderValue = ['m','f'];
            }


            bidx.utils.setValue( competitionSummary, 'competitionGender', genderValue );*/

            // Industry Sectors
            var endSectors = $industrySectors.find( "[name*='endSector']" );

            if ( endSectors )
            {
                var arr = [];
                $.each( endSectors, function(i, f)
                {
                    var value   = bidx.utils.getElementValue( $(f) );

                    if ( value )
                    {
                        arr.push( value );
                    }
                });

                arr = $.map( arr, function( n )
                {
                    return n;
                });

                bidx.utils.setValue( competitionSummary, "competitionIndustry", arr );
            }


            // Collect the nested objects
            //
            $.each( formFields, function( nest )
            {
                // unbox that value!
                //
                nest += "";

                // Properties that start with an _ are special properties and should be ignore
                //
                if ( nest.charAt( 0 ) === "_" )
                {
                    return;
                }

                var i                   = 0
                ,   arrayField          = formFields._arrayFields && $.inArray( nest, formFields._arrayFields ) !== -1
                ,   reflowrowerField    = formFields._reflowRowerFields && $.inArray( nest, formFields._reflowRowerFields ) !== -1
                ,   objectPath          = nest
                ,   item
                ,   count
                ;


                if ( arrayField )
                {
                    count   = $form.find( "." + nest + "Item" ).length;
                    item    = [];
                }
                else
                {
                    item    = {};
                }

                bidx.utils.setValue( competitionSummary, objectPath, item );
                bidx.utils.setNestedStructure( item, count, nest, $form, formFields[ nest ]  );


                // Now collect the removed items, clear the properties and push them to the list so the API will delete them
                //
                var $reflowContainer
                ,   removedItems
                ;

                if ( reflowrowerField )
                {
                    $reflowContainer = $form.find( "." + nest + "Container" );

                    if ( $reflowContainer.length )
                    {
                        removedItems = $reflowContainer.reflowrower( "getRemovedItems" );

                        $.each( removedItems, function( idx, removedItem )
                        {
                            var $removedItem    = $( removedItem )
                            ,   bidxData        = $removedItem.data( "bidxData" )
                            ;

                            if ( bidxData )
                            {
                                // Iterate over the properties and set all, but bidxMeta, to null, except for array's, those must be set to an empty array...
                                //
                                $.each( bidxData, function( prop )
                                {
                                    if ( prop !== "bidxMeta" )
                                    {
                                        bidxData[ prop ] = $.type( bidxData[ prop ] ) === "array"
                                            ? []
                                            : null
                                        ;
                                    }
                                } );
                            }

                            item.push( bidxData );
                        } );
                    }
                }
            } );
        } );

        // Documents
        // Collect the whole situation from the DOM and set that array of bidxData items to be the new situation
        //
        var attachments = [];

        $attachmentContainer.find( ".attachmentItem" ).each( function()
        {
            var $item       = $( this )
            ,   bidxData    = $item.data( "bidxData" )
            ;

            attachments.push( bidxData );
        } );

        bidx.utils.setValue( competitionSummary, "competitionDocument", attachments );

        // Cover Image
        //
        var coverImageData = $coverImageContainer.data( "bidxData" )
        ,   $coverImg       = $coverImageContainer.find( "img" )
        ,   coverImgTopPos = $coverImageContainer.length ? parseInt( $coverImageContainer.find( "img" ).css( "top" ), 10) : false
        ;

        if ( coverImageData )
        {
            bidx.utils.setValue( competitionSummary, "competitionLogo.fileUpload", coverImageData.fileUpload );
        }

        if ( coverImgTopPos )
        {
            if ( coverImgTopPos <= 0 )
            {
                bidx.utils.setValue( competitionSummary, "competitionLogo.top", coverImgTopPos );
            }
            else
            {
                bidx.utils.setValue( competitionSummary, "competitionLogo.top", 0 );
            }
        }

        if ( $coverImg.is(':hidden') )
        {
            competitionSummary.cover = null;
        }


        // competitionLogo
        //
        var competitionLogoImageData = $competitionLogoContainer.data( "bidxData" );

        if ( competitionLogoImageData )
        {
            bidx.utils.setValue( competitionSummary, "competitionLogo.fileUpload", competitionLogoImageData.fileUpload );
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
                        //if( item.bidxEntityType == 'bidxcompetitionSummary') {
                        bidxMeta       = bidx.utils.getValue( item, "bidxMemberProfile.bidxMeta" );

                        if( bidxMeta  )
                        {
                            //  execute callback if provided
                            if (options && options.callback)
                            {
                                options.callback( item, options.ownerId );
                            }
                        }

                    }

                }
            ,   error: function(jqXhr, textStatus)
                {

                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( false, options.ownerId );
                    }

                }
            }
        );
    }

    // This is the startpoint for the edit state
    //
    function _init( state )
    {
        // Reset any state
        $addFiles.hide();

        var curYear         = bidx.common.getNow().getFullYear();

        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { "class": "btn btn-primary disabled", href: "#save"    });
        $btnCancel  = $( "<a />", { "class": "btn btn-primary disabled", href: "#viewCompetition"  });



        $btnCancel.bind( "click", function( e )
        {
            e.preventDefault();

            // In case of a create there doesn't seem to be logical place to go back to, for now just go to the main page
            //
            if ( state === "create" )
            {
                // Add a redirect note, because the response from the webserver / wp / php is very slow
                //
                bidx.common.notifyRedirect();

                // @TODO: whereto in case of cancel of a competitionSummary create?
                //
                document.location.href = "/";
            }
            else
            {
                bidx.common.removeAppWithPendingChanges( appName );
                bidx.controller.updateHash( "#viewCompetition", true );
                $coverImageContainer.find( "img" ).show();

                reset();

                bidx.common.removeValidationErrors();

                _showView( "show" );

            }

            $coverImageContainer.cover( "disable" );
        } );

        $btnSave.bind( "click", function( e )
        {
            e.preventDefault();

            _doSave();
        } );

        $btnSave.i18nText( ( state === "create" ? "btnSave" : "btnSave" ) ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );
        $btnCancel.i18nText( "btnCancel" ).prepend( $( "<div />", { "class": "fa fa-times fa-above fa-big" } ) );

        $controlsForEdit.empty();
        $controlsForEdit.append( $btnSave, $btnCancel );

        $controlsForError.empty();
        $controlsForError.append( $btnCancel.clone( true ) );

        if ( state === "edit" )
        {

            _getCompetitionSummary()
                .fail( function()
                {
                    $btnCancel.removeClass( "disabled" );
                })
                .done( function()
                {
                    _populateScreen();

                    $btnSave.removeClass( "disabled" );
                    $btnCancel.removeClass( "disabled" );

                    bidx.common.removeValidationErrors();

                    _showView( "edit" );

                    _showAllView( "mentor" );
                    _showAllView( "matchingmentors" );

                })
            ;
        }
        else
        {
            competitionSummary     = {};



            $btnSave.removeClass( "disabled" );
            $btnCancel.removeClass( "disabled" );

            _showView( "edit" );

        }

    }


    // Retrieve the business summary by ID
    //
    // @returns promise
    //
    function _getCompetitionSummary()
    {
        var $d = $.Deferred();

        // Fetch the business summary
        //
        bidx.api.call(
            "competition.fetch"
        ,   {
                competitionSummaryId:  competitionSummaryId
            ,   groupDomain:        bidx.common.groupDomain

            ,   success: function( response )
                {
                    bidx.utils.log( "[competitionSummary] fetch", competitionSummaryId, response );

                    // Do we have edit perms?
                    //
                    var bidxMeta    = bidx.utils.getValue( response, "data.bidxMeta" )
                    ,   canEdit     = bidx.utils.getValue( bidxMeta, "bidxCanEdit" )
                    ,   msg
                    ;

                    if ( !canEdit )
                    {
                        msg = bidx.i18n.i( "noEditPermission" );
                        _showError( msg );

                        $d.reject( new Error( msg ) );
                    }
                    else
                    {
                        competitionSummary = response.data;

                        bidx.utils.log( "bidx::competitionSummary", competitionSummary );

                        $d.resolve();
                    }
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

        return $d;
    }

    // Try to save the competitionSummary to the API
    //
    function _doSave()
    {
        // Only allow saving when all the sub forms are valid
        //
        var anyInvalid = false;

        if ( bidxConfig.authenticated === false )
        {
            bidx.utils.log('Not logged in');
        }

        $.each( forms, function( name, form )
        {
            if ( !form.$el.valid() )
            {
                bidx.utils.warn( "[competitionSummary] Invalid form", form.$el, form.$el.validate().errorList );

                anyInvalid = true;
            }
        } );

        if ( anyInvalid )
        {
            return;
        }

        if ( $btnSave.hasClass( "disabled" ) )
        {
            return;
        }

        $btnSave.addClass( "disabled" );
        $btnCancel.addClass( "disabled" );

        _save(
        {
            error: function( jqXhr )
            {
                var response;

                try
                {
                    // Not really needed for now, but just have it on the screen, k thx bye
                    //
                    response = JSON.stringify( JSON.parse( jqXhr.responseText ), null, 4 );
                }
                catch ( e )
                {
                    bidx.utils.error( "problem parsing error response from competitionSummary save" );
                }

                bidx.common.notifyError( "Something went wrong during save: " + response );

                // Offer a login modal if not authecticated
                if ( jqXhr.status === 401 )
                {
                    $( ".loginModal" ).modal();
                }

                $btnSave.removeClass( "disabled" );
                $btnCancel.removeClass( "disabled" );
            }
        } );
    }

    function _appendCardValues( options )
    {
        var listItem
        ,   $listItem
        ,   countryOperation
        ,   entrpreneurIndustry
        ,   entrpreneurReason
        ,   country
        ,   industry
        ,   reason
        ,   item
        ,   businessData
        ,   bidxMeta
        ,   isEntrepreneur
        ,   isInvestor
        ,   isMentor
        ,   emptyVal            = ''
        ,   entityId            = options.entityId
        ,   $list               = $element.find("." + options.list)
        ,   snippet             = $("#entrpreneur-card-snippet").html().replace(/(<!--)*(-->)*/g, "")
        ,   $listError          = $("#error-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   myApplicationObj    = options.applicationObj
        ,   $ratingWrapper
        ,   $raty
        ;

        businessData       =  _.findWhere( myApplicationObj, { 'entityId' : parseInt(entityId, 10) } );


        bidxMeta           = bidx.utils.getValue(businessData, "bidxMeta");


        if ( !$.isEmptyObject(bidxMeta) )
        {

            listItem    =   snippet
                            .replace( /%entityId%/g,                    entityId                        ? entityId     : emptyVal )
                            .replace( /%bidxOwnerId%/g,                 bidxMeta.bidxOwnerId )
                            .replace( /%bidxOwnerDisplayName%/g,        bidxMeta.bidxOwnerDisplayName   ? bidxMeta.bidxOwnerDisplayName     : emptyVal )
                            .replace( /%bidxRatingAverage%/g,           bidxMeta.bidxRatingAverage      ? bidxMeta.bidxRatingAverage.toFixed(1)     : emptyVal )
                            .replace( /%bidxRatingCount%/g,             bidxMeta.bidxRatingCount        ? bidxMeta.bidxRatingCount     : emptyVal )
                            .replace( /%bidxEntityDisplayName%/g,       bidxMeta.bidxEntityDisplayName  ? bidxMeta.bidxEntityDisplayName     : emptyVal )
                            .replace( /%created%/g,                     businessData.created            ? bidx.utils.parseTimestampToDateStr(businessData.created) : emptyVal )
                            .replace( /%status%/g,                      bidx.i18n.i(businessData.status ,appName))
                            ;

            $listItem   =   $(listItem);

            /* Assign Next Action According to Role */
            _assignEntrpreneurAction( $listItem,  businessData);


            /* Displaying Rating Star Logic */
            $ratingWrapper              = $listItem.find( ".rating-wrapper" );
            $raty                       = $ratingWrapper.find( ".raty" );

            $raty.raty({
                starType: 'i',
                readOnly: true,
                // TODO Arjan remove or translate?
                hints:  ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                score:  bidxMeta.bidxRatingAverage

            });
        }
        else
        {
            $listItem = $listError;
        }

        $list.append( $listItem );

        _showAllView('ownCard');


    }

    function _assignRadioActions( $listItem, data )
    {
        var status              = data.status
        ,   entityId            = data.entityId
        ;

        switch ( status )
        {
            case 'APPLIED'   :
            case 'WITHDRAWN' :
            case 'REJECTED'  :

                var $radioQualification = $listItem.find( "[name='isqualification" + entityId + "']" )
                ;

                $radioQualification.change( function( e )
                {
                    e.preventDefault();

                    if( $(this).is(":checked")  )
                    {
                        var $this           = $(this)
                        ,   qualVal         = bidx.utils.getElementValue( $this )
                        ,   $rejectSet      = $listItem.find( ".reject-set-" + entityId  )
                        ,   $submitSet      = $listItem.find( ".set-submit-" + entityId  )
                        ;

                        if( qualVal === 'REJECTED' )
                        {
                            $rejectSet.removeClass('hide');
                            $submitSet.addClass('hide');

                            /*Show buttons*/
                        }
                        else if( qualVal === 'SUBMITTED')
                        {
                            $submitSet.removeClass('hide');
                            $rejectSet.addClass('hide');
                        }
                    }

                });

            break;

            case 'SUBMITTED' :
            case 'FINALIST'  :

                var lCaseStatus =   data.action
                ,   $wrapper    =   $listItem.find( '.wrapper-recommend-' + lCaseStatus + '-' + entityId )
                ,   $radio      =   $listItem.find( "[name='recommend-" + lCaseStatus + '-' + entityId + "']" )
                ;

                $radio.change( function( e )
                {
                    e.preventDefault();
                    bidx.utils.log('$this', $this);

                    if( $(this).is(":checked")  )
                    {
                        var $this           = $(this)
                        ,   score
                        ,   qualVal         = bidx.utils.getElementValue( $this )
                        ,   $ratingSet      = $wrapper.find( ".rating-wrapper" )
                        ,   $commentSet     = $wrapper.find( ".comment-wrapper" )
                        ,   $buttonSet      = $wrapper.find( ".set-wrapper"  )
                        ,   ratingClass     =  ".raty-" + lCaseStatus + '-' + entityId
                        ,   $raty           =  $ratingSet.find( ratingClass )
                        ,   finalistRating
                        ;

                        $commentSet.removeClass('hide');

                        $buttonSet.removeClass('hide');

                        bidx.utils.log('qualVal', qualVal);

                        if( qualVal !== 'REJECTED' )
                        {
                            score  =   $raty.data( lCaseStatus );
                            $ratingSet.removeClass('hide');
                        }
                        else
                        {
                            finalistRating  =   $raty.raty( 'score' );
                            $raty.data( lCaseStatus, finalistRating );

                            score           =   0;
                            $ratingSet.addClass('hide');
                        }

                        $raty.raty('set', { score:  score } );
                        $raty.data( 'rating', score );
                    }

                });

            break;
        }
    }

    function _displayButtonsAccordingToStatus( $listItem, data, row, review)
    {
        var displayQual
        ,   displayFinalist
        ,   displayWinner
        ,   status                  =   data.status
        ,   entityId                =   data.entityId
        ,   $radioFinalist          =   $listItem.find( "[name='isfinalist" + entityId + "']" )
        ,   $radioWinner            =   $listItem.find( "[name='iswinner" + entityId+ "']" )
        ,   $radioQualification     =   $listItem.find( "[name='isqualification" + entityId + "']" )
        ,   $setSubmit              =   $listItem.find( ".set-submit-" + entityId )
        ,   $setQual                =   $listItem.find( ".set-qualification-" + entityId )
        ,   $setFinalist            =   $listItem.find( ".set-finalist-" + entityId )
        ,   $setWinner              =   $listItem.find( ".set-winner-" + entityId )
        ,   $wrapperFinalist        =   $listItem.find( ".wrapper-finalist-" + entityId )
        ,   $wrapperWinner          =   $listItem.find( ".wrapper-winner-" + entityId )
        ,   $wrapperQualification   =   $listItem.find( ".wrapper-qualification-" + entityId )
        ,   $rejectComment          =   $listItem.find( "[name='reject-comment-" + entityId + "']" )
        ,   assessorLength          =   _.size(updateActorsList['assessors'])
        ;

        switch(status)
        {
            case 'APPLIED':
            case 'WITHDRAWN':

                _assignRadioActions( $listItem, data );

                $wrapperQualification.removeClass('hide');

            break;
            case 'SUBMITTED':
                var isAdminAssessorReview   =   bidx.utils.getValue( review, 'isAdminAssessorReview')
                ,   $wrapperAssessor        =   $listItem.find( ".assign-assessor" )
                ;

                $wrapperQualification.addClass('hide');

                if(assessorLength) // If there are assessor then show the dropdown
                {
                    $wrapperAssessor.removeClass('hide');
                }

                /* Assign Next Action According to Role */
                data.role      =   'COMPETITION_ADMIN';
                data.action    =   'finalist';

                _assignAssessorJudgeActions(
                {
                    $listItem:  $listItem
                ,   review:     isAdminAssessorReview
                ,   data:       data
                ,   row:        row
                });

            break;

            case 'REJECTED':

                bidx.utils.setElementValue( $radioQualification, status );

                _assignRadioActions( $listItem, data );

                $wrapperQualification.addClass('hide');

            break;

            case 'FINALIST':
                var isAdminJudgeReview   =   bidx.utils.getValue( review, 'isAdminJudgeReview')
                ;

                /* Assign Next Action According to Role */
                data.role      =   'COMPETITION_ADMIN';
                data.action    =   'winner';

                _assignAssessorJudgeActions(
                {
                    $listItem:  $listItem
                ,   review:     isAdminJudgeReview
                ,   data:       data
                ,   row:        row
                });

            break;

            case 'NOT_FINALIST':

                bidx.utils.setElementValue( $radioFinalist , status );

            break;

            case 'WINNER':

                bidx.utils.setElementValue( $radioWinner, status );

            break;

            case 'NOT_WINNER':

                bidx.utils.setElementValue( $radioWinner, status );

            break;
        }

        return;
    }

    function _loadActorDropdownAccordingToStatus( $listItem, data)
    {
        var option
        ,   actorId
        ,   displayName
        ,   statusMsg
        ,   successMsg
        ,   assessorList            =   []
        ,   judgeList               =   []
        ,   assessorReviewsList     =   []
        ,   assignedAssessorsIdList =   []
        ,   judgeReviewsList        =   []
        ,   assignedJudgesIdList    =   []
        ,   status                  =   data.status
        ,   entityId                =   data.entityId
        ,   snippetSuccess          =   $("#success-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   assessorLength          =   _.size(updateActorsList['assessors'])
        ,   judgeLength             =   _.size(updateActorsList['judges'])
        ,   $assessors              =   $listItem.find( "[name='assessors-" + entityId + "']" )
        ,   $judges                 =   $listItem.find( "[name='judges-" + entityId + "']" )
        ,   $btnAssessor            =   $listItem.find( ".assign-assessor-" + entityId )
        ,   $btnJudge               =   $listItem.find( ".assign-judge-" + entityId )
        ,   $wrapperAssessor        =   $listItem.find( ".assign-assessor" )
        ,   $wrapperJudge           =   $listItem.find( ".assign-judge" )
        ,   $cardHeader             =   $listItem.find( ".cardHeader" + entityId )
        ,   reviews                 =   data.reviews
        ;

        if(status === 'SUBMITTED')
        {

            if( assessorLength )
            {
                /* Assessor Dropdown */
                $assessors.chosen(
                {
                    placeholder_text_single : bidx.i18n.i( "loadingLbl" )
                ,   width                   : "100%"
                });

                $.each( actorIdList['assessors'], function( idx, actorObject )
                {
                    actorId      =   actorObject.actorId;
                    displayName  =   actorObject.userDisplayName;

                    option      =   $( "<option/>",
                                    {
                                        value: actorId
                                    } );

                    option.text( displayName );

                    assessorList.push( option );

                });

                $assessors.append( assessorList );

                /* Get Already Assigned Assessors if any */
                assessorReviewsList         =   _.where(reviews, {role: "COMPETITION_ASSESSOR"}); // Returns object who is having assessor role
                assignedAssessorsIdList      =   _.pluck( assessorReviewsList, 'competitionActorId'); //return back only actorids from the object

                if( assignedAssessorsIdList )
                {
                    bidx.utils.setElementValue( $assessors, assignedAssessorsIdList );
                }

                $assessors.trigger( "chosen:updated" );
                $wrapperAssessor.removeClass ( 'hide');

                 _assignActorAction(
                {
                    $btnAssign: $btnAssessor
                ,   role:       'assessors'
                ,   success:    function( response )
                                {
                                    successMsg = bidx.i18n.i('SUCCESS_ASSESSOR' , appName);

                                    statusMsg = snippetSuccess
                                                .replace( /%successMsg%/g, successMsg)
                                                .replace( /%entityId%/g, entityId)
                                                ;

                                    $cardHeader.empty().prepend($(statusMsg));

                                    _showAllView('successCard' + entityId );

                                }
                });
            }
        }

        if( status === 'FINALIST' )
        {

            if( judgeLength )
            {
                /* Judge Dropdown */
                $judges.chosen(
                {
                    placeholder_text_single : bidx.i18n.i( "loadingLbl" )
                ,   width                   : "100%"
                });

                $.each( actorIdList['judges'], function( idx, actorObject )
                {
                    actorId      =   actorObject.actorId;
                    displayName  =   actorObject.userDisplayName;

                    option      =   $( "<option/>",
                                    {
                                        value: actorId
                                    } );

                    option.text( displayName );

                    judgeList.push( option );

                });

                $judges.append( judgeList );

                /* Get Already Assigned Assessors if any */
                judgeReviewsList        =   _.where(reviews, {role: "COMPETITION_JUDGE"}); // Returns object who is having assessor role
                assignedJudgesIdList    =   _.pluck( judgeReviewsList, 'competitionActorId'); //return back only actorids from the object

                if( assignedJudgesIdList )
                {
                    bidx.utils.setElementValue( $judges, assignedJudgesIdList );
                }

                $judges.trigger( "chosen:updated" );
                $wrapperJudge.removeClass ( 'hide');

                 _assignActorAction(
                {
                    $btnAssign: $btnJudge
                ,   role:       'judges'
                ,   success:    function( response )
                                {
                                    successMsg = bidx.i18n.i('SUCCESS_JUDGE' , appName);

                                    statusMsg = snippetSuccess
                                                .replace( /%successMsg%/g, successMsg)
                                                .replace( /%entityId%/g, entityId)
                                                ;

                                    $cardHeader.empty().prepend($(statusMsg));

                                    _showAllView('successCard' + entityId );
                                }
                });
            }
        }
    }


    function  _assignAssessorJudgeActions( options )
    {
        var $radio
        ,   $raty
        ,   ratingClass
        ,   ratingWrapperClass
        ,   radioName
        ,   statusMsg
        ,   successMsg
        ,   status
        ,   recommendationStatus
        ,   review                      =   options.review
        ,   $listItem                   =   options.$listItem
        ,   data                        =   options.data
        ,   row                         =   options.row
        ,   role                        =   data.role
        ,   action                      =   data.action
        ,   entityId                    =   data.entityId
        ,   wrapperClass                =   ".wrapper-recommend-" + action +"-" + entityId
        ,   $recommendTitle             =   $listItem.find('.recommendationTitle')
        ,   $wrapper                    =   $listItem.find( wrapperClass )

        ,   commentName
        ,   $comment
        ,   commentText                 =  bidx.utils.getValue( review, 'comment')
        ,   recommendation              =  bidx.utils.getValue( review, 'competitionRecommendation')
        ,   reviewRating                =  bidx.utils.getValue( review, 'reviewRating')

        ,   $cardHeader                 = $listItem.find( ".cardHeader" + entityId )
        ,   snippetSuccess              = $("#success-card").html().replace(/(<!--)*(-->)*/g, "")
        ;


        _assignRadioActions( $listItem, data );

        if( recommendation )
        {
            radioName       =   'recommend-' + action + '-' + entityId;
            $radio          =   $listItem.find( "[name=" + radioName + "]" );
            bidx.utils.setElementValue( $radio, recommendation ); // Finalist/Winner Recommendation value ex Finalist/Not Finalist/Winner/Not Winner

            /* Remove hide classes if its recommended already */
            $wrapper.find('.rating-wrapper').removeClass('hide');
            $wrapper.find('.comment-wrapper').removeClass('hide');
            $wrapper.find('.set-wrapper').removeClass('hide');
        }

        if( commentText )
        {
            commentName     =   'comment-' + action + '-' + entityId;
            $comment        =   $listItem.find( "[name=" + commentName + "]" );
            bidx.utils.setElementValue( $comment, commentText );
        }

        /* Displaying Rating Star Logic */
        ratingWrapperClass  =   ".rating-wrapper-" + action + '-' + entityId;
        $ratingWrapper      =  $listItem.find( ratingWrapperClass );

        if($ratingWrapper.length)
        {
            ratingClass         =  ".raty-" + action + '-' + entityId;
            $raty               =  $ratingWrapper.find( ratingClass );
            $raty.data('rating', reviewRating);
            //$raty.replace( /%bidxFINALISTRatingAverage%/g, reviewRating);
            $raty.raty ({
                            starType:   'i',
                            hints:      ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                            score:      (reviewRating) ? reviewRating : 0,
                            click:      function ( value )
                                        {
                                            $(this).data( 'rating', value );
                                        }
                        });
        }

        $recommendTitle.removeClass('hide');

        $wrapper.removeClass('hide');

        _assignRecommendations( {
                                    options:    options
                                ,   success:   function( recommData )
                                                {
                                                    var d                       =   row.data( )
                                                    ,   rowStatus
                                                    ,   reviewItem
                                                    ,   $recommendContainer     =   $listItem.find('.review-' + recommData.id)
                                                    ,   role                    =   (recommData.competitionRoundStatus === 'ASSESSMENT' ) ? 'assessor' : 'judge'
                                                    ,   $roleRecommendation     =   $listItem.find( "."+ role + "-recommendation-" + entityId )
                                                    ,   $wrapperRecommendation  =   $listItem.find( ".wrapper-recommend-" + role +"-" + entityId )
                                                    ,   $wrapperAction          =   $listItem.find( ".wrapper-recommend-" + action +"-" + entityId )
                                                    ;

                                                    recommendationStatus        =   recommData.competitionRecommendation;

                                                    d.recommendation            =   bidx.i18n.i(recommendationStatus, appName);

                                                    d.rating                    =   (recommData.reviewRating) ? recommData.reviewRating : 0;

                                                    if(recommendationStatus === 'REJECTED')
                                                    {
                                                        d.status     =    recommendationStatus;
                                                        d.state      =    d.recommendation;
                                                        $wrapperAction.addClass('hide');
                                                    }

                                                    d.reviews.push( recommData );

                                                    row.data(d);

                                                    successMsg = bidx.i18n.i('RECOMM_' + recommendationStatus ,appName);

                                                    statusMsg = snippetSuccess
                                                                .replace( /%successMsg%/g, successMsg)
                                                                .replace( /%entityId%/g, entityId)
                                                                ;

                                                    $cardHeader.empty().append($(statusMsg));

                                                    _showAllView('successCard' + entityId );

                                                    if( $roleRecommendation.length )
                                                    {

                                                        reviewItem                  =   _addReview( recommData );

                                                        if ( $recommendContainer.length )
                                                        {
                                                            $recommendContainer.replaceWith ($(reviewItem)) ;
                                                        }
                                                        else
                                                        {
                                                            $roleRecommendation.append($(reviewItem));
                                                        }

                                                        $wrapperRecommendation.removeClass('hide');
                                                    }

                                                }
                                });

    }

    //Start here
    function _assignRecommendations( params )
    {
        var successMsg
        ,   statusMsg
        ,   rating
        ,   ratingWrapperClass
        ,   ratingClass
        ,   $ratingWrapper
        ,   $cardEntity
        ,   options     =   params.options
        ,   $listItem   =   options.$listItem
        ,   $raty       =   options.$raty
        ,   data        =   options.data
        ,   row         =   options.row
        ,   role        =   data.role
        ,   action      =   data.action
        ,   entityId    =   data.entityId
        ,   btnClass    =   ".set-recommend-" + action +"-" + entityId
        ,   $btnAction  =   $listItem.find( btnClass )
        ,   confirmTimer
        ,   orgText
        ;

        $btnAction.click( function( e )
        {
            e.preventDefault();

            var recommendation
            ,   btnEntityId
            ,   businessPlanEntityId
            ,   radioName
            ,   data
            ,   $radio
            ,   $comment
            ,   comment
            ,   commentName
            ;

            businessPlanEntityId    =   $btnAction.data( "entityid" );

            radioName               =   'recommend-' + action + '-' + businessPlanEntityId;

            commentName             =   'comment-' + action + '-' + businessPlanEntityId;

            //Overwrite if its reject, exception for
            if(action === 'reject')
            {
                radioName               =   'isqualification' + businessPlanEntityId;
                commentName             =   'reject-comment-' + businessPlanEntityId;

            }
            else
            {
                ratingWrapperClass      =   ".rating-wrapper-" + action + '-' + businessPlanEntityId;
                $ratingWrapper          =   $listItem.find( ratingWrapperClass );

                ratingClass             =  ".raty-" + action + '-' + businessPlanEntityId;
                $raty                   =   $ratingWrapper.find( ratingClass );
                rating                  =   $raty.data( 'rating' );

                 orgText                 = $btnAction.text();  // We dont  need are you sure option for other than reject so
            }



            $radio                  =   $listItem.find( "[name=" + radioName + "]" );
            recommendation          =   bidx.utils.getElementValue( $radio ); // Finalist/Winner Recommendation value ex Finalist/Not Finalist/Winner/Not Winner


            $comment                =   $listItem.find( "[name=" + commentName + "]" );
            comment                 =   bidx.utils.getElementValue( $comment );


            //rating                  =   (rating === '%bidxFINALISTRatingAverage%') ? 0 : rating;

            if ( !businessPlanEntityId )
            {
                bidx.utils.error( "[competition] No entity id, unable to apply!", businessPlanEntityId );
                return;
            }

            bidx.utils.log('[competition] Competition Action Button Clicked', recommendation);
            bidx.utils.log('[competition] Competition Action EntityId', businessPlanEntityId);

            function startConfirmTimer( $btn, orgText )
            {
                confirmTimer = setTimeout( function( )
                {
                    $btn.text( orgText );
                    $btn.data( "confirm", false );

                    $btn.removeClass( "btn-danger" );
                    $btn.addClass( "btn-md" );

                }, 5000 );

            }

            if ( $btnAction.data( "confirm" ) || action !== 'reject')
            {
                clearTimeout( confirmTimer );

                //quick reset of the timer array you just cleared

                _recoverOrigForm( $btnAction
                                ,   {
                                        disabled:   'disabled'
                                    }
                                );

                data    =   {
                                "role":           role,
                                "recommendation": recommendation,
                                "comment":        comment,
                                "rating":         rating
                            };


                _assignRecommendationForCompetition(
                {
                    competitionId:  competitionSummaryId
                ,   entityId:       businessPlanEntityId
                ,   data:           data
                ,   success:       function( data )
                                    {
                                        if (params && params.success)
                                        {
                                            params.success( data );
                                        }

                                        $btnAction.text( orgText ).removeClass('disabled');

                                    }
                ,  error:           function ( )
                                    {
                                        $btnAction.text( orgText ).removeClass('disabled');
                                    }
                } );

            }
            else
            {
                orgText = $btnAction.text();

                $btnAction.data( "confirm", true );

                $btnAction.addClass( "btn-danger" );
                $btnAction.i18nText( "btnConfirm" );

                startConfirmTimer( $btnAction, orgText );
            }
        });

    }

    function _assignManagerActions( $listItem, data, row, review )
    {
        var d
        ,   successMsg
        ,   errorMsg
        ,   statusMsg
        ,   rejectOptions
        ,   reviewItem
        ,   rowStatus
        ,   $cardEntity
        ,   $wrapperRecommendation
        ,   status                      =   data.status
        ,   entityId                    =   data.entityId

        ,   $setSubmit                  =   $listItem.find( ".set-submit-" + entityId )
        ,   $setQual                    =   $listItem.find( ".set-qualification-" + entityId )
        ,   $setFinalist                =   $listItem.find( ".set-finalist-" + entityId )
        ,   $setWinner                  =   $listItem.find( ".set-winner-" + entityId )



        ,   $cardHeader                 =   $listItem.find( ".cardHeader" + entityId )

        ,   snippetSuccess              =   $("#success-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   snippetError                =   $("#errorapp-card").html().replace(/(<!--)*(-->)*/g, "")
        ;

        _displayButtonsAccordingToStatus( $listItem, data, row, review );

        _loadActorDropdownAccordingToStatus( $listItem, data);

         _assignBtnAction(
        {
            $btnAction: $setSubmit
        ,   action:     'qualification'
        ,   success:   function( response )
                        {
                            entityId    = response.data.id;

                            status      = response.data.status;

                            rowStatus   =   bidx.i18n.i(status, appName);

                            //row.cell(row[0],4).data(rowStatus);
                            d           =   row.data();
                            d.state     =   rowStatus;
                            d.status    =   status;
                            row.data(d);

                            successMsg = bidx.i18n.i('SUCCESS_ADMIN_' + status ,appName);

                            statusMsg = snippetSuccess
                                        .replace( /%successMsg%/g, successMsg)
                                        .replace( /%entityId%/g, entityId)
                                        ;

                            $cardHeader.prepend($(statusMsg));

                            _showAllView('successCard' + entityId );

                            _displayButtonsAccordingToStatus( $listItem, response.data, row );

                            _loadActorDropdownAccordingToStatus( $listItem, response.data);
                        }
        });

         /* Use Reject Recommendation. that will change status to reject recommendation immediately, its exception  */
        data.role      =   'COMPETITION_ADMIN';
        data.action    =   'reject';
        rejectOptions  =   {
                                $listItem:  $listItem
                            ,   data:       data
                            ,   row:        row
                            };

         _assignRecommendations(
         {
            options:    rejectOptions
        ,   success:   function( recommData )
                        {
                            var recommendationStatus
                            ,   rowStatus
                            ,   d                       =   row.data( )
                            ,   reviews                 =   []
                            ,   extendD                 =   { }
                            ,   $recommendContainer     =   $listItem.find('recommend-' + recommData.id)
                            ,   $roleRecommendation     =   $listItem.find( ".assessor-recommendation-" + entityId )
                            ;

                            recommendationStatus        =   recommData.competitionRecommendation;

                            rowStatus                   =   bidx.i18n.i(recommData.competitionRecommendation, appName);

                            //row.cell(row[0],4).data(rowStatus);

                            d.state                     =   rowStatus;
                            d.status                    =   recommendationStatus;
                            d.recommendation            =   rowStatus;
                            d.rating                    =   recommData.reviewRating;
                            d.reviews.push( recommData );

                            row.data(d);

                            errorMsg    =   bidx.i18n.i('RECOMM_' + recommendationStatus ,appName);

                            statusMsg   =   snippetError
                                            .replace( /%errorMsg%/g, errorMsg)
                                            .replace( /%entityId%/g, entityId)
                                            ;

                            $cardHeader.prepend($(statusMsg));

                            _showAllView('errorCard' + entityId );

                            recommData.status       =   recommData.competitionRecommendation;

                            recommData.entityId     =   entityId;

                            _displayButtonsAccordingToStatus( $listItem, recommData, row );

                            reviewItem          =   _addReview( recommData );

                            if ( $recommendContainer.length )
                            {
                                $recommendContainer.replaceWith ($(reviewItem)) ;
                            }
                            else
                            {
                                $roleRecommendation.append($(reviewItem));
                            }

                            $wrapperRecommendation       =   $listItem.find( ".wrapper-recommend-assessor-" + entityId );

                            $wrapperRecommendation.removeClass('hide');

                        }
        });


         _assignBtnAction(
        {
            $btnAction: $setFinalist
        ,   action:     'finalist'
        ,   success:   function( response )
                        {
                            entityId    = response.data.id;
                            status      = response.data.status;
                            bidx.utils.log('row',row);
                            row.cell(row[0],4).data(status);
                            $setFinalist.addClass("hide");

                            successMsg = bidx.i18n.i('SUCCESS_' + status ,appName);

                            statusMsg = snippetSuccess
                                        .replace( /%successMsg%/g, successMsg)
                                        .replace( /%entityId%/g, entityId)
                                        ;

                            $cardHeader.prepend($(statusMsg));

                            _showAllView('successCard' + entityId );

                            _displayButtonsAccordingToStatus( $listItem, response.data, row );
                        }
        });

        _assignBtnAction(
        {
            $btnAction: $setWinner
        ,   action:     'winner'
        ,   success:   function( response )
                        {
                            entityId    = response.data.id;
                            status      = response.data.status;
                            bidx.utils.log('row',row);
                            row.cell(row[0],4).data(status);
                            row.$('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
                            //row.cell(row[0],4).addClass('error');
                            successMsg = bidx.i18n.i('SUCCESS_' + status ,appName);

                            statusMsg = snippetSuccess
                                        .replace( /%successMsg%/g, successMsg)
                                        .replace( /%entityId%/g, entityId)
                                        ;

                            $cardHeader.prepend($(statusMsg));

                            _showAllView('successCard' + entityId );

                            _displayButtonsAccordingToStatus( $listItem, response.data, row);

                        }
        });

    }

    function _assignEntrpreneurAction( $listItem, businessData )
    {
        var successMsg
        ,   statusMsg
        ,   $cardEntity
        ,   $cardEntityHeader
        ,   $cardHeaderStatus
        ,   status              = businessData.status
        ,   $setApply           = $listItem.find( ".set-apply")
        ,   $setSubmit          = $listItem.find( ".set-submit")
        ,   $setWithdraw        = $listItem.find( ".set-withdraw")
        ,   $cardInfoText       = $listItem.find( ".cardInfoText")
        ,   $cardFooter         = $listItem.find( ".cardFooter")
        ,   $cardHeader         = $listItem.find( ".cardHeader")
        ,   snippetSuccess      = $("#success-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   snippetDanger       = $("#errorapp-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   entityId
        ;

        bidx.utils.log('status',status);

        switch (status)
        {
            case 'WITHDRAWN':

                /*Show buttons*/
                $cardInfoText.i18nText('applyText', appName);

                $setApply.removeClass('hide');

                $cardFooter.removeClass('hide');

                break;

            case 'APPLIED' :

                /*Show buttons*/
                $cardInfoText.i18nText('submitText', appName);

                $setApply.addClass('hide');

                $setSubmit.removeClass('hide');

                $setWithdraw.removeClass('hide');

                $cardFooter.removeClass('hide');

            break;

            case  'SUBMITTED' :

                 /*Show buttons*/
                $cardInfoText.i18nText('withdrawText', appName);

                $setApply.addClass('hide');

                $setWithdraw.removeClass('hide');

                $cardFooter.removeClass('hide');

            break;
        }

        /* Its written outside switch case and true for all cases because we are toggling buttons according to status and reusing same action buttons again so */

        /* Change the data-status field of button */
        $setApply.data('status', 'APPLIED');

        _assignBtnAction(
        {
            $btnAction: $setApply
        ,   action:     'apply'
        ,   success:   function( response )
                        {
                            entityId            = response.data.id;
                            status              = response.data.status;
                            $cardEntity         = $element.find('.cardEntity' + entityId);
                            $cardEntityHeader   = $element.find('.cardHeader' + entityId);
                            $cardHeaderStatus   = $cardEntity.find('.currentStatus');

                            successMsg = bidx.i18n.i('SUCCESS_APPLIED' ,appName);

                            statusMsg = snippetSuccess
                                        .replace( /%successMsg%/g, successMsg)
                                        .replace( /%entityId%/g, entityId);

                            $cardEntityHeader.empty().append($(statusMsg));

                            $setApply.addClass('hide');

                            $setSubmit.removeClass("hide");

                            $setWithdraw.removeClass("hide");

                            $cardInfoText.i18nText('submitText', appName);

                            $cardHeaderStatus.i18nText(status, appName);

                             _showAllView('successCard' + entityId );
                        }
        });


        /* Change the data-status field of button */
        $setSubmit.data('status', 'SUBMITTED');

        _assignBtnAction(
        {
            $btnAction: $setSubmit
        ,   action:     'submit'
        ,   success:   function( response )
                        {
                            entityId            = response.data.id;
                            status              = response.data.status;
                            $cardEntity         = $element.find('.cardEntity' + entityId);
                            $cardEntityHeader   = $element.find('.cardHeader' + entityId);
                            $cardHeaderStatus   = $cardEntity.find('.currentStatus');

                            successMsg = bidx.i18n.i('SUCCESS_SUBMITTED' ,appName);

                            statusMsg = snippetSuccess
                                        .replace( /%successMsg%/g, successMsg)
                                        .replace( /%entityId%/g, entityId);

                            $cardEntityHeader.empty().append($(statusMsg));

                            //$successLabel.empty().i18nText('successSubmitted', appName);
                            $setSubmit.addClass("hide");

                            $setWithdraw.removeClass("hide");

                            $cardInfoText.i18nText('withdrawText', appName);

                            $cardHeaderStatus.i18nText(status, appName);

                            $submittedCount.text( parseInt($submittedCount.html(), 10) + 1 );

                            _showAllView('successCard' + entityId );
                        }
        });

        /* Change the data-status field of button */
        $setWithdraw.data('status', 'WITHDRAWN');

        _assignBtnAction(
        {
            $btnAction: $setWithdraw
        ,   action:     'withdraw'
        ,   success:   function( response )
                        {
                            entityId            = response.data.id;
                            status              = response.data.status;
                            $cardEntity         = $element.find('.cardEntity' + entityId);
                            $cardEntityHeader   = $element.find('.cardHeader' + entityId);
                            $cardHeaderStatus   = $cardEntity.find('.currentStatus');

                            successMsg = bidx.i18n.i('SUCCESS_WITHDRAWN' ,appName);

                            statusMsg = snippetDanger
                                        .replace( /%errorMsg%/g, successMsg)
                                        .replace( /%entityId%/g, entityId);

                            $cardEntityHeader.empty().append($(statusMsg));

                            $setApply.removeClass('hide');

                            $setWithdraw.addClass("hide");

                            $setSubmit.addClass("hide");

                            $cardInfoText.i18nText('submitText', appName);

                            $cardHeaderStatus.i18nText(status, appName);

                            _showAllView('successCard' + entityId );

                            $submittedCount.text( parseInt($submittedCount.html(), 10) - 1 );
                        }
        });
    }

    function _updateActorsToApplications( options )
    {
        var entityId    =   options.entityId
        ;

        bidx.api.call(
            "competition.assignActorToApplication"
        ,   {
                competitionId:  options.competitionId
            ,   entityId:       options.entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           options.data
            ,   success:        function( response )
                {
                    // Do we have edit perms?
                    //
                    bidx.utils.log('response',response);
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( response );
                    }
                }

                , error: function(jqXhr, textStatus)
                {
                    var errorMsg
                    ,   statusMsg
                    ,   $cardHeader     = $element.find( ".cardHeader" + entityId )
                    ,   snippetError    = $("#errorapp-card").html().replace(/(<!--)*(-->)*/g, "")
                    ,   status          = bidx.utils.getValue(jqXhr, "status") || textStatus;

                    errorMsg = status + ' ' + bidx.i18n.i( "ERROR_ASSIGNACTOR", appName) + entityId  ;

                    statusMsg = snippetError
                                .replace( /%errorMsg%/g, errorMsg)
                                .replace( /%entityId%/g, entityId);
                    bidx.utils.log('statusMsg', statusMsg);
                    $cardHeader.empty().prepend($(statusMsg));

                    //$successLabel.empty().i18nText('successSubmitted', appName);

                    _showAllView('errorCard' + entityId );

                    if (options && options.error)
                    {
                        options.error( );
                    }
                }
            }
        );
    }

     function _assignRecommendationForCompetition( options )
    {
        var entityId    =   options.entityId
        ;

        bidx.api.call(
            "competition.updateRecommendationForCompetition"
        ,   {
                competitionId:  options.competitionId
            ,   entityId:       entityId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           options.data
            ,   success:        function( response )
                {
                    //  execute callback if provided
                    if (options && options.success)
                    {
                        options.success( response.data );
                    }
                }

            , error: function(jqXhr, textStatus)
            {
                var errorMsg
                ,   statusMsg
                ,   $cardHeader     = $element.find( ".cardHeader" + entityId )
                ,   snippetError    = $("#errorapp-card").html().replace(/(<!--)*(-->)*/g, "")
                ,   status          = bidx.utils.getValue(jqXhr, "status") || textStatus;

                errorMsg = status + ' ' + bidx.i18n.i( "ERROR_ASSIGNACTOR", appName) + entityId  ;

                statusMsg = snippetError
                            .replace( /%errorMsg%/g, errorMsg)
                            .replace( /%entityId%/g, entityId);

                $cardHeader.empty().prepend($(statusMsg));

                _showAllView('errorCard' + entityId );

                if (options && options.error)
                {
                    options.error( );
                }
            }
            }
        );
    }

    function _updatePlanStatusToCompetition( options )
    {
        var entityId    =   options.data.entityId
        ;

        bidx.api.call(
            "competition.updatePlanStatusForCompetition"
        ,   {
                competitionId:  options.competitionId
            ,   groupDomain:    bidx.common.groupDomain
            ,   data:           options.data
            ,   method:         "POST"
            ,   success:        function( response )
                {
                    // Do we have edit perms?
                    //
                    bidx.utils.log('response',response);
                    //  execute callback if provided
                    if (options && options.callback)
                    {
                        options.callback( response );
                    }
                }

                , error: function(jqXhr, textStatus)
                {
                    var statusMsg
                    ,   $cardHeader     = $element.find( ".cardHeader" + entityId )
                    ,   snippetError    = $("#errorapp-card").html().replace(/(<!--)*(-->)*/g, "")
                    ,   errorMsg        = bidx.utils.getValue(jqXhr, "responseJSON.code") || textStatus
                    ;

                    statusMsg = snippetError
                                .replace( /%errorMsg%/g, errorMsg)
                                .replace( /%entityId%/g, entityId);

                    $cardHeader.empty().prepend($(statusMsg));

                    //$successLabel.empty().i18nText('successSubmitted', appName);

                    _showAllView('errorCard' + entityId );

                    if (options && options.error)
                    {
                        options.error( );
                    }
                }
            }
        );
    }

    function _recoverOrigForm( $btn, options)
    {
        var label       = options.label
        ,   isdisabled  = options.disabled
        ;

        $btn.i18nText( "loadingLbl" );

        $btn.data( "confirm", false );

        $btn.addClass( isdisabled );

        $btn.removeClass( "btn-danger" );
    }

    function _assignActorAction( options  )
    {
        var     $btnAssign  =   options.$btnAssign
        ,       role        =   options.role
        ,       confirmTimer
        ,       orgText
        ;

        $btnAssign.click( function( e )
        {
            e.preventDefault();

            var params
            ,   status
            ,   btnEntityId
            ,   businessPlanEntityId
            ,   radioName
            ,   $radio
            ,   $inputRole
            ,   actorsArr      = []
            ,   inputName
            ,   dropDownRoleValues
            ,   updateAppsActors =  {}
            ;

            businessPlanEntityId        =   $btnAssign.data( "entityid" );

            inputName                   =   role + '-' + businessPlanEntityId;    // Example assessors-1212 , judge-23434

            $inputRole                  =   $element.find( "[name=" + inputName + "]" );

            dropDownRoleValues          =   bidx.utils.getElementValue( $inputRole );

            if(dropDownRoleValues)
            {

                $.each( dropDownRoleValues, function( idx, actorId )
                {
                    actorsArr.push ( {
                                        'actorId':   actorId
                                    });
                });
            }

                 updateAppsActors [ role ]   =   actorsArr;

                if ( $btnAssign.data( "confirm" ) )
                {
                    clearTimeout( confirmTimer );

                    //quick reset of the timer array you just cleared

                    _recoverOrigForm( $btnAssign
                                    ,   {
                                            disabled:   'disabled'
                                        }
                                    );

                    _updateActorsToApplications(
                    {
                        competitionId:      competitionSummaryId
                    ,   entityId:           businessPlanEntityId
                    ,   data:               updateAppsActors
                    ,   callback:           function( response )
                                            {
                                                if (options && options.success)
                                                {
                                                    options.success( response );
                                                }

                                                $btnAssign.text( orgText ).removeClass('disabled');
                                            }
                    ,   error:              function ()
                                            {
                                                $btnAssign.text( orgText ).removeClass('disabled');
                                            }
                    } );

                }
                else
                {
                    orgText = $btnAssign.text();

                    $btnAssign.data( "confirm", true );

                    $btnAssign.addClass( "btn-danger" );
                    $btnAssign.i18nText( "btnConfirm" );

                    startConfirmTimer( $btnAssign, orgText );
                }
            //}

            function startConfirmTimer( $btn, orgText )
            {
                confirmTimer = setTimeout( function( )
                {
                    $btn.text( orgText );
                    $btn.data( "confirm", false );

                    $btn.removeClass( "btn-danger" );
                    $btn.addClass( "btn-md" );

                }, 5000 );

            }
        });
    }

    function _assignBtnAction( options  )
    {
        var     $btnAction  =   options.$btnAction
        ,       role        =   options.role
        ,       action      =   options.action
        ,       confirmTimer
        ,       orgText
        ;

        $btnAction.click( function( e )
        {
            e.preventDefault();

            var params
            ,   status
            ,   btnEntityId
            ,   businessPlanEntityId
            ,   radioName
            ,   data
            ,   $radio
            ;

            switch( action )
            {
                case 'apply' :

                btnEntityId             =   $btnAction.data( "entityid" ); // For Submit/Withdraw buttons

                businessPlanEntityId    =   (btnEntityId) ? btnEntityId : $businessSummary.val(); // for First time Particpate/Applied Button , next time from card apply button

                status                  =   $btnAction.data( "status" );

                break;

                case'submit':
                case 'withdraw':

                btnEntityId             =   $btnAction.data( "entityid" ); // For Submit/Withdraw buttons

                businessPlanEntityId    =   btnEntityId;

                status                  =   $btnAction.data( "status" );

                break;

                case 'finalist':
                case 'winner':
                case 'qualification':

                businessPlanEntityId    =   $btnAction.data( "entityid" );

                radioName               =   'is' + action + businessPlanEntityId;

                $radio                  =   $element.find( "[name=" + radioName + "]" );

                status                  =   bidx.utils.getElementValue( $radio ); // for First time Particpate/Applied Button

                break;
            }

            if ( !businessPlanEntityId )
            {
                bidx.utils.error( "[competition] No entity id, unable to apply!", businessPlanEntityId );
                return;
            }

            bidx.utils.log('[competition] Competition Action Button Clicked', status);
            bidx.utils.log('[competition] Competition Action EntityId', businessPlanEntityId);

            function startConfirmTimer( $btn, orgText )
            {
                confirmTimer = setTimeout( function( )
                {
                    $btn.text( orgText );
                    $btn.data( "confirm", false );

                    $btn.removeClass( "btn-danger" );
                    $btn.addClass( "btn-md" );

                }, 5000 );

            }

            if ( $btnAction.data( "confirm" ) )
            {
                clearTimeout( confirmTimer );

                //quick reset of the timer array you just cleared

                _recoverOrigForm( $btnAction
                                ,   {
                                        disabled:   'disabled'
                                    }
                                );

                data    =   {
                                entityId    :   businessPlanEntityId
                            ,   status      :   status
                            };


                _updatePlanStatusToCompetition(
                {
                    competitionId:  competitionSummaryId
                ,   data:           data
                ,   callback:       function( response )
                                    {
                                        if (options && options.success)
                                        {
                                            options.success( response );
                                        }

                                        $btnAction.text( orgText ).removeClass('disabled');
                                    }
                ,  error:           function ( )
                                    {
                                        $btnAction.text( orgText ).removeClass('disabled');
                                    }
                } );

            }
            else
            {
                orgText = $btnAction.text();

                $btnAction.data( "confirm", true );

                $btnAction.addClass( "btn-danger" );
                $btnAction.i18nText( "btnConfirm" );

                startConfirmTimer( $btnAction, orgText );
            }
        });
    }

    // Beware! validation should have been tested, this is just a function for callin the API for saving
    //
    function _save( params )
    {
        if ( !competitionSummary )
        {
            return;
        }

        // Update the business summary object
        //
        _getFormValues();

        // PM-187: Create call should set the periodStartDate to the first januari of the year the businessummary is created
        //


        bidx.common.notifySave();

        // Save the data to the API
        //
        bidx.api.call(
            "competition.save"
        ,   {
                // Undefined when creating the business summary
                //
                competitionSummaryId:      competitionSummaryId
            ,   groupDomain:            bidx.common.groupDomain
            ,   data:                   competitionSummary
            ,   success:        function( response )
                {
                    bidx.utils.log( "competitionSummary.save::success::response", response );

                    var bidxMeta = bidx.utils.getValue( response, "data.bidxMeta" );

                    if ( state === "create" )
                    {
                        competitionSummaryId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );
                    }

                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    bidx.common.removeAppWithPendingChanges( appName );

                    document.location.href = bidx.common.url('competition')  + competitionSummaryId + "?rs=true";


//                    var url = document.location.href.split( "#" ).shift();
//                    // Maybe rs=true was already added, or not 'true' add it before reloading
//                    //
//                    var rs = bidx.utils.getQueryParameter( "rs", url );
//                    var redirect_to = bidx.utils.getQueryParameter( "redirect_to", url );
//
//
//                    if( redirect_to ) {
//                        url = '/' + redirect_to;
//                    }
//
//                    if ( !rs || rs !== "true" )
//                    {
//                        url += ( url.indexOf( "?" ) === -1 ) ? "?" : "&";
//                        url += "rs=true";
//                    }
//
//                    document.location.href = url;

                }
            ,   error:          function( jqXhr )
                {
                    params.error( jqXhr );

                    bidx.common.closeNotifications();
                }
            }
        );
    }

    function _loadMyApplications()
    {
        var myApplicationsAny
        ,   bpLength    = _.size(listDropdownBp)
        ;

        if( bpLength )
        {
            $.each( listDropdownBp, function( idx, entityId )
            {
                myApplicationsAny = _.findWhere( applicationObj, { 'entityId' : parseInt(entityId, 10) } );

                if ( !$.isEmptyObject(myApplicationsAny) )
                {
                    _appendCardValues( {
                                        list:               'viewOwnCard'
                                    ,   entityId:           entityId
                                    ,   applicationObj:     applicationObj
                                    });
                }
                else
                {
                    canParticipate[ entityId ]  =   entityId;
                }
            });
        }
    }

    function _displayWinners( planStatus )
    {
        var entityId
        ,   bidxMeta
        ,   listItem
        ,   $listItem
        ,   statusObj
        ,   displayClass        = '.' + planStatus + 'Display'
        ,   $list               = $element.find(displayClass)
        ,   snippetClass        = '#' + planStatus +  '-snippet'
        ,   snippet             = $( snippetClass ).html().replace(/(<!--)*(-->)*/g, "")
        ,   $listError          = $("#error-card").html().replace(/(<!--)*(-->)*/g, "")
        ,   $ratingWrapper
        ,   $raty
        ,   emptyVal            = ''
        ;

        statusObj          = _.where( applicationObj, { status : planStatus.toUpperCase() } );

        if( statusObj.length )
        {
            $.each( statusObj, function( idx, result )
            {
                if ( !$.isEmptyObject(result) )
                {
                    entityId    =   result.entityId;

                    bidxMeta    =   bidx.utils.getValue(result, "bidxMeta");

                    listItem    =   snippet
                            .replace( /%entityId%/g,                    entityId                        ? entityId     : emptyVal )
                            .replace( /%bidxOwnerId%/g,                 bidxMeta.bidxOwnerId )
                            .replace( /%bidxOwnerDisplayName%/g,        bidxMeta.bidxOwnerDisplayName   ? bidxMeta.bidxOwnerDisplayName     : emptyVal )
                            .replace( /%bidxRatingAverage%/g,           bidxMeta.bidxRatingAverage      ? bidxMeta.bidxRatingAverage.toFixed(1)     : emptyVal )
                            .replace( /%bidxEntityDisplayName%/g,       bidxMeta.bidxEntityDisplayName  ? bidxMeta.bidxEntityDisplayName     : emptyVal )
                            ;
                    $listItem   =   $(listItem);

                    /* Displaying Rating Star Logic */
                    $ratingWrapper              = $listItem.find( ".rating-wrapper" );
                    $raty                       = $ratingWrapper.find( ".raty" );

                    $raty.raty({
                        starType: 'i',
                        readOnly: true,
                        // TODO Arjan remove or translate?
                        hints:  ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
                        score:  bidxMeta.bidxRatingAverage.toFixed(1)

                    });

                    $list.append( $listItem );

                }
            });

            _showAllView( planStatus );
        }




    }

    // Private functions
    //
    var _showError = function( msg )
    {
        $views.filter( ".viewError" ).find( ".errorMsg" ).text( msg );
        _showView( "error" );
    };

    var _showView = function( v )
    {
        currentView = v;
        $views.hide().filter( ".view" + v.charAt( 0 ).toUpperCase() + v.substr( 1 ) ).show();

        if ( currentView === "show" )
        {
            $element.find( ".total-error-message" ).hide();
        }
    };
    var _showAllView = function ( view )
    {
        var $view = $views.filter( bidx.utils.getViewName( view ) ).show();
    };

    var _hideView = function( hideview )
    {
        $views.filter(bidx.utils.getViewName(hideview)).hide();
    };

    // ROUTER
    //
    function navigate( options )
    {
        var params  = options.params
        ,   cancel  = bidx.utils.getValue( params, 'cancel')
        ;
        bidx.utils.log('options', options);
        if ( options.requestedState !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        switch ( options.requestedState )
        {
            case 'view':

                bidx.utils.log( "competitionSummary::AppRouter::view" );

                competitionSummaryId    =   bidx.utils.getValue( bidxConfig, "context.competitionId" );

                if(cancel)
                {
                    _hideView ( 'apply' ) ;
                    _showAllView ( 'participate' ) ;
                    bidx.controller.updateHash ( "#viewCompetition", false );
                }

                break;

            case 'apply':



                break;
            case 'load':
                bidx.utils.log( "competitionSummary::AppRouter::load", params );

                // Hide common-mentordashboard.js mentor ex click on cacncel modal box etc
                $( ".bidx-modal").unbind('hide');
                $( ".bidx-modal").modal('hide');




            break;
            case "edit":
                bidx.utils.log( "competitionSummary::AppRouter::edit", options.id, options.section );

                var newcompetitionSummaryId
                ,   splatItems
                ,   updateHash      = false
                ,   isId            = ( options.id && options.id.match( /^\d+$/ ) )
                ;

                if ( options.id && !isId )
                {
                    options.section = options.id;
                    options.id      = competitionSummaryId;

                    updateHash = true;
                }


                if ( !( state === "edit" && options.id === competitionSummaryId ) )
                {
                    competitionSummaryId   = options.id;
                    state               = "edit";

                    _showView( "load" );

                    // Make sure the i18n translations and static data api items for this app are available before initing
                    //
                    bidx.i18n.load( [ "__global", appName ] )
                        .then( function()
                        {
                            return bidx.data.load( [ "country" ] );
                        } )
                        .done( function()
                        {
                            _init( state );
                        } );
                }

                $element.addClass( "edit" );

                if ( updateHash )
                {
                    var hash = "editcompetitionSummary/" + options.id;

                    if ( options.section )
                    {
                         hash += "/" + options.section;
                    }

                    return hash;
                }

            break;

            case "create":
                bidx.utils.log( "CreatecompetitionSummary::AppRouter::create" );

                competitionSummaryId   = null;
                state               = "create";

                _showView( "load" );

                // Make sure the i18n translations for this app are available before initing
                //
                bidx.i18n.load( [ "__global", appName ] )
                    .done( function()
                    {
                        _init( state );
                    } );
            break;
        }
    }

    // Reset the whole application
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );

    }

    // Engage!
    //
    _competitionTimer();

    if(loggedInMemberId)
    {
        _oneTimeSetup();
    }

    // Expose
    //
    var app =
    {
        navigate:                   navigate
    ,   reset:                      reset

    ,   $element:                   $element

        // START DEV API
        //
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.competition = app;


    // if hash is empty and there is not path in the uri, load #home
    //
    if ($("body.bidx-competition").length && !bidx.utils.getValue(window, "location.hash").length)
    {
        window.location.hash = "#viewCompetition";
    }
} ( jQuery ));
