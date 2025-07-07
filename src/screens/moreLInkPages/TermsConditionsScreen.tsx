import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import RenderHtml from 'react-native-render-html'
import axios from 'axios'
import { Fetch } from '../../utils/apiUtils'

const TermsConditionsScreen = () => {
    const [content, setContent] = useState<any>('')
    const [queries, setQueries] = useState<any>([])
    const [loading, setLoading] = useState<any>(true)
    const [error, setError] = useState<any>(null)

    useEffect(() => {
        fetchContent()
        fetchQueries()
    }, [])

    const fetchContent = async () => {
        try {
            setLoading(true)
            // Mock API response
            const response: any = await Fetch('/terms-and-conditions', {}, 5000)
            if (!response?.status) throw new Error('Failed to fetch terms and condition');

            console.log(response?.status)
            setContent(response?.content)
        } catch (err) {
            console.log(err, "dfd")
            // setError('Failed to load terms. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const fetchQueries = async () => {
        try {
            // Mock API response for queries
            const response = {
                data: [
                    { id: 1, query: 'How do I book a table?', status: 'Resolved' },
                    { id: 2, query: 'Can I cancel my order?', status: 'Pending' }
                ]
            }
            setQueries(response.data)
        } catch (err) {
            setError('Failed to load queries.')
        }
    }

    const htmlStyles: any = {
        h2: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
        h3: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 12, marginBottom: 6 },
        p: { fontSize: 16, color: '#4B5563', lineHeight: 24 }
    }

    return (
        <ScrollView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
            {/* Header */}
            <View className="p-6 pt-12 pb-8 bg-primary-90 rounded-b-3xl shadow-lg">
                <Text className="text-4xl font-extrabold text-white text-center tracking-tight">
                    Terms & Conditions
                </Text>
                <Text className="text-lg font-medium text-orange-100 text-center mt-2">
                    Our Commitment to You
                </Text>
            </View>

            {/* Main Content */}
            <View className="px-5 mt-6">
                {loading ? (
                    <ActivityIndicator size="large" color="#F97316" />
                )
                    : error ? (
                        <View className="bg-red-100 rounded-2xl p-4">
                            <Text className="text-red-600 text-base">{error}</Text>
                            <TouchableOpacity
                                className="mt-4 bg-primary-90 rounded-lg p-3"
                                onPress={fetchContent}
                            >
                                <Text className="text-white text-center font-semibold">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )
                        :
                        (
                            <View className="bg-white rounded-2xl p-6 shadow-md">
                                <RenderHtml contentWidth={300} source={{ html: content }} tagsStyles={htmlStyles} />
                            </View>
                        )}
            </View>

            {/* Queries Section */}
            <View className="px-5 mt-6 mb-8 hidden">
                <Text className="text-2xl font-bold text-gray-800 text-center mb-4">
                    Your Queries
                </Text>
                {queries.length === 0 ? (
                    <Text className="text-gray-600 text-center">No queries found.</Text>
                ) : (
                    queries.map((query: any) => (
                        <View key={query.id} className="bg-white rounded-xl p-4 shadow-md mb-4">
                            <Text className="text-gray-800 font-semibold">{query.query}</Text>
                            <Text className="text-gray-600 text-sm">Status: {query.status}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}

export default TermsConditionsScreen