class Meetup {
    constructor(name) {
        this.name = name;
        this.meetings = [];
    }

    init() {
        this._bindEvents();
        // This datatable is displayed on the home page
        this.meetupTable = $("#meetupTable").DataTable({
            serverSide: false,
            data: this.meetings,
            columns: [
                { data: "country" },
                { data: "state" },
                { data: "city" },
                { data: "zip" },
                { data: "ranking" },
                { data: "memberCount" }
            ]
        });
    }

    _bindEvents() {
        $("#btnInput").on("click", $.proxy(this.btnGetMeetupData, this));
    }

    btnGetMeetupData() {
        let _this = this;
        let country = $("#country").val();
        let state = $("#state").val();
        let rowCount = $("#rowCount").val();
        this.meetupTable.clear();
        this.meetings = [];
        $.ajax({
            dataType: "jsonp",
            type: "GET",
            url: "https://api.meetup.com/2/cities",
            data: {
                country: country,
                state: state,
                page: rowCount
            }
        }).done(function (response) {
            _this.processData(response);
        }).fail(function (response) {
            console.log(response);
        });
    }

    /*

    */
    populateTable() {
        let _this = this;
        (this.meetings).forEach(meeting => {
            _this.meetupTable.row.add(meeting);
        });
        this.meetupTable.draw();
    }

    /*

    */
    processData(response) {
        let _this = this;
        let results = response.results;
        results.forEach(objMeeting => { // save meeting data to meetings
            (_this.meetings).push(new Meeting(objMeeting));
        });
        console.log(this.saveMeetingsToLocalStorage());
        this.populateTable();
    }

    /*
        saveMeetingsToLocalStorage - saves meetings to local localStorage
            returns:
                true -  if meetings was saved in local storage
                false - if meetings was not saved in local storage
    */
    saveMeetingsToLocalStorage() {
        try {
            localStorage.setItem(this.name, JSON.stringify(this.meetings));
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
    };

    initMap() {
        let uluru = {
            lat: -25.363,
            lng: 131.044
        };
        let map = new google.maps.Map(document.getElementById("map"), {
            zoom: 4,
            center: uluru
        });
        let marker = new google.maps.Marker({
            position: uluru,
            map: map
        });
    }
}

class Meeting {
    constructor(args) {
        this.city = args.city,
        this.country = args.country,
        this.distance = args.distance,
        this.id = args.id,
        this.localizedCountryName = args.localized_country_name,
        this.lon = args.lon,
        this.lat = args.lat;
        this.memberCount = args.member_count,
        this.ranking = args.ranking,
        this.state = args.state,
        this.zip = args.zip;
    }
}

$(function () {
    window.meetup = new Meetup("meetup");
    window.meetup.init();
});