require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
app.use(cors())
app.use(express.json())

// ⭐ DB CONNECT
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err))

// ⭐ MODELS
const studentSchema = new mongoose.Schema({
  name: String
})

const Student = mongoose.model("Student", studentSchema)

const userSchema = new mongoose.Schema({
  email: String,
  password: String
})

const User = mongoose.model("User", userSchema)

// ⭐ AUTH MIDDLEWARE
const auth = (req, res, next) => {

  const header = req.headers.authorization

  if (!header) {
    return res.status(401).json({ message: "No token" })
  }

  const token = header.startsWith("Bearer ")
    ? header.split(" ")[1]
    : header

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}

// ⭐ SIGNUP
app.post('/signup', async (req, res) => {

  const hashed = await bcrypt.hash(req.body.password, 10)

  await User.create({
    email: req.body.email,
    password: hashed
  })

  res.json({ message: "User Created" })
})

// ⭐ LOGIN
app.post('/login', async (req, res) => {

  const user = await User.findOne({ email: req.body.email })

  if (!user) return res.status(401).json({ message: "User not found" })

  const match = await bcrypt.compare(req.body.password, user.password)

  if (!match) return res.status(401).json({ message: "Wrong password" })

  const token = jwt.sign({ userId: user._id }, "secret123", { expiresIn: "1h" })

  res.json({ token })
})

// ⭐ SEED
app.get('/seed', async (req, res) => {

  await Student.deleteMany()

  const students = await Student.insertMany([
    { name: "Ali" },
    { name: "Sara" },
    { name: "Waqas" }
  ])

  res.json(students)
})

// ⭐ CREATE STUDENT
app.post('/students', auth, async (req, res) => {

  const student = await Student.create({
    name: req.body.name
  })

  res.json(student)
})

// ⭐ GET ALL
app.get('/students', auth, async (req, res) => {

  const students = await Student.find()

  res.json(students)
})

// ⭐ GET BY ID
app.get('/students/:id', auth, async (req, res) => {

  const student = await Student.findById(req.params.id)

  res.json(student)
})

// ⭐ DELETE
app.delete('/students/:id', auth, async (req, res) => {

  await Student.findByIdAndDelete(req.params.id)

  res.json({ message: "Deleted" })
})

// ⭐ UPDATE FULL
app.put('/students/:id', auth, async (req, res) => {

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  )

  res.json(student)
})

// ⭐ PATCH
app.patch('/students/:id', auth, async (req, res) => {

  const student = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.json(student)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log("Server running"))