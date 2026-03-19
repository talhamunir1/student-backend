const cors = require('cors')
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

// ⭐ CONNECT DATABASE
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err))


// ⭐ SCHEMA
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const Student = mongoose.model("Student", studentSchema)


// ⭐ SEED API → Insert 5 Students
app.get('/seed', async (req, res) => {

  try {

    await Student.deleteMany()

    const students = await Student.insertMany([
      { name: "Ali" },
      { name: "Sara" },
      { name: "Waqas" },
      { name: "Ahmed" },
      { name: "Usman" }
    ])

    res.json({
      message: "5 Students Inserted",
      students
    })

  } catch (err) {
    res.status(500).json({ message: "Seed Error" })
  }

})


// ⭐ POST → Create Student
app.post('/students', async (req, res) => {

  try {

    const student = new Student({
      name: req.body.name
    })

    await student.save()

    res.json({
      message: "Student Saved",
      student
    })

  } catch {
    res.status(500).json({ message: "Error Saving Student" })
  }

})


// ⭐ GET ALL
app.get('/students', async (req, res) => {

  const students = await Student.find()

  res.json(students)

})


// ⭐ GET BY ID
app.get('/students/:id', async (req, res) => {

  try {

    const student = await Student.findById(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student Not Found" })
    }

    res.json(student)

  } catch {
    res.status(400).json({ message: "Invalid ID" })
  }

})


// ⭐ DELETE
app.delete('/students/:id', async (req, res) => {

  try {

    const student = await Student.findByIdAndDelete(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student Not Found" })
    }

    res.json({
      message: "Student Deleted",
      student
    })

  } catch {
    res.status(400).json({ message: "Invalid ID" })
  }

})


// ⭐ PUT → FULL UPDATE
app.put('/students/:id', async (req, res) => {

  try {

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    )

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student Not Found" })
    }

    res.json({
      message: "Student Fully Updated",
      student: updatedStudent
    })

  } catch {
    res.status(400).json({ message: "Invalid ID" })
  }

})


// ⭐ PATCH → PARTIAL UPDATE
app.patch('/students/:id', async (req, res) => {

  try {

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student Not Found" })
    }

    res.json({
      message: "Student Partially Updated",
      student: updatedStudent
    })

  } catch {
    res.status(400).json({ message: "Invalid ID" })
  }

})


const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT)
})