let activityStartTime;

// JavaScript to toggle the display of the Start New Activity form and handle form submission
document.getElementById("start_new_activity").addEventListener("click", function() {
    document.getElementById("newActivityForm").style.display = "block";
    document.getElementById("activityStatus").style.display = "none";
});

document.getElementById("activityForm").addEventListener("submit", function(e) {
    e.preventDefault();
    activityStartTime = new Date();
    document.getElementById("currentTopic").textContent = document.getElementById("topic").value;
    document.getElementById("currentSubtopic").textContent = document.getElementById("subtopic").value;
    document.getElementById("startTime").textContent = activityStartTime.toLocaleTimeString();
    document.getElementById("newActivityForm").style.display = "none";
    document.getElementById("activityStatus").style.display = "block";
});

// JavaScript to handle stopping the activity
document.getElementById("stopActivity").addEventListener("click", function() {
    // You can handle stopping the activity here, e.g., record end time or perform other actions.
    let endTime = new Date();
    let duration = (endTime - activityStartTime) / 1000; // Calculate the duration in seconds
    alert("Activity stopped:\nTopic: " + document.getElementById("currentTopic").textContent +
          "\nSubtopic: " + document.getElementById("currentSubtopic").textContent +
          "\nStart Time: " + document.getElementById("startTime").textContent +
          "\nEnd Time: " + endTime.toLocaleTimeString() +
          "\nDuration (seconds): " + duration);

    // Prepare the activity data in the specified format
    const activityData = {
        topic: document.getElementById("currentTopic").textContent,
        subtopic: document.getElementById("currentSubtopic").textContent,
        start_date: activityStartTime.toISOString(),
        end_date: endTime.toISOString()
    };

    // Send the data to the FastAPI server
    fetch('http://localhost:8000/add_activity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData)
    })
    .then(response => {
        if (response.ok) {
            console.log('Activity data sent successfully.');
        } else {
            console.error('Failed to send activity data to the server.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
    // Clear the form fields
    document.getElementById("topic").value = "";
    document.getElementById("subtopic").value = ""
    
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


