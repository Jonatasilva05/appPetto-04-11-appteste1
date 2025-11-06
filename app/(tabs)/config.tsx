// app/(tabs)/config.tsx
import {
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  View,
  Text,
} from "react-native";
import { useAuth } from "@/app/context/AuthContext";
import { useTheme } from "@/app/context/ThemeContext";

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Você tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#FFFFFF" },
      ]}
    >
      <View style={styles.settingItem}>
        <Text style={[styles.settingText, { color: isDarkMode ? "#FFF" : "#000" }]}>
          Modo Escuro
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={(value) => setTheme(value ? "dark" : "light")}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 20 },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingText: { fontSize: 18 },
  logoutButton: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#ff4d4d",
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  logoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
