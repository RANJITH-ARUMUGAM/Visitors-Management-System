import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Modal, Form, Button, Container, Row, Col, Alert, Card, Spinner, InputGroup } from 'react-bootstrap';
import { Mail, Phone, ArrowRight, RefreshCw, User, Info, CheckCircle, Check, Users, Eye, BadgeCheck, RotateCcw, ShieldCheck, Printer, Download, QrCode, Send, IdCard, Edit, AlertCircle, Shield } from 'lucide-react';
import { BsCamera, BsArrowRepeat } from 'react-icons/bs';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { SERVER_PORT } from '../../../constant';

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
  const [lobbyEntryId, setLobbyEntryId] = useState(null);


  // Camera Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);


  // ID Card State
  const [showBackSide, setShowBackSide] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [sendingCard, setSendingCard] = useState(false);
  const [cardSent, setCardSent] = useState(false);

  const [showConfirmation, setShowConfirmation] = useState(false);

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
        // console.log("response", response);
        const formatted = response.data.allEmployee ? response.data.allEmployee : response.data;
        setEmployees(formatted);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchOldVisitors = async () => {
      try {
        const res = await axios.get(`${SERVER_PORT}/getOldVisitors`);
        console.log('Old Visitors fetched:', res.data);
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

  // Steps configuration with step names - UPDATED to 5 steps
  const steps = useMemo(() => ([
    { id: 1, name: 'Visitor', icon: Users, label: 'Select Visitor' },
    { id: 2, name: 'Verify OTP', icon: ShieldCheck, label: 'Verify OTP' },
    { id: 3, name: 'Entry', icon: User, label: 'Create Visitor' },
    { id: 4, name: 'View Entry', icon: IdCard, label: 'Virtual ID Card' },
    { id: 5, name: 'Generate Pass', icon: CheckCircle, label: 'Complete' },
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

  // In your AddGateEntry.js component, update the checkExistingVisitor function:

  const checkExistingVisitor = async (contactInfo, contactType) => {
    try {
      const response = await axios.post(`${SERVER_PORT}/checkExistingVisitor`, {
        contact_info: contactInfo,
        contact_type: contactType
      });

      if (response.data.success && response.data.exists && response.data.visitor) {
        const data = response.data.visitor;
        setIsExistingUser(true);

        // Auto-populate ALL fields for returning visitor
        setVisitor({
          GMS_VisitorName: data.GMS_VisitorName || '',
          GMS_VisitorFrom: data.GMS_VisitorFrom || '',
          GMS_ToMeet: data.GMS_ToMeet || '',
          GMS_VisitPurpose: data.GMS_VisitPurpose || '',
          GMS_IdentificationType: data.GMS_IdentificationType || '',
          GMS_IdentificationNo: data.GMS_IdentificationNo || '',
          GMS_MobileNo: data.GMS_MobileNo || (contactType === 'phone' ? contactInfo : ''),
          GMS_EmailID: data.GMS_EmailID || (contactType === 'email' ? contactInfo : ''),
          GMS_VisitorImage: data.GMS_VisitorImage || null,
          address: data.address || '',
          gender: data.gender || ''
        });

        // If it's a frequent visitor (more than 3 visits), skip OTP verification
        if (response.data.is_frequent_visitor) {
          // Show confirmation alert
          if (window.confirm(
            `Welcome back ${data.GMS_VisitorName}!\n\n` +
            `You have visited ${response.data.total_visits} times.\n` +
            `Your previous details are loaded. Continue without OTP verification?`
          )) {
            // Skip OTP and go directly to Step 3
            setStep(3);
            return true;
          }
        }

        // Regular returning visitor - continue with OTP
        return true;
      } else {
        // New Visitor: Clear previous state, keep only the contact info
        setIsExistingUser(false);
        setVisitor({
          ...initialVisitorState,
          // Restore only the contact info the user entered
          GMS_MobileNo: contactType === 'phone' ? contactInfo : initialVisitorState.GMS_MobileNo,
          GMS_EmailID: contactType === 'email' ? contactInfo : initialVisitorState.GMS_EmailID,
        });
        setEmail(contactType === 'email' ? contactInfo : initialVisitorState.GMS_EmailID);
        return false;
      }
    } catch (error) {
      console.error('Error checking existing visitor:', error);
      setIsExistingUser(false);
      return false;
    }
  };

  // Add this function to handle quick submission for returning visitors
  const handleQuickSubmitForReturningVisitor = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const submissionData = {
        ...visitor,
        GMS_InTime: new Date().toISOString(),
        created_by: 'admin',
      };

      const response = await axios.post(
        `${SERVER_PORT}/visitorlobbyentry`,
        submissionData
      );

      // Extract IDs from response
      const lobbyId = response.data.gms_lobbyentry_id;
      const generatedPassCode = response.data.GMS_PassID || `VST-${Date.now().toString().slice(-6)}`;
      const tempVisitorCode = response.data.tempVisitorId || `TEMP-${Date.now().toString().slice(-8)}`;

      setLobbyEntryId(lobbyId);
      setVisitorEntryId(tempVisitorCode);
      setPassCode(generatedPassCode);

      // Send notifications (optional for quick submit)
      try {
        await axios.post(`${SERVER_PORT}/sendVisitorNotification`, {
          lobbyEntryId: lobbyId,
          passCode: generatedPassCode,
          tempVisitorId: tempVisitorCode,
          visitor,
          qrCodeUrl
        });
      } catch (notifyError) {
        console.warn('Notification failed, continuing:', notifyError);
      }

      // Skip to Step 5 directly
      setStep(5);

      alert(`✅ Welcome back ${visitor.GMS_VisitorName}!\n\n` +
        `Your visit has been recorded.\n` +
        `Pass Code: ${generatedPassCode}\n` +
        `Go to ID Card.`);

    } catch (error) {
      console.error('Quick submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit visit');
    } finally {
      setIsSubmitting(false);
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

      const response = await axios.post(
        `${SERVER_PORT}/visitorlobbyentry`,
        submissionData
      );

      console.log('Visitor creation response:', response.data);

      /* ================================
         1. EXTRACT INTEGER LOBBY ID
      ================================= */
      const lobbyId =
        response.data.gms_lobbyentry_id ||
        response.data.GMS_LobbyEntryID ||
        response.data.lobby_entry_id ||
        response.data.id ||
        null;

      /* ================================
         2. EXTRACT / GENERATE PASS CODE
      ================================= */
      const generatedPassCode =
        response.data.GMS_PassID ||
        response.data.passCode ||
        response.data.pass_code ||
        response.data.pass_id ||
        `VST-${Date.now().toString().slice(-6)}`;

      /* ================================
         3. HANDLE TEMP VISITOR CODE
      ================================= */
      const tempVisitorCode =
        response.data.tempVisitorId ||
        response.data.visitor_code ||
        `TEMP-${Date.now().toString().slice(-8)}`;

      if (!lobbyId) {
        console.warn('⚠️ Lobby entry ID not returned from server');

        alert(
          '⚠️ Lobby entry ID was not returned from the server.\n\n' +
          'A temporary visitor ID has been generated.\n\n' +
          'Notification logging will be skipped.'
        );

        // DB ID missing → do NOT set lobbyEntryId
        setLobbyEntryId(null);
      } else {
        setLobbyEntryId(lobbyId); // ✅ INTEGER ONLY
      }

      // These always exist
      setVisitorEntryId(tempVisitorCode); // TEMP-xxxx
      setPassCode(generatedPassCode);

      console.log('Stored IDs:', {
        lobbyEntryId: lobbyId,
        visitorEntryId: tempVisitorCode,
        passCode: generatedPassCode,
      });

      setStep(4);
      setSubmissionStatus('success');

      setTimeout(() => {
        alert(
          `✅ Visitor information saved successfully!\n\n` +
          `Pass Code: ${generatedPassCode}\n\n` +
          `Proceed to ID Card preview.`
        );
      }, 200);

    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      setError(
        error.response?.data?.message ||
        error.message ||
        'Failed to submit visitor entry'
      );
    } finally {
      setIsSubmitting(false);
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

  // Send ID card to visitor
  const sendIDCardToVisitor = async () => {
    setSendingCard(true);
    try {
      // First send notifications (from Step 4 logic)
      await axios.post(`${SERVER_PORT}/sendVisitorNotification`, {
        lobbyEntryId,
        passCode,
        tempVisitorId: visitorEntryId,
        visitor,
        qrCodeUrl,
        type: 'id_card'
      });

      // Then send the digital ID card
      const response = await axios.post(`${SERVER_PORT}/sendDigitalIDCard`, {
        visitorEmail: visitor.GMS_EmailID,
        visitorMobile: visitor.GMS_MobileNo,
        visitorName: visitor.GMS_VisitorName,
        passCode: passCode,
        qrCodeUrl: qrCodeUrl,
        validFrom: validFrom,
        validTo: validTo,
        visitPurpose: visitor.GMS_VisitPurpose,
        hostName: visitor.GMS_ToMeet,
        visitorImage: visitor.GMS_VisitorImage
      });

      if (response.data.success) {
        setCardSent(true);
        alert('Digital ID Card sent successfully to visitor!');
      } else {
        throw new Error(response.data.message || 'Failed to send ID card');
      }
    } catch (error) {
      console.error('Error sending ID card:', error);
      alert('Failed to send ID card: ' + (error.response?.data?.message || error.message));
    } finally {
      setSendingCard(false);
    }
  };

  // Print ID card
  const printIDCard = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
          <head>
            <title>Visitor ID Card - ${visitor.GMS_VisitorName}</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; background: white; font-family: 'Segoe UI', Arial, sans-serif; }
                @page { size: 85mm 54mm; margin: 0; }
                .id-card {
                  width: 85mm;
                  height: 54mm;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  border-radius: 8px;
                  position: relative;
                  overflow: hidden;
                  color: white;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header {
                  height: 12mm;
                  background: rgba(255,255,255,0.1);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border-bottom: 1px solid rgba(255,255,255,0.2);
                }
                .content {
                  padding: 4mm;
                  display: flex;
                  gap: 4mm;
                  align-items: center;

                }
                .photo {
                  width: 20mm;
                  height: 20mm;
                  border-radius: 50%;
                  border: 2px solid white;
                  overflow: hidden;
                  background: white;
                  flex-shrink: 0;
                }
                .details {
                  flex: 1;
                }
                .name {
                  font-size: 9pt;
                  font-weight: bold;
                  margin-bottom: 1mm;
                }
                .company {
                  font-size: 7pt;
                  opacity: 0.9;
                  margin-bottom: 2mm;
                }
                .id-number {
                  font-size: 8pt;
                  background: rgba(255,255,255,0.15);
                  padding: 2mm;
                  border-radius: 4px;
                  text-align: center;
                  letter-spacing: 1px;
                }
                .footer {
                  position: absolute;
                  bottom: 2mm;
                  right: 4mm;
                  font-size: 6pt;
                  opacity: 0.7;
                }
                .qr-code {
                  position: absolute;
                  bottom: 2mm;
                  left: 4mm;
                  width: 15mm;
                  height: 15mm;
                  background: white;
                  padding: 1mm;
                  border-radius: 4px;
                }
              }
            </style>
          </head>
          <body>
            <div class="id-card">
              <div class="header">
                <h3 style="margin: 0; font-size: 9pt; font-weight: 600;">VISITOR ID CARD</h3>
              </div>
              <div class="content">
                <div class="photo">
                  ${visitor.GMS_VisitorImage ?
        `<img src="${visitor.GMS_VisitorImage}" alt="Visitor" style="width: 100%; height: 100%; object-fit: cover;" />` :
        '<div style="width: 100%; height: 100%; background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 6pt;">NO PHOTO</div>'
      }
                </div>
                <div class="details">
                  <div class="name">${visitor.GMS_VisitorName}</div>
                  <div class="company">${visitor.GMS_VisitorFrom || 'Individual Visitor'}</div>
                  <div class="id-number">ID: ${passCode}</div>
                </div>
              </div>
              <div class="qr-code">
                ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="QR Code" style="width: 100%; height: 100%;" />` : 'QR Code'}
              </div>
              <div class="footer">
                Valid until: ${validTo}
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

  // Download ID card as PDF
  const downloadIDCard = () => {
    alert('PDF download functionality would be implemented here');
    // In a real implementation, you would generate and download a PDF
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const message = `Hello ${visitor.GMS_VisitorName}, your visitor ID card is ready!\n\n` +
      `Pass Code: ${passCode}\n` +
      `Valid Until: ${validTo}\n` +
      `Host: ${visitor.GMS_ToMeet}\n\n` +
      `Scan QR code for quick access: ${qrCodeUrl}`;

    const whatsappUrl = `https://wa.me/${visitor.GMS_MobileNo.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // --- Common Stage Header Component ---
  const StageHeader = ({ stepNumber, stepName, icon: Icon }) => (
    <div className="mb-4 text-left">
      <div className="d-flex align-items-left justify-content-left mb-2">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
          style={{ width: '40px', height: '40px' }}>
          <Icon size={20} />
        </div>
        <div>
          <h2 className="fs-4 fw-bold text-gray-800 m-0">{stepName}</h2>
          <p className="text-muted mb-0 small">
            {stepNumber === 1 && 'Search existing visitor or enter new contact'}
            {stepNumber === 2 && 'Verify your contact with OTP'}
            {stepNumber === 3 && 'Enter visitor details and capture photo'}
            {stepNumber === 4 && 'Review and preview visitor ID card'}
            {stepNumber === 5 && 'Visitor registration completed'}
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

            {/* Visitor Info Preview - REPLACE THIS SECTION WITH THE CODE ABOVE */}
            {isInputValid && (
              <>
                {/* For NEW visitors */}
                {!isExistingUser && (
                  <Alert variant="light" className="d-flex align-items-center">
                    <CheckCircle size={20} className="me-2 text-primary" />
                    <div className="flex-grow-1">
                      <strong>New Visitor Data Ready</strong>
                      <div className="small mt-1 text-muted">
                        {verificationMethod === 'email' ? email : formatPhoneNumber(visitor.GMS_MobileNo)}
                      </div>
                    </div>
                  </Alert>
                )}

                {/* For RETURNING visitors - ENHANCED with skip OTP button */}
                {isExistingUser && (
                  <Alert variant="success" className="d-flex align-items-center mt-3">
                    <CheckCircle size={20} className="me-2" />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Returning Visitor Found! ✓</strong>
                          <div className="small mt-1">
                            {visitor.GMS_VisitorName} from {visitor.GMS_VisitorFrom || 'Individual Visitor'}
                          </div>
                          <div className="small text-muted mt-1">
                            {verificationMethod === 'email' ? email : formatPhoneNumber(visitor.GMS_MobileNo)}
                          </div>
                          {visitor.GMS_EmailID && visitor.GMS_MobileNo && (
                            <div className="small text-muted mt-1">
                              📧 {visitor.GMS_EmailID} • 📱 {formatPhoneNumber(visitor.GMS_MobileNo)}
                            </div>
                          )}
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => {
                              // Skip OTP and go directly to Step 3
                              setStep(3);
                            }}
                            className="d-flex align-items-center"
                          >
                            <ArrowRight size={16} className="me-1" />
                            Skip OTP & Continue
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => {
                              setAllowDataUpdate(true);
                              alert("You can now update your information if needed.");
                            }}
                            className="text-secondary p-0 small"
                          >
                            <Edit size={12} className="me-1" />
                            Update Information
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Alert>
                )}
              </>
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
              {/* left Column: Visit Details & Photo */}
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

              {/* Right Column: Visitor Details */}
              <Col md={6}>
                <Card className="p-3 mb-4">
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
            </Row>


            {isExistingUser && (
              <Alert variant="info" className="mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <CheckCircle className="me-2" />
                    <strong>Returning Visitor Detected</strong>
                    <div className="small">
                      All your previous details are pre-filled. You can quick submit or modify as needed.
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleQuickSubmitForReturningVisitor}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                    ) : (
                      <CheckCircle size={16} className="me-2" />
                    )}
                    Quick Submit Visit
                  </Button>
                </div>
              </Alert>
            )}

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
  const renderStep4 = () => {


    const handleConfirmAndNotify = async () => {
      // Show the confirmation modal instead of window.confirm
      setShowConfirmation(true);
    };

    const handleProceed = async () => {
      setShowConfirmation(false);
      setIsSubmitting(true);
      try {
        await axios.post(`${SERVER_PORT}/sendVisitorNotification`, {
          lobbyEntryId,
          passCode,
          tempVisitorId: visitorEntryId,
          visitor,
          qrCodeUrl
        });
        alert('Notifications sent successfully');
        setStep(5);
      } catch {
        alert('Notification failed');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <>
        {/* Confirmation Modal */}
        <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="d-flex fw-bold">
              <Shield size={20} className="me-2 text-warning" />
              Confirm & Send Notifications
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex">
              <AlertCircle size={24} className="text-warning me-3 flex-shrink-0" />
              <div>
                <h6 className="fw-bold mb-2">Are you sure you want to proceed?</h6>
                <p className="mb-1">This action will:</p>
                <ul className="small">
                  <li>Send email/SMS notifications to <strong>{visitor.GMS_VisitorName}</strong></li>
                  <li>Notify host <strong>{visitor.GMS_ToMeet}</strong></li>
                  <li>Issue pass code <strong className="text-primary">{passCode}</strong></li>
                  <li>Proceed to the final step</li>
                </ul>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleProceed}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Sending...
                </>
              ) : (
                'Yes'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Rest of your existing JSX code remains the same */}
        <Container fluid className="d-flex justify-content-center py-5">
          <div style={{ maxWidth: 1100 }} className="w-100">

            <StepperStatus currentStep={4} />

            <div
              className="p-2 rounded-4 shadow-lg"
              style={{
                background: 'linear-gradient(135deg,#f8fafc,#eef2ff)',
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Header */}
              <div className="d-flex align-items-center mb-4">
                <Eye size={26} className="text-primary me-3" />
                <div>
                  <h4 className="fw-bold mb-0">Review & Confirm</h4>
                  <small className="text-muted">
                    Verify visitor details before issuing access
                  </small>
                </div>
              </div>

              <Row className="g-4 align-items-stretch">

                {/* Visitor Image */}
                <Col md={3}>
                  <div className="bg-white rounded-4 p-3 shadow-sm h-100">
                    <div className="fw-semibold text-primary mb-2">Visitor Photo</div>
                    <img
                      src={visitor.GMS_VisitorImage}
                      alt="Visitor"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </div>
                </Col>

                {/* Visitor Details */}
                <Col md={5}>
                  <div className="bg-white rounded-4 p-4 shadow-sm h-100">
                    <div className="fw-semibold text-primary mb-3">
                      Visitor Information
                    </div>

                    <div className="info-row">
                      <span>Full Name</span>
                      <strong>{visitor.GMS_VisitorName}</strong>
                    </div>

                    <div className="info-row">
                      <span>Company</span>
                      <strong>{visitor.GMS_VisitorFrom || '—'}</strong>
                    </div>

                    <div className="info-row">
                      <span>Mobile</span>
                      <strong>{visitor.GMS_MobileNo}</strong>
                    </div>

                    <div className="info-row">
                      <span>Email</span>
                      <strong>{visitor.GMS_EmailID || '—'}</strong>
                    </div>
                  </div>
                </Col>

                {/* Visit & Pass Info */}
                <Col md={4}>
                  <div className="bg-white rounded-4 p-4 shadow-sm h-100">
                    <div className="fw-semibold text-primary mb-3">
                      To Meet & Access Details
                    </div>

                    <div className="info-row">
                      <span>Host</span>
                      <strong>{visitor.GMS_ToMeet}</strong>
                    </div>

                    <div className="info-row">
                      <span>Host Email</span>
                      <strong>{visitor.GMS_ToMeetEmail}</strong>
                    </div>

                    <div className="info-row">
                      <span>Purpose</span>
                      <strong>{visitor.GMS_VisitPurpose}</strong>
                    </div>

                    <div className="info-row">
                      <span>Visitor ID</span>
                      <strong>{visitorEntryId}</strong>
                    </div>

                    <div className="info-row">
                      <span>Pass Code</span>
                      <strong className="text-primary">{passCode}</strong>
                    </div>
                  </div>
                </Col>

              </Row>

              {/* QR Section */}
              {/* <div className="mt-4 bg-white rounded-4 p-4 shadow-sm">
              <Row className="align-items-center">
                <Col md={9}>
                  <div className="fw-semibold mb-1">QR Code for Next Visit</div>
                  <div className="text-muted small">
                    Scan at reception for quick check-in
                  </div>
                </Col>
                <Col md={3} className="text-end">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{
                      width: 120,
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </Col>
              </Row>
            </div> */}

              {/* Action Bar */}
              <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-secondary" className="d-flex align-items-center gap-2 rounded-3 fw-semibold px-4" onClick={() => setStep(3)}>
                  <RotateCcw size={18} />
                  Back
                </Button>

                <Button
                  disabled={isSubmitting}
                  onClick={handleConfirmAndNotify}
                  className="px-4 fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg,#2563eb,#4f46e5)',
                    border: 'none'
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Confirm & Send Notification'}
                </Button>
              </div>
            </div>
          </div>

          {/* Local styles */}
          <style>
            {`
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #e5e7eb;
            font-size: 0.9rem;
          }
          .info-row span {
            color: #6b7280;
          }
        `}
          </style>
        </Container>
      </>
    );
  };

  // --- STEP 5: Completion Screen ---
  const renderStep5 = () => {
    return (
      <Container className="d-flex justify-content-center my-1">
        <div className="rounded-4 shadow-lg w-100 p-3 mb-0" style={{ maxWidth: '1000px', border: '1px solid #e0f0ff' }}>
          {/* Stage Header */}
          <StageHeader stepNumber={5} stepName={currentStepName} icon={IdCard} />

          <StepperStatus currentStep={5} />

          {/* Success Alert */}
          {cardSent && (
            <Alert variant="success" className="d-flex align-items-center">
              <CheckCircle size={20} className="me-2" />
              <div>
                <strong>Digital ID Card Sent Successfully!</strong>
                <div className="small">The ID card has been sent to {visitor.GMS_EmailID || visitor.GMS_MobileNo}</div>
              </div>
            </Alert>
          )}

          <div className="mt-5">
            <Row className="g-4 justify-content-end align-items-start">
              {/* LEFT SIDE – ID CARD */}
              <Col xl={5} lg={5} md={12}>
                <div className="flipperContainer mb-0 ml-10">
                  <div className={`flipper ${showBackSide ? 'flipped' : ''}`}>

                    {/* FRONT SIDE */}
                    <div
                      className="cardFront visitor-id-front"
                      onClick={() => setShowBackSide(true)}
                    >
                      {/* Header */}
                      <div className="id-header">
                        <h2>DIGITAL VISITOR ID</h2>
                        <span>{new Date().getFullYear()} • Valid until {validTo}</span>
                      </div>

                      {/* Profile */}
                      <div className="id-profile">
                        <div className="photo-box">
                          {visitor.GMS_VisitorImage ? (
                            <img src={visitor.GMS_VisitorImage} alt="Visitor" />
                          ) : (
                            <div className="photo-fallback">
                              {visitor.GMS_VisitorName?.charAt(0)}
                            </div>
                          )}
                          <div className="verify-badge">
                            <BadgeCheck size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Name & Org */}
                      <div className="id-name">
                        <h4>{visitor.GMS_VisitorName}</h4>
                        <p>{visitor.GMS_VisitorFrom || 'Individual Visitor'}</p>
                      </div>

                      {/* Visitor Code */}
                      <div className="id-code">
                        <span>VISITOR ID</span>
                        <strong>{passCode}</strong>
                      </div>

                    </div>

                    {/* BACK SIDE */}
                    <div
                      className="cardBack visitor-id-back"
                      onClick={() => setShowBackSide(false)}
                    >
                      <div className="back-content">
                        <div className="back-code">{passCode}</div>

                        <div className="qr-box">
                          {qrCodeUrl ? (
                            <img src={qrCodeUrl} alt="QR Code" />
                          ) : (
                            <QrCode size={120} />
                          )}
                        </div>

                        <p>Scan at reception for verification</p>
                      </div>
                    </div>

                  </div>
                </div>
              </Col>

              {/* RIGHT SIDE – ACTION CARDS (2 PER ROW) */}
              <Col xl={7} lg={7} md={12}>
                <div>
                  <h5 className="mb-4 text-muted text-end">Share & Actions</h5>

                  <Row className="g-4 justify-content-end">

                    {/* SEND TO VISITOR */}
                    <Col md={6}>
                      <div className={`action-card ${cardSent ? 'disabled' : ''}`}>
                        <div
                          className="icon bg-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!sendingCard && !cardSent) sendIDCardToVisitor();
                          }}
                        >
                          {sendingCard ? <Spinner size="sm" /> : <Send size={22} />}
                        </div>

                        <div
                          className="content"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!sendingCard && !cardSent) sendIDCardToVisitor();
                          }}
                        >
                          <div className="title">
                            {cardSent ? 'Sent to Visitor' : 'Send to Visitor'}
                          </div>
                          <div className="subtitle">
                            {visitor.GMS_EmailID || visitor.GMS_MobileNo}
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* WHATSAPP */}
                    <Col md={6}>
                      <div className="action-card" onClick={shareViaWhatsApp}>
                        <div className="icon bg-success">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967..." />
                          </svg>
                        </div>
                        <div className="content">
                          <div className="title">WhatsApp</div>
                          <div className="subtitle">Instant share</div>
                        </div>
                      </div>
                    </Col>

                    {/* PRINT */}
                    <Col md={6}>
                      <div className="action-card" onClick={printIDCard}>
                        <div className="icon bg-secondary">
                          <Printer size={22} />
                        </div>
                        <div className="content">
                          <div className="title">Print ID Card</div>
                          <div className="subtitle">Physical copy</div>
                        </div>
                      </div>
                    </Col>

                    {/* DOWNLOAD */}
                    <Col md={6}>
                      <div className="action-card" onClick={downloadIDCard}>
                        <div className="icon bg-emerald">
                          <Download size={22} />
                        </div>
                        <div className="content">
                          <div className="title">Download PDF</div>
                          <div className="subtitle">Save offline</div>
                        </div>
                      </div>
                    </Col>

                  </Row>
                </div>
              </Col>
            </Row>

            {/* ===== STEP 5 NAVIGATION ===== */}
            <div className="d-flex justify-content-between align-items-center border-top">

              {/* BACK */}
              <Button
                variant="outline-secondary"
                onClick={() => setStep(4)}
                className="d-flex align-items-center gap-2 rounded-3 fw-semibold px-4"
              >

              </Button>

              {/* RIGHT ACTIONS */}
              <div className="d-flex gap-3">

                {/* NEW VISITOR */}
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    setVisitor(initialVisitorState);
                    setStep(1);
                    setEmail('');
                    setOtpSent(false);
                    setEnteredOTP('');
                    setMobileOtp(['', '', '', '', '', '']);
                    setVisitorEntryId('');
                    setPassCode('');
                    setLobbyEntryId(null);
                    setCardSent(false);
                  }}
                  className="d-flex align-items-center gap-2 rounded-3 fw-semibold"
                >
                  <User size={18} />
                  New Visitor
                </Button>

                {/* COMPLETE */}
                <Button
                  variant="success"
                  onClick={() => navigate('/dashboard')}
                  className="d-flex align-items-center gap-2 rounded-3 fw-semibold px-4"
                >
                  <CheckCircle size={18} />
                  Complete
                </Button>

              </div>
            </div>
          </div>


          {/* Add CSS for flippable card and animations */}
          <style jsx>{`
          /* ===== VISITOR ID CARD (LEFT SIDE ONLY) ===== */

          .visitor-id-front,
          .visitor-id-back {
            min-height: 360px;                     /* ⬇ reduced height */
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 24px;
            padding: 22px 26px;                    /* ⬅ wider feel, less vertical */
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Header */
          .id-header {
            text-align: center;
            margin-bottom: 16px;                   /* ⬇ tighter */
          }

          .id-header h2 {
            font-size: 1.15rem;
            font-weight: 700;
            margin: 0;
          }

          .id-header span {
            font-size: 0.75rem;
            opacity: 0.85;
          }

          /* Profile */
          .id-profile {
            margin-bottom: 14px;
          }

          .photo-box {
            width: 112px;
            height: 112px;
            border-radius: 14px;
            overflow: hidden;
            background: #fff;
            border: 3px solid #fff;
            box-shadow: 0 10px 22px rgba(0,0,0,0.22);
            position: relative;
          }

          .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .photo-fallback {
            width: 100%;
            height: 100%;
            background: #4f46e5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            font-weight: 700;
          }

          .verify-badge {
            position: absolute;
            bottom: -6px;
            right: -6px;
            background: #22c55e;
            border-radius: 50%;
            padding: 6px;
            border: 2px solid #fff;
          }

          /* Name */
          .id-name {
            text-align: center;
            margin-bottom: 14px;
          }

          .id-name h4 {
            margin: 0;
            font-weight: 700;
            font-size: 1.05rem;
          }

          .id-name p {
            margin: 3px 0 0;
            opacity: 0.9;
            font-size: 0.82rem;
          }

          /* Visitor Code */
          .id-code {
            background: rgba(255,255,255,0.15);
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 14px;
            padding: 10px 14px;                    /* ⬇ compressed */
            text-align: center;
            margin-bottom: 10px;
            width: 100%;
          }

          .id-code span {
            font-size: 0.65rem;
            opacity: 0.75;
          }

          .id-code strong {
            display: block;
            font-size: 1.25rem;
            font-family: monospace;
          }

          /* Meta */
          .id-meta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;                             /* ⬇ tighter */
            width: 100%;
            text-align: center;
          }

          .id-meta label {
            font-size: 0.65rem;
            opacity: 0.75;
          }

          .id-meta div div {
            font-weight: 600;
            font-size: 0.85rem;
          }

          /* Hint */
          .id-hint {
            margin-top: auto;
            font-size: 0.7rem;
            opacity: 0.55;
          }

          /* ===== BACK SIDE ===== */

          .visitor-id-back {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
          }

          .back-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .back-code {
            font-family: monospace;
            font-size: 1.25rem;
            margin-bottom: 14px;
          }

          .qr-box {
            background: #fff;
            padding: 14px;
            border-radius: 16px;
          }

          .qr-box img {
            width: 210px;                          /* ⬇ scaled to height */
          }

          /* ===== ACTION CARDS (UNCHANGED) ===== */

          .action-card {
            display: flex;
            align-items: center;
            gap: 16px;
            height: 110px;
            padding: 18px 20px;
            border-radius: 16px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: all 0.25s ease;
          }

          .action-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 18px 35px rgba(0,0,0,0.12);
          }

          .action-card.disabled {
            opacity: 0.6;
            cursor: not-allowed;
            pointer-events: none;
          }

          .action-card .icon {
            min-width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 22px;
          }

          .content {
              display: flex;
              flex-direction: column;
              flex-grow: 1;
          }

          .action-card .content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            line-height: 1.3;
          }

          .action-card .title {
            font-weight: 600;
            font-size: 0.95rem;
            color: #111827;
            white-space: nowrap;
          }

          .action-card .subtitle {
            font-size: 0.8rem;
            color: #6b7280;
            margin-top: 4px;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .icon.bg-primary {
            background: linear-gradient(135deg,#667eea,#764ba2);
          }
          .icon.bg-success {
            background: linear-gradient(135deg,#22c55e,#16a34a);
          }
          .icon.bg-secondary {
            background: linear-gradient(135deg,#6b7280,#4b5563);
          }
          .icon.bg-emerald {
            background: linear-gradient(135deg,#10b981,#059669);
          }
          `}</style>

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