//general
import React, { JSX, useRef } from "react";
import { InputAccessoryView, Keyboard, Platform, TextInput, TouchableOpacity, View } from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import type { FlatList } from "react-native-gesture-handler";

//styles
import { mealsStyles } from '@/components/styles/_meals.styles';

//theme
import { Colors } from "@/components/theme/Colors";
import { ThemedText } from "@/components/theme/ThemedText";

interface GroceryItem {
  id: string;
  text: string;
  quantity: string;
  checked: boolean;
}

export default function GroceryScene({
  groceryItems,
  tempNewItemText,
  setTempNewItemText,
  addGroceryItem,
  renderGroceryItem,
  deleteCheckedGroceryItems,
  setGroceryItems,
  flatListRef,
}: {
  groceryItems: GroceryItem[];
  tempNewItemText: string;
  setTempNewItemText: (v: string) => void;
  addGroceryItem: () => void;
  renderGroceryItem: (p: RenderItemParams<GroceryItem>) => JSX.Element;
  deleteCheckedGroceryItems: () => void;
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  flatListRef?: React.RefObject<FlatList<GroceryItem> | null>;
}) {
  const groceryInputRef = useRef<TextInput>(null);
  const accessoryID = "groceryInputAccessory";

  const total = groceryItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <View  style={{ flex: 1, marginBottom: 90 }}>
      <View style={mealsStyles.inputWrapper}>
        <TextInput
          ref={groceryInputRef}
          style={mealsStyles.input}
          placeholder="Add a grocery item"
          placeholderTextColor={Colors.light.placeholder}          
          value={tempNewItemText}
          onChangeText={setTempNewItemText}
          onSubmitEditing={addGroceryItem}
          returnKeyType="done"
          blurOnSubmit={false}
          inputAccessoryViewID={accessoryID}
        />
        <TouchableOpacity style={mealsStyles.addButton} onPress={addGroceryItem}>
          <ThemedText style={mealsStyles.addButtonText}>Add</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Draggable list */}
      <DraggableFlatList
        ref={flatListRef}
        data={groceryItems}
        keyExtractor={(item) => item.id}
        renderItem={renderGroceryItem}
        onDragEnd={({ data }) => setGroceryItems(data)}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={true}
        removeClippedSubviews={false}
        maintainVisibleContentPosition={groceryItems.length > 5 ? { minIndexForVisible: 1 } : undefined}
        ListFooterComponent={
          <View>
            <View style={mealsStyles.totalRow}>
              <ThemedText style={mealsStyles.totalLabel}>Total</ThemedText>
              <ThemedText style={mealsStyles.totalValue}>{total}</ThemedText>
            </View>

            <TouchableOpacity
              style={mealsStyles.deleteButton}
              onPress={deleteCheckedGroceryItems}
            >
              <ThemedText style={mealsStyles.addButtonText}>Delete Selected</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={accessoryID}>
          <View style={mealsStyles.accessoryContainer}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <ThemedText style={mealsStyles.doneText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View >
  );
}
