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
        $selectLocation.hide();
        $selectLocation.change(updateAmount);

        $btnSubmit.click(function(evt) {
          if(submitable) {
            return true;
          } else {
            evt.preventDefault();
            if(locations) {
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
        jQuery('#product-fields-1').keyup(function() {
            var email = $inputEmail.val();
            fetchLicenceByEmail(email);

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
        email = encodeURIComponent(email);

        jQuery.ajax({
            url: 'https://api-qa.avi-on.com/users/' + email + '/licence',
            dataType: 'json',
            beforeSend: function() {
                $selectLocation.hide();
                $selectLocation.html("");
                submitable = false;
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
                $selectLocation.show();
                if (locations.size > 1) {
                  toastr["success"]('Choose a Location');
                } else {
                  updateAmount();
                }
            }
        }).fail(function(error) {
            toastr["error"]('Email not present in Avi-on');
        });
    };
</script>​
