<?php

/**
 * Custom functions for Bidx
 *
 *
 */
/**
 * Applies the template replacement variables from Post vars
 *
 * @since April 16
 * @Author Altaf Samnani
 *
 * @param string $content  Template Content
 * @param string $content  Replaced Template Content
 */
add_filter ('the_content', 'bidx_filter', 20);

function bidx_filter ($content)
{
    $formValues = $_POST;
    $hiddenElement = "";
    foreach ($formValues as $key => $value) {
        $varName = '[!' . strtoupper ($key) . '!]';
        if (strpos ($content, $varName)) {
            $content = str_replace ($varName, $value, $content);
        } else {
            $hiddenElement .= '<input type="hidden" name="' . $key . '" value="' . $value . '">';
        }
    }

    //Replace the redirect variable
    if (isset ($_GET['q'])) {
        $redirect = $_GET['q'];
        $content = str_replace ('[!Q!]', $redirect, $content);
    }

    //Replace the redirect variable
    if (isset ($_GET['q'])) {
        $redirect = $_GET['q'];
        $content = str_replace ('[!Q!]', $redirect, $content);
    }

    //Add Status Messages if any
    $content = bidx_get_status_msgs() . $content;

    // Add variables as hidden that cant be replaced from Post Variables to keep the previous state
    $content = str_replace ('</form>', $hiddenElement . '</form>', $content);

    // Debug the Get/Post params
    if (DOMAIN_CURRENT_SITE == 'bidx.dev') {

        // new dBug($_REQUEST);
    }

    return $content;
}

function bidx_get_status_msgs( ) {

    $statusMessages = '';
    //Add Error Status Msg
    if (isset ($_GET['emsg'])) {
        $decodedStatusMsg = base64_decode ($_GET['emsg']);
        $statusMessages = "<div class='alert alert-error'>
                      <button data-dismiss='alert' class='close fui-cross' type='button'></button>
                      {$decodedStatusMsg}
                    </div>";
       // $content = str_replace ('<!-- Msg -->', $statusMsgDiv, $content);
    }
    
    //Add Success Status Msg

    if (isset ($_GET['smsg'])) {
        $decodedStatusMsg = base64_decode ($_GET['smsg']);
        $statusMessages = "<div class='alert alert-success'>
                      <button data-dismiss='alert' class='close fui-cross' type='button'></button>
                      {$decodedStatusMsg}
                    </div>";
        // $content = str_replace ('<!-- Msg -->', $statusMsgDiv, $content);
    }


    return $statusMessages;
}