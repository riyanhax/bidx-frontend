<?php
/**
 * Authentication and registration content loader.
 * Name lowercased for automatic loading.
 * @author Jaap Gorjup
 * @author Altaf Samnani (ajax functions)
 * @author msp (js app)
 * @version 1.0
 */

class auth {

	/**
	 * Constructor
	 * Registers hooks for ajax requests and security related material
	 * Also registers the scripts for auth.
	 */

    static $deps = array ('jquery', 'bootstrap', 'underscore', 'backbone', 'json2', 'bidx-utils', 'bidx-api-core', 'bidx-common', 'bidx-data', 'bidx-i18n',
                        'jquery-validation', 'jquery-validation-additional-methods', 'jquery-validation-bidx-additional-methods', 'bidx-location', 'chosen',
                        'bidx-tagsinput' ,'bidx-chosen', 'bidx-industries');


	function __construct() {

		add_action( 'wp_enqueue_scripts', array( &$this, 'register_auth_bidx_ui_libs' ) );
	}

	/**
	 * Load the scripts and css belonging to this function
	 */
	function register_auth_bidx_ui_libs() {

        wp_register_script( 'registration',  plugins_url( 'static/js/group-registration.js',    __FILE__ ), array(), '20130501', TRUE );
        wp_register_script( 'join', plugins_url( 'static/js/join.js', __FILE__ ), array(), '20140710', TRUE );

        $deps = array_merge( self :: $deps, array( 'registration', 'join' ) );

        wp_register_script( 'auth', plugins_url( 'static/js/auth.js', __FILE__ ), $deps, '20130501', TRUE );

	}

	/**
	 * Load the content.
	 * Dynamic action needs to be added here
	 * @param $atts
	 */
	function load($atts)
    {

        // This "auth" app also handles views for /join and /activate. Beware that /join behaves
        // differently when authenticated (choose a role, or join the group, or show the homepage)
        // and when not authenticated (show all login options).
        //
        // After successful authentication bidx-soca always redirects to /join, and join.js will
        // figure out if the user still needs to select a role or join the group. If true, join.js
        // will set the fragment to #join/auth, which in its navigate(...) is handled exactly like
        // #join/portal and #join/role, by again checking the current situation and rewriting to
        // one of those three options. This works fine if the user indeed needs to authenticate
        // and is shown some other web page after going to /auth/#auth/login. But if there is no
        // need to authenticate, the user will go from /auth/#auth/login to /join on the very same
        // website, making browsers append the original fragment, effectively taking the user to
        // /join/#auth/login, which is invalid.
        //
        // To fix the illegal fragment in PHP, we cannot easily first clear the fragment. However,
        // we can add a fragment to the bidx-soca URL (which is not used by bidx-soca). Adding an
        // empty fragment (just the #) works in Chrome, but Firefox then still appends #auth/login.
        // So, the solution is to add the expected fragment, #join/role, to the bidx-soca URL (or
        // configure bidx-soca to add the fragment in its redirect).

        $authenticated  =   ( BidxCommon::$staticSession->authenticated === 'true' );
        $siteUrl        =   get_site_url();
        $subdomain      =   BidxCommon::get_bidx_subdomain( false, $siteUrl );

    	if ( get_option( 'bidx-ssoredirect-url' ) )
        {
        		header( "Location: " . $siteUrl . get_option( 'bidx-ssoredirect-url' ) );

        		return;
    	}

		// 1. Template Rendering
		require_once( BIDX_PLUGIN_DIR . '/templatelibrary.php' );

		$view = new TemplateLibrary( BIDX_PLUGIN_DIR . '/auth/templates/' );

		// 2. Determine the view needed
		$command                = $atts['view'];

        $type                   = array_key_exists( 'type', $atts ) ? $atts['type'] : null;

        $view->showRegisterLink = true;

        $view->showLoginLink    = true;

        $render                 = $command;

        // we need to activate a new account and check the token provided
        //
        if ( $command === "activate" )
        {
            // check if code has been provided
            //
            $activationCode = isset( $_GET[ "code" ] ) ? $_GET["code"]  : "";


            if ( $activationCode !== "" )
            {
                global $sitepress;

                $currentLanguage    =   ( isset( $sitepress) ) ? $sitepress->get_current_language() :   substr(get_locale(),0,2);

                $langUrl            =    ( $currentLanguage ) ?  '/' . $currentLanguage : '';
;
                // do the session call
                //
                require_once( BIDX_PLUGIN_DIR .'/../services/session-service.php' );

                $sessionObj = new SessionService( );

                $result = $sessionObj -> getActivationSession( $activationCode );

                // if sessionState is pending, redirect to setpassword
                //
                if ( isset ( $result -> data -> SessionState ) && ( $result -> data -> SessionState === "PendingInitialPasswordSet" || $result -> data -> SessionState === "PendingPasswordReset"  ) )
                {

                    $redirect_url = $langUrl.'/setpassword/';

                } elseif ( isset ( $result -> code ) && $result -> code === "activationTokenExpired" )
                {

                    $redirect_url = $langUrl.'/setpassword/#setpassword/expired';

                } else
                {
                    // THIS NEEDS TO GET SOME DECENT ERROR HANDLING
                    //
                    echo "<H1>Ooops, something went wrong</H1>";
                    echo $result -> text;
                    die();
                }

                // do the redirect
                header ("Location: $redirect_url");
                die();

            }
            else
            {
                // catchall kinda page...
                //
                echo "<H1>Ooops, something went wrong</H1>";
                echo "No activation token received.";
                die();
            }
        }
        else
        {
            require_once( BIDX_PLUGIN_DIR . '/../services/group-service.php' );
            $groupSvc = new GroupService( );
            $view->groupNotification = (!empty($atts['name'])) ? $atts['name']: 'we';
            $view->group = $groupSvc->getGroupDetails();
            $view->render( $render . '.phtml' );
        }
	}
}

?>
