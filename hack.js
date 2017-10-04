<style>
/* don’t display the button by default */
.apple-pay-checkout-button {
  display: none;
}

/* display the button if apple pay is supported */
.apple-pay-supported .apple-pay-checkout-button {
  display: inline-block;
}

/* renders a black background with white logo */
.apple-pay-checkout-button {
  background-size: 100% 60%;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  border-radius: 5px;
  padding: 0px;
  box-sizing: border-box;
  min-width: 175px;
  min-height: 32px;
  max-height: 64px;
  background-image: -webkit-named-image(apple-pay-logo-white);
  background-color: black;
  text-indent: -9000em;
  cursor: pointer;
}

/* for small screens, you should adjust the width of the button to
   span the width of the containing block */
@media screen and (max-width: 480px) {
  .apple-pay-checkout-button {
    width: 100%;
    height: 60px;
  }
}
</style>
​
<script src="//code.jquery.com/jquery-3.2.1.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css"></link>

<script type="text/javascript">

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": false,
      "positionClass": "toast-top-left",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
    var locations = [], submitable = false;
    var $selectLocation, $inputEmail, $selectQty, $btnSubmit;


    $(document).ready(function() {
        $selectLocation = jQuery("#product-fields-2");
        $inputEmail = jQuery('#product-fields-1');
        $selectQty = jQuery("input[name='qty[]']");
        $btnSubmit = jQuery("button[type='submit']");
        if ($inputEmail.length === 0 ) {
          return;
        }

        $selectLocation.parents(".form-field").hide();
        $selectLocation.change(updateAmount);

        $btnSubmit.click(function(evt) {
          if(submitable) {
            return true;
          } else {
            evt.preventDefault();
            if($inputEmail.val() === '') {
              toastr["error"]("Introduce an email");
            }
            else if(locations) {
              toastr["error"]("Choose a location");
            } else {
              toastr["error"]("Introduce an email");
            }

            return false;
          }
        });

        var email = getUrlParameter('email');
        if (email) {
            jQuery('#product-fields-1').val(email);
            fetchLicenceByEmail(email);
        }

        jQuery('#product-fields-1').bind("change keyup blur input", function() {
            console.log('inputEmail event handler')
            fetchLicenceByEmail($inputEmail.val());
        });
    });

    var updateAmount = function updateAmount() {
      var locationId = $selectLocation.val();
      console.log('locationId', locationId);
      var location = $.grep(locations, function(location){ return location.id == locationId; })[0];
      console.log('location selected', location);
      toastr["success"]('For ' + location.name + ' you need ' + location.devices + ' ' + (location.devices > 1 ? 'licences' : 'license') );
      $selectQty.val(location.devices);
      submitable = true;
    }

    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };

    var fetchLicenceByEmail = function fetchLicenceByEmail(email, success, fail) {
        console.log('email.lenght', email.length);

        if(email.length < 4) {
          clean();
          return;
        }
        email = encodeURIComponent(email);

        jQuery.ajax({
            url: 'https://api-qa.avi-on.com/users/' + email + '/licence',
            dataType: 'json',
            beforeSend: function() {
                clean();
                console.log('...searching...', email);
            },
            success: function(response) {
                console.log('response', response);
                $selectLocation.html("");

                locations = response.locations;
                var items;
                jQuery.each(locations, function(index, location) {

                    items += '<option value=' + location.id + '>' + location.name + '</option>';
                });

                $selectLocation.append(items);
                $selectLocation.parents(".form-field").show()
                $selectLocation.prop('disabled', false);

                if (locations.size > 1) {
                  toastr["success"]('Choose a Location');
                } else {
                  updateAmount();
                }
                $selectLocation.find("option:first").attr("selected", "selected");
            }
        }).fail(function(error) {
            toastr["error"]('Email not present in Avi-on');
        });
    };

    var clean = function clean() {
      $selectLocation.prop('disabled', true);
      $selectLocation.html("");
      $selectLocation.parents(".form-field").hide();
      submitable = false;
    };

    var debounce = function debounce(func, wait, immediate) {
      	var timeout;
      	return function() {
      		var context = this, args = arguments;
      		var later = function() {
      			timeout = null;
      			if (!immediate) func.apply(context, args);
      		};
      		var callNow = immediate && !timeout;
      		clearTimeout(timeout);
      		timeout = setTimeout(later, wait || 200);
      		if (callNow) { func.apply(context, args) };
      	};
    };

    function submitable() {

    }
    var dFetchLicenceByEmail = debounce(fetchLicenceByEmail, 50);
</script>​
