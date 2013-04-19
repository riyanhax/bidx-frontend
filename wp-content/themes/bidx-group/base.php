<?php get_template_part('templates/head'); ?>
<?php include_once("lib/dBug.php")?>
<body <?php body_class(); ?>>

  <!--[if lt IE 7]><div class="alert">Your browser is <em>ancient!</em> <a href="http://browsehappy.com/">Upgrade to a different browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to experience this site.</div><![endif]-->

  <?php
  	$authenticated=false;
   	if (isset($_GET['signedin'])) {
  		$authenticated=true;
    }
    
    do_action('get_header');
    if($authenticated) {
    	get_template_part('templates/header-dashboard');
    }
    else {
    	get_template_part('templates/header');
    }
  

  ?>

  <?php include roots_template_path(); 
  
	if($authenticated) {
	 get_template_part('templates/footer-dashboard');
  }
	else {
		get_template_part('templates/footer');
  }
  
 ?>  
  
</body>
</html>
