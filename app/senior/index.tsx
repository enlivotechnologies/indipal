import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function SeniorHome() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.welcome}>Welcome Back</ThemedText>
          <ThemedText type="title">VIVEK KUMAR 👋</ThemedText>
        </View>

        <View style={styles.wallet}>
          <ThemedText style={styles.walletLabel}>Wallet Balance</ThemedText>
          <ThemedText style={styles.walletAmount}>₹ 5,250</ThemedText>
        </View>
      </View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Quick Actions
      </ThemedText>

      <View style={styles.actions}>
        <Action icon="calendar-outline" label="Book Visit" />
        <Action icon="cart-outline" label="Groceries" />
        <Action icon="medical-outline" label="Medicines" />
      </View>

      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Today’s Activity
      </ThemedText>

      <View style={styles.activityCard}>
        <Ionicons name="person-circle" size={42} color="#64748b" />
        <View style={{ marginLeft: 10 }}>
          <ThemedText style={{ fontWeight: "600" }}>Anita Sharma</ThemedText>
          <ThemedText style={{ color: "#64748b", fontSize: 12 }}>
            Medicart • 11:00 AM
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

function Action({ icon, label }: any) {
  return (
    <TouchableOpacity style={styles.actionCard}>
      <Ionicons name={icon} size={24} color="#6366f1" />
      <ThemedText style={styles.actionText}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  welcome: { fontSize: 14, color: "#64748b" },
  wallet: {
    backgroundColor: "#6366f1",
    padding: 14,
    borderRadius: 18,
  },
  walletLabel: { color: "#e0e7ff", fontSize: 12 },
  walletAmount: { color: "#fff", fontWeight: "700", fontSize: 18 },
  sectionTitle: { marginBottom: 15 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionCard: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  actionText: { marginTop: 6, fontSize: 12 },
  activityCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
});
