import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E9EEF6", dark: "#0f172a" }}
      headerImage={
        <LinearGradient
          colors={["#c7d2fe", "#e0e7ff"]}
          style={styles.headerGradient}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
            }}
            style={styles.headerImage}
          />
        </LinearGradient>
      }
    >
      {/* Greeting Section */}
      <ThemedView style={styles.greetingContainer}>
        <View>
          <ThemedText style={styles.greetingText}>Welcome Back</ThemedText>
          <ThemedText type="title" style={styles.nameText}>
            VIVEK nish 👋
          </ThemedText>
        </View>

        <View style={styles.balanceCard}>
          <ThemedText style={styles.balanceLabel}>Wallet Balance</ThemedText>
          <ThemedText style={styles.balanceAmount}>₹ 5,250</ThemedText>
        </View>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Quick Actions
        </ThemedText>

        <View style={styles.actionsRow}>
          <ActionCard icon="calendar-outline" label="Book Visit" />
          <ActionCard icon="cart-outline" label="Groceries" />
          <ActionCard icon="medical-outline" label="Medicines" />
        </View>
      </ThemedView>

      {/* Activity Card */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Today’s Activity
        </ThemedText>

        <View style={styles.activityCard}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/women/44.jpg",
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.activityName}>Anita Sharma</ThemedText>
            <ThemedText style={styles.activitySub}>
              Medicart • 11:00 AM
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

function ActionCard({ icon, label }: any) {
  return (
    <TouchableOpacity style={styles.actionCard}>
      <Ionicons name={icon} size={24} color="#6366f1" />
      <ThemedText style={styles.actionLabel}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    height: 200,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  headerImage: {
    height: 120,
    width: 200,
    borderRadius: 20,
    marginBottom: 20,
  },

  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greetingText: {
    fontSize: 14,
    color: "#64748b",
  },

  nameText: {
    fontSize: 26,
    fontWeight: "700",
  },

  balanceCard: {
    backgroundColor: "#6366f1",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    shadowColor: "#6366f1",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },

  balanceLabel: {
    fontSize: 12,
    color: "#e0e7ff",
  },

  balanceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    marginBottom: 15,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  actionCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  actionLabel: {
    marginTop: 8,
    fontSize: 12,
  },

  activityCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    marginRight: 12,
  },

  activityName: {
    fontWeight: "600",
    fontSize: 15,
  },

  activitySub: {
    fontSize: 12,
    color: "#64748b",
  },
});
