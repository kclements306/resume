class Meetup {
    constructor(name) {
        this.name = name;
        this.markers = [];
        this.map;
        this.failedResponse;
    }

    init() {
        this.initMap();
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
            response - is the response from the meetup ajax call, which is of the form {}


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
        return false;
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
                true -  if meetings was successfully retrived from local storage
                false - if meetings was not successfully retrived from local storage
    */
    getMeetingsFromLocalStorage() {

        var _this = this;
        var jsonMeetings;
        try {
            jsonMeetings = JSON.parse(localStorage.getItem(this.name));
            jsonMeetings.forEach(function (jsonMeeting) {
                _this.addBook(new Meeting(jsonMeeting));
            });
            return true; // able to get meetings from local storage 
        } catch (exception) {
            return false; // local storage is full or inaccessable or error parsing json object
        }
    }

    /*
        initMap - creates a google maps object and initializes it to show the US
    */
    initMap() {
        let center = {
            lat: 38.83333,
            lng: -98.58333
        };
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: center
        });
    }

    /*
        clearMarkers - clears the markers from the map, if any.  The markers are stored in an array called markers.
    */
    clearMarkers() {
        let center = {
            lat: 38.83333,
            lng: -98.58333
        };
        this.markers.forEach( function (marker) {
            marker.setMap(null);
        });
        this.map.setCenter(center, 4);  // re-center and set zoom level to defaults
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
                map: this.map
            });
            bounds.extend(latlng);
            this.markers.push(marker);      // Save the maker so they can be deleted
            htmlText += "<p class=\"meetupData\"> Ranking: " + (meeting.ranking + 1).toString() + "<br>";
            htmlText += "Location: " + meeting.city + ",&nbsp;" + meeting.state + "&nbsp;&nbsp;" + meeting.zip  + "&nbsp;&nbsp;";
            htmlText +=  meeting.localized_country_name + "<br>";
            htmlText += "Member Count: " + meeting.member_count + "<br><br></p>";
        });
        this.map.fitBounds(bounds);
        $("#rightColumn").append(htmlText);
        return false;
    }
}

function initMap() {
 
}

$(function () {
    window.meetup = new Meetup("meetup");
    window.meetup.init();
});