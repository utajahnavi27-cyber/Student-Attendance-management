const STORAGE_KEY = "attendanceStudents";

let students = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// Get today's date
function getToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Save students
function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// Add student
function addStudent(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const roll = document.getElementById("roll").value.trim();

    if (name === "" || roll === "") {
        alert("Please enter student name and roll number.");
        return;
    }

    const exists = students.some(student => student.roll === roll);

    if (exists) {
        alert("Roll number already exists.");
        return;
    }

    const student = {
        name: name,
        roll: roll,
        joinedOn: getToday(),
        attendance: {}
    };

    students.push(student);

    saveStudents();

    document.getElementById("name").value = "";
    document.getElementById("roll").value = "";

    renderStudents();
}

// Change today's attendance
function toggleAttendance(index) {
    const today = getToday();

    if (!students[index].attendance) {
        students[index].attendance = {};
    }

    const current = students[index].attendance[today];

    if (current === "Present") {
        students[index].attendance[today] = "Absent";
    } else {
        students[index].attendance[today] = "Present";
    }

    saveStudents();
    renderStudents();
}

// Delete student
function deleteStudent(index) {
    if (!confirm("Delete this student?")) {
        return;
    }

    students.splice(index, 1);

    saveStudents();
    renderStudents();
}

// Calculate attendance percentage
function getPercentage(student) {
    const dates = Object.keys(student.attendance || {});

    if (dates.length === 0) {
        return 0;
    }

    let presentDays = 0;

    dates.forEach(date => {
        if (student.attendance[date] === "Present") {
            presentDays++;
        }
    });

    return Math.round((presentDays / dates.length) * 100);
}

// Display students
function renderStudents() {
    const tableBody = document.getElementById("studentList");

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    const today = getToday();

    // Display today's attendance date
    const dateElements = document.querySelectorAll("p");

    dateElements.forEach(function (element) {
        if (element.textContent.includes("Attendance Date:")) {
            element.textContent = "Attendance Date: " + today;
        }
    });

    let presentCount = 0;
    let absentCount = 0;

    students.forEach((student, index) => {

        // Make sure attendance object exists
        if (!student.attendance) {
            student.attendance = {};
        }

        const status = student.attendance[today] || "Absent";

        if (status === "Present") {
            presentCount++;
        } else {
            absentCount++;
        }

        const row = tableBody.insertRow();

        // Roll number
        row.insertCell(0).textContent = student.roll;

        // Student name
        row.insertCell(1).textContent = student.name;

        // Status
        const statusCell = row.insertCell(2);

        const statusButton = document.createElement("button");

        statusButton.textContent = status;

        statusButton.className =
            status === "Present"
                ? "status-btn status-present"
                : "status-btn status-absent";

        statusButton.onclick = function () {
            toggleAttendance(index);
        };

        statusCell.appendChild(statusButton);

        // Attendance percentage
        const percentageCell = row.insertCell(3);

        percentageCell.textContent =
            getPercentage(student) + "%";

        // Delete button
        const actionCell = row.insertCell(4);

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.onclick = function () {
            deleteStudent(index);
        };

        actionCell.appendChild(deleteButton);
    });

    // Summary
    const totalElement =
        document.getElementById("totalStudents");

    const presentElement =
        document.getElementById("presentCount");

    const absentElement =
        document.getElementById("absentCount");

    if (totalElement) {
        totalElement.textContent = students.length;
    }

    if (presentElement) {
        presentElement.textContent = presentCount;
    }

    if (absentElement) {
        absentElement.textContent = absentCount;
    }
}

// When page loads
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("studentForm");

    if (form) {
        form.addEventListener("submit", addStudent);
    }

    renderStudents();
});