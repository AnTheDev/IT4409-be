const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

const app = express();
// Middleware 
app.use(cors());
app.use(express.json());
// Kết nối MongoDB với username là MSSV, password là MSSV, dbname là it4409
// ConnectDB
mongoose.connect(process.env.uri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên không được để trống'],
    minlength: [2, 'Tên phải có ít nhất 2 ký tự']
  },
  age: {
    type: Number,
    required: [true, 'Tuổi không được để trống'],
    min: [0, 'Tuổi phải >= 0'],
    validate: Number.isInteger,
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    unique: true
  },
  address: {
    type: String
  }
});

const User = mongoose.model("User", UserSchema);

// CRUD

// CREATE
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ
app.get("/api/users", async (req, res) => {
  try {
    // Lấy query params 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    // Tạo query filter cho search 
    const filter = search
      ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { address: { $regex: search, $options: "i" } }
        ]
      }
      : {};
    // Tính skip 
    const skip = (page - 1) * limit;
    // Query database song song với Promise.all
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit);
    // Trả về response 
    res.json({
      page,
      limit,
      total,
      totalPages,
      data: users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// UPDATE
app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Không tìm thấy người dùng" });
    res.json({
      message: "Cập nhật người dùng thành công",
      data: updatedUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE
app.delete('/api/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Không tìm thấy người dùng" });
    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(400).json({ error: err.message });
  }
});


// Start server 
app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
