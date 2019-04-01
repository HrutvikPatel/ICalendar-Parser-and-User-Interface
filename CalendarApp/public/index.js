// app.js
// JS file.
// By: Hrutvikkumar Patel (hrutvikk@uoguelph.ca)
// Student ID: 1002517
// Date: March 22, 2019
// CIS2750
// Assignment #3

// JSON global class
class JSON {
    constructor() {
        this.allCal;
        this.curCal;
        this.curEvent;
        this.curAlarm;
        this.curFile;
    }
}

var json = new JSON();

// Put all onload AJAX calls here, and event listeners
$(document).ready(function () {
    // On page-load AJAX Example

    // this was removed temporarily.
    // updateFileLogPanel();

    // upload file
    $('#uploadFile').click(function (e) {
        $('#fileToUpload').click();
    });

    // file to upload
    $('#fileToUpload').change(function (e) {
        uploadFile();
    });

    // when a new file is selected for calendar view panel, reset the tables
    $('#dropdown-menu').on('click', '.dropdown-item', function (e) {
        var filename = $(this).text();
        $("#calViewBody").children().remove();
        $("#table-event-properties").children().remove();
        $("#table-event-alarms").children().remove();
        getFileContent(filename);
    });

    // adds file choose in add event modal to text box that is readonly
    $('#dropdown-add-event').on('click', '.dropdown-item', function (e) {
        var filename = $(this).text();
        $("#input-add-event-cal-select").val(filename);
        $("#fake-input-add-event-cal-select").val(filename);
    });

    // shows properties of an event
    $('#calViewBody').on('click', '.cal-prop-btn', function (e) {
        $("#table-event-properties").children().remove();
        var index = $(this).val();
        var num = +index + 1;
        // adds status of event to status panel
        appendStatus(0, "Viewing event #" + num + " properties from " + json.curFile + ".");

        // get list of properties
        json.curEvent = json.curCal.events[index];
        var properties = json.curEvent.properties;

        var i = 0;
        var table = document.getElementById("table-event-properties");
        var newRow, propNo, name, description;

        // if no properties show that there are none in the table
        if (properties.length == 0) {
            newRow = table.insertRow(i);
            newRow.innerHTML = "<tr><td colspan=\"5\"><p class=\"font-weight-bold\">No Extra Optional Properties To View</p></td></tr><tr>";
            return;
        }

        // insert property rows
        for (i in properties) {
            newRow = table.insertRow(i);
            propNo = newRow.insertCell(0);
            name = newRow.insertCell(1);
            description = newRow.insertCell(2);

            propNo.innerHTML = +i + 1;
            name.innerHTML = properties[i].name;
            description.innerHTML = properties[i].description;
        }
    });

    // show alarm of an event
    $('#calViewBody').on('click', '.cal-alarm-btn', function (e) {
        $("#table-event-alarms").children().remove();
        var index = $(this).val();
        // get alarm list
        json.curEvent = json.curCal.events[index];
        json.curAlarm = json.curEvent.alarms;
        var alarms = json.curAlarm;

        // show status of this action
        var num = +index + 1;
        appendStatus(0, "Viewing event #" + num + " alarms from " + json.curFile + ".");

        var i = 0;
        var table = document.getElementById("table-event-alarms");
        var newRow, alarmNo, action, trigger, numProps;

        // if no alarms show that there are no alarms in table
        if (alarms.length == 0) {
            newRow = table.insertRow(i);
            newRow.innerHTML = "<tr><td colspan=\"5\"><p class=\"font-weight-bold\">No Alarms To View</p></td></tr><tr>";
            return;
        }

        // insert rows of alarms
        for (i in alarms) {
            newRow = table.insertRow(i);
            alarmNo = newRow.insertCell(0);
            action = newRow.insertCell(1);
            trigger = newRow.insertCell(2);
            numProps = newRow.insertCell(3);

            alarmNo.innerHTML = +i + 1;
            action.innerHTML = alarms[i].action;
            trigger.innerHTML = alarms[i].trigger;
            numProps.innerHTML = "<td>"
                + "<button type=\"button\" value=\"" + i + "\" class=\"btn btn-secondary alarm-prop-btn\">"
                + "Show <span class=\"ml-2 badge badge-light\">" + alarms[i].numProps + "</span>"
                + "</button></td>";
        }
    });

    // show alarm properties
    $('#table-event-alarms').on('click', '.alarm-prop-btn', function (e) {
        $("#table-event-properties").children().remove();
        var index = $(this).val();

        // get properties list
        var properties = json.curAlarm[index].properties;
        var i = 0;

        // add status of this action to status panel
        var num = +index + 1;
        appendStatus(0, "Viewing event #" + num + " alarms from " + json.curFile + ".");

        var table = document.getElementById("table-event-properties");
        var newRow, propNo, name, description;

        // if no properties show there are none in the table
        if (properties.length == 0) {
            newRow = table.insertRow(i);
            newRow.innerHTML = "<tr><td colspan=\"5\"><p class=\"font-weight-bold\">No Extra Optional Properties To View</p></td></tr><tr>";
            return;
        }

        // insert property rows
        for (i in properties) {
            newRow = table.insertRow(i);
            propNo = newRow.insertCell(0);
            name = newRow.insertCell(1);
            description = newRow.insertCell(2);

            propNo.innerHTML = +i + 1;
            name.innerHTML = properties[i].name;
            description.innerHTML = properties[i].description;
        }
    })

    // Clear status panel
    $("#clear-status-list").click(function (e) {
        var length = $('#status-list card').length;
        if (length != 0) {
            $("#status-list card").remove();
        }
    });

    // reset create calendar forms
    $("#create-calendar-btn").click(function (e) {
        document.getElementById("calendar-details").reset();
    });

    // reset add event form
    $('#add-event').click(function (e) {
        document.getElementById("add-event-details").reset();
    });

    // logouts out of database and disconnects database
    $('#logoutBtn').click(function(e) {
        $.ajax({
            url: '/disconnectDatabase',
            type: 'get',
            success: function (data) {
                document.location.reload();
            },
            fail: function (error) {
                document.location.reload();
            }
        });
    });

    // store all files to database tables
    $('#storeAllFilesBtn').click(function(e) {
        // get list of all valid files from json
        let validFiles = [];
        let i = 0;
        for(i in json.allCal) {
            if(json.allCal[i].status === 0) {
                validFiles.push(json.allCal[i]);
            }
        }
        console.log(validFiles);
        $.ajax({
            url: '/storeAllFiles',
            type: 'get',
            data: {validFiles: validFiles},
            success: function (data) {
                appendStatus(data.status, data.message);
            },
            fail: function (error) {
                appendStatus(-1, " An internal error occured with the server request when attempting to store all files to the database.");
            }
        });
    });

    // form validation for add event
    var addEventForm = document.getElementsByClassName('add-event-needs-validation');

    // validation
    var validation1 = Array.prototype.filter.call(addEventForm, function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (form.checkValidity() === false) { // prevent submit if form is invalid
                event.stopPropagation();
                form.classList.add('was-validated');
            }
            else { // proceed to adding the event
                var formData = $('#add-event-details').serialize(); // serialize form and send it to server
                $.ajax({
                    url: '/addEvent',
                    type: 'get',
                    data: formData,
                    success: function (data) {
                        // update all and append status
                        updateFileLogPanel();
                        appendStatus(data.status, data.message);
                        $('#addEventModal').modal('hide');
                    },
                    fail: function (error) {
                        // request error add error to status panel
                        appendStatus(-1, "An internal error occured with the server request when adding a new event to iCalendar file.");
                        $('#addEventModal').modal('hide');
                    }
                });
                // close modal
                $('#addEventModal').modal('hide');
            }
        }, false);

    });

    // form validation for create calendar
    var createCalendarForm = document.getElementsByClassName('create-calendar-needs-validation');

    // validation
    var validation2 = Array.prototype.filter.call(createCalendarForm, function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (form.checkValidity() === false) { // checks if the form is valid if not then prevent submition
                event.stopPropagation();
                form.classList.add('was-validated');
            }
            else { // if form is valid continue to creating the calendar
                // check if file already exists if it doesnt print success else print error
                if (checkIfFileNameIsTaken($('#filename').val()) === false) {
                    var formData = $('#calendar-details').serialize();
                    $.ajax({
                        url: '/createCalendar',
                        type: 'get',
                        data: formData,
                        success: function (data) {
                            // update all and append status panel
                            updateFileLogPanel();
                            appendStatus(data.status, data.message);
                            $('#createCalendarModal').modal('hide');
                        },
                        fail: function (error) {
                            // request error append error to status panel
                            appendStatus(-1, "An internal error occured with the server request when creating a new iCalendar file.");
                            $('#createCalendarModal').modal('hide');
                        }
                    });
                }
                // close modal
                $('#createCalendarModal').modal('hide');
            }
        }, false);
    });

    // hide logout btn
    loginModal();

    // form validation for login
    var logInForm = document.getElementsByClassName('login-form-validation');

    // validation
    var validation3 = Array.prototype.filter.call(logInForm, function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (form.checkValidity() === false) { // prevent submit if form is invalid
                event.stopPropagation();
                form.classList.add('was-validated');
            }
            else { // proceed to adding the event
                var formData = $('#login-form').serialize(); // serialize form and send it to server
                $.ajax({
                    url: '/connectDatabase',
                    type: 'get',
                    data: formData,
                    success: function (data) {
                        // update all and append status
                        updateFileLogPanel();
                        appendStatus(data.status, data.message);
                        $('#loginModal').modal('hide');
                        if( data.status < 0 ) {
                            setTimeout(loginModal, 1000);
                        }
                        else {
                            $('#logoutBtn').show();
                        }
                    },
                    fail: function (error) {
                        // request error add error to status panel
                        appendStatus(-1, "An internal error occured with the server request when attempting to connect to your database.");
                        $('#loginModal').modal('hide');
                    }
                });
                // close modal
                $('#loginModal').modal('hide');
            }
        }, false);

    });
});

// resets login modal and reprompts for login info
function loginModal() {
    document.getElementById("login-form").reset();
    $('#loginBtn').click();
}


// checks if the file that the user wants to create already exists
function checkIfFileNameIsTaken(name) {
    var filenames = getListOfFileNames();
    var bool = filenames.includes(name + ".ics");
    if (bool === true) { // if file already exists add message to status panel
        appendStatus(-1, "ICalendar " + name + ".ics already exists! Please choose another name.");
    }
    return bool;
}

// gets list of all file names in uploads folder
function getListOfFileNames() {
    files = json.allCal;
    var i = 0;
    var filenames = [];
    for (i in files) {
        filenames.push(files[i].filename);
    }
    return filenames;
}

// gets current date time
function getDateTime() {
    var currentdate = new Date();
    var datetime = twoDigits(currentdate.getDate()) + "/"
        + twoDigits((currentdate.getMonth() + 1)) + "/"
        + twoDigits(currentdate.getFullYear()) + " @ "
        + twoDigits(currentdate.getHours()) + ":"
        + twoDigits(currentdate.getMinutes()) + ":"
        + twoDigits(currentdate.getSeconds());
    return datetime;
}

// makes a single digit string intoa 2 digit string by adding prefix '0'
function twoDigits(num) {
    if (num < 10) {
        return '0' + num;
    }
    return num;
}

// updates file log panel and upadtes Calendar DropDown on success
function updateFileLogPanel() {
    // On page-load AJAX Example
    $.ajax({
        type: 'get',            //Request type
        dataType: 'json',       //Data type - we will use JSON for almost everything 
        url: '/getAllFiles',   //The server endpoint we are connecting to
        success: function (data) {
            /*  Do something with returned object
                Note that what we get is an object, not a string, 
                so we do not need to parse it on the server.
                JavaScript really does handle JSONs seamlessly
            */
            json.allCal = data;

            // disable add event button if there are no files
            if (json.allCal.length == 0) {
                // document.getElementById("add-event").disabled = true;
                $('#add-event').hide();
                $('#select-calendar-btn').hide();
                $('#storeAllFilesBtn').hide();
                appendStatus(0, "Sorry you cannot add an event at the moment. There are no iCalendar Files to add an event to!");
            }
            else { // else enable it
                // document.getElementById("add-event").disabled = false;
                $('#add-event').show();
                $('#select-calendar-btn').show();

                var i = 0;
                var atLeastOneValidFile = false;
                for( i in json.allCal) {
                    if(json.allCal[i].status === 0){
                        atLeastOneValidFile = true;
                    }
                }
                if(atLeastOneValidFile) $('#storeAllFilesBtn').show();
                else $('#storeAllFilesBtn').hide();
            }

            fileLogPanelRow(data);
            updateCalDropDown(data);
        },
        fail: function (error) {
            // Non-200 return, do something with error
            appendStatus(-1, "Attempted to upload file. However, an internal error occured with the server request.");
        }
    });
}

// populates File Log Table
function fileLogPanelRow(files) {
    $('#fileLogPanel').children().remove(); // remove any rows in file log first

    // variables
    var table = document.getElementById("fileLogPanel");
    var newRow;
    var filename, version, prodID, numEvents, numProps;
    var link;
    var i = 0;

    // if no files in uploads dir then add a row that says 'No files'
    if (files.length == 0) {
        newRow = table.insertRow(i);
        newRow.innerHTML = "<tr><td colspan=\"5\"><p class=\"font-weight-bold\">No Files</p></td></tr><tr>";
        return;
    }

    for (i in files) {
        // assign row and cells
        newRow = table.insertRow(i);
        filename = newRow.insertCell(0);
        version = newRow.insertCell(1);
        prodID = newRow.insertCell(2);
        numEvents = newRow.insertCell(3);
        numProps = newRow.insertCell(4);

        // if status is OK then place all values in correct columns
        if (files[i].status == 0) {
            link = "/uploads/" + files[i].filename;
            filename.innerHTML = "<a href=" + link + ">" + files[i].filename + "</a>";
            version.innerHTML = files[i].calToJSON.version;
            prodID.innerHTML = files[i].calToJSON.prodID;
            prodID.setAttribute("style", "white-space: nowrap;");
            numEvents.innerHTML = files[i].calToJSON.numEvents;
            numProps.innerHTML = files[i].calToJSON.numProps;
        }
        // if invalid file then write Invalid File in Product ID col and just name. 
        else {
            filename.innerHTML = files[i].filename;
            version.innerHTML = "";
            prodID.innerHTML = "Invalid File";
            prodID.setAttribute("style", "white-space: nowrap;");
            numEvents.innerHTML = "";
            numProps.innerHTML = "";
        }
    }
}

// updates calendar dropdowns
function updateCalDropDown(files) {
    // resets calendar info texts with empty
    $('.cal-view-header-file').val("");
    $('.cal-view-header-version').val("");
    $('.cal-view-header-prodID').val("");

    // get objects and remove all children items in dropdown
    var calDropDown = document.getElementById('dropdown-menu');
    var addEventDropDown = document.getElementById('dropdown-add-event');
    $("#dropdown-menu").children().remove();
    $("#dropdown-add-event").children().remove();
    var i = 0;

    // add new children to dropdown
    for (i in files) {
        var newBtn1 = document.createElement('button');
        newBtn1.setAttribute("value", i);
        newBtn1.setAttribute("class", "dropdown-item");
        newBtn1.setAttribute("type", "button");
        newBtn1.innerHTML = files[i].filename;

        var newBtn2 = document.createElement('button');
        newBtn2.setAttribute("value", i);
        newBtn2.setAttribute("class", "dropdown-item");
        newBtn2.setAttribute("type", "button");
        newBtn2.innerHTML = files[i].filename;

        calDropDown.appendChild(newBtn1);
        addEventDropDown.appendChild(newBtn2);
    }
    // reset table to empty when Calendar View panel is updated
    $("#calViewBody").children().remove();

}

// gets a single file from the server for Calendar View Panel
function getFileContent(file) {
    $.ajax({
        url: '/getSingleFile',
        type: 'get',
        data: {
            filename: file
        },
        success: function (data) {
            // populate Calendar View and save data to global json var
            json.curCal = data[0].calToJSON;
            json.curFile = data[0].filename;
            populateCalendarView(data);
            // append result to status panel
            appendStatus(0, "User selected " + data[0].filename + " to view in Calendar File Manager.");
        },
        fail: function (err) {
            appendStatus(-1, "User wanted to view" + data[0].filename + " in Calendar File Manager. However, an internal request error occured.");
        }
    });
}

// adds file selected by user to the Calendar View panel
function populateCalendarView(file) {
    let filename = file[0].filename;
    let version = json.curCal.version;
    let prodID = json.curCal.prodID;
    let i = 0;

    var table = document.getElementById("calViewBody");
    var newRow, eventNo, startDate, startTime, summary, numProps, numAlarms;
    // insert new row.
    var events = json.curCal.events;

    // add events to calendar view panel
    for (i in events) {
        newRow = table.insertRow(i);
        eventNo = newRow.insertCell(0);
        startDate = newRow.insertCell(1);
        startTime = newRow.insertCell(2);
        summary = newRow.insertCell(3);
        numProps = newRow.insertCell(4);
        numAlarms = newRow.insertCell(5);

        // add calendar info to labels above table
        $('.cal-view-header-file').val(filename);
        $('.cal-view-header-version').val(version);
        $('.cal-view-header-prodID').val(prodID);

        // add event details 
        eventNo.innerHTML = +i + 1;
        startDate.innerHTML = addSlashInDate(events[i].startDateTime.date);
        startTime.innerHTML = addColonInTime(events[i].startDateTime.time);
        if (events[i].startDateTime.UTC == true) startTime.innerHTML = "<p class=\"flex-nowrap\" style=\"white-space: nowrap\">" + events[i].startDateTime.time + " (UTC)" + "</p>";
        summary.innerHTML = events[i].summary;
        summary.setAttribute("style", "wrap: hard !important; white-space: wrap; ");
        numProps.innerHTML = "<td>"
            + "<button type=\"button\" value=\"" + i + "\" class=\"btn btn-secondary cal-prop-btn\">"
            + "Show <span class=\"ml-2 badge badge-light\">" + events[i].numProps + "</span>"
            + "</button></td>";

        numAlarms.innerHTML = "<td><button value=\"" + i + "\" type=\"button\" class=\"btn btn-secondary cal-alarm-btn\">"
            + "Show <span class=\"ml-2 badge badge-light\">" + events[i].numAlarms + "</span></button></td>";
    }
}

// add slash in date
function addSlashInDate(date) {
    return date.substring(0, 4) + "/" + date.substring(4, 6) + "/" + date.substring(6, 8);
}

// add colon in time
function addColonInTime(date) {
    return date.substring(0, 2) + ":" + date.substring(2, 4) + ":" + date.substring(4, 6);
}

// appends a new message to the status panel
// 0 is success = green
// < 0 is an error = red
// > 0 is info = blue
function appendStatus(status, message) {
    // get document and create new card
    var list = document.getElementById('status-list');
    var dateTime = getDateTime();
    var entry = document.createElement('card');

    // if status = success
    if (status > 0) {
        entry.innerHTML = "<div class=\"card text-white bg-success\"><div class=\"card-header\"><strong>Success:</strong> " + dateTime + "</div><div class=\"card-body\"><p class=\"card-text\">" + message + "</p></div></div>";
    }
    // status = error
    else if (status < 0) {
        entry.innerHTML = "<div class=\"card text-white bg-danger\"><div class=\"card-header\"><strong>Error:</strong> " + dateTime + "</div><div class=\"card-body\"><p class=\"card-text\">" + message + "</p></div></div>";
    }
    // status = info
    else {
        entry.innerHTML = "<div class=\"card text-white bg-info\"><div class=\"card-header\"><strong>Info:</strong> " + dateTime + "</div><div class=\"card-body\"><p class=\"card-text\">" + message + "</p></div></div>";
    }
    list.appendChild(entry);
    var element = document.getElementById("status-panel");
    element.scrollTop = element.scrollHeight;
}

// uploads file to server
function uploadFile() {
    var fileInput = document.getElementById('fileToUpload');
    var uploadFile = fileInput.files[0];
    var formData = new FormData();
    formData.append('uploadFile', uploadFile);
    var xhr = new XMLHttpRequest();

    // get post return message so callback?
    xhr.onload = function () {
        if (xhr.status != 200) { // if error append messsage to status panel
            appendStatus(-1, xhr.response);
        }
        else { // if success then append message to status panel and update all file list content
            appendStatus(1, xhr.response);
            updateFileLogPanel();
        }
        // make fileToUpload empty again
        $("#fileToUpload").val("");
    }
    // send post data
    xhr.open('POST', '/upload', true);
    xhr.send(formData);
    return false;
}