//general
import { StyleSheet, View } from "react-native";


export default function DisplayWrapper({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
  },
});
