====================================================================
SMART GRADUATION PROJECT MANAGEMENT SYSTEM (SGPMS)
====================================================================

--- SYSTEM OVERVIEW ---
SGPMS is a containerized, portal designed to streamline 
the graduation project lifecycle. It features role-based access, 
automated progress tracking, and an integrated AI assistant.

--- PREREQUISITES ---
Before running the system, please ensure you have the following installed:
1. Docker Desktop (Running in the background)
2. A modern web browser (Chrome, Edge, or Safari)

====================================================================
 HOW TO RUN THE SYSTEM (3 SIMPLE STEPS)
====================================================================

STEP 1: Open Your Terminal
Have your docker desktop running then Extract this project folder to your desktop. Open your Command Prompt 
(Windows) or Terminal (Mac), and navigate inside the extracted folder .

STEP 2: Start the Docker Environment
 Run the following command to automatically build the database, install 
dependencies, and start the backend servers:

======    docker-compose up --build   ===========

Wait approximately 1-2 minutes until the terminal shows that both 
ports (5000 and 5001) are actively running and listening.

STEP 3: Launch the User Interface
Once Docker is running, simply double-click the `project.html` file 
located in this folder to open the platform in your web browser.

====================================================================
 TEST LOGIN CREDENTIALS
====================================================================
The database has been seeded with test accounts for the committee 
to evaluate the different interface roles.

=====NOTE: Admin must first upload the student list either by the provided 'book2.csv' or manually for each student before logging in as a student==== 

1. ADMINISTRATOR ACCESS
   - Login ID: 9001
   - Password: 123456

2. STUDENT ACCESS(*many students in the database but we use one as an example*)
   - Login ID: 160370
   - Password: 123456

3. DOCTOR / SUPERVISOR ACCESS(*many doctors in the database but we use one as an example*)
   - Login ID: 16
   - Password: 123456
   - Access: View assigned groups, approve requests, and track progress.


