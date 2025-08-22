import Ionicons from 'react-native-vector-icons/Ionicons';
import React from 'react';

const NearByUserCard = ({ notification }: any) => {
    const { customer, message, created_at } = notification;
    const formattedDate = new Date(created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden m-4 transition-transform transform hover:scale-105">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Ionicons name='bell' className="h-6 w-6 text-blue-500 mr-3" />
                        <h2 className="text-lg font-semibold text-gray-900">Nearby User Alert</h2>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <Ionicons name='close' className="h-5 w-5" />
                    </button>
                </div>
                <p className="mt-2 text-gray-600">{message}</p>
                <p className="mt-1 text-sm text-gray-500">
                    From: <span className="font-medium">{customer.name}</span>
                </p>
                <p className="mt-1 text-sm text-gray-400">{formattedDate}</p>
            </div>
        </div>
    );
};

export default NearByUserCard;