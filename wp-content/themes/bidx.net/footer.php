	<div class="clear"></div>
	</div><!--.container-->
	<div id="footer"><footer>
		<div class="container">
			<?php if ( ! dynamic_sidebar( 'Footer' ) ) : ?><!--Wigitized Footer--><?php endif ?>
			<div id="nav-footer" class="nav"><nav>
				<?php wp_nav_menu( array('theme_location' => 'footer-menu' )); /* editable within the Wordpress backend */ ?>
			</nav></div><!--#nav-footer-->
			<p class="clear"><a href="#main"><?php _e('Top'); ?></a></p>
			<p><a href="<?php bloginfo('rss2_url'); ?>" rel="nofollow"><?php _e('Entries (RSS)'); ?></a> | <a href="<?php bloginfo('comments_rss2_url'); ?>" rel="nofollow"><?php _e('Comments (RSS)'); ?></a></p>
			<p>&copy; <?php echo date("Y") ?> <a href="<?php bloginfo('url'); ?>/" title="<?php bloginfo('description'); ?>"><?php bloginfo('name'); ?></a>. <?php _e('All Rights Reserved.'); ?></p>
			<p></p>
		</div><!--.container-->
	</footer></div><!--#footer-->
</div><!--#main-->
<?php wp_footer(); /* this is used by many Wordpress features and plugins to work properly */ ?>
</body>
</html>