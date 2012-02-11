( function( $, ko ) {

	ko.delayedRevertObservable = function( restValue, revertDelay, timeoutVar ) {
		var observable = ko.observable( restValue );

		var result = ko.dependentObservable({
			read: function() {
				return ko.utils.unwrapObservable( observable );
			},
			write: function( temporaryValue ) {
				observable( temporaryValue );

				if( temporaryValue !== restValue ) {
					window.clearTimeout( timeoutVar );
					timeoutVar = window.setTimeout( function() { observable( restValue ); }, revertDelay );
				}
			}
		});

		return result;
	};

	// Note that these visible/hidden handlers depend on the "hidden" and "visible" classes being handled in CSS:
	// .hidden { display: none; }
	// .visible { display: block; }

	ko.bindingHandlers[ "visible" ] = {
		"update": function( element, valueAccessor ) {
			var value = ko.utils.unwrapObservable( valueAccessor() );
			var isCurrentlyVisible = !( element.style.display == "none" );

			$( element ).removeClass( "visible" ).removeClass( "hidden" );

			if( value !== undefined && value.hasOwnProperty( "length" ) && value.length === 0 ) {
				if( isCurrentlyVisible ) $( element ).addClass( "hidden" );
			}
			else {
				if( value ) {
					if( !isCurrentlyVisible ) $( element ).addClass( "visible" );
				}
				else if( !value ) {
					if( isCurrentlyVisible ) $( element ).addClass( "hidden" );
				}
			}
		}
	};

	ko.bindingHandlers[ "hidden" ] = {
		"update": function( element, valueAccessor ) {
			var value = ko.utils.unwrapObservable( valueAccessor() ),
				isCurrentlyHidden = element.style.display == "none";

			$( element ).removeClass( "visible" ).removeClass( "hidden" );

			if( value !== undefined && value.hasOwnProperty( "length" ) && value.length === 0 ) {
				if( isCurrentlyHidden ) $( element ).addClass( "visible" );
			}
			else {
				if( !!value ) {
					if( !isCurrentlyHidden ) $( element ).addClass( "hidden" );
				}
				else {
					if( isCurrentlyHidden ) $( element ).addClass( "visible" );
				}
			}
		}
	};

})( window.jQuery, window.ko );