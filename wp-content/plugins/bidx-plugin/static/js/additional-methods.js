(function( $ )
{
     $.validator.addMethod( "tinymceTextarea", function(value, element, param)
    {
        var returnFlag
        ,   elementName =   $( element ).attr('name')
        ,   ed          =   tinyMCE.get(elementName)
        ,   editorHtml  =   ed.getContent()
        ,   editorText  =   $("<div />").html(editorHtml).text().trim()
        ,   $formGroup  =   $('.tinymce-wrapper')
        ;

        // add a callback to tinyMCE.onKeyUp event
        ed.onKeyUp.add ( function( )
        {
            editorHtml  =   ed.getContent();
            editorText  =   $("<div />").html(editorHtml).text().trim();

            if(editorText)
            {
                $formGroup.removeClass( "has-error" );
                $formGroup.find( ".form-control" ).removeClass( "error" );
                $formGroup.find( "span.error" ).remove();

                return true;
            }

            return false;
        });

        returnFlag  = (editorText !== "" && editorText) ? true : false;

        return  returnFlag;

    }, "This field is required" );

    //Validate phone number
    $.validator.addMethod( "phone", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[0-9-+]+$/.test( value );

    }, "Please enter valid phone number" );

    // https://support.skype.com/en/faq/FA94/what-is-a-skype-name
    //
    // Your Skype Name must have between 6 and 32 characters. It must start with a letter and can contain only letters, numbers and the following punctuation marks:
    //  full stop (.)
    //  comma (,)
    //  dash (-)
    //  underscore (_)
    //
    $.validator.addMethod( "skypeUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z][a-z0-9.,_-]{5,31}$/i.test( value );

    }, "Not a valid Skype username" );

    // http://help.linkedin.com/app/answers/detail/a_id/87
    // 5 - 30 letters or numbers. Please do not use spaces, symbols, or special characters.
    //
    // BIDX-1162 makes this even a bit more complex
    // @TODO: implement rules as specified in BIDX-1162
    //
    $.validator.addMethod( "linkedInUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z0-9]{5,30}$/i.test( value );

    }, "Not a valid LinkedIn username" );

    // LinkedIN
    //
    $.validator.addMethod( "linkedIn", function( value, element, param )
    {
        if ( this.optional( element ))
        {
            return true;
        }

        // We have two types of urls to validate:
        // - generic / generated urls
        //          http(s)?:\/\/([a-z]{2}|www).linkedin.com\/pub\/[a-z-]+/\d+/\d+/\d+
        //
        // - customized urls
        //          http(s)?:\/\/([a-z]{2}|www).linkedin.com\/in\/[a-z0-9]{5,30}
        //
        value = bidx.utils.normalizeLinkedInUrl( value );

        if (    /^http(s)?:\/\/([a-z]{2}|www).linkedin.com\/pub\/[a-z-]+\/\d+\/\d+\/\d+$/i.test( value ) ||
                /^http(s)?:\/\/([a-z]{2}|www).linkedin.com\/in\/[a-z0-9]{5,30}$/i.test( value ) )
        {
            return true;
        }

        return false;

        // Please note, usernames (so the /in/ url) are at least 5 characters long. So the username 'test' is not valid, so is https://www.linkedin.com/in/test not!
        //
    }, "Please enter valid LinkedIn Url. Ex http://www.linkedin.com/in/telaviv" );

    // http://www.labnol.org/internet/change-facebook-page-username/21449/
    //
    $.validator.addMethod( "facebookUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z0-9.]{5,}$/i.test( value );

    }, "Not a valid Facebook username" );

    // http://support.twitter.com/articles/101299-why-can-t-i-register-certain-usernames#
    // 1-15 characters
    // letters and underscores
    //
    $.validator.addMethod( "twitterUsername", function(value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        return /^[a-z0-9_]{1,15}$/i.test( value );

    }, "Not a valid Twitter username" );

    // Alias number for now to validate monetary amount
    //

    $.validator.addMethod( "monetaryAmount", function( value, element, param)
    {
        if ( this.optional( element ))
        {
            return true;
        }

        //return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\d+)?$/.test(value);
        return /^[0-9]*$/.test(value);
    }, "Not a valid monetary amount" );


    // Since bidx-tagsinput is special input control we cannot simply say "required"
    // This requires special handling
    //
    $.validator.addMethod( "tagsinputRequired", function( value, element, param )
    {
        var values = $( element ).tagsinput( "getValues" );

        return !!values.length;
    }, "This field is required" );

    // Since bidx-tagsinput is special input control we cannot simply say "min" or something
    // This requires special handling
    //
    $.validator.addMethod( "tagsinputMinItems", function( value, element, param )
    {
        var values = $( element ).tagsinput( "getValues" );

        return values.length > param;
    }, "Min items default text " );

    // Since we want to allow urls without the protocol (but it should be added before submitting it to the API!)
    // this validator is the same as in the jquery.validate.js but adjusted for the optional protocol
    //
    $.validator.addMethod( "urlOptionalProtocol", function( value, element, param )
    {
        // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
        return this.optional(element) || /^((https?|s?ftp):\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
    }, "Not a valid url" );


    // bidx remoteApi call: expects cb function in param
    //
    $.validator.addMethod( "remoteBidxApi", function( value, element, param )
    {

        var validator       = this
        ,   previous        = this.previousValue( element )
        ,   valid           = false
        ,   postData        = {}
        ;

        if ( this.optional(element) ) {
            return "dependency-mismatch";
        }

        //  create message for this element
        //
        if ( !this.settings.messages[ element.name ] )
        {
            this.settings.messages[ element.name ]          = {};
        }

        previous.originalMessage                            = this.settings.messages[ element.name ].remoteBidxApi;
        this.settings.messages[ element.name ].remoteBidxApi    = previous.message; //this is default the 'remote' message

        // check if new value is the same as the previous value. In that case nothing changed so return valid
        //
        // NOTE: disabled check on previous because this cause an issue where the default message is set instead of the callback value
        if ( previous.old === value )
        {
            return previous.valid;
        }
        // set new previous.old value
        //
        previous.old = value;

        // notify validator that we start a new request
        //
        this.startRequest( element );
        // execute bidx api call
        //
        postData[ param.paramKey ] = value;

        bidx.api.call(
            param.url
        ,   {
                groupDomain:        bidx.common.groupDomain
            ,   data:               postData

            ,   success: function( response )
                {

                    var submitted
                    ,   errors
                    ,   message
                    ;

                    if ( response )
                    {
                        bidx.utils.log("<RESPONSE>", response);
                        validator.settings.messages[element.name].remoteBidxApi = previous.originalMessage;

                        if( response.status === "OK" )
                        {
                            // following code is based on success handler of validator's remote call
                            //
                            submitted                               = validator.formSubmitted;
                            valid                                   = true;
                            validator.prepareElement( element );
                            validator.formSubmitted                 = submitted;
                            validator.successList.push( element );
                            delete validator.invalid[ element.name ];
                            validator.showErrors();

                            // notify validator request has finished
                            //
                            previous.valid                          = valid;
                            validator.stopRequest( element, valid );

                            //expicit call to unhighlight to correct the classes on element and control group
                            //
                            validator.settings.unhighlight.call(validator, element, validator.settings.errorClass, validator.settings.validClass );

                        }
                        else if ( response.status === "ERROR" )
                        {

                            // following code is based on fail handler of validator's remote call
                            //
                            errors = {};
                            message = response.code || validator.defaultMessage( element, "remoteBidxApi" );

                            bidx.i18n.getItem( message, function( err, label )
                            {
                                if ( err )
                                {
                                    throw new Error( "Error occured assigning translation for field " + element.name  );
                                }

                                message                             = label;
                                valid                               = false;
                                errors[ element.name ]              = previous.message = $.isFunction( message ) ? message( value ) : message;
                                validator.invalid[ element.name ]   = true;
                                validator.showErrors( errors );

                                // notify validator request has finished
                                //
                                previous.valid                      = valid;
                                validator.stopRequest( element, valid );

                            } );
                        }
                    }
                    else
                    {
                        // notify validator request has finished
                        //
                        previous.valid = valid;
                        validator.stopRequest( element, valid );

                        bidx.utils.warn( "Error occured while checking existence of username: no response received" );
                    }
                }

            ,   error:  function( jqXhr )
                {
                    var response = $.parseJSON( jqXhr.responseText )
                    ,   submitted
                    ,   errors
                    ,   message
                    ;

                    // 400 errors are Client errors
                    //
                    if ( jqXhr.status >= 400 && jqXhr.status < 500)
                    {
                        bidx.utils.error( "Client error occured", response );

                        // following code is based on fail handler of validator's remote call
                        //
                        errors = {};
                        message = response.code || validator.defaultMessage( element, "remoteBidxApi" );

                        bidx.i18n.getItem( message, function( err, label )
                        {
                            if ( err )
                            {
                                throw new Error( "Error occured assigning translation for field " + element.name  );
                            }

                            message                             = label;
                            valid                               = false;
                            errors[ element.name ]              = previous.message = $.isFunction( message ) ? message( value ) : message;
                            validator.invalid[ element.name ]   = true;
                            validator.showErrors( errors );

                            // notify validator request has finished
                            //
                            previous.valid                      = valid;
                            validator.stopRequest( element, valid );

                        } );


                    }

                    // 500 erors are Server errors
                    //
                    if ( jqXhr.status >= 500 && jqXhr.status < 600)
                    {
                        bidx.utils.error( "Server error occured", response );
                    }

                    // notify validator request has finished
                    //
                    previous.valid = valid;
                    validator.stopRequest(element, valid);


                }
            }
        );

        return "pending";

    }, "Default message remoteBidxApi" );


    // Since bidx-location is special input control we cannot simply say "required"
    // This requires special handling
    //
    $.validator.addMethod( "bidxLocationRequired", function( value, element, param )
    {
        var $element        = $( element )
        ,   $p              = $element.bidx_location( "generateDeferredAndGetPromise" )
        ,   valid           = true
        ,   validator       = this
        ,   previous        = this.previousValue( element )
        ,   errors          = {}
        ,   message
        ;

        if ( previous.old === value )
        {
            bidx.utils.log( "returning directly", previous.valid );
            return previous.valid;
        }

        // Unset previous value until we got a response / place selection
        //
        previous.old = null;

        // if there is a Promise object
        //
        if ( $p )
        {
            // notify validator that we start a new request
            //
            this.startRequest( element );

            // handle resolved Deffered state
            //
            $p.then( function ( locationData )
            {
                var missingKeys = [];

                if ( param.requiredKeys )
                {
                    // check if required keys are availble in the locationData
                    //
                    $.each( param.requiredKeys, function(idx, item )
                    {
                        if ( !locationData[ item ] )
                        {
                            valid = false;

                            missingKeys.push( item );
                        }
                    } );
                }

                // validation is valid. remove errors and stop pending request
                //
                if ( valid )
                {

                    var submitted                           = validator.formSubmitted;
                    valid                                   = true;
                    validator.prepareElement( element );
                    validator.formSubmitted                 = submitted;
                    validator.successList.push( element );
                    delete validator.invalid[ element.name ];
                    validator.showErrors();

                    // notify validator request has finished
                    //
                    previous.valid                          = valid;
                    validator.stopRequest( element, valid );

                    //expicit call to unhighlight to correct the classes on element and control group
                    //
                    validator.settings.unhighlight.call(validator, element, validator.settings.errorClass, validator.settings.validClass );

                }
                // something went wrong with the location plugin
                //
                else
                {
                    if ( missingKeys.length )
                    {
                        message = "Missing required parts of the location: " + missingKeys.join( ", " );
                    }
                    else
                    {
                        message = "Something went unexpectedly wrong";
                    }

                    valid                               = false;
                    errors[ element.name ]              =  $.isFunction( message ) ? message( value ) : message;
                    validator.invalid[ element.name ]   = true;
                    validator.showErrors( errors );

                    // notify validator request has finished
                    //
                    previous.valid                      = valid;
                    validator.stopRequest( element, valid );
                }

                // Save the current value from the input element so we can compare the next run
                //
                previous.old = $element.val();
            } )
                .done( function()
                {
                    // NOOP
                } )
            ;

            // check if the promise is still in a pending state
            //
            if( $p.state() === "pending" )
            {
                // get error message from i18n
                //
                bidx.i18n.getItem( "selectLocation", "register", function( err, label )
                {
                    if ( err )
                    {
                        throw new Error( "Error occured assigning translation for field " + element.name  );
                    }

                    message                             = label;
                    errors[ element.name ]              =  $.isFunction( message ) ? message( value ) : message;
                    validator.invalid[ element.name ]   = true;
                    validator.showErrors( errors );
                } );
            }

            return "pending";
        }
        else
        {
            bidx.utils.log( "[XX] No value, no promise", $p);
        }

    }, "This field is required" );


} ( jQuery ) );
