import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  Clock,
  MapPin,
  Briefcase,
  FileText,
  Camera
} from 'lucide-react';

export function VisiAddVisitorModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    hostPerson: '',
    status: 'pre-booked',
    imageUrl: '',
    department: '',
    expectedDuration: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (!formData.hostPerson.trim()) newErrors.hostPerson = 'Host person is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        hostPerson: '',
        status: 'pre-booked',
        imageUrl: '',
        department: '',
        expectedDuration: '',
        notes: ''
      });
      setErrors({});
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateAvatar = () => {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name.replace(/\s+/g, '').toLowerCase()}`;
    setFormData(prev => ({ ...prev, imageUrl: avatarUrl }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Add New Visitor</h2>
                <p className="text-slate-600 mt-1">Enter visitor details to register them</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    formData.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                  <Camera className="h-3 w-3 text-slate-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Visitor Avatar</p>
                <p className="text-xs text-slate-600">Auto-generated based on name</p>
              </div>
              <button
                type="button"
                onClick={generateAvatar}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Generate
              </button>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    Company
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="TechCorp Industries"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.company ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.company && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Visit Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Visit Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purpose */}
                <div className="space-y-2">
                  <label htmlFor="purpose" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    Visit Purpose
                  </label>
                  <input
                    id="purpose"
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="Business Meeting"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.purpose ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.purpose && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.purpose}
                    </p>
                  )}
                </div>

                {/* Host Person */}
                <div className="space-y-2">
                  <label htmlFor="hostPerson" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-500" />
                    Host Person
                  </label>
                  <input
                    id="hostPerson"
                    type="text"
                    value={formData.hostPerson}
                    onChange={(e) => handleInputChange('hostPerson', e.target.value)}
                    placeholder="Michael Chen"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                      errors.hostPerson ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.hostPerson && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.hostPerson}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-500" />
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Engineering"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Expected Duration */}
                <div className="space-y-2">
                  <label htmlFor="expectedDuration" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    Expected Duration
                  </label>
                  <input
                    id="expectedDuration"
                    type="text"
                    value={formData.expectedDuration}
                    onChange={(e) => handleInputChange('expectedDuration', e.target.value)}
                    placeholder="2 hours"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-slate-500" />
                    Visitor Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="pre-booked">Pre Booked</option>
                    <option value="checked-in">Checked In</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="notes" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any additional information about the visit..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border-0 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Add Visitor
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}