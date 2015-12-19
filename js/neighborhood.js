// Initial array of locations
var locations = [
    {
        name: "Stratosphere Casino, Hotel & Tower",
        lat: 36.14723193962685,
        lng: -115.15624523162842,
        id: "49dea3bbf964a52097601fe3"
    },
    {
        name: "Caesars Palace Hotel & Casino",
        lat: 36.116036862271876 ,
        lng: -115.1742696762085,
        id: "41326e00f964a520da131fe3"
    },
    {
        name: "Paris Hotel & Casino",
        lat:  36.112465968297066,
        lng: -115.17139434814453,
        id: "41326e00f964a520c9141fe3"
    },
    {
        name: "Bally's Hotel & Casino",
        lat:  36.11387007704609,
        lng: -115.16668438911438,
        id: "45aa45b2f964a52030411fe3"
    },
    {
        name: "Wynn Las Vegas",
        lat:  36.12635860619657,
        lng: -115.287580,
        id: "458d63f7f964a52005401fe3"
    },
    {
        name: "New York-New York Hotel & Casino",
        lat:  36.102649506919235,
        lng: -115.1744145154953,
        id: "41326e00f964a520b2141fe3"
    },
    {
        name: "M Resort Spa Casino",
        lat:  35.9647721,
        lng: -115.1684896,
        id: "49de8b97f964a52077601fe3"
    },
    {
        name: "Mandalay Bay",
        lat:  36.09185214999439,
        lng: -115.1748275756836,
        id: "41326e00f964a52092141fe3"
    },
    {
        name: "The Cosmopolitan of Las Vegas",
        lat:  36.11003905447788,
        lng: -115.17555713653564,
        id: "4bfe71ede529c928c852bc8c"
    },
    {
        name: "Red Rock Casino Resort & Spa",
        lat:  36.1569658,
        lng: -115.3335939,
        id: "46ae2f06f964a5207f491fe3"
    },
    {
        name: "MGM Grand Hotel & Casino",
        lat:  36.102411122843996,
        lng: -115.16946315765381,
        id:  "41326e00f964a52099141fe3"
    }
];
// Initialize the map
var map;
function initMap() {
    "use strict";
    var neightborhood = new google.maps.LatLng(36.045610,-115.205925);
    var mapOptions =
    {    
         zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center : neightborhood
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    

//  Print error message ,if google maps isn't working
function googleError() {
    "use strict";
    document.getElementById('map').innerHTML = "<h2>Google Maps is not loading. Please try refreshing the page later.</h2>";
}

// Place constructor

var Place = function (data) {
    "use strict";
    this.name = ko.observable(data.name);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.id = ko.observable(data.id);
    this.marker = ko.observable();
    this.address = ko.observable('');
    this.url = ko.observable('');
    this.photoPrefix = ko.observable('');
    this.photoSuffix = ko.observable(''); 
   
};
 

// ViewModel
var ViewModel = function () {
    "use strict";

    // Make this accessible
    var self = this;

    // Create an array of all places
    this.placeList = ko.observableArray([]);

    
    // Create Place objects for each item in locations & store them in the above array
    locations.forEach(function (placeItem) {
        self.placeList.push(new Place(placeItem));
    });

    // Initialize the infowindow
    var infowindow = new google.maps.InfoWindow({
        maxWidth: 250,
    });

    // Initialize marker
    var marker;

    // For each place, set markers, request Foursquare data, and set event listeners for the infowindow
    self.placeList().forEach(function (placeItem) {

        // Define markers for each place
        var image = 'images/map-marker.png';

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
            map: map,
            animation: google.maps.Animation.DROP,
            icon: image
        });

        placeItem.marker = marker;
        
 
        // Make AJAX request to Foursquare to get detail information about selected place
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + placeItem.id() +
            '?client_id=KP4KHMY3OZPYZHSMZMVJ0DPJYDKWGUBWBUXYZBKZV3AXR0BX&client_secret=XO23TX4OGMKD24ZHALPG5UHHLT3KWZY0AFFYKD3K0WUC40LE&v=20130815',
            dataType: "json",

            success: function (data) {
                // Make results easier to handle
                var result = data.response.venue;

                
                // Check each result for properties, if the property exists, add it to the Place constructor
               
                var location = result.hasOwnProperty('location') ? result.location : '';
                if (location.hasOwnProperty('formattedAddress')) {
                    placeItem.address(location.formattedAddress || '');
                }
                var bestPhoto = result.hasOwnProperty('bestPhoto') ? result.bestPhoto : '';
                if (bestPhoto.hasOwnProperty('prefix')) {
                    placeItem.photoPrefix(bestPhoto.prefix || '');
                }
                if (bestPhoto.hasOwnProperty('suffix')) {
                    placeItem.photoSuffix(bestPhoto.suffix || '');
                }
                var url = result.hasOwnProperty('url') ? result.url : '';
                    placeItem.url(url || '');

                // Content of the infowindow           
                    var content = '<div><h4>' + placeItem.name() + '</h4><div id="pic"><img src="' +
                        placeItem.photoPrefix() + '110x110' + placeItem.photoSuffix() +
                        '" alt="Image Location"></div>' + placeItem.address() + 
                        '</p><p><a href=' + placeItem.url() + '>' + placeItem.url() +
                        '</div>';  

                //This event listener add content to infowindow, when the user click marker
                google.maps.event.addListener(placeItem.marker, 'click', function () {
                    infowindow.open(map, this);
                    placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(function () {
                        placeItem.marker.setAnimation(null);
                    }, 500);
                    infowindow.setContent(content);
                });
            },

        });

        
    });

    // Activate the appropriate marker when the user clicks a list item
    self.showInfo = function (placeItem) {
        google.maps.event.trigger(placeItem.marker, 'click');
        self.hideElements();
    };

    // Toggle the nav class based style
    
    self.toggleNav = ko.observable(false);
    this.navStatus = ko.pureComputed (function () {
        return self.toggleNav() === false ? 'nav' : 'navClosed';
        }, this);

    self.hideElements = function (toggleNav) {
        self.toggleNav(true);
        // Allow default action
        return true;
    };

    self.showElements = function (toggleNav) {
        self.toggleNav(false);
        return true;
    };

    // Filter markers per user input
    // Array containing only the markers based on search
    self.visible = ko.observableArray();

    // All markers are visible by default before any user input
    self.placeList().forEach(function (place) {
        self.visible.push(place);
    });

    // Track user input
    self.userInput = ko.observable('');

    // If user input is included in the place name, make it and its marker visible
    // Otherwise, remove the place & marker
    self.filterMarkers = function () {
        // Set all markers and places to not visible.
        var searchInput = self.userInput().toLowerCase();
        self.visible.removeAll();
        self.placeList().forEach(function (place) {
            place.marker.setVisible(false);
            // Compare the name of each place to user input
            // If user input is included in the name, set the place and marker as visible
            if (place.name().toLowerCase().indexOf(searchInput) !== -1) {
                self.visible.push(place);
            }
        });
        self.visible().forEach(function (place) {
            place.marker.setVisible(true);
        });
    };

}; // ViewModel

// Start the ViewModel here so it doesn't initialize before Google Maps loads
    ko.applyBindings(new ViewModel());
}