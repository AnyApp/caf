<?php
/**
 * Plugin Name: Commercial Feed
 * Plugin URI: http://codletech.net
 * Description: API to commercial-feed feeds
 * Version: 0.1
 * Author: Tal Levi
 * Author URI: http://codletech.net
 * License: Private
 */

// Register the Custom Music Review Post Type

function register_cpt_feed() {

    $labels = array(
        'name' => _x( 'פידים', 'custom_feed' ),
        'singular_name' => _x( 'פיד', 'custom_feed' ),
        'add_new' => _x( 'הוסף', 'custom_feed' ),
        'add_new_item' => _x( 'הוספת פיד חדש', 'custom_feed' ),
        'edit_item' => _x( 'ערוך פיד', 'custom_feed' ),
        'new_item' => _x( 'פיד חדש', 'custom_feed' ),
        'view_item' => _x( 'צפה בפיד', 'custom_feed' ),
        'search_items' => _x( 'חפש בפידים', 'custom_feed' ),
        'not_found' => _x( 'לא נמצאו פידים', 'custom_feed' ),
        'not_found_in_trash' => _x( 'לא נמצאו פידים בפח', 'custom_feed' ),
        'parent_item_colon' => _x( 'פיד ראשי:', 'custom_feed' ),
        'menu_name' => _x( 'פידים', 'custom_feed' ),
    );

    $args = array(
        'labels' => $labels,
        'public' => true,
        'menu_position' => 1,
        'supports' => array( 'title', 'editor' ),
        'taxonomies' => array( '' ),
        'menu_icon' => plugins_url( 'images/image.png', __FILE__ ),
        'has_archive' => true
    );

    register_post_type( 'custom_feed', $args );
}

add_action( 'init', 'register_cpt_feed' );

add_action( 'admin_init', 'my_admin' );

function my_admin() {
    add_meta_box( 'feeds_meta_box',
        'פרטים נוספים אודות הפיד',
        'display_feeds_meta_box',
        'custom_feed', 'normal', 'high'
    );
}

function display_feeds_meta_box( $feed ) {
    // Retrieve current name of the Director and Movie Rating based on review ID
    $feed_user = esc_html( get_post_meta( $feed->ID, 'feed_user', true ) );
    $feed_date =  get_post_meta( $feed->ID, 'feed_date', true ) ;
    if(empty($feed_date)) {
        $feed_date = date('Y-m-d');
    }
    ?>
    <table>
        <tr>
            <td style="width: 100%">שם המדווח:</td>
            <td><input type="text" size="20" name="feed_user_name" value="<?php echo $feed_user; ?>" /></td>
        </tr>
        <tr>
            <td style="width: 100%">תאריך הפיד</td>
            <td><input type="date" name="feed_date" value="<? echo $feed_date; ?>"></td>
        </tr>
    </table>
<?php
}

add_action( 'save_post', 'add_feed_fields', 10, 2 );

function add_feed_fields( $feed_id, $feed ) {
    // Check post type for feeds
    if ( $feed->post_type == 'custom_feed' ) {
        // Store data in post meta table if present in post data
        if ( isset( $_POST['feed_user_name'] ) && $_POST['feed_user_name'] != '' ) {
            update_post_meta( $feed_id, 'feed_user', $_POST['feed_user_name'] );
        }
        if ( isset( $_POST['feed_date'] ) && $_POST['feed_date'] != '' ) {
            update_post_meta( $feed_id, 'feed_date', $_POST['feed_date'] );
        }
    }
}



