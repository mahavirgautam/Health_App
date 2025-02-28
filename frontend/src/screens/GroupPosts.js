import React, { useEffect, useState } from "react";
import { 
  View, Text, Button, FlatList, Alert, TouchableOpacity, ActivityIndicator, TextInput, ScrollView 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRoute, useNavigation } from "@react-navigation/native";

const GroupPosts = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params || {};

  const [posts, setPosts] = useState([]);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentTexts, setCommentTexts] = useState({}); 
  useEffect(() => {
    const loadTokenAndFetchPosts = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (!storedToken) {
          Alert.alert("⚠️ Login Required", "You need to log in first!");
          navigation.navigate("LoginScreen");
        } else {
          setToken(storedToken);
          fetchGroupPosts(storedToken);
        }
      } catch (error) {
        console.error("Error loading token:", error);
      }
    };
    loadTokenAndFetchPosts();
  }, []);

  const fetchGroupPosts = async (authToken) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://fitfolk-33796.el.r.appspot.com/api/get-group-posts/${group}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setPosts(response.data);
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to load posts!");
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postContent) => {
    try {
      await axios.post(
        "https://fitfolk-33796.el.r.appspot.com/api/like-post",
        { group_name: group, post_content: postContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.content === postContent ? { ...post, likes: post.likes + 1 } : post
        )
      );
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to like post.");
    }
  };

  const addComment = async (postContent) => {
    const commentText = commentTexts[postContent] || ""; // Get comment for specific post
    if (!commentText.trim()) {
      Alert.alert("⚠️ Error", "Comment cannot be empty.");
      return;
    }

    try {
      await axios.post(
        "https://fitfolk-33796.el.r.appspot.com/api/comment-post",
        { group_name: group, post_content: postContent, comment: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.content === postContent
            ? { ...post, comments: [...post.comments, { user: "You", text: commentText }] }
            : post
        )
      );

      setCommentTexts((prev) => ({ ...prev, [postContent]: "" }));
    } catch (error) {
      Alert.alert("⚠️ Error", "Failed to add comment.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        ListHeaderComponent={
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
            {group} - Posts
          </Text>
        }
        data={posts}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color="blue" /> : <Text>No posts yet!</Text>}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, padding: 10, marginVertical: 5 }}>
            <Text style={{ fontWeight: "bold" }}>{item.user}</Text>
            <Text>{item.content}</Text>
            <Text>❤️ {item.likes} Likes</Text>
  
            <TouchableOpacity 
              onPress={() => likePost(item.content)} 
              style={{ marginTop: 5, backgroundColor: "#ddd", padding: 5, borderRadius: 5 }}
            >
              <Text style={{ textAlign: "center" }}>👍 Like</Text>
            </TouchableOpacity>
  
            <TextInput
              placeholder="Write a comment..."
              value={commentTexts[item.content] || ""}
              onChangeText={(text) => setCommentTexts((prev) => ({ ...prev, [item.content]: text }))}
              style={{ borderWidth: 1, padding: 5, marginTop: 5 }}
            />
            <TouchableOpacity 
              onPress={() => addComment(item.content)} 
              style={{ marginTop: 5, backgroundColor: "#ddd", padding: 5, borderRadius: 5 }}
            >
              <Text style={{ textAlign: "center" }}>💬 Comment</Text>
            </TouchableOpacity>
  
            <FlatList
              data={item.comments}
              keyExtractor={(cmt, index) => index.toString()}
              renderItem={({ item }) => (
                <Text>🗨 {item.user}: {item.text}</Text>
              )}
            />
          </View>
        )}
      />
    </View>
  );
  
};

export default GroupPosts;
