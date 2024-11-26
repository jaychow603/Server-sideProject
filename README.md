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


 `package.json`:
- body-parser(`^1.20.3`):Body-parser parses is an HTTP request body that usually helps when you need to know more than just the URL being hit.
- ejs(`^3.1.10`):A simple templating language to generate HTML with plain JavaScript
- express(`^4.21.1`): A popular Node.js web framework for building web applications and APIs.
- express-session(`1.18.1`):The express-session middleware allows the creation and storage of the session data used for authentication or user preferences
- mongodb(`^6.10.0`):MongoDB is a source-available, cross-platform, document-oriented database program.

`public folder`:


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

## Usage
Start the server with:
```bash
npm start
```
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
