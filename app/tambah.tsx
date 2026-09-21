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
import { C } from "@/constants/Colors";

export default function TambahScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const [inputValue, setInputValue] = useState("");
  const [note, setNote] = useState("");
  const [spentAt, setSpentAt] = useState(todayLocal());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Track cursor position via ref (tidak pakai state agar tidak re-render berlebih)
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  // Controlled selection untuk programmatic cursor movement
  const [controlledSelection, setControlledSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  // Load data jika mode edit
  useEffect(() => {
    if (!id) return;
    getExpense(id)
      .then((exp) => {
        if (!exp) return;
        setInputValue(exp.expression);
        setNote(exp.note);
        setSpentAt(exp.spentAt);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // Bersihkan controlled selection setelah diaplikasikan
  useEffect(() => {
    if (!controlledSelection) return;
    const timer = setTimeout(() => setControlledSelection(undefined), 100);
    return () => clearTimeout(timer);
  }, [controlledSelection]);

  const handleInsert = useCallback(
    (char: string) => {
      const sel = selectionRef.current;
      const before = inputValue.slice(0, sel.start);
      const after = inputValue.slice(sel.end);
      const newValue = before + char + after;
      const newPos = sel.start + char.length;
      setInputValue(newValue);
      selectionRef.current = { start: newPos, end: newPos };
      setControlledSelection({ start: newPos, end: newPos });
    },
    [inputValue]
  );

  const handleBackspace = useCallback(() => {
    const sel = selectionRef.current;
    let newValue: string;
    let newPos: number;
    if (sel.start !== sel.end) {
      const before = inputValue.slice(0, sel.start);
      const after = inputValue.slice(sel.end);
      newValue = before + after;
      newPos = sel.start;
    } else if (sel.start > 0) {
      const before = inputValue.slice(0, sel.start - 1);
      const after = inputValue.slice(sel.start);
      newValue = before + after;
      newPos = before.length;
    } else {
      return;
    }
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

  const handleSave = async () => {
    if (!isValid || evalResult === null) return;
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateExpense(id, {
          amount: evalResult,
          expression: inputValue.trim(),
          note: note.trim(),
          spentAt,
        });
      } else {
        await addExpense({
          amount: evalResult,
          expression: inputValue.trim(),
          note: note.trim(),
          spentAt,
        });
      }
      router.back();
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
            router.back();
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
          onPress={() => router.back()}
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
          <Text style={styles.label}>{strings.nominal}</Text>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={setInputValue}
            selection={controlledSelection}
            onSelectionChange={(e) => {
              selectionRef.current = e.nativeEvent.selection;
            }}
            keyboardType="default"
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Mis. 17.000+75.000"
            placeholderTextColor={C.muted}
            returnKeyType="done"
            accessibilityLabel={strings.nominal}
          />

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

          {/* Operator bar selalu tampil */}
          <OperatorBar onInsert={handleInsert} onBackspace={handleBackspace} />

          <View style={styles.formSection}>
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

            {/* Tombol Hapus (hanya mode edit) */}
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
  headerBtnText: { fontSize: 16, color: C.greenDark, fontWeight: "500" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: C.ink,
  },
  scrollContent: { flexGrow: 1 },
  formSection: { paddingHorizontal: 16, paddingTop: 16 },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: C.ink,
    minHeight: 54,
  },
  preview: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 38,
  },
  previewValid: {
    fontSize: 20,
    fontWeight: "700",
    color: C.greenDark,
  },
  previewInvalid: {
    fontSize: 15,
    color: C.muted,
    fontStyle: "italic",
  },
  dateBtn: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
    justifyContent: "center",
  },
  dateBtnText: { fontSize: 17, color: C.ink, fontWeight: "500" },
  dateDoneBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  dateDoneBtnText: { fontSize: 16, color: C.greenDark, fontWeight: "600" },
  saveBtn: {
    backgroundColor: C.greenDark,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 28,
    minHeight: 58,
    justifyContent: "center",
  },
  saveBtnDisabled: { backgroundColor: C.mutedBg },
  saveBtnText: { color: C.white, fontSize: 18, fontWeight: "700" },
  deleteBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: C.danger,
    minHeight: 54,
    justifyContent: "center",
  },
  deleteBtnText: { color: C.danger, fontSize: 16, fontWeight: "700" },
});
