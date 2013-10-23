/**
 * @version 1.0
 * @author adebree
 * @author msp
 */
;(function( $ )
{
    var bidx    = window.bidx
    ,   api     = bidx.api
    ,   memberRelationships  = {}
    ,   baseUrl = "/api/v1/members/relationships/%requesterId%"
    ,   params  = []
    ;

    memberRelationships.fetch = function( params )
    {
        var method = "GET"
        ,   url    = baseUrl.replace( "/%requesterId%", "" )
        ;


        api._call(
        {
            method:                     method
        ,   groupDomain:                params.groupDomain
        ,   baseUrl:                    url
        ,   extraUrlParameters:         params.extraUrlParameters
        ,   success:        function( response, textStatus, jqXhr )
            {
                if ( response && response.data )
                {
                    response = response.data;
                }

                params.success( response, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    memberRelationships.mutate = function( params )
    {
        var method  = "PUT"
        ,   url     = baseUrl.replace( "%requesterId%", params.requesterId )
        ;

        api._call(
        {
            method:                 method
        ,   groupDomain:            params.groupDomain
        ,   extraUrlParameters:     params.extraUrlParameters
        ,   baseUrl:                url

        ,   success:        function( data, textStatus, jqXhr )
            {
                params.success( data, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };

    memberRelationships.create = function( params )
    {
        var method  = "POST"
        //,   url     = baseUrl
        ,   tempUrl = "/api/v1/members/%requesterId%/relationships/%requesteeId%" // NOTE: temp url until Jeroen changes
        ,   url     = tempUrl
                        .replace( "%requesterId%", params.requesterId )
                        .replace( "%requesteeId%", params.requesteeId )
        ;

        api._call(
        {
            method:         method
        ,   form:           true
        ,   groupDomain:    params.groupDomain
        ,   baseUrl:        url
        ,   data:           params.data
        ,   success:        function( data, textStatus, jqXhr )
            {
                params.success( data, textStatus, jqXhr );
            }
        ,   error:          function( jqXhr, textStatus, errorThrown )
            {
                params.error( jqXhr, textStatus, errorThrown );
            }
        } );
    };


    api.memberRelationships = memberRelationships;
} )( jQuery );
