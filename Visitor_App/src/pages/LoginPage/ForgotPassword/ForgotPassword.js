import { useState } from "react";
import { IoIosMail } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { LuKeyRound } from "react-icons/lu";
import { Form, Button } from "react-bootstrap";
import '../ForgotPassword/ForgotPassword.css'
import { SERVER_PORT } from '../../../constant';


const ForgotPassword = ({ setCurrentForm }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordSuggestions, setPasswordSuggestions] = useState([]);
  const [showStrengthIndicator, setShowStrengthIndicator] = useState(false);
  const [passwordLengthMet, setPasswordLengthMet] = useState(false);



  const calculatePasswordStrength = (password) => {
    let strength = 0;
    let suggestions = [];
    const criteria = [
      { regex: /.{8,}/, message: "At least 8 characters long" },
      { regex: /[a-z]/, message: "Include lowercase letters" },
      { regex: /[A-Z]/, message: "Include uppercase letters" },
      { regex: /\d/, message: "Include numbers" },
      { regex: /[@$!%*?&]/, message: "Include special characters (eg: @, &, %, etc.)" }
    ];

    criteria.forEach(({ regex, message }) => {
      if (!regex.test(password)) {
        suggestions.push(message);
      } else {
        strength++;
      }
    });

    return { strength, suggestions };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setShowStrengthIndicator(true);

    const { strength, suggestions } = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    setPasswordSuggestions(suggestions);
    setPasswordLengthMet(newPassword.length >= 8);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const res = await fetch(`${SERVER_PORT}/sendEmailOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
      setStep("otp");
    } catch (err) {
      alert("Failed to send OTP: " + err.message);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${SERVER_PORT}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("reset_token", data.token);
      alert("OTP verified successfully");
      setStep("password");
    } catch (err) {
      alert("OTP verification failed: " + err.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const token = localStorage.getItem("reset_token");
    if (!token) {
      alert("Invalid session. Please restart the password reset process.");
      setStep("email");
      return;
    }

    try {
      const res = await fetch(`${SERVER_PORT}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      setCurrentForm("login");
    } catch (err) {
      alert("Password reset failed: " + err.message);
    }
  };


  const handlePasswordFocus = () => {
    setShowStrengthIndicator(true);
  };

  const handlePasswordBlur = () => {
    if (password.length === 0 || passwordSuggestions.length === 0) {
      setShowStrengthIndicator(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        {step === "email" && (
          <>
            <h2>Forgot Your Password?</h2>
            <p className="info-text">Enter your email to receive an OTP.</p>
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="input-group2">
                <IoIosMail className="input-icon2" />
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="submit-btn">Send OTP</Button>
            </Form>
          </>
        )}

        {step === "otp" && (
          <>
            <h2>Verify Your OTP</h2>
            <Form onSubmit={handleOtpSubmit}>
              <Form.Group className="input-group2">
                <LuKeyRound className="input-icon2" />
                <Form.Control
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="submit-btn">Verify OTP</Button>
            </Form>
          </>
        )}

        {step === "password" && (
          <>
            <h2>Reset Your Password</h2>
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="input-group2">
                <FaLock className="input-icon2" />
                <Form.Control
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </Form.Group>
              {showStrengthIndicator && (
                <div className="password-strength">
                  <div className={`strength-bar strength-${passwordStrength}`}></div>
                  <p>{passwordStrength < 3 ? "Weak" : passwordStrength < 5 ? "Medium" : "Strong"}</p>
                  <ul>
                    {passwordLengthMet && passwordSuggestions.length > 0 ? (
                      passwordSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))
                    ) : (
                      <>
                        <li>At least 8 characters long</li>
                        <li>Include uppercase & lowercase letters, numbers, special characters (eg: @, &, %, etc.)</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              <Form.Group className="input-group2">
                <FaLock className="input-icon2" />
                <Form.Control
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button type="submit" className="submit-btn">Submit</Button>
            </Form>
          </>
        )}

        <p className="back-text">
          <a onClick={() => setCurrentForm("login")} style={{ cursor: "pointer", color: "blue" }}>Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
