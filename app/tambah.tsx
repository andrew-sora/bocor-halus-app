import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  addExpense,
  updateExpense,
  deleteExpense,
  getExpense,
} from "@/lib/db";
import { evalExpr } from "@/lib/evalExpr";
import { formatRupiah } from "@/lib/format";
import { toLocalDateString, todayLocal, parseLocalDate, formatTanggalId } from "@/lib/date";
import { OperatorBar } from "@/components/OperatorBar";
import { strings } from "@/constants/strings";
import { C, CATEGORIES } from "@/constants/Colors";
import { addPresetAmount, insertChar, backspaceChar } from "@/lib/expenseInput";

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000];

export default function TambahScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [inputValue, setInputValue] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("lainnya");
  const [spentAt, setSpentAt] = useState(todayLocal());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const [controlledSelection, setControlledSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  useEffect(() => {
    if (!id) return;
    getExpense(id)
      .then((exp) => {
        if (!exp) return;
        setInputValue(exp.expression);
        setNote(exp.note);
        setCategory(exp.category || "lainnya");
        setSpentAt(exp.spentAt);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!controlledSelection) return;
    const timer = setTimeout(() => setControlledSelection(undefined), 100);
    return () => clearTimeout(timer);
  }, [controlledSelection]);

  const handleInsert = useCallback(
    (char: string) => {
      const sel = selectionRef.current;
      const { newValue, newPos } = insertChar(inputValue, char, sel.start, sel.end);
      setInputValue(newValue);
      selectionRef.current = { start: newPos, end: newPos };
      setControlledSelection({ start: newPos, end: newPos });
    },
    [inputValue]
  );

  const handleAddPreset = (amount: number) => {
    setInputValue(addPresetAmount(inputValue, amount));
  };

  const handleBackspace = useCallback(() => {
    const sel = selectionRef.current;
    if (sel.start === 0 && sel.end === 0) return;
    const { newValue, newPos } = backspaceChar(inputValue, sel.start, sel.end);
    setInputValue(newValue);
    selectionRef.current = { start: newPos, end: newPos };
    setControlledSelection({ start: newPos, end: newPos });
  }, [inputValue]);

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) {
      setSpentAt(toLocalDateString(selectedDate));
    }
  };

  const evalResult = evalExpr(inputValue.trim());
  const isValid = evalResult !== null && evalResult > 0;

  const dismissModal = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  }, [router]);

  const handleSave = async () => {
    if (!isValid || evalResult === null) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateExpense(id, {
          amount: evalResult,
          expression: inputValue.trim(),
          note: note.trim(),
          category,
          spentAt,
        });
      } else {
        await addExpense({
          amount: evalResult,
          expression: inputValue.trim(),
          note: note.trim(),
          category,
          spentAt,
        });
      }
      dismissModal();
    } catch (err) {
      Alert.alert("Gagal menyimpan", String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(strings.hapusJudul, strings.hapusPesan, [
      { text: strings.batal, style: "cancel" },
      {
        text: strings.hapusKonfirmasi,
        style: "destructive",
        onPress: async () => {
          if (!id) return;
          try {
            await deleteExpense(id);
            dismissModal();
          } catch (err) {
            Alert.alert("Gagal menghapus", String(err));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={C.greenDark} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header modal */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={dismissModal}
          accessibilityRole="button"
          accessibilityLabel="Tutup"
        >
          <Text style={styles.headerBtnText}>{strings.batal}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? strings.edit : strings.catatPengeluaran}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Field Nominal */}
          <View style={styles.formSectionTop}>
            <Text style={styles.label}>{strings.nominal}</Text>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              selection={controlledSelection}
              onSelectionChange={(e) => {
                selectionRef.current = e.nativeEvent.selection;
              }}
              keyboardType="numeric"
              autoCorrect={false}
              autoCapitalize="none"
              placeholder="Mis. 17.000+75.000"
              placeholderTextColor={C.muted}
              returnKeyType="done"
              accessibilityLabel={strings.nominal}
            />

            {/* Quick Nominal Presets */}
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.presetChip}
                  onPress={() => handleAddPreset(amt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetChipText}>+{amt / 1000}rb</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live preview ekspresi */}
            <View style={styles.preview}>
              {inputValue.trim() === "" ? null : isValid && evalResult !== null ? (
                <Text style={styles.previewValid}>
                  = {formatRupiah(evalResult)}
                </Text>
              ) : (
                <Text style={styles.previewInvalid}>
                  {strings.ekspresiTidakLengkap}
                </Text>
              )}
            </View>
          </View>

          {/* Operator bar */}
          <OperatorBar onInsert={handleInsert} onBackspace={handleBackspace} />

          <View style={styles.formSection}>
            {/* Quick 1-Tap Category Tags */}
            <Text style={styles.label}>{strings.kategori}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScrollView}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      { backgroundColor: cat.bg },
                      isSelected && styles.catChipSelected,
                    ]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.catEmoji}>{cat.emoji}</Text>
                    <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Field Tanggal */}
            <Text style={styles.label}>{strings.tanggal}</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
              accessibilityRole="button"
              accessibilityLabel={`Tanggal: ${formatTanggalId(spentAt)}`}
            >
              <Text style={styles.dateBtnText}>{formatTanggalId(spentAt)}</Text>
            </TouchableOpacity>

            {/* DatePicker */}
            {showDatePicker && (
              <DateTimePicker
                value={parseLocalDate(spentAt)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                locale="id-ID"
              />
            )}
            {Platform.OS === "ios" && showDatePicker && (
              <TouchableOpacity
                style={styles.dateDoneBtn}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.dateDoneBtnText}>Selesai</Text>
              </TouchableOpacity>
            )}

            {/* Field Catatan */}
            <Text style={styles.label}>{strings.catatan}</Text>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={(t) => setNote(t.slice(0, 200))}
              placeholder={strings.catatanPlaceholder}
              placeholderTextColor={C.muted}
              returnKeyType="done"
              maxLength={200}
              accessibilityLabel={strings.catatan}
            />

            {/* Tombol Simpan */}
            <TouchableOpacity
              style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!isValid || saving}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              {saving ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.saveBtnText}>{strings.simpan}</Text>
              )}
            </TouchableOpacity>

            {/* Tombol Hapus (mode edit) */}
            {isEdit && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Text style={styles.deleteBtnText}>{strings.hapus}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: C.cream },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cream,
  },
  headerBtn: { width: 70 },
  headerBtnText: { fontSize: 16, color: C.greenDark, fontWeight: "600" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: C.ink,
  },
  scrollContent: { flexGrow: 1 },
  formSectionTop: { paddingHorizontal: 16, paddingTop: 12 },
  formSection: { paddingHorizontal: 16, paddingTop: 8 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: C.ink,
    minHeight: 52,
  },
  presetRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 4,
  },
  presetChip: {
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.greenDark,
  },
  preview: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  previewValid: {
    fontSize: 20,
    fontWeight: "700",
    color: C.greenDark,
  },
  previewInvalid: {
    fontSize: 14,
    color: C.muted,
    fontStyle: "italic",
  },
  catScrollView: {
    flexDirection: "row",
    marginBottom: 4,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  catChipSelected: {
    borderColor: C.greenDark,
    transform: [{ scale: 1.03 }],
  },
  catEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  dateBtn: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  dateBtnText: { fontSize: 16, color: C.ink, fontWeight: "500" },
  dateDoneBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  dateDoneBtnText: { fontSize: 16, color: C.greenDark, fontWeight: "600" },
  saveBtn: {
    backgroundColor: C.greenDark,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    minHeight: 54,
    justifyContent: "center",
  },
  saveBtnDisabled: { backgroundColor: C.mutedBg },
  saveBtnText: { color: C.white, fontSize: 17, fontWeight: "700" },
  deleteBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: C.danger,
    minHeight: 50,
    justifyContent: "center",
  },
  deleteBtnText: { color: C.danger, fontSize: 15, fontWeight: "700" },
});
