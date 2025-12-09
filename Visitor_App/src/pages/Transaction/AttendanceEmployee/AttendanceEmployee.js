import { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';

function bufferToBase64(buffer) {
  if (!buffer) return '';
  // If buffer is already a base64 string, just return it
  if (typeof buffer === 'string') return buffer;
  // If buffer is an object with a data property (array of bytes)
  if (buffer.data) buffer = buffer.data;
  return btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
}


export default function AttendanceEmployee({ setTitle = () => { } }) {
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('Last 7 Days');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const userId = sessionStorage.getItem('userId');
  const Username = sessionStorage.getItem("name");

  // State for data
  const [profileData, setProfileData] = useState({});
  const [summaryCards, setSummaryCards] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [timelineData, setTimelineData] = useState(null);
  const perPage = 10;




  useEffect(() => {
    setTitle("Attendance Details");
  }, [setTitle]);



  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${SERVER_PORT}/AttendanceDeltailsEMPTable/${userId}`);
        const records = Array.isArray(res.data) ? res.data : (res.data?.records || res.data?.data || []);
        console.log('Fetched Attendance Records:', records); // Optional: For debugging
        setAttendanceRecords(Array.isArray(records) ? records : []);
      } catch (err) {
        console.error('Attendance records error:', err);
        setError('Failed to load attendance records');
      }
      setLoading(false);
    };

    if (userId) {
      fetchAttendanceRecords();
    }
  }, [userId]);


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${SERVER_PORT}/AttendanceFullDetails/${userId}`);
        console.log('Profile Data:', response.data);
        setProfileData(response.data);
      } catch (err) {
        console.error('Profile data error:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    if (userId) {
      fetchProfileData();
    }
  }, [userId]);


  // Initialize summary cards
  useEffect(() => {
    // Use profileData instead of undefined 'data'
    const data = profileData || {};

    const totalHoursToday = parseFloat(data.total_hours_today || 0);
    const totalHoursWeek = parseFloat(data.total_hours_week || 0);
    const totalHoursMonth = parseFloat(data.total_hours_month || 0);
    const overtimeMonth = parseFloat(data.overtime_month || 0);

    const cards = [
      {
        title: "Total Hours Today",
        value: totalHoursToday.toFixed(2),
        total: "9",
        donutData: [totalHoursToday, Math.max(9 - totalHoursToday, 0)],
        color: "bg-orange-500",
        chartColor: "#F97316",
        trend: "5% This Week",
      },
      {
        title: "Total Hours Week",
        value: totalHoursWeek.toFixed(2),
        total: "40",
        donutData: [totalHoursWeek, Math.max(40 - totalHoursWeek, 0)],
        color: "bg-gray-800",
        chartColor: "#1F2937",
        trend: "8% Last Week",
      },
      {
        title: "Total Hours Month",
        value: totalHoursMonth.toFixed(2),
        total: "160",
        donutData: [totalHoursMonth, Math.max(160 - totalHoursMonth, 0)],
        color: "bg-blue-500",
        chartColor: "#3B82F6",
        trend: "15% Last Month",
      },
      {
        title: "Overtime Month",
        value: overtimeMonth.toFixed(2),
        total: "20",
        donutData: [overtimeMonth, Math.max(20 - overtimeMonth, 0)],
        color: "bg-pink-500",
        chartColor: "#EC4899",
        trend: "-10% Last Month",
      },
    ];
    setSummaryCards(cards);

    // Set timeline data - FIX: Use correct field names from backend
    const workingHours = parseFloat(data.working_hours || 0);
    const productiveHours = parseFloat(data.productive_hours || 0);
    const breakHours = parseFloat(data.break_hours || 0);
    const overtimeHours = parseFloat(data.overtime_hours || 0);

    console.log('Timeline Data Values:', {
      workingHours,
      productiveHours,
      breakHours,
      overtimeHours
    });

    // Calculate timeline segments based on actual hours
    const totalWorkDay = 9; // 9 hour work day
    const workingPercent = Math.min((workingHours / totalWorkDay) * 100, 100);
    const productivePercent = Math.min((productiveHours / totalWorkDay) * 100, 100);
    const breakPercent = Math.min((breakHours / totalWorkDay) * 100, 100);
    const overtimePercent = overtimeHours > 0 ? Math.min((overtimeHours / 4) * 100, 100) : 0; // Overtime out of 4 hours max

    const timelineInfo = {
      summary: [
        {
          label: 'Working',
          value: formatHoursMinutes(workingHours),
          color: 'text-gray-800',
          indicator: 'bg-gray-500'
        },
        {
          label: 'Productive',
          value: formatHoursMinutes(productiveHours),
          color: 'text-green-600',
          indicator: 'bg-green-500'
        },
        {
          label: 'Break',
          value: formatHoursMinutes(breakHours),
          color: 'text-yellow-600',
          indicator: 'bg-yellow-500'
        },
        {
          label: 'Overtime',
          value: formatHoursMinutes(overtimeHours),
          color: 'text-blue-600',
          indicator: 'bg-blue-500'
        },
      ],
      // Create timeline segments based on actual data
      segments: [
        // Working hours (gray)
        workingHours > 0 ? { start: 0, end: workingPercent * 0.6, color: 'bg-gray-500' } : null,
        // Break time (yellow) 
        breakHours > 0 ? { start: workingPercent * 0.6, end: workingPercent * 0.6 + (breakPercent * 0.2), color: 'bg-yellow-500' } : null,
        // Productive time (green)
        productiveHours > 0 ? { start: workingPercent * 0.6 + (breakPercent * 0.2), end: 85, color: 'bg-green-500' } : null,
        // Overtime (blue)
        overtimeHours > 0 ? { start: 85, end: 85 + (overtimePercent * 0.15), color: 'bg-blue-500' } : null,
      ].filter(Boolean) // Remove null segments
    };
    setTimelineData(timelineInfo);
    // Add profileData as dependency so it updates when data is fetched
  }, [profileData]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatHoursMinutes = (totalHours) => {
    if (!totalHours || totalHours === 0) return '0h 0m';
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };



  const formatDateTime = () => {
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    return currentTime.toLocaleDateString('en-US', options);
  };



  const parseTimeInterval = (interval) => {
    if (!interval) return { hours: 0, minutes: 0, seconds: 0 };
    if (typeof interval === 'object' && interval !== null) {
      // Handle object format { hours, minutes, seconds }
      return {
        hours: interval.hours || 0,
        minutes: interval.minutes || 0,
        seconds: interval.seconds || 0
      };
    }
    if (typeof interval === 'string') {
      const timeMatch = interval.match(/(\d+):(\d+):(\d+)/);
      if (timeMatch) {
        return {
          hours: parseInt(timeMatch[1], 10) || 0,
          minutes: parseInt(timeMatch[2], 10) || 0,
          seconds: parseInt(timeMatch[3], 10) || 0
        };
      }
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const formatTimeDisplay = (interval) => {
    if (!interval) return '-';

    // Handle object format
    if (typeof interval === 'object' && interval !== null) {
      const { hours = 0, minutes = 0, seconds = 0 } = interval;
      if (hours === 0 && minutes === 0 && seconds === 0) return '-';
      if (seconds > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    // Handle string format
    if (interval === '00:00:00' || interval === '0:00:00') {
      return '-';
    }

    const { hours, minutes, seconds } = parseTimeInterval(interval);
    if (hours === 0 && minutes === 0 && seconds === 0) return '-';

    if (seconds > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const isProductionHoursSufficient = (hoursData) => {
    if (!hoursData) return false;
    let hours = 0, minutes = 0;
    if (typeof hoursData === 'object' && hoursData !== null) {
      // Handle object format { hours, minutes, seconds }
      hours = hoursData.hours || 0;
      minutes = hoursData.minutes || 0;
    } else if (typeof hoursData === 'string') {
      // Handle string format
      const time = parseTimeInterval(hoursData);
      hours = time.hours;
      minutes = time.minutes;
    }
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480; // 8 hours
  };

  // Filter and paginate data
  const filtered = attendanceRecords.filter(record =>
    !status || status === "All Status" || record.status === status
  );


  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Simple donut chart component
  const SimpleDonutChart = ({ data = [0, 0], colors = ["#10B981"] }) => {
    const [worked, remaining] = data;
    const total = worked + remaining;
    const percentage = total > 0 ? (worked / total) * 100 : 0;
    const radius = 45; // Increase this for a bigger donut (e.g., 45 -> 60)
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-24 h-24"> {/* w-24 h-24 = 96px */}
        <svg
          className="w-24 h-24 transform -rotate-90"
          viewBox="0 0 120 120" // Adjust viewBox to fit new radius
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={colors[0]}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
    );
  };

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00',
    '08:00', '09:00', '10:00', '11:00'
  ];

  return (
    <div className="employee-container">
      <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Employee Attendance Smart View</h2>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Profile Card */}
        <div className="p-4 bg-white rounded-lg shadow flex flex-col items-center w-full lg:w-1/5">
          <div className="text-gray-800 font-medium text-center text-lg mb-1">
            Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'},<br />
            {profileData.username || Username || "Employee"}
          </div>
          <div className="text-gray-600 text-center text-sm mb-2">
            {formatDateTime()}
          </div>
          <div className="relative mb-4 mt-0">
            <img
              src={
                profileData.profileImage && profileData.profileImage.data
                  ? `data:image/jpeg;base64,${bufferToBase64(profileData.profileImage.data)}`
                  : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
              }
              className="w-32 h-32.5 rounded-full border shadow object-cover"
              alt="Profile"
              onError={e => {
                e.target.onerror = null;
                e.target.src = "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png";
              }}
            />
            {/* Email and Job ID */}
            <div className="mt-2 text-center mb-0">
              <div className="text-xs text-gray-700 font-medium">
                {profileData.email || "Email not available"}
              </div>
              <div className="text-xs text-gray-500 mb-0">
                Role: {profileData.jobId || "N/A"}
              </div>
            </div>
          </div>
          <div className="bg-orange-500 text-white text-sm font-semibold px-1 py-0.5 rounded mt-0">
            Production:
            <span className={`px-1 rounded text-xs ${isProductionHoursSufficient(profileData.productionhours || '00:00:00')
              ? 'bg-green-200 text-green-800'
              : 'bg-yellow-200 text-yellow-800'
              }`}>
              {formatTimeDisplay(profileData.productionhours || "00:00:00")}
            </span>
          </div>
        </div>

        {/* Summary Cards and Timeline Section */}
        <div className="flex flex-col w-full lg:w-4/5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            {summaryCards && summaryCards.map((card, index) => {
              const isNegative = card.trend && card.trend.includes('-');
              const gradientBackgrounds = [
                "linear-gradient(135deg, #fceabb 0%,rgb(255, 188, 4) 100%)",
                "linear-gradient(135deg, #e0eafc 0%,rgb(47, 49, 151) 100%)",
                "linear-gradient(135deg, #d9afd9 0%,rgb(64, 204, 87) 100%)",
                "linear-gradient(135deg,rgb(247, 70, 196) 0%,rgb(71, 130, 233) 100%)",
              ];

              return (
                <div
                  key={index}
                  className="p-2 rounded-lg shadow flex flex-col justify-between min-h-[200px]"
                  style={{
                    background: gradientBackgrounds[index % gradientBackgrounds.length],
                    color: "#333"
                  }}
                >
                  <div className="bg-white bg-opacity-20 rounded-md flex items-center justify-center mb-2 p-2">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm font-medium">{card.title}</span>
                  </div>

                  <div className="text-center mb-3">
                    <div className="text-lg font-bold">{card.value} hrs</div>
                    <div className="text-xs opacity-75">of {card.total} hrs</div>
                  </div>

                  <div className="flex justify-center mb-3">
                    <SimpleDonutChart
                      data={card.donutData}
                      colors={[card.chartColor, "#E5E7EB"]}
                    />
                  </div>

                  <div className={`text-xs flex items-center justify-center font-medium ${isNegative ? "text-red-600" : "text-green-800"
                    }`}>
                    {isNegative ? (
                      <ArrowDownRight size={12} className="mr-1" />
                    ) : (
                      <ArrowUpRight size={12} className="mr-1" />
                    )}
                    <span>{card.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Section */}
          {timelineData && (
            <div className='p-3 bg-white rounded-lg shadow-lg'>
              {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Activity Timeline</h3> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                {timelineData.summary.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <span className={`w-3 h-3 rounded-full ${item.indicator} mr-2 flex-shrink-0`}></span>
                    <span className="text-gray-600 mr-2 text-sm font-medium">{item.label}:</span>
                    <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Timeline visualization */}
              <div className="relative h-4 mb-2 bg-gray-200 rounded-full overflow-hidden">
                {timelineData.segments.map((segment, index) => (
                  <div
                    key={index}
                    className={`absolute ${segment.color} h-full transition-all duration-300 ease-in-out`}
                    style={{
                      left: `${segment.start}%`,
                      width: `${segment.end - segment.start}%`
                    }}
                  ></div>
                ))}
              </div>

              <div className="flex justify-between text-xs text-gray-500 overflow-x-auto">
                {timeSlots.map((time, index) => (
                  <div key={index} className="text-center whitespace-nowrap px-1 min-w-0">
                    {time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>




      {/* Attendance History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-1 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="md:mb-0">
              <h2 className="text-xl font-semibold mb-2 text-gray-800 text-center rounded-xl shadow">Employee Attendance</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="All Status">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="LOP">LOP</option>
                <option value="WFH">WFH</option>
                <option value="Late">Permission</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Current Month">Current Month</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading attendance records...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      {['Date', 'Check In', 'Status', 'Check Out', 'Break', 'Late', 'Overtime', 'Production'].map(header => (
                        <th key={header} className="py-1 px-4 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((record, idx) => (
                      <tr key={record.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td>{record.createdDate}</td>
                        <td>{record.checkIn}</td>
                        <td>
                          <span className={`px-2 rounded-full text-xs font-medium ${record.status === 'Present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'Absent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{record.checkOut}</td>
                        <td>{formatTimeDisplay(record.break)}</td>
                        <td>{formatTimeDisplay(record.late)}</td>
                        <td>{formatTimeDisplay(record.overtime)}</td>
                        <td>
                          {formatTimeDisplay(record.productionHours)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
                <div className="text-sm text-gray-500">
                  Showing {filtered.length > 0 ? (currentPage - 1) * perPage + 1 : 0} to{' '}
                  {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="text-sm mx-2">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

