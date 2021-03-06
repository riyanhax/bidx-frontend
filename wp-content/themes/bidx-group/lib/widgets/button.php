<?php
// register widget
add_action( 'widgets_init', function()
{
    register_widget( 'Button_Widget' );
});

class Button_Widget extends WP_Widget {

    ///////////////////////////
    // Initialise the widget //
    ///////////////////////////
    function Button_Widget()
    {
        $this->WP_Widget
        (
            'button_widget',
            __('Carousel'),
            array
            (
                'name' => ': : Bidx Button ',
                'classname' => 'widget-button',
                'description' => __( "Use this widget add a button." )
            )
        );
    }

    // The admin form for the widget
    ///////////////////////////
    // Setup the form fields //
    ///////////////////////////
    function form( $instance )
    {
        // d($instance);
        if ( $instance )
        {
            $title = $instance['title'];
            $buttontext = $instance['buttontext'];
            $buttonlink = $instance['buttonlink'];
            $buttonblock = $instance['buttonblock'] ? 'checked="checked"' : '';
            $buttonalign = esc_attr($instance['buttonalign']);
            $buttonstyle = esc_attr($instance['buttonstyle']);
            $buttonsize = esc_attr($instance['buttonsize']);
            $buttonicon = $instance['buttonicon'];
        }
        else
        {
            $title ='';
            $buttontext ='';
            $buttonlink ='';
            $buttonblock ='';
            $buttonalign ='text-center';
            $buttonstyle ='btn-primary';
            $buttonsize ='btn';
            $buttonicon = '';
        }
?>

        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Widget Title:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo $title; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('buttontext'); ?>"><?php _e('Text: (required)', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('buttontext'); ?>" name="<?php echo $this->get_field_name('buttontext'); ?>" type="text" value="<?php echo $buttontext; ?>" />
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('buttonlink'); ?>"><?php _e('Link: (required)', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('buttonlink'); ?>" name="<?php echo $this->get_field_name('buttonlink'); ?>" type="text" value="<?php echo $buttonlink; ?>" />
        </p>

       <!-- Promot Text Activated Languages -->
        <?php
            if ( is_plugin_active( 'sitepress-multilingual-cms/sitepress.php') )
            {
                $langArr            =   wpml_get_active_languages( );

                unset($langArr['en']);

                foreach($langArr as $lang => $langVal)
                {
                    $labelButtonText =   'buttontext'.$lang;
                    $labelButtonLink =   'buttonlink'.$lang;
                    $buttontext      =   (isset($instance[$labelButtonText])) ?  $instance[$labelButtonText] : '';
                    $buttonlink      =   (isset($instance[$labelButtonLink])) ?  $instance[$labelButtonLink] : '';
        ?>
                    <p>
                        <label for="<?php echo $this->get_field_id($labelButtonText); ?>">Text: (<?php echo $lang;?>)</label>
                        <input class="widefat" id="<?php echo $this->get_field_id($labelButtonText); ?>" name="<?php echo $this->get_field_name($labelButtonText); ?>" type="text" value="<?php echo $buttontext; ?>" />
                    </p>
                    <p>
                        <label for="<?php echo $this->get_field_id($labelButtonLink); ?>">Link: (optional - <?php echo $lang;?>)</label>
                        <input class="widefat" id="<?php echo $this->get_field_id($labelButtonLink); ?>" name="<?php echo $this->get_field_name($labelButtonLink); ?>" type="text" value="<?php echo $buttonlink; ?>" />
                    </p>
        <?php   }

            }
        ?>

        <p>
            <label><?php _e('Style', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('primary'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('primary'); ?>"
                name="<?php echo $this->get_field_name('buttonstyle'); ?>"
                value="btn-primary" <?php if($buttonstyle === 'btn-primary'){ echo 'checked="checked"'; } ?>
            /><?php _e('Primary', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('secondary'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('secondary'); ?>"
                name="<?php echo $this->get_field_name('buttonstyle'); ?>"
                value="btn-secondary" <?php if($buttonstyle === 'btn-secondary'){ echo 'checked="checked"'; } ?>
            /><?php _e('Secondary', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>
        <p>
            <label><?php _e('Alignment', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('left'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('left'); ?>"
                name="<?php echo $this->get_field_name('buttonalign'); ?>"
                value="text-left" <?php if($buttonalign === 'text-left'){ echo 'checked="checked"'; } ?>
            /><?php _e('Left', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('center'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('center'); ?>"
                name="<?php echo $this->get_field_name('buttonalign'); ?>"
                value="text-center" <?php if($buttonalign === 'text-center'){ echo 'checked="checked"'; } ?>
            /><?php _e('Center', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('right'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('right'); ?>"
                name="<?php echo $this->get_field_name('buttonalign'); ?>"
                value="text-right" <?php if($buttonalign === 'text-right'){ echo 'checked="checked"'; } ?>
            /><?php _e('Right', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>
        <p>
            <label><?php _e('Size', 'wp_widget_plugin'); ?></label><br>
            <label for="<?php echo $this->get_field_id('xs'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('xs'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-xs" <?php if($buttonsize === 'btn-xs'){ echo 'checked="checked"'; } ?>
            /><?php _e('XS', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('sm'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('sm'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-sm" <?php if($buttonsize === 'btn-sm'){ echo 'checked="checked"'; } ?>
            /><?php _e('SM', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('btn'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('btn'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn" <?php if($buttonsize === 'btn'){ echo 'checked="checked"'; } ?>
            /><?php _e('Normal', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('lg'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('lg'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-lg" <?php if($buttonsize === 'btn-lg'){ echo 'checked="checked"'; } ?>
            /><?php _e('LG', 'wp_widget_plugin'); ?>&nbsp;
            </label>
            <label for="<?php echo $this->get_field_id('xl'); ?>">
            <input
                class="radio"
                type="radio"
                id="<?php echo $this->get_field_id('xl'); ?>"
                name="<?php echo $this->get_field_name('buttonsize'); ?>"
                value="btn-xl" <?php if($buttonsize === 'btn-xl'){ echo 'checked="checked"'; } ?>
            /><?php _e('XL', 'wp_widget_plugin'); ?>&nbsp;
            </label>
        </p>
        <p>
            <input class="checkbox" type="checkbox" <?php echo $buttonblock; ?> id="<?php echo $this->get_field_id('buttonblock'); ?>" name="<?php echo $this->get_field_name('buttonblock'); ?>" />
            <label for="<?php echo $this->get_field_id('buttonblock'); ?>"><?php _e('Block button', 'wp_widget_plugin'); ?></label>
        </p>
        <p>
            <label for="<?php echo $this->get_field_id('buttonicon'); ?>"><?php _e('Icon:', 'wp_widget_plugin'); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id('buttonicon'); ?>" placeholder="fa-arrow-right" name="<?php echo $this->get_field_name('buttonicon'); ?>" type="text" value="<?php echo $buttonicon; ?>" />
            <label>Find the icon from <a target="_blank" href="http://fontawesome.io/icons/">this</a> list</label>
        </p>

<?php


    } // END: function form( $instance )

    //////////////////////////////////////////////////////////////////
    // The update function to insert the chosen values in to the db //
    //////////////////////////////////////////////////////////////////
    function update( $new_instance, $old_instance )
    {
        $instance = $old_instance;
        $instance['title'] = esc_sql( $new_instance['title']);
        $instance['buttontext'] = esc_sql( $new_instance['buttontext'] );
        $instance['buttonlink'] = esc_sql( $new_instance['buttonlink'] );
        $instance['buttonblock'] = esc_sql( $new_instance['buttonblock'] ? true : false );
        $instance['buttonalign'] = strip_tags( $new_instance['buttonalign'] );
        $instance['buttonstyle'] = strip_tags( $new_instance['buttonstyle'] );
        $instance['buttonsize'] = strip_tags( $new_instance['buttonsize'] );
        $instance['buttonicon'] = esc_sql( $new_instance['buttonicon'] );

        if ( is_plugin_active( 'sitepress-multilingual-cms/sitepress.php') )
        {
            $langArr            =   wpml_get_active_languages( );

            unset($langArr['en']);

            foreach($langArr as $lang => $langVal)
            {
                $labelButtonText             =   'buttontext'.$lang;
                $labelButtonLink             =   'buttonlink'.$lang;
                $instance[$labelButtonText]  =   esc_sql( $new_instance[$labelButtonText] );
                $instance[$labelButtonLink]  =   esc_sql( $new_instance[$labelButtonLink] );
            }
        }

        return $instance;
    }

    /////////////////////////////////////////
    // The front end display of the widget //
    /////////////////////////////////////////
    function widget($args, $instance) {
        extract( $args );
        $currentLanguage =  getLangPrefix( );
        $currentLanguage = ( $currentLanguage !== 'en' ) ? $currentLanguage : '';

        // these are the widget options
        $buttontext = $instance['buttontext'.$currentLanguage];
        $buttonlink = $instance['buttonlink'.$currentLanguage];


        $buttonblock = $instance['buttonblock'] ? ' btn-block' : ' ';
        $buttonalign = $instance['buttonalign'];
        $buttonstyle = $instance['buttonstyle'];
        $buttonsize = $instance['buttonsize'];
        $widget_id = $args['widget_id'];
        $buttonicon = $instance['buttonicon'];

        // Region Check
        $active_region = $args['id'];
        $add_container = false;
        if  ( ( $active_region === 'pub-front-top' || $active_region === 'priv-front-top' ) && get_theme_mod( 'front_top_width' ) !== true )
        {
            $add_container = true;
        }

        if  ( ( $active_region === 'pub-front-bottom' || $active_region === 'priv-front-bottom' ) && get_theme_mod( 'front_bottom_width' ) !== true )
        {
            $add_container = true;
        }

        echo $before_widget;

        if ( $buttonlink && $buttontext )
        {
            if ( $add_container ) :
?>
                <div class="container">
<?php
            endif;
?>
            <div class="<?php echo $buttonalign; ?>">
<?php
                if ( $buttonlink ) { echo '<a class="btn' . ' ' . $buttonsize . ' ' . $buttonstyle . ' ' . $buttonblock .' " href="' . $buttonlink . '">'; }
                    if ($buttonicon) { echo '<i class="fa '.$buttonicon.'"></i>&nbsp;'; }
                    echo $buttontext;
                if ( $buttonlink ) { echo '</a>'; }
?>
            </div>
<?php
            if ( $add_container ) :
?>
                </div>
<?php
            endif;
        }
        else
        {
            if ( $add_container ) :
?>
                <div class="container">
<?php
            endif;
?>
            <div class="alert alert-danger">
                <blockquote>
                    <p><?php _e('Please add button text and a link', 'bidxplugin') ?></p>
                </blockquote>
                <p class="hide-overflow">
                    <span class="pull-left">
                        <?php _e('Sidebar', 'bidxplugin') ?>: <strong><?php echo $args['name']; ?></strong>&nbsp;
                    </span>
                    <span class="pull-right">
                        <?php _e('Widget', 'bidxplugin') ?>: <strong><?php echo $args['widget_name']; ?></strong>
                    </span>
                </p>
            </div>
<?php
            if ( $add_container ) :
?>
                </div>
<?php
            endif;

        }

       echo $after_widget;
    }

} // END: class HotTopics
