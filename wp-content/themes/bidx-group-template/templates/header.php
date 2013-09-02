<header class="banner navbar navbar-fixed-top" role="banner">
  	<div class="navbar-inner bidx-theme-colour-panel-one">
		<div class="container">
						
			<div class="row-fluid">
			<?php
				if( $authenticated )
				{
			?>
				<div class="iconbar-wrapper">
					<?php echo do_shortcode( '[bidx app="group" view="navbar"]' );?>
				</div>
			<?php
				}
				// the group-header is displayed for authenticated and non-authenticated
				echo do_shortcode( '[bidx app="group" view="group-header"]' );
	
				if( $authenticated )
				{
			?>
				<div class="search">
			 		<?php get_template_part('templates/searchform'); ?>
				</div>
			<?php 
				}
				if( !$authenticated )
				{
			 ?>
	 			<div class="pull-right span4">
					<div class="row-fluid">
						<div class="span6">
							<a href="/auth/#auth/register" class="btn btn-primary btn-block bidx-theme-colour-two"><?php _e('Register','bidxtheme');?></a>
						</div>
						<div class="span6">
							<a href="/auth/#auth/login" class="btn btn-primary btn-block bidx-theme-colour-one"><i class="fui-login"></i><?php _e('Login','bidxtheme');?></a>
						</div>

					</div>
				</div>
			 <?php 
			 	} 
			 ?>
			</div>
			<div class="row-fluid">
				<div class="span12">
					<nav class="nav-collapse collapse menu-main">
						<?php
							if (has_nav_menu('group_dashboard_navigation')) :
								wp_nav_menu(array('theme_location' => 'primary_navigation', 'menu_class' => 'nav'));
							endif;
						?>
					</nav>
				</div>
			</div>

		</div>
	</div>
</header>