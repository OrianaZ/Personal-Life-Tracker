import { ThemedText } from "@/components/theme/ThemedText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Button, Image, StyleSheet, View } from "react-native";

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
    <View style={styles.container}>
      {selectedImage ? (
        <View style={styles.imageWrapper}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
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

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", marginBottom: 50,},
  imageWrapper: { width: "90%", height: 325, resizeMode: "contain", },
  image: { width: "100%", aspectRatio: 1.2, overflow: "hidden",  marginBottom: 10, borderRadius: 20,  },
});
