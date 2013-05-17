<?php

/**
 * Session service that returns a list of session variables.
 * 
 * @author Altaf Samnani
 * @version 1.0 
 * @link http://bidx.net/api/v1/member
 *
 */
class MemberService extends APIbridge {

	/**
	 * Constructs the API bridge.
	 * Needed for operational logging.
	 */
	public function __construct() {
		parent :: __construct();
	}
	
	/**
	 * Checks if the user is logged in on the API
	 * 
	 * @param boolean $serviceCheck define if a service check is needed or a simple check on the API cookie is sufficient.
	 * In case of no API service check, the data in the Session profile will be very limited.
	 * @return boolean if user is logged in
	 */
	function getMemberDetails( ) {

		$sessionData = BidxCommon::$staticSession;
		$memberId    = $sessionData->memberId;

		//Call member profile
		$result = $this->callBidxAPI('members/' . $memberId, array(), 'GET'); 
		//If edit rights inject js and render edit button
		if ($result->data->bidxMemberProfile->bidxCanEdit) {
			$result->data->isMyProfile  = ($memberId == $sessionData->data->id) ? true : false;
		}

		return $result;
	}

}

?>
