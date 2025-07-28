import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import RenderHtml from 'react-native-render-html'
import axios from 'axios'

const FaqsScreen = () => {
  const [content, setContent] = useState('')
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        <h2>Frequently Asked Questions</h2>
        <h3>How do I place an order?</h3>
        <p>Browse restaurants, select items, add to cart, and checkout with your preferred payment method.</p>
        <h3>Can I book a table?</h3>
        <p>Yes, select a restaurant, choose a date and time, and confirm your reservation.</p>
      ` }
      }
      setContent(response.data.html)
    } catch (err) {
      setError('Failed to load FAQs. Please try again.')
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
    h2: { fontSize: 20, fontFamily: 'Raleway-Bold', color: '#1F2937', marginBottom: 8 },
    h3: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 12, marginBottom: 6 },
    p: { fontSize: 16, color: '#4B5563', lineHeight: 24 }
  }

  return (
    <ScrollView className="flex-1 bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <View className="p-6 pt-12 pb-8 bg-primary-90 rounded-b-3xl shadow-lg">
        <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-4xl  text-white text-center tracking-tight">
          FAQs
        </Text>
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-lg font-medium text-orange-100 text-center mt-2">
          Answers to Your Questions
        </Text>
      </View>

      {/* Main Content */}
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

export default FaqsScreen