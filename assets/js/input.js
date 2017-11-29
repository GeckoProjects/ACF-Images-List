(function($){


	function initialize_field( $el ) {

		//$el.doStuff();
		$('#gk_open-media-library').imagesChooser();
	}

	/*
	* Images function
	*/

	$.fn.imagesChooser = function( options ) {
		var el = $(this);
		var custom_uploader;

		var settings = $.extend({
			media_button: '#gk_open-media-library',
			delete_image_button: '.gk_del-image',
			set_primary_button: '.gk_set-primary-image',
			image_wrapper: '#gk_images-wrapper',
			single_image_wrapper: '.gk_image-block',
			primary_image_field: '#gk_primary-image-field'
		}, options );

		init_sortable();

		//Open media library, select images, populate images to div, prelect images
		$( settings.media_button ).click(function(e) {
				e.preventDefault();

				//If the uploader object has already been created, reopen the dialog
				if (custom_uploader) {
						custom_uploader.open();
						return;
				}

				//Extend the wp.media object
				custom_uploader = wp.media.frames.file_frame = wp.media({
						title: 'Select Images',
						library: {
							type: 'image'
						},
						button: {
								text: 'Select Images'
						},
						multiple: true
				});

				//When a file is selected, grab the URL and set it as the text field's value
				custom_uploader.on('select', function() {
						attachment = custom_uploader.state().get('selection').toJSON();
						$( settings.image_wrapper ).html('<ul></ul>');
						$.each(attachment, function(index, image) {
							var thumb = image.sizes.thumbnail.url;
							var id = image.id;

							var template = '<li class="'+ settings.single_image_wrapper.replace('.', '') +'">'+
															'<a href="#" class="'+ settings.delete_image_button.replace('.', '') +'"><span class="dashicons dashicons-no"></span></a>'+
															'<img src="' + thumb + '" data-id="' + id + '" />'+
															'<input type="hidden" name="'+ $( settings.media_button ).data('field-name') +'" value="' + id + '">'+
															'<a href="#" class="gk_set-primary-image">Set as primary</a></li>';
							$(settings.image_wrapper).find('ul').append(template);

							init_sortable();

							if( index == 0 ) {
								default_primary(id);
							}
						});
				});


				//Preselect media when popup opened
				custom_uploader.on('open', function() {
					var selection = custom_uploader.state().get('selection');
					$.each( $( settings.single_image_wrapper ), function(index, item) {
							var id = $(this).find('img').data('id');
							var attachment = wp.media.attachment(id);
							attachment.fetch();
							selection.add( attachment ? [ attachment ] : [] );
					});
				});

				//Open the uploader dialog
				custom_uploader.open();
		});

		//Delete Image
		$( settings.image_wrapper ).on('click', settings.delete_image_button, function(e) {
			e.preventDefault();
			var image_id =  $(this).closest( settings.single_image_wrapper ).find('img').data('id');
			$(this).closest( settings.single_image_wrapper ).fadeOut('fast', function() {
				if( image_id == $( settings.primary_image_field ).val() ) {
					$( settings.primary_image_field ).val('0');
				}
        $(this).closest( settings.single_image_wrapper ).remove();

				if( !$( settings.single_image_wrapper ).eq(0).hasClass('disabled') &&  $( settings.image_wrapper ).find('.disabled').length == 0 ) {
					default_primary(image_id);
				}

				if( $( settings.image_wrapper ).find( settings.single_image_wrapper ).length == 0 ) {
					$( settings.primary_image_field ).val(0);
				}

      });
		})

		//Set default primary image
		function default_primary( image_id ) {
			var primary_text = '<span class="gk_primary-image-text">Primary Image <i class="dashicons dashicons-yes"></i></span>';
			$( settings.primary_image_field ).val( image_id );
			$( settings.single_image_wrapper ).eq(0).addClass('disabled');
			$( primary_text ).prependTo( $(settings.single_image_wrapper).eq(0) ).slideDown();
		}

		//Drag and drop images
		function init_sortable() {
			$(settings.image_wrapper).find('ul').sortable({
				placeholder: "gk_image-sortable-placeholder"
			});

			$(settings.image_wrapper).disableSelection();
		}

		//Set primary image
		$( settings.image_wrapper ).on('click', settings.set_primary_button, function(e) {
			e.preventDefault();
			if( !$(this).closest( settings.single_image_wrapper ).hasClass('disabled') ) {
				var image_id = $(this).closest( settings.single_image_wrapper ).find('img').data('id');
				var primary_button = $(this);
				var primary_text = '<span class="gk_primary-image-text">Primary Image <i class="dashicons dashicons-yes"></i></span>';

				$( settings.single_image_wrapper ).find( '.gk_primary-image-text' ).slideUp(function() {
					$(this).remove();
				})

				$( settings.single_image_wrapper ).removeClass('disabled');
				primary_button.closest( settings.single_image_wrapper ).addClass('disabled');

				$( primary_text ).prependTo( $(primary_button).closest(settings.single_image_wrapper) ).slideDown();
				$( settings.primary_image_field ).val( image_id );
			}
		})
	}


	if( typeof acf.add_action !== 'undefined' ) {

		/*
		*  ready append (ACF5)
		*
		*  These are 2 events which are fired during the page load
		*  ready = on page load similar to $(document).ready()
		*  append = on new DOM elements appended via repeater field
		*
		*  @type	event
		*  @date	20/07/13
		*
		*  @param	$el (jQuery selection) the jQuery element which contains the ACF fields
		*  @return	n/a
		*/

		acf.add_action('ready append', function( $el ){

			// search $el for fields of type 'images_list'
			acf.get_fields({ type : 'images_list'}, $el).each(function(){

				initialize_field( $(this) );

			});

		});


	} else {


		/*
		*  acf/setup_fields (ACF4)
		*
		*  This event is triggered when ACF adds any new elements to the DOM.
		*
		*  @type	function
		*  @since	1.0.0
		*  @date	01/01/12
		*
		*  @param	event		e: an event object. This can be ignored
		*  @param	Element		postbox: An element which contains the new HTML
		*
		*  @return	n/a
		*/

		$(document).on('acf/setup_fields', function(e, postbox){

			$(postbox).find('.field[data-field_type="images_list"]').each(function(){

				initialize_field( $(this) );

			});

		});


	}


})(jQuery);
