import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // or wherever you're importing icons
import ImagePath from './your-image-path'; // Adjust this

const ReviewComment = ({ comment }: { comment: string }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 14, color: '#555', marginTop: 4 }}
        numberOfLines={expanded ? undefined : 2}
      >
        💬 {comment}
      </Text>

      {comment.length > 100 && (
        <TouchableOpacity onPress={toggleExpanded}>
          <Text style={{ fontFamily: 'Raleway-Regular', color: '#007bff', marginTop: 4 }}>
            {expanded ? 'Read less' : 'Read more'}
          </Text>
        </TouchableOpacity>
      )
      }
    </View >
  );
};

export default ReviewComment