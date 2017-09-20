$(document).ready(pageSetup);
const RsvpApiUrl = 'http://' + window.location.hostname + ':3000';

function pageSetup() {
    $('.page-alert').hide();

    //Set up add to calendar
    if (window.addtocalendar) if(typeof window.addtocalendar.start == "function") return;
    if (window.ifaddtocalendar == undefined) { 
        window.ifaddtocalendar = 1;
        var d = document, s = d.createElement('script'), g = 'getElementsByTagName';
        s.type = 'text/javascript';s.charset = 'UTF-8';s.async = true;
        s.src = ('https:' == window.location.protocol ? 'https' : 'http')+'://addtocalendar.com/atc/1.5/atc.min.js';
        var h = d[g]('body')[0];h.appendChild(s);
    }

    //set up handlers for RSVP buttons
    $('#rsvp_submit').click(rsvpSubmit);
    $('#name_search_submit').click(findGuest);

    $("#status_select").bootstrapToggle({
        on: "I will attend",
        off: "I can't attend",
        width:"100%",
        offstyle:"danger"
    });

    $('#status_select').change(function() {
        showHideSubmitButton();
        showHideGuestNumber();
    });

    $("#guest_count").change(function() {
        showHideSubmitButton();

        var currentVal = $('#guest_count').val();
        if (currentVal == 1){
            $('#minusOne').prop('disabled', true);
        }
        else {
            $('#minusOne').prop('disabled', false);
        }
    });

    $("#plusOne").click(function() {
        var currentVal = parseInt($('#guest_count').val());
        if (!currentVal) {
            $('#guest_count').val(1);
        }
        else if (currentVal < 10){
            $('#guest_count').val(currentVal+1);
        }

        showHideSubmitButton();
    });

    $("#minusOne").click(function() {
        var currentVal = parseInt($('#guest_count').val());
        if (currentVal<=1) {
            $('#guest_count').val(1);
        }
        else {
            $('#guest_count').val(currentVal-1);
        }

        showHideSubmitButton();
    });

    $("nav").find("li").on("click", "a", function () {
        $('.navbar-collapse.in').collapse('hide');
    });
    $(".collapse").find("button").on("click", function () {
        $('.navbar-collapse.in').collapse('hide');
    });

    $('.evaluate_submit').on("change keyup paste", function(event) {
        showHideSubmitButton();
    });

    $('#rsvp_last_name').on("change keyup paste", function(event) {
        if ($('#rsvp_last_name').val()) {
            $('#name_search_submit').prop('disabled', false);
        }
        else {
            $('#name_search_submit').prop('disabled', true);
        }
    });

    $('.page-alert .close').click(function(e) {
        e.preventDefault();
        $(this).closest('.page-alert').slideUp();
    });
}

function rsvpSubmit() {
    if ($('#guest_not_found_container').hasClass('hidden')) {
        const attendingString = isAttending() ? "Attending" : "Nope";

        let guestRequest = {
            "status": attendingString
        };

        if (isAttending) {
            guestRequest.guest_count = $('#guest_count').val();
        }

        $.ajax({
            url: RsvpApiUrl+'/guests/'+$('.list-group-item.active').prop('id'),
            type: 'PUT',
            data: guestRequest
        })
        .done(function(data) {
            showConfirmation();
        })
        .fail(function() {
            console.log('rsvp guest call failed');
            //TODO: Need API fail logic
        });
    }

    let notes_value = getNotes();

    if (notes_value) {
        let messageRequest = {
            message: notes_value,
            guest_id: $('.list-group-item.active').prop('id'),
            contact_email: $('#contact_email').val(),
            custom_name: $('#custom_name').val()
        };
    
        $.ajax({
            url: RsvpApiUrl+'/messages',
            type: 'POST',
            data: messageRequest
        })
        .done(function(data) {
            showConfirmation();
        })
        .fail(function() {
            //TODO: Need API fail logic
            console.log('rsvp message call failed');
        });
    }

    $('#rsvpModal').modal('toggle');
    $('#main-navigation button').prop('disabled',true);
}

function showConfirmation() {
    console.log('things are happening');
    var alert;
    if (isAttending()) {
        alert = $('#rsvp-confirm-yes');
    }
    else {
        alert = $('#rsvp-confirm-no');
    }
    alert.appendTo('.page-alerts');
    alert.slideDown();
}

function findGuest() {  
    clearFields();
    hideGuestNotFoundSection();
    $('#status_select_section').addClass('hidden');
    $('#guest_full_name_input').addClass('hidden');
    $('#guest_number_input').addClass('hidden');
    $('#guest_count').val(1); //set guest count to 1 to prevent undefined count
    
    var lastName = $('#rsvp_last_name').val();

    $.get(RsvpApiUrl + '/guests?lastName=' + lastName)
        .done(function(data) {
            var choicesHTML = '';
            if (data.guests.length) {
                for (var i=0; i<data.guests.length; i++) {
                    choicesHTML += '<a href="#" class="list-group-item list-group-item-action" id="' + data.guests[i].id +'">' + data.guests[i].name + '</li>';
                }
                $('#full_name_select').html(choicesHTML);
                $('#guest_full_name_input').removeClass('hidden');
            }
            else {
                showGuestNotFoundAlert();
            }

            $('a.list-group-item').click(function(e) {
                e.preventDefault();
                $(this).addClass('active').siblings().removeClass('active');
                $('#status_select_section').removeClass('hidden');
                
                showHideGuestNumber();
                showHideSubmitButton();
            });

            showHideNotes();
            showHideSubmitButton();
        });
}

function showGuestNotFoundAlert() {
    $('#guest_not_found_container').removeClass('hidden');
}

function hideGuestNotFoundSection() {
    $('#guest_not_found_container').addClass('hidden');
}

function showHideGuestNumber() {
    if (isAttending()) {
        $('#guest_number_input').removeClass('hidden');
    }
    else {
        $('#guest_number_input').addClass('hidden');
    }
}

function isAttending() {
    return $('#status_select').prop('checked');
}

function showHideSubmitButton() {
    if (isReadyToSubmit()) {
        $("#rsvp_submit").prop('disabled',false);
    }
    else {
        $("#rsvp_submit").prop('disabled',true);
    }
    showHideNotes();
}

function isReadyToSubmit() {
    if ($('#guest_not_found_container').hasClass('hidden')) {
        if (!$('.list-group-item.active').get(0)) {
            return false;
        }
        if (isAttending() && !$('#guest_count').val()>0) {
            return false;
        }
    }
    else if (!getNotes() || !$('#custom_name').val() || !$('#contact_email').val()) {
        return false;
    }
    
    return true;
}

function showHideNotes() {
    if (isReadyToSubmit()) {
        $('#notes_input_section').removeClass('hidden');
    }
    else if (!$('#guest_not_found_alert').hasClass('hidden')) {
        $('#notes_input_section').removeClass('hidden');
    }
    else {
        $('#notes_input_section').addClass('hidden');
    }
}

function getNotes() {
    return $('#notes_input').val();
}

function clearFields() {
    $('#full_name_select').html('');
    $('#custom_name').val('');
    $('#contact_email').val('');
}