<?php

/**
 * Gather group related information for:
 * - latest members
 * - group details
 * - list of groups
 *
 * @author Jaap Gorjup
 * @version 1.0
 *
 * @todo store the group related data centrally so the data is called only once
 * @todo see if the listMembers is not already in the session which optimizes one call
 * @todo Overview of all groups should be cached for public usage for performance reasons or future optimization of group service
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

  	if ( property_exists( $result, 'data' ) ) {
  		return $result -> data -> latestMembers;
  	}
  	else {
  		return;
  	}

  }


  /**
   * Retrieves the latest companies from a group
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return partial result from the service in JSON form containing the members
   */
  public function getLatestBusinessSummaries( $group_id = null ) {

    $result = $this -> getGroupDetails( $group_id );

    if ( property_exists( $result, 'data' ) ) {
      return $result -> data -> latestBusinessSummaries;
    }
    else {
      return;
    }

  }


  /**
   * Retrieves the full group data
   * @param string $group_id optional a group id otherwise the current
   * @link http://bidx.net/api/v1/group
   * @return full result from the service in JSON form
   */
  public function getGroupDetails( $group_id = null ) {

	if ($group_id == null) {
		if ( false === ( $result = get_transient( 'localgroup' ) ) ) { 		
			// It wasn't there, so regenerate the data and save the transient
			$result = $this->callBidxAPI( 'groups/' . $this -> get_bidx_subdomain(), array(), 'GET' );
			set_transient( 'localgroup', $result, 3600 ); //1 hour
		} else {
			$result = $result = get_transient( 'localgroup');
		}
	} else {
		$result = $this->callBidxAPI( 'groups/' . $group_id, array(), 'GET' );
	}

	return $result;
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
   */
public function getGroupId( $group_name ) {

  	$group_id = 0;

  	if ( false === ( $result = get_transient( 'groupoverview' ) ) ) {
  		// It wasn't there, so regenerate the data and save the transient
  		$result = $this->callBidxAPI('groups/', array(), 'GET');
  		set_transient( 'groupoverview', $result, 300 );
  	}

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
