<?php

// exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;


// check if class already exists
if( !class_exists('acf_field_images_list') ) :


class acf_field_images_list extends acf_field {

	// vars
	var $settings, // will hold info such as dir / path
		$defaults; // will hold default field options


	/*
	*  __construct
	*
	*  Set name / label needed for actions / filters
	*
	*  @since	3.6
	*  @date	23/01/13
	*/

	function __construct( $settings )
	{
		// vars
		$this->name = 'images_list';
		$this->label = __('Images List');
		$this->category = __("Content",'acf'); // Basic, Content, Choice, etc
		$this->defaults = array(
			"images" 				=> array(),
			"primary_image" => 0
		);


		// do not delete!
    	parent::__construct();


    	// settings
		$this->settings = $settings;

	}

	/*
	* get_meta()
	*
	* Wrapper function to get Wordpress post meta
	*
	*/
	function get_meta( $value )
	{
		global $post;

		$field = get_post_meta( $post->ID, $value, true );
		if ( ! empty( $field ) ) {
			return is_array( $field ) ? stripslashes_deep( $field ) : stripslashes( wp_kses_decode_entities( $field ) );
		} else {
			return false;
		}
	}


	/*
	*  create_options()
	*
	*  Create extra options for your field. This is rendered when editing a field.
	*  The value of $field['name'] can be used (like below) to save extra data to the $field
	*
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field	- an array holding all the field's data
	*/

	function create_options( $field )
	{
		// defaults?
		/*
		$field = array_merge($this->defaults, $field);
		*/

		// key is needed in the field names to correctly save the data
		$key = $field['name'];


		// Create Field Options HTML
		?>

		<?php

	}


	/*
	*  create_field()
	*
	*  Create the HTML interface for your field
	*
	*  @param	$field - an array holding all the field's data
	*
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*/

	function create_field( $field )
	{
		// defaults?

		$field = array_merge($this->defaults, $field);

		$image_value = isset($field['value']['images']) ? $field['value']['images'] : $field['images'];
		$image_name = $field['name'].'[images][]';

		$image_primary_value = isset($field['value']['primary_image']) ? $field['value']['primary_image'] : $field['primary_image'];
		$image_primary_name = $field['name'].'[primary_image]';

		// perhaps use $field['preview_size'] to alter the markup?

		// create Field HTML
		?>
		<div class="gk_button-media-library-wrapper">
			<button type="button" name="button" id="gk_open-media-library" data-field-name="<?php echo $image_name; ?>">Add Images</button>
			<?php
				if( count( $image_value ) > 0 ) {
			?>
			<button type="button" name="button" id="gk_clear-all">Clear All</button>
			<?php
				}
			?>
		</div>
		<div id="gk_images-wrapper">
			<?php
				if( count( $image_value > 0 ) && $image_value != null  ) {
					echo '<ul>';
					foreach ($image_value as $image_id) {
						$primary_text = '';
						$disable_class = '';
						$image_url = wp_get_attachment_image_src( $image_id, 'thumbnail' )[0];

						if( !$image_url ) {
							$image_url = plugins_url( 'assets/images/default-placeholder.jpg', dirname(__FILE__) );
						}

						if( $image_id == $image_primary_value ) {
							$primary_text = '<span class="gk_primary-image-text">Primary Image <i class="dashicons dashicons-yes"></i></span>';
							$disable_class = 'disabled';
						}
						?>

						<li class="gk_image-block <?php echo $disable_class; ?>">
							<?php echo $primary_text; ?>
			        <a href="#" class="gk_del-image"><span class="dashicons dashicons-no"></span></a>
			        <img src="<?= $image_url; ?>" data-id="<?= $image_id; ?>"/>
			        <input type="hidden" name="<?php echo $image_name; ?>" value="<?= $image_id; ?>">
							<a href="#" class="gk_set-primary-image">Set as primary</a>
			      </li>

						<?php
						}
					echo '</ul>';
				}
			?>
		</div>
		<input type="hidden" id="gk_primary-image-field" name="<?php echo $image_primary_name; ?>" value="<?php echo $image_primary_value; ?>" />
		<?php
	}


	/*
	*  input_admin_enqueue_scripts()
	*
	*  This action is called in the admin_enqueue_scripts action on the edit screen where your field is created.
	*  Use this action to add CSS + JavaScript to assist your create_field() action.
	*
	*  $info	http://codex.wordpress.org/Plugin_API/Action_Reference/admin_enqueue_scripts
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*/

	function input_admin_enqueue_scripts()
	{
		// Note: This function can be removed if not used


		// vars
		$url = $this->settings['url'];
		$version = $this->settings['version'];


		// register & include JS
		wp_register_script( 'acf-input-images_list', "{$url}assets/js/input.js", array('acf-input'), $version );
		wp_enqueue_script('acf-input-images_list');


		// register & include CSS
		wp_register_style( 'acf-input-images_list', "{$url}assets/css/input.css", array('acf-input'), $version );
		wp_enqueue_style('acf-input-images_list');

	}


	/*
	*  input_admin_head()
	*
	*  This action is called in the admin_head action on the edit screen where your field is created.
	*  Use this action to add CSS and JavaScript to assist your create_field() action.
	*
	*  @info	http://codex.wordpress.org/Plugin_API/Action_Reference/admin_head
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*/

	function input_admin_head()
	{
		// Note: This function can be removed if not used
	}


	/*
	*  field_group_admin_enqueue_scripts()
	*
	*  This action is called in the admin_enqueue_scripts action on the edit screen where your field is edited.
	*  Use this action to add CSS + JavaScript to assist your create_field_options() action.
	*
	*  $info	http://codex.wordpress.org/Plugin_API/Action_Reference/admin_enqueue_scripts
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*/

	function field_group_admin_enqueue_scripts()
	{
		// Note: This function can be removed if not used
	}


	/*
	*  field_group_admin_head()
	*
	*  This action is called in the admin_head action on the edit screen where your field is edited.
	*  Use this action to add CSS and JavaScript to assist your create_field_options() action.
	*
	*  @info	http://codex.wordpress.org/Plugin_API/Action_Reference/admin_head
	*  @type	action
	*  @since	3.6
	*  @date	23/01/13
	*/

	function field_group_admin_head()
	{
		// Note: This function can be removed if not used
	}


	/*
	*  load_value()
	*
		*  This filter is applied to the $value after it is loaded from the db
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$value - the value found in the database
	*  @param	$post_id - the $post_id from which the value was loaded
	*  @param	$field - the field array holding all the field options
	*
	*  @return	$value - the value to be saved in the database
	*/

	function load_value( $value, $post_id, $field )
	{
		return $value;
	}


	/*
	*  update_value()
	*
	*  This filter is applied to the $value before it is updated in the db
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$value - the value which will be saved in the database
	*  @param	$post_id - the $post_id of which the value will be saved
	*  @param	$field - the field array holding all the field options
	*
	*  @return	$value - the modified value
	*/

	function update_value( $value, $post_id, $field )
	{
		return $value;
	}


	/*
	*  format_value()
	*
	*  This filter is applied to the $value after it is loaded from the db and before it is passed to the create_field action
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$value	- the value which was loaded from the database
	*  @param	$post_id - the $post_id from which the value was loaded
	*  @param	$field	- the field array holding all the field options
	*
	*  @return	$value	- the modified value
	*/

	function format_value( $value, $post_id, $field )
	{
		// defaults?
		/*
		$field = array_merge($this->defaults, $field);
		*/

		// perhaps use $field['preview_size'] to alter the $value?


		// Note: This function can be removed if not used
		return $value;
	}


	/*
	*  format_value_for_api()
	*
	*  This filter is applied to the $value after it is loaded from the db and before it is passed back to the API functions such as the_field
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$value	- the value which was loaded from the database
	*  @param	$post_id - the $post_id from which the value was loaded
	*  @param	$field	- the field array holding all the field options
	*
	*  @return	$value	- the modified value
	*/

	function format_value_for_api( $value, $post_id, $field )
	{
		// defaults?
		/*
		$field = array_merge($this->defaults, $field);
		*/

		// perhaps use $field['preview_size'] to alter the $value?


		// Note: This function can be removed if not used
		return $value;
	}


	/*
	*  load_field()
	*
	*  This filter is applied to the $field after it is loaded from the database
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field - the field array holding all the field options
	*
	*  @return	$field - the field array holding all the field options
	*/

	function load_field( $field )
	{

		// Note: This function can be removed if not used
		return $field;
	}


	/*
	*  update_field()
	*
	*  This filter is applied to the $field before it is saved to the database
	*
	*  @type	filter
	*  @since	3.6
	*  @date	23/01/13
	*
	*  @param	$field - the field array holding all the field options
	*  @param	$post_id - the field group ID (post_type = acf)
	*
	*  @return	$field - the modified field
	*/

	function update_field( $field, $post_id )
	{
		// Note: This function can be removed if not used
		return $field;
	}

}


// initialize
new acf_field_images_list( $this->settings );


// class_exists check
endif;

?>
