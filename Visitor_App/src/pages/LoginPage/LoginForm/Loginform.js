import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ReactSession } from 'react-client-session';
import { Form, Button } from 'react-bootstrap';
import './Loginform.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';

//Images in App Folder
import photo from '../Images/pic6.jpg';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../../../CustomAlert';
import SignupForm from '../SignUp/signup.js';
import ForgotPassword from '../ForgotPassword/ForgotPassword.js';
import { SERVER_PORT } from '../../../constant';

function Loginform({ setIsLoggedIn }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alerts, setAlerts] = useState([]);
    const [currentForm, setCurrentForm] = useState("login");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const navigate = useNavigate();

    // Redirect to homepage on reload/refresh
    useEffect(() => {
        if (window.location.pathname !== "/") {
            navigate("/");
        }
    }, []);

    const showAlert = (type, title, message) => {
        const newAlert = { id: Date.now(), type, title, message };
        setAlerts([...alerts, newAlert]);
        setTimeout(() => {
            setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
        }, 3000);
    };

    const login = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const response = await axios.post(`${SERVER_PORT}/user_login`, { username, password, });
            if (response.data.success) {
                // showAlert("success", "Success!", "Login Successful.");
                sessionStorage.setItem("username", response.data.loginid);
                sessionStorage.setItem("userrole", response.data.UserRole);

                sessionStorage.setItem("userId", response.data.id);
                sessionStorage.setItem("name", response.data.name);

                if (response.data.avatar) {
                    let profileImage;

                    if (typeof response.data.avatar === "string" && response.data.avatar.startsWith("data:")) {
                        profileImage = response.data.avatar;
                    } else if (response.data.avatar?.type === "Buffer") {
                        const base64Image = Buffer.from(response.data.avatar.data).toString("base64");
                        profileImage = `data:image/png;base64,${base64Image}`;
                    } else {
                        profileImage = null;
                    }

                    sessionStorage.setItem("profileimage", profileImage);
                } else {
                    sessionStorage.setItem("profileimage", null);
                }

                // ---- Redirect ----
                if (setIsLoggedIn) {
                    setTimeout(() => setIsLoggedIn(true), 300);
                }
                navigate("/");

            } else {
                // ---- Handle inactive / invalid ----
                if (response.data.status === "inactive") {
                    showAlert("warning", "Account Inactive!", "Your account is not active. Please contact admin.");
                } else {
                    showAlert("error", "Login Failed!", "Invalid login credentials.");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            showAlert("error", "Server Error!", "Something went wrong. Please try again later.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <>
            {currentForm === "login" && (
                <div className='background'>
                    <div style={{ padding: "20px" }}>
                        {alerts.map((alert) => (
                            <CustomAlert key={alert.id} {...alert} onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))} />
                        ))}
                    </div>
                    {/* <div className='photo'>
                        <img id='pic1' src={photo1} alt='pic'></img>
                        <img id='pic2' src={photo2} alt='pic'></img>
                        <img id='pic3' src={photo3} alt='pic'></img>
                    </div> */}
                    <div className="log-container">
                        <div className="left-section">
                            <h3>Visitors Management System</h3>
                            <img src={photo} alt="Gateway Illustration"></img>
                        </div>
                        <div className="right-section">
                            <h2>Login</h2>
                            {/* <div className="log-top">
                                <img src={profile} alt="User Avatar"></img>
                            </div> */}
                            <div className="form-subtitle">Sign in to access the dashboard</div>
                            <Form onSubmit={login} className="mt-3">
                                <Form.Group className="log-input-group mb-3 position-relative">
                                    <i className="fas fa-user position-absolute start-0 top-50 translate-middle-y ms-1 text-secondary"></i>
                                    <Form.Control
                                        type="text"
                                        placeholder="Email"
                                        name="username"
                                        className="ps-4.5"
                                        value={username}
                                        minLength={4}
                                        maxLength={25}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="log-input-group mb-3 position-relative">
                                    <i className="fas fa-lock position-absolute start-0 top-50 translate-middle-y ms-1 text-secondary"></i>
                                    <Form.Control
                                        type="password"
                                        placeholder="Password"
                                        name="password"
                                        className="ps-4.5"
                                        value={password}
                                        minLength={4}
                                        maxLength={25}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-center gap-3 mb-3">
                                    <Button id="login-btn" type="submit" className="btn btn-primary">
                                        Login
                                    </Button>
                                    <Button
                                        id="signup-btn"
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() => setCurrentForm("signup")}
                                    >
                                        SignUp
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <span
                                        onClick={() => setCurrentForm("forgot")}
                                        className="text-primary me-2"
                                        style={{ cursor: "pointer", textDecoration: "underline" }}
                                    >
                                        Forgot Password?
                                    </span>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            )}
            {currentForm === "signup" && (
                <>
                    <SignupForm setCurrentForm={setCurrentForm} />
                </>
            )}
            {currentForm === "forgot" && (
                <>
                    <ForgotPassword setCurrentForm={setCurrentForm} />
                </>
            )}
        </>
    );
}
export default Loginform;