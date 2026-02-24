import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function SeniorSOS() {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.sos}>
        <ThemedText style={styles.sosText}>SOS</ThemedText>
        <ThemedText style={styles.subText}>Tap for emergency help</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sos: {
    backgroundColor: "#dc2626",
    padding: 70,
    borderRadius: 140,
    alignItems: "center",
  },
  sosText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  subText: {
    color: "#fee2e2",
    marginTop: 10,
  },
});
