<?php

?>
<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner">
		<div class="container">
<?php
				if( $authenticated )
				{
?>
				<div class="iconbar-wrapper pull-right">
					<?php echo do_shortcode( '[bidx app="group" view="navbar"]' );?>
				</div>
<?php
				}

				// the group-header is displayed for authenticated and non-authenticated
?>
				<div class='header-logo'>
<?php
				if ( get_theme_mod( 'themeslug_logo' ) ) {
					$img = parse_url( get_theme_mod( 'themeslug_logo' ) );
					$img_url = $img['path']; //make relative
?>
				    <a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'>
				    	<img src='<?php echo $img_url; ?>' alt='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>'>
				    </a>
<?php 			} else { ?>
   					<span class='site-title'><a href='<?php echo esc_url( home_url( '/' ) ); ?>' title='<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>' rel='home'><?php bloginfo( 'name' ); ?></a></span>
<?php 			} ?>
				</div>

<?php
				if( $authenticated )
				{
?>
				<div class="search pull-right col-sm-3">
			 		<?php get_template_part('templates/searchform'); ?>
				</div>
<?php
				}
				if( !$authenticated )
				{
?>
	 			<div class="pull-right col-sm-5 bidx-header-controls hidden-xs">
					<div class="row">
						<div class="col-sm-6">
							<a href=<?php echo _wl("register-as-member")."/#register/firstLogin=getting-started-member#editPreference";?> class="btn btn-success btn-block"><i class="fa fa-user"></i><?php  _e( 'Become a member','roots' );?></a>
						</div>
						<div class="col-sm-6">
							<a href=<?php echo _l("auth")."/#auth/login";?> class="btn btn-primary btn-block"><i class="fa fa-lock"></i> <?php _e( 'Login','roots' );?></a>
						</div>
					</div>
				</div>

	 			<div class="bidx-header-controls visible-xs">
					<div class="row">
						<div class="col-xs-7">
							<a href=<?php echo _wl("register-as-member")."/#register/firstLogin=getting-started-member#editPreference";?> class="btn btn-success btn-block"><i class="fa fa-user"></i><?php  _e( 'Become a member','roots' );?></a>
						</div>
						<div class="col-xs-5">
							<a href=<?php echo _l("auth")."/#auth/login";?> class="btn btn-primary btn-block"><i class="fa fa-lock"></i> <?php _e( 'Login','roots' );?></a>
						</div>
					</div>
				</div>
<?php
			 	}

				get_template_part('templates/header-top-navbar');

			 	if( $authenticated )
				{
?>
				<nav class="nav-collapse menu-main hidden-xs">
<?php
					if (has_nav_menu('primary_navigation')) :
						wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav nav-pills'));
					endif;
?>
				</nav>
<?php
				} else {
?>
				<nav class="nav-collapse menu-main hidden-xs">
<?php
					if (has_nav_menu('primary_notloggedin_navigation')) :
						wp_nav_menu(array('theme_location' => 'primary_notloggedin_navigation', 'menu_class' => 'nav nav-pills'));
					endif;
?>
				</nav>
<?php
				}
?>

		</div>
	</div>
	<div class="divider"></div>

</header>


