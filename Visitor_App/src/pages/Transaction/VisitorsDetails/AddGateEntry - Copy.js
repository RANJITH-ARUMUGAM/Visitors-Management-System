import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Form, Button, Container, Row, Col, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
// Ensure all necessary icons are imported
import { Mail, Phone, Shield, ArrowRight, RefreshCw, User, Info, CheckCircle, History, Check, Users, Smartphone, FileText, Eye, BadgeCheck, Lock, RotateCcw, PhoneCall, AlertCircle, Search, Clock, ShieldCheck, Printer, Download, QrCode, Calendar, MapPin, IdCard } from 'lucide-react';
import { BsCamera, BsArrowRepeat, BsPerson, BsCheckCircle } from 'react-icons/bs';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { SERVER_PORT } from '../../../constant'; // Ensure this path is correct

const AddLobbyEntry = ({ setTitle }) => {

  useEffect(() => {
    setTitle("Lobby");
  }, [setTitle]);

  const navigate = useNavigate();

  // --- Initial State Definitions ---
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
    GMS_VisitorImage: null,
    address: '',
    gender: ''
  };

  const [visitor, setVisitor] = useState(initialVisitorState);
  const [errors, setErrors] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // 5-Step Flow State
  const [step, setStep] = useState(1);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [allowDataUpdate, setAllowDataUpdate] = useState(false);

  // Search State
  const [oldVisitors, setOldVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // OTP State
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mobileOtp, setMobileOtp] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Pass Details State
  const [visitorEntryId, setVisitorEntryId] = useState('');
  const [passCode, setPassCode] = useState('');
  const [passDurationDays, setPassDurationDays] = useState(1);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('');
  const [toDateLocked, setToDateLocked] = useState(true);
  const [sendSMS, setSendSMS] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);


  const [showBackSide, setShowBackSide] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const printRef = useRef(null);

  // --- Utility Hooks ---

  // Timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Fetch Employee Data & Old Visitors
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${SERVER_PORT}/gettingemailsfromtwotable`);
        const formatted = response.data.allEmployee ? response.data.allEmployee : response.data;
        setEmployees(formatted);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchOldVisitors = async () => {
      try {
        const res = await axios.get(`${SERVER_PORT}/getOldVisitors`);
        setOldVisitors(Array.isArray(res.data.oldVisitors) ? res.data.oldVisitors : []);
      } catch (err) {
        console.error('Error fetching old visitors:', err);
        setOldVisitors([]);
      }
    };

    Promise.all([fetchEmployees(), fetchOldVisitors()]).finally(() => setLoading(false));
  }, []);

  // Calculate Valid From/To Dates
  useEffect(() => {
    const today = new Date();
    setValidFrom(today.toISOString().split('T')[0]);

    const validDate = new Date(today);
    validDate.setDate(today.getDate() + passDurationDays);
    setValidTo(validDate.toISOString().split('T')[0]);
  }, [passDurationDays]);


  // Generate QR Code URL
  useEffect(() => {
    if (passCode) {
      const qrData = JSON.stringify({
        id: passCode,
        name: visitor.GMS_VisitorName,
        from: visitor.GMS_VisitorFrom,
        date: new Date().toISOString().split('T')[0]
      });
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`);
    }
  }, [passCode, visitor]);

  // Steps configuration with step names
  const steps = useMemo(() => ([
    { id: 1, name: 'Visitor', icon: Users, label: 'Select Visitor' },
    { id: 2, name: 'Verify OTP', icon: ShieldCheck, label: 'Verify OTP' },
    { id: 3, name: 'Entry', icon: User, label: 'Create Visitor' },
    { id: 4, name: 'Pass Generation', icon: IdCard, label: 'Virtual ID Card' },
    { id: 5, name: 'Create Pass', icon: FileText, label: 'Create Pass' },
  ]), []);

  // Get current step name for display
  const currentStepName = steps.find(s => s.id === step)?.label || '';

  // --- Utility Functions ---

  // Stepper Component
  const StepperStatus = ({ currentStep }) => {
    const totalSteps = steps.length;
    const activeStepIndex = steps.findIndex(s => s.id === currentStep);
    const progressWidth = activeStepIndex < 0 ? 0 : (activeStepIndex / (totalSteps - 1)) * 100;

    return (
      <div className="mt-3 mb-10 px-3">
        <div className="d-flex justify-content-between mb-1 px-2">
          {steps.map((stepItem) => {
            const isActive = stepItem.id === currentStep;
            const isCompleted = stepItem.id < currentStep;
            const StepIcon = stepItem.icon;

            return (
              <div key={stepItem.id} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 10 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center border border-4 mb-1 
                    ${isCompleted
                      ? 'bg-success text-white border-success'
                      : isActive
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-secondary border-secondary'
                    }`}
                  style={{ width: '28px', height: '28px', fontSize: '14px' }}
                >
                  {isCompleted ? <Check size={12} /> : <StepIcon size={12} />}
                </div>
                <small className="text-muted text-center" style={{ fontSize: '0.6rem', whiteSpace: 'nowrap' }}>
                  {stepItem.name}
                </small>
              </div>
            );
          })}
        </div>
        <div className="position-relative" style={{ marginTop: '-38px', zIndex: 1, marginInline: '8px' }}>
          <div className="progress" style={{ height: '4px', backgroundColor: '#e9ecef' }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${progressWidth}%`, transition: 'width 0.3s' }}
              aria-valuenow={progressWidth}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Filter visitors for search
  const filteredVisitors = useMemo(() => {
    return oldVisitors.filter(v => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return false;
      return (v.GMS_VisitorName || v.name || '').toLowerCase().includes(q)
        || (v.GMS_EmailID || v.email || '').toLowerCase().includes(q)
        || (v.GMS_MobileNo || v.phone || '').includes(q.replace(/\D/g, ''));
    });
  }, [oldVisitors, searchQuery]);

  // Select visitor from search (Autofill logic for returning visitors)
  const handleSelectVisitor = (v) => {
    setIsExistingUser(true);

    setVisitor(prev => ({
      ...prev,
      GMS_VisitorName: v.GMS_VisitorName || v.name || '',
      GMS_VisitorFrom: v.GMS_VisitorFrom || v.company || '',
      GMS_MobileNo: v.GMS_MobileNo || v.phone || '',
      GMS_EmailID: v.GMS_EmailID || v.email || '',
      GMS_VisitorImage: v.GMS_VisitorImage || v.photo || null,
    }));

    if (v.GMS_MobileNo) {
      setVerificationMethod('sms');
      setEmail(v.GMS_EmailID || initialVisitorState.GMS_EmailID);
    } else if (v.GMS_EmailID) {
      setVerificationMethod('email');
      setEmail(v.GMS_EmailID);
      setVisitor(prev => ({ ...prev, GMS_MobileNo: v.GMS_MobileNo || initialVisitorState.GMS_MobileNo }));
    }

    setShowResults(false);
    setSearchQuery('');
  };

  /**
   * Checks if a visitor exists and populates state accordingly.
   */
  const checkExistingVisitor = async (contactInfo, contactType) => {
    try {
      const response = await axios.post(`${SERVER_PORT}/checkExistingVisitor`, {
        contact_info: contactInfo,
        contact_type: contactType
      });

      if (response.data.success && response.data.visitor) {
        const data = response.data.visitor;
        setIsExistingUser(true);
        setVisitor(prev => ({
          ...prev,
          GMS_VisitorName: data.GMS_VisitorName || '',
          GMS_VisitorFrom: data.GMS_VisitorFrom || '',
          GMS_MobileNo: data.GMS_MobileNo || (contactType === 'phone' ? contactInfo : prev.GMS_MobileNo),
          GMS_EmailID: data.GMS_EmailID || (contactType === 'email' ? contactInfo : prev.GMS_EmailID),
          GMS_VisitorImage: data.GMS_VisitorImage || null,
        }));
        return true;
      } else {
        // New Visitor: Clear previous state, keep only the contact info
        setIsExistingUser(false);
        setVisitor(prev => ({
          ...initialVisitorState, // Reset all fields
          // Restore only the contact info the user entered
          GMS_MobileNo: contactType === 'phone' ? contactInfo : initialVisitorState.GMS_MobileNo,
          GMS_EmailID: contactType === 'email' ? contactInfo : initialVisitorState.GMS_EmailID,
        }));
        setEmail(contactType === 'email' ? contactInfo : initialVisitorState.GMS_EmailID);
        return false;
      }
    } catch (error) {
      console.error('Error checking existing visitor:', error);
      setIsExistingUser(false);
      return false;
    }
  };

  // Handle employee selection (UPDATED)
  const handleEmployeeSelect = (e) => {
    const selectedName = e.target.value;
    // Find the employee using 'name' or fallback to 'GMS_EmployeeName'
    const selectedEmployee = employees.find(emp => (emp.name || emp.GMS_EmployeeName) === selectedName);

    if (selectedEmployee) {
      setVisitor(prev => ({
        ...prev,
        // Set to the name found (using 'name' from the option value)
        GMS_ToMeet: selectedName,
        // Assume email is either 'email' or 'GMS_EmailID'
        GMS_ToMeetEmail: selectedEmployee.email || selectedEmployee.GMS_EmailID || ''
      }));
    } else {
      // Clear email if no employee is selected
      setVisitor(prev => ({
        ...prev,
        GMS_ToMeet: selectedName,
        GMS_ToMeetEmail: ''
      }));
    }
  };

  // Camera functions (kept original)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      setCameraPermission(false);
      alert("Camera access denied or failed.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
      setVisitor(prev => ({ ...prev, GMS_VisitorImage: imageData }));
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setVisitor(prev => ({ ...prev, GMS_VisitorImage: null }));
    startCamera();
  };

  // Handle form changes
  const handleChange = e => {
    const { name, value } = e.target;

    if (name === 'GMS_MobileNo') {
      const rawValue = value.replace(/\D/g, '').slice(0, 10);
      setVisitor(prev => ({ ...prev, [name]: rawValue }));
    } else {
      setVisitor(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!visitor.GMS_VisitorName.trim()) newErrors.GMS_VisitorName = 'Full Name is required';
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

  // --- OTP Functions ---
  const sendOTP = async () => {
    setIsOtpSending(true);
    setOtpError('');
    let contactInfo = verificationMethod === 'email' ? email : visitor.GMS_MobileNo;
    let contactType = verificationMethod === 'email' ? 'email' : 'phone';

    // Validation
    if (contactType === 'phone' && (!contactInfo || contactInfo.length !== 10)) {
      setOtpError('Please enter a valid 10-digit mobile number.');
      setIsOtpSending(false);
      return;
    }
    if (contactType === 'email' && !/^\S+@\S+\.\S+$/.test(contactInfo)) {
      setOtpError('Please enter a valid email address.');
      setIsOtpSending(false);
      return;
    }

    // Step 1: Check existing visitor and auto-populate fields or clear for new visitor
    await checkExistingVisitor(contactInfo, contactType);

    try {
      const response = await axios.post(`${SERVER_PORT}/sendOTP`, {
        contact_info: contactInfo,
        contact_type: contactType
      });

      if (response.status >= 200 && response.status < 300) {
        setStep(2);
        setOtpSent(true);
        setCountdown(120);
      } else {
        setOtpError(response.data?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    setIsOtpVerifying(true);
    setOtpError('');
    let contactInfo = verificationMethod === 'email' ? email : visitor.GMS_MobileNo;
    let contactType = verificationMethod === 'email' ? 'email' : 'phone';
    let otpValue = verificationMethod === 'email' ? enteredOTP : mobileOtp.join('');

    if (otpValue.length !== 6) {
      setOtpError('Please enter a 6-digit OTP.');
      setIsOtpVerifying(false);
      return;
    }

    try {
      const response = await axios.post(`${SERVER_PORT}/verifyOTP`, {
        contact_info: contactInfo,
        contact_type: contactType,
        otp: otpValue
      });

      if (response.status >= 200 && response.status < 300 && response.data.success) {
        setStep(3);
      } else {
        setOtpError(response.data?.message || 'Invalid OTP.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setOtpError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setIsOtpVerifying(false);
    }
  };

  // Handle OTP input for mobile/SMS
  const handleMobileOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...mobileOtp];
    newOtp[index] = value;
    setMobileOtp(newOtp);

    // Move focus to next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const cleanSubmissionData = (data) => {
    const cleaned = {};
    for (const key in data) {
      const value = data[key];
      // Step 1: Convert all empty strings to null (for optional fields)
      let cleanedValue = (typeof value === 'string' && value.trim() === '') ? null : value;

      // Step 2: Handle Required (NOT NULL) fields that might be empty/null:

      // FIX A: GMS_IdentificationType (Required Integer)
      if (key === 'GMS_IdentificationType' && cleanedValue === null) {
        cleanedValue = 1; // Default valid ID
      }

      // FIX B: GMS_IdentificationNo (Required String)
      if (key === 'GMS_IdentificationNo' && cleanedValue === null) {
        cleanedValue = 'N/A'; // Default required string
      }

      // FIX C: GMS_Status (Required Boolean)
      if (key === 'GMS_Status' && cleanedValue === null) {
        cleanedValue = false; // Default status for new entry
      }

      if (key === 'GMS_InTime' && cleanedValue === null) {
        cleanedValue = new Date().toISOString(); // Use current timestamp
      }

      cleaned[key] = cleanedValue;
    }

    // Ensure GMS_InTime exists, possibly by copying from entry_timestamp
    if (!cleaned.GMS_InTime) {
      cleaned.GMS_InTime = new Date().toISOString();
    }

    return cleaned;
  };

  // --- Submission Functions ---

  // Submit visitor data (Step 3 logic)
  // const handleSubmit = async () => {
  //   setIsSubmitting(true);
  //   setError('');
  //   setSubmissionStatus('');

  //   if (!validateForm()) {
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   const cleanedVisitorData = cleanSubmissionData(visitor);

  //   try {
  //     const submissionData = {
  //       ...cleanedVisitorData,
  //       GMS_PassDuration: passDurationDays,
  //       GMS_InTime: new Date().toISOString(),
  //       created_by: 'admin',
  //     };

  //     const response = await axios.post(`${SERVER_PORT}/visitorlobbyentry`, submissionData);

  //     // IMPORTANT: Store the actual gms_gateentry_id (integer), not just the pass code
  //     const gateEntryId = response.data.gateentry_id || response.data.gms_gateentry_id;
  //     const passCode = response.data.passCode || response.data.GMS_PassID || `VST-${Date.now().toString().slice(-6)}`;

  //     if (!gateEntryId) {
  //       throw new Error('Gate entry ID not returned from server');
  //     }

  //     setVisitorEntryId(gateEntryId); // This should be an integer
  //     setPassCode(passCode);
  //     setStep(4);
  //     setSubmissionStatus('success');

  //   } catch (error) {
  //     console.error('Submission error:', error);
  //     setSubmissionStatus('error');
  //     setError(error.response?.data?.message || error.message || 'Failed to submit visitor entry');
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // In Step 3 - Update the handleSubmit function:
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    setSubmissionStatus('');

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const cleanedVisitorData = cleanSubmissionData(visitor);

    try {
      const submissionData = {
        ...cleanedVisitorData,
        GMS_PassDuration: passDurationDays,
        GMS_InTime: new Date().toISOString(),
        created_by: 'admin',
      };

      console.log('Submitting visitor data:', submissionData);

      const response = await axios.post(`${SERVER_PORT}/visitorlobbyentry`, submissionData);
      console.log('Visitor creation response:', response.data);

      // Try different possible response formats for gate entry ID
      const gateEntryId = response.data.gms_gateentry_id ||
        response.data.GMS_GateEntryID ||
        response.data.gateentry_id ||
        response.data.id ||
        response.data.gate_entry_id;

      // Try different possible response formats for pass code
      const passCode = response.data.GMS_PassID ||
        response.data.passCode ||
        response.data.pass_code ||
        response.data.pass_id ||
        `VST-${Date.now().toString().slice(-6)}`;

      if (!gateEntryId) {
        console.warn('No gate entry ID found in response:', response.data);

        // Show alert but don't block the flow
        setTimeout(() => {
          alert('⚠️ Note: Gate entry ID was not returned from the server. \n\nYou can still proceed to create the ID card, but pass generation in Step 5 might require manual intervention.\n\nPlease contact support if you encounter issues in Step 5.');
        }, 100);

        // Generate a temporary placeholder ID for frontend flow
        const tempGateEntryId = `TEMP-${Date.now().toString().slice(-8)}`;
        setVisitorEntryId(tempGateEntryId);
        setPassCode(passCode);

        console.log('Using temporary IDs:', {
          tempGateEntryId,
          passCode,
          note: 'Gate entry ID not returned from server'
        });
      } else {
        // Store the actual IDs
        setVisitorEntryId(gateEntryId);
        setPassCode(passCode);
        console.log('Storing actual IDs:', { gateEntryId, passCode });
      }

      // Always move to next step regardless of gate entry ID
      setStep(4);
      setSubmissionStatus('success');

      // Show success message
      setTimeout(() => {
        alert(`✅ Visitor information saved successfully!\n\nPass Code: ${passCode}\n\nYou can now proceed to create the ID card.`);
      }, 200);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      setError(error.response?.data?.message || error.message || 'Failed to submit visitor entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to your component
  const findGateEntryByPassCode = async (passCode) => {
    try {
      const response = await axios.post(`${SERVER_PORT}/findGateEntryByPassCode`, {
        pass_code: passCode
      });
      return response.data.gateentry_id;
    } catch (error) {
      console.error('Error finding gate entry:', error);
      return null;
    }
  };


  // Format phone number
  const formatPhoneNumber = (phone) => {
    const numbers = (phone || '').replace(/\D/g, '');
    if (numbers.length === 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  // Check if field should be read-only
  const isFieldAutoPopulated = (name) => {
    const autoPopulatedFields = ['GMS_VisitorName', 'GMS_VisitorFrom', 'GMS_MobileNo', 'GMS_EmailID'];
    return isExistingUser && autoPopulatedFields.includes(name) && !allowDataUpdate;
  };

  // --- Common Stage Header Component ---
  const StageHeader = ({ stepNumber, stepName, icon: Icon }) => (
    <div className="mb-4 text-center">
      <div className="d-flex align-items-center justify-content-center mb-2">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{ width: '40px', height: '40px' }}>
          <Icon size={20} />
        </div>
        <div>
          <h2 className="fs-4 fw-bold text-gray-800 mb-0">{stepName}</h2>
          <p className="text-muted mb-0 small">
            {stepNumber === 1 && 'Search existing visitor or enter new contact'}
            {stepNumber === 2 && 'Verify your contact with OTP'}
            {stepNumber === 3 && 'Enter visitor details and capture photo'}
            {stepNumber === 4 && 'Review and preview visitor ID card'}
            {stepNumber === 5 && 'Set pass validity and generate final pass'}
          </p>
        </div>
      </div>
    </div>
  );

  // --- STEP 1: Select Visitor ---
  const renderStep1 = () => {
    const isInputValid = verificationMethod === 'email'
      ? /^\S+@\S+\.\S+$/.test(email)
      : visitor.GMS_MobileNo && visitor.GMS_MobileNo.length === 10;

    return (
      <Container className="d-flex justify-content-center">
        <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '900px', border: '1px solid #e0f0ff' }}>
          {/* Stage Header */}
          <StageHeader stepNumber={1} stepName={currentStepName} icon={Users} />

          <StepperStatus currentStep={1} />

          <Form className='mt-4'>
            {/* Email/SMS Selection */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Verification Method</label>
              </div>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('email');
                    setOtpSent(false);
                    setOtpError('');
                    setCountdown(0);
                    setIsExistingUser(false);
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className={`flex items-center px-2 py-2 rounded-lg transition-all duration-200 ${verificationMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Mail size={18} className="mr-2" />
                  <span className="font-medium">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('sms');
                    setOtpSent(false);
                    setOtpError('');
                    setCountdown(0);
                    setIsExistingUser(false);
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className={`flex items-center px-2 py-2 rounded-lg ml-1 transition-all duration-200 ${verificationMethod === 'sms'
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Phone size={18} className="mr-2" />
                  <span className="font-medium">SMS</span>
                </button>
              </div>
            </div>

            {/* Unified Search Bar */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                {verificationMethod === 'email' ? 'Email Address' : 'Mobile Number'}
                <span className="text-danger ms-1">*</span>
              </label>
              <div className="position-relative">
                <InputGroup>
                  <InputGroup.Text className="bg-light">
                    {verificationMethod === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                  </InputGroup.Text>
                  <Form.Control
                    type={verificationMethod === 'email' ? 'email' : 'tel'}
                    placeholder={verificationMethod === 'email' ? 'you@example.com' : '9876543210'}
                    value={verificationMethod === 'email' ? email : visitor.GMS_MobileNo}
                    onChange={(e) => {
                      let input = e.target.value;
                      setIsExistingUser(false);

                      if (verificationMethod === 'email') {
                        setEmail(input);
                        setSearchQuery(input);
                        setVisitor(prev => ({ ...prev, GMS_MobileNo: initialVisitorState.GMS_MobileNo }));
                      } else {
                        const mobile = input.replace(/\D/g, '').slice(0, 10);
                        setVisitor(prev => ({ ...prev, GMS_MobileNo: mobile }));
                        setSearchQuery(mobile);
                        setEmail(initialVisitorState.GMS_EmailID);
                      }
                      setShowResults(input.length > 0 && filteredVisitors.length > 0);
                    }}
                    onFocus={() => setShowResults(searchQuery.length > 0 && filteredVisitors.length > 0)}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    className="rounded-end"
                  />
                </InputGroup>

                {/* AutoComplete Results */}
                {showResults && searchQuery && filteredVisitors.length > 0 && (
                  <div className="position-absolute z-10 w-100 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto" style={{ zIndex: 100 }}>
                    {filteredVisitors.map((v, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectVisitor(v)}
                        className="p-3 hover-bg-light cursor-pointer border-bottom d-flex align-items-center"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-start">
                          {v.GMS_VisitorImage ? (
                            <img src={v.GMS_VisitorImage} className="w-10 h-10 rounded-circle object-cover me-3" style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="Visitor" />
                          ) : (
                            <div className="w-10 h-10 rounded-circle bg-light d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', borderRadius: '50%' }}>
                              <User size={18} className="text-secondary" />
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <div className="fw-medium text-dark">{v.GMS_VisitorName}</div>
                            <div className="small text-muted">
                              {v.GMS_VisitorFrom || 'Individual Visitor'}
                            </div>
                            <div className="small text-muted mt-1">
                              {v.GMS_EmailID && <span className="me-3">{v.GMS_EmailID}</span>}
                              {v.GMS_MobileNo && <span>{formatPhoneNumber(v.GMS_MobileNo)}</span>}
                            </div>
                          </div>
                          <BadgeCheck size={16} className="text-success" />
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={() => {
                        setShowResults(false);
                        setSearchQuery('');
                        setIsExistingUser(false);
                      }}
                      className="p-3 hover-bg-light cursor-pointer border-top text-center text-primary fw-semibold"
                      style={{ cursor: 'pointer' }}
                    >
                      Continue to Verify (New/Updated Visitor)
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Visitor Info Preview */}
            {isInputValid && (
              <Alert variant={isExistingUser ? "info" : "light"} className="d-flex align-items-center">
                <CheckCircle size={20} className={`me-2 ${isExistingUser ? 'text-success' : 'text-primary'}`} />
                <div className="flex-grow-1">
                  <strong>{isExistingUser ? 'Existing Visitor Data Loaded' : 'New Visitor Data Ready'}</strong>
                  <div className="small mt-1 text-muted">
                    {verificationMethod === 'email' ? email : formatPhoneNumber(visitor.GMS_MobileNo)}
                  </div>
                  {isExistingUser && visitor.GMS_VisitorName && (
                    <div className="small text-muted mt-1">
                      {visitor.GMS_VisitorName} from {visitor.GMS_VisitorFrom || 'N/A'}
                    </div>
                  )}
                </div>
              </Alert>
            )}

            {otpError && <Alert variant="danger" className="mt-3">{otpError}</Alert>}

            <div className="d-flex justify-content-end mt-4">
              <Button
                onClick={sendOTP}
                disabled={!isInputValid || isOtpSending}
                variant="primary"
                className="d-flex align-items-center"
              >
                {isOtpSending ? (
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                ) : (
                  <ArrowRight size={20} className="me-2" />
                )}
                Continue to OTP Verification
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    );
  };

  // --- STEP 2: Verify OTP ---
  const renderStep2 = () => {
    const contactInfo = verificationMethod === 'email' ? email : formatPhoneNumber(visitor.GMS_MobileNo);
    const isOtpComplete = verificationMethod === 'email' ? enteredOTP.length === 6 : mobileOtp.every(digit => digit.length === 1);

    return (
      <Container className="d-flex justify-content-center">
        <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '600px', border: '1px solid #e0f0ff' }}>
          {/* Stage Header */}
          <StageHeader stepNumber={2} stepName={currentStepName} icon={ShieldCheck} />

          <StepperStatus currentStep={2} />

          <p className="text-center text-muted mb-4">
            A 6-digit OTP has been sent to your {verificationMethod}: <span className="fw-semibold text-dark">{contactInfo}</span>
          </p>

          <Form className='p-4'>
            {verificationMethod === 'email' ? (
              // Email OTP Input
              <Form.Group className="mb-4 text-center">
                <Form.Label className="fw-semibold">Enter OTP</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="------"
                  value={enteredOTP}
                  onChange={(e) => setEnteredOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="form-control-lg text-center fw-bold"
                  style={{ letterSpacing: '10px' }}
                />
              </Form.Group>
            ) : (
              // Mobile OTP Input (6 separate boxes)
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold d-block text-center">Enter OTP</Form.Label>
                <div className="d-flex justify-content-center gap-2">
                  {mobileOtp.map((digit, index) => (
                    <Form.Control
                      key={index}
                      type="tel"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleMobileOtpChange(e, index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          otpInputRefs.current[index - 1].focus();
                        }
                      }}
                      ref={el => otpInputRefs.current[index] = el}
                      className="text-center fw-bold"
                      style={{ width: '40px', height: '40px', fontSize: '1.2rem' }}
                    />
                  ))}
                </div>
              </Form.Group>
            )}

            {otpError && <Alert variant="danger" className="mt-3">{otpError}</Alert>}

            <div className="text-center mb-4">
              {countdown > 0 ? (
                <p className="text-muted small">Resend code in {Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}</p>
              ) : (
                <Button variant="link" onClick={sendOTP} disabled={isOtpSending} className="text-primary p-0">
                  <RefreshCw size={14} className="me-1" /> Resend OTP
                </Button>
              )}
            </div>

            <div className="d-grid gap-2">
              <Button
                onClick={verifyOTP}
                disabled={!isOtpComplete || isOtpVerifying}
                variant="primary"
                className="d-flex align-items-center justify-content-center fw-semibold py-2"
              >
                {isOtpVerifying ? (
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                ) : (
                  <ShieldCheck size={20} className="me-2" />
                )}
                Verify & Proceed
              </Button>
            </div>
            <div className="text-center mt-3">
              <Button variant="link" onClick={() => setStep(1)} disabled={isOtpSending || isOtpVerifying} className="text-secondary p-0">
                <RotateCcw size={14} className="me-1" /> Change Contact
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    );
  };

  // --- STEP 3: Create Visitor ---
  const renderStep3 = () => {
    return (
      <Container className="d-flex justify-content-center">
        <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '900px', border: '1px solid #e0f0ff' }}>
          {/* Stage Header */}
          <StageHeader stepNumber={3} stepName={currentStepName} icon={User} />

          <StepperStatus currentStep={3} />

          <Form className='mt-6' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Row>
              {/* Left Column: Visitor Details */}
              <Col md={6}>
                <Card className="p-3 mb-4 h-100">
                  <h5 className="mb-3 d-flex align-items-center"><User size={20} className="me-2 text-primary" /> Personal Details</h5>

                  <Form.Group className="mb-3">
                    <Form.Label className='fw-semibold'>Full Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="GMS_VisitorName"
                      value={visitor.GMS_VisitorName}
                      onChange={handleChange}
                      isInvalid={!!errors.GMS_VisitorName}
                      readOnly={isFieldAutoPopulated('GMS_VisitorName')}
                    />
                    <Form.Control.Feedback type="invalid">{errors.GMS_VisitorName}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className='fw-semibold'>Company / From</Form.Label>
                    <Form.Control
                      type="text"
                      name="GMS_VisitorFrom"
                      value={visitor.GMS_VisitorFrom}
                      onChange={handleChange}
                      readOnly={isFieldAutoPopulated('GMS_VisitorFrom')}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className='fw-semibold'>Mobile No. <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <InputGroup.Text>+91</InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="GMS_MobileNo"
                        value={visitor.GMS_MobileNo}
                        onChange={handleChange}
                        isInvalid={!!errors.GMS_MobileNo}
                      />
                      <Form.Control.Feedback type="invalid">{errors.GMS_MobileNo}</Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className='fw-semibold'>Email ID</Form.Label>
                    <Form.Control
                      type="email"
                      name="GMS_EmailID"
                      value={visitor.GMS_EmailID}
                      onChange={handleChange}
                      isInvalid={!!errors.GMS_EmailID}
                    />
                    <Form.Control.Feedback type="invalid">{errors.GMS_EmailID}</Form.Control.Feedback>
                  </Form.Group>
                </Card>
              </Col>

              {/* Right Column: Visit Details & Photo */}
              <Col md={6}>
                <Row>
                  <Col xs={12}>
                    <Card className="p-3 mb-4">
                      <h5 className="mb-3 d-flex align-items-center"><BsCamera size={20} className="me-2 text-primary" /> Visitor Photo <span className="text-danger">*</span></h5>
                      <div className="d-flex flex-column align-items-center">
                        {visitor.GMS_VisitorImage ? (
                          <div className="position-relative">
                            <img
                              src={visitor.GMS_VisitorImage}
                              alt="Visitor"
                              className="rounded-3 mb-2"
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={retakePhoto}
                              className="d-flex position-absolute bottom-0 start-50 translate-middle-x mb-2"
                            >
                              <BsArrowRepeat size={14} className="me-1" /> Retake
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className={`border border-2 rounded-3 mb-2 ${!!errors.GMS_VisitorImage ? 'border-danger' : 'border-secondary'}`} style={{ width: '150px', height: '150px', overflow: 'hidden' }}>
                              {showCamera ? (
                                <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%' }}></video>
                              ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted">No Image</div>
                              )}
                              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                            </div>
                            {showCamera ? (
                              <Button className="d-flex p-1" variant="success" onClick={capturePhoto}><BsCamera className="p-1" size={18} /> Capture</Button>
                            ) : (
                              <Button className="d-flex p-1" variant="primary" onClick={startCamera}>  Open Camera</Button>
                            )}
                            {!!errors.GMS_VisitorImage && <div className="text-danger small mt-1">{errors.GMS_VisitorImage}</div>}
                          </>
                        )}
                      </div>
                    </Card>
                  </Col>

                  <Col xs={12}>
                    <Card className="p-3 mb-4">
                      <h5 className="mb-3 d-flex align-items-center"><Info size={20} className="me-2 text-primary" /> Visit Details</h5>

                      <Form.Group className="mb-3">
                        <Form.Label className='fw-semibold'>Purpose of Visit <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="GMS_VisitPurpose"
                          value={visitor.GMS_VisitPurpose}
                          onChange={handleChange}
                          isInvalid={!!errors.GMS_VisitPurpose}
                          required
                        />
                        <Form.Control.Feedback type="invalid">{errors.GMS_VisitPurpose}</Form.Control.Feedback>
                      </Form.Group>

                      {/* START: Corrected 'To Meet' person structure based on user feedback */}
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className='fw-semibold'>Person to Meet <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              as="select"
                              name="GMS_ToMeet"
                              onChange={handleEmployeeSelect}
                              value={visitor.GMS_ToMeet || ''}
                              isInvalid={!!errors.GMS_ToMeet}
                              className='rounded-3'
                              required
                            >
                              <option value="">-- Select Person --</option>
                              {employees.map(emp => (
                                <option
                                  key={emp.id || emp.GMS_EmployeeName}
                                  // Value uses 'name' if available, otherwise 'GMS_EmployeeName'
                                  value={emp.name || emp.GMS_EmployeeName}
                                >
                                  {/* Text uses 'name' if available, otherwise 'GMS_EmployeeName' */}
                                  {emp.name || emp.GMS_EmployeeName || 'Employee Name Missing'}
                                </option>
                              ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.GMS_ToMeet}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className='fw-semibold'>To Meet Person Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="GMS_ToMeetEmail"
                              value={visitor.GMS_ToMeetEmail || 'N/A'}
                              readOnly
                              className='rounded-3 bg-light'
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      {/* END: Corrected 'To Meet' person structure */}
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

            <div className="d-flex justify-content-between mt-4">
              <Button className="d-flex" variant="secondary" onClick={() => setStep(2)}>
                <RotateCcw size={20} className="me-2" />Back to OTP
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting} className="d-flex align-items-center">
                {isSubmitting ? (
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                ) : (
                  <IdCard size={20} className="me-2" />
                )}
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    );
  };

  // --- STEP 4: ID Card/Pass Preview ---
  // const renderStep4 = () => {
  //   return (
  //     <Container className="d-flex justify-content-center">
  //       <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '900px', border: '1px solid #e0f0ff' }}>
  //         {/* Stage Header */}
  //         <StageHeader stepNumber={4} stepName={currentStepName} icon={IdCard} />

  //         <StepperStatus currentStep={4} />

  //         <Card className="shadow-lg mb-4" style={{ maxWidth: '400px', margin: 'auto' }}>
  //           <Card.Body>
  //             <h5 className="text-center text-primary fw-bold mb-3">VISITOR PASS</h5>

  //             <div className="text-center mb-3">
  //               {visitor.GMS_VisitorImage ? (
  //                 <img
  //                   src={visitor.GMS_VisitorImage}
  //                   alt="Visitor"
  //                   className="rounded-circle border border-3 border-primary"
  //                   style={{ width: '100px', height: '100px', objectFit: 'cover' }}
  //                 />
  //               ) : (
  //                 <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto border border-3 border-primary" style={{ width: '100px', height: '100px' }}>
  //                   <User size={40} className="text-secondary" />
  //                 </div>
  //               )}
  //             </div>

  //             <h4 className="text-center fw-bold mb-1">{visitor.GMS_VisitorName}</h4>
  //             <p className="text-center text-muted small mb-3">{visitor.GMS_VisitorFrom}</p>

  //             <div className="bg-light p-3 rounded-3 mb-3">
  //               <Row className="small">
  //                 <Col xs={12} className="mb-1">
  //                   <PhoneCall size={14} className="me-1 text-primary" />
  //                   <span className="fw-medium">Host:</span> {visitor.GMS_ToMeet}
  //                 </Col>
  //                 <Col xs={12} className="mb-1">
  //                   <History size={14} className="me-1 text-primary" />
  //                   <span className="fw-medium">Purpose:</span> {visitor.GMS_VisitPurpose}
  //                 </Col>
  //               </Row>
  //             </div>

  //             <Row className="mt-3 small">
  //               <Col xs={6}><Lock size={14} className="me-1" /> **Pass Code:**</Col>
  //               <Col xs={6} className="fw-semibold text-end">{passCode}</Col>

  //               <Col xs={6}><Calendar size={14} className="me-1" /> **Valid From:**</Col>
  //               <Col xs={6} className="fw-semibold text-end">{validFrom}</Col>

  //               <Col xs={6}><Calendar size={14} className="me-1" /> **Valid To:**</Col>
  //               <Col xs={6} className="fw-semibold text-end">{validTo}</Col>

  //               <Col xs={6}><Info size={14} className="me-1" /> **Entry ID:**</Col>
  //               <Col xs={6} className="fw-semibold text-end">{visitorEntryId}</Col>
  //             </Row>
  //           </Card.Body>
  //         </Card>

  //         <div className="d-flex justify-content-between mt-5">
  //           <Button variant="secondary" onClick={() => setStep(3)}>
  //             <RotateCcw size={20} className="me-2" />Back to Info
  //           </Button>
  //           <Button onClick={() => setStep(5)} variant="primary" className="d-flex align-items-center">
  //             <ArrowRight size={20} className="me-2" />
  //             Continue to Pass Generation
  //           </Button>
  //         </div>
  //       </div>
  //     </Container>
  //   );
  // };

  // --- STEP 4: Virtual ID Card ---
  const renderStep4 = () => {
    // Generate QR code data
    const qrCodeData = `VISITOR:${visitor.GMS_VisitorName}|ID:${passCode}|DATE:${new Date().toISOString().split('T')[0]}`;

    // Handle print ID card
    const handlePrint = () => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
      <html>
        <head>
          <title>Visitor ID Card - ${visitor.GMS_VisitorName}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; }
              @page { size: 85mm 54mm; margin: 0; }
              .print-id-card {
                width: 85mm;
                height: 54mm;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                position: relative;
                overflow: hidden;
                font-family: 'Segoe UI', Arial, sans-serif;
                color: white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .id-header {
                height: 20mm;
                background: rgba(255,255,255,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                border-bottom: 1px solid rgba(255,255,255,0.2);
              }
              .id-content {
                padding: 5mm;
                display: flex;
                gap: 5mm;
              }
              .id-photo {
                width: 25mm;
                height: 25mm;
                border-radius: 50%;
                border: 2px solid white;
                overflow: hidden;
                background: white;
              }
              .id-details {
                flex: 1;
              }
              .id-name {
                font-size: 12pt;
                font-weight: bold;
                margin-bottom: 2mm;
              }
              .id-company {
                font-size: 9pt;
                opacity: 0.9;
                margin-bottom: 3mm;
              }
              .id-number {
                font-size: 10pt;
                background: rgba(255,255,255,0.15);
                padding: 2mm;
                border-radius: 4px;
                text-align: center;
                letter-spacing: 1px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-id-card">
            <div class="id-header">
              <h2 style="margin: 0; font-size: 14pt; font-weight: 600;">VISITOR ID CARD</h2>
            </div>
            <div class="id-content">
              <div class="id-photo">
                ${visitor.GMS_VisitorImage ?
          `<img src="${visitor.GMS_VisitorImage}" alt="Visitor" style="width: 100%; height: 100%; object-fit: cover;" />` :
          '<div style="width: 100%; height: 100%; background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 8pt;">NO PHOTO</div>'
        }
              </div>
              <div class="id-details">
                <div class="id-name">${visitor.GMS_VisitorName}</div>
                <div class="id-company">${visitor.GMS_VisitorFrom || 'Individual Visitor'}</div>
                <div class="id-number">ID: ${passCode}</div>
              </div>
            </div>
            <div style="position: absolute; bottom: 3mm; right: 5mm; font-size: 7pt; opacity: 0.7;">
              ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

    // Handle send email
    const handleSendEmail = () => {
      alert(`Digital ID card would be sent to ${visitor.GMS_EmailID || visitor.GMS_ToMeetEmail || 'visitor email'}`);
    };

    // QR Code Modal
    const QRModal = () => (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Visitor QR Code</h5>
              <button type="button" className="btn-close" onClick={() => setShowQRModal(false)}></button>
            </div>
            <div className="modal-body text-center">
              <div className="mb-3">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="img-fluid rounded-3 shadow" />
                ) : (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading QR Code...</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-light p-3 rounded-3">
                <p><strong>Visitor:</strong> {visitor.GMS_VisitorName}</p>
                <p><strong>ID Number:</strong> <span className="text-primary fw-bold">{passCode}</span></p>
                <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setShowQRModal(false)}>Close</Button>
              <Button variant="primary" onClick={() => window.open(qrCodeUrl, '_blank')}>Download QR</Button>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <Container className="d-flex justify-content-center my-4">
        {showQRModal && <QRModal />}

        <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '900px', border: '1px solid #e0f0ff' }}>
          {/* Stage Header */}
          <StageHeader stepNumber={4} stepName={currentStepName} icon={IdCard} />

          <StepperStatus currentStep={4} />

          <Alert variant="info" className="mb-4 d-flex align-items-center">
            <Info size={18} className="me-2" />
            <strong>Visitor ID Card Generated!</strong> This is your digital identification. Pass details will be set in the next step.
          </Alert>

          <div className="mt-4">
            {/* ID Card Container */}
            <div className="flipperContainer">
              <div className={`flipper ${showBackSide ? 'flipped' : ''}`}>

                {/* FRONT SIDE - Modern Design */}
                <div
                  className="cardFront relative flex flex-col items-center bg-white rounded-[24px] shadow-2xl overflow-hidden cursor-pointer border-0"
                  onClick={() => setShowBackSide(true)}
                  style={{
                    minHeight: '400px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-br-full"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/20 to-transparent rounded-tl-full"></div>

                  {/* Header Section */}
                  <div className="w-full pt-6 pb-4 px-6 text-center">
                    <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                      <h2 className="text-white font-bold text-xl tracking-wider m-0">VISITOR ID CARD</h2>
                    </div>
                    <div className="text-white/80 text-sm mt-2">
                      Digital Identification • {new Date().getFullYear()}
                    </div>
                  </div>

                  {/* Photo Container */}
                  <div className="relative z-10 mt-2">
                    <div className="relative">
                      {/* Outer Glow */}
                      <div className="absolute inset-0 rounded-full blur-lg" style={{
                        background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                        transform: 'scale(1.1)',
                        opacity: '0.3'
                      }}></div>

                      {/* Profile Photo */}
                      <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                        {visitor.GMS_VisitorImage ? (
                          <img
                            src={visitor.GMS_VisitorImage}
                            alt="Visitor"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{
                            background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)'
                          }}>
                            <span className="text-white font-bold text-2xl">
                              {visitor.GMS_VisitorName ? visitor.GMS_VisitorName.charAt(0).toUpperCase() : 'V'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Verification Badge */}
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white">
                        <BadgeCheck size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Visitor Details */}
                  <div className="mt-8 px-8 text-center w-full">
                    <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
                      {visitor.GMS_VisitorName}
                    </h1>
                    <h4 className="text-white/90 text-sm font-medium mb-4">
                      {visitor.GMS_VisitorFrom || 'Individual Visitor'}
                    </h4>

                    {/* ID Number Badge */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <div className="text-white/70 text-xs mb-1 tracking-wider">VISITOR ID</div>
                      <div className="text-white text-xl font-bold tracking-wider font-mono">
                        {passCode}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                      <div className="text-center">
                        <div className="text-white/70 text-xs">ISSUED</div>
                        <div className="text-white font-semibold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/70 text-xs">STATUS</div>
                        <div className="text-white font-semibold">
                          <span className="inline-flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 text-center">
                    <div className="text-white/50 text-xs tracking-wide">
                      Tap to view QR Code • Valid for identification only
                    </div>
                  </div>
                </div>

                {/* BACK SIDE - QR Code Design */}
                <div
                  className="cardBack relative rounded-[24px] shadow-2xl overflow-hidden cursor-pointer border-0"
                  onClick={() => setShowBackSide(false)}
                  style={{
                    minHeight: '400px',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
                  }}
                >
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)',
                    backgroundSize: '100px 100px'
                  }}></div>

                  {/* Content Container */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="text-white/80 text-sm tracking-widest mb-2">DIGITAL VERIFICATION</div>
                      <div className="text-white text-2xl font-bold tracking-wider font-mono">
                        {passCode}
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="relative">
                      {/* QR Code Background */}
                      <div className="bg-white rounded-2xl p-6 shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-1">
                          {qrCodeUrl ? (
                            <img
                              src={qrCodeUrl}
                              alt="QR Code"
                              className="w-64 h-64"
                            />
                          ) : (
                            <div className="w-64 h-64 bg-white rounded-xl flex items-center justify-center">
                              <QrCode size={80} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Corner Decorations */}
                      <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg"></div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg"></div>
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg"></div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg"></div>
                    </div>

                    {/* Instructions */}
                    <div className="mt-8 text-center max-w-md">
                      <p className="text-white/90 text-sm mb-4">
                        Scan this QR code with any smartphone camera for instant verification
                      </p>

                      {/* Contact Info */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-white/70 text-xs mb-2">FOR ASSISTANCE</div>
                        <div className="text-white text-sm font-medium">Security: +1 (234) 567-8900</div>
                        <div className="text-white/80 text-xs mt-1">Available 24/7</div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                      <div className="text-white/50 text-xs tracking-wide">
                        Tap to return • {visitor.GMS_VisitorName}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Card Controls */}
            <div className="mt-8 d-flex justify-content-center align-items-center">
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Button
                  variant="primary"
                  onClick={handlePrint}
                  className="d-flex align-items-center py-2 px-4 rounded-3 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  <i className="bi bi-printer me-2"></i>
                  Print ID Card
                </Button>

                <Button
                  variant="success"
                  onClick={handleSendEmail}
                  className="d-flex align-items-center py-2 px-4 rounded-3 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}
                >
                  <i className="bi bi-envelope-fill me-2"></i>
                  Email Digital Card
                </Button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-8 pt-6 border-top">
              <Button variant="outline-secondary" onClick={() => setStep(3)} className="d-flex rounded-3 fw-semibold px-4">
                <RotateCcw size={20} className="me-2" />Back to Entry
              </Button>
              <Button
                onClick={() => setStep(5)}
                variant="primary"
                className="d-flex align-items-center rounded-3 fw-semibold px-4"
                style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)' }}
              >
                Continue to Pass Creation <ArrowRight size={20} className="ms-2" />
              </Button>
            </div>
          </div>

          {/* Add CSS for flippable card and animations */}
          <style jsx>{`
          .flipperContainer {
            perspective: 1500px;
            width: 100%;
            max-width: 420px;
            margin: 0 auto;
          }
          
          .flipper {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
          }
          
          .flipped {
            transform: rotateY(180deg);
          }
          
          .cardFront, .cardBack {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 15px 12px rgba(0,0,0,0.1);
          }
          
          .cardBack {
            transform: rotateY(180deg);
          }
          
          /* Hover effects */
          .cardFront:hover, .cardBack:hover {
            transform: translateY(-5px);
            transition: transform 0.3s ease;
          }
          
          .flipped .cardBack:hover {
            transform: rotateY(180deg) translateY(-5px);
          }
          
          /* Flip icon animation */
          .flip-horizontal {
            transform: scaleX(-1);
          }
          
          /* Glass morphism effect */
          .glass-effect {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}</style>
        </div>
      </Container>
    );
  };

  // --- STEP 5: Generate Pass ---
  // const renderStep5 = () => {
  //   return (
  //     <Container className="d-flex justify-content-center">
  //       <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '900px', border: '1px solid #e0f0ff' }}>
  //         {/* Stage Header */}
  //         <StageHeader stepNumber={5} stepName={currentStepName} icon={FileText} />

  //         <StepperStatus currentStep={5} />

  //         <Alert variant="info" className="mb-4">
  //           <Info size={18} className="me-2" />
  //           Now set the pass duration and validity for <strong>{visitor.GMS_VisitorName}</strong>
  //         </Alert>

  //         <Form className='mt-4'>
  //           {/* Visitor Info Summary */}
  //           <Card className="mb-4 border-0 shadow-sm rounded-3">
  //             <Card.Body>
  //               <h6 className="fw-semibold mb-3 d-flex align-items-center">
  //                 <User size={18} className="me-2 text-primary" />
  //                 Visitor Information
  //               </h6>
  //               <Row className="g-3">
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Visitor Name</div>
  //                   <div className="fw-semibold">{visitor.GMS_VisitorName}</div>
  //                 </Col>
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Visitor ID</div>
  //                   <div className="fw-semibold text-primary">{passCode}</div>
  //                 </Col>
  //                 <Col xs={6}>
  //                   <div className="text-muted small">To Meet</div>
  //                   <div className="fw-semibold">{visitor.GMS_ToMeet}</div>
  //                 </Col>
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Host Email</div>
  //                   <div className="fw-semibold">{visitor.GMS_ToMeetEmail || 'N/A'}</div>
  //                 </Col>
  //               </Row>
  //             </Card.Body>
  //           </Card>

  //           {/* Pass Duration */}
  //           <Row className="mb-4">
  //             <Col md={6}>
  //               <Form.Group className="mb-3">
  //                 <Form.Label className='fw-semibold'>
  //                   <Calendar size={18} className="me-2 text-primary" />
  //                   Pass Duration (Days) <span className="text-danger">*</span>
  //                 </Form.Label>
  //                 <Form.Select
  //                   value={passDurationDays}
  //                   onChange={(e) => setPassDurationDays(parseInt(e.target.value) || 1)}
  //                   required
  //                   className="rounded-3"
  //                 >
  //                   <option value="1">1 Day (Daily Pass)</option>
  //                   <option value="2">2 Days</option>
  //                   <option value="3">3 Days</option>
  //                   <option value="7">7 Days (Weekly Pass)</option>
  //                   <option value="15">15 Days</option>
  //                   <option value="30">30 Days (Monthly Pass)</option>
  //                   <option value="90">90 Days (Quarterly Pass)</option>
  //                   <option value="365">365 Days (Annual Pass)</option>
  //                 </Form.Select>
  //                 <Form.Text className="text-muted">
  //                   Select how long this pass will be valid
  //                 </Form.Text>
  //               </Form.Group>
  //             </Col>
  //             <Col md={6}>
  //               <Form.Group className="mb-3">
  //                 <Form.Label className='fw-semibold'>
  //                   <Clock size={18} className="me-2 text-primary" />
  //                   Validity Period
  //                 </Form.Label>
  //                 <div className="bg-light p-3 rounded-3">
  //                   <div className="d-flex justify-content-between">
  //                     <div>
  //                       <div className="text-muted small">From</div>
  //                       <div className="fw-semibold">{validFrom}</div>
  //                     </div>
  //                     <div className="text-center">
  //                       <ArrowRight size={20} className="text-secondary" />
  //                     </div>
  //                     <div>
  //                       <div className="text-muted small">To</div>
  //                       <div className="fw-semibold">{validTo}</div>
  //                     </div>
  //                   </div>
  //                   <div className="text-center mt-2">
  //                     <Form.Check
  //                       type="switch"
  //                       id="date-lock-switch"
  //                       label="Require admin approval for extension"
  //                       checked={toDateLocked}
  //                       onChange={(e) => setToDateLocked(e.target.checked)}
  //                       className="small"
  //                     />
  //                   </div>
  //                 </div>
  //               </Form.Group>
  //             </Col>
  //           </Row>

  //           {/* Purpose of Visit */}
  //           <Form.Group className="mb-4">
  //             <Form.Label className='fw-semibold'>
  //               <FileText size={18} className="me-2 text-primary" />
  //               Purpose of Visit (for pass)
  //             </Form.Label>
  //             <Form.Control
  //               as="textarea"
  //               rows={2}
  //               value={visitor.GMS_VisitPurpose}
  //               onChange={(e) => setVisitor(prev => ({ ...prev, GMS_VisitPurpose: e.target.value }))}
  //               className="rounded-3"
  //               placeholder="Enter the purpose for the pass (e.g., Project meeting, Vendor delivery, Client visit)"
  //             />
  //           </Form.Group>

  //           {/* Access Restrictions */}
  //           <Form.Group className="mb-4">
  //             <Form.Label className='fw-semibold'>
  //               <Shield size={18} className="me-2 text-primary" />
  //               Access Restrictions (Optional)
  //             </Form.Label>
  //             <Form.Select className="rounded-3">
  //               <option value="">No restrictions (Standard Access)</option>
  //               <option value="reception">Reception Area Only</option>
  //               <option value="floor1">Floor 1 Access Only</option>
  //               <option value="escorted">Escorted Access Required</option>
  //               <option value="restricted">Restricted Areas Prohibited</option>
  //               <option value="lab">Laboratory Access</option>
  //               <option value="admin">Administrative Areas Only</option>
  //             </Form.Select>
  //             <Form.Text className="text-muted">
  //               Set any specific access restrictions for this visitor
  //             </Form.Text>
  //           </Form.Group>

  //           {/* Notifications */}
  //           <Card className="mb-4 border-0 shadow-sm rounded-3">
  //             <Card.Body>
  //               <h6 className="fw-semibold mb-3 d-flex align-items-center">
  //                 <Smartphone size={18} className="me-2 text-primary" />
  //                 Notifications
  //               </h6>
  //               <Row>
  //                 <Col md={6}>
  //                   <Form.Check
  //                     type="checkbox"
  //                     id="sms-notification"
  //                     label={
  //                       <div>
  //                         <div className="fw-medium">Send SMS to Visitor</div>
  //                         <div className="text-muted small">
  //                           Pass details to {formatPhoneNumber(visitor.GMS_MobileNo)}
  //                         </div>
  //                       </div>
  //                     }
  //                     checked={sendSMS}
  //                     onChange={(e) => setSendSMS(e.target.checked)}
  //                     className="mb-3"
  //                   />
  //                 </Col>
  //                 <Col md={6}>
  //                   <Form.Check
  //                     type="checkbox"
  //                     id="email-notification"
  //                     label={
  //                       <div>
  //                         <div className="fw-medium">Send Email to Host</div>
  //                         <div className="text-muted small">
  //                           Pass details to {visitor.GMS_ToMeetEmail || 'host email'}
  //                         </div>
  //                       </div>
  //                     }
  //                     checked={sendEmail}
  //                     onChange={(e) => setSendEmail(e.target.checked)}
  //                     className="mb-3"
  //                   />
  //                 </Col>
  //               </Row>
  //             </Card.Body>
  //           </Card>

  //           {/* Pass Summary */}
  //           <Card className="mb-4 border border-primary rounded-3">
  //             <Card.Body>
  //               <h6 className="fw-bold text-primary mb-3 d-flex align-items-center">
  //                 <BadgeCheck size={18} className="me-2" />
  //                 Pass Summary
  //               </h6>
  //               <Row className="g-3">
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Pass Type</div>
  //                   <div className="fw-semibold">
  //                     {passDurationDays === 1 ? 'Daily Pass' :
  //                       passDurationDays === 7 ? 'Weekly Pass' :
  //                         passDurationDays === 30 ? 'Monthly Pass' :
  //                           passDurationDays === 365 ? 'Annual Pass' :
  //                             `${passDurationDays} Day Pass`}
  //                   </div>
  //                 </Col>
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Visitor ID</div>
  //                   <div className="fw-semibold text-primary">{passCode}</div>
  //                 </Col>
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Valid From</div>
  //                   <div className="fw-semibold">{validFrom}</div>
  //                 </Col>
  //                 <Col xs={6}>
  //                   <div className="text-muted small">Valid To</div>
  //                   <div className="fw-semibold">{validTo}</div>
  //                 </Col>
  //                 <Col xs={12}>
  //                   <div className="text-muted small">Total Duration</div>
  //                   <div className="fw-semibold">{passDurationDays} day(s)</div>
  //                 </Col>
  //               </Row>
  //             </Card.Body>
  //           </Card>

  //           <div className="d-flex justify-content-between mt-5 pt-4 border-top">
  //             <Button variant="secondary" onClick={() => setStep(4)} className="rounded-3 fw-semibold">
  //               <RotateCcw size={20} className="me-2" />Back to ID Card
  //             </Button>
  //             <Button
  //               onClick={handlePassGeneration}
  //               disabled={isSubmitting}
  //               className='rounded-3 fw-semibold d-flex align-items-center'
  //               style={{ backgroundImage: 'linear-gradient(to right, #198754, #00c087)' }}
  //             >
  //               {isSubmitting ? (
  //                 <>
  //                   <Spinner as="span" animation="border" size="sm" className="me-2" />
  //                   Generating Pass...
  //                 </>
  //               ) : (
  //                 <>
  //                   <BadgeCheck size={20} className="me-1" />
  //                   Generate Visitor Pass
  //                 </>
  //               )}
  //             </Button>
  //           </div>
  //         </Form>
  //       </div>
  //     </Container>
  //   );
  // };

  // --- STEP 5: Create Pass ---

  const renderStep5 = () => {
    // const handlePassGeneration = async () => {
    //   setIsSubmitting(true);
    //   try {
    //     // Check if we have a valid gate entry ID
    //     let actualGateEntryId = visitorEntryId;

    //     // If visitorEntryId looks like a pass code (starts with VST), try to find the actual ID
    //     if (typeof visitorEntryId === 'string' && visitorEntryId.startsWith('VST')) {
    //       const foundId = await findGateEntryByPassCode(visitorEntryId);
    //       if (foundId) {
    //         actualGateEntryId = foundId;
    //       } else {
    //         alert('Could not find gate entry for this pass code. Please go back to Step 3.');
    //         setIsSubmitting(false);
    //         return;
    //       }
    //     }

    //     // Prepare dates in the correct format for PostgreSQL
    //     const formattedValidFrom = `${validFrom} 00:00:00`;
    //     const formattedValidTo = `${validTo} 00:00:00`;

    //     // Prepare the pass data
    //     const passData = {
    //       gateentry_id: actualGateEntryId, // Should be integer
    //       pass_code: passCode, // The pass code string
    //       valid_from: formattedValidFrom,
    //       valid_to: formattedValidTo,
    //       passDurationDays: passDurationDays,
    //       sendSMS: sendSMS,
    //       sendEmail: sendEmail,
    //       passDetails: {
    //         GMS_VisitorName: visitor.GMS_VisitorName,
    //         GMS_MobileNo: visitor.GMS_MobileNo,
    //         GMS_ToMeet: visitor.GMS_ToMeet,
    //         GMS_ToMeetEmail: visitor.GMS_ToMeetEmail,
    //         GMS_VisitPurpose: visitor.GMS_VisitPurpose,
    //         GMS_VisitorFrom: visitor.GMS_VisitorFrom
    //       }
    //     };

    //     console.log('Sending pass generation request:', passData);

    //     const response = await axios.post(`${SERVER_PORT}/generatePass`, passData);

    //     if (response.data.success) {
    //       // Show success message with details
    //       const successMessage = `
    //         ✅ Pass Generated Successfully!

    //         Pass Code: ${response.data.passDetails.pass_code}
    //         Valid From: ${new Date(response.data.passDetails.valid_from).toLocaleDateString()}
    //         Valid To: ${new Date(response.data.passDetails.valid_to).toLocaleDateString()}
    //         Duration: ${response.data.passDetails.duration_days} days
    //         Status: ${response.data.passDetails.status}
    //         Gate Entry ID: ${response.data.passDetails.gateentry_id}

    //         ${sendSMS ? '✓ SMS sent to visitor' : ''}
    //         ${sendEmail ? '✓ Email sent to host' : ''}
    //       `;

    //       alert(successMessage);

    //       // Navigate to success page
    //       setTimeout(() => {
    //         navigate('/visitor-management');
    //       }, 3000);
    //     } else {
    //       alert(response.data.message || 'Failed to generate pass');
    //     }
    //   } catch (error) {
    //     console.error('Error generating pass:', error);
    //     const errorMessage = error.response?.data?.message ||
    //       error.response?.data?.error ||
    //       'Failed to generate pass. Please try again.';
    //     alert(`Error: ${errorMessage}`);
    //   } finally {
    //     setIsSubmitting(false);
    //   }
    // };

    const handlePassGeneration = async () => {
      setIsSubmitting(true);
      try {
        // If we don't have a gate entry ID, we need to create the gate entry first
        let actualGateEntryId = visitorEntryId;

        if (!actualGateEntryId || (typeof actualGateEntryId === 'string' && actualGateEntryId.startsWith('VST'))) {
          // Create gate entry first
          const cleanedVisitorData = cleanSubmissionData(visitor);

          const gateEntryData = {
            ...cleanedVisitorData,
            GMS_PassDuration: passDurationDays,
            GMS_InTime: new Date().toISOString(),
            created_by: 'admin',
          };

          console.log('Creating gate entry first...');
          const gateEntryResponse = await axios.post(`${SERVER_PORT}/visitorlobbyentry`, gateEntryData);

          if (gateEntryResponse.data.success) {
            actualGateEntryId = gateEntryResponse.data.gms_gateentry_id || gateEntryResponse.data.id;
            const newPassCode = gateEntryResponse.data.GMS_PassID || passCode;

            if (!actualGateEntryId) {
              throw new Error('Failed to create gate entry');
            }

            setVisitorEntryId(actualGateEntryId);
            setPassCode(newPassCode);

            alert(`Gate entry created successfully! ID: ${actualGateEntryId}, Pass Code: ${newPassCode}`);
          } else {
            throw new Error(gateEntryResponse.data.message || 'Failed to create gate entry');
          }
        }

        // Now create the pass with the actual dates
        const formattedValidFrom = `${validFrom} 00:00:00`;
        const formattedValidTo = `${validTo} 00:00:00`;

        const passData = {
          gateentry_id: actualGateEntryId,
          pass_code: passCode,
          valid_from: formattedValidFrom,
          valid_to: formattedValidTo,
          passDurationDays: passDurationDays,
          sendSMS: sendSMS,
          sendEmail: sendEmail,
          passDetails: {
            GMS_VisitorName: visitor.GMS_VisitorName,
            GMS_MobileNo: visitor.GMS_MobileNo,
            GMS_ToMeet: visitor.GMS_ToMeet,
            GMS_ToMeetEmail: visitor.GMS_ToMeetEmail,
            GMS_VisitPurpose: visitor.GMS_VisitPurpose,
            GMS_VisitorFrom: visitor.GMS_VisitorFrom
          }
        };

        console.log('Creating pass with data:', passData);

        const response = await axios.post(`${SERVER_PORT}/generatePass`, passData);

        if (response.data.success) {
          const successMessage = `
          ✅ Pass Generated Successfully!
          
          Pass Code: ${response.data.passDetails.pass_code}
          Valid From: ${new Date(response.data.passDetails.valid_from).toLocaleDateString()}
          Valid To: ${new Date(response.data.passDetails.valid_to).toLocaleDateString()}
          Duration: ${passDurationDays} days
          Status: ${response.data.passDetails.status}
          
          ${sendSMS ? '✓ SMS sent to visitor' : ''}
          ${sendEmail ? '✓ Email sent to host' : ''}
        `;

          alert(successMessage);

          // Navigate to success page
          setTimeout(() => {
            navigate('/visitor-management');
          }, 3000);
        } else {
          alert(response.data.message || 'Failed to generate pass');
        }
      } catch (error) {
        console.error('Error in pass generation:', error);
        const errorMessage = error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to generate pass. Please try again.';
        alert(`Error: ${errorMessage}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Container className="d-flex justify-content-center">
        <div className="rounded-4 shadow-lg w-100 p-4 mb-0" style={{ maxWidth: '900px', border: '1px solid #e0f0ff' }}>
          <StageHeader stepNumber={5} stepName={currentStepName} icon={FileText} />
          <StepperStatus currentStep={5} />

          <Alert variant="info" className="mb-4">
            <Info size={18} className="me-2" />
            <strong></strong> Set pass validity and generate visitor pass for <strong>{visitor.GMS_VisitorName}</strong>
          </Alert>

          <Form className='mt-4'>
            {/* Visitor Summary Card */}
            <Card className="mb-4 border-primary border-2 rounded-3 shadow-sm">
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <div className="text-muted small">Visitor Name</div>
                    <div className="fw-bold fs-5">{visitor.GMS_VisitorName}</div>
                    <div className="text-muted small mt-1">{visitor.GMS_VisitorFrom || 'Individual Visitor'}</div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="text-muted small">Visitor ID</div>
                    <div className="fw-bold fs-5 text-primary">{passCode}</div>
                    <div className="text-muted small mt-1">Entry ID: {visitorEntryId}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Pass Configuration Section */}
            <div className="bg-light p-4 rounded-3 mb-4">
              <h5 className="mb-3 d-flex align-items-center">
                <Calendar size={20} className="me-2 text-primary" />
                Pass Configuration
              </h5>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Pass Duration <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      value={passDurationDays}
                      onChange={(e) => setPassDurationDays(parseInt(e.target.value) || 1)}
                      className="rounded-3"
                    >
                      <option value="1">1 Day (Daily Pass)</option>
                      <option value="2">2 Days</option>
                      <option value="3">3 Days</option>
                      <option value="7">7 Days (Weekly Pass)</option>
                      <option value="15">15 Days</option>
                      <option value="30">30 Days (Monthly Pass)</option>
                      <option value="90">90 Days (Quarterly Pass)</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      How long the visitor can access the premises
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      Validity Period
                    </Form.Label>
                    <div className="bg-white p-3 rounded-3 border">
                      <Row className="align-items-center">
                        <Col xs={5}>
                          <div className="text-muted small">From</div>
                          <div className="fw-semibold">{validFrom}</div>
                        </Col>
                        <Col xs={2} className="text-center">
                          <ArrowRight size={20} className="text-secondary" />
                        </Col>
                        <Col xs={5}>
                          <div className="text-muted small">To</div>
                          <div className="fw-semibold">{validTo}</div>
                        </Col>
                      </Row>
                      <div className="mt-2">
                        <Form.Check
                          type="switch"
                          id="admin-approval-switch"
                          label="Require admin approval for extension"
                          checked={toDateLocked}
                          onChange={(e) => setToDateLocked(e.target.checked)}
                          className="small"
                        />
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Access Settings */}
            <Card className="mb-4 border-0 shadow-sm rounded-3">
              <Card.Body>
                <h5 className="mb-3 d-flex align-items-center">
                  <Shield size={20} className="me-2 text-primary" />
                  Access Settings
                </h5>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Access Level</Form.Label>
                  <Form.Select className="rounded-3">
                    <option value="standard">Standard Access (Common Areas)</option>
                    <option value="restricted">Restricted (Escort Required)</option>
                    <option value="full">Full Access (All Areas)</option>
                    <option value="meeting">Meeting Rooms Only</option>
                    <option value="reception">Reception Area Only</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="fw-semibold">Special Instructions (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Any special instructions for security..."
                    className="rounded-3"
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Notifications */}
            <Card className="mb-4 border-success border-2 rounded-3">
              <Card.Body>
                <h5 className="mb-3 d-flex align-items-center text-success">
                  <Smartphone size={20} className="me-2" />
                  Notifications
                </h5>

                <Row>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="sms-switch"
                      label={
                        <div>
                          <div className="fw-semibold">SMS to Visitor</div>
                          <div className="text-muted small">
                            Send pass details to {formatPhoneNumber(visitor.GMS_MobileNo)}
                          </div>
                        </div>
                      }
                      checked={sendSMS}
                      onChange={(e) => setSendSMS(e.target.checked)}
                      className="mb-3"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Check
                      type="switch"
                      id="email-switch"
                      label={
                        <div>
                          <div className="fw-semibold">Email to Host</div>
                          <div className="text-muted small">
                            Notify {visitor.GMS_ToMeet} ({visitor.GMS_ToMeetEmail || 'No email'})
                          </div>
                        </div>
                      }
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="mb-3"
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Pass Summary */}
            <div className="bg-primary bg-opacity-10 p-4 rounded-3 mb-4 border border-primary">
              <h5 className="mb-3 text-primary d-flex align-items-center">
                <BadgeCheck size={20} className="me-2" />
                Pass Summary
              </h5>

              <Row className="g-3">
                <Col xs={6} md={3}>
                  <div className="text-muted small">Pass Type</div>
                  <div className="fw-bold">
                    {passDurationDays === 1 ? 'Daily' :
                      passDurationDays === 7 ? 'Weekly' :
                        passDurationDays === 30 ? 'Monthly' :
                          passDurationDays === 90 ? 'Quarterly' :
                            `${passDurationDays}-Day`} Pass
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-muted small">Pass Code</div>
                  <div className="fw-bold text-primary">{passCode}</div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-muted small">Valid From</div>
                  <div className="fw-bold">{validFrom}</div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-muted small">Valid To</div>
                  <div className="fw-bold">{validTo}</div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted small">Total Duration</div>
                  <div className="fw-bold fs-5">{passDurationDays} day(s)</div>
                </Col>
              </Row>
            </div>

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-5 pt-4 border-top">
              <Button variant="outline-secondary" onClick={() => setStep(4)} className="rounded-3 fw-semibold px-4">
                <RotateCcw size={20} className="me-2" />Back to Entry
              </Button>

              <div className="d-flex gap-3">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    // Preview pass data
                    const passPreview = {
                      gateentry_id: visitorEntryId,
                      pass_code: passCode,
                      visitor: visitor.GMS_VisitorName,
                      duration: `${passDurationDays} days`,
                      validFrom: validFrom,
                      validTo: validTo,
                      notifications: {
                        sms: sendSMS,
                        email: sendEmail
                      }
                    };
                    alert(JSON.stringify(passPreview, null, 2));
                  }}
                  className="rounded-3 fw-semibold px-4"
                >
                  Preview Pass Data
                </Button>

                <Button
                  onClick={handlePassGeneration}
                  disabled={isSubmitting}
                  className='rounded-3 fw-semibold px-4 d-flex align-items-center'
                  style={{ background: 'linear-gradient(135deg, #198754 0%, #00c087 100%)' }}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={20} className="me-1" />
                      Generate Visitor Pass
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    );
  };

  // --- MAIN RENDER --
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" className='me-2'>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading data...</p>
      </Container>
    );
  }

  if (step === 1) return renderStep1();
  if (step === 2) return renderStep2();
  if (step === 3) return renderStep3();
  if (step === 4) return renderStep4();
  if (step === 5) return renderStep5();

  return <Container className="my-5"><Alert variant="danger">Invalid Flow Step</Alert></Container>;
};

export default AddLobbyEntry;