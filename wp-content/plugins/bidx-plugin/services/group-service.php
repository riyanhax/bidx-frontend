<?php

/**
 * Gather group related information for:
 * - latest members
 * - group details
 * - list of groups
 * 
 * @author Jaap Gorjup
 * @version 1.0
 */
class GroupService extends APIbridge {

	/**
	 * Constructs the API bridge.
	 * Needed for operational logging.
	 */
	public function __construct() {
		parent :: __construct();
	}
	
  /**
   * Retrieves the latest members from a group
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return partial result from the service in JSON form containing the members
   */
  public function getLatestMembers( $group_id = null ) {

  	$result = $this -> getGroupDetails( $group_id );
  	return $result->data->latestMembers;
  }
  
  /**
   * Retrieves the full group data
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return full result from the service in JSON form
   */
  public function getGroupDetails( $group_id = null ) {
  	
  	if ($group_id == null) {
  		$session = BidxCommon :: $staticSession;
  		$group_id = $session -> data -> currentGroup;
  		if ($group_id == null) {
  			$group_id = $this->getGroupId( $session -> getBidxGroupDomain );
  		}
  	}
  	return $this->callBidxAPI('groups/' . $group_id, array(), 'GET');
	
  }

  /**
   * Retrieves the full group data
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return full result from the service in JSON form
   */
  public function getGroupList( $group_type = 'Open' ) {
  	 
  	return $this->callBidxAPI('groups/?groupType=' . $group_type, array(), 'GET');
  
  }  
  
  /**
   * Use an API service to match the group name to the group id needed for service calls
   * @param string $group_name name of the group determined by domain
   * @return long respresentation id of the group
   * @todo should be cached for public usage for performance reasons
   */
  public function getGroupId( $group_name ) {
  	
  	$group_id = 0;
  	$result = $this->callBidxAPI('groups/', array(), 'GET');
	$data = $result -> data;
  	foreach( $data as $group ) {
  		if ( $group -> domain === $group_name ) {
  			
  			$group_id = $group -> id;
  			break;
  		}
  	}
  	return $group_id;
  	
  }
  
}

?>
