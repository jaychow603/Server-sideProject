const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection 
const mongoUri = 'mongodb+srv://chantszho2002:group381@ole.y9s0o.mongodb.net/?retryWrites=true&w=majority&appName=ole';
const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
}

connectDB();

// Routes
app.get('/', (req, res) => {
    res.render('login'); 
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = client.db('ole'); 
    const usersCollection = db.collection('users');

    
    const user = await usersCollection.findOne({ email, password });
    if (user && user.password == password) {
        if (user.role == 'teacher') {
            req.session.userId = user.Teacher_ID
            req.session.username = user.name
        } else if (user.role =='student'){
            req.session.userId = user.stud_id
            req.session.username = user.name
        }
        req.session.role = user.role;

        res.json({ message: 'Login successful', redirect: '/homepage',role:req.session.role });
    } else {
        res.send('Invalid email or password');
    }
});

app.get('/homepage', async (req, res) => {
    const db = client.db('ole');
    const userRole = req.session.role;
    if (!req.session.userId || !req.session.role) {
        return res.redirect('/');
    }
    try {
        let timetable = [];
        let userName = '';
        
        if (req.session.role === 'teacher') {
            const user = await db.collection('users').findOne({ Teacher_ID: req.session.userId });
            userName = user ? user.name : 'Teacher';
            timetable = await db.collection('courses').find({ Teacher_ID: req.session.userId }).toArray();
        } else if (req.session.role === 'student') {
            const user = await db.collection('users').findOne({ stud_id: req.session.userId });
            userName = user ? user.name : 'Student';
            if (!user || !user.subject) {
                console.error('User not found or no courses assigned');
                return res.redirect('/');
            }
            timetable = await db.collection('courses').find({ Course_ID: { $in: user.subject } }).toArray();
        }

        res.render('homepage', { timetable, userRole, username:req.session.username });
    } catch (error) {
        console.error('Error fetching timetable:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req, res) => { 
    req.session.destroy((err) => { 
        if (err) { 
            return res.redirect('/homepage');
        } 
        res.redirect('/'); 
    }); 
});

//=================================Part of Student===================================================
// Student Info Route
app.get('/student/info', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.redirect('/');
    }
    const user = await client.db('ole').collection('users').findOne({ stud_id: req.session.userId });
    res.render('studentinfo', { user });
});

// Change Password
app.post('/change-password', async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!req.session.userId || req.session.role !== 'student') {
        return res.redirect('/');
    }

    const user = await client.db('ole').collection('users').findOne({ stud_id: req.session.userId });

    if (user && user.password === currentPassword) {
        if (newPassword === confirmNewPassword) {
            await client.db('ole').collection('users').updateOne(
                { stud_id: req.session.userId },
                { $set: { password: newPassword } }
            );
            res.send('Password changed successfully!');
        } else {
            res.send('New password and confirmation do not match.');
        }
    } else {
        res.send('Current password is incorrect.');
    }
});

// Academic Records Route
app.get('/academic-record', async (req, res) => {
    if (!req.session.userId || req.session.role !== 'student') {
        return res.redirect('/');
    }
    console.log(req.session.userId)

    try {
        const academicRecords = await client.db('ole').collection('AcademicRecord').find({ stud_id: req.session.userId }).toArray();
        const studentSemester = await client.db('ole').collection('users').find({ stud_id: req.session.userId }).toArray();

        const courseIds = academicRecords.map(record => record.Course_ID);
        const coursesInformation = await client.db('ole').collection('courses').find({ Course_ID: { $in: courseIds } }).toArray();

        const Semester = studentSemester[0].year;

        const responseData = {
            records: academicRecords,
            coursesInformation: coursesInformation,
            Semester,
            username: req.session.username
        };

        if (academicRecords.length === 0) {
            responseData.message = 'No academic records found.';
        }

        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({responseData});
        } else {
            return res.render('academicrecord(student)', responseData);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving academic records.' });
    }
});
//================================Course Management(teacher)=========================
app.get('/course', async (req, res) => {
    const Role = req.session.role;

    if (!req.session.userId) {
        return res.redirect('/');
    }

    const db = client.db('ole');
    const coursesCollection = db.collection('courses');
    let courses = [];
    let teacher = [];

    function isTimeInRange(subjectTime, currentTime) {
        const [start, end] = subjectTime.split('-').map(t => {
            const [hours, minutes] = t.split(':').map(Number);
            return hours + (minutes / 60);
        });
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
        const currentTotalHours = currentHours + (currentMinutes / 60);
        return currentTotalHours >= start && currentTotalHours < end;
    }
    if (Role === 'teacher') {
        courses = await coursesCollection.find({ Teacher_ID: req.session.userId }).toArray();
    } else if (Role === 'student') {
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ stud_id: req.session.userId });

        if (user) {
            const subjectlist = user.subject; 
            courses = await coursesCollection.find({ Course_ID: { $in: subjectlist } }).toArray();
            teacher = await usersCollection.find({role:'teacher',subject: { $in: subjectlist}}).toArray();
        }
    }

    const processedCourses = courses.map(course => {
        return {
            ...course,
            fitsSchedule: (currentTime) => isTimeInRange(course.Time, currentTime)
        };
    });

    res.render('coursepage', {Teacher: teacher, courses: processedCourses, Role:req.session.role});
});

app.get('/course/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const userRole = req.session.role;
    const db = client.db('ole');
    const coursesCollection = db.collection('courses');
    const usersCollection = db.collection('users');

    const course = await coursesCollection.findOne({ Course_ID: courseId });
    if (!course) {
        return res.status(404).send('Course not found');
    }

    const enrolledStudents = await usersCollection.find({ role: "student" }).toArray();
    const students = await usersCollection.find({ role: "student" }).toArray();
    const filteredstudents = students.filter(student => !student.subject.includes(courseId));

    const studentsInCourse = enrolledStudents.filter(student => {
        return student.subject.includes(courseId);
    }).reduce((unique, student) => {
        if (!unique.some(s => s.stud_id === student.stud_id)) {
            unique.push(student);
        }
        return unique;
    }, []);

    res.render('courseDetail', {username: req.session.username ,userRole, course, enrolledStudents: studentsInCourse,filteredstudents });
});

app.post('/course/:courseId/assign-student', async (req, res) => {
    const { courseId } = req.params;
    const { studentId } = req.body;

    const db = client.db('ole');
    const usersCollection = db.collection('users');

    try {
        if (!studentId || isNaN(parseInt(studentId, 10))) {
            return res.status(400).json({ message: 'Valid student ID is required.' });
        }

        const numericStudentId = parseInt(studentId, 10);
        
        const updateResult = await usersCollection.updateOne(
            { stud_id: numericStudentId },
            { $addToSet: { subject: courseId } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const academicRecords = {
            stud_id: numericStudentId,
            Course_ID: courseId,
            assignment_score: 0,
            Exam_score: 0,
            test_score: 0,
            Grade: ''
        };

        await db.collection('AcademicRecord').insertOne(academicRecords);

        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({ message: `Course assign successful..`});
        } else {
            res.redirect(`/course/${courseId}`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while assigning the student to the course.' });
    }
});
app.delete('/course/:courseId/remove-student', async (req, res) => {
    const { courseId } = req.params;
    const { studentId } = req.body;

    const db = client.db('ole');
    const usersCollection = db.collection('users');

    try {
        if (!studentId || isNaN(parseInt(studentId, 10))) {
            return res.status(400).json({ message: 'Valid student ID is required.' });
        }

        const numericStudentId = parseInt(studentId, 10);
        
        const updateResult = await usersCollection.updateOne(
            { stud_id: numericStudentId },
            { $pull: { subject: courseId } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const deleteResult = await db.collection('AcademicRecord').deleteOne({
            stud_id: numericStudentId,
            Course_ID: courseId
        });

        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ message: 'No academic record found to delete.' });
        }
        
        res.json({ message: `Student ${numericStudentId} removed from course ${courseId} successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while removing the student from the course.' });
    }
});

//===================================Academic Record Part=====================================
app.get('/academic-record/:courseId', async (req, res) => {
    const courseId = req.params.courseId;
    const userRole = req.session.role;
    const db = client.db('ole');

    try {
        if (!courseId) {
            return res.status(400).render('error', { message: 'Course ID is required.' }); 
        }

        const usersCollection = db.collection('users');
        const courseStudents = await usersCollection.find({ subject: courseId, role: 'student' }).toArray();

        if (courseStudents.length === 0) {
            return res.status(404).render('error', { message: 'No students found for this course.' });
        }


            res.render('academicRecord', {userRole, students: courseStudents, courseId , username:req.session.username});
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'An error occurred while retrieving academic records.' });
    }
});

app.get('/academic-record/detail/:studId', async (req, res) => {
    const studId = parseInt(req.params.studId, 10);
    const courseId = req.query.courseId;
    const userRole = req.session.role;
    const db = client.db('ole');

    try {
        if (isNaN(studId)) {
            return res.status(400).render('error', { message: 'Invalid student ID.' });
        }
        if (!courseId) {
            return res.status(400).render('error', { message: 'Course ID is required.' });
        }

        const academicCollection = db.collection('AcademicRecord');
        const academicRecord = await academicCollection.findOne({ stud_id: studId, Course_ID: courseId });

        if (!academicRecord) {
            return res.status(404).render('error', { message: 'No academic record found for this student and course.' });
        }

        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({ message: `StudentID: ${studId}'s is found.`, AcademicRecord: academicRecord});
        } else {
            res.render('studentAcademicRecord', {userRole, record: academicRecord ,courseId, username:req.session.username});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'An error occurred while retrieving the academic record.' });
    }
});

app.put('/academic-record/update', async (req, res) => {
    const db = client.db('ole');
    const { studId, CourseID, assignmentScoreEdit, testScoreEdit, examScoreEdit, gradeEdit } = req.body;

    try {
        // Validate required fields
        if (!studId || !CourseID) {
            return res.status(400).json({ message: 'Student ID and Course ID are required.' });
        }

        // Prepare the updated record
        const updatedRecord = {
            assignment_score: parseFloat(assignmentScoreEdit),
            test_score: parseFloat(testScoreEdit),
            Exam_score: parseFloat(examScoreEdit),
            Grade: gradeEdit
        };

        // Update the record in the database
        const result = await db.collection('AcademicRecord').updateOne(
            { stud_id: parseInt(studId, 10), Course_ID: CourseID },
            { $set: updatedRecord }
        );

        // Check for matching record
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No academic record found to update.' });
        }

        // Send a success response
        return res.json({ message: `StudentID: ${studId}'s Academic Record updated successfully.` });

    } catch (error) {
        console.error('Error updating academic record:', error);
        res.status(500).json({ message: 'An error occurred while updating the academic record.' });
    }
});
//==================================Student management(Teacher)================================================
app.get('/student', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    const db = client.db('ole');
    const usersCollection = db.collection('users');
    const students = await usersCollection.find({ role: 'student' }).toArray(); 
    const teachers = await usersCollection.find({ role: 'teacher' }).toArray(); 
    const user = await usersCollection.findOne({ stud_id: req.session.userId }) || await usersCollection.findOne({ Teacher_ID: req.session.userId }); 
    const userName = user ? user.name : 'Unknown User'; 
    const userRole = req.session.role
    
    if (students.length === 0) {
            responseData.message = 'No students found.';
        }

        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({message:'Sucessful to get all student',Students: students});
        } else {
            return res.render('studentmanage', { students, teachers, username:req.session.username ,userRole});
        }
});

app.post('/create-student', async (req, res) => {
    const db = client.db('ole');
    const { name, email, year, password, subject } = req.body;

    try {
        if (!name || !email || !year || !password || !subject) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingStudent = await db.collection('users').findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'A student with this email already exists.' });
        }

        const lastStudent = await db.collection('users')
            .find()
            .sort({ stud_id: -1 })
            .limit(1)
            .toArray();

        const newStudId = lastStudent.length > 0 ? lastStudent[0].stud_id + 1 : 1;
        const newyear = parseInt(year, 10);
        const subjectArray = subject.split(',').map(sub => sub.trim());

        const newStudent = {
            stud_id: newStudId,
            name,
            email,
            role: 'student',
            subject: subjectArray,
            year: newyear,
            password
        };

        await db.collection('users').insertOne(newStudent);

        const academicRecords = subjectArray.map(courseId => ({
            stud_id: newStudId,
            Course_ID: courseId,
            assignment_score: 0,
            Exam_score: 0,
            test_score: 0,
            Grade: ''
        }));

        await db.collection('AcademicRecord').insertMany(academicRecords);

        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({ message: `Student: ${name} with ID: ${newStudId} created successfully.` });
        } else {
            const db = client.db('ole');
    	    const usersCollection = db.collection('users');
            const students = await usersCollection.find({ role: 'student' }).toArray(); 
    	    const teachers = await usersCollection.find({ role: 'teacher' }).toArray(); 
            return res.render('studentmanage', { students, teachers, username: req.session.username, userRole: req.session.role });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the student.' });
    }
});

app.delete('/remove-student', async (req, res) => {
    const db = client.db('ole');
    const { stud_id } = req.body;

    try {
        if (!stud_id) {
            return res.status(400).json({ message: 'Student ID is required.' });
        }

        const parsedStudId = parseInt(stud_id, 10);

        const student = await db.collection('users').findOne({ stud_id: parsedStudId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        await db.collection('users').deleteOne({ stud_id: parsedStudId });

        await db.collection('AcademicRecord').deleteMany({ stud_id: parsedStudId });
        
        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            return res.json({ message: `Student with ID ${stud_id} removed successfully.` });
        } else {
            const students = await db.collection('users').find({ role: 'student' }).toArray(); 
    	    const teachers = await db.collection('users').find({ role: 'teacher' }).toArray(); 
            return res.render('studentmanage', {  students, teachers, username: req.session.username, userRole: req.session.role });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while removing the student.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
