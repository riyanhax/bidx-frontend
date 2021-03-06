/**
 * @description Reusable reflow plugin (jquery ui widget based)
 *
 * @namespace
 * @name bidx.industries
 * @version 1.0
 * @author
*/
;(function( $ )
{
    "use strict";
    /*
        Function: bidx.industries

        Used to create and industy rows for multilevel options
        Returns:
            None
    */

    var mainSectorArr = []
    ,   subSectorArr = []
    ,   endSectorArr = []
    ;

    bidx.data.getContext( "industry", function( err, industrySectors )
    {
        $.each(industrySectors, function(index, val)
        {
            var key = val.value;

            if ( !key.match(/[A-Z]{1}\./) )
            {
                mainSectorArr.push( val );
            }

            if ( !key.match(/[A-Z]{1}\.[0-9]+\./) && key.match(/[A-Z]{1}\./) )
            {
                subSectorArr.push( val );
            }

            if ( key.match(/[A-Z]{1}\.[0-9]+\./) )
            {
                endSectorArr.push( val );
            }
        } );

        sectorSort(mainSectorArr);
        sectorSort(subSectorArr);
        sectorSort(endSectorArr);
    } );

    function sectorSort( ar )
    {
        ar.sort(function(a,b){
            if(a.value > b.value){ return 1;}
            if(a.value < b.value){ return -1;}
            return 0;
        });
    }

    $.widget( "bidx.industries",
    {
        options: {
            widgetClass:        "industries"
        ,   sectorClass:        "industrySectors"
        ,   rowClass:           "industryRowItem"
        ,   actionsClass:       "industryActions"
        ,   selectionClass:     "industrySelection"
        ,   mainSectorArr:      mainSectorArr
        ,   subSectorArr:       subSectorArr
        ,   endSectorArr:       endSectorArr
        ,   state:              ""
        }

    ,   _create: function()
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   $row
            ;

            // Init
            //
            $row = widget._addRow();
            $row.find( ".mainSector" ).removeClass( "hide" );
            $row.find( ".industryIndicate" ).removeClass( "hide" );

            // Add row to DOM
            $el.append( $row );

            // Add new row
            //
            $el.delegate( ".industryAdd", "click", function( e )
            {
                var $el = $(this);

                $el.closest( "." + options.rowClass ).find( ".mainSector" ).removeClass( "hide" );
                $el.siblings( ".industryIndicate" ).removeClass( "hide" );
                $el.remove();
            });

            // Delete row
            //
            $el.delegate( ".industryDelete", "click", function( e )
            {
                $(this).closest( "." + options.rowClass ).remove();
            });

            // Main sector changed select event
            //
            $el.delegate( ".mainSector select, .subSector select", "change", function( e )
            {
                var opt
                ,   key = $(this).find(":selected" ).val()
                ;

                // Populate the array of matched options
                opt = widget._filterSelected( key );

                // Populate the dropdown
                if ( opt.length )
                {
                    widget._populateDropdown( opt, $(this) );
                }
            });
        }

    ,   _endSectorChangeEvents: function( elem )
        {
            var widget           = this
            ,   options          = widget.options
            ;

            elem.bind( "change", function( e )
            {
                $(this).parents( "." + options.sectorClass )
                    .append
                    (
                        widget._addRow().fadeIn( 100, function()
                        {
                            var $parentRow = elem.parents( "." + options.rowClass );

                            $parentRow.next().find( ".industryAdd" ).removeClass( "hide" );
                            $parentRow.find( ".industryDelete" ).removeClass( "hide" );
                            $parentRow.find( ".industryIndicate" ).remove();
                            elem.unbind( "change" );
                        } )
                    );
            } );
        }

    ,   _populateDropdown: function( opt, $elem )
        {
            var widget   = this
            ,   options  = widget.options
            ,   $sectorSelect
            ,   $sector
            ,   sector
            ;

            // Figure out in which sector are we
            sector = ( opt[0].value.match(/[A-Z]{1}\.[0-9]+\./)  ) ? "subSector" : "mainSector";

            $sector       = $elem.parents( "." + options.selectionClass ).find( "." + sector ).next();
            $sectorSelect = $sector.find( "select" );

            // Empty options in select before populating it
            $sectorSelect.find( "option" ).remove().end();

            // Add an empty option for sub sector
            // Don't get confused the "mainSector" is the starting point (what was triggered)
            if ( sector === "mainSector" )
            {
                $sectorSelect.append( $( "<option />", { text: bidx.i18n.i( "selectSubSector" ) } ) );

                // Hide the endSector
                $sector.parent().find( ".endSector" ).addClass( "hide" );
            }

            // Populate the select dropdown
            bidx.utils.populateDropdown( $sectorSelect, opt );

            // Activate chosen
            $sectorSelect.bidx_chosen();

            // Show the populated select
            $sector.removeClass( "hide" );
        }

    ,   _filterSelected: function( key )
        {
            var widget   = this
            ,   options  = widget.options
            ,   multiple = false
            ,   arr
            ,   results
            ;

            // Select the according level by checking the key from the selected option
            arr = ( key.match(/[A-Z]{1}\./) ) ? options.endSectorArr : options.subSectorArr;

            // Filter that level by checking the key
            results = $.grep( arr, function( obj, i )
            {
                return obj.value.indexOf( key ) !== -1;
            });

            return results;
        }

    ,   _addRow: function()
        {
            var widget           = this
            ,   options          = widget.options
            ,   i                = $("." + options.rowClass ).length
            ,   $el              = widget.element
            ,   $industryRowItem = ""
            ,   $noValue         = $( "<option value='' />" )
            ;

            // Create the basic structure of a row
            //
            $industryRowItem =
                $( "<div />", { "class": "row " + options.rowClass } )
                    .append
                    (
                        $( "<div />", { "class": "col-sm-12" } )
                        .append
                        (
                            $( "<div />", { "class": options.actionsClass } )
                            .append
                            (
                                $( "<i />", { "class": "fa fa-arrow-circle-right text-muted fa-big industryIndicate hide" })
                            )
                            .append
                            (
                                $( "<i />", { "class": "fa fa-times-circle text-danger fa-big industryDelete hide" })
                            )
                            .append
                            (
                                $( "<i />", { "class": "fa fa-plus-circle text-success fa-big industryAdd hide" })
                            )
                        )
                        .append
                        (
                            $( "<div />", { "class": "row " + options.selectionClass } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-3 mainSector hide" })
                                .append
                                (
                                    $( "<div />", { "class": "form-group" })
                                    .append
                                    (
                                        $( "<select />", { "name": "focusIndustrySector["+i+"]mainSector" })
                                    )
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-3 subSector hide" })
                                .append
                                (
                                    $( "<div />", { "class": "form-group" })
                                    .append
                                    (
                                        $( "<select />", { "name": "focusIndustrySector["+i+"]subSector" })
                                    )
                                )
                            )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-5 endSector hide" })
                                .append
                                (
                                    $( "<div />", { "class": "form-group" })
                                    .append
                                    (
                                        $( "<select />", { "name": "focusIndustrySector["+i+"]endSector", "multiple": "multiple" })
                                    )
                                )
                            )
                        )
                    )
                ;

            // Add an empty option (only text, no value to the element)
            $noValue.text( bidx.i18n.i( "selectMainSector" ) );

            $industryRowItem.find( ".mainSector select" ).append( $noValue );

            bidx.utils.populateDropdown( $industryRowItem.find( ".mainSector select" ), options.mainSectorArr );
            $industryRowItem.find( "select" ).bidx_chosen();

            widget._endSectorChangeEvents( $industryRowItem.find( ".endSector select" ) );

            return $industryRowItem;
        }

        // Public function to populate the edit screen
        //
    ,   populateInEditScreen: function( data )
        {
            var widget  = this
            ,   options = widget.options
            ,   $el     = widget.element
            ,   rows    = _createRows( data )
            ;

            $el.find( "." + options.rowClass ).remove();

            function _createRows( data )
            {
                var rows  = []
                ,   c       = 0
                ,   prevVal
                ;

                // Create rows
                //
                $.each( data, function( i, val)
                {
                    if ( !prevVal )
                    {
                        rows[c] = [val];
                    }
                    else
                    {
                        var prevSplitted    = prevVal.split( "." )
                        ,   prevMain        = prevSplitted[0]
                        ,   prevSub         = prevSplitted[1]
                        ,   currentSplitted = val.split( "." )
                        ,   currentMain     = currentSplitted[0]
                        ,   currentSub      = currentSplitted[1]
                        ;

                        if ( prevMain === currentMain )
                        {
                            if ( prevSub === currentSub )
                            {
                                rows[c].push( val );
                            }
                            else
                            {
                                if ( prevMain === currentMain && currentSplitted[2] === undefined )
                                {
                                    rows[c].push( val );
                                }
                                else
                                {
                                    c = c+1;
                                    rows[c] = [];
                                    rows[c].push( val );
                                }
                            }
                        }
                        else
                        {
                                c = c+1;
                                rows[c] = [];
                                rows[c].push( val );
                        }
                    }

                    prevVal = val;
                });

                return rows;
            }

            function _createEditState( rows )
            {
                $.each(rows, function( i, row )
                {
                    var splitted         = row[0].split( "." )
                    ,   main             = splitted[0]
                    ,   sub              = splitted[1]
                    ,   $industryRowItem = ""
                    ,   selectClass      = splitted[2] ? "col-sm-5" : "col-sm-8"
                    ,   opt
                    ;

                    $industryRowItem =
                        $( "<div />", { "class": "row " + options.rowClass } )
                            .append
                            (
                                $( "<div />", { "class": "col-sm-12" } )
                                .append
                                (
                                    $( "<div />", { "class": options.actionsClass } )
                                    .append
                                    (
                                        $( "<i />", { "class": "fa fa-times-circle text-danger fa-big industryDelete" })
                                    )
                                )
                                .append
                                (
                                    $( "<div />", { "class": "row " + options.selectionClass } )
                                    .append
                                    (
                                        $( "<div />", { "class": "col-sm-3 mainSector" })
                                        .append
                                        (
                                            $( "<div />", { "class": "form-group" })
                                            .append
                                            (
                                                $( "<select />", { "name": "focusIndustrySector["+i+"]mainSector" })
                                            )
                                        )
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "col-sm-3 subSector" })
                                        .append
                                        (
                                            $( "<div />", { "class": "form-group" })
                                            .append
                                            (
                                                $( "<select />", { "name": "focusIndustrySector["+i+"]subSector" })
                                            )
                                        )
                                    )
                                    .append
                                    (
                                        $( "<div />", { "class": "col-sm-5 endSector" })
                                        .append
                                        (
                                            $( "<div />", { "class": "form-group" })
                                            .append
                                            (
                                                $( "<select />", { "name": "focusIndustrySector["+i+"]endSector", "multiple": "multiple" })
                                            )
                                        )
                                    )
                                )
                            )
                        ;


                    var $mainSectorSelect = $industryRowItem.find( ".mainSector select" )
                    ,   $subSectorSelect  = $industryRowItem.find( ".subSector select" )
                    ,   $endSectorSelect  = $industryRowItem.find( ".endSector select" )
                    ;

                    bidx.utils.populateDropdown( $mainSectorSelect, options.mainSectorArr );
                    bidx.utils.setElementValue(  $mainSectorSelect, main );

                    opt = widget._filterSelected( main );
                    bidx.utils.populateDropdown( $subSectorSelect, opt );
                    bidx.utils.setElementValue(  $subSectorSelect, main+"."+sub );

                    opt = widget._filterSelected( main+"."+sub );
                    bidx.utils.populateDropdown( $endSectorSelect, opt );
                    bidx.utils.setElementValue(  $endSectorSelect, row );

                    $mainSectorSelect.bidx_chosen();
                    $subSectorSelect.bidx_chosen();
                    $endSectorSelect.bidx_chosen();

                    $el.append( $industryRowItem );
                });

            }

            _createEditState( rows );

            $el.append( widget._addRow() );
            $el.find( "." + options.rowClass ).last().find( ".industryAdd" ).removeClass( "hide" );
        }
    } );
} )( jQuery );
