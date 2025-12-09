import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner, Modal, InputGroup } from 'react-bootstrap';
import { BsCamera, BsArrowRepeat, BsPerson, BsBuilding, BsCardText, BsShield, BsCheckCircle } from 'react-icons/bs';
import { Mail, Phone, Shield, ArrowRight, RefreshCw, Check } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { SERVER_PORT } from '../../../constant';


const   AddGateEntry = ({ setTitle }) => {

  useEffect(() => {
    setTitle("Gate");
  }, [setTitle]);

  const navigate = useNavigate();
  const initialVisitorState = {
    GMS_VisitorName: '',
    GMS_VisitorFrom: '',
    GMS_ToMeet: '',
    GMS_ToMeetEmail: '',
    GMS_VisitPurpose: '',
    GMS_VehicleNo: '',
    GMS_IdentificationType: '',
    GMS_IdentificationNo: '',
    GMS_MobileNo: '',
    GMS_EmailID: '',
    GMS_VisitorImage: null
  };

  const [visitor, setVisitor] = useState(initialVisitorState);
  const [errors, setErrors] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP State
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // For mobile OTP
  const [isMobileOtpVerified, setIsMobileOtpVerified] = useState(false);
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const formRef = useRef(null);


  // Timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${SERVER_PORT}/gettingemailsfromtwotable`);
        const formatted = response.data.map(emp => ({
          id: emp.user_id,
          name: emp.name,
          email: emp.email,
          type: emp.user_type
        }));
        setEmployees(formatted);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (e) => {
    const selectedName = e.target.value;
    const selectedEmployee = employees.find(emp => emp.name === selectedName);

    if (selectedEmployee) {
      setVisitor(prev => ({
        ...prev,
        GMS_ToMeet: selectedEmployee.name,
        GMS_ToMeetEmail: selectedEmployee.email
      }));
    } else {
      setVisitor(prev => ({
        ...prev,
        GMS_ToMeet: '',
        GMS_ToMeetEmail: ''
      }));
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    setError('');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCameraPermission = devices.some(device => device.kind === 'videoinput');

      if (!hasCameraPermission) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        stream.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraPermission(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      let errorMsg = "Unable to access camera.";

      if (err.name === 'NotAllowedError') {
        errorMsg = "Camera permission denied. Please allow camera access in your browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
        errorMsg = "No compatible camera found.";
      }

      setError(errorMsg);
      setCameraPermission(false);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imgData = canvas.toDataURL('image/jpeg', 0.8);
    setVisitor(prev => ({ ...prev, GMS_VisitorImage: imgData }));
    stopCamera();
  };

  const retakePhoto = () => {
    setVisitor(prev => ({ ...prev, GMS_VisitorImage: null }));
    startCamera();
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setVisitor(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!visitor.GMS_VisitorName.trim()) newErrors.GMS_VisitorName = 'Name is required';
    if (!visitor.GMS_MobileNo.trim()) {
      newErrors.GMS_MobileNo = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(visitor.GMS_MobileNo.trim())) {
      newErrors.GMS_MobileNo = 'Enter a valid 10-digit phone number';
    }
    if (visitor.GMS_EmailID && !/^\S+@\S+\.\S+$/.test(visitor.GMS_EmailID)) {
      newErrors.GMS_EmailID = 'Invalid email address';
    }
    if (!visitor.GMS_VisitorImage) newErrors.GMS_VisitorImage = 'Photo is required';
    if (!visitor.GMS_VisitPurpose.trim()) newErrors.GMS_VisitPurpose = 'Purpose is required';
    if (!visitor.GMS_ToMeet.trim()) newErrors.GMS_ToMeet = 'Person to meet is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSubmissionStatus('');

    if (!validateForm()) {
      setIsSubmitting(false);
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const submissionData = {
        ...visitor,
        entry_timestamp: new Date().toISOString(),
        created_by: 'admin'
      };

      const response = await axios.post(`${SERVER_PORT}/visitorgateentry`, submissionData);

      if (response.data.success) {
        const newVisitorId = response.data.visitorId;
        setVisitorId(newVisitorId);

        // ✅ Visitor Email (confirmation)
        const emailData = {
          from: "arunpanneer.t@gmail.com",
          to: visitor.GMS_EmailID,
          cc: visitor.GMS_ToMeetEmail,
          subject: "Visitor Pass Confirmation",
          html: `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          padding: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          border: 1px solid #ddd;
        }
        th, td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        th {
          background-color: #f8f8f8;
          color: #333;
        }
        .btn-link {
          display: inline-block;
          padding: 10px 18px;
          margin-top: 20px;
          background: #007b8f;
          color: #fff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Dear ${visitor.GMS_VisitorName || 'Visitor'},</p>

        <p>Thank you for visiting <strong>Company</strong>. Below are your visitor details:</p>

        <table>
          <tr>
            <th>ID</th>
            <td>${visitor.id || 'N/A'}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>${visitor.GMS_VisitorName || 'N/A'}</td>
          </tr>
          <tr>
            <th>Company/From</th>
            <td>${visitor.GMS_VisitorFrom || 'N/A'}</td>
          </tr>
          <tr>
            <th>To Meet</th>
            <td>${visitor.GMS_ToMeet || 'N/A'}</td>
          </tr>
          <tr>
            <th>Purpose</th>
            <td>${visitor.GMS_VisitPurpose || 'N/A'}</td>
          </tr>
          <tr>
            <th>Visit Date</th>
            <td>${new Date(visitor.created_on).toLocaleDateString('en-IN')}</td>
          </tr>
          <tr>
            <th>Time In</th>
            <td>${new Date(visitor.created_on).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
          </tr>
        </table>

        <p style="margin-top: 20px;">You may access your digital visitor ID using the button below:</p>

        <a href="http://43.205.144.64:3000/" class="btn-link">View Visitor Pass</a>

        <p style="margin-top: 40px;">Regards,<br><strong>Security Team</strong></p>
      </div>
    </body>
    </html>
  `
        };

        await axios.post(`${SERVER_PORT}/sendEmail`, emailData);

        // ✅ Employee Email (notification)
        const employeeMailOptions = {
          from: "arunpanneer.t@gmail.com",
          to: visitor.GMS_ToMeetEmail,
          subject: `Visitor Arrival Notification - ${visitor.GMS_VisitorName}`,
          html: `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 650px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            h2 { color: #007b8f; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f8f8f8; color: #333; }
            .photo { margin-top: 20px; text-align: center; }
            .photo img { max-width: 150px; border-radius: 8px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Visitor Arrival Notification</h2>
            <p>Dear ${visitor.GMS_ToMeet || 'Employee'},</p>
            <p>This is to inform you that a visitor has arrived to meet you. Please find their details below:</p>

            <table>
              <tr><th>Visitor ID</th><td>${newVisitorId || 'N/A'}</td></tr>
              <tr><th>Name</th><td>${visitor.GMS_VisitorName || 'N/A'}</td></tr>
              <tr><th>Company/From</th><td>${visitor.GMS_VisitorFrom || 'N/A'}</td></tr>
              <tr><th>Purpose of Visit</th><td>${visitor.GMS_VisitPurpose || 'N/A'}</td></tr>
              <tr><th>Visit Date</th><td>${new Date().toLocaleDateString('en-IN')}</td></tr>
              <tr><th>Time In</th><td>${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td></tr>
            </table>

            <div class="photo">
              <p><strong>Visitor Photo:</strong></p>
              ${visitor.GMS_VisitorImage ? `<img src="${visitor.GMS_VisitorImage}" alt="Visitor Photo" />` : 'No photo available'}
            </div>

            <p style="margin-top: 40px;">Regards,<br><strong>Security Desk</strong></p>
          </div>
        </body>
        </html>`
        };

        await axios.post(`${SERVER_PORT}/sendEmail`, employeeMailOptions);

        alert('✅ Both Visitor & Employee Emails Sent');
        setSubmissionStatus('success');
        navigate('/GenerateVisitorIDCard');
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      setError(error.response?.data?.message || error.message || 'Failed to submit visitor entry');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setVisitor(initialVisitorState);
    setErrors({});
    setError('');
    setSubmissionStatus('');
    if (formRef.current) formRef.current.reset();
  };


// Unified function to send OTP for either email or SMS
const sendOTP = async () => {
  setIsOtpSending(true);
  setOtpError('');
  let contactInfo = '';
  let contactType = '';

  if (verificationMethod === 'email') {
    contactInfo = email;
    contactType = 'email';
  } else if (verificationMethod === 'sms') {
    contactInfo = visitor.GMS_MobileNo;
    contactType = 'phone';
  }

  try {
    await axios.post(`${SERVER_PORT}/sendOTP`, {
      contact_info: contactInfo,
      contact_type: contactType
    });
    // Set state based on the type of contact
    if (contactType === 'email') {
      setOtpSent(true);
      setCountdown(60); // 60 seconds timer
    } else if (contactType === 'phone') {
      setIsMobileOtpSent(true);
      setCountdown(60);
      setMobileOtp(['', '', '', '', '', '']); // Reset mobile OTP input fields
    }
  } catch (err) {
    setOtpError('Failed to send OTP. Please try again.');
  } finally {
    setIsOtpSending(false);
  }
};

// Unified function to verify OTP for either email or SMS
const verifyOTP = async () => {
  setIsOtpVerifying(true);
  setOtpError('');
  let contactInfo = '';
  let contactType = '';
  let otpValue = '';

  if (verificationMethod === 'email') {
    contactInfo = email;
    contactType = 'email';
    otpValue = enteredOTP;
  } else if (verificationMethod === 'sms') {
    contactInfo = visitor.GMS_MobileNo;
    contactType = 'phone';
    otpValue = mobileOtp.join('');
  }
  
  try {
    const res = await axios.post(`${SERVER_PORT}/verifyOTP`, {
      contact_info: contactInfo,
      contact_type: contactType,
      otp: otpValue
    });
    if (res.data.success) {
      setOtpVerified(true);
      // Set state based on the type of contact
      if (contactType === 'email') {
        setOtpError('');
      } else if (contactType === 'phone') {
        setIsMobileOtpVerified(true);
        setOtpError('');
      }
    } else {
      setOtpError(res.data.message || 'Invalid OTP. Please try again.');
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    setOtpError('OTP verification failed.');
  } finally {
    setIsOtpVerifying(false);
  }
};

// Unified resend function
const resendOTP = () => {
  if (countdown === 0) {
    sendOTP();
  }
};

// Unified back function
const handleBack = () => {
  if (verificationMethod === 'email') {
    setOtpSent(false);
    setEnteredOTP('');
  } else if (verificationMethod === 'sms') {
    setIsMobileOtpSent(false);
    setMobileOtp(['', '', '', '', '', '']);
  }
  setCountdown(0);
  setOtpError('');
};

  // OTP input handlers
  const handleMobileOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...mobileOtp];
    newOtp[index] = value;
    setMobileOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleMobileOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mobileOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Main render logic
  if (otpVerified) {
    return (
      <Container fluid className="employee-container">
        <Form ref={formRef} noValidate onSubmit={handleSubmit}>
          <Row>
            <Col lg={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                  <span className="d-flex align-items-center justify-content-center">
                    <BsPerson className="me-1" style={{ fontSize: '0.85rem' }} />
                    Visitor Photo
                  </span>
                </h2>
                <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2">
                  {showCamera ? (
                    <div className="text-center w-100">
                      <div className="position-relative mb-2">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="border rounded w-100"
                          style={{ height: '280px', objectFit: 'cover' }}
                        />
                        <canvas ref={canvasRef} className="d-none" />
                      </div>
                      {cameraPermission === false && (
                        <Alert variant="warning" className="py-1" style={{ fontSize: '0.8rem' }}>
                          Camera permission denied. Please check your browser settings.
                        </Alert>
                      )}
                      <div className="d-flex justify-content-center gap-2">
                        <Button variant="success" onClick={capturePhoto} className="px-3 py-1" style={{ fontSize: '0.85rem' }}>
                          <span className="d-flex align-items-center"><BsCamera className="me-1" />Capture</span>
                        </Button>
                        <Button variant="outline-secondary" onClick={stopCamera} className="py-1" style={{ fontSize: '0.85rem' }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : visitor.GMS_VisitorImage ? (
                    <div className="text-center w-100">
                      <div className="position-relative mb-2">
                        <img
                          src={visitor.GMS_VisitorImage}
                          alt="Visitor"
                          className="img-thumbnail mb-1"
                          style={{ height: '280px', width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <Button variant="warning" onClick={retakePhoto} className="py-1" style={{ fontSize: '0.85rem' }}>
                        <span className="d-flex align-items-center justify-content-center"><BsArrowRepeat className="me-1" />Retake Photo</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center w-100 p-2">
                      <div
                        className="border border-dashed d-flex flex-column justify-content-center align-items-center p-4 rounded-3 mb-2"
                        style={{ height: '293px', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                        onClick={startCamera}
                      >
                        <BsCamera size={40} className="mb-2 text-primary" />
                        <h2 className="text-sm font-semibold mb-2 p-2 text-gray-800 text-center shadow">No Photo Taken</h2>
                        <p className="text-muted mb-2" style={{ fontSize: '0.6rem' }}>Click to capture visitor photo</p>
                        <Button variant="primary" onClick={startCamera} className="py-1" style={{ fontSize: '0.65rem' }}>
                          Open Camera
                        </Button>
                      </div>
                      {errors.GMS_VisitorImage && (
                        <small className="text-danger d-block mt-1" style={{ fontSize: '0.75rem' }}>{errors.GMS_VisitorImage}</small>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-3">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                  <span className="d-flex align-items-center justify-content-center">
                    <BsPerson className="me-1" style={{ fontSize: '0.85rem' }} />
                    Personal Information
                  </span>
                </h2>
                <Card.Body className="p-2">
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Full Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="GMS_VisitorName"
                          placeholder="Enter full name"
                          value={visitor.GMS_VisitorName}
                          onChange={handleChange}
                          isInvalid={!!errors.GMS_VisitorName}
                          size="sm"
                        />
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                          {errors.GMS_VisitorName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>
                          Phone Number <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup size="sm">
                          <Form.Control
                            type="tel"
                            name="GMS_MobileNo"
                            placeholder="10-digit phone"
                            value={visitor.GMS_MobileNo}
                            onChange={handleChange}
                            isInvalid={!!errors.GMS_MobileNo}
                            disabled={isMobileOtpVerified}
                          />
                          <Button
                            variant={isMobileOtpVerified ? "success" : "outline-primary"}
                            onClick={sendOTP}
                            disabled={isOtpSending || isMobileOtpVerified || !visitor.GMS_MobileNo.trim()}
                            style={{ fontSize: '0.75rem' }}
                          >
                            {isOtpSending ? (
                              <Spinner as="span" animation="border" size="sm" />
                            ) : isMobileOtpVerified ? (
                              <BsCheckCircle />
                            ) : (
                              <BsShield />
                            )}
                          </Button>
                        </InputGroup>
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                          {errors.GMS_MobileNo}
                        </Form.Control.Feedback>
                        {isMobileOtpVerified && (
                          <small className="text-success" style={{ fontSize: '0.7rem' }}>✓ Verified</small>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Email ID</Form.Label>
                        <Form.Control
                          type="email"
                          name="GMS_EmailID"
                          placeholder="Enter email address"
                          value={visitor.GMS_EmailID}
                          onChange={handleChange}
                          isInvalid={!!errors.GMS_EmailID}
                          size="sm"
                        />
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                          {errors.GMS_EmailID}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Organization/Company</Form.Label>
                        <Form.Control
                          type="text"
                          name="GMS_VisitorFrom"
                          placeholder="Company / Organization"
                          value={visitor.GMS_VisitorFrom}
                          onChange={handleChange}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-3">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                  <span className="d-flex align-items-center justify-content-center">
                    <BsBuilding className="me-1" style={{ fontSize: '0.85rem' }} />
                    Visit Details
                  </span>
                </h2>
                <Card.Body className="p-2">
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>
                          To Meet <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="select"
                          name="GMS_ToMeet"
                          onChange={handleEmployeeSelect}
                          value={visitor.GMS_ToMeet || ''}
                          isInvalid={!!errors.GMS_ToMeet}
                          size="sm"
                        >
                          <option value="">-- Select Person --</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.name}>
                              {emp.name} ({emp.type})
                            </option>
                          ))}
                        </Form.Control>
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                          {errors.GMS_ToMeet}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: '0.85rem' }}>To Meet Person Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          name="GMS_ToMeetEmail"
                          placeholder="Email will auto-populate"
                          value={visitor.GMS_ToMeetEmail || ''}
                          onChange={handleChange}
                          isInvalid={!!errors.GMS_ToMeetEmail}
                          size="sm"
                          readOnly
                        />
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                          {errors.GMS_ToMeetEmail}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label style={{ fontSize: '0.85rem' }}>Purpose of Visit <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="GMS_VisitPurpose"
                          placeholder="Meeting / Delivery / etc."
                          value={visitor.GMS_VisitPurpose}
                          onChange={handleChange}
                          isInvalid={!!errors.GMS_VisitPurpose}
                          size="sm"
                        />
                        <Form.Control.Feedback type="invalid" style={{ fontSize: '0.75rem' }}>
                          {errors.GMS_VisitPurpose}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center shadow">
                  <span className="d-flex align-items-center justify-content-center">
                    <BsCardText className="me-1" style={{ fontSize: '0.85rem' }} />
                    Additional Information
                  </span>
                </h2>
                <Card.Body className="p-2">
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label style={{ fontSize: '0.85rem' }}>
                          Vehicle Number
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="GMS_VehicleNo"
                          placeholder="If applicable"
                          value={visitor.GMS_VehicleNo}
                          onChange={handleChange}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label style={{ fontSize: '0.85rem' }}>ID Type</Form.Label>
                        <Form.Select
                          name="GMS_IdentificationType"
                          value={visitor.GMS_IdentificationType}
                          onChange={handleChange}
                          size="sm"
                        >
                          <option value="">Select ID Type</option>
                          <option value="Aadhaar">Aadhaar Card</option>
                          <option value="Driving License">Driving License</option>
                          <option value="Passport">Passport</option>
                          <option value="Voter ID">Voter ID</option>
                          <option value="PAN Card">PAN Card</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-0">
                        <Form.Label style={{ fontSize: '0.85rem' }}>ID Number</Form.Label>
                        <Form.Control
                          type="text"
                          name="GMS_IdentificationNo"
                          placeholder="Enter ID number"
                          value={visitor.GMS_IdentificationNo}
                          onChange={handleChange}
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button
              onClick={resetForm}
              className="px-3 py-2 me-3 text-white"
              style={{ backgroundColor: 'red', fontSize: '0.85rem', border: 'none' }}
            >
              Clear All
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-2 text-white"
              style={{ backgroundColor: 'green', fontSize: '0.9rem', border: 'none' }}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-1" /> Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </Form>
      </Container>
    );
  }

  // OTP Verification UI (New Design)
  return (
    <div className="mt-4 from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-4 max-w-md w-full">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">OTP Verification</h2>
          <p className="text-gray-600">Choose your preferred verification method</p>
        </div>
        {/* Email/SMS Selection */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button
            onClick={() => {
              setVerificationMethod('email');
              setOtpSent(false);
              setMobile('');
              setCountdown(0);
              setOtpError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              verificationMethod === 'email'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button
            onClick={() => {
              setVerificationMethod('sms');
              setIsMobileOtpSent(false);
              setEmail('');
              setCountdown(0);
              setOtpError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              verificationMethod === 'sms'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            SMS
          </button>
        </div>

        {verificationMethod === 'email' ? (
          // Email OTP Flow
          !otpSent ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                onClick={sendOTP}
                disabled={isOtpSending || !email}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isOtpSending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  OTP sent to {email}
                </p>
                {otpError && (
                  <p className="text-red-500 text-xs mt-2">{otpError}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={enteredOTP}
                  onChange={(e) => setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl font-mono tracking-widest text-gray-800"
                  maxLength={6}
                />
              </div>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={resendOTP}
                  disabled={countdown > 0}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
              <button
                onClick={verifyOTP}
                disabled={isOtpVerifying || enteredOTP.length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isOtpVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </button>
              <button
                onClick={handleBack}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors duration-200"
              >
                ← Back to input
              </button>
            </>
          )
        ) : (
          // Mobile (SMS) OTP Flow
          !isMobileOtpSent ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={visitor.GMS_MobileNo}
                    onChange={(e) => setVisitor(prev => ({ ...prev, GMS_MobileNo: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-500"
                  />
                </div>
              </div>
              <button
                onClick={sendOTP}
                disabled={isOtpSending || !visitor.GMS_MobileNo.trim() || visitor.GMS_MobileNo.length < 10}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isOtpSending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  OTP sent to {visitor.GMS_MobileNo}
                </p>
                {otpError && (
                  <p className="text-red-500 text-xs mt-2">{otpError}</p>
                )}
              </div>
              <div className="d-flex justify-content-center mb-6">
                {mobileOtp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => otpInputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleMobileOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleMobileOtpKeyDown(index, e)}
                    className="text-center w-12 h-12 mx-1 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono tracking-widest text-gray-800 text-xl"
                  />
                ))}
              </div>
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={resendOTP}
                  disabled={countdown > 0}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
              <button
                onClick={verifyOTP}
                disabled={isOtpVerifying || mobileOtp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isOtpVerifying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify OTP
                  </>
                )}
              </button>
              <button
                onClick={handleBack}
                className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 font-medium transition-colors duration-200"
              >
                ← Back to input
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default AddGateEntry;