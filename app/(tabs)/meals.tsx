import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert, InteractionManager, Keyboard, KeyboardAvoidingView, Modal,
  Platform, ScrollView, StyleSheet,
  TextInput, TouchableOpacity,
  View
} from 'react-native';
import { RenderItemParams } from 'react-native-draggable-flatlist';
import type { FlatList } from "react-native-gesture-handler";
import { TabBar, TabView } from 'react-native-tab-view';

import GroceryScene from '@/components/GroceryScene';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MealsContext } from '@/context/MealsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'GROCERY_ITEMS';
const ITEM_HEIGHT = 50;

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface GroceryItem {
  id: string;
  text: string;
  quantity: string;
  checked: boolean;
}

// ---------- Memoized Grocery Item ----------
const RenderGroceryItem = React.memo(
  ({
    item, drag, isActive, toggleGroceryChecked, updateGroceryQuantity, setGroceryItems, flatListRef, index
  }: RenderItemParams<GroceryItem> & {
    toggleGroceryChecked: (id: string) => void;
    updateGroceryQuantity: (id: string, quantity: string) => void;
    setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
    flatListRef: React.RefObject<FlatList<GroceryItem> | null>;
    index: number;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const inputRef = useRef<TextInput>(null);
    const [localQuantity, setLocalQuantity] = useState(item.quantity);

    useEffect(() => {
      if (!isEditing) setEditText(item.text);
    }, [item.text, isEditing]);

    useEffect(() => {
      if (isEditing) {
        const t = setTimeout(() => inputRef.current?.focus(), 50);
        return () => clearTimeout(t);
      }
    }, [isEditing]);

    const saveEdit = () => {
      setGroceryItems(prev => prev.map(i => (i.id === item.id ? { ...i, text: editText } : i)));
      setIsEditing(false);
    };

    const scrollIntoView = () => {
      try {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (e) {}
    };

    return (
      <View style={[styles.groceryItemContainer, isActive && styles.activeItem, { alignItems: "center" }]}>
        <TouchableOpacity onLongPress={drag} onPressIn={drag} delayLongPress={150} style={styles.dragHandle}>
          <MaterialCommunityIcons name="drag" size={20} color={Colors.light.gray} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleGroceryChecked(item.id)}>
          <MaterialCommunityIcons
            name={item.checked ? "checkbox-marked-outline" : "checkbox-blank-outline"}
            size={24}
            color={item.checked ? Colors.light.purple : Colors.light.gray}
          />
        </TouchableOpacity>

        {isEditing ? (
          <TextInput
            ref={inputRef}
            style={[styles.groceryItemText, { flex: 1 }]}
            value={editText}
            onChangeText={setEditText}
            onBlur={saveEdit}
            onSubmitEditing={saveEdit}
            returnKeyType="done"
            blurOnSubmit={true}
            onFocus={scrollIntoView}
          />
        ) : (
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              Keyboard.dismiss();
              requestAnimationFrame(() => setIsEditing(true));
            }}
          >
            <ThemedText style={[styles.groceryItemText, item.checked && styles.checkedText]}>
              {item.text}
            </ThemedText>
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.quantityInput}
          keyboardType="number-pad"
          value={localQuantity}
          onChangeText={setLocalQuantity}
          onBlur={() => updateGroceryQuantity(item.id, localQuantity)}
          onSubmitEditing={() => updateGroceryQuantity(item.id, localQuantity)}
          returnKeyType="done"
          onFocus={scrollIntoView}
        />
      </View>
    );
  }
);

// ---------- Main Component ----------
export default function MealsScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'meals', title: 'Meals' },
    { key: 'grocery', title: 'Grocery List' },
  ]);

  const { meals: mealData, setMeals: setMealData } = useContext(MealsContext);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [mealModalVisible, setMealModalVisible] = useState(false);
  const mainInputRef = useRef<TextInput>(null);
  const [tempMeal, setTempMeal] = useState({ out: '', main: '', side: '' });

  useEffect(() => {
    if (mealModalVisible && mainInputRef.current) {
      setTimeout(() => {
        mainInputRef.current?.focus();
      }, 100);
    }
  }, [mealModalVisible]);

  const clearAllMeals = () => {
    Alert.alert(
      "Clear All Meals",
      "Are you sure you want to clear all meal data for the week?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            const clearedMeals = daysOfWeek.reduce((acc, day) => {
              acc[day] = { out: '', main: '', side: '' };
              return acc;
            }, {} as Record<string, { out: string; main: string; side: string }>);
            setMealData(clearedMeals);
          },
        },
      ]
    );
  };

  // --- Meals Modal Handlers ---
  const openMealModal = (day: string) => {
    setSelectedDay(day);
    const meal = mealData[day] || { out: '', main: '', side: '' };
    setTempMeal({ ...meal });
    setMealModalVisible(true);
  };
  const cancelMealModal = () => {
    setMealModalVisible(false);
    setTempMeal({ out: '', main: '', side: '' });
  };
  const saveMealModal = async () => {
    if (!selectedDay) return;
    const updatedMeals = { ...mealData, [selectedDay]: { ...tempMeal } };
    setMealData(updatedMeals);
    setMealModalVisible(false);
    setTempMeal({ out: '', main: '', side: '' });
  };

  // --- Grocery List State ---
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [tempNewItemText, setTempNewItemText] = useState("");
  const groceryInputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList<GroceryItem>>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setGroceryItems(JSON.parse(saved));
      } catch (err) { console.warn('Failed to load grocery items', err); }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groceryItems)).catch(err =>
      console.warn('Failed to save grocery items', err)
    );
  }, [groceryItems]);

  const addGroceryItem = useCallback(() => {
    const trimmed = tempNewItemText.trim();
    if (!trimmed) return;

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      text: trimmed,
      quantity: "",
      checked: false,
    };

    setGroceryItems(prev => [...prev, newItem]);
    setTempNewItemText("");

    InteractionManager.runAfterInteractions(() => {
      groceryInputRef.current?.focus();
      setTimeout(() => groceryInputRef.current?.focus(), 50);
    });
  }, [tempNewItemText]);

  const toggleGroceryChecked = useCallback((id: string) => {
    setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  }, []);

  const deleteCheckedGroceryItems = useCallback(() => {
    setGroceryItems(prev => prev.filter(item => !item.checked));
  }, []);

  const updateGroceryQuantity = useCallback((id: string, quantity: string) => {
    setGroceryItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  }, []);

  const MealsScene = useCallback(() => (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      {daysOfWeek.map(day => (
        <TouchableOpacity key={day} style={styles.dayContainer} onPress={() => openMealModal(day)}>
          <View style={styles.dayHeader}>
            <ThemedText type="subtitle" style={styles.WeekDay}>{day}</ThemedText>
            {mealData[day]?.out ? <ThemedText style={styles.Out}>{mealData[day]?.out}</ThemedText> : null}
          </View>
          {mealData[day]?.main ? <ThemedText style={styles.Main}>{mealData[day]?.main}</ThemedText> : null}
          {mealData[day]?.side ? <ThemedText style={styles.Side}>{mealData[day]?.side}</ThemedText> : null}
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.light.red, marginBottom: 50 }]} onPress={clearAllMeals}>
        <ThemedText style={styles.buttonText}>Clear All Meals</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  ), [mealData]);

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "meals": return <MealsScene />;
      case "grocery":
        return (
          <GroceryScene
            groceryItems={groceryItems}
            tempNewItemText={tempNewItemText}
            setTempNewItemText={setTempNewItemText}
            addGroceryItem={addGroceryItem}
            renderGroceryItem={(params) => {
              const p = params as RenderItemParams<GroceryItem> & { index: number };
              return (
                <RenderGroceryItem
                  {...p}
                  toggleGroceryChecked={toggleGroceryChecked}
                  updateGroceryQuantity={updateGroceryQuantity}
                  setGroceryItems={setGroceryItems}
                  flatListRef={flatListRef}
                />
              );
            }}    
            deleteCheckedGroceryItems={deleteCheckedGroceryItems}
            setGroceryItems={setGroceryItems}
            flatListRef={flatListRef}
          />
        );
      default: return null;
    }
  };

  return (
    <>
      <TabView
        style={styles.tabContainer}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 400 }}
        renderTabBar={(props: any) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: Colors.light.purple }}
            style={{ backgroundColor: 'transparent' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
          />
        )}
      />

      {/* Meals Modal */}
      <Modal visible={mealModalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <ThemedText style={{ fontWeight: 'bold', marginBottom: 10 }}>{selectedDay}</ThemedText>
            <TextInput
              style={styles.modalInput}
              placeholder="Out"
              placeholderTextColor={Colors.light.placeholder}
              value={tempMeal.out}
              onChangeText={val => setTempMeal(prev => ({ ...prev, out: val }))}
              autoFocus
            />
            <TextInput
              ref={mainInputRef}
              style={styles.modalInput}
              placeholder="Main"
              placeholderTextColor={Colors.light.placeholder}
              value={tempMeal.main}
              onChangeText={val => setTempMeal(prev => ({ ...prev, main: val }))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="w/"
              placeholderTextColor={Colors.light.placeholder}
              value={tempMeal.side}
              onChangeText={val => setTempMeal(prev => ({ ...prev, side: val }))}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: 'gray' }]} onPress={cancelMealModal}>
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: Colors.light.purple }]} onPress={saveMealModal}>
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: { marginBottom: 0 },
  scrollContainer: { padding: 20 },

  // Meals
  dayContainer: { marginBottom: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  WeekDay: { fontWeight: "bold", textDecorationLine: "underline", fontSize: 18, color: Colors.light.purple },
  Out: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14 },
  Main: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  Side: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14, marginLeft: 12 },

  // Meals Modal
  modalContainer: { flex: 1, backgroundColor: Colors.dark.backgroundOpacity, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: Colors.dark.gray, padding: 20, borderRadius: 10 },
  modalInput: { borderBottomWidth: 1, borderBottomColor: Colors.dark.borderGray, color: Colors.light.text, marginBottom: 12, fontSize: 16, paddingVertical: 4 },

  // Buttons
  button: { padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: 'bold' },

  // Grocery
  groceryItemContainer: { flexDirection: "row", alignItems: "center", justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 7, height: ITEM_HEIGHT },
  activeItem: { backgroundColor: Colors.dark.gray },
  groceryItemText: { fontSize: 16, color: Colors.light.text, borderBottomColor: Colors.light.borderGray, borderBottomWidth: 1, padding:5, marginHorizontal: 10},
  checkedText: { textDecorationLine: "line-through", color: Colors.light.placeholder },
  quantityInput: { width: 50, height: 36, backgroundColor: Colors.dark.gray, borderRadius: 6, textAlign: "center", color: Colors.light.text },

  dragHandle: { justifyContent: "center", alignItems: "center", marginRight: 8 },
});
