;( function ( $ )
{
    "use strict";

    var $element          =     $( "#businessSummary" )
    ,   $industrySectors  =     $element.find( ".industrySectors" )
    ,   bidx              =     window.bidx
    ,   appName           =     "expressform"
    ,   $btnSave
    ,   $btnCancel
    ,   $editControls     =     $element.find( ".editControls" )
    ,   $bsLogo           =     $element.find( ".bsLogo" )
    ,   $bsLogoBtn        =     $bsLogo.find( "[href$='#addLogo']" )
    ,   $bsLogoRemoveBtn  =     $bsLogo.find( "[href$='#removeLogo']" )
    ,   $controlsForEdit  =     $editControls.find( ".viewEdit" )
    ,   $controlsForError =     $editControls.find( ".viewError" )
    ,   $bsLogoModal      =     $bsLogo.find( ".addLogoImage" )
    ,   $logoContainer    =     $bsLogo.find( ".logoContainer" )
    ,   snippets          =     {}
    ,   $views            =     $element.find( ".view" )
    ,   expressFormData   =     window.__bidxExpressForm
    ,   businessSummary   =     bidx.utils.getValue( expressFormData, 'business')
    ,   member            =     bidx.utils.getValue( expressFormData, 'member')
    ,   personalDetails   =     bidx.utils.getValue( member, 'bidxMemberProfile.personalDetails')
    ,   forms             =
        {
            generalOverview:
            {
                $el:                    $element.find( "#formExpressForm-GeneralOverview" )
            }
        ,   personalDetails:
            {
                $el:                    $element.find( "#formExpressForm-PersonalDetails" )
            }
        ,   financialDetails:
            {
                $el:                    $element.find( "#formExpressForm-FinancialDetails" )
            }
        }

        // Financial Summary / Details
        //
    ,   $financialSummary                   = $element.find( ".financialSummary")
    ,   $financialSummaryYearsContainer     = $financialSummary.find( ".fs-col-years" )
    ,   financialSummary            =
        {
            deletedYears:               {}
        }
    ,   state
    ,   currentView
    ,   businessSummaryId           = ( businessSummary ) ? bidx.utils.getValue( businessSummary, "bidxMeta.bidxEntityId" ) : null
    ,   icl_vars                    = window.icl_vars || {}
    ,   iclLanguage                 = bidx.utils.getValue( icl_vars, "current_language" )
    ,   currentLanguage             = (iclLanguage && iclLanguage !== 'en') ? '/' + iclLanguage : ''
    ;

    // Form fields
    //
    var fields =
    {
        "personalDetails":
        {
            "_root":
            [
                'firstName'
            ,   'lastName'
            ,   'gender'
            ,   'emailAddress'
            ,   'mobile'
            ,   'cityTown'
            ]
        }
    ,   "generalOverview":
        {
            "_root":
            [
                "name"
            ,   "summary"
            ,   "externalVideoPitch"
            ]
        }
    ,   "financialDetails":
        {
            "_arrayFields":
            [
                "financialSummaries"
            ]
        /*,   "_root":
            [
                "yearSalesStarted"
            ,   "equityRetained"
            ,   "investmentType"
            ,   "summaryFinancingNeeded"
            ] */
        ,   "financialSummaries":
            [
                "financeNeeded"
            ,   "numberOfEmployees"
            ,   "operationalCosts"
            ,   "salesRevenue"
            //  totalIncome is a derived field, but not a input
            ]
        }
    };

    // Use the retrieved businessSummary entity to populate the form and other screen elements
    //
    function _populateScreen()
    {
        // Go iteratively over all the forms and there fields
        //
        var $input
        ,   $form
        ,   value
        ,   fp
        ;

        $.each( fields, function( form, formFields )
        {
            $form       = forms[ form ].$el;

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    if( form !== 'personalDetails' )
                    {
                        if( businessSummary )
                        {
                            value  = bidx.utils.getValue( businessSummary, f );

                            $input = $form.find( "[name='" + f + "']" );

                            bidx.utils.setElementValue( $input, value );
                        }
                    }
                    else
                    {
                        fp  =   f;

                        switch( f )
                        {
                            case 'mobile':

                            f   =   'contactDetail[0].mobile';

                            fp  =   'contactDetail.0.mobile';

                            break;

                            case 'cityTown':

                            f   =   'address[0].cityTown';

                            fp  =   'address.0.cityTown';

                            break;

                        }

                        value  = bidx.utils.getValue( personalDetails, fp );

                        $input = $form.find( "[name='" + f + "']" );

                        bidx.utils.setElementValue( $input, value );
                    }
                } );
            }
        } );

        if( businessSummary )
        {
            // Industry Sectors
            var data = bidx.utils.getValue( businessSummary, "industry", true );

            if ( data )
            {
                $industrySectors.industries( "populateInEditScreen",  data );
            }

            var logoImage = bidx.utils.getValue( businessSummary, "logo" );

            if ( logoImage && logoImage.document )
            {
                $logoContainer.empty();
                $logoContainer.append( "<img src='"+ logoImage.document +"' />" );
                $logoContainer.addClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).removeClass( "hide" );
            }

            // Financial Summaries is an object of which the keys are years and the body is the financial summary
            // for that year
            //
            // Since the HTML is already there, rendered by PHP, we just have to update the fields with the latest values
            // You could argue why this is needed and not just use the 'view rendering time' values, but doing this now
            // ensures the values are as up to date as possible.
            //
            var financialSummaries = bidx.utils.getValue( businessSummary, "financialSummaries" );

            if ( financialSummaries )
            {
                $.each( financialSummaries, function( year, data )
                {
                    var $yearItem = $financialSummaryYearsContainer.find( "[data-year='" + year + "']" );

                    _updateFinancialSummariesItem( $yearItem, data );
                } );
            }
        }
    }

    // Update the pre-rendered dom elements for the financial summary
    //
    function _updateFinancialSummariesItem( $item, data )
    {
        $.each( fields.financialDetails.financialSummaries, function( idx, f )
        {
            var value = data[ f ] || "";

            $item.find( "[name^='" + f + "']" ).val( value );
        } );

        $item.find( ".totalIncome .viewEdit" ).text("$ " + data[ "totalIncome" ]);
    }


    // Logo
    //
    $bsLogoBtn.click( function( e )
    {
        e.preventDefault();

        // Make sure the media app is within our modal container
        //
        $( "#media" ).appendTo( $bsLogoModal.find( ".modal-body" ) );

        var $selectBtn = $bsLogoModal.find( ".btnSelectFile" )
        ,   $cancelBtn = $bsLogoModal.find( ".btnCancelSelectFile" )
        ;

        // Navigate the media app into list mode for selecting files
        //
        bidx.media.navigate(
        {
            requestedState: "list"
        ,   slaveApp      :               true
        ,   selectFile    :             true
        ,   multiSelect   :            false
        ,   showEditBtn   :            false
        ,   onlyImages    :             true
        ,   btnSelect     :              $selectBtn
        ,   btnCancel     :              $cancelBtn
        ,   callbacks     :
            {
                ready:                  function( state )
                {
                    bidx.utils.log( "[logo] ready in state", state );
                }

            ,   cancel:                 function()
                {
                    // Stop selecting files, back to previous stage
                    //
                    $bsLogoModal.modal('hide');
                }

            ,   success:                function( file )
                {
                    bidx.utils.log( "[logo] uploaded", file );

                    // NOOP.. the parent app is not interested in when the file is uploaded
                    // only when it is attached / selected
                }

            ,   select:               function( file )
                {

                    bidx.utils.log( "[logo] selected profile picture", file );

                    $logoContainer.data( "bidxData", file );
                    $logoContainer.html( $( "<img />", { "src": file.document, "data-fileUploadId": file.fileUpload } ));
                    $logoContainer.addClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).removeClass( "hide" );

                    $bsLogoModal.modal( "hide" );
                }
            }
        });

        $bsLogoModal.modal();
    });

    $bsLogoRemoveBtn.click( function( e )
    {
        e.preventDefault();

        $logoContainer.find( "img" ).remove();
        $logoContainer.html( '<div class="icons-rounded"><i class="fa fa-suitcase text-primary-light"></i></div>' );
        $logoContainer.removeClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).addClass( "hide" );

        //businessSummary.logo = null;
    });

    // Setup initial form validation
    //
    function _setupValidation()
    {
        forms.personalDetails.$el.validate(
        {
            debug:          false
        ,   rules:
            {
                "firstName":
                {
                    required:               true
                }
            ,   "lastName":
                {
                    required:               true
                }
            ,   "gender":
                {
                    required:               true
                }
            ,   "emailAddress":
                {
                    email:                   true
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

        forms.generalOverview.$el.validate(
        {
            ignore:         "#frmeditMedia input, #frmeditMedia select"
        ,   debug:          false
        ,   rules:
            {
                name:
                {
                    required:               true
                ,   maxlength:              30
                }
            ,   summary:
                {
                    required:               true
                ,   maxlength:              900
                }
            ,   "focusIndustrySector[0]mainSector":
                {
                    required:      true
                }
            ,   "focusIndustrySector[0]subSector":
                {
                    required:      true
                }
            ,   "focusIndustrySector[0]endSector":
                {
                    required:      true
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

        // Financial Details
        //
        forms.financialDetails.$el.validate(
        {
            ignore:                 ""
        ,   debug:                  false
        ,   rules:
            {
                yearSalesStarted:
                {
                    required:               true
                }
            ,   financeNeeded:
                {
                    required:               true
                }
            }

        ,   messages:
            {

            }

        ,   submitHandler:        function( e )
            {
                _doSave();
            }
        } );
    }


    // private functions
    //
    function _oneTimeSetup()
    {
        snippets.$financialSummaries    = $financialSummary.find( ".snippets" ).find( ".financialSummariesItem" ).remove();
        _setupValidation();
        _financialSummary();

        $industrySectors.industries();

        forms.financialDetails.$el.find( "[name='yearSalesStarted']" ).bidx_chosen();

        $bsLogoRemoveBtn.click( function( e )
        {
            e.preventDefault();

            $logoContainer.find( "img" ).remove();
            $logoContainer.html( '<div class="icons-rounded"><i class="fa fa-suitcase text-primary-light"></i></div>' );
            $logoContainer.removeClass( "logoPlaced" ).parent().find( "[href$='#removeLogo']" ).addClass( "hide" );

            businessSummary.logo = null;
        } );


    }

    // Try to save the businessSummary to the API
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

        if( forms )
        {
            $.each( forms, function( name, form )
            {
                if ( !form.$el.valid() )
                {
                    bidx.utils.warn( "[ExpressForm] Invalid form", form.$el, form.$el.validate().errorList );

                    anyInvalid = true;
                }
            } );
        }

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
                    bidx.utils.error( "problem parsing error response from businessSummary save" );
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

    // Setup the financial summary component
        //
    function _financialSummary()
    {
        // FinancialSummary
        //
        var $btnNext        = $financialSummary.find( "a[href$=#next]" )
        ,   $btnPrev        = $financialSummary.find( "a[href$=#prev]" )
        ,   $btnAddPrev     = $financialSummary.find( "a[href$=#addPreviousYear]" )
        ,   $btnAddNext     = $financialSummary.find( "a[href$=#addNextYear]" )

        ,   curYear         = bidx.common.getNow().getFullYear()
        ;
        // Add on year to the left
        //
        $financialSummary.delegate( "a[href$=#addPreviousYear]", "click", function( e )
        {
            e.preventDefault();

            _addFinancialSummaryYear( "prev" );
        } );

        // Add on year to the right
        //
        $financialSummary.delegate( "a[href$=#addNextYear]", "click", function( e )
        {
            e.preventDefault();

            _addFinancialSummaryYear( "next" );
        } );

        // Delete the year
        //
        $financialSummary.delegate( "a[href$=#deleteYear]", "click", function( e )
        {
            e.preventDefault();

            var $financialSummariesItem = $( this ).closest( ".financialSummariesItem" )
            ,   year                    = parseInt( $financialSummariesItem.attr( "data-year" ), 10 )
            ;

            _deleteFinancialSummaryYear( year );
        } );

        // Navigate one year to the left
        //
        $financialSummary.delegate( "a[href$=#prev]", "click", function( e )
        {
            e.preventDefault();

            _navigateYear( "prev" );
        } );

        // Navigate one year to the right
        //
        $financialSummary.delegate( "a[href$=#next]", "click", function( e )
        {
            e.preventDefault();

            _navigateYear( "next" );
        } );

        // Calculate the totalincome when the salesRevenue and/or operationalCosts change
        //
        $financialSummaryYearsContainer.delegate( "input[name^='salesRevenue'],input[name^='operationalCosts']", "change", function()
        {
            var $input  = $( this )
            ,   $item   = $input.closest( ".financialSummariesItem" )
            ;

            _calculateTotalIncome( $item );
        } );

        // Itterate over the server side rendered year items
        //
        bidx.utils.log('$financialSummaryYearsContainer', $financialSummaryYearsContainer);
        $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem)" ).each( function( )
        {
            var $yearItem   = $( this )
            ,   year        = parseInt( $yearItem.attr( "data-year" ), 10 )
            ;

            _setupValidationForYearItem( $yearItem );

            // Show the delete button on the last / first year in case the year is not current year
            //
            if ( state === "edit" )
            {
                if ( $yearItem.hasClass( "first" ) && year < curYear )
                {
                    $yearItem.find( ".btnDelete" ).show();
                }
                else if ( $yearItem.hasClass( "last" ) && year > curYear )
                {
                    $yearItem.find( ".btnDelete" ).show();
                }
            }
        } );

        // Setup validation on a specific year item
        // Altaf
        function _setupValidationForYearItem( $yearItem )
        {
            // Shortcut it for now by treating all the inputs the same
            //
            $yearItem.find( "input" ).each( function( )
            {
                var $input          = $( this )
                ,   name            = $input.prop( "name" )
                ;

                $input.rules( "add",
                {
                    required:               true
                ,   monetaryAmount:         true

                ,   messages:
                    {
                        required:               ""
                    ,   monetaryAmount:         "Please enter only numbers"
                    }
                } );
            } );
        }

        // Add a financial year item
        //
        function _addFinancialSummaryYear( direction )
        {
            var $item       = snippets.$financialSummaries.clone()
            ,   year
            ,   yearLabel
            ,   $otherYear
            ,   otherYear
            ,   $marker
            ;

            // What is the year we are going to add?
            //
            if ( direction === "prev" )
            {
                $marker     = $financialSummaryYearsContainer.find( ".addItem:first" );
                $otherYear  = $marker.next();
                otherYear   = parseInt( $otherYear.attr( "data-year" ), 10 );

                // Is there no other year? This can only happen when there are absolutely none year items in the DOM
                //
                if ( !otherYear )
                {
                    year        = curYear;
                    yearLabel   = bidx.i18n.i( "currentYear", appName );
                }
                else
                {
                    year        = otherYear - 1;
                    yearLabel   = bidx.i18n.i( "actuals", appName );
                }
            }
            else
            {
                $marker     = $financialSummaryYearsContainer.find( ".addItem:last" );
                $otherYear  = $marker.prev();
                otherYear   = parseInt( $otherYear.attr( "data-year" ), 10 );

                if ( !otherYear )
                {
                    year        = curYear;
                    yearLabel   = bidx.i18n.i( "currentYear", appName );
                }
                else
                {
                    year        = otherYear + 1;
                    yearLabel   = bidx.i18n.i( "forecast", appName );
                }
            }

            // Add administration of the item
            //
            $item.attr( "data-year", year );
            $item.addClass( "new" );

            // Set content in the header
            //
            $item.find( ".year"         ).text( year );
            $item.find( ".yearLabel"    ).text( yearLabel );

            // Move the available delete year button to the new year
            //
            $otherYear.find( ".btnDelete" ).hide();
            $item.find( ".btnDelete" ).show();

            if ( direction === "prev" )
            {
                $otherYear.removeClass( "first" );
                $item.addClass( "first" );

                $marker.after( $item );
            }
            else
            {
                $otherYear.removeClass( "last" );
                $item.addClass( "last" );

                $marker.before( $item );
            }

            // Rename all the input elements to include the year
            //
            $item.find( "input" ).each( function( )
            {
                var $input      = $( this )
                ,   name        = $input.prop( "name" )
                ,   newName     = name.replace( "[]", "[" + year + "]" )
                ;

                $input.prop( "name", newName );
            } );

            _setupValidationForYearItem( $item );

            financialSummary.selectYear( year );
        }

        // Delete the year from the DOM and administer it's deleting so we can communicate it as being delete to the
        // API
        //
        function _deleteFinancialSummaryYear( year )
        {
            var $year          = $financialSummaryYearsContainer.find( ".financialSummariesItem[data-year='" + year + "']" )
            ,   newYear
            ,   $newYear       = $year.next()
            ;

            // What to select as a new year?
            //
            if ( !$newYear.is( ".addItem" ) )
            {
                newYear = year + 1;
            }
            else
            {
                $newYear = $year.prev();

                if ( !$newYear.is( ".addItem" ) )
                {
                    newYear = year - 1;
                }
                else
                {
                    $newYear = undefined;
                }
            }

            // Now we know what we are to move next to, remove it from the DOM
            //
            $year.remove();
            financialSummary.deletedYears[ year ] = true;

            if ( $newYear )
            {
                // If it isn't the current year, show the delete button on the new year
                //
                if ( newYear !== curYear && state === "edit" )
                {
                    $newYear.find( ".btnDelete" ).show();
                }

                if ( newYear )
                {
                    financialSummary.selectYear( newYear );
                }
            }
        }

        // Calculate the new total income
        //
        function _calculateTotalIncome( $item )
        {
            var salesRevenue        = parseInt( $item.find( "input[name^='salesRevenue']"     ).val(), 10 ) || 0
            ,   operationalCosts    = parseInt( $item.find( "input[name^='operationalCosts']" ).val(), 10 ) || 0
            ,   totalIncome         = salesRevenue - operationalCosts
            ;

            $item.find( ".totalIncome .viewEdit" ).text( "$ " + totalIncome );
        }

        // Select a certain year, update the selected state, show the correct years and disable/enable the buttons
        //
        function selectYear( year )
        {
            var $years          = $financialSummaryYearsContainer.find( ".financialSummariesItem" )
            ,   $selectedYear   = $years.filter( ".selected" )
            ,   $visibleItems   = $years.filter( ":visible" )
            ,   $yearItem       = $years.filter( "[data-year='" + year + "']" )
            ,   $prevItem       = $yearItem.prev()
            ,   $nextItem       = $yearItem.next()
            ;

            $selectedYear.removeClass( "selected" );
            $yearItem.addClass( "selected" );

            // Hide all and show conditional the new situation
            //
            $years.hide();

            // Show at least the newly selected year
            //
            $yearItem.show();

            // Responsive design decision. Is the year hugely smaller than the container?
            // Seems to be more correct than testing for css display property which sometimes just says it's
            // block while it isn't
            //
            if ( $yearItem.width() + 100 < $yearItem.parent().width()  )
            {
                $nextItem.show();
                $prevItem.show();
            }

            if ( $prevItem.is( ".addItem" ) )
            {
                $btnPrev.addClass( "disabled" );
            }
            else
            {
                $btnPrev.removeClass( "disabled" );
            }

            if ( $nextItem.is( ".addItem" ) )
            {
                $btnNext.addClass( "disabled" );
            }
            else
            {
                $btnNext.removeClass( "disabled" );
            }
        }

        // Either navigate next or prev
        // Beware, direction is used as a jquery DOM function in this method
        //
        function _navigateYear( direction )
        {
            var $selectedYear   = $financialSummaryYearsContainer.find( ".financialSummariesItem.selected" )
            ,   $otherYear
            ,   otherYear
            ,   $btn
            ;

            switch ( direction )
            {
                case "next":
                    $btn = $btnNext;
                break;

                case "prev":
                    $btn = $btnPrev;
                break;

                default:
                    // NOOP
                    bidx.utils.warn( appName + "::_navigateYear: unknown direction: " + direction );
            }

            if ( !$btn || !$btn.length || $btn.hasClass( "disabled" ) )
            {
                return;
            }

            // What is the year item we want to navigate to?
            //
            $otherYear  = $selectedYear[ direction ]( ":not(.addItem)" );
            otherYear   = parseInt( $otherYear.attr( "data-year" ), 10 );

            financialSummary.selectYear( otherYear );
        }

        // Expose financial summary fucntinos
        //
        financialSummary.selectYear = selectYear;
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
            bidx.utils.log('form', form);
            form += "";
             bidx.utils.log('form', form);

            if ( formFields._root )
            {
                $.each( formFields._root, function( i, f )
                {
                    var $input
                    ,   value
                    ;
                     bidx.utils.log('f', f);

                    if( form === 'personalDetails' )
                    {
                        switch (f)
                        {
                            case 'cityTown':
                                f   =   'address.0.cityTown';
                            break;

                            case 'mobile':
                                f   =   'contactDetail.0.mobile';
                            break;
                        }

                        $input = $form.find( "[name='personalDetails." + f + "']" );

                        value  = bidx.utils.getElementValue( $input );

                        bidx.utils.setValue( member, "bidxMemberProfile.personalDetails." + f, value );
                    }
                    else
                    {

                        $input = $form.find( "[name^='" + f + "']" );
                        bidx.utils.log('input', $input);


                        value  = bidx.utils.getElementValue( $input );

                        bidx.utils.log('value', value);

                        bidx.utils.setValue( businessSummary, f, value );
                    }
                } );
            }

            if( form !== 'personalDetails' )
            {
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

                    bidx.utils.setValue( businessSummary, "industry", arr );
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

                    // @TODO: make it generic for 'object type' like financialSummaries is
                    //
                    if ( nest === "financialSummaries" )
                    {
                        item = {};
                        bidx.utils.setValue( businessSummary, objectPath, item );

                        $form.find( ".financialSummariesItem" ).each( function( idx, financialSummariesItem )
                        {
                            var $financialSummariesItem = $( financialSummariesItem )
                            ,   year                    = $financialSummariesItem.data( "year" )
                            ;

                            // Make sure we have an actual year by parsing it to a number
                            //
                            year = parseInt( year, 10 );

                            if ( !year )
                            {
                                return;
                            }

                            item[ year ] = {};

                            $.each( formFields[ nest ], function( i, f )
                            {
                                var $input  = $financialSummariesItem.find( "[name^='" + f + "']" )
                                ,   value   = bidx.utils.getElementValue( $input )
                                ;

                                if ( value === "" )
                                {
                                    value = 0;
                                }

                                item[ year ][ f ] = value;

                            } );
                        } );

                        // Is there anything in the deleted years object that is not present in the new situation?
                        //
                        var newYears            = $.map( item, function( v, k ) { return k; } )
                        ,   deletedYears        = $.map( financialSummary.deletedYears, function( v, k ) { return k; } )
                        ;

                        $.grep( deletedYears, function( y )
                        {
                            if ( $.inArray( y, newYears ) === -1 )
                            {
                                bidx.utils.log( "[businesssummary] deleted year", y );
                                item[ y ] = null;
                            }
                        } );
                    }
                    else
                    {
                        if ( arrayField )
                        {
                            count   = $form.find( "." + nest + "Item" ).length;
                            item    = [];
                        }
                        else
                        {
                            item    = {};
                        }

                        bidx.utils.setValue( businessSummary, objectPath, item );
                        bidx.utils.setNestedStructure( item, count, nest, $form, formFields[ nest ]  );
                    }

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
            }
        } );

        // Logo
        //
        var logoImageData = $logoContainer.data( "bidxData" );

        if ( logoImageData )
        {
            bidx.utils.setValue( businessSummary, "logo.fileUpload", logoImageData.fileUpload );
        }

    }


    // Beware! validation should have been tested, this is just a function for callin the API for saving
    //
    function _save( params )
    {
        var url
        ;

        // Update the business summary object
        //
        _getFormValues();

        // Make sure the entitytype is set correctly, probably only needed for 'create'
        //
        bidx.utils.setValue( businessSummary, "bidxMeta.bidxEntityType", "bidxBusinessSummary" );

        bidx.common.notifySave();

        bidx.utils.log( "About to save BusinessSummary::: ", businessSummary );

        // Save the data to the API
        //
        bidx.api.call(
            "businesssummary.save"
        ,   {
                // Undefined when creating the business summary
                //
                businessSummaryId:      businessSummaryId
            ,   groupDomain:            bidx.common.groupDomain
            ,   data:                   businessSummary
            ,   success:        function( response )
                {
                    bidx.utils.log( "businesssummary.save::success::response", response );

                    var bidxMeta = bidx.utils.getValue( response, "data.bidxMeta" );

                    if ( state === "create" )
                    {
                        businessSummaryId = bidx.utils.getValue( bidxMeta, "bidxEntityId" );
                    }

                    bidx.common.closeNotifications();
                    bidx.common.notifyRedirect();

                    bidx.common.removeAppWithPendingChanges( appName );


                    url = currentLanguage + "/expressform/" + businessSummaryId + "?rs=true";

                    document.location.href = url;

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

    // This is the startpoint for the edit state
    //
    function _init( state )
    {
        // Reset any state
        //
        financialSummary.deletedYears = {};


        var curYear         = bidx.common.getNow().getFullYear();

        // Inject the save and button into the controls
        //
        $btnSave    = $( "<a />", { "class": "btn btn-primary btn-lg", href: "#save"    });
        $btnCancel  = $( "<a />", { "class": "btn btn-primary btn-lg", href: "#viewExpressForm"});




        $btnCancel.bind( "click", function( e )
        {
            e.preventDefault();

            if( state === 'edit')
            {
                bidx.common.removeAppWithPendingChanges( appName );

                bidx.controller.updateHash( "#viewExpressForm", true );

                reset();

                bidx.common.removeValidationErrors();

                _showView( "show" );

            }
        } );

        $btnSave.bind( "click", function( e )
        {
            e.preventDefault();

            _doSave();
        } );


        $controlsForEdit.empty();

        if( state === 'create' )
        {
            $btnSave.i18nText( "btnApply" ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );

            $controlsForEdit.append(  $btnSave  );
        }
        else
        {
            $btnSave.i18nText( "btnSubmit" ).prepend( $( "<div />", { "class": "fa fa-check fa-above fa-big" } ) );

            $btnCancel.i18nText( "btnCancel" ).prepend( $( "<div />", { "class": "fa fa-times fa-above fa-big" } ) );

            $controlsForEdit.append( $btnCancel, $btnSave  );
        }

                //$controlsForError.empty();
        //$controlsForError.append( $btnCancel.clone( true ) );

        // Show the delete year buttons on the first/last year
        //
        var $firstYear  = $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem):first" )
        ,   $lastYear   = $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem):last"  )
        ,   firstYear   = parseInt( $firstYear.attr( "data-year" ), 10 )
        ,   lastYear    = parseInt( $lastYear.attr( "data-year" ), 10 )
        ;

        if ( firstYear < curYear )
        {
            $firstYear.find( ".btnDelete" ).show();
        }

        if ( lastYear > curYear )
        {
            $lastYear.find( ".btnDelete" ).show();
        }

        _showView( "edit" );

        if( state !== 'edit')
        {

            businessSummary     = {};
        }

    }

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

    // ROUTER
    //
    function navigate( options )
    {
        var params  = options.params
        ;

        state   =   options.requestedState;

        if ( options.requestedState !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        bidx.utils.log('options', options);

        if ( state !== "edit" )
        {
            $element.removeClass( "edit" );
        }

        switch ( state )
        {
            case 'view':

                bidx.utils.log( "ExpressForm::AppRouter::view" );

                _showView( "load" );

                if( businessSummaryId )
                {
                    _showView( "show" );
                }
                else
                {
                    bidx.controller.updateHash( "#createExpressForm", true );

                }

            break;

            case "create":

                bidx.utils.log( "ExpressForm::AppRouter::create" );

                _showView( "load" );

                 bidx.i18n.load( [ "__global", appName ] )
                .then( function()
                {
                    return bidx.data.load( [ "country" ] );
                } )
                .done( function()
                {
                    _init( state );

                    _populateScreen( );
                } );

            break;

            case "edit":

                bidx.utils.log( "ExpressForm::AppRouter::edit" );
                 // Make sure the i18n translations for this app are available before initing
                //
                _showView( "load" );

                bidx.i18n.load( [ "__global", appName ] )
                .then( function()
                {
                    return bidx.data.load( [ "country" ] );
                } )
                .done( function()
                {
                    _init( state );

                    _populateScreen( );
                } );

                $element.addClass( "edit" );

            break;
        }
    }

    // Reset the whole application
    //
    function reset()
    {
        state = null;

        bidx.common.removeAppWithPendingChanges( appName );

        // Remove any created years that haven't been saved and select the current year
        //
        $financialSummaryYearsContainer.find( ".financialSummariesItem.new" ).remove();

        var year     = bidx.common.getNow().getFullYear()
        ,   $year    = $financialSummaryYearsContainer.find( ".financialSummariesItem[data-year='" + year + "']" )
        ;

        // No current year??
        // Select the last one...
        //
        if ( $year.length === 0 )
        {
            $year   = $financialSummaryYearsContainer.find( ".financialSummariesItem:not(.addItem):last" );
            year    = $year.attr( "data-year" );
        }

        financialSummary.selectYear( year );
    }

    // Initialize handlers
    //
    _oneTimeSetup();

    // Expose
    //
    var app =
    {
        navigate:   navigate
    ,   $element:   $element
    };

    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.expressform = app;


    // Only update the hash when user is authenticating and when there is no hash defined
    //
    if ( $( "body.bidx-expressform" ).length )
    {
        var initHash
        ,   bidxHash        =   bidx.utils.getValue( window, "location.hash" )
        ,   allowedHash     =   ['viewExpressForm', 'editExpressForm', 'createExpressForm']
        ;

        if( _.indexOf(allowedHash, bidxHash) === -1 )
        {
            initHash            =   "#createExpressForm";
        }

        if( businessSummary )
        {
           initHash            =   "#viewExpressForm";
        }

       document.location.hash = initHash;
    }

} ( jQuery ));