import { Colors } from "@/constants/Colors";
import { FlatList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../theme/ThemedText";

export default function InlineNumberPicker({ 
  type, data, value, onChange, visible,
}: { 
  type: "hours" | "minutes" | "date"; 
  data: any[];
  value: any;
  onChange: (n: any) => void;
  visible: boolean;
}) {
  if (!visible) return null;

  const itemHeight = 40;

  return (
    <View style={{ position: "absolute", top: -itemHeight * 2, width: 80, alignItems: "center", zIndex: 100 }}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => type === "date" ? item.date.toISOString() : item.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        initialScrollIndex={Math.max(0, data.findIndex(d => {
          if (type === "date") {
            return d.date.toDateString() === value.toDateString();
          }
          return d === value;
        }))}
        getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
        style={{ maxHeight: itemHeight * 5, backgroundColor: Colors.dark.gray, borderRadius: 6, paddingVertical: 5, width: 70 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onChange(item)} style={{ height: itemHeight, justifyContent: "center", alignItems: "center"}}>
            <ThemedText style={[
              { fontSize: 16 },
              (type === "date" ? item.date.toDateString() === value.toDateString() : item === value) && { fontWeight: "bold", color: Colors.light.purple }
            ]}>
              {type === "date" ? item.label : item.toString().padStart(2, "0")}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}