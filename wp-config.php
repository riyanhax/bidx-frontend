<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

/**
 *  --- Environment specific settings ---
 */

/** what environment : local/test/acceptance/demo or empty for production**/
define('BIDX_ENV', 'local');

//replace this by automatic value and connect to backend.test.bidnet.vc:8080
define('API_DOMAIN', 'test.bidx.net');
//autofill this by environment
define('WP_DEVELOPMENT', true);

//these values should NOT be in the generic defines (hackable)
//ideally we remove the need for the username/password and use another mechanism
/** The username for admin access to the API **/
define('API_AUTH_UNAME','bidx');
/** The password for admin access to the API **/
define('API_AUTH_PASS','gobidx');

/** The name of the database for WordPress */
define('DB_NAME', 'bidx');
/** MySQL database username */
define('DB_USER', 'root');
/** MySQL database password */
define('DB_PASSWORD', 'root');
/** MySQL hostname */
define('DB_HOST', 'localhost');

/**
 *  --- End of environment specific settings ---
 */

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');
/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');
define('DOMAIN_CURRENT_SITE', BIDX_ENV . '.bidx.net');

/**
 * Authentication Unique Keys and Salts.
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 * @since 2.6.0
 */
define('AUTH_KEY',         '%(h1mMtZ~t>7pC};H/,>J|[O|/I^Q TflEIa+%PUj|B~M6H8%&c+T.}F(|XI_hGb');
define('SECURE_AUTH_KEY',  '$]z{Vq[z,$T3GT0S&dP5&niTC)6r=W ^HG s2!rWJ-(5(NqCk]F8?bOb#+{vnnch');
define('LOGGED_IN_KEY',    'nd)1MJy|?]:c6j:UP9h4.M7Rz>OE),9Wkv1mc?I_B+Qf-{Hw.0{R6vt+!w^c<ap@');
define('NONCE_KEY',        '!nFN.~#A-o;Y_ePP$N.>;-_(|Jc<<Z=19@o,ci{%m+fqR|w45Z449y^l_5.Nt+1p');
define('AUTH_SALT',        '?.5|_2);@?mEt((B4I,<MG6#xa2Q-|I9#W53y3n*,nJ({BjR*>B`j-GKBf)]O{JA');
define('SECURE_AUTH_SALT', '}{krku(L8-#]TB/3IEc%X=x?y@OeBt?O1z$)k`qD~yd.&fD/8%l{1kk|?&7y9N2+');
define('LOGGED_IN_SALT',   '76B.h(:0)|RxpqUc}X?iDl|8p;Q|Wf6H_-tVei7e>gz&&;V,|?^8v|y_{`#^6wz-');
define('NONCE_SALT',       '-hDJc^&:M&c=/@)6.;rw1T%dFT;HnWO9h+u*6mY0xspAX6L6KcMP<~|f8B%A0-7w');

/**
 * Cookie settings
 * Ensuring cookies are shared
 * Create unique cookies for environments
 */
define('ADMIN_COOKIE_PATH', '/');
define('COOKIE_DOMAIN', 'bidx.net');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');
define('LOGGED_IN_COOKIE', 'bidx_logged_in' . BIDX_ENV . '_' . COOKIEHASH);
define('BIDX_ALLOWED_COOKIES', '(bidx)');

define('SCRIPT_DEBUG', false);
define('CONCATENATE_SCRIPTS', true);
define('COMPRESS_SCRIPTS', true);

/**
 * WordPress Database Table prefix.
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
if (WP_DEVELOPMENT) {
    define('WP_DEBUG_DISPLAY', false);
    define('WP_DEBUG', false);
    define('WP_DEBUG_LOG', true);
    define('SAVEQUERIES', true);
} else {
    define('WP_DEBUG_DISPLAY', false);
    define('WP_DEBUG', false);
    define('WP_DEBUG_LOG', false);
    define('SAVEQUERIES', false);
}
define('FS_METHOD','direct');

/**
 * Internal settings for the API
 **/
define('API_URL','http://' . API_DOMAIN . '/api/v1/');
define('IMG_URL','https://' . DOMAIN_CURRENT_SITE . '/dl/document/');

/* Multisite */
define('WP_ALLOW_MULTISITE', true);
define('MULTISITE', true);
define('SUBDOMAIN_INSTALL', true);
define('PATH_CURRENT_SITE', '/');
define('SITE_ID_CURRENT_SITE', 1);
define('BLOG_ID_CURRENT_SITE', 1);
define('NOBLOGREDIRECT', 'http://' . DOMAIN_CURRENT_SITE . '/active-portals');

define('BIDX_PLUGIN_METADATA_PATH', 'http://bidx-builds.s3-website-eu-west-1.amazonaws.com/acceptance/bidx-plugin/metadata.json');

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

