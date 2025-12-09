import React, { useState } from "react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, } from "recharts";
import { ArrowRight, TrendingUp, ListOrdered, Calendar, Truck, } from "lucide-react";

const Button = ({ variant = "default", size = "md", onClick, children, className = "" }) => {
  let baseStyle = "px-4 py-2 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  let style;

  if (variant === "default") {
    style = "bg-gray-900 text-white hover:bg-gray-700 focus:ring-gray-500";
  } else if (variant === "outline") {
    style = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 focus:ring-gray-400";
  } else if (variant === "link") {
    style = "bg-transparent text-blue-600 hover:underline px-0 py-0";
    baseStyle = "font-medium";
  }

  if (size === "sm") {
    baseStyle = "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${style} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

/* ------------------------- MOCK DATA ------------------------- */

const flowData = [
  { date: "Mon", inbound: 120, outbound: 85 },
  { date: "Tue", inbound: 95, outbound: 110 },
  { date: "Wed", inbound: 150, outbound: 90 },
  { date: "Thu", inbound: 110, outbound: 130 },
  { date: "Fri", inbound: 140, outbound: 105 },
  { date: "Sat", inbound: 60, outbound: 45 },
  { date: "Sun", inbound: 45, outbound: 35 },
];


const movements = [
  // Inwards
  { id: "PO-2024123", type: "Inwards", source: "Supplier A (Raw Mat)", quantity: "500 units", date: "2024-12-04", status: "Received", statusClass: "status-received" },
  { id: "WO-9876", type: "Inwards", source: "Production B (WIP)", quantity: "120 units", date: "2024-12-04", status: "Staged", statusClass: "status-staged" },
  { id: "PO-2024122", type: "Inwards", source: "Supplier C (Components)", quantity: "30 units", date: "2024-12-03", status: "Awaiting QA", statusClass: "status-awaiting-qa" },
  { id: "PO-2024121", type: "Inwards", source: "Supplier D (Hardware)", quantity: "75 units", date: "2024-12-03", status: "Received", statusClass: "status-received" },
  { id: "RTN-0010", type: "Inwards", source: "Customer X (Return)", quantity: "5 units", date: "2024-12-02", status: "Inspection", statusClass: "status-awaiting-qa" },

  // Outwards
  { id: "SO-00155", type: "Outwards", destination: "Customer X (NY)", quantity: "15 units", date: "2024-12-04", status: "Shipped", statusClass: "status-shipped" },
  { id: "JO-54321", type: "Outwards", destination: "Assembly Line (Internal)", quantity: "80 units", date: "2024-12-04", status: "Issued", statusClass: "status-issued" },
  { id: "SO-00154", type: "Outwards", destination: "Customer Y (TX)", quantity: "45 units", date: "2024-12-03", status: "Picked", statusClass: "status-picked" },
  { id: "JO-54320", type: "Outwards", destination: "Packaging Dept.", quantity: "20 units", date: "2024-12-03", status: "Issued", statusClass: "status-issued" },
  { id: "SO-00153", type: "Outwards", destination: "Customer Z (CA)", quantity: "5 units", date: "2024-12-02", status: "Shipped", statusClass: "status-shipped" },
];

const statusStyles = {
  "status-received": "bg-green-100 text-green-800",
  "status-shipped": "bg-blue-100 text-blue-800",
  "status-staged": "bg-yellow-100 text-yellow-800",
  "status-picked": "bg-pink-100 text-pink-800",
  "status-awaiting-qa": "bg-red-100 text-red-800",
  "status-issued": "bg-teal-100 text-teal-800",
};

const MovementTable = ({ data, type }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-inner">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Movement ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {type === "Inwards" ? "Source" : "Destination"}
          </th>

          {/* Quantity always visible */}
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantity
          </th>

          {/* Date always visible */}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>

          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
              {type === "Inwards" ? item.source : item.destination}
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500">{item.quantity}</td>
            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
            <td className="px-4 py-2 whitespace-nowrap">
              <span className={`${statusStyles[item.statusClass]} px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}>
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ----------------- Searchable Table Wrapper ----------------- */
const SearchableMovementTable = ({ data, type }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredData = data.filter((item) =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type === "Inwards" ? item.source : item.destination)
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Search by ID, Source/Destination, Status..."
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <MovementTable data={filteredData} type={type} />
    </div>
  );
};



/* ------------------------- MAIN DASHBOARD ------------------------- */

export default function MaterialFlowDashboard() {
  const [timeRange, setTimeRange] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");
  const totalInbound = flowData.reduce((s, d) => s + d.Inwards, 0);
  const totalOutbound = flowData.reduce((s, d) => s + d.Outwards, 0);
  const netFlow = totalInbound - totalOutbound;
  const pendingMovements = movements.filter(m => ["pending", "in-transit"].includes(m.status)).length;

  return (
    <div className="min-h-screen p-4 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto">

        {/* ------------------------- HEADER ------------------------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Material Flow Dashboard</h1>
            <p className="text-lg text-gray-600 mt-1">Track Inwards and Outwards material movements (Units)</p>
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button variant={timeRange === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("week")}>
              <Calendar className="h-4 w-4 mr-1" /> This Week
            </Button>

            <Button variant={timeRange === "month" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("month")}>
              <Calendar className="h-4 w-4 mr-1" /> This Month
            </Button>
          </div>
        </div>

        {/* ------------------------- SUMMARY CARDS ------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Inwards */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Inwards</CardTitle>
              <ArrowRight className="h-5 w-5 text-blue-500 transform -rotate-180" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{totalInbound}</div>
              <p className="text-xs text-gray-500 mt-1">Units received ({timeRange})</p>
            </CardContent>
          </Card>

          {/* Outwards */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Outwards</CardTitle>
              <ArrowRight className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalOutbound}</div>
              <p className="text-xs text-gray-500 mt-1">Units shipped ({timeRange})</p>
            </CardContent>
          </Card>

          {/* Net Flow */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Net Flow</CardTitle>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netFlow >= 0 ? "+" : ""}
                {netFlow}
              </div>
              <p className="text-xs text-gray-500 mt-1">Change in total inventory</p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Movements</CardTitle>
              <ListOrdered className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingMovements}</div>
              <p className="text-xs text-gray-500 mt-1">Shipments awaiting action</p>
            </CardContent>
          </Card>
        </div>

        {/* ------------------------- FLOW VISUALIZATION ------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Chart */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Daily Material Flow Trends</CardTitle>
                <CardDescription>Inwards vs Outwards movements over the last {timeRange}</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={flowData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                      <defs>
                        <linearGradient id="colorInwards" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutwards" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "8px 12px",
                        }}
                      />

                      <Legend
                        verticalAlign="bottom"
                        layout="horizontal"
                        wrapperStyle={{ fontSize: 12, marginTop: 10 }}
                      />

                      <Area
                        type="monotone"
                        dataKey="inbound"
                        name="Inwards (Receiving)"
                        stroke="#3b82f6"
                        fill="url(#colorInwards)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="outbound"
                        name="Outwards (Shipping)"
                        stroke="#10b981"
                        fill="url(#colorOutwards)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Efficiency Summary */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Flow & Efficiency Summary</CardTitle>
                <CardDescription>Key operational metrics</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">

                  {/* Inwards Efficiency */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Inwards Efficiency (On-Time)</span>
                      <span className="text-sm font-bold text-blue-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>

                  {/* Outwards Efficiency */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Outwards Efficiency (Fulfillment)</span>
                      <span className="text-sm font-bold text-green-600">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                    </div>
                  </div>

                  {/* Donut – Inwards/Outwards Share */}
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="font-semibold mb-3 text-gray-700">Inwards vs. Outwards Share</h3>

                    <div className="flex items-center justify-center">
                      <div className="relative w-40 h-40">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <path
                            d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray={`${(totalInbound / (totalInbound + totalOutbound)) * 100}, 100`}
                          />
                        </svg>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">
                              {Math.round((totalInbound / (totalInbound + totalOutbound)) * 100)}%
                            </div>
                            <div className="text-xs text-blue-500 font-medium">Inwards Share</div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ------------------------- CATEGORIES & MOVEMENT LIST ------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Category Pie Chart */}
          <Card className="lg:col-span-1 h-full">
            <CardHeader>
              <CardTitle>Material Categories Distribution</CardTitle>
              <CardDescription>Inward vs Outward Breakdown</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col h-full mt-0">
              {(() => {
                const inwardTotals = {};
                const outwardTotals = {};

                movements.forEach((m) => {
                  const match =
                    m.source?.match(/\((.*?)\)/) ||
                    m.destination?.match(/\((.*?)\)/);

                  const category = match ? match[1] : "Uncategorized";
                  const qty = parseInt(m.quantity);

                  if (m.type === "Inwards") {
                    if (!inwardTotals[category]) inwardTotals[category] = 0;
                    inwardTotals[category] += qty;
                  }

                  if (m.type === "Outwards") {
                    if (!outwardTotals[category]) outwardTotals[category] = 0;
                    outwardTotals[category] += qty;
                  }
                });

                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

                const inwardData = Object.keys(inwardTotals).map((key, index) => ({
                  name: key,
                  value: inwardTotals[key],
                  color: colors[index % colors.length],
                }));

                const outwardData = Object.keys(outwardTotals).map((key, index) => ({
                  name: key,
                  value: outwardTotals[key],
                  color: colors[index % colors.length],
                }));

                return (
                  <div className="flex flex-col gap-6">

                    {/* ----------------- TOP: INWARD PIE CHART ----------------- */}
                    <div className="flex flex-col items-center">
                      <h3 className="text-sm font-semibold">Inward Materials</h3>
                      <div className="h-60 w-full mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={inwardData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {inwardData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={entry.color}
                                  stroke={entry.color}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>

                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ddd", padding: "10px 15px" }} />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              wrapperStyle={{ fontSize: 11 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* ----------------- BOTTOM: OUTWARD PIE CHART ----------------- */}
                    <div className="flex flex-col items-center mt-4">
                      <h3 className="text-sm font-semibold mb-2">Outward Materials</h3>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={outwardData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {outwardData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={entry.color}
                                  stroke={entry.color}
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>

                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #ddd" }} />
                            <Legend
                              layout="horizontal"
                              verticalAlign="bottom"
                              wrapperStyle={{ fontSize: 11 }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                );
              })()}
            </CardContent>
          </Card>


          {/* Inwards / Outwards List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inwards */}
            <Card>
              <CardHeader className="relative mb-0 pb-0">
                {/* Left side: Title + Description */}
                <div>
                  <CardTitle className="flex items-center text-green-600">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Recent Inwards Movements
                  </CardTitle>
                  <CardDescription>Material arrivals awaiting processing</CardDescription>
                </div>

                {/* Right side: Search box */}
                <div className="absolute top-0 right-0">
                  <input
                    type="text"
                    placeholder="Search movements..."
                    className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <SearchableMovementTable data={movements.filter(m => m.type === "Inwards")} type="Inwards" />
              </CardContent>
            </Card>

            {/* Outwards */}
            {/* Outwards Movements */}
            <Card className="p-1">
              <CardHeader className="relative mb-0 pb-0">
                {/* Left side: Title + Description */}
                <div>
                  <CardTitle className="flex items-center text-green-600">
                    <ArrowRight className="h-5 w-5 mr-2" />
                    Recent Outwards Movements
                  </CardTitle>
                  <CardDescription>Material shipments dispatched or in-transit</CardDescription>
                </div>

                {/* Right side: Search box */}
                <div className="absolute top-0 right-0">
                  <input
                    type="text"
                    placeholder="Search movements..."
                    className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <MovementTable
                  data={movements
                    .filter((m) => m.type === "Outwards")
                    .filter((item) =>
                      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      item.status.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                  type="Outwards"
                />
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}
