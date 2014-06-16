<?php 
/**
 * Shows a counter.
 * Rules are:
 * - There must a defined competition
 * - Must have a valid end-date defined 
 * 
 * @author Jaap Gorjup
 */
class BidxCompetitionCounterWidget extends WP_Widget {
	
	private $diff = 0;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		$this->WP_Widget (
				'bidx_competition_counter_widget',
				__('Counter Widget'),
				array (
						'name' => ': : Bidx Competition Counter',
						'classname' => 'bidx_competition_counter_widget',
						'description' => __( 'Add a expiration clock for your competition' )
				)
		);
		add_shortcode( 'competition', array( $this, 'handle_shortcode' ) );
	}	
	
	/**
	 * Maintenance of the widget. The following fields can be set in the admin:
	 * - Name of the competition (if none show error)
	 * - Competition link (optional)
	 * - Counter type (flipclock)
	 * 
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		
		if ( $instance )
		{
			$competition_id = $instance['competition_id'];
			$competition_link = $instance['competition_link'];
		}
		else
		{
			$competition_id = '';
			$competition_link = '';
		}
		//get list of competitions
		$competitions = BidxCompetition :: get_competitions_list();
		//check if competitions exist
		?>
    	<p>
            <label for="<?php echo $this->get_field_id('competition_id'); ?>"><?php _e('Select Competition:', 'bidx_competition'); ?></label>
			<select name="<?php echo $this->get_field_name('competition_id') ?>" id="<?php echo $this->get_field_id('competition_id') ?>">
			<?php 
            foreach ( $competitions->posts as $competition) {
                printf(
                    '<option value="%s" %s >%s</option>',
                    $competition->ID,
                    $competition->ID == $competition_id ? 'selected="selected"' : '',
                    $competition->post_title
                );
            }
            ?>
            </select>
        </p>
    	<p>
            <label for="<?php echo $this->get_field_id('competition_link'); ?>"><?php _e('Alternative link to competition (optional):', 'bidx_competition'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('competition_link'); ?>" name="<?php echo $this->get_field_name('competition_link'); ?>" type="text" value="<?php echo $competition_link; ?>" />
        </p>        
		<?php
	} 	
	

	/**
	 * Stores the value of the widget
	 * @param WP_Widget $new_instance
	 * @param WP_Widget $old_instance
	 * @return WP_Widget
	 */
	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		$instance['competition_id'] = esc_sql( $new_instance['competition_id']);
		$instance['competition_link'] = esc_sql( $new_instance['competition_link']);	
		return $instance;
	}
	 
	/**
	 * Output
	 * @param array $args arguments for input
	 * @param WP_Widget $instance instance of this widget
	 */
	function widget($args, $instance) {
		extract( $args );	
		$competition_id = $instance['competition_id'];
		$competition_link = $instance['competition_link'];
		echo $before_widget;
		echo $this -> render_content( $competition_id, $competition_link );
		echo $after_widget;
	}	
	
	/**
	 * Output rendering for the widget and for the shortcode
	 */
	function render_content( $competition_id, $competition_link='' ) {

		if ( empty( $competition_id ) ) {
			_e('No Competition Set','bidx_competition');
		}
		else {
			//TODO first check if it is a competition post type
			$post = get_post($competition_id);
			$startdate = get_post_meta( $competition_id, 'competition_startdate', true );
			$enddate = get_post_meta( $competition_id, 'competition_enddate', true );	
			
			$this->diff = abs(strtotime($enddate) - time());
	
		//TODO strip the link to make it relative from the website root
		
	?>
		<div class="competition">
		<h3><?php _e('Competition','bidx_competition_plugin');?></h3>
		<div class="bidx countdown-title ">
			<a class="btn" href="<?php echo get_permalink( $competition_id ); ?>"><?php echo $post -> post_title ?></a>
		</div>
		<div class="bidx countdown-time">
			<h4><?php 
			if ($this->diff < 0) {
				_e( 'This competition has expired.','bidx_competition_plugin' );
				?><a href="#"><?php _e( 'Visit our competition overview.','bidx_competition_plugin' ); ?> </a><?php 
			}
			else
			{
				add_action( 'wp_print_footer_scripts', array( &$this, 'add_clock_footer_scripts' ) );			
				?>
				<link rel="stylesheet" href="<?php echo plugins_url() ?>/bidx-competition-plugin/js/flipclock/flipclock.css">
				<div class="your-clock"></div>		
				<?php 
			}	
			?>
			</h4>
			<a class="btn btn-secondary btn-lg pull-right" href="<?php echo get_permalink( $competition_id ); ?>">View Now</a>
		</div>
		
		<?php
		}
		echo '</div>';
	}
	
	function add_clock_footer_scripts() {
		echo "<script src='".plugins_url() ."/bidx-competition-plugin/js/flipclock/flipclock.min.js'></script>";
		echo "<script>var clock = jQuery('.your-clock').FlipClock(". $this->diff .", { clockFace: 'DailyCounter', countdown: true });</script>";
	}
	
	/**
	 * Called when the shortcode is used
	 * @param array $atts
	 */
	function handle_shortcode( $atts ) {
		$competition_id = $atts['id'];
		$this :: render_content( $competition_id );
	}
	
}

/**
 * Allows registration for a competition from a page.
 * Rules are:
 * - Competition should still be active (in time)
 * - The user should not be registered, else it is a link to the competition info page en the business summary page.
 * - 
 */
class BidxCompetitionRegistrationWidget extends WP_Widget {

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->WP_Widget (
				'bidx_competition_registration_widget',
				__('Counter Widget'),
				array (
						'name' => ': : Bidx Competition Registration',
						'classname' => 'bidx_competition_registration_widget',
						'description' => __( 'Provides quick registration to a competition' )
				)
		);
	}
	
	/**
	 * Maintenance of the widget
	 * @param WP_Widget $instance
	 */
	function form( $instance ) {
		
		if ( $instance )
		{
			$competition_id = $instance['competition_id'];
			$competition_link = $instance['competition_link'];
		}
		else
		{
			$competition_id = '';
			$competition_link = '';
		}
		//get list of competitions
		$competitions = BidxCompetition :: get_competitions_list();
		?>
	    <p>
            <label for="<?php echo $this->get_field_id('competition_id'); ?>"><?php _e('Select Competition:', 'bidx_competition'); ?></label>
			<select name="<?php echo $this->get_field_name('competition_id') ?>" id="<?php echo $this->get_field_id('competition_id') ?>">
			<?php 
            foreach ( $competitions->posts as $competition) {
                printf(
                    '<option value="%s" %s >%s</option>',
                    $competition->ID,
                    $competition->ID == $competition_id ? 'selected="selected"' : '',
                    $competition->post_title
                );
            }
            ?>
            </select>
        </p> 
		<?php
	} 	
	

	/**
	 * Stores the value of the widget
	 * @param WP_Widget $new_instance
	 * @param WP_Widget $old_instance
	 * @return WP_Widget
	 */
	function update( $new_instance, $old_instance ) {
		$instance = $old_instance;
		$instance['competition_code'] = esc_sql( $new_instance['competition_code']);
		return $instance;
	}
	 
	/**
	 * Output
	 * @param array $args arguments for input
	 * @param WP_Widget $instance instance of this widget
	 */
	function widget($args, $instance) {
		extract( $args );
		$competition_id = $instance['competition_id'];
		
		echo $before_widget;
		echo $this -> render_content( $competition_id );
		echo $after_widget;
	}	
	
	/**
	 * Render the output for the registration
	 * @param string $competition_id
	 */
	function render_content( $competition_id ) {

		//check if user is logged in --> link to login with link to status page
		if ( is_user_logged_in() ) {
$user_id = ''; //get from environment
			$registration = new CompetitionRegistration( $competition_id );
			if ( $registration->is_user_in_competition( $user_id ) ) {

			}

		}


		//check if user has already joined this competition --> link to status page
		//check if competition is still over time --> link to status page
		//render registration output
		//store data is competition_id/user_id/e-mail/registration-datetime
		
	}
	
}


?>