import { View, TouchableOpacity, Alert, Text } from "react-native";

const RenderTableItem = ({ item }: { item: any }) => {
    const seats = item?.seats || 2;

    // Fixed dimensions
    let tableWidth = 100;
    let tableHeight = 100;
    let borderRadius = 12;

    if (seats <= 8) {
        // Square table
        tableWidth = 100;
        tableHeight = 100;
        borderRadius = 12;
    } else {
        // Rectangular table
        tableWidth = 120;
        tableHeight = 70;
        borderRadius = 16;
    }

    // Seat Distribution Based on Rule
    const getSeatDistribution = (count: number) => {
        if (count <= 8) {
            return [
                { side: 'top', count: 1 },
                { side: 'right', count: 1 },
                { side: 'bottom', count: 1 },
                { side: 'left', count: 1 },
            ];
        } else {
            return [
                { side: 'top', count: 3 },
                { side: 'right', count: 2 },
                { side: 'bottom', count: 3 },
                { side: 'left', count: 2 },
            ];
        }
    };

    const seatDistribution = getSeatDistribution(seats);
    const seatSize = 25;
    const seatThickness = 6;

    const getLineColor = () => {
        if (item.isBooked) return '#00C01A80';
        if (item.premium) return '#B68AD480'; // primary-40
        return 'gray';
    };

    const renderChairLines = (side: string, count: number) => {
        if (count === 0) return null;

        const lines = [];
        const color = getLineColor();
        const isHorizontal = side === 'top' || side === 'bottom';
        const offset = 5;
        const spacing = isHorizontal ? tableWidth : tableHeight;

        for (let i = 0; i < count; i++) {
            const gap = spacing / (count + 1);
            const center = gap * (i + 1);

            let style: any = {
                position: 'absolute',
                backgroundColor: color,
                borderRadius: 6,
            };

            if (isHorizontal) {
                style.width = seatSize;
                style.height = seatThickness;
                style.left = center - seatSize / 2;
                style[side] = -8;
            } else {
                style.width = seatThickness;
                style.height = seatSize;
                style.top = center - seatSize / 2;
                style[side] = -8;
            }

            lines.push(<View key={`${side}-seat-${i}`} style={style} />);
        }

        return lines;
    };

    return (
        <TouchableOpacity
            className="flex-1 m-2 items-center justify-center"
            onPress={() => {
                if (!item.isBooked) {
                    Alert.alert(
                        'Book Table',
                        `Book ${item.table_number} with ${item.seats} seats?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Confirm',
                                onPress: () => {
                                    const updatedTables = { ...tableData };
                                    updatedTables[selectedFloor] = updatedTables[selectedFloor].map((t: any) =>
                                        t.id === item.id ? { ...t, isBooked: true } : t
                                    );
                                    setIsModalVisible(false);
                                    Alert.alert('Success', `${item.table_number} booked successfully!`);
                                },
                            },
                        ]
                    );
                }
            }}>
            <View
                style={{
                    width: tableWidth,
                    height: tableHeight,
                    borderRadius,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <View
                    className={`w-10/12 h-14 rounded-xl flex-row justify-center items-center ${item.isBooked ? 'bg-green-500' : item.premium ? 'bg-primary-40' : 'bg-gray-200'
                        }`}>
                    <Text className="text-black text-sm font-semibold">
                        {item.table_number} ({item.seats})
                    </Text>
                </View>

                {/* Chairs around the table */}
                {seatDistribution.map(({ side, count }) => renderChairLines(side, count))}
            </View>
        </TouchableOpacity>
    );
};


export default RenderTableItem