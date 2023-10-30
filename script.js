let activityStartTime;

// Function to populate the "Topic" dropdown with values from the API
function populateTopics() {
    const topicSelect = document.getElementById("topic");
    topicSelect.innerHTML = ""; // Clear existing options

    // Fetch topics from the API
    fetch('http://localhost:8000/get_topics')
        .then(response => response.json())
        .then(data => {
            data.forEach(topic => {
                const option = document.createElement("option");
                option.value = topic.topic_name; // Set the value to topic_name
                option.text = topic.topic_name; // Display the topic_name in the dropdown
                option.dataset.id = topic.id; // Store the id in the data-id attribute
                topicSelect.add(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Function to populate the "Subtopic" dropdown with values based on the selected "Topic"
function populateSubtopics(selectedTopic) {
    const subtopicSelect = document.getElementById("subtopic");
    subtopicSelect.innerHTML = ""; // Clear existing options

    // Fetch subtopics based on the selected "Topic" from the API
    fetch(`http://localhost:8000/get_subtopics/${selectedTopic}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(subtopic => {
                const option = document.createElement("option");
                option.value = subtopic.subtopic_name; // Set the value to subtopic_name
                option.text = subtopic.subtopic_name; // Display the subtopic_name in the dropdown
                subtopicSelect.add(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Add an event listener to the "Topic" dropdown to get the selected topic's id and populate subtopics
document.getElementById("topic").addEventListener("change", function() {
    const selectedTopicId = this.options[this.selectedIndex].dataset.id;
    console.log("Selected Topic ID: " + selectedTopicId);

    // Populate the "Subtopic" dropdown with values based on the selected "Topic" id
    populateSubtopics(selectedTopicId);
});


// JavaScript to toggle the display of the Start New Activity form and handle form submission
document.getElementById("start_new_activity").addEventListener("click", function() {
    document.getElementById("newActivityForm").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";

    // Populate the "Topic" dropdown with values from the API
    populateTopics();
});

let activityId; // Declare a variable to store the activity ID

document.getElementById("activityForm").addEventListener("submit", function(e) {
    e.preventDefault();
    activityStartTime = new Date();
    document.getElementById("currentTopic").textContent = document.getElementById("topic").value;
    document.getElementById("currentSubtopic").textContent = document.getElementById("subtopic").value;
    document.getElementById("startTime").textContent = activityStartTime.toLocaleTimeString();
    document.getElementById("newActivityForm").style.display = "none";
    document.getElementById("activityStatus").style.display = "block";

    const activityData = {
        topic: document.getElementById("currentTopic").textContent,
        subtopic: document.getElementById("currentSubtopic").textContent,
        start_date: activityStartTime.toISOString()
    };

    fetch('http://localhost:8000/add_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            activityId = data.id; // Store the activity ID for later use
            console.log('Activity data sent successfully. Activity ID: ' + activityId);
        } else {
            console.error('Failed to send activity data to the server.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.getElementById("stopActivity").addEventListener("click", function() {
    // You can handle stopping the activity here, e.g., record end time or perform other actions.
    let endTime = new Date();
    let duration = (endTime - activityStartTime) / 1000; // Calculate the duration in seconds

    // Prepare the activity data for finishing the activity
    const finishActivityData = {
        end_date: endTime.toISOString()
    };

    // Send the data to the FastAPI server with the activity ID
    fetch(`http://localhost:8000/finish_activity/${activityId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(finishActivityData)
    })
    .then(response => {
        if (response.ok) {
            console.log('Activity finished successfully.');
        } else {
            console.error('Failed to finish the activity.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    alert("Activity stopped:\nTopic: " + document.getElementById("currentTopic").textContent +
          "\nSubtopic: " + document.getElementById("currentSubtopic").textContent +
          "\nStart Time: " + document.getElementById("startTime").textContent +
          "\nEnd Time: " + endTime.toLocaleTimeString() +
          "\nDuration (seconds): " + duration);

    // Clear the form fields
    document.getElementById("topic").value = "";
    document.getElementById("subtopic").value = "";

    // Reset the form and status section for the next activity
    document.getElementById("newActivityForm").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
});



// =======================================================================================

// JavaScript to toggle the display of the Add Previous Activity form
document.getElementById("add_previous_activity").addEventListener("click", function() {
    document.getElementById("addPreviousActivityForm").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
    document.getElementById("newActivityForm").style.display = "none";
});

// JavaScript to handle the submission of the Add Previous Activity form
document.getElementById("previousActivityForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    // Handle the addition of the previous activity (you can store this data as needed)
    const previousTopic = document.getElementById("previousTopic").value;
    const previousSubtopic = document.getElementById("previousSubtopic").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    
    alert("Previous activity added:\nTopic: " + previousTopic +
          "\nSubtopic: " + previousSubtopic +
          "\nStart Date and Time: " + startDate +
          "\nEnd Date and Time: " + endDate);
    
    // Reset the form
    document.getElementById("previousTopic").value = "";
    document.getElementById("previousSubtopic").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
});

// =======================================================================================


let pomodoroInterval;
let pomodoroStartTime;
let pomodoroDuration = 3; // 25 minutes in seconds
let pomodoroTopic;
let pomodoroSubtopic;

document.getElementById("page_pomodoro").addEventListener("click", function () {
    document.getElementById("pomodoroTimer").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
    document.getElementById("newActivityForm").style.display = "none";
});

document.getElementById("startPomodoro").addEventListener("click", function () {
    pomodoroTopic = document.getElementById("pomodoroTopic").value;
    pomodoroSubtopic = document.getElementById("pomodoroSubtopic").value;

    if (pomodoroTopic && pomodoroSubtopic) {
        pomodoroStartTime = new Date();
        document.getElementById("pomodoroTopic").disabled = true;
        document.getElementById("pomodoroSubtopic").disabled = true;
        document.getElementById("startPomodoro").disabled = true;
        startPomodoroTimer();
    } else {
        alert("Please enter Pomodoro Topic and Pomodoro Subtopic.");
    }
});

document.getElementById("stopPomodoro").addEventListener("click", function () {
    stopPomodoroTimer();
    displayPomodoroActivityInfo();
    resetPomodoroTimer();
});

function startPomodoroTimer() {
    pomodoroInterval = setInterval(function () {
        if (pomodoroDuration <= 0) {
            stopPomodoroTimer();
            displayPomodoroActivityInfo();
            resetPomodoroTimer();
        } else {
            updatePomodoroTimerDisplay();
            pomodoroDuration--;
        }
    }, 1000); // Update every 1 second
}

function stopPomodoroTimer() {
    clearInterval(pomodoroInterval);
}

function resetPomodoroTimer() {
    document.getElementById("pomodoroTopic").disabled = false;
    document.getElementById("pomodoroSubtopic").disabled = false;
    document.getElementById("startPomodoro").disabled = false;
    document.getElementById("timerDisplay").textContent = "25:00";
    pomodoroDuration = 1500; // Reset the timer duration
}

function updatePomodoroTimerDisplay() {
    const minutes = Math.floor(pomodoroDuration / 60);
    const seconds = pomodoroDuration % 60;
    document.getElementById("timerDisplay").textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function displayPomodoroActivityInfo() {
    const endTime = new Date();
    const duration = (endTime - pomodoroStartTime) / 1000; // Calculate the duration in seconds

    const message = `Pomodoro Timer stopped:\nTopic: ${pomodoroTopic}\nSubtopic: ${pomodoroSubtopic}\nStart Time: ${pomodoroStartTime.toLocaleTimeString()}\nEnd Time: ${endTime.toLocaleTimeString()}\nDuration (seconds): ${duration}`;
    alert(message);
}

// =======================================================================================

// Function to update the "List Not Dones" section with the fetched activities
function updateNotDonesList(notDones) {
    const notDoneActivitiesList = document.getElementById("notDoneActivities");
    notDoneActivitiesList.innerHTML = ''; // Clear the previous list

    notDones.forEach(activity => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `ID: ${activity.id}, Topic: ${activity.topic}, Subtopic: ${activity.subtopic}, Start Date: ${activity.start_date}`;
        // Create a delete button for each activity
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteActivity(activity.id); // Call the deleteActivity function with the activity ID
        });

        // Create an edit button for each activity
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            editActivity(activity); // Call the editActivity function with the activity ID
        });

        // Append the delete and edit buttons to the list item
        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);

        notDoneActivitiesList.appendChild(listItem);
    });

    // Display the "List Not Dones" section
    document.getElementById("listNotDones").style.display = "block";
}

// Function to delete an activity
function deleteActivity(activityId) {
    // Make an API request to delete the activity by its ID
    fetch(`http://localhost:8000/delete_activity/${activityId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log('Activity deleted successfully.');
            // Refresh the list of not completed activities after deletion
            fetchNotDones();
        } else {
            console.error('Failed to delete the activity.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Function to edit an activity
function editActivity(activity) {
    // Hide the listNotDones section
    document.getElementById("listNotDones").style.display = "none";
    
    // Display the edit form
    const editForm = document.getElementById("addPreviousActivityForm");
    editForm.style.display = "block";
    document.getElementById("activityStatus").style.display = "none";

    // Format the start_date for the edit form
    const formattedStartDate = activity.start_date.split('T')[0] + 'T' + activity.start_date.split('T')[1].split('.')[0];
    
    // Populate the form fields with the activity details
    document.getElementById("previousTopic").value = activity.topic;
    document.getElementById("previousSubtopic").value = activity.subtopic;
    document.getElementById("startDate").value = formattedStartDate;
    document.getElementById("endDate").value = activity.end_date || ''; // Set the value of end_date or an empty string


    // Add an event listener to handle the submission of the edit form
    editForm.addEventListener("submit", function(e) {
        e.preventDefault();

        // Get the edited data from the form
        const editedEndDate = document.getElementById("endDate").value;

        // Update the activity's end_date property with the edited data
        activity.end_date = editedEndDate;

        // Hide the edit form
        editForm.style.display = "none";

        // Implement the code to update the activity on the server (e.g., using a fetch request)
        // Send the edited data to the server for updating the activity
        const editedActivityData = {
            id: activity.id,
            end_date: editedEndDate
        };

        // Make a fetch request to update the activity on the server
        fetch(`http://localhost:8000/finish_activity/${activity.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editedActivityData)
        })
        .then(response => {
            if (response.ok) {
                console.log('Activity edited successfully.');
                // Refresh the list of not completed activities after editing
                fetchNotDones();
            } else {
                console.error('Failed to edit the activity.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}




// Function to fetch the list of not completed activities
function fetchNotDones() {
    fetch('http://localhost:8000/get_not_dones')
        .then(response => response.json())
        .then(data => {
            // Call the function to update the "List Not Dones" section
            updateNotDonesList(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Add an event listener for the "List Not Dones" option
document.getElementById("list_not_dones").addEventListener("click", fetchNotDones);










// Function to hide the specified elements
function hideElements(elements) {
    elements.forEach(element => {
        element.style.display = "none";
    });
}

// Add event listeners to the menu options
document.getElementById("start_new_activity").addEventListener("click", function() {
    hideElements([
        document.getElementById("addPreviousActivityForm"),
        document.getElementById("pomodoroTimer"),
        document.getElementById("listNotDones")
    ]);
    document.getElementById("newActivityForm").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
});

document.getElementById("add_previous_activity").addEventListener("click", function() {
    hideElements([
        document.getElementById("newActivityForm"),
        document.getElementById("pomodoroTimer"),
        document.getElementById("listNotDones")
    ]);
    document.getElementById("addPreviousActivityForm").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
});

document.getElementById("page_pomodoro").addEventListener("click", function () {
    hideElements([
        document.getElementById("newActivityForm"),
        document.getElementById("addPreviousActivityForm"),
        document.getElementById("listNotDones")
    ]);
    document.getElementById("pomodoroTimer").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
});

document.getElementById("list_not_dones").addEventListener("click", function () {
    hideElements([
        document.getElementById("newActivityForm"),
        document.getElementById("addPreviousActivityForm"),
        document.getElementById("pomodoroTimer")
    ]);
    fetchNotDones(); // Show the list of not completed activities
});
