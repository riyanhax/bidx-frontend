<?php
?>
<form id="registration"  name="registration">

	<div class="row-fluid">
		<div class="span4 block">
			<h3>Complete your profile</h3>
			<div class="formfield" >
				<label>First name</label>
				<input type="text" name="personalDetails.firstName" placeholder="Please type your first name" />
			</div>

			<div class="formfield">
				<label>Last name</label>
				<input type="text" name="personalDetails.lastName" placeholder="Please type your last name" />
			</div>

			<div class="formfield">
				<label>E-mail</label>
				<input type="email" readonly="readonly" name="email" value="[!USERNAME!]"/>
			</div>

			<div class="formfield">
				<label>What is your location?</label>
				<input type="text" name="personalDetails.address[0]." placeholder="Please type your location" data-type="location" data-type-arguments=''/>
			</div>
		</div>
		<div class="span8 block">
			<h3>About your group</h3>
			<div class="formfield">
				<label>Logo</label>
				<input type="file" name="logo" data-type="fileUpload" data-type-arguments='{"url":"/wp-admin/admin-ajax.php?action=file_upload", "addFields":["groupProfileId","domain"]}' value=""/>
			</div>			
			<div class="formfield">
				<label>Group Name</label>
				<input type="text" name="businessGroupName" readonly="readonly" placeholder="Please type your group name" value="[!GROUPNAME!]"/>
			</div>

			<div class="formfield">
				<label>Define your group in 15 words</label>
				<textarea name="slogan" placeholder="Define your group"></textarea>
			</div>

			<div class="formfield">
				<label>Short description</label>
				<textarea name="shortDescription" placeholder="Place provide a short description"></textarea>
			</div>
<!-- 
			<div class="formfield">
				<label>Location</label>
				<input type="text" name="companyLocation" placeholder="Please type your location" />
			</div> -->
		
			<div class="formfield">
				<label>Company</label>
				<input type="text" name="company" placeholder="Please type your company name" />
			</div>

			<div class="formfield" data-validation='{"typecheck": [{"url":{"text":"Please fill in a valid URL"}}]}'>
				<label>Website</label>
				<input type="text" name="webSite"  placeholder="Please type your website" />
			</div>

<!-- List must be loaded from static data service -->
			<div class="formfield">
				<label>Focus industry</label>
				<select name="focusIndustry" >
					<option value="">Please select your focus industry</option>
					<option value="AccountingAuditorsTaxBookkeepers">Accounting, Auditors, Tax & Bookkeepers</option>
					<option value="AdvertisingPublicRelations">Advertising & Public Relations</option>
					<option value="AgricultureProductsServices">Agriculture Products & Services</option>
					<option value="AnimalProducts">Animal Products</option>
					<option value="ApparelAccessoriesTextiles">Apparel / Accessories / Textiles</option>
					<option value="ArchitecturalEngineeringTechnical">Architectural, Engineering & Technical</option>
					<option value="BankingFinancialServices">Banking & Financial Services</option>
					<option value="BeveragesAlcoholicNon-alcoholic">Beverages, Alcoholic & Non-alcoholic</option>
					<option value="BuildingSystemsMaterialsFixtures">Building Systems / Materials / Fixtures</option>
					<option value="BusinessConsultancyAdvisory">Business Consultancy & Advisory</option>
					<option value="Chemicals">Chemicals</option>
					<option value="ComputerITProductsServices">Computer & IT Products & Services</option>
					<option value="ConstructionGeneral">Construction General</option>
					<option value="EducationTraining">Education & Training</option>
					<option value="EntertainmentRecreation">Entertainment & Recreation</option>
					<option value="EnvironmentalProductsServices">Environmental Products & Services</option>
					<option value="ExecutiveSearchPersonnelRecruitment">Executive Search & Personnel Recruitment</option>
					<option value="FarmEquipment">Farm Equipment</option>
					<option value="FoodManufacturingDistributionServices">Food Manufacturing / Distribution / Services</option>
					<option value="GasesNaturalProcessed">Gases, Natural & Processed</option>
					<option value="HealthHygieneProductsServices">Health / Hygiene Products & Services</option>
					<option value="HotelsRestaurantsCaterers">Hotels / Restaurants / Caterers</option>
					<option value="IndustrialEquipment">Industrial Equipment</option>
					<option value="InformationCommunicationsTechnology">Information & Communications Technology</option>
					<option value="InspectionSafetySecurity">Inspection, Safety & Security</option>
					<option value="Insurance">Insurance</option>
					<option value="LegalPractice">Legal Practice</option>
					<option value="MarketingCommunications">Marketing & Communications</option>
					<option value="OutplacementServices">Outplacement Services</option>
					<option value="PetroleumPetroleumProducts">Petroleum & Petroleum Products</option>
					<option value="PharmaceuticalMedicinalProducts">Pharmaceutical & Medicinal Products</option>
					<option value="PowerElectrical">Power & Electrical</option>
					<option value="PrintingPublishing">Printing & Publishing</option>
					<option value="PropertyRealEstateServices">Property & Real Estate Services</option>
					<option value="RetailConsumerProducts">Retail Consumer Products</option>
					<option value="ScientificMedicalInstruments">Scientific & Medical Instruments</option>
					<option value="SecurityInvestigativeServicesProducts">Security, Investigative Services & Products</option>
					<option value="SourcingTradingBuying">Sourcing, Trading & Buying</option>
					<option value="TransportVehiclesParts">Transport Vehicles & Parts</option>
					<option value="TransportationLogistics">Transportation & Logistics</option>
					<option value="TravelTourism">Travel & Tourism</option>
					<option value="WaterSanitation">Water & Sanitation</option>
				</select>
			</div>

			<div class="formfield">
				<label>Roles</label>
				<select name="role">
					<option value="">On which roles does your group focus</option>
					<option value="investors">Investors</option>
					<option value="entrepeneurs">Entrepeneurs</option>
				</select>
			</div>
			
<!-- List must be loaded from static data service -->
			<div class="formfield" >
				<label>The social impact e.g. poverty reduction, job creation, religious tolerance, women, social inclusion, urban regeneration and None applicable.</label>
				<select name="socialImpact" >
					<option value="">Please select the social impact of your group</option>
					<option value="povertyReduction">Poverty reduction</option>
					<option value="jobCreation">Job Creation</option>
					<option value="womenBusiness">Women in Business</option>
					<option value="religiousTolerance">Religious tolerance</option>
					<option value="socialInclusion">Social inclusion</option>
					<option value="urbanRegeneration">Urban regeneration</option>
					<option value="none">None of the above</option>
				</select>
			</div>

			<div class="formfield">
				<label>Is the location of your focus based on a:</label>
				<label class="radio"><input type="radio" name="location-type" value="city" checked> city (or a number of cities)?</label>
				<label class="radio"><input type="radio" name="location-type" value="country"> country (or a number of countries)?</label>
				<label class="radio"><input type="radio" name="location-type" value="coord"> specific location (or a number of specific locations)?</label>

				<div class="location-list cities">

					<div class="explanation">EXPLANATION OF HOW TO THIS OPTION WORKS</div>
					<div>
						<input type="text" name="focusCity" data-type="location" data-type-arguments='{"listResults":"true","listId":"locationList", "emptyClass":"empty","filter":"cities"}' placeholder="Please type your focus theme" />
					</div>
					<div class="list">
						<ul id="locationList" class="clearfix">
							<li>
								<div class="label empty">Add a location</div>
							</li>

						</ul>
					</div>
				</div>

				<div class="location-list countries jqHidden">
					<div class="explanation">EXPLANATION OF HOW TO THIS OPTION WORKS</div>
					<div>
						<input type="text" name="focusCountry" data-type="countryAutocomplete" data-type-arguments='{"listId":"countryList","emptyClass":"empty"}' placeholder="Please type your focus theme" />
					</div>
					<div class="list">
						<ul id="countryList" class="clearfix">
							<li>
								<div class="label empty">Add a location</div>
							</li>

						</ul>
					</div>
				</div>
				<div class="location-map jqHidden">
					<div class="explanation">EXPLANATION OF HOW TO USE THE MAP</div>
					<div>
						<input type="text" name="focusLocation" data-type="location" data-type-arguments='{"showMap":"true","mapDimensions":"width:100%;height:400px;","setMarkers":"true", "drawCircle":"true"}' placeholder="Please type your focus theme" />
					</div>
				</div>				
			</div>
			
		</div>
		<div class="save-block">
			<a href="#" class="button primary jsSave">Save Profile</a>                       
		</div>
	</div>
	
    <!--HIDDEN-->
</form>
<script type="text/javascript">
	$(function(){
		
		$("form").form({
			callToAction : '.jsSave',
			errorClass : 'error',
			url : '/wp-admin/admin-ajax.php?action=bidx_register',
			apiurl:'ajax_register_action',
			apimethod:'post',			
			enablePlugins: ['date','location','fileUpload','countryAutocomplete'],
			beforeSubmit : function () {
				/*document.location = "/group-creation-success/" */
			}
		});

		

		$("[name=location-type]").click(function(e){
			var $this=$(this);
			if ($this.val() == "city"){
				$(".location-map, .location-list.countries").fadeOut('fast',function(){
					
					$(".location-list.cities").fadeIn('fast');	
				});
			}
			else if ($this.val() == "country"){

				$(".location-map, .location-list.cities").fadeOut('fast',function(){

					
					$(".location-list.countries").fadeIn('fast');	
				});
			}
			else if ($this.val() == "coord"){
				$(".location-list").fadeOut('fast',function(){
					$(".location-map").fadeIn('fast');	
				});
			}
		});

	});
</script>
<script src="https://maps.googleapis.com/maps/api/js?v=3&sensor=false&libraries=places"></script>
