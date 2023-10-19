/**
 * @swagger
 * components:
 *   schemas:
 *     Cohort:
 *       type: object
 *       required:
 *         - cohortSlug
 *         - cohortName
 *         - programManager
 *         - leadTeacher
 *       properties:
*         cohortSlug: 
*           type: string
*         cohortName: 
*           type: string
*         program: 
*           type: string
*         format: 
*           type: string
*         campus:
*           type: string
*         startDate: 
*           type: string
*           format: date
*         endDate: 
*           type: string
*           format: date
*         inProgress: 
*           type: boolean
*         programManager: 
*           type: string
*         leadTeacher: 
*           type: string
*         totalHours: 
*           type: number
 *       example:
 *          _id: "616c4b4c649eaa001dd50f81"
 *          inProgress: false
 *          cohortSlug: "ft-wd-paris-2023-07-03"
 *          cohortName: "FT WD PARIS 2023 07"
 *          program: "Web Dev"
 *          campus: "Paris"
 *          startDate: "2023-07-03T00:00:00.000Z"
 *          endDate: "2023-09-08T00:00:00.000Z"
 *          programManager: "Sally Daher"
 *          leadTeacher: "Florian Aube"
 *          totalHours: 360
 */

/**
 * @swagger
 * tags:
 *   name: Cohort
 *   description: The cohorts managing API
 * /api/cohorts:
 *   post:
 *     summary: Create a new cohort
 *     tags: [Cohorts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cohort'
 *     responses:
 *       200:
 *         description: The created cohort.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       500:
 *         description: Some server error
 *
 */

const { errorHandler, notFoundHandler } = require("./middleware/errorhandler");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = 5005;

const bodyParser = require("body-parser");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// const cohorts = require('./data/cohorts.json');
// const students = require('./data/students.json');

const mongoose = require('mongoose')
const Student = require('./models/Student.model')
const Cohort = require('./models/Cohort.model')

mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then(x => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to MongoDB", err));


  

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...


// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();


// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(cors({origin:
  ["http://localhost:5173/",
  "http://localhost:5173"]
}))
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

// app.get('/api/cohorts', (req, res) => {
//   res.json(cohorts);
// });

// app.get('/api/students', (req, res) => {
//   res.json(students);
// });

app.get("/api/students", (req, res, next) => {
  
  Student.find({})
  .populate('cohort')
    .then((students) => {
      console.log(students);
      res.json(students);
    })
    .catch((error) => {
      next(error);
      /* console.error("Error while retrieving students ->", error);
      res.status(500).send({ error: "Failed to retrieve students" }); */
    });
});

app.post('/api/students', (req, res, next) => {
  const { firstName, lastName, email, phone, linkedinUrl, languages, program, background, image, cohort, projects } = req.body;
  Student.create(
    { firstName, lastName, email, phone, linkedinUrl, languages, program, background, image, cohort, projects }
  ).then(createdStudent => {
    res.status(201).json(createdStudent)
  }).catch((error) =>{
    next(error);
    /* res.status(500).json({message: 'Error while creating a Student'}) */
  })
})


app.get('/api/students/:studentId', (req, res, next) => {
  const { studentId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(studentId)){
    res.status(400).json({message: `Specified id is not valid`});
  }

  Student.findById(studentId)
  .populate('cohort')
  .then( (foundStudent) => {
    res.status(201).json(foundStudent)
  }).catch((error) =>{
    next(error);
    /* res.status(500).json({message: `Cannot find the student`}) */
  })

})


app.get('/api/students/cohort/:cohortId', (req, res, next) => {
    const { cohortId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cohortId)){
      res.status(400).json({message: `Specified id is not valid`});
    }

    Student.find({cohort: cohortId})
    .populate('cohort')
    .then((foundStudents) => {
      res.status(200).json(foundStudents)
    }).catch( (error) => {
      next(error);
      /* res.status(500).json({message: `Cannot find the students from this cohortid.`}) */
    })
})

app.put('/api/students/:studentId', (req, res, next) =>{
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)){
    res.status(400).json({message: `Specified id is not valid`});
  }

  Student.findByIdAndUpdate(studentId, req.body, {new: true})
  .then((updatedStudent) => {
    res.status(200).json(updatedStudent)
  }).catch((error) =>{
    next(error);
    /* res.status(500).json({message: `Update went wrong, ooops.`}) */
  })

})

// delete specific student
app.delete('/api/students/:studentId', (req, res, next) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)){
    res.status(400).json({message: `Specified id is not valid`});
  }

  Student.findByIdAndRemove(studentId)
  .then(() =>{
    res.status(201).json({message: `Student with ${studentId} has beeen deleted successfully`})
  }).catch(() =>{
    next(error);
    /* res.status(500).json({message: `Oops, nonono working.`}) */
  })
})



app.get("/api/cohorts", (req, res, next) => {
  Cohort.find(req.query)
    .then((cohorts) => {
      console.log(cohorts);
      res.json(cohorts);
    })
    .catch((error) => {
      next(error);
      /* console.error("Error while retrieving cohorts ->", error);
      res.status(500).send({ error: "Failed to retrieve cohorts" }); */
    });
});



app.get("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      res.status(404).json({ message: "Cohort not found" });
    } else {
      res.status(200).json(cohort);
    }
  } catch (error) {
    next(error);
    /* console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); */
  }
});


app.post("/api/cohorts", async (req, res, next) => {
  try {
    const newCohort = await Cohort.create(req.body);
    res.status(201).json({ cohort: newCohort });
  } catch (error) {
    next(error);
    /* console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); */
  }
});


app.put("/api/cohorts/:cohortId", async (req, res, next) => {
  const { cohortId } = req.params;
  try {
    const updatedCohort = await Cohort.findByIdAndUpdate(cohortId, req.body, { new: true });
    if (!updatedCohort) {
      res.status(404).json({ message: "Cohort not found" });
    } else {
      res.status(200).json({ cohort: updatedCohort });
    }
  } catch (error) {
    next(error);
    /* console.error(error);
    res.status(500).json({ error: "Internal Server Error" }); */
  }
});

// delete specific cohort
app.delete('/api/cohorts/:cohortId', async (request, response) => {
  const { cohortId } = request.params

  await Cohort.findByIdAndDelete(cohortId)
  response.status(202).json({ message: 'Cohort deleted' })
})

// START SERVER
const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "LogRocket Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "LogRocket",
        url: "https://logrocket.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5005",
      },
    ],
  },
  apis: ["./app.js"],
};

const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(errorHandler)
app.use(notFoundHandler)

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = server
