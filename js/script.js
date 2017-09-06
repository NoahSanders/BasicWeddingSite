$(document).ready(pageSetup);
var RsvpApiUrl = 'http://localhost:3000/guests';

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
    $('#rsvp_submit').click(rsvpClick);
    $('#name_search_submit').click(findGuest);
}

function rsvpClick() {
    //do stuff here for rsvp

    $('#rsvp_modal').modal('toggle');
}

function findGuest() {  
    var lastName = $('#rsvp_last_name').val();
    if (!lastName) {
        //TODO: Error handling here
        return;
    }

    $.ajax(RsvpApiUrl + '/search/' + lastName, {
        type: 'GET',
        dataType: 'jsonp',
        jsonpCallback: jsonpCallback
    });
}

function jsonpCallback(json) {
    console.log(arguments);
}
