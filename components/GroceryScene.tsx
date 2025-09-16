import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import React, { JSX, useRef } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import type { FlatList } from "react-native-gesture-handler";

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
      <View style={styles.inputWrapper}>
        <TextInput
          ref={groceryInputRef}
          style={styles.input}
          placeholder="Add a grocery item"
          value={tempNewItemText}
          onChangeText={setTempNewItemText}
          onSubmitEditing={addGroceryItem}
          returnKeyType="done"
          blurOnSubmit={false}
          inputAccessoryViewID={accessoryID}
        />
        <TouchableOpacity style={styles.addButton} onPress={addGroceryItem}>
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
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
        maintainVisibleContentPosition={{ minIndexForVisible: 1,}}
        ListFooterComponent={
          <View>
            <View style={styles.totalRow}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>{total}</ThemedText>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={deleteCheckedGroceryItems}
            >
              <ThemedText style={styles.addButtonText}>Delete Selected</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />

      {Platform.OS === "ios" && (
        <InputAccessoryView nativeID={accessoryID}>
          <View style={styles.accessoryContainer}>
            <TouchableOpacity onPress={() => Keyboard.dismiss()}>
              <ThemedText style={styles.doneText}>Done</ThemedText>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </View >
  );
}

const styles = StyleSheet.create({
  inputWrapper: { flexDirection: "row", marginVertical: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.light.borderGray, borderRadius: 8, paddingHorizontal: 12, color: Colors.light.text, height: 44, },
  addButton: { marginLeft: 10, backgroundColor: Colors.light.purple, paddingHorizontal: 16, justifyContent: "center", borderRadius: 8,},
  addButtonText: { fontWeight: "bold"},
  
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, paddingHorizontal: 30, borderTopWidth: StyleSheet.hairlineWidth, borderColor: Colors.light.borderGray, marginTop: 10 },
  totalLabel: { fontWeight: "bold", fontSize: 16 },
  totalValue: { fontWeight: "bold", fontSize: 16 },

  deleteButton: { alignSelf: "center", backgroundColor: Colors.light.red, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, },

  accessoryContainer: { backgroundColor: Colors.dark.gray, paddingVertical: 8, paddingHorizontal: 12, alignItems: "flex-end", },
  doneText: { color: Colors.light.purple, fontWeight: "600", fontSize: 16, },
});
