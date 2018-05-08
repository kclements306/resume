class Meetup {
    constructor(name, map) {
        this.name = name;
        this.localMap = map;
        this.failedResponse;
    }

    init() {
        this._bindEvents();
    }

    _bindEvents() {
        $("#btnInput").on("click", $.proxy(this.btnGetMeetupData, this));
    }

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
            _this.processData(response);
        }).fail(function (response) {
            _this.failedResponse= response;
        });
    }

    /*

    */
    processData(response) {
        let results = response.results;
        $("#country").val("");
        $("#state").val("");
        $("#rowCount").val("");
        $("#rightColumn").empty();
        clearMarkers();
        mapData(results);
        this.saveMeetingsToLocalStorage(results);
    }

    /*
        saveMeetingsToLocalStorage - saves meetings to local localStorage
            returns:
                true -  if meetings was saved in local storage
                false - if meetings was not saved in local storage
    */
    saveMeetingsToLocalStorage(results) {
        try {
            localStorage.setItem(this.name, JSON.stringify(results));
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

    initMap() {
        let start = {
            lat: 38.83333,
            lng: -98.58333
        };
        this.localMap = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: start
        });
        // let marker = new google.maps.Marker({
        //     position: start,
        //     map: this.map
        // });
    }
}

function initMap() {
    let start = {
        lat: 38.83333,
        lng: -98.58333
    };
    window.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: start
    });
    // let marker = new google.maps.Marker({
    //     position: start,
    //     map: this.map
    // });
}

function mapData(meetings) {

    let htmlText = "";
    meetings.forEach(meeting => {
        let latlng = null;
        let marker = null;
        latlng = new google.maps.LatLng(meeting.lat, meeting.lon);
        marker = new google.maps.Marker({
            position: latlng,
            label: (meeting.ranking + 1).toString(),
            title: meeting.city,
            map: window.map
        });
        this.markers.push(marker);      // Save the maker so they can be deleted
        htmlText += "Ranking: " + (meeting.ranking + 1).toString() + "<br>";
        htmlText += "Location: " + meeting.city + ",&nbsp;" + meeting.state + "&nbsp;&nbsp;" + meeting.zip  + "&nbsp;&nbsp;";
        htmlText +=  meeting.localized_country_name + "<br>";
        htmlText += "Member Count: " + meeting.member_count + "<br><br>";
    });
    $("#rightColumn").append(htmlText);
    return false;
}

function clearMarkers() {
    this.markers.forEach( function (marker) {
        marker.setMap(null);
    });
}

$(function () {
    window.map;
    window.markers = [];
    window.meetup = new Meetup("meetup", this.map);
    window.meetup.init();
});