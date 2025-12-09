
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Package, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

// Types
type DashboardView = 'operations' | 'inventory' | 'fleet';

interface Shipment {
  id: string;
  type: 'incoming' | 'outgoing';
  status: 'pending' | 'in_transit' | 'delivered';
  material: string;
  quantity: number;
  origin: string;
  destination: string;
  estimatedArrival: string;
}

interface MaterialMovement {
  id: string;
  material: string;
  status: 'pending' | 'in_transit' | 'delivered';
  location: string;
  timestamp: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  turnoverRate: number;
  aging: number;
}

interface Vehicle {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'maintenance';
  driver: string;
  lastMaintenance: string;
  fuelLevel: number;
  location: string;
}

interface Alert {
  id: string;
  type: 'shipment' | 'inventory' | 'fleet';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Mock data generators
const generateShipments = (): Shipment[] => [
  { id: 'S001', type: 'incoming', status: 'in_transit', material: 'Steel Beams', quantity: 1200, origin: 'Supplier A', destination: 'Warehouse 1', estimatedArrival: '2023-06-15' },
  { id: 'S002', type: 'outgoing', status: 'pending', material: 'Concrete Mix', quantity: 500, origin: 'Warehouse 2', destination: 'Construction Site B', estimatedArrival: '2023-06-18' },
  { id: 'S003', type: 'incoming', status: 'delivered', material: 'Copper Wiring', quantity: 800, origin: 'Supplier C', destination: 'Warehouse 3', estimatedArrival: '2023-06-10' },
  { id: 'S004', type: 'outgoing', status: 'in_transit', material: 'PVC Pipes', quantity: 1500, origin: 'Warehouse 1', destination: 'Construction Site A', estimatedArrival: '2023-06-12' },
];

const generateMaterialMovements = (): MaterialMovement[] => [
  { id: 'M001', material: 'Steel Beams', status: 'in_transit', location: 'Loading Bay 3', timestamp: '2023-06-14 09:30' },
  { id: 'M002', material: 'Concrete Mix', status: 'pending', location: 'Storage Area 2', timestamp: '2023-06-14 10:15' },
  { id: 'M003', material: 'Copper Wiring', status: 'delivered', location: 'Shelf B7', timestamp: '2023-06-14 11:45' },
  { id: 'M004', material: 'PVC Pipes', status: 'in_transit', location: 'Loading Bay 1', timestamp: '2023-06-14 08:20' },
];

const generateInventoryItems = (): InventoryItem[] => [
  { id: 'I001', name: 'Steel Beams', category: 'Construction', currentStock: 1200, minStock: 500, maxStock: 2000, turnoverRate: 2.5, aging: 30 },
  { id: 'I002', name: 'Concrete Mix', category: 'Construction', currentStock: 300, minStock: 400, maxStock: 1000, turnoverRate: 1.8, aging: 45 },
  { id: 'I003', name: 'Copper Wiring', category: 'Electrical', currentStock: 800, minStock: 300, maxStock: 1200, turnoverRate: 3.2, aging: 15 },
  { id: 'I004', name: 'PVC Pipes', category: 'Plumbing', currentStock: 1500, minStock: 600, maxStock: 2000, turnoverRate: 2.1, aging: 60 },
];

const generateVehicles = (): Vehicle[] => [
  { id: 'V001', name: 'Truck 101', status: 'active', driver: 'John Smith', lastMaintenance: '2023-05-20', fuelLevel: 75, location: 'Route 15' },
  { id: 'V002', name: 'Truck 102', status: 'idle', driver: 'Mike Johnson', lastMaintenance: '2023-06-01', fuelLevel: 40, location: 'Warehouse 2' },
  { id: 'V003', name: 'Truck 103', status: 'maintenance', driver: 'Sarah Davis', lastMaintenance: '2023-06-10', fuelLevel: 0, location: 'Service Bay 3' },
  { id: 'V004', name: 'Truck 104', status: 'active', driver: 'Robert Brown', lastMaintenance: '2023-05-28', fuelLevel: 90, location: 'Route 7' },
];

const generateAlerts = (): Alert[] => [
  { id: 'A001', type: 'inventory', severity: 'high', message: 'Low stock alert: Concrete Mix below minimum level', timestamp: '2023-06-14 10:30', resolved: false },
  { id: 'A002', type: 'shipment', severity: 'medium', message: 'Delayed shipment: S002 from Supplier A', timestamp: '2023-06-14 09:15', resolved: false },
  { id: 'A003', type: 'fleet', severity: 'low', message: 'Scheduled maintenance: Truck 103 due in 2 days', timestamp: '2023-06-14 08:45', resolved: false },
];

// Mock data for charts
const shipmentData = [
  { name: 'Mon', incoming: 4000, outgoing: 2400 },
  { name: 'Tue', incoming: 3000, outgoing: 1398 },
  { name: 'Wed', incoming: 2000, outgoing: 9800 },
  { name: 'Thu', incoming: 2780, outgoing: 3908 },
  { name: 'Fri', incoming: 1890, outgoing: 4800 },
  { name: 'Sat', incoming: 2390, outgoing: 3800 },
  { name: 'Sun', incoming: 3490, outgoing: 4300 },
];

const inventoryData = [
  { name: 'Steel', value: 400 },
  { name: 'Concrete', value: 300 },
  { name: 'Copper', value: 300 },
  { name: 'PVC', value: 200 },
];

const fleetData = [
  { name: 'Active', value: 2 },
  { name: 'Idle', value: 1 },
  { name: 'Maintenance', value: 1 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Components
const DashboardNavigation = ({ 
  activeView, 
  setActiveView 
}: { 
  activeView: DashboardView; 
  setActiveView: (view: DashboardView) => void;
}) => (
  <div className="flex space-x-4 mb-6">
    <Button 
      variant={activeView === 'operations' ? 'default' : 'outline'}
      onClick={() => setActiveView('operations')}
      className="flex items-center gap-2"
    >
      <Home className="h-4 w-4" />
      Operations
    </Button>
    <Button 
      variant={activeView === 'inventory' ? 'default' : 'outline'}
      onClick={() => setActiveView('inventory')}
      className="flex items-center gap-2"
    >
      <Package className="h-4 w-4" />
      Inventory
    </Button>
    <Button 
      variant={activeView === 'fleet' ? 'default' : 'outline'}
      onClick={() => setActiveView('fleet')}
      className="flex items-center gap-2"
    >
      <Truck className="h-4 w-4" />
      Fleet
    </Button>
  </div>
);

const KPICard = ({ 
  title, 
  value, 
  change, 
  icon,
  trend
}: { 
  title: string; 
  value: string | number; 
  change?: number; 
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          ) : (
            <Minus className="h-3 w-3 text-gray-500 mr-1" />
          )}
          {change}% from last month
        </p>
      )}
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-500' },
    in_transit: { label: 'In Transit', color: 'bg-blue-500' },
    delivered: { label: 'Delivered', color: 'bg-green-500' },
    active: { label: 'Active', color: 'bg-green-500' },
    idle: { label: 'Idle', color: 'bg-gray-500' },
    maintenance: { label: 'Maintenance', color: 'bg-orange-500' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-500' };

  return (
    <Badge className={`${config.color} text-white`}>
      {config.label}
    </Badge>
  );
};

const AlertItem = ({ alert }: { alert: Alert }) => {
  const severityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`p-3 rounded-lg ${severityColors[alert.severity]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{alert.message}</p>
          <p className="text-xs mt-1">{alert.timestamp}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const OperationsDashboard = () => {
  const shipments = generateShipments();
  const movements = generateMaterialMovements();
  const alerts = generateAlerts().filter(a => a.type === 'shipment');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Incoming Shipments" 
          value="24" 
          change={12} 
          trend="up"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Outgoing Shipments" 
          value="18" 
          change={-5} 
          trend="down"
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Active Vehicles" 
          value="12" 
          change={3} 
          trend="up"
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="On-Time Delivery" 
          value="92%" 
          change={2} 
          trend="up"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shipmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incoming" fill="#8884d8" name="Incoming" />
                  <Bar dataKey="outgoing" fill="#82ca9d" name="Outgoing" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shipments.map(shipment => (
                <div key={shipment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{shipment.material}</p>
                    <p className="text-sm text-muted-foreground">{shipment.quantity} units</p>
                  </div>
                  <StatusBadge status={shipment.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Material Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements.map(movement => (
                <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{movement.material}</p>
                    <p className="text-sm text-muted-foreground">{movement.location}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={movement.status} />
                    <p className="text-xs text-muted-foreground mt-1">{movement.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const InventoryDashboard = () => {
  const inventoryItems = generateInventoryItems();
  const alerts = generateAlerts().filter(a => a.type === 'inventory');

  // Calculate KPIs
  const totalStockValue = inventoryItems.reduce((sum, item) => sum + item.currentStock * 10, 0);
  const lowStockItems = inventoryItems.filter(item => item.currentStock < item.minStock).length;
  const highStockItems = inventoryItems.filter(item => item.currentStock > item.maxStock * 0.9).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Stock Value" 
          value={`$${totalStockValue.toLocaleString()}`} 
          change={5} 
          trend="up"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Low Stock Items" 
          value={lowStockItems} 
          change={-2} 
          trend="down"
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Overstock Items" 
          value={highStockItems} 
          change={1} 
          trend="up"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Avg Turnover Rate" 
          value="2.4x" 
          change={0.3} 
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryItems.map(item => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span>{item.currentStock}/{item.maxStock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.currentStock < item.minStock 
                          ? 'bg-red-500' 
                          : item.currentStock > item.maxStock * 0.9 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${(item.currentStock / item.maxStock) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryItems.map(item => ({
                    name: item.name,
                    aging: item.aging
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="aging" fill="#8884d8">
                    {inventoryItems.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.aging > 90 ? '#ff6b6b' : entry.aging > 60 ? '#ffd166' : '#06d6a0'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const FleetDashboard = () => {
  const vehicles = generateVehicles();
  const alerts = generateAlerts().filter(a => a.type === 'fleet');

  // Calculate KPIs
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
  const avgFuelLevel = vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length;

  // Mock fuel consumption data
  const fuelData = [
    { day: 'Mon', consumption: 400 },
    { day: 'Tue', consumption: 300 },
    { day: 'Wed', consumption: 200 },
    { day: 'Thu', consumption: 278 },
    { day: 'Fri', consumption: 189 },
    { day: 'Sat', consumption: 239 },
    { day: 'Sun', consumption: 349 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Active Vehicles" 
          value={activeVehicles} 
          change={2} 
          trend="up"
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Maintenance Due" 
          value={maintenanceVehicles} 
          change={-1} 
          trend="down"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="Avg Fuel Level" 
          value={`${Math.round(avgFuelLevel)}%`} 
          change={-3} 
          trend="down"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard 
          title="On-Time Deliveries" 
          value="94%" 
          change={1} 
          trend="up"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fuel Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fuelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#8884d8" 
                    name="Fuel Consumption (L)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {fleetData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === 'Active' ? '#10B981' : 
                          entry.name === 'Idle' ? '#6B7280' : '#F59E0B'
                        } 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{vehicle.name}</p>
                    <p className="text-sm text-muted-foreground">{vehicle.driver}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={vehicle.status} />
                    <p className="text-xs text-muted-foreground mt-1">{vehicle.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fleet Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const MaterialFleetDashboard = () => {
  const [activeView, setActiveView] = useState<DashboardView>('operations');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Material Management & Fleet Operations</h1>
              <p className="text-gray-600">Real-time dashboard for logistics and inventory management</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-white p-3 rounded-lg shadow-sm border">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="font-medium">{time.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </header>

        <DashboardNavigation 
          activeView={activeView} 
          setActiveView={setActiveView} 
        />

        <main>
          {activeView === 'operations' && <OperationsDashboard />}
          {activeView === 'inventory' && <InventoryDashboard />}
          {activeView === 'fleet' && <FleetDashboard />}
        </main>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Enterprise Material Management & Fleet Operations System • Real-time Dashboard</p>
        </footer>
      </div>
    </div>
  );
};

export default MaterialFleetDashboard;