import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    // add more statuses if needed
};

const statusColors: Record<string, string> = {
    pending: '#f59e0b', // amber
    preparing: '#3b82f6', // blue
    ready: '#10b981', // green
    // add more colors if needed
};

type TimeSlot = {
    start_time: string; // e.g. "11:00"
    end_time: string;   // e.g. "12:00"
    price: number;
    date: string;       // e.g. "Sat Jul 26 2025"
};

type TableInfo = {
    floor: string;
    table_number: string;
    type: string;
    price: string;
    premium: number; // 0 or 1
    seats: string;
    time_slot?: TimeSlot[];
    is_booked: string; // "0" or "1"
};

type BookingData = {
    id: number;
    user_id: number;
    shop_id: number;
    name: string;
    phone: string;
    table_info: TableInfo[];
    booking_date: string; // "YYYY-MM-DD"
    time_slot: TimeSlot[] | null; // overall booking slots
    guests: number;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    isbooked: number;
};

type Props = {
    bookingData: BookingData;
};

const BookedTableCard: React.FC<Props> = ({ bookingData }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.title}>Booking #{bookingData.id} - {bookingData.name}</Text>
                    <Text
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColors[bookingData.status] || '#6b7280' },
                        ]}
                    >
                        {statusLabels[bookingData.status] || bookingData.status}
                    </Text>
                </View>

                <Text style={styles.text}>
                    Booking Date: <Text style={styles.bold}>{bookingData.booking_date}</Text>
                </Text>
                <Text style={styles.text}>
                    Guests: <Text style={styles.bold}>{bookingData.guests}</Text>
                </Text>

                {/* Overall booking-level time slots (if any) */}
                {bookingData.time_slot && bookingData.time_slot.length > 0 && (
                    <View style={{ marginTop: 8 }}>
                        <Text style={styles.subSectionTitle}>Booking Time Slot(s):</Text>
                        {bookingData.time_slot.map((slot, idx) => (
                            <Text key={idx} style={styles.timeSlotText}>
                                {slot.date} | {slot.start_time} - {slot.end_time} • ₹{slot.price}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Table Info */}
                {bookingData.table_info.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.subSectionTitle}>Table Info:</Text>
                        {bookingData.table_info.map((table, idx) => (
                            <View key={idx} style={styles.tableContainer}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.tableTitle}>
                                        Table {table.table_number} (Floor: {table.floor})
                                    </Text>
                                    <Text style={[styles.bookingStatus, { color: table.is_booked === "1" ? '#10b981' : '#dc2626' }]}>
                                        {table.is_booked === "1" ? 'Booked' : 'Available'}
                                    </Text>
                                </View>
                                <Text style={styles.tableText}>Type: {table.type}</Text>
                                <Text style={styles.tableText}>Price: ₹{table.price}</Text>
                                <Text style={styles.tableText}>Seats: {table.seats}</Text>
                                <Text style={[styles.premiumBadge, { backgroundColor: table.premium ? '#f97314' : '#6b7280' }]}>
                                    {table.premium ? 'Premium' : 'Standard'}
                                </Text>

                                {/* Table-level time slots */}
                                {table.time_slot && table.time_slot.length > 0 && (
                                    <View style={{ marginTop: 6 }}>
                                        <Text style={{ fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                                            Table Time Slot(s):
                                        </Text>
                                        {table.time_slot.map((slot, slotIdx) => (
                                            <Text key={slotIdx} style={styles.timeSlotText}>
                                                {slot.date} | {slot.start_time} - {slot.end_time} • ₹{slot.price}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {bookingData.description ? (
                    <Text style={[styles.text, { marginTop: 8 }]}>Note: {bookingData.description}</Text>
                ) : null}

                <TouchableOpacity style={styles.detailsButton} onPress={() => setShowModal(true)}>
                    <Text style={styles.detailsButtonText}>Show Booking Details</Text>
                </TouchableOpacity>
            </View>

            {/* Modal */}
            <Modal visible={showModal} animationType="slide" onRequestClose={() => setShowModal(false)}>
                <ScrollView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Booking #{bookingData.id} Details</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Ionicons name="close" size={26} color="#555" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Customer Name:</Text> {bookingData.name}
                    </Text>
                    <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Phone:</Text> {bookingData.phone}
                    </Text>
                    <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Booking Date:</Text> {bookingData.booking_date}
                    </Text>
                    <Text style={styles.modalText}>
                        <Text style={styles.modalLabel}>Guests:</Text> {bookingData.guests}
                    </Text>

                    {/* Overall booking time slots */}
                    {bookingData.time_slot && bookingData.time_slot.length > 0 && (
                        <>
                            <Text style={[styles.modalLabel, { marginTop: 12 }]}>Booking Time Slot(s):</Text>
                            {bookingData.time_slot.map((slot, idx) => (
                                <Text key={idx} style={styles.modalText}>
                                    {slot.date} | {slot.start_time} - {slot.end_time} • ₹{slot.price}
                                </Text>
                            ))}
                        </>
                    )}

                    {/* Table Info */}
                    {bookingData.table_info.length > 0 && (
                        <>
                            <Text style={[styles.modalLabel, { marginTop: 12 }]}>Table Info:</Text>
                            {bookingData.table_info.map((table, idx) => (
                                <View key={idx} style={styles.modalTableContainer}>
                                    <Text>Table Number: {table.table_number}</Text>
                                    <Text>Floor: {table.floor}</Text>
                                    <Text>Type: {table.type}</Text>
                                    <Text>Price: ₹{table.price}</Text>
                                    <Text>Seats: {table.seats}</Text>
                                    <Text>Premium: {table.premium ? 'Yes' : 'No'}</Text>
                                    <Text>Status: {table.is_booked === "1" ? 'Booked' : 'Available'}</Text>
                                    {table.time_slot && table.time_slot.length > 0 && (
                                        <>
                                            <Text style={{ fontWeight: '600', marginTop: 6 }}>Time Slot(s):</Text>
                                            {table.time_slot.map((slot, slotIdx) => (
                                                <Text key={slotIdx}>
                                                    {slot.date} | {slot.start_time} - {slot.end_time} • ₹{slot.price}
                                                </Text>
                                            ))}
                                        </>
                                    )}
                                </View>
                            ))}
                        </>
                    )}

                    {bookingData.description ? (
                        <Text style={[styles.modalText, { marginTop: 12 }]}>Description: {bookingData.description}</Text>
                    ) : null}

                    <TouchableOpacity style={[styles.detailsButton, { marginTop: 20, marginBottom: 30 }]} onPress={() => setShowModal(false)}>
                        <Text style={[styles.detailsButtonText]} className='text-primary-100'>Close</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#d1d5db', // gray-300
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    title: {
        fontSize: 14,
        color: '#111427', // gray-900
        fontFamily: 'Raleway-Bold'

    },
    statusBadge: {
        color: 'white',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 20,
        fontWeight: '600',
        fontSize: 12,
        alignSelf: 'flex-start',
        fontFamily: 'Raleway-Regular'

    },
    text: {
        color: '#4b5563', // gray-600
        marginTop: 4,
        fontSize: 12
    },
    bold: {
        color: '#111427',
        fontFamily: 'Raleway-Bold'
    },
    subSectionTitle: {
        fontWeight: '600',
        fontSize: 15,
        color: '#374151',
        marginBottom: 6,
        fontFamily: 'Raleway-Regular'
    },
    tableContainer: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
    tableTitle: {
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 4,
        color: '#1f2937',
        fontFamily: 'Raleway-Regular'

    },
    tableText: {
        color: '#374151',
        fontSize: 13,
        marginBottom: 2,
        fontFamily: 'Raleway-Regular'

    },
    premiumBadge: {
        marginTop: 6,
        alignSelf: 'flex-start',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 14,
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        backgroundColor: '#6b7280',
        fontFamily: 'Raleway-Regular'

    },
    bookingStatus: {
        fontWeight: '600',
        fontSize: 13,
    },
    detailsButton: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#a78bfa',
        paddingVertical: 10,
        borderRadius: 30,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: '#a78bfa',
        fontFamily: 'Raleway-Bold'

    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: 'Raleway-Bold'
    },
    modalText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        fontFamily: 'Raleway-Bold'

    },
    modalLabel: {
        fontWeight: 'bold',
        color: '#111427',
        fontSize: 14,
        fontFamily: 'Raleway-Bold'
    },
    modalTableContainer: {
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        marginBottom: 12,
    },
});

export default BookedTableCard;
