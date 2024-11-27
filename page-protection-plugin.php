<?php
/*
Plugin Name: Page Protection Plugin
Description: Protects the page content against screenshots and disables features such as right-clicking and keyboard shortcuts.
Version: 1.0
Author: Adelino Masioli
*/

if (!defined('ABSPATH')) {
    exit; // Prevent direct access to the file.
}

// Function to register the scripts
function ppp_enqueue_scripts() {
    wp_enqueue_script(
        'ppp-protection-script',
        plugins_url('assets/js/page-protection.js', __FILE__),
        [],
        '1.0',
        true
    );

    // Retrieve saved settings from the database
    $options = get_option('ppp_settings', []);
    $default_options = [
        'disableRightClick' => true,
        'disableKeyboardShortcuts' => true,
        'disableInspectElement' => true,
        'disablePrintScreen' => true,
        'disableScreenshot' => true,
        'disableFunctionKeys' => true,
        'disableCtrlF4' => true,
        'mouseLeave' => false,
        'mouseEnterAutoHide' => false,
        'ctrlOverlay' => true,
        'altOverlay' => true,
        'shiftOverlay' => false,
        'clearConsole' => true,
        'clearSensitiveContent' => ['body'],
        'overlayId' => 'custom-overlay-id',
        'overlayMessage' => __('⚠️ This site does not allow this type of command.', 'ppp-textdomain') // Editable message
    ];

    // Merge the default options with the ones from the database
    $merged_options = array_merge($default_options, $options);
    wp_localize_script('ppp-protection-script', 'pppOptions', $merged_options);
}
add_action('wp_enqueue_scripts', 'ppp_enqueue_scripts');

// Adds custom modal to the footer
function ppp_add_custom_overlay() {
    $options = get_option('ppp_settings');
    $message = isset($options['overlayMessage']) ? esc_html($options['overlayMessage']) : __('⚠️ This site does not allow this type of command.', 'ppp-textdomain');
    
    // Recover text background, padding and shadow options
    $textColor = isset($options['overlayTextColor']) ? esc_attr($options['overlayTextColor']) : '#FFFFFF';
    $textBackground = isset($options['overlayBackground']) ? esc_attr($options['overlayBackground']) : 'transparent';
    $textPadding = isset($options['overlayPadding']) ? esc_attr($options['overlayPadding']) : '10px';
    $textShadow = isset($options['overlayBoxShadow']) ? esc_attr($options['overlayBoxShadow']) : 'none';
    
    ?>
    <div id="custom-overlay-id" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8);  text-align: center; z-index: 9999; display: none; align-items: center; justify-content: center; font-size: 18px;">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;height:100vh;">
            <p style="color: <?php echo $textColor; ?>;background: <?php echo $textBackground; ?>; padding: <?php echo $textPadding; ?>px; box-shadow: 2px 2px 2px <?php echo $textShadow; ?>;border-radius:5px;">
                <?php echo $message; ?>
            </p>
        </div>
    </div>
    <?php
}

add_action('wp_footer', 'ppp_add_custom_overlay');

// Initializes the noScreenshot
function ppp_initialize_no_screenshot() {
    ?>
    <script>
        window.onload = function() {
            if (typeof noScreenshot === 'function' && typeof pppOptions === 'object') {
                window.noScreenshotInstance = noScreenshot(pppOptions, 'custom-overlay-id');
            }
        };

        function hideOverlay() {
            if (window.noScreenshotInstance && window.noScreenshotInstance.HideOverlayScreen) {
                window.noScreenshotInstance.HideOverlayScreen('custom-overlay-id');
            }
        }
    </script>
    <?php
}
add_action('wp_footer', 'ppp_initialize_no_screenshot', 100);

// Registers the settings menu in the admin panel
function ppp_add_admin_menu() {
    add_menu_page(
        __('Page Protection Settings', 'ppp-textdomain'), // Page title
        __('Page Protection', 'ppp-textdomain'), // Menu title
        'manage_options', // User capability
        'ppp_page_protection', // Page slug
        'ppp_display_settings_page', // Function to display settings page
        'dashicons-shield', // Icon
        80 // Menu position
    );
}
add_action('admin_menu', 'ppp_add_admin_menu');

// Displays the settings page
function ppp_display_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php _e('Page Protection Settings', 'ppp-textdomain'); ?></h1>
        <form method="post" action="options.php">
            <?php
            // Generate configuration fields
            settings_fields('ppp_settings_group');
            do_settings_sections('ppp_page_protection');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

function ppp_custom_admin_styles() {
    echo '<style>
        .form-table {
            max-width: 550px;
            width: 100%;
        }
        .wp-picker-container, .wp-picker-container .wp-color-result.button {
            width:100%;
        }
    </style>';
}
add_action('admin_head', 'ppp_custom_admin_styles');

// Registers settings in the database
function ppp_register_settings() {
    register_setting('ppp_settings_group', 'ppp_settings');

    // Adds sections and fields to the form
    add_settings_section(
        'ppp_general_settings', // Section ID
        __('General Settings', 'ppp-textdomain'), // Section title
        null, // Description function (not used)
        'ppp_page_protection' // Page slug
    );

    // Fields for plugin options
    $fields = [
        'disableRightClick' => __('Disable right-click', 'ppp-textdomain'),
        'disableKeyboardShortcuts' => __('Disable keyboard shortcuts', 'ppp-textdomain'),
        'disableInspectElement' => __('Disable inspect element', 'ppp-textdomain'),
        'disablePrintScreen' => __('Disable print screen', 'ppp-textdomain'),
        'disableScreenshot' => __('Disable screenshot', 'ppp-textdomain'),
        'disableFunctionKeys' => __('Disable function keys', 'ppp-textdomain'),
        'disableCtrlF4' => __('Disable Ctrl + F4', 'ppp-textdomain'),
        'mouseLeave' => __('Disable mouse leave', 'ppp-textdomain'),
        'mouseEnterAutoHide' => __('Disable mouse enter auto-hide', 'ppp-textdomain'),
        'ctrlOverlay' => __('Enable Ctrl overlay', 'ppp-textdomain'),
        'altOverlay' => __('Enable Alt overlay', 'ppp-textdomain'),
        'shiftOverlay' => __('Enable Shift overlay', 'ppp-textdomain'),
        'clearConsole' => __('Clear console', 'ppp-textdomain'),
    ];

    foreach ($fields as $name => $label) {
        add_settings_field(
            $name,
            $label,
            'ppp_render_checkbox_field',
            'ppp_page_protection',
            'ppp_general_settings',
            ['name' => $name, 'label' => $label] // Correctly passing the name
        );
    }

    // Field to edit the overlay message
    add_settings_field(
        'overlayMessage',
        __('Overlay Message', 'ppp-textdomain'),
        'ppp_render_text_field',
        'ppp_page_protection',
        'ppp_general_settings',
        ['name' => 'overlayMessage'] // Ensuring the correct name is passed
    );


    add_settings_field(
        'overlayTextColor',
        __('Overlay Text Color', 'ppp-textdomain'),
        'ppp_render_color_picker',
        'ppp_page_protection',
        'ppp_general_settings',
        ['name' => 'overlayTextColor']
    );

    add_settings_field(
        'overlayBackground',
        __('Overlay Background Color', 'ppp-textdomain'),
        'ppp_render_color_picker',
        'ppp_page_protection',
        'ppp_general_settings',
        ['name' => 'overlayBackground']
    );

    add_settings_field(
        'overlayBoxShadow', 
        __('Overlay Box Shadow Color', 'ppp-textdomain'),
        'ppp_render_color_picker',
        'ppp_page_protection',
        'ppp_general_settings',
        ['name' => 'overlayBoxShadow'] 
    );
    add_settings_field(
        'overlayPadding',
        __('Overlay Text Padding (in px)', 'ppp-textdomain'),
        'ppp_render_number_field',
        'ppp_page_protection',
        'ppp_general_settings',
        ['name' => 'overlayPadding']
    );
}
add_action('admin_init', 'ppp_register_settings');

function ppp_render_number_field($args) {
    $options = get_option('ppp_settings');
    $value = isset($options[$args['name']]) ? esc_attr($options[$args['name']]) : '10'; // Default (10px)
    ?>
    <input type="number" name="ppp_settings[<?php echo esc_attr($args['name']); ?>]" value="<?php echo $value; ?>" class="regular-text" />
    <p class="description"><?php _e('Enter the padding value in pixels (e.g., 10)', 'ppp-textdomain'); ?></p>
    <?php
}

function ppp_enqueue_admin_scripts($hook) {
    if ('toplevel_page_ppp_page_protection' !== $hook) {
        return;
    }

    wp_enqueue_style('wp-color-picker');
    wp_enqueue_script('ppp-admin-script', plugin_dir_url(__FILE__) . 'assets/js/admin.js', array('wp-color-picker'), false, true);
}
add_action('admin_enqueue_scripts', 'ppp_enqueue_admin_scripts');



function ppp_render_color_picker($args) {
    $options = get_option('ppp_settings');
    $value = isset($options[$args['name']]) ? esc_attr($options[$args['name']]) : '#ffffff'; // Default #ffffff
    ?>
    <input type="text" name="ppp_settings[<?php echo esc_attr($args['name']); ?>]" value="<?php echo $value; ?>" class="ppp-color-picker" />
    <?php
}

// Renders checkbox fields
function ppp_render_checkbox_field($args) {
    $options = get_option('ppp_settings');
    ?>
    <input type="checkbox" name="ppp_settings[<?php echo esc_attr($args['name']); ?>]" value="1" <?php checked(1, isset($options[$args['name']]) ? $options[$args['name']] : 0); ?> />
    <label><?php echo esc_html($args['label']); ?></label>
    <?php
}

// Renders the text field for the message
function ppp_render_text_field($args) {
    $options = get_option('ppp_settings');
    $value = isset($options[$args['name']]) ? esc_html($options[$args['name']]) : '';
    ?>
    <input type="text" name="ppp_settings[<?php echo esc_attr($args['name']); ?>]" value="<?php echo $value; ?>" class="regular-text" />
    <p class="description"><?php _e('Enter the message that will be displayed in the overlay.', 'ppp-textdomain'); ?></p>
    <?php
}
?>
