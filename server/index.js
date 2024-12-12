const express = require('express');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors(
  {
    origin:["https://deploy-Busi-Connect.vercel.app"],
    methods:["POST","GET"],
    credentials:true
          
const PORT = process.env.PORT || 5000;

const MONGO_URI = "mongodb+srv://saivarma:12345@cluster0.eu34b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const SECRET_KEY = 'varma_busi-connect';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  contactInfo: { type: String, required: true },
}, { collection: 'postInfo' });

const PostInfo = mongoose.model('PostInfo', postSchema);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.get('/', (req, res) => {
  res.send('Welcome to Busi Connect Backend with MongoDB!');
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

app.post('/post', authenticateToken, async (req, res) => {
  const { title, description, category, contactInfo } = req.body;

  try {
    const newPost = new PostInfo({ title, description, category, contactInfo });
    await newPost.save();
    res.status(201).json({ message: "Post submitted successfully." });
  } catch (error) {
    console.error("Error submitting post:", error);
    res.status(500).json({ message: "Failed to submit the post. Please try again." });
  }
});

app.get('/Posts', async (req, res) => {
  try {
    const posts = await PostInfo.find();
    res.status(200).json(posts);
  } catch (err) {
    console.error('Error retrieving posts:', err);
    res.status(500).json({ message: 'Failed to retrieve posts', error: err });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
