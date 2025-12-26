import React, { useState, useEffect } from 'react';
import {  X,  User,  Shield,  Clock,  Phone,  FileText,  Building,  Calendar,  Mail,  ChevronDown,  Key,  QrCode,  BadgeCheck,  Search,  Users,  CheckCircle,  Clock as ClockIcon,  History,  AlertCircle,  Smartphone,  Lock,  RotateCcw,  PhoneCall,  ShieldCheck,  Send,  Eye,  Edit} from 'lucide-react';

const registeredVisitors = [
  { id: 'V001', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1 (555) 123-4567', lastVisit: '2024-01-15', visits: 5 },
  { id: 'V002', name: 'Emily Davis', company: 'Design Studio', email: 'emily@design.com', phone: '+1 (555) 234-5678', lastVisit: '2024-01-20', visits: 3 },
  { id: 'V003', name: 'Robert Wilson', company: 'Global Systems', email: 'robert@global.com', phone: '+1 (555) 345-6789', lastVisit: '2024-01-18', visits: 12 },
  { id: 'V004', name: 'Maria Garcia', company: 'Data Solutions', email: 'maria@data.com', phone: '+1 (555) 456-7890', lastVisit: '2024-01-22', visits: 7 },
  { id: 'V005', name: 'James Taylor', company: 'Security Pro', email: 'james@security.com', phone: '+1 (555) 567-8901', lastVisit: '2024-01-19', visits: 9 },
  { id: 'V006', name: 'Sarah Johnson', company: 'Cloud Inc', email: 'sarah@cloud.com', phone: '+1 (555) 678-9012', lastVisit: '2024-01-21', visits: 4 },
  { id: 'V007', name: 'Michael Chen', company: 'AI Research', email: 'michael@ai.com', phone: '+1 (555) 789-0123', lastVisit: '2024-01-17', visits: 6 },
  { id: 'V008', name: 'Lisa Anderson', company: 'Digital Labs', email: 'lisa@digital.com', phone: '+1 (555) 890-1234', lastVisit: '2024-01-23', visits: 8 },
];

const GeneratePass = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    selectedVisitor: null,
    purpose: '',
    passType: 'daily',
    duration: '2 hours',
    hostName: '',
    accessLevel: 'standard',
    notes: ''
  });

  const [activeStep, setActiveStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVisitors, setFilteredVisitors] = useState(registeredVisitors);

  // OTP States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const totalSteps = 4;

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVisitors(registeredVisitors);
    } else {
      const filtered = registeredVisitors.filter(visitor =>
        visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visitor.phone.includes(searchQuery)
      );
      setFilteredVisitors(filtered);
    }
  }, [searchQuery]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.selectedVisitor || !otpVerified) {
      alert('Please complete OTP verification');
      return;
    }
    console.log('Generating pass for:', formData);
    
    alert(`Pass generated successfully for ${formData.selectedVisitor.name}!\nPass Type: ${formData.passType}\nDuration: ${formData.duration}\nPurpose: ${formData.purpose}`);
    
    setFormData({
      selectedVisitor: null,
      purpose: '',
      passType: 'daily',
      duration: '2 hours',
      hostName: '',
      accessLevel: 'standard',
      notes: ''
    });
    setOtp(['', '', '', '', '', '']);
    setOtpSent(false);
    setOtpVerified(false);
    setSearchQuery('');
    setActiveStep(1);
    onClose();
  };

  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
      if (activeStep === 1 && formData.selectedVisitor && !otpSent) {
        sendOtp();
      }
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSelectVisitor = (visitor) => {
    setFormData({
      ...formData,
      selectedVisitor: visitor,
      hostName: visitor.name
    });
  };

  const sendOtp = () => {
    if (!formData.selectedVisitor) return;

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setCountdown(120);
      console.log(`OTP sent to ${formData.selectedVisitor.phone}`);

      const demoOtp = '123456';
      const otpArray = demoOtp.split('');
      setOtp(otpArray);
    }, 1500);
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    sendOtp();
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      alert('Please enter 6-digit OTP');
      return;
    }

    if (enteredOtp === '123456') {
      setOtpVerified(true);
      console.log('OTP verified successfully');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const formatPhoneNumber = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 10) {
      return `(${numbers.slice(0,3)}) ${numbers.slice(3,6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  const getPassTypeLabel = (type) => {
    const types = {
      daily: 'Daily Pass (1 Day)',
      weekly: 'Weekly Pass (7 Days)',
      monthly: 'Monthly Pass (30 Days)',
      temp: 'Temporary Pass (Hours)'
    };
    return types[type] || type;
  };

  const getAccessLevelLabel = (level) => {
    const levels = {
      standard: 'Standard (Main Areas)',
      restricted: 'Restricted (Escorted)',
      full: 'Full Access',
      lab: 'Lab Access',
      office: 'Office Areas Only'
    };
    return levels[level] || level;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 pt-20 overflow-y-auto">
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-2xl shadow-2xl w-full max-w-2xl border border-blue-100 my-auto">
        {/* Header */}
        <div className="px-5 pt-1 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow">
                <Key className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Generate Visitor Pass</h2>
                <p className="text-xs text-gray-500">Select visitor and verify with SMS OTP</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <X className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>

          {/* Progress Steps - 4 Steps */}
          <div className="mt-1">
            <div className="flex items-center justify-between mb-1 px-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 ${
                    step <= activeStep 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step < activeStep ? (
                      <BadgeCheck className="h-3 w-3" />
                    ) : step === 1 ? (
                      <Users className="h-3 w-3" />
                    ) : step === 2 ? (
                      <Smartphone className="h-3 w-3" />
                    ) : step === 3 ? (
                      <FileText className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </div>
                  <span className="text-[10px] mt-1.5 text-gray-500 whitespace-nowrap text-center">
                    {step === 1 ? 'Select Visitor' : 
                     step === 2 ? 'Verify OTP' : 
                     step === 3 ? 'Pass Details' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress Bar */}
            <div className="relative -mt-6 mx-2">
              <div className="h-0.5 bg-gray-200"></div>
              <div 
                className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((activeStep - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-2 pb-2 mt-3">
          {/* Step 1: Select Registered Visitor */}
          {activeStep === 1 && (
            <div className="space-y-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search by name, company, email, or phone..."
                />
              </div>

              {/* Visitor List */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
                {filteredVisitors.length === 0 ? (
                  <div className="p-6 text-center">
                    <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-sm text-gray-500">No visitors found</p>
                  </div>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <div
                      key={visitor.id}
                      onClick={() => handleSelectVisitor(visitor)}
                      className={`p-3 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                        formData.selectedVisitor?.id === visitor.id 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg ${
                            formData.selectedVisitor?.id === visitor.id 
                              ? 'bg-blue-100' 
                              : 'bg-gray-100'
                          }`}>
                            <User className={`h-3.5 w-3.5 ${
                              formData.selectedVisitor?.id === visitor.id 
                                ? 'text-blue-600' 
                                : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{visitor.name}</div>
                            <div className="text-xs text-gray-600">{visitor.company}</div>
                          </div>
                        </div>
                        {formData.selectedVisitor?.id === visitor.id && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center space-x-3 text-xs text-gray-500 flex-wrap gap-y-1">
                        <div className="flex items-center">
                          <Mail className="h-2.5 w-2.5 mr-1" />
                          <span className="truncate max-w-[100px]">{visitor.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-2.5 w-2.5 mr-1" />
                          <span>{formatPhoneNumber(visitor.phone)}</span>
                        </div>
                        <div className="flex items-center">
                          <History className="h-2.5 w-2.5 mr-1" />
                          <span>{visitor.visits} visits</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {activeStep === 2 && formData.selectedVisitor && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-xl shadow">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-gray-800">Mobile Verification Required</div>
                    <div className="text-xs text-gray-600">
                      We've sent a 6-digit OTP to {formatPhoneNumber(formData.selectedVisitor.phone)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visitor Info */}
              <div className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{formData.selectedVisitor.name}</div>
                      <div className="text-xs text-gray-600">{formData.selectedVisitor.company}</div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-500">
                    <Phone className="h-3 w-3 inline mr-1" />
                    {formatPhoneNumber(formData.selectedVisitor.phone)}
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit OTP sent to your mobile
                  </div>

                  <div className="flex justify-center space-x-2 mb-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-10 h-10 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        disabled={otpVerified}
                      />
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    {otpVerified ? (
                      <div className="flex items-center justify-center text-green-600">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        OTP Verified Successfully
                      </div>
                    ) : (
                      'Enter the code you received via SMS'
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {!otpVerified ? (
                    <>
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.join('').length !== 6}
                        className={`w-full py-2.5 rounded-xl font-semibold transition-all text-sm ${
                          otp.join('').length === 6
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow hover:shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="h-3 w-3 inline mr-1.5" />
                        Verify OTP
                      </button>

                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={resendOtp}
                          disabled={countdown > 0 || isSendingOtp}
                          className={`text-xs flex items-center ${
                            countdown > 0 || isSendingOtp
                              ? 'text-gray-400'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {isSendingOtp ? (
                            <>
                              <RotateCcw className="h-2.5 w-2.5 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : countdown > 0 ? (
                            `Resend OTP in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                          ) : (
                            <>
                              <Send className="h-2.5 w-2.5 mr-1" />
                              Resend OTP
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            console.log('Voice call requested');
                            alert('Voice call OTP feature would be triggered here');
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                        >
                          <PhoneCall className="h-2.5 w-2.5 mr-1" />
                          Get OTP via Call
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-semibold text-sm text-green-800">Identity Verified</div>
                          <div className="text-xs text-green-700">Visitor authenticated successfully</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Pass Details */}
          {activeStep === 3 && otpVerified && (
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-white rounded-lg shadow">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-gray-800">{formData.selectedVisitor.name}</div>
                      <div className="text-xs text-gray-600 flex items-center">
                        <ShieldCheck className="h-2.5 w-2.5 text-green-500 mr-1" />
                        Verified via SMS OTP • ID: {formData.selectedVisitor.id}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-semibold">
                    VERIFIED
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                    <Shield className="h-2.5 w-2.5 mr-1 text-blue-500" />
                    Pass Type *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.passType}
                      onChange={(e) => setFormData({ ...formData, passType: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm appearance-none"
                    >
                      <option value="daily">Daily Pass (1 Day)</option>
                      <option value="weekly">Weekly Pass (7 Days)</option>
                      <option value="monthly">Monthly Pass (30 Days)</option>
                      <option value="temp">Temporary Pass (Hours)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                    <Clock className="h-2.5 w-2.5 mr-1 text-blue-500" />
                    Duration *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm appearance-none"
                    >
                      <option value="2 hours">2 hours</option>
                      <option value="4 hours">4 hours</option>
                      <option value="6 hours">6 hours</option>
                      <option value="8 hours">8 hours (Full Day)</option>
                      <option value="24 hours">24 hours</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                  <FileText className="h-2.5 w-2.5 mr-1.5 text-blue-500" />
                  Purpose of Visit *
                </label>
                <textarea
                  required
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm resize-none"
                  rows={2}
                  placeholder="Enter purpose of visit (e.g., Meeting, Interview, Delivery)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                    <User className="h-2.5 w-2.5 mr-1.5 text-blue-500" />
                    Host Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hostName}
                    onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                    placeholder="Enter host name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                    <Shield className="h-2.5 w-2.5 mr-1.5 text-blue-500" />
                    Access Level
                  </label>
                  <div className="relative">
                    <select
                      value={formData.accessLevel}
                      onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm appearance-none"
                    >
                      <option value="standard">Standard (Main Areas)</option>
                      <option value="restricted">Restricted (Escorted)</option>
                      <option value="full">Full Access</option>
                      <option value="lab">Lab Access</option>
                      <option value="office">Office Areas Only</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wider">
                  <FileText className="h-2.5 w-2.5 mr-1.5 text-blue-500" />
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm resize-none"
                  rows={2}
                  placeholder="Any special instructions or notes..."
                />
              </div>

              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs font-semibold text-blue-800">Digital Pass Features</div>
                    <div className="text-[11px] text-blue-700">
                      QR Code • SMS Notification • Auto-expiry • Real-time Tracking
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {activeStep === 4 && otpVerified && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-white rounded-xl shadow">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-800">Review & Confirm</div>
                      <div className="text-xs text-gray-600">Please review all details before generating pass</div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold rounded-full">
                    FINAL REVIEW
                  </div>
                </div>

                {/* Visitor Summary Card */}
                <div className="bg-white rounded-xl p-3 mb-3 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-800">{formData.selectedVisitor.name}</div>
                        <div className="text-xs text-gray-600">{formData.selectedVisitor.company}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full font-semibold">
                        VERIFIED
                      </div>
                      <div className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        ID: {formData.selectedVisitor.id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center">
                      <Mail className="h-2.5 w-2.5 text-gray-400 mr-1.5" />
                      <span className="text-gray-700 truncate">{formData.selectedVisitor.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-2.5 w-2.5 text-gray-400 mr-1.5" />
                      <span className="text-gray-700">{formatPhoneNumber(formData.selectedVisitor.phone)}</span>
                    </div>
                    <div className="flex items-center">
                      <History className="h-2.5 w-2.5 text-gray-400 mr-1.5" />
                      <span className="text-gray-700">{formData.selectedVisitor.visits} previous visits</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-2.5 w-2.5 text-gray-400 mr-1.5" />
                      <span className="text-gray-700">Last: {formData.selectedVisitor.lastVisit}</span>
                    </div>
                  </div>
                </div>

                {/* Pass Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Pass Type</div>
                    <div className="font-bold text-sm text-gray-800 flex items-center">
                      <Shield className="h-3 w-3 text-blue-500 mr-1.5" />
                      {getPassTypeLabel(formData.passType)}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="font-bold text-sm text-gray-800 flex items-center">
                      <Clock className="h-3 w-3 text-blue-500 mr-1.5" />
                      {formData.duration}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Host</div>
                    <div className="font-bold text-sm text-gray-800 flex items-center">
                      <User className="h-3 w-3 text-blue-500 mr-1.5" />
                      {formData.hostName}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Access Level</div>
                    <div className="font-bold text-sm text-gray-800 flex items-center">
                      <Shield className="h-3 w-3 text-blue-500 mr-1.5" />
                      {getAccessLevelLabel(formData.accessLevel)}
                    </div>
                  </div>
                </div>

                {/* Purpose & Notes */}
                <div className="space-y-2">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Purpose of Visit</div>
                    <div className="text-sm text-gray-800">{formData.purpose}</div>
                  </div>
                  
                  {formData.notes && (
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Additional Notes</div>
                      <div className="text-sm text-gray-800">{formData.notes}</div>
                    </div>
                  )}
                </div>

                {/* Digital Features */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <QrCode className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-semibold text-blue-800">Digital Pass Will Include</div>
                      <div className="text-[11px] text-blue-700">
                        QR Code • SMS Notification • Auto-expiry • Real-time Tracking • Email copy to host
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-2">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-semibold text-sm text-green-800">Ready to Generate</div>
                    <div className="text-xs text-green-700">All details have been verified. Click "Generate Pass" to complete.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-1 mt-1 border-t border-gray-200">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors flex items-center space-x-1.5 text-sm"
              >
                <span>← Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
            )}

            {activeStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={
                  (activeStep === 1 && !formData.selectedVisitor) ||
                  (activeStep === 2 && !otpVerified) ||
                  (activeStep === 3 && (!formData.purpose || !formData.hostName))
                }
                className={`px-4 py-2 font-semibold rounded-xl transition-all shadow hover:shadow-md flex items-center space-x-1.5 text-sm ${
                  ((activeStep === 1 && formData.selectedVisitor) ||
                   (activeStep === 2 && otpVerified) ||
                   (activeStep === 3 && formData.purpose && formData.hostName))
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>
                  {activeStep === 1 ? 'Verify with OTP' : 
                   activeStep === 2 ? 'Enter Pass Details' : 
                   activeStep === 3 ? 'Review & Confirm' : 'Continue'}
                </span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all shadow hover:shadow-md flex items-center space-x-1.5 text-sm"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                <span>Generate Verified Pass</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneratePass;