import User from '../model/User.js';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
import nodemailer from 'nodemailer';

//Global Variable decalration fro OTP
var OTP;

//Register User
export const register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      confirmpassword,
      isadmin,
    } = req.body;
    const role = await User.findOne({ email });
    if (role) {
      return res.status(201).json({ status: false, message: 'Already Taken' });
    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = await User.create({
        firstname,
        lastname,
        username,
        email,
        password: hashedPassword,
        confirmpassword: hashedPassword,
        isadmin,
      });
      return res.status(200).json({
        status: true,
        message: 'User registered successfully',
        newUser,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

//Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(201)
        .json({ status: false, message: 'Please fill all the details' });
    }
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res
        .status(201)
        .json({ status: false, message: 'Invalid EmailId or Password' });
    } else {
      const validPass = await bcrypt.compare(password, existUser.password);
      if (!validPass) {
        return res
          .status(201)
          .json({ status: false, message: 'Password Invalid' });
      } else {
        const token = await JWT.sign({ email: email }, process.env.JWT_SECRET, {
          expiresIn: '30d',
        });
        return res.status(200).json({
          message: 'Login Successfully',
          name: existUser.username,
          email: existUser.email,
          token,
        });
      }
    }
  } catch (error) {
    return res.status(200).json({
      status: false,
      message: 'Something went wrong in Login',
      error,
    });
  }
};

//Forget Password
export const forgetPassword = async function (req, res) {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return req
        .status(201)
        .json({ status: false, message: 'EmailId not found' });
    } else {
      const token = JWT.sign({ email: email }, process.env.JWT_SECRET);
      OTP = Math.floor(1000 + Math.random() * 9000);
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'gowthampostbox30@gmail.com',
          pass: process.env.MAIL_KEY,
        },
      });

      var mailOptions = {
        from: 'gowthampostbox30@gmail.com',
        to: existingUser.email,
        subject: `Hi ${existingUser.username}`,
        html: `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Document</title>
            </head>
            <body>
            <h3>Hi ${existingUser.username},</h3> 
            <h3>You can Reset Your Password using Below OTP</h3>
             <h1>${OTP}</h1>
             <h3>Happy a great Day</h3>
             <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0WHULTTwC0Jv6LKKzuWVNpabSm6WfTYgJ1qunm_5CROShy12liRHNLU7ismj6fdukyfs&usqp=CAU' width:"200px" height:"200px"/>
            </body>
            </html>
            `,
      };

      transporter.sendMail(mailOptions, function (error) {
        if (error) {
          return res
            .status(205)
            .json({ status: false, message: 'Error in Sending OTP' });
        } else {
          return res.status(201).json({
            status: true,
            message: 'OTP Sended SuccessFully',
            data: token,
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: 'Something went wrong',
      error,
    });
  }
};

//Verify with OTP
export const verifyOtp = async (req, res) => {
  try {
    const { UserOTP } = req.body;
    if (UserOTP == OTP) {
      res.status(200).json({ status: true, message: 'OTP is Verified' });
    } else {
      res.status(200).json({ status: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: false,
      message: 'Something went wrong',
      error,
    });
  }
};

//Reset the Password
export const resetPassword = async (req, res) => {
  try {
    const { password, confirmpassword, token } = req.body;
    const verify = JWT.verify(token, process.env.JWT_SECRET);
    const email = verify.email;

    if (password === confirmpassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await User.updateOne(
        {
          email: email,
        },
        {
          $set: {
            password: hashedPassword,
          },
        }
      );

      return res.status(201).json({
        status: true,
        message: 'Password has been Reset Successfully',
      });
    } else {
      return res.status(400).json({
        status: false,
        message: 'Password and Confirm Password do not match',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: 'Something went wrong',
      error,
    });
  }
};
