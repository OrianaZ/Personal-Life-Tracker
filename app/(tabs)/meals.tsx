import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { MealsContext } from '@/context/MealsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Modal,
  Platform,
  ScrollView, StyleSheet,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TabBar, TabView } from 'react-native-tab-view';


const STORAGE_KEYS = {
  MEALS: 'MEALS_DATA',
  GROCERY: 'GROCERY_LIST',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- Grocery Row Component ---
type GroceryRowProps = {
  item: { name: string; checked: boolean; quantity: string };
  onUpdate: (updated: { name: string; checked: boolean; quantity: string }) => void;
  onBlur: () => void;
};

const GroceryRow = ({ item, onUpdate, onBlur }: GroceryRowProps) => {
  const [name, setName] = useState(item.name);
  const [checked, setChecked] = useState(item.checked);
  const [quantity, setQuantity] = useState(item.quantity);

  const handleBlur = () => {
    onUpdate({ name, checked, quantity });
    onBlur();
  };

  return (
    <View style={styles.groceryItem}>
      <TouchableOpacity
        onPress={() => {
          const newChecked = !checked;
          setChecked(newChecked);
          onUpdate({ name, checked: newChecked, quantity });
        }}
        style={styles.checkbox}
      >
        <ThemedText style={styles.checkboxText}>{checked ? '☑' : '☐'}</ThemedText>
      </TouchableOpacity>
      <TextInput
        style={[styles.groceryItemTextInput, { textDecorationLine: checked ? 'line-through' : 'none' }]}
        value={name}
        onChangeText={setName}
        onBlur={handleBlur}
        placeholder="Item name"
        placeholderTextColor= {Colors.light.placeholder}
      />
      <TextInput
        style={styles.quantityInput}
        value={quantity}
        onChangeText={(val) => { if (/^\d*$/.test(val)) setQuantity(val); }}
        onBlur={handleBlur}
        keyboardType="numeric"
        placeholder=""
        placeholderTextColor={Colors.light.placeholder}
      />
    </View>
  );
};

// --- Main Component ---
export default function MealsScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'meals', title: 'Meals' },
    { key: 'grocery', title: 'Grocery' },
  ]);

  // Meals
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

  // Grocery
  const [groceryItems, setGroceryItems] = useState<{ name: string; checked: boolean; quantity: string }[]>([{ name: '', checked: false, quantity: '' }]);

  // Load AsyncStorage once
  useEffect(() => {
    (async () => {
      const groceryJson = await AsyncStorage.getItem(STORAGE_KEYS.GROCERY);
      if (groceryJson) setGroceryItems(JSON.parse(groceryJson));
    })();
  }, []);

  // --- Meals Modal handlers (purely local until Save) ---
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

  // --- Grocery handlers ---
  // Ensure always one empty row at the bottom
  useEffect(() => {
    if (groceryItems.length === 0 || groceryItems[groceryItems.length - 1].name.trim() !== "") {
      setGroceryItems(prev => [...prev, { name: "", checked: false, quantity: "" }]);
    }
  }, [groceryItems]);

  const updateGroceryItem = (i: number, updated: { name: string; checked: boolean; quantity: string }) => {
    const newItems = groceryItems.map((item, idx) => (idx === i ? updated : item));
    setGroceryItems(newItems);
    AsyncStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(newItems));
  };

  const handleGroceryBlur = (i: number) => {
    const lastItem = groceryItems[groceryItems.length - 1];
    if (lastItem.name.trim() !== '' && i === groceryItems.length - 1) {
      setGroceryItems([...groceryItems, { name: '', checked: false, quantity: '' }]);
    }
  };

  // remove all checked items, but keep at least one blank
  const deleteSelected = () => {
    Alert.alert(
      "Delete Selected Items",
      "Are you sure you want to delete the crossed-out items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            let filtered = groceryItems.filter(item => !item.checked);
            if (filtered.length === 0 || filtered[filtered.length - 1].name.trim() !== "") {
              filtered = [...filtered, { name: "", checked: false, quantity: "" }];
            }
            setGroceryItems(filtered);
            await AsyncStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(filtered));
          }
        }
      ]
    );
  };

  const totalQuantity = groceryItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  // --- Scenes (NO SceneMap; prevents remounting on each keystroke) ---
  const MealsScene = useCallback(() => (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      {daysOfWeek.map(day => (
        <TouchableOpacity key={day} style={styles.dayContainer} onPress={() => openMealModal(day)}>
          <View style={styles.dayHeader}>
            <ThemedText type="subtitle" style={styles.WeekDay}>{day}</ThemedText>
            {mealData[day]?.out ? <ThemedText style={styles.Out}>{mealData[day]?.out || ''}</ThemedText> : null}
          </View>
          {mealData[day]?.main ? <ThemedText style={styles.Main}>{mealData[day]?.main || ''}</ThemedText> : null}
          {mealData[day]?.side ? <ThemedText style={styles.Side}>{mealData[day]?.side || ''}</ThemedText> : null}
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors.light.red, marginBottom: 50 }]}
        onPress={clearAllMeals}
      >
        <ThemedText style={styles.buttonText}>Clear All Meals</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  ), [mealData]);
  

  const GroceryScene = useCallback(() => (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 20 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={50}
    >
      {groceryItems.map((item, idx) => (
        <GroceryRow
          key={idx}
          item={item}
          onUpdate={updated => updateGroceryItem(idx, updated)}
          onBlur={() => handleGroceryBlur(idx)}
        />
      ))}

      <View style={styles.totalContainer}>
        <ThemedText style={styles.totalText}>Total: {totalQuantity}</ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors.light.red, marginTop: 20, marginBottom:50 }]}
        onPress={deleteSelected}
      >
        <ThemedText style={styles.buttonText}>Delete Selected</ThemedText>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  ), [groceryItems, totalQuantity]);

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'meals': return <MealsScene />;
      case 'grocery': return <GroceryScene />;
      default: return null;
    }
  }, [MealsScene, GroceryScene]);

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
            indicatorStyle={{ backgroundColor: Colors.light.purple}}
            style={{ backgroundColor: 'transparent' }}
            labelStyle={{ color: 'black', fontWeight: 'bold' }}
          />
        )}
      />

      {/* Keep Modal OUTSIDE the scene to avoid unmounts while typing */}
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
  tabContainer: { marginBottom: 50 },
  scrollContainer: { padding: 20 },
  
  dayContainer: { marginBottom: 20, padding: 12, borderWidth: 1, borderColor: Colors.dark.borderGray, borderRadius: 10,},
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, },
  WeekDay: { fontWeight: "bold", textDecorationLine: "underline", fontSize: 18, color: Colors.light.purple, },
  Out: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14, },
  Main: { fontWeight: "bold", fontSize: 16, marginBottom: 2, },
  Side: { fontStyle: "italic", color: Colors.light.gray, fontSize: 14, marginLeft: 12, },
  
  modalContainer: { flex: 1, backgroundColor: Colors.dark.backgroundOpacity, justifyContent: 'center', alignItems: 'center', },
  modalContent: { width: '80%', backgroundColor: Colors.dark.gray, padding: 20, borderRadius: 10, },
  modalInput: { borderBottomWidth: 1, borderBottomColor: Colors.dark.borderGray, color:  Colors.light.text, marginBottom: 12, fontSize: 16, paddingVertical: 4, },
  
  groceryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { marginRight: 10 },
  checkboxText: { fontSize: 18 },

  groceryItemTextInput: { flex: 1, fontSize: 16, borderBottomWidth: 1, borderBottomColor: Colors.dark.borderGray, color:  Colors.light.text, paddingVertical: 4, paddingHorizontal: 2, },
  quantityInput: { width: 50, height: 30, color:  Colors.light.text, fontSize: 16, textAlign: 'center', marginLeft: 10, backgroundColor: Colors.dark.placeholder, },

  totalContainer: { marginTop: 20, alignItems: 'flex-end' },
  totalText: { fontWeight: 'bold', fontSize: 16 },

  button: { padding: 12, borderRadius: 8, alignItems: 'center', },
  buttonText: { fontWeight: 'bold' },
});
