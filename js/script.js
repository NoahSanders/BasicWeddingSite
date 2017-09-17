$(document).ready(pageSetup);
let RsvpApiUrl = 'http://sanders-aycock-wedding.com:3000';

function pageSetup() {
    

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
}

function rsvpSubmit() {
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
    .done(function() {
        //TODO: Need success logic
    })
    .fail(function() {
        //TODO: Need API fail logic
    });

    let messageRequest = {
        message: $('#notes_input').val(),
        guest_id: $('.list-group-item.active').prop('id')
    };

    $.ajax({
        url: RsvpApiUrl+'/messages',
        type: 'POST',
        data: messageRequest
    })
    .done(function() {
        //TODO: Need success logic
    })
    .fail(function() {
        //TODO: Need API fail logic
    });

    $('#rsvp_modal').modal('toggle');
}

function findGuest() {  
    $('#status_select_section').addClass('hidden');
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
            }
            else {
                choicesHTML = '<li class="list-group-item list-group-item-action disabled">No results found for selected last name.</li>';
            }

            $('#full_name_select').html(choicesHTML);

            $('a.list-group-item').click(function(e) {
                e.preventDefault();
                $(this).addClass('active').siblings().removeClass('active');
                $('#status_select_section').removeClass('hidden');
                
                showHideGuestNumber();

                showHideSubmitButton();
            });

            showHideSubmitButton();
            $('#guest_full_name_input').removeClass('hidden');
        });
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
    if (!$('.list-group-item.active').get(0)) {
        return false;
    }
    if (isAttending() && !$('#guest_count').val()>0) {
        return false;
    }
    return true;
}

function showHideNotes() {
    if (isReadyToSubmit()) {
        $('#notes_input_section').removeClass('hidden');
    }
    else {
        $('#notes_input_section').addClass('hidden');
    }
}