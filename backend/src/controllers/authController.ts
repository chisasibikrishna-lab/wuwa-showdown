import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config/env";

const generateAvatar = (name: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if exists
    const existing = await User.findOne({ $or: [{ email }, { name }] });
    if (existing) {
      return res.status(400).json({ error: "Email or name already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default everyone to player unless admin requested specifically (can be upgraded later)
    const userRole = role === "admin" ? "admin" : "player";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      avatar: generateAvatar(name)
    });

    res.status(201).json({ message: "Operator registered successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, avatar: user.avatar, score: user.totalScore },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        score: user.totalScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
   const authHeader = req.headers.authorization;
   if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
   
   const token = authHeader.split(" ")[1];
   try {
     const decoded: any = jwt.verify(token, config.JWT_SECRET);
     const user = await User.findById(decoded.id).select("-password");
     if (!user) return res.status(404).json({ error: "User not found" });
     
     res.json({ 
       user: {
         id: user._id,
         name: user.name,
         email: user.email,
         role: user.role,
         avatar: user.avatar,
         score: user.totalScore
       } 
     });
   } catch {
     res.status(401).json({ error: "Invalid token" });
   }
};
