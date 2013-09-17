<?php
	wp_enqueue_script( 'bidx-form' );
?>

	<!-- content starting here -->
	<div class="hero-block">

		<div class="container">
			<div class="row-fluid">

				<div class="span8">
					<div id="introCarousel" class="carousel slide">
						<?php
						$images = get_children(
									array(
									'post_parent' => $post->ID,
									'post_status' => 'inherit',
									'post_type' => 'attachment',
									'post_mime_type' => 'image',
									'order' => 'ASC',
									'orderby' => 'menu_order' )
									);
						?>
<!-- 						<ol class="carousel-indicators">
<?php
	/*$count = 0;
	foreach ( $images as $id => $image ) { ?>
	<li data-target="#introCarousel" data-slide-to="<?php echo $count ?>"
	<?php if ($count == 0) { ?> class="active" <?php } $count++; ?>></li>
<?php }*/ ?>
</ol> -->
						<!-- Carousel items -->
						<div class="carousel-inner">
						<?php
							$count = 0;
							foreach ( $images as $id => $image ) {
								$img = wp_get_attachment_image_src( $image->ID, 400 );
						?>
							<div class="item <?php if ($count == 0) { ?>active<?php } $count++; ?>">
								<img class="img-rounded" src="<?php echo $img[0] ?>" />
							    <!-- <div class="carousel-caption img-rounded">
							    			                      <h4><?php //echo $image -> post_title ?></h4>
							    			                      <p><?php //echo $image -> post_content ?></p>
							    			                    </div> -->
							</div>
						<?php } ?>
						</div>
					</div>
				</div>

				<div class="span4">
					<div class="signup well">
						<!-- ##### Widget Signup Start ######-->
						<form class="fieldset" method="post" action="/register">
							<div><!-- this div is necessary for container overflow issue IE7 -->
								<h3><?php _e('Welcome offer! Contact us to create a Group for free.','bidxtheme');?></h3>

								<div class="formfield control-group" data-validation='{"required":{"text":"<?php _e('This fields is mandatory')?>"},"typecheck":[{"email":{"text":"<?php _e('This is not a valid e-mail address')?>"}},{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"members/validateUsername","apimethod":"get"}}]}'>
									<input type="email" name="username" placeholder="<?php _e('Your email address','bidxtheme');?>">
								</div>

								<div class="formfield control-group" data-validation='{"required":{"text":"<?php _e('This field is mandatory')?>"},"typecheck":[{"custom":{"url":"/wp-admin/admin-ajax.php?action=bidx_request","apiurl":"groups/validateGroupName","apimethod":"get"}}]}'>
									<input type="text" name="groupName" placeholder="<?php _e('Your group name','bidxtheme');?>">
								</div>

								<div class="formfield control-group" data-validation='{"required":{"text":"<?php _e('This fields is mandatory')?>"}}'>
									<input type="text" name="country" placeholder="<?php _e('Country','bidxtheme');?>">
								</div>

								<a href="#" class="btn btn-block btn-primary jsCreateGroup"><?php _e("Submit your request",'bidxtheme');?></a>
							</div>
						</form>

						<div class="group-creation-progress">
							<div class="text"><?php _e('Your request is being processed.','bidxtheme');?></div>

							<div class="text sub"><?php _e('We appreciate your patience.','bidxtheme');?></div>
						</div>
                        <div class="group-creation-success">
							<div class="text"><?php _e('Your request is sent.','bidxtheme');?></div>

							<div class="text sub"><?php _e('Our service desk will contact you soon.','bidxtheme');?></div>
						</div>

						<script type="text/javascript">

					    	$(function(){
					    		/*
					    			if handler sends back response it can include the following json:
					    			{
										status: 'OK',
										redirect:'<URL to redirect too>'
									},
									{ //not yet implemented
										status: 'ERROR',
										fields: [{field:fieldname,error:errormessage}[,]]
									}
					    		*/

					    		$(".fieldset").form({
					    			callToAction : '.jsCreateGroup', // the selector for submit button
					    			errorClass : 'error', //the css class used as error message
					    			url : '/wp-admin/admin-ajax.php?action=bidx_staffmail',
					    			beforeSubmit : function(){
										var $this=$(".fieldset");
							    		$this.fadeOut("fast", function(){
							    			$(".group-creation-progress").fadeIn('fast');
							    		});
					    			},
                                    success : function(data){

                                        var $success=$(".group-creation-progress");
                                        $success.hide();
							    			$(".group-creation-success").fadeIn('fast');

					    			},
					    			//custom error message for frontend registration in case group creation fails
					    			error: function(data){
					    				$(".group-creation-progress").html("<div class=\"text sub\"><?php _e('Group creation failed. Please reload the page and try again. If the problem persists, please contact us.','bidxtheme')?>");

					    			}
					    		});
							});
					    </script>
						<!-- ##### Widget Signup End ######-->
					</div>
				</div><!-- end span4 -->
			</div><!-- end row-fluid -->
		</div><!-- end container -->
	</div>

	<div class="container content-block">
		<div class="row-fluid text-center">
			<h2><?php _e('Why bidX?','bidxtheme');?></h2>
			<p><?php _e('If you help businesses in emerging markets to start, grow or find finance, then you need bidX.<br />We work for incubatorscontent, business schools, chambers of commerce, governments, banks, investment funds, accountants...','bidxtheme');?></p>
		</div>
		<div class="row-fluid">
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> <?php _e('bidX solutions','bidxtheme');?></h3>
				<?php _e('Support intermediaries up-scale services for their network of entrepreneurs, mentors and investors.','bidxtheme');?>
			</div>
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> <?php _e('bidX platform','bidxtheme');?></h3>
				<?php _e('Offers access to a global entrepreneurship marketplace.','bidxtheme');?>
			</div>
			<div class="span4 usp-block bidx-well">
				<h3 class="title"><span class="fui-check"></span> <?php _e('bidX model','bidxtheme');?></h3>
				<?php _e('Rewards your collaboration with the opportunity to generate revenue.','bidxtheme');?>
			</div>
		</div>

		<hr />
	</div>

	<div class="container content-block howitworks">
		<div class="row-fluid text-center">
			<h2><?php _e('How It Works','bidxtheme');?></h2>
			<p><?php _e('To grow your network of entrepreneurs, mentors and investors, bidX invites you to create a Group.<br />The Group is an online space aggregating tools to support, virtually, all your services from business idea rating to successful matchmaking.','bidxtheme');?></p>
		</div>
		<div class="row-fluid">
			<div class="span4 howitworks-block howitworks-block-freefasteasysetup">
				<div class="text-center">
					<span class="howitworks-freefasteasysetup"></span>
				</div>
				<h3 class="title"><?php _e('1. Free, fast and easy set-up','bidxtheme');?></h3>
				<ul class="bidx-list-checks">
					<li><?php _e('Submit a request to create a Group at bidX.net','bidxtheme');?></li>
					<li><?php _e('Customize and brand your Group page','bidxtheme');?></li>
					<li><?php _e('Invite members, social media followers and contacts to join your Group','bidxtheme');?></li>
				</ul>
			</div>
			<div class="span4 howitworks-block howitworks-block-sourceconnectfinance">
				<div class="text-center">
					<span class="howitworks-sourceconnectfinance"></span>
				</div>
				<h3 class="title"><?php _e('2. Source, Connect, Finance','bidxtheme');?></h3>
				<ul class="bidx-list-checks">
					<li><?php _e('Competition feature: Engage promising businesses and accelerate their growth','bidxtheme');?></li>
					<li><?php _e('Mentoring feature: Unleash the potential of entrepreneurs, connecting them with the highest rated mentors','bidxtheme');?></li>
					<li><?php _e('Matchmaking feature: Match the best businesses with committed investors','bidxtheme');?></li>
				</ul>
			</div>
			<div class="span4 howitworks-block howitworks-block-generaterevenues">
				<div class="text-center">
					<span class="howitworks-generaterevenues"></span>
				</div>
				<h3 class="title"><?php _e('3. Generate revenues','bidxtheme');?></h3>
				<ul class="bidx-list-checks">
					<li><?php _e('Our solutions are not only innovative but also profitable. We offer a fair and transparent revenue sharing package','bidxtheme');?></li>
					<li><?php _e('We are actively looking out for functional and content partners to provide our clients with the best options','bidxtheme');?></li>
				</ul>
			</div>
		</div>

		<hr />
	</div>

	<div class="container content-block oursolutions">
		<div class="row-fluid text-center">
			<h2><?php _e('Our Solutions','bidxtheme');?></h2>
			<p><?php _e('Using technology for business growth','bidxtheme');?></p>
		</div>
		<div class="row-fluid">
			<div class="span4 usp-block bidx-well">
				<div>
					<?php _e('Is your investment fund receiving tons of business plans a day?','bidxtheme');?>
				</div>
				<div class="sprite arrow-down solutions-arrow"></div>
				<div>
					<?php _e('Filter & Screen finance ready plans with the <strong>Rating feature</strong>','bidxtheme');?>
				</div>
			</div>
			<div class="span4 usp-block bidx-well">
				<div>
					<?php _e('Does your incubator need innovative tools to reach and engage entrepreneurs?','bidxtheme');?>
				</div>
				<div class="sprite arrow-down solutions-arrow"></div>
				<div>
					<?php _e('Find and accelerate promising businesses with the <strong>Group & Competition features</strong>','bidxtheme');?>
				</div>
			</div>
			<div class="span4 usp-block bidx-well">
				<div>
					<?php _e('Do entrepreneurs in your network need tools to strengthen their idea?','bidxtheme');?>
				</div>
				<div class="sprite arrow-down solutions-arrow"></div>
				<div>
					<?php _e('Transform business ideas into ready-for-finance plans with the <strong>Business Proposal feature</strong>','bidxtheme');?>
				</div>
			</div>
		</div>
		<div class="text-center">
			<a href="/features" class="btn btn-bidx-blue"><?php _e('View all features','bidxtheme');?><i class="fui-arrow-right pull-right"></i></a>
		</div>
		<hr />
	</div>

	<div class="container content-block notaserviceprovider">
		<div class="text-center">
			<h2><?php _e('Not a service provider?','bidxtheme');?></h2>
			<p><?php _e('We do have solutions for entrepreneurs &amp; investors!','bidxtheme');?></p>
		</div>
		<div class="row-fluid">
			<div class="span6 bidx-well notaserviceprovider-block">
				<h3 class="title"><?php _e('For Entrepreneurs','bidxtheme');?></h3>
				<p><?php _e('If you are an entrepreneur and need to expose your business to investors you are in the right place.','bidxtheme');?></p>
				<h5 class="subtitle"><?php _e("What's in it for me?",'bidxtheme');?></h5>
				<ul class="bidx-list-checks">
					<li><?php _e('Use templates &amp; services to create finance ready Business Proposals','bidxtheme');?></li>
					<li><?php _e('Join Groups to generate leads for your business, network with like-minded professionals and find the expertise to grow your business','bidxtheme');?></li>
					<li><?php _e('Find and connect with mentors &amp; investors','bidxtheme');?></li>
				</ul>
				<a href="/entrepreneurs" class="btn btn-bidx-blue"><?php _e('Entrepreneurs','bidxtheme');?> <i class="fui-arrow-right pull-right"></i></a>
			</div>
			<div class="span6 bidx-well notaserviceprovider-block">
				<h3 class="title"><?php _e('For Investors','bidxtheme');?></h3>
				<p><?php _e('As an investor you will have access to the best Business Proposals matching your preferences.','bidxtheme');?></p>
				<h5 class="subtitle"><?php _e("What's in it for me?",'bidxtheme');?></h5>
				<ul class="bidx-list-checks">
					<li><?php _e('Get alerts of the latest relevant businesses based on your interests','bidxtheme');?></li>
					<li><?php _e('Find and Connect with entrepreneurs in selected areas','bidxtheme');?></li>
					<li><?php _e('Join Groups of Business and Finance service providers to network and generate leads','bidxtheme');?></li>
				</ul>
				<a href="/investors" class="btn btn-bidx-blue"><?php _e('Investors','bidxtheme');?> <i class="fui-arrow-right pull-right"></i></a>
			</div>
		</div>
	</div>
