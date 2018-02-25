(function($){

  $(document).ready(function() {
		imagesList.init();
  });

  var selector = {
    media_button: '.gk_open-media-library',
    delete_image_button: '.gk_del-image',
    set_primary_button: '.gk_set-primary-image',
    image_wrapper: '.gk_images-wrapper',
    single_image_wrapper: '.gk_image-block',
    primary_image_field: '.gk_primary-image-field',
		primary_image_text: '.gk_primary-image-text',
    clear_all_button: '.gk_clear-all',
    field_wrapper: '.field',
		image_placeholder: 'gk_image-sortable-placeholder'
  }

  var imagesList = {
    _frame: null,

    //Create media dialog frame
    create_media_frame: function( $el ) {
  		imagesList._frame = wp.media.frames.file_frame = wp.media({
  				title: 'Select Images',
  				library: {
  					type: 'image'
  				},
  				button: {
  						text: 'Select Images'
  				},
  				multiple: true
  		});

			imagesList.media_events( $el );
    },

    //Reset frame
    reset_frame: function() {
      if( imagesList._frame ) {
  			imagesList._frame.detach();
        imagesList._frame = null;
  		}
    },

		//Get images selection and insert to DOM
		get_selection: function( $el ) {
			var attachment = imagesList._frame.state().get('selection').toJSON();
			$el.find( selector.image_wrapper ).html('<ul></ul>');

			if( attachment.length > 0 ) {
				$( selector.clear_all_button ).fadeIn().css("display","inline-block");
			}

			$.each(attachment, function(index, image) {
				var thumb = image.sizes.thumbnail.url;
				var id = image.id;
        var primary_button = '<a href="javascript:void(0)" class="gk_set-primary-image">Set as primary</a></li>';

        if( !$el.find( selector.image_wrapper ).data('enable-primary') ) {
          primary_button = '';
        }

				var template = '<li class="'+ selector.single_image_wrapper.replace('.', '') +'">'+
												'<a href="javascript:void(0)" class="'+ selector.delete_image_button.replace('.', '') +'"><span class="dashicons dashicons-no"></span></a>'+
												'<img src="' + thumb + '" data-id="' + id + '" />'+
												'<input type="hidden" name="'+ $el.find(selector.media_button).data('field-name') +'" value="' + id + '">'+ primary_button;
				$el.find(selector.image_wrapper).find('ul').append(template);

				imagesList.init_sortable();

				if( index == 0 ) {
					imagesList.default_primary_image( $el, id );
				}
			});
		},

		//Preselect images
		preselect_images: function( $el ) {
			var selection = imagesList._frame.state().get('selection');
			$.each( $el.find( selector.single_image_wrapper ), function(index, item) {
					var id = $(this).find('img').data('id');
					var attachment = wp.media.attachment(id);
					attachment.fetch();
					selection.add( attachment ? [ attachment ] : [] );
			});
		},

		//Delete single image
		delete_single_image: function( $el ) {
			var image_id =  $el.closest( selector.single_image_wrapper ).find('img').data('id');
      var _current_wrapper = $el.closest(selector.field_wrapper);

			$el.closest( selector.single_image_wrapper ).fadeOut('fast', function() {
				if( image_id == $el.closest(selector.field_wrapper).find( selector.primary_image_field ).val() ) {
					$el.closest(selector.field_wrapper).find( selector.primary_image_field ).val('0');
				}
        $(this).remove();

				if( !_current_wrapper.find( selector.single_image_wrapper ).eq(0).hasClass('disabled') &&  _current_wrapper.find('.disabled').length == 0 ) {
          image_id = _current_wrapper.find(selector.single_image_wrapper).eq(0).find('img').data('id');
          imagesList.default_primary_image( _current_wrapper, image_id);
				}

				if( _current_wrapper.find( selector.single_image_wrapper ).length == 0 ) {
					_current_wrapper.find( selector.primary_image_field ).val(0);
				}

      });
		},

		//Clear all images
		clear_all_images: function( $el ) {
			var warning = confirm( "This action cannot be undone. Do you want to continue?" );

			if( warning ) {
				$el.closest( selector.field_wrapper ).find( selector.image_wrapper ).html('');
				$el.closest( selector.field_wrapper ).find( selector.primary_image_field ).val('0');
				$el.hide();
			}
		},

		//Enable drag and drop
		init_sortable: function() {
			$(selector.image_wrapper).find('ul').sortable({
				placeholder: selector.image_placeholder
			});

			$(selector.image_wrapper).disableSelection();
		},

		//Default primary image
		default_primary_image: function( $el, image_id ) {
      if( image_id != undefined ) {
        var primary_text = '<span class="gk_primary-image-text">Primary Image <i class="dashicons dashicons-yes"></i></span>';

        if( $el.find( selector.image_wrapper ).data('enable-primary') ) {
          $el.find( selector.primary_image_field ).val( image_id );
          $el.find( selector.single_image_wrapper ).eq(0).addClass('disabled');
          $( primary_text ).prependTo( $el.find(selector.single_image_wrapper).eq(0) ).slideDown();
        }
      }
		},

		//Set primary image
		set_primary_image: function( $el ) {
			if( !$el.closest( selector.single_image_wrapper ).hasClass('disabled') ) {
				var image_id = $el.closest( selector.single_image_wrapper ).find('img').data('id');
				var primary_text = '<span class="gk_primary-image-text">Primary Image <i class="dashicons dashicons-yes"></i></span>';

				$el.closest( selector.field_wrapper ).find( selector.single_image_wrapper ).find( selector.primary_image_text ).slideUp(function() {
					$(this).remove();
				})

				$el.closest( selector.field_wrapper ).find( selector.single_image_wrapper ).removeClass('disabled');
				$el.closest( selector.single_image_wrapper ).addClass('disabled');

				$( primary_text ).prependTo( $el.closest(selector.single_image_wrapper) ).slideDown();
				$el.closest( selector.field_wrapper ).find( selector.primary_image_field ).val( image_id );
			}
		},

    //Wp.media events
    media_events: function( $el ) {
      imagesList._frame.on('open', function() {
				imagesList.preselect_images( $el );
      });

      imagesList._frame.on('select', function() {
				imagesList.get_selection( $el );
      });
    },

    //Button event
    button_events: function() {
			//Open media library
			$(document).on('click', selector.media_button, function(e) {
        e.preventDefault();
				imagesList.reset_frame();
				imagesList.create_media_frame( $(this).closest( selector.field_wrapper ) );
				imagesList._frame.open();
			});

			//Set primary image button
			$(document).on('click', selector.set_primary_button, function(e) {
        e.preventDefault();
				imagesList.set_primary_image( $(this) );
			});

			//Delete single image button
			$(document).on('click', selector.delete_image_button, function(e) {
        e.preventDefault();
				imagesList.delete_single_image( $(this) );
			});

			//Clear all images button
			$(document).on('click', selector.clear_all_button, function(e) {
        e.preventDefault();
				imagesList.clear_all_images( $(this) );
			});
    },

		init: function() {
			this.button_events();
			this.init_sortable();
		}

  }

	function initialize_field( $el ) {

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
