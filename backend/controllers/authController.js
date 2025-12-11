import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
export const registerUser = async (req, res) => {
  try {
    const { name, email, password,role } = req.body;

    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res.status(400).json({ message: `User already exists with email "${email}" and role "${role}"` });
    }
    const count = await User.countDocuments();
    const userId = String(count + 1).padStart(3, "0");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userId,
      name,
      email,
      role,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        userId: user.userId,
        id:user._id,
        name: user.name,
        role:user.role,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password,role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });
    if (role && user.role !== role) {
      return res.status(403).json({
        message: `Access denied. User does not have the role "${role}"`,
      });
    }
      const token = jwt.sign(
      { userId: user._id, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
        success: true,
        message: "Login Successful",
        token,
        user: {
            id : user._id,
            userId: user.userId,
            name:user.name,
            email:user.email,
            role: user.role,
        },
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`);
    const googleUser = await response.json();

    if (!googleUser.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // Create new user
      const count = await User.countDocuments();
      const userId = String(count + 1).padStart(3, "0");

      user = await User.create({
        userId,
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        avatar: googleUser.picture,
        role: 'student'
      });
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleUser.id;
      user.avatar = googleUser.picture;
      await user.save();
    }

    const jwtToken = jwt.sign(
      { userId: user._id, id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Google authentication successful",
      token: jwtToken,
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};