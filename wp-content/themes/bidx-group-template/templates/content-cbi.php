<div class="container cbi-content">
	<?php while (have_posts()) : the_post(); ?>
		<?php the_content(); ?>
	<?php endwhile; ?>
</div>

<?php
	$base = "http://www.cbi.eu";
	$cachetime = 300;
	if ( isset($_REQUEST['URL']) ) {
		$url = $base . $_REQUEST['URL'];
	} else {
		$url = $base . "/marketintel_platform/platform/177482/affiliate";
	}
	
	if( false === ($data = get_transient($transient_name) ) ) {

		$args = array(
				'timeout'     => 10,
				'redirection' => 5,
				'httpversion' => '1.1',
				'user-agent'  => 'bidx/' . $wp_version . '; ' . get_bloginfo( 'url' ),
				'blocking'    => true,
				'headers'     => array(),
				'cookies'     => array(),
				'body'        => null,
				'compress'    => false,
				'decompress'  => true,
				'sslverify'   => false,
				'stream'      => false,
				'filename'    => null
		);
		$response = wp_remote_get( $url, $args );
		
		if (is_wp_error($response)) {
		
			$data = "<div id=\"well error\">Could not load the data referenced <br/><div style=\"color: red\">". $response->get_error_message() ."</div>";
		
		} else {
		
			$data = wp_remote_retrieve_body( $response );
		
			$self_base = get_permalink( $post->ID );
		
			//rewrite images that are relative (regex can be used for replacing full string and encode the url)
			$data = str_replace( "src=\"/", "src=\"/wp-content/themes/bidx-group-template/lib/cbi-proxy.php?URL=/", $data );
			//rewrite images that are explicit
			$data = str_replace( "src=\"".$base, "src=\"/wp-content/themes/bidx-group-template/lib/cbi-proxy.php?URL=", $data );
			//rewrite javascript linkup
			$data = str_replace( "http://' + window.location.host", $self_base ."?URL='" , $data );
			//rewrite direct links
			$data = str_replace( "href=\"/","href=\"" . $self_base ."?URL=/", $data );
			//remove script elements
			//$data = preg_replace( "/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i", "", $data );
			//$data = preg_replace( "/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i", "", $data );
			
			set_transient( $url, $data, $cachetime);
		}		
	} 
	
	?>
	<div class="container cbi-content">
		<div id="cbi-container">
			<?php echo $data ?>
		</div>
	</div>

	<script type="text/javascript" src="<?php get_template_directory_uri(); ?>/../../wp-content/plugins/bidx-plugin/static/vendor/chosen_v1.0.0/chosen.jquery.js"></script>
	<script type="text/javascript">
		$( function() {
    		$( "#sectorChangeSelect" ).chosen({
    			disable_search: true
    		});
		});
	</script>
	