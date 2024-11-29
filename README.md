# 381F Server-sideProject
# Cloud URL
https://s381f-project-group38.onrender.com/
# Project Info
# Project Name
Online Learning platform

# Group Information
- Group No: 38
- **Student Name and Student ID:**
  - Chow Chun Ting (13342640)
  - Chan Tsz Ho (13242991)
  - CHU SIK HIN (13372042)
  - Wong Ho Yin (13476027)
  - Yau Wing Yan (12291373)

# Project Overview
The online learning platform is designed to let teacher and student manage and store their academic online. It provides serval functions including checking academic record, studing subject and time table.

`server.js`:
 - Dependencies: Imports required packages like express, body-parser, and others. Also imports custom modules like connectDB.

 `package.json`:
- body-parser(`^1.20.3`):Body-parser parses is an HTTP request body that usually helps when you need to know more than just the URL being hit.
- ejs(`^3.1.10`):A simple templating language to generate HTML with plain JavaScript
- express(`^4.21.1`): A popular Node.js web framework for building web applications and APIs.
- express-session(`1.18.1`):The express-session middleware allows the creation and storage of the session data used for authentication or user preferences
- mongodb(`^6.10.0`):MongoDB is a source-available, cross-platform, document-oriented database program.

`public folder`:
- 1.Image folder:It includes the image that we used in the website.
- 2.stylesheets:It includes every css file of the ejs files of the `views folder`

`views folder`:
1. academicRecord.ejs
2. academicrecord(student).ejs
3. courseDetail.ejs
4. coursepage.ejs
5. header.ejs
6. homepage.ejs
7. login.ejs
8. studentAcademicRecord.ejs
9. studentinfo.ejs
10. studentmanage.ejs

## Install
Download the file `Server-SideProject.zip` and unzip it.
Before start the server, pls use `npm install` function to install the package first.

## Usage


1.Login/Logout Pages
 - Login information: Different role have a different formal of login account. Student is `xxxxx@hkmu.edu.hk` and Teacher is `xxxxx@hkmu.teacher.edu.hk`
 - Sign-In Steps:
 1.Access the login page:Open the `login.ejs` to the login page.
 2.Input your account and password according to your role.
 3.Click the login button.
 4.If your account and password is correct, you will be redirected to homepage (`homepage.ejs`).
 -**logout**:Use the logout button, it wilkl redirects the user to login page(`login.ejs`).

2.Functions on web pages(student)
  - **Courses**:Click the `courses` in the header will redirect to the course schedule (`coursepage.ejs`).In course page, the course is showed on the timetable according to the user's learning courses.
  - **Academic Record**:Click the `Academic Record` will redirect to the term summary (`academicrecord(student).ejs`).There show the current information of user.
  - **Profile**:Click the `profile` redirect to the personal information and password setting page(`studentinfo.ejs`).There are boxes for user to enter their password and new password and it will correct the data in the database by pressing `change password`.

3.Functions on web pages(teacher)
 - **Courses**:Click the `courses` in the header will redirect to the course schedule (`coursepage.ejs`).In course page, the course is showed on the timetable according to the user's learning courses.
   -There are the course arrcording to the teacher is teaching.Teacher can go into the student academic record(`academicrecord(teacher).ejs`) .There allows teacher change the data of students here to the database.
   
 - **Students Management**:Click the `Students Management` will redirect to the student list(`studentmanage.ejs`).Here allow the user remove or add student into the class by `Create Student` or `Remove`.


# API Documentation
**Base URL**
https://s381f-project-group38.onrender.com/

Start the server with:
```bash
node server.js
```
#### POST `/login`
- **Description**: Authenticates a user and initiates a session.
- **Request Body:**
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
  - **Response:**
  - **200 OK:**
    ```json
    {
      "message": "Login successful",
      "redirect": "/homepage",
      "role": "teacher"// or "student"
    }
    ```
  - 401 Unauthorized: Invalid email or password
 
#### POST `/api/auth/logout`
- **Description**: Logs out the authenticated user and terminates the session.
- **Response:**
  - **200 OK:**
    ```json
    {
      "message": "logout successful"
    }
    ```

### POST /change-password
 - **Description**:Change password for the cuurrent user
 - **Request Body:**
  ```json
  {
       "currentPassword": "string",
       "newPassword": "string",
       "confirmNewPassword": "string"
  }
   ```
- **Response:**
  - **200 OK:**:Password changed successfully!
  - **400 Bad Request**:New password and confirmation do not match.
  - **401 Unauthorized**:Current password is incorrect.

### GET /academic-record
- **Description**:Direct to the academic record page.
- **Response:**
  - **200 OK:**:Direct to the academic record page.
 
### Student management 

  ## POST /create-student
  - **Description**:Create new student data
    - Form-data Example:
      -  
    ```json
    {
        "name": "string",
        "email": "string",
        "year": "int",
        "password": "string",
        "subject": "string"
    }
     ```
  - **Authentication**: Admin required.

## DELETE /remove-student
- **Description**:Delete the data of student
   ```
     { 
         "stud_id": "int" 
    }
    ```
    - **Response:**
      - **200 OK:**
        ```json
        {
          "message": "Student with ID removed successfully."
        }
          ```
   - 400 Bad Request：Student ID is needed.
   - 404 Not Found：Student is not found.


# API Test

## Login
### Student Account
- **Email**: peter@hkmu.edu.hk
- **Password**: peterchan123

### Teacher Account
- **Email**: Daniel@hkmu.teacher.edu.hk
- **Password**: daniellee456
  
Authenticate users using CURL tests
```text
curl -X POST http://your-api-url/login \
-H "Content-Type: application/json" \
-d '{"email": "email@example.com", "password": "password"}'
-c cookies.txt
```
**Response:**
```json
{"message":"Login successful","redirect":"/homepage","role":"student"}
```

# Student Side
## Change password for student
To let logged student's to change password
```text
curl -X POST "http://your-api-url/change-password" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
    "currentPassword": "current_password",
    "newPassword": "new_password",
    "confirmNewPassword": "new_password"
}' \
-b cookies.txt
```
**Response:**
```
Password changed successfully!
```

# Teacher Side
## Student management
To manage the student
1. Remove student
2. Create Student
CURL Testing: Remove student
```text
curl -X DELETE http://your-api-url/remove-student \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
    "stud_id": "student_ID"
}' \
-b cookies.txt
```

**Response:**
```
{"message":"Student with ID 23 removed successfully."}
```



CURL Testing: Create Student
```text
curl -X POST http://your-api-url/create-student \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
    "name": "new_student_name",
    "email": "new_student_email",
    "year": "year",
    "password": "new_password",
    "subject": "S106, S107"
}' \
-b cookies.txt
```
**Response:**
```
{"message":"Student: Test3 with ID: 23 created successfully."}
```


## Course management
To manage the course
1. Assign or Remove Student to course
2. Student Academic Record Management

## Assign or Remove Student to course
### CURL Testing: Assign Student to course
```text
curl -X POST "http://your-api-url/course/course_ID/assign-student" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
    "studentId": "Student_ID"
}' \
-b cookies.txt
```
**Response:**
```
{"message":"Course assign successful.."}}
```


### CURL Testing: Remove Student from Course_ID
```text
curl -X DELETE "http://your-api-url/course/Course_ID/remove-student" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
    "studentId": "Student_ID"
}' \
-b cookies.txt
```
**Response:**
```
{"message":"Student {Student_ID} removed from course {Course_ID} successfully."}
```

## Student Academic Record Management
### CURL Testing: Student's Academic Record from this Course_ID
```text
curl -X GET "http://your-api-url/academic-record/detail/Student_ID?courseId=Course_ID" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-b cookies.txt
```
**Response:**
```
{"message":"StudentID: {Student_ID}'s is found.","AcademicRecord":{"_id":"RecordID","stud_id":Student_ID,"assignment_score":85,"Exam_score":95,"test_score":90,"Grade":"A","Course_ID":"{Course_ID}"}
```


### CURL Testing: Student's Academic Record from this Course_ID
```text
curl -X PUT "http://your-api-url/academic-record/update" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
    "studId": "Student_ID",
    "CourseID": "Course_ID",
    "assignmentScoreEdit": "assignment__Score",
    "testScoreEdit": "test_Score",
    "examScoreEdit": "exam_Score",
    "gradeEdit": "Final_Grade"
}' \
-b cookies.txt
```

**Response:**
```
{"message":"StudentID: {Student_ID}'s Academic Record updated successfully."}
```
