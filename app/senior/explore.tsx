import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function SeniorExplore() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore Services</ThemedText>

      <TouchableOpacity style={styles.card}>
        <ThemedText>🛒 Grocery Assistance</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <ThemedText>💊 Medicine Pickup</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <ThemedText>🏥 Doctor Visit</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <ThemedText>🤝 Companion Support</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  card: {
    padding: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    marginTop: 16,
  },
});
