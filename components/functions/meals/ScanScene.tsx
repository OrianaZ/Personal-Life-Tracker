//general
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Button, Image, View } from "react-native";

//styles
import { mealsStyles } from '@/components/styles/_meals.styles';

//theme
import { ThemedText } from "@/components/theme/ThemedText";


const STORAGE_KEY = "GROCERY_CARD_IMAGE";

export default function ScanScene() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Load image from storage on mount
  useEffect(() => {
    const loadImage = async () => {
      try {
        const uri = await AsyncStorage.getItem(STORAGE_KEY);
        if (uri) setSelectedImage(uri);
      } catch (e) {
        console.error("Failed to load grocery card image", e);
      }
    };
    loadImage();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);

      try {
        await AsyncStorage.setItem(STORAGE_KEY, uri);
      } catch (e) {
        console.error("Failed to save grocery card image", e);
      }
    }
  };

  return (
    <View style={mealsStyles.container}>
      {selectedImage ? (
        <View style={mealsStyles.imageWrapper}>
          <Image source={{ uri: selectedImage }} style={mealsStyles.image} />
        </View>
      ) : (
        <ThemedText>No grocery card uploaded yet.</ThemedText>
      )}
      <Button
        title={selectedImage ? "Replace Grocery Card" : "Upload Grocery Card"}
        onPress={pickImage}
      />
    </View>
  );
}
