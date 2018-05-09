var googleMap;    // used by google maps call back to instaniate a google map object
class Meetup {
    constructor(name) {
        this.name = name;
        this.markers = [];
        this.failedResponse;
    }

    init() {
        this._bindEvents();
    }

    /*
        _bindEvents - binds DOM events to the method used to process the event
            returns false when all events are bound.
    */
    _bindEvents() {
        $("#btnInput").on("click", $.proxy(this.btnGetMeetupData, this));
    }

    /*
        btnGetMeetupData - when the submit button is clicked this method processes the request.
            no error checking is done on the inputs

    */
    btnGetMeetupData() {
        let _this = this;
        let country = $("#country").val();
        let state = $("#state").val();
        let rowCount = $("#rowCount").val();
        $.ajax({
            dataType: "jsonp",
            type: "GET",
            url: "https://api.meetup.com/2/cities",
            data: {
                key: "72537b757e3776256c4d57246262",
                country: country,
                state: state,
                page: rowCount
            }
        }).done(function (response) {
            _this.processData(response);        // process the data received from meetup
        }).fail(function (response) {
            _this.failedResponse= response;     // save the failed response to inspect in the console
        });
    }

    /*
        processData - processes the data received from the meetup ajax call in btnGetMeetupData.  
            response - is the response from the meetup ajax call, which is of the form {results[], meta[]}
    */
    processData(response) {
        let meetings = response.results;
        $("#country").val("");          // clear the input elements 
        $("#state").val("");
        $("#rowCount").val("");
        $("#rightColumn").empty();      // empty the rightColumn div of any html
        this.clearMarkers();            // remove any markers from older runs
        this.mapData(meetings);          // map the meetup data
        this.saveMeetingsToLocalStorage(meetings);   // save the results arry to local storage
    }

    /*
        saveMeetingsToLocalStorage - saves meetings to local localStorage
            returns:
                true -  if meetings was saved in local storage
                false - if meetings was not saved in local storage
    */
    saveMeetingsToLocalStorage(meetings) {
        try {
            localStorage.setItem(this.name, JSON.stringify(meetings));
            return true;
        } catch (exception) {
            return false;
        }
    }

    /*
        getMeetingsFromLocalStorage - retrieves meetings in local storage
            returns:
                meetings[] -    if meetings was successfully retrived from local storage
                null -          if meetings was not successfully retrived from local storage
    */
    getMeetingsFromLocalStorage() {

        try {
            return JSON.parse(localStorage.getItem(this.name));
        } catch (exception) {
            return null; // local storage is full or inaccessable or error parsing json object
        }
    }

    /*
        clearMarkers - clears the markers from the map, if any.  The markers are stored in an array called markers.
    */
    clearMarkers() {
        this.markers.forEach( function (marker) {
            marker.setMap(null);
        });
    }

    /*
        mapData - maps the meetup data
            meetings is the data returned from the meetup ajax call
    */
    mapData(meetings) {

        let htmlText = "";
        let latlng = null;
        let marker = null;
        let bounds = new google.maps.LatLngBounds();
        meetings.forEach( meeting => {
            latlng = new google.maps.LatLng(meeting.lat, meeting.lon);
            marker = new google.maps.Marker({
                position: latlng,
                label: (meeting.ranking + 1).toString(),
                title: meeting.city,
                map: googleMap
            });
            bounds.extend(latlng);
            this.markers.push(marker);      // Save the maker so they can be deleted
            htmlText += "<p class=\"meetupData\"> Ranking: " + (meeting.ranking + 1).toString() + "<br>";
            htmlText += "Location: " + meeting.city + ",&nbsp;" + meeting.state + "&nbsp;&nbsp;" + meeting.zip  + "&nbsp;&nbsp;";
            htmlText +=  meeting.localized_country_name + "<br>";
            htmlText += "Member Count: " + meeting.member_count + "<br></p>";
        });
        googleMap.fitBounds(bounds);
        $("#rightColumn").append(htmlText);
        return false;
    }
}

/*
    initMap - creates a google maps object and initializes it to show the US
*/
function initMap() {
    let center = {
        lat: 38.83333,
        lng: -98.58333
    };
    googleMap = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: center
    });
}

$(function () {
    window.meetup = new Meetup("meetup");
    window.meetup.init();
});