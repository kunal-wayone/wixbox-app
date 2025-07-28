import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import RenderHtml from 'react-native-render-html'
import axios from 'axios'

const ContactUsScreen = () => {
    const [content, setContent] = useState<any>('')
    const [name, setName] = useState<any>('')
    const [email, setEmail] = useState<any>('')
    const [message, setMessage] = useState<any>('')
    const [queries, setQueries] = useState<any>([])
    const [loading, setLoading] = useState<any>(true)
    const [error, setError] = useState<any>(null)
    const [submitStatus, setSubmitStatus] = useState<any>(null)

    useEffect(() => {
        fetchContent()
        fetchQueries()
    }, [])

    const fetchContent = async () => {
        try {
            setLoading(true)
            // Mock API response
            const response = {
                data: {
                    html: `
        <h2>Contact Foodie Haven</h2>
        <p>Email: support@foodie-haven.com</p>
        <p>Phone: +1-800-FOODIE</p>
        <p>Address: 123 Flavor Street, Food City, FC 12345</p>
      ` }
            }
            setContent(response.data.html)
        } catch (err) {
            setError('Failed to load contact info. Please try again.')
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

    const handleSubmit = async () => {
        try {
            setSubmitStatus('Submitting...')
            // Mock API call for form submission
            await new Promise((resolve: any) => setTimeout(resolve, 1000)) // Simulate API delay
            setSubmitStatus('Message sent successfully!')
            setName('')
            setEmail('')
            setMessage('')
        } catch (err) {
            setSubmitStatus('Failed to send message. Please try again.')
        }
    }

    const htmlStyles: any = {
        h2: { fontSize: 20, fontFamily: 'Raleway-Bold', color: '#1F2937', marginBottom: 8 },
        p: { fontSize: 16, color: '#4B5563', lineHeight: 24 }
    }

    return (
        <ScrollView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
            {/* Header */}
            <View className="p-6 pt-12 pb-8 bg-primary-90 rounded-b-3xl shadow-lg">
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-4xl  text-white text-center tracking-tight">
                    Contact Us
                </Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-lg font-medium text-orange-100 text-center mt-2">
                    We're Here to Help
                </Text>
            </View>

            {/* Contact Info */}
            <View className="px-5 mt-6">
                {loading ? (
                    <ActivityIndicator size="large" color="#F97316" />
                ) : error ? (
                    <View className="bg-red-100 rounded-2xl p-4">
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-600 text-base">{error}</Text>
                        <TouchableOpacity
                            className="mt-4 bg-primary-90 rounded-lg p-3"
                            onPress={fetchContent}
                        >
                            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-center">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="bg-white rounded-2xl p-6 shadow-md">
                        <RenderHtml contentWidth={300} source={{ html: content }} tagsStyles={htmlStyles} />
                    </View>
                )}
            </View>

            {/* Contact Form */}
            <View className="px-5 mt-6">
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-2xl text-gray-800 text-center mb-4">
                    Send Us a Message
                </Text>
                <View className="bg-white rounded-2xl p-6 shadow-md">
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="Your Name"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="Your Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="Your Message"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={4}
                    />
                    <TouchableOpacity
                        className="bg-primary-90 rounded-lg p-3"
                        onPress={handleSubmit}
                    >
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-center">Submit</Text>
                    </TouchableOpacity>
                    {submitStatus && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className={`text-center mt-2 ${submitStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                            {submitStatus}
                        </Text>
                    )}
                </View>
            </View>

            {/* Queries Section */}
            <View className="px-5 mt-6 mb-8">
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-2xl text-gray-800 text-center mb-4">
                    Your Queries
                </Text>
                {queries.length === 0 ? (
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-600 text-center">No queries found.</Text>
                ) : (
                    queries.map((query: any) => (
                        <View key={query.id} className="bg-white rounded-xl p-4 shadow-md mb-4">
                            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-gray-800">{query.query}</Text>
                            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-600 text-sm">Status: {query.status}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}

export default ContactUsScreen