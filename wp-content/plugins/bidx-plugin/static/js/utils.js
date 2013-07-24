(function( $ )
{
    var months = [ "January", "Februari", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

    // Convenience function for populating a <select />
    //
    var populateDropdown = function( $el, values )
    {
        $.each( values, function( i, option )
        {
            var $option = $(
                "<option />"
            ,   {
                    value:      option.value
                }
            ).text( option.label );

            $el.append( $option );
        } );
    };

    // Set the value of an form element. All the funky / special component handling is done here.
    //
    var setElementValue = function( $el, value )
    {
        var elType      = $el.attr( 'type' )
        ,   dataType    = $el.attr( 'data-type' )
        ,   dateObj
        ;

        // Convert booleans to their string versions
        //
        if ( value === true )
        {
            value = "true";
        }
        else if ( value === false )
        {
            value = "false";
        }

        // When an data-type is defined on the HTML that has presendence over the handling of regular form inputs
        //
        if ( dataType === "date" )
        {
            if ( value )
            {
                dateObj = parseISODate( value );

                value = dateObj.d + " " + months[ dateObj.m - 1 ] + " " + dateObj.y;
                $el.val( value );
            }
        }
        else if ( dataType === "tagsinput" )
        {
            if ( value )
            {
                $el.tagsinput( "setValues", value );
            }
        }
        else if ( $el.hasClass( "btn-group" ))
        {
            // Value should be an array
            //
            if ( !$.isArray( value ) && typeof value !== "undefined" )
            {
                value = [ value ];
            }

            if ( value )
            {
                $.each( value, function( idx, v )
                {
                    var $button = $el.find( "[value='" + v + "']" );

                    $button.addClass( "active" );
                } );
            }
        }
        else
        {
            // Regular form inputs
            //
            if ( elType )
            {
                switch( elType )
                {
                    case 'radio':
                        if ( $el.val() === value )
                        {
                            $el.click();
                        }
                        else if ( typeof value !== "undefined" && value !== "" )
                        {
                            // noop
                        }
                    break;

                    case 'checkbox':
                        $el.prop( 'checked', !!value );
                    break;

                    case 'file':
                    break;

                    default:
                        $el.val( value || ( value === 0 ? "0" : "" ) );
                }
            }
            else if ( $el.is( 'input' ) || $el.is( 'select' ) || $el.is( 'textarea' ) )
            {
                $el.val( value || ( value === 0 ? '0' : '' ) );
            }
            else
            {
                $el.text( value || ( value === 0 ? '0' : '' ) );
            }
        }
    };

    // Get the values back from the input element
    //
    var getElementValue = function( $input )
    {
        var values
        ,   value
        ,   date
        ;

        switch ( $input.attr( 'data-type' ) )
        {
            // We need to get to ISO8601 => yyyy-mm-dd
            //
            case 'date':
                date    = $input.datepicker( "getDate" );

                if ( date )
                {
                    value   = getISODate( date );
                }
            break;

            case 'tagsinput':
                values = $input.tagsinput( "getValues" );

                value = $.map(
                    values
                ,   function( v )
                    {
                        return $.type( v ) === "object" ? v.value : v;
                    }
                );

            break;

            default:

                if ( $input.hasClass( "btn-group" ) )
                {
                    var toggleType = $input.data( "toggle" );

                    if ( toggleType === "buttons-checkbox" )
                    {
                        value = [];
                        $input.find( ".active" ).each( function()
                        {
                            var $btn = $( this );

                            value.push( $btn.attr( "value" ) );
                        } );
                    }
                    else if ( toggleType === "buttons-radio" )
                    {
                        value = $input.find( ".active" ).attr( "value" );
                    }
                }
                else
                {
                    switch ( $input.attr( "type" ) )
                    {
                        case "radio":
                            value = $input.filter( ":checked" ).val();
                        break;

                        case "checkbox":
                            value = $input.is( ":checked" ) ? $input.val() : null;
                        break;

                        default:
                            value = $input.val();
                    }
                }
        }


        if ( value === "true" )
        {
            value = true;
        }
        else if ( value === "false" )
        {
            value = false;
        }

        return value;
    };

    // Retrieve the value of a specific URL parameter
    //
    var getQueryParameter = function( key, url )
    {
        if ( !url )
        {
            url = document.location.href;
        }

        var baseURL = decodeURI( url.replace( /\+/g, "%20" ) ).split( "#" )[ 0 ]
        ,   parts   = baseURL.split( "?" )
        ,   result
        ,   params
        ,   param
        ,   i
        ;

        if ( parts.length > 1 )
        {
            params = parts[ 1 ].split( "&" );
            for( i = 0; i < params.length; i++ )
            {
                param = params[ i ].split( "=" );
                if ( key === param[ 0 ] )
                {
                    result = decodeURIComponent( param[ 1 ] );
                }
            }
        }

        return result;
    };

    // Get safely a value from a JS object by specifying the property path as
    // a string
    //
    var getValue = function( obj, path, forceArray )
    {
        if ( typeof path === "undefined" || !obj )
        {
            return;
        }

        var aPath = path.split( "." )
        ,   value = obj
        ,   key   = aPath.shift()
        ;

        while( typeof value !== "undefined" && value !== null && key )
        {
            value = value[ key ];
            key   = aPath.shift();
        }
        value = ( 0 === aPath.length ) ? value : undefined;

        if ( !$.isArray( value ) && typeof value !== "undefined" && forceArray )
        {
            value = [ value ];
        }

        return value;
    };

    /**
     * Safely set a JSON value on a certain path, regardless if that path exists or not
     */
    var setValue = function( obj, path, value )
    {
        var aPath   = path.split( "." )
        ,   key     = aPath.shift()
        ,   prevKey
        ;

        while ( key )
        {
            if ( !obj[ key ] )
            {
                obj[ key ] = {};
            }

            prevKey = key;
            key     = aPath.shift();

            if ( key )
            {
                obj     = obj[ prevKey ];
            }
        }

        obj[ prevKey ] = value;
    };

    var getGroupDomain = function()
    {
        return document.location.hostname.split( "." ).shift();
    };

    var getISODate = function( obj )
    {
        var result = "";

        if ( !obj )
        {
            return result;
        }

        var y = obj.getFullYear()
        ,   m = obj.getMonth() + 1
        ,   d = obj.getDate() * 1
        ;

        if ( m < 10 )
        {
            m = "0" + m;
        }

        if ( d < 10 )
        {
            d = "0" + d;
        }

        result += y + "-" + m + "-" + d;

        return result;
    };

    var parseISODate = function( str )
    {
        if ( !str )
        {
            return;
        }

        var obj =
        {
            y:      parseInt( str.substr( 0, 4 ), 10 )
        ,   m:      parseInt( str.substr( 5, 2 ), 10 )
        ,   d:      parseInt( str.substr( 8, 2 ), 10 )
        };

        return obj;
    };

    var parseISODateTime = function( str )
    {
        if ( !str )
        {
            return;
        }
        
        var obj =
            {
                    y:      parseInt( str.substr( 0, 4 ), 10 )
                ,   m:      parseInt( str.substr( 5, 2 ), 10 )
                ,   d:      parseInt( str.substr( 8, 2 ), 10 )
                ,   h:      str.substr( 11,2 )
                ,   n:      str.substr( 14,2 )
                ,   s:      str.substr( 17,2 )
            }
        ,   d      = new Date( obj.y, obj.m, obj.d )
        ,   result = d.getDate() + " " + months[ d.getMonth()-1 ] + " " + d.getFullYear() + " " + obj.h + ":" + obj.n + ":" + obj.s
        ;
        return result;
    };


    var parseTimestampToDateStr = function( ts )
    {
        if ( !ts )
        {
            return "";
        }

        var d       = new Date( parseInt( ts + "000", 10 ) )
        ,   result  = d.getDate() + " " + months[ d.getMonth()-1 ] + " " + d.getFullYear()
        ;
        return result;
    };

    // Logger functions
    //
    var log = function()
    {
        if ( window[ "console" ] && console[ "log" ] && typeof console.log === "function" )
        {
            console.log.apply( console, arguments );
        }
    };

    var warn = function()
    {
        if ( window[ "console" ] && console[ "warn" ] &&  typeof console.warn === "function" )
        {
            console.warn.apply( console, arguments );
        }
    };

    var error = function()
    {
        if ( window[ "console" ] && console[ "error" ] && typeof console.error === "function" )
        {
            console.error.apply( console, arguments );
        }
    };


    // Exports
    //
    if ( !window.bidx )
    {
        window.bidx = {};
    }

    window.bidx.utils =
    {
        getQueryParameter:          getQueryParameter
    ,   getValue:                   getValue
    ,   setValue:                   setValue
    ,   getGroupDomain:             getGroupDomain
    ,   getISODate:                 getISODate
    ,   parseISODate:               parseISODate
    ,   parseISODateTime:           parseISODateTime
    ,   parseTimestampToDateStr:    parseTimestampToDateStr
    ,   setElementValue:            setElementValue
    ,   getElementValue:            getElementValue
    ,   populateDropdown:           populateDropdown

    ,   log:                        log
    ,   warn:                       warn
    ,   error:                      error
    };
} ( jQuery ));
