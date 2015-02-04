/**
 * service.js
 * scott linne 2014
 * Computer Science 50
 * Problem Set 8
 *
 * Implements a shuttle service.
 */

// default height
var HEIGHT = 0.8;

// default latitude
var LATITUDE = 42.3745615030193;

// default longitude
var LONGITUDE = -71.11803936751632;

// default heading
var HEADING = 1.757197490907891;

// default number of seats
var SEATS = 10;

// default velocity
var VELOCITY = 50;

// global reference to shuttle's marker on 2D map
var bus = null;

// global reference to 3D Earth
var earth = null;

// global reference to 2D map
var map = null;

// global reference to shuttle
var shuttle = null;

// initialize points counter
var points = 0;
// initialize counter for total passengers dropped off
var total_dropped = 0;

var COLOR = 
{
    "Adams House": {color: "#FF0000"},
    "Cabot House": {color: "#0000FF"},
    "Currier House": {color: "#66FF33"},
    "Dunster House": {color: "#0000FF"},
    "Eliot House": {color: "#FF0000"},
    "Kirkland House": {color: "#0000FF"},
    "Leverett House": {color: "#FF0000"},
    "Lowell House": {color: "#0000FF"},
    "Mather House": {color: "#FF0000"},
    "Pforzheimer House": {color: "#0000FF"},
    "Quincy House": {color: "#FF0000"},
    "Winthrop House": {color: "#0000FF"}
};




// load version 1 of the Google Earth API
google.load("earth", "1");

// load version 3 of the Google Maps API
google.load("maps", "3", {other_params: "sensor=false"});

// once the window has loaded
$(window).load(function() {

    // listen for keydown anywhere in body
    $(document.body).keydown(function(event) {
        return keystroke(event, true);
    });

    // listen for keyup anywhere in body
    $(document.body).keyup(function(event) {
        return keystroke(event, false);
    });

    // listen for click on Drop Off button
    $("#dropoff").click(function(event) {
        dropoff();
    });

    // listen for click on Pick Up button
    $("#pickup").click(function(event) {
        pickup();
    });

    // load application
    load();
});

// unload application
$(window).unload(function() {
    unload();
});

/**
 * Renders seating chart.
 */
function chart()
{
    var html = "<ol start='0'>";
    for (var i = 0; i < shuttle.seats.length; i++)
    {
        if (shuttle.seats[i] == null)
        {
            html += "<li>Empty Seat</li>";
        }
        else
        {
            html += "<li style=color:" +COLOR[shuttle.seats[i].house].color+ ">" + shuttle.seats[i].name + " to " + shuttle.seats[i].house + "</li>";
        }
    }
    html += "</ol>";
    $("#chart").html(html);
}

/**
 * Drops up passengers if their stop is nearby.
 */
function dropoff()
{
    
    // initialize a variable to check for a dropoff occuring
    var dropped = 0;
    
    // if shuttle distance within 30 meters of a passengers house 
    // drop them off and empty the seat
    
    
    // iterate over the shuttle seats
    for(var k = 0; k < shuttle.seats.length; k++)
    {

        // skip any seats that are empty        
        if(shuttle.seats[k] != null)
        {
         
            var dist = shuttle.distance(HOUSES[shuttle.seats[k].house].lat, HOUSES[shuttle.seats[k].house].lng);
            
            // if distance of shuttle to house is less than 30
            // then remove the student from the shuttle
            if(dist < 30)
            {
                // empty a seat
                shuttle.seats[k] = null;
                
                // update the chart
                chart();
                
                points++;
                $("#announcements").html("your score is " + points + " points.");
                
                // update the dropped varible to indicate a dropoff occured
                var dropped = 1;
                // count how many passengers in total have been dropped off to indicate end of game
               total_dropped++;
            }
        }
        
    }
    // if dropped variable is still 0 we are not in range of a house for dropoff
    if(dropped == 0)
    {
        $("#announcements").html("No houses in range for dropoff <br> your score is " + points + " points");
        
    }
    if(total_dropped == (102 - 3))
    {
        $("#announcements").html("All passengers have been picked up and dropped off");
    }
    
}

/**
 * Called if Google Earth fails to load.
 */
function failureCB(errorCode) 
{
    // report error unless plugin simply isn't installed
    if (errorCode != ERR_CREATE_PLUGIN)
    {
        alert(errorCode);
    }
}

/**
 * Handler for Earth's frameend event.
 */
function frameend() 
{
    shuttle.update();
}

/**
 * Called once Google Earth has loaded.
 */
function initCB(instance) 
{
    // retain reference to GEPlugin instance
    earth = instance;

    // specify the speed at which the camera moves
    earth.getOptions().setFlyToSpeed(100);

    // show buildings
    earth.getLayerRoot().enableLayerById(earth.LAYER_BUILDINGS, true);

    // disable terrain (so that Earth is flat)
    earth.getLayerRoot().enableLayerById(earth.LAYER_TERRAIN, false);

    // prevent mouse navigation in the plugin
    earth.getOptions().setMouseNavigationEnabled(false);

    // instantiate shuttle
    shuttle = new Shuttle({
        heading: HEADING,
        height: HEIGHT,
        latitude: LATITUDE,
        longitude: LONGITUDE,
        planet: earth,
        seats: SEATS,
        velocity: VELOCITY
    });

    // synchronize camera with Earth
    google.earth.addEventListener(earth, "frameend", frameend);

    // synchronize map with Earth
    google.earth.addEventListener(earth.getView(), "viewchange", viewchange);

    // update shuttle's camera
    shuttle.updateCamera();

    // show Earth
    earth.getWindow().setVisibility(true);

    // render seating chart
    chart();

    // populate Earth with passengers and houses
    populate();
}

/**
 * Handles keystrokes.
 */
function keystroke(event, state)
{
    // ensure we have event
    if (!event)
    {
        event = window.event;
    }

    // left arrow
    if (event.keyCode == 37)
    {
        shuttle.states.turningLeftward = state;
        $("#announcements").html("no new messages"); 
        return false;
    }

    // up arrow
    else if (event.keyCode == 38)
    {
        shuttle.states.tiltingUpward = state;
        $("#announcements").html("no new messages"); 
        return false;
    }

    // right arrow
    else if (event.keyCode == 39)
    {
        shuttle.states.turningRightward = state;
        $("#announcements").html("no new messages"); 
        return false;
    }

    // down arrow
    else if (event.keyCode == 40)
    {
        shuttle.states.tiltingDownward = state;
        $("#announcements").html("no new messages"); 
        return false;
    }

    // A, a
    else if (event.keyCode == 65 || event.keyCode == 97)
    {
        shuttle.states.slidingLeftward = state;
        $("#announcements").html("no new messages"); 
        return false;
    }

    // D, d
    else if (event.keyCode == 68 || event.keyCode == 100)
    {
        shuttle.states.slidingRightward = state;
       $("#announcements").html("no new messages");
        return false;
       
    }
  
    // S, s
    else if (event.keyCode == 83 || event.keyCode == 115)
    {
        shuttle.states.movingBackward = state; 
      $("#announcements").html("no new messages");    
        return false;
       
    }

    // W, w
    else if (event.keyCode == 87 || event.keyCode == 119)
    {
        shuttle.states.movingForward = state;  
        $("#announcements").html("no new messages");
         
        return false;
      
    }
      // speed up with r, R
    else if (event.keyCode == 82 || event.keyCode == 114)
    {
        shuttle.velocity = shuttle.velocity + 2;   
        $("#announcements").html("Current speed is: " + shuttle.velocity); 
        return false;
    }
    // speed down with e, E
    else if (event.keyCode == 69 || event.keyCode == 101)
    {
        shuttle.velocity = shuttle.velocity - 2;   
        $("#announcements").html("Current speed is: " + shuttle.velocity);        
        return false;
    }
    
    
   
    
    return true;
}

/**
 * Loads application.
 */
function load()
{
    // embed 2D map in DOM
    var latlng = new google.maps.LatLng(LATITUDE, LONGITUDE);
    map = new google.maps.Map($("#map").get(0), {
        center: latlng,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
        zoom: 17,
        zoomControl: true
    });

    // prepare shuttle's icon for map
        bus = new google.maps.Marker({
        icon: "https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/bus.png",
        map: map,
        title: "you are here"
        });
    
  


    // embed 3D Earth in DOM
    google.earth.createInstance("earth", initCB, failureCB);
}

/**
 * Picks up nearby passengers.
 */
function pickup()
{   
        // variable to indicate nobody was added to the bus
        // will change later to 1 if someone is added to the buss
        added = 0;
        // iterate over passengers
        for(var i = 0; i < PASSENGERS.length; i++)
        {
            if(PASSENGERS[i].placemark != null)
            {
                var lat = PASSENGERS[i].placemark.getGeometry().getLatitude();
                var lng = PASSENGERS[i].placemark.getGeometry().getLongitude();
                var d = shuttle.distance(lat,lng);
                
                // if passengers is under 15 meters from bus, pick them up
                if(d < 15)
                {
                    if(PASSENGERS[i].house in HOUSES == false)
                    {
                        $("#announcements").html("Sorry no freshmen can ride this bus");
                        break;
                    }
                    
                    // iterate over shuttle seats adding passenger to seat, update chart
                    for(var j = 0; j < shuttle.seats.length; j++)
                    {
                         // initialize a variable to check for a full bus
                         fullbus = 1;
                         // check if a seat is open
                        if(shuttle.seats[j] == null)
                        {   
                            // if there is an open seat, change the full bus variable to zero
                            // this variable will stay zero as long as there is an open seat
                            fullbus = 0;
                            
                            // assign a passenger to the shuttle seat
                            shuttle.seats[j] = PASSENGERS[i]
                            chart();
                            
                            // person was added to the buss
                            added = 1;
                            
                            // Remove passengers placemark and marker from the earh and map
                            var features = earth.getFeatures();
                            features.removeChild(PASSENGERS[i].placemark);
                            PASSENGERS[i].placemark = null;
                            PASSENGERS[i].marker.setMap(null);
                            PASSENGERS[i].marker = null;
                            
                            // break out of the loop so as to only add the passenger to one seat 
                            break;
                        }
                        
                    }    
                    // if the shuttle does not have an open seat, announce it is full
                    // variable fullbus will have a value of 1 if althe seats are occupied
                    if(fullbus == 1)
                    {
                        $("#announcements").html("Sorry, the shuttle is full");
                    }          
                }
            }
            // if no passengers are within 15 meters, announce they are out of range
            if(added == 0)
            {
                $("#announcements").html("Sorry no passengers in range");
            }
        }      
}


/**
 * Populates Earth with passengers and houses.
 */
function populate()
{
    // mark houses
    for (var house in HOUSES)
    {
        // plant house on map
        new google.maps.Marker({
            icon: "https://google-maps-icons.googlecode.com/files/home.png",
            map: map,
            position: new google.maps.LatLng(HOUSES[house].lat, HOUSES[house].lng),
            title: house
        });
    }

    // get current URL, sans any filename
    var url = window.location.href.substring(0, (window.location.href.lastIndexOf("/")) + 1);

    // scatter passengers
    for (var i = 0; i < PASSENGERS.length; i++)
    {
        // pick a random building
        var building = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];

        // prepare placemark
        var placemark = earth.createPlacemark("");
        placemark.setName(PASSENGERS[i].name + " to " + PASSENGERS[i].house);

        // prepare icon
        var icon = earth.createIcon("");
        icon.setHref(url + "/img/" + PASSENGERS[i].username + ".jpg");  

        // prepare style
        var style = earth.createStyle("");
        style.getIconStyle().setIcon(icon);
        style.getIconStyle().setScale(4.0);

        // prepare stylemap
        var styleMap = earth.createStyleMap("");
        styleMap.setNormalStyle(style);
        styleMap.setHighlightStyle(style);

        // associate stylemap with placemark
        placemark.setStyleSelector(styleMap);

        // prepare point
        var point = earth.createPoint("");
        point.setAltitudeMode(earth.ALTITUDE_RELATIVE_TO_GROUND);
        point.setLatitude(building.lat);
        point.setLongitude(building.lng);
        point.setAltitude(0.0);

        // associate placemark with point
        placemark.setGeometry(point);

        // add placemark to Earth
        earth.getFeatures().appendChild(placemark);

        // add marker to map
        var marker = new google.maps.Marker({
            icon: "https://maps.gstatic.com/intl/en_us/mapfiles/ms/micons/man.png",
            map: map,
            position: new google.maps.LatLng(building.lat, building.lng),
            title: PASSENGERS[i].name + " at " + building.name
        });

        // TODO: remember passenger's placemark and marker for pick-up's sake
        PASSENGERS[i].placemark = placemark;
        PASSENGERS[i].marker = marker; 
    }
}

/**
 * Handler for Earth's viewchange event.
 */
function viewchange() 
{
    // keep map centered on shuttle's marker
    var latlng = new google.maps.LatLng(shuttle.position.latitude, shuttle.position.longitude);
    map.setCenter(latlng);
    bus.setPosition(latlng);
}
    

/**
 * Unloads Earth.
 */
function unload()
{
    google.earth.removeEventListener(earth.getView(), "viewchange", viewchange);
    google.earth.removeEventListener(earth, "frameend", frameend);
}
