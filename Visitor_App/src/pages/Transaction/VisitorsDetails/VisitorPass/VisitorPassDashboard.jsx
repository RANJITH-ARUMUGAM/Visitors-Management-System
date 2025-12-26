import React, { useState } from 'react';
import MetricCard from './MetricCard.jsx';
import GeneratePassModal from "./GeneratePass.jsx";
import VisitorpassTable from './VisitorpassTable';
import { X, Calendar, Clock, Users, AlertTriangle, AlertOctagon } from 'lucide-react';

const mockData = {
    activeVisitors: {
        count: 47,
        trend: 3,
        trendType: 'up',
        label: 'Total Active Visitor Passes',
        icon: 'Users',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-gray-800',
        key: 'activeVisitors'
    },
    tempVisitors: {
        count: 32,
        trend: -1,
        trendType: 'down',
        label: 'Visitor Passes Checked In Today',
        icon: 'Clock',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-gray-800',
        key: 'tempVisitors'
    },
    weeklyPasses: {
        count: 18,
        trend: 5,
        trendType: 'up',
        label: 'Inactive Visitor Passes',
        icon: 'Calendar',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-gray-800',
        key: 'weeklyPasses'
    },
    expiredPasses: {
        count: 9,
        trend: 2,
        trendType: 'up',
        label: 'Expired Visitor Passes',
        icon: 'AlertTriangle',
        bgColor: 'bg-blue-50',
        borderColor: 'border-red-200',
        textColor: 'text-gray-800',
        pulse: true,
        key: 'expiredPasses'
    },
    suspiciousActivity: {
        count: 3,
        trend: 1,
        trendType: 'up',
        label: 'Suspicious Activity',
        icon: 'AlertOctagon',
        bgColor: 'bg-blue-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-gray-800',
        badge: 'Review Required',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        key: 'suspiciousActivity'
    },
    noCheckout: {
        count: 5,
        trend: 2,
        trendType: 'up',
        label: 'Visitors Without Checkout',
        icon: 'LogOut',
        bgColor: 'bg-blue-50',
        borderColor: 'border-orange-200',
        textColor: 'text-gray-800',
        badge: '⚠️ Action Needed',
        badgeColor: 'bg-orange-100 text-orange-800',
        key: 'noCheckout'
    }
};

const VisitorPassDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleCardClick = (cardKey) => {
        setSelectedCard(mockData[cardKey]);
        setIsDrawerOpen(true);
    };

    return (
        <div className="min-h-screen">
            <main className="containers mx-auto">
                {/* Title with Subtitle */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-1 text-left pl-2" style={{ textShadow: '0px 13px 10px rgb(0, 0, 0)' }}>
                            Visitors Pass Dashboard
                        </h1>
                        <p className="ml-3 text-sm text-gray-500">Monitor and manage all visitor passes and check-ins</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center space-x-2 border border-blue-400"
                    >
                        <span className="text-lg">+</span>
                        <span>New Pass</span>
                    </button>
                </div>

                <div className="pt-0 px-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {Object.entries(mockData).map(([key, metric]) => (
                        <MetricCard
                            key={key}
                            {...metric}
                            onClick={() => handleCardClick(key)}
                        />
                    ))}
                </div>

                <VisitorpassTable />
            </main>

            <GeneratePassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {/* Card Details Drawer */}
            {isDrawerOpen && selectedCard && (
                <div className="mt-20 fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end">
                    <div className="bg-white w-full max-w-md shadow-xl h-full">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <div className={`p-2 rounded-lg mr-3 ${selectedCard.bgColor} ${selectedCard.borderColor} border`}>
                                    {React.createElement(require('lucide-react')[selectedCard.icon], { className: "h-5 w-5" })}
                                </div>
                                {selectedCard.label}
                            </h2>
                            <button
                                onClick={() => setIsDrawerOpen(false)}
                                className="text-gray-500 hover:text-gray-700 rounded-lg p-1 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`text-4xl font-bold ${selectedCard.textColor}`}>
                                    {selectedCard.count}
                                </div>
                                <div className={`text-sm font-semibold ${selectedCard.trendType === 'up' ? 'text-green-600' : 'text-red-600'} bg-${selectedCard.trendType === 'up' ? 'green' : 'red'}-50 px-3 py-1 rounded-full`}>
                                    {selectedCard.trendType === 'up' ? '↑' : '↓'} {Math.abs(selectedCard.trend)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Visitor List Header */}
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">Visitor Details</h3>
                                    <div className="text-sm text-gray-500">
                                        Showing {Math.min(selectedCard.count, 5)} of {selectedCard.count}
                                    </div>
                                </div>

                                {/* Sample Visitor Items based on card type */}
                                {selectedCard.key === 'activeVisitors' && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">John Smith</div>
                                                    <div className="text-sm text-gray-600">Business Meeting</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                                    Checked in: 09:15 AM
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                                    Host: Sarah Johnson
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">Robert Wilson</div>
                                                    <div className="text-sm text-gray-600">Contract Work</div>
                                                </div>
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Active
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                                    Checked in: 08:00 AM
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                                    Host: Lisa Anderson
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedCard.key === 'tempVisitors' && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">Emily Davis</div>
                                                    <div className="text-sm text-gray-600">Interview</div>
                                                </div>
                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Checked-out
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                                    Time: 10:30 AM - 02:45 PM
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                                    Host: Michael Chen
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">Sophia Johnson</div>
                                                    <div className="text-sm text-gray-600">Site Tour</div>
                                                </div>
                                                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Checked-out
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                                    Time: 02:00 PM - 04:30 PM
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                                    Host: Kevin Martinez
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedCard.key === 'weeklyPasses' && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">Patricia Martinez</div>
                                                    <div className="text-sm text-gray-600">Training</div>
                                                </div>
                                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Monthly Pass
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                                                    Generated: 08:55 AM
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                                    Host: Robert Lee
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedCard.key === 'expiredPasses' && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">Maria Garcia</div>
                                                    <div className="text-sm text-gray-600">Delivery</div>
                                                </div>
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Expired
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <AlertTriangle className="h-3 w-3 mr-1 text-blue-500" />
                                                    Checked in: 11:00 AM
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1 text-blue-500" />
                                                    Host: David Brown
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedCard.key === 'suspiciousActivity' && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">James Taylor</div>
                                                    <div className="text-sm text-gray-600">Maintenance</div>
                                                </div>
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    Suspicious
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <AlertOctagon className="h-3 w-3 mr-1 text-blue-500" />
                                                    Checked in: 07:30 AM
                                                </div>
                                                <div className="text-sm text-red-600 font-semibold">
                                                    ⚠️ No checkout recorded
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {selectedCard.key === 'noCheckout' && (
                                    <>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">James Taylor</div>
                                                    <div className="text-sm text-gray-600">Maintenance</div>
                                                </div>
                                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    No Checkout
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                                    Checked in: 07:30 AM (6+ hours)
                                                </div>
                                                <div className="text-sm text-red-600 font-semibold">
                                                    ⚠️ Action Required
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-gray-800">Daniel Brown</div>
                                                    <div className="text-sm text-gray-600">Consultation</div>
                                                </div>
                                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-semibold">
                                                    No Checkout
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-3 w-3 mr-1 text-blue-500" />
                                                    Checked in: 11:30 AM (4+ hours)
                                                </div>
                                                <div className="text-sm text-red-600 font-semibold">
                                                    ⚠️ Action Required
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Summary Stats */}
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <div className="text-gray-600">Total Visitors</div>
                                            <div className="font-bold text-gray-800">{selectedCard.count}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-600">Trend</div>
                                            <div className={`font-bold ${selectedCard.trendType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                                {selectedCard.trendType === 'up' ? '↑' : '↓'} {Math.abs(selectedCard.trend)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedCard.badge && (
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                                            <div className="text-sm text-gray-800 font-semibold">
                                                {selectedCard.badge}: Requires attention
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VisitorPassDashboard;