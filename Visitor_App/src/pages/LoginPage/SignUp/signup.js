import { useState } from "react";
import axios from "axios";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";
import { LuIdCard } from "react-icons/lu";
import { Form, Button } from "react-bootstrap";
import "../LoginForm/Loginform.css";
import CustomAlert from '../../../CustomAlert';
import photo from "../Images/sign.avif";
import { SERVER_PORT } from '../../../constant';

const SignupForm = ({ setCurrentForm }) => {
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const created_by = 'User';
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [alerts, setAlerts] = useState([]);
  const showAlert = (type, title, message) => {
    const newAlert = { id: Date.now(), type, title, message };
    setAlerts([...alerts, newAlert]);

    // Auto-close for non-info alerts
    if (type !== "info") {
      setTimeout(() => {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
      }, 3000);
    }
  };




  const handleEmailChange = async (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      try {
        const response = await axios.post(`${SERVER_PORT}/user_checkemail`, { email: newEmail });
        if (response.data.exists) {
          setErrors((prev) => ({ ...prev, email: "Email already exists!" }));
        } else {
          setErrors((prev) => ({ ...prev, email: undefined }));
        }
      } catch (error) {
        console.error("There was an error checking the email!", error);
        setErrors((prev) => ({ ...prev, email: "Email check failed" }));
      }
    }
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value.replace(/\D/g, "");
    setMobile(newPhone);
    const phoneRegex = /^[1-9][0-9]*$/;
    if (!phoneRegex.test(newPhone)) {
      setErrors((prev) => ({ ...prev, mobile: "Invalid phone number!" }));
    } else {
      setErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  const validate = () => {
    let errors = {};
    if (!username) errors.username = "Username is required*";
    if (!firstname) errors.firstname = "First Name is required*";
    if (!lastname) errors.lastname = "Last Name is required*";
    if (!email) {
      errors.email = "Email is required*";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }
    if (!mobile) {
      errors.mobile = "Mobile number is required*";
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const signup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    // Prevent if client-side errors still exist
    if (Object.values(errors).some((error) => error)) {
      showAlert("error", "Validation Error", "Please fix the errors before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${SERVER_PORT}/user_signup`, {
        username,
        firstname,
        lastname,
        email,
        mobile,
        created_by,
      });

      if (response.data.success) {
        showAlert("success", "Success!", "Signup successfully.");
        setUsername("");
        setFirstname("");
        setLastname("");
        setEmail("");
        setMobile("");
      } else {
        showAlert("error", "Signup Failed!", response.data.message || "Failed to submit.");
      }
    } catch (error) {
      console.error("Error:", error);
      showAlert("error", "Signup Failed!", "Email or Mobile already exists.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="page">
      <div className="signup-container">
        <img src={photo} alt="Signup" />
        <Form onSubmit={signup} className="signup-form">
          <h2 className="signup-title">SIGN UP</h2>
          <Form.Group className="input-group1">
            <FiUser className="input-icon1" />
            <Form.Control type="text" placeholder={errors.username ? errors.username : "User Name"}
              value={username} minLength={4} maxLength={25} onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? "error-input" : username ? "success-input" : ""} />
          </Form.Group>

          <Form.Group className="input-group1">
            <LuIdCard className="input-icon1" />
            <Form.Control type="text" placeholder={errors.firstname ? errors.firstname : "First Name"}
              value={firstname} minLength={4} maxLength={25} onChange={(e) => setFirstname(e.target.value)}
              className={errors.firstname ? "error-input" : firstname ? "success-input" : ""} />
          </Form.Group>

          <Form.Group className="input-group1">
            <LuIdCard className="input-icon1" />
            <Form.Control type="text" placeholder={errors.lastname ? errors.lastname : "Last Name"}
              value={lastname} minLength={4} maxLength={25} onChange={(e) => setLastname(e.target.value)}
              className={errors.lastname ? "error-input" : lastname ? "success-input" : ""} />
          </Form.Group>

          <Form.Group className="input-group1">
            <FiMail className="input-icon1" />
            <Form.Control type="email" placeholder={errors.email ? errors.email : "Enter Your Email"}
              value={email} minLength={4} maxLength={40} onChange={handleEmailChange}
              className={errors.email ? "error-input" : email ? "success-input" : ""} />
          </Form.Group>

          <Form.Group className="input-group1">
            <FiPhone className="input-icon1" />
            <Form.Control type="text" placeholder={errors.mobile ? errors.mobile : "Mobile No"}
              value={mobile} minLength={10} maxLength={10} onChange={handlePhoneChange}
              className={errors.mobile ? "error-input" : mobile ? "success-input" : ""} />
          </Form.Group>

          {/* Buttons: Aligned in Row */}
          <div className="button-group">
            <button
              type="submit"
              disabled={isSubmitting}
              className="signup-button"
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>

            <button
              onClick={() => setCurrentForm("login")}
              className="signup-button"
              style={{ background: 'gray' }}
            >
              Back to Login
            </button>
          </div>
        </Form>
      </div>
      <div style={{ padding: "20px" }}>
        {/* Render alerts dynamically */}
        {alerts.map((alert) => (
          <CustomAlert
            key={alert.id}
            {...alert}
            onClose={() => setAlerts((prevAlerts) => prevAlerts.filter((a) => a.id !== alert.id))}
            duration={alert.type === "info" ? 0 : 3000} // No timeout for info alerts
          />
        ))}
      </div>
    </div>
  );
};

export default SignupForm;
