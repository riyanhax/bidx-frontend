<?php
    global $sitepress;

    $session = BidxCommon::$staticSession;

    $footerContent = 'footer';

    if( $sitepress )
    {
        $currentLanguage = $sitepress->get_current_language();
        $footerContent .= ( $currentLanguage != 'en') ? '_'.$currentLanguage : '';
    }

    $themeMod = get_theme_mod( $footerContent );

    languages_list_footer();

    if ( $themeMod )
    {
?>

<footer>
    <div class="page-footer bg-primary-dark">
        <div class="container">
                <?php echo $themeMod; ?>
        </div>
    </div>
</footer>

<?php

    } else {

?>

<footer>
    <div class="page-footer bg-primary-dark">
        <div class="container">
            <div class="footer-bar row">
            	<div class="pull-left col-sm-6">
            		<div class="follow-us pull-left"><?php _e( 'Follow us','roots' )?></div>
            	 	<div class="btn-group">
                        <a target="_blank" href="https://twitter.com/bid_x"><i class="fa fa-twitter-square"></i></a>
                        <a target="_blank" href="https://www.facebook.com"><i class="fa fa-facebook-square"></i></a>
                        <a target="_blank" href="http://www.linkedin.com/company/bidx"><i class="fa fa-linkedin-square"></i></a>
                    </div>
            	</div>

            	<div class="pull-right col-sm-6 text-right">
            		<div class="copyright">&copy; <?php echo date("Y") ?>. bidX.net. <?php _e( 'All rights reserved','roots' )?></div>
                    <div class="inline-list footer-menu">
            			<div><a href="/terms-of-service"><?php _e( 'Terms of service','roots' )?></a></div>
            			<div><a href="/privacy"><?php _e( 'Privacy','roots' )?></a></div>
            		</div>
            	</div>
            </div>
        </div>
    </div>
</footer>

<?php
    }
?>

<div class="loginModal modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h3><?php _e('Your session expired, login to continue', 'bidxplugin' ); ?></h3>
            </div>
            <div class="modal-body">
                <div id="frmLoginModal">
                    <div class="form-group">
                        <label class=""><?php _e('Email address','bidxplugin');?></label>
                        <input type="email" class="form-control" name="shownusername" value="<?php echo $session->data->username ?>" disabled />
                    </div>
                    <div class="form-group">
                        <label class=""><?php _e('Password','bidxplugin');?></label>
                        <input type="password" class="form-control" name="password" placeholder="<?php _e('Enter your password','bidxplugin');?>" />
                    </div>
                    <input type="email" class="hide" name="username" value="<?php echo $session->data->username ?>" />

                    <div class="error-separate alert alert-danger"></div>
                    <button type="submit" class="btn btn-primary js-relogin"><?php _e('Login','bidxplugin');?></button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php wp_footer(); ?>

