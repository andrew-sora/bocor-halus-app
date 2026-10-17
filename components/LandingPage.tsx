import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { C, CATEGORIES, getCategoryById } from "../constants/Colors";
import { LegalModal, LegalTab } from "./LegalModal";
import { LicenseGateModal } from "./LicenseGateModal";
import { TotalCard } from "./TotalCard";
import { TabIcon } from "./TabIcon";
import { evalExpr } from "@/lib/evalExpr";
import { formatRupiah } from "@/lib/format";
import { addPresetAmount } from "@/lib/expenseInput";
import type { Expense } from "@/lib/db";

interface LandingPageProps {
  onActivated: () => void;
  checkoutUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
}

interface PresetScenario {
  id: "dapur" | "bocor" | "kalap";
  title: string;
  badge: string;
  tip: string;
  expenses: Expense[];
}

const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "dapur",
    title: "Belanja Dapur",
    badge: "Terkendali",
    tip: "Belanja dapur terencana rapi: jatah belanja masih sangat aman di atas 80%.",
    expenses: [
      {
        id: "sim-d1",
        amount: 50000,
        expression: "15.000 + 35.000",
        note: "Sayur bayam & ayam potong 1kg",
        category: "dapur",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T09:00:00.000Z",
      },
      {
        id: "sim-d2",
        amount: 25000,
        expression: "25.000",
        note: "Bumbu dapur & cabai rawit",
        category: "dapur",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T09:05:00.000Z",
      },
      {
        id: "sim-d3",
        amount: 45000,
        expression: "45.000",
        note: "Minyak goreng & beras 2.5kg",
        category: "dapur",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T09:10:00.000Z",
      },
    ],
  },
  {
    id: "bocor",
    title: "Jajan Bocor Halus",
    badge: "5x Transaksi <50k",
    tip: "Deteksi Bocor Halus menyala! Transaksi kecil di bawah 50rb terakumulasi signifikan tanpa Anda sadari.",
    expenses: [
      {
        id: "sim-b1",
        amount: 18000,
        expression: "18.000",
        note: "Es kopi susu kekinian",
        category: "jajan",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T10:00:00.000Z",
      },
      {
        id: "sim-b2",
        amount: 12000,
        expression: "12.000",
        note: "Gorengan & tahu renyah",
        category: "jajan",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T11:00:00.000Z",
      },
      {
        id: "sim-b3",
        amount: 22000,
        expression: "22.000",
        note: "Boba milk tea anak",
        category: "jajan",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T13:00:00.000Z",
      },
      {
        id: "sim-b4",
        amount: 9000,
        expression: "9.000",
        note: "Ongkir selisih promo",
        category: "transport",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T14:00:00.000Z",
      },
      {
        id: "sim-b5",
        amount: 2000,
        expression: "2.000",
        note: "Parkir minimarket",
        category: "transport",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T15:00:00.000Z",
      },
    ],
  },
  {
    id: "kalap",
    title: "Belanja Kalap",
    badge: "Over Budget",
    tip: "Kartu berubah merah! Peringatan overbudget otomatis memberi sinyal penghematan belanja bulanan.",
    expenses: [
      {
        id: "sim-k1",
        amount: 2200000,
        expression: "1.500.000 + 700.000",
        note: "Belanja bulanan supermarket",
        category: "dapur",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T10:00:00.000Z",
      },
      {
        id: "sim-k2",
        amount: 950000,
        expression: "950.000",
        note: "Elektronik & perabot rumah",
        category: "lainnya",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T11:00:00.000Z",
      },
      {
        id: "sim-k3",
        amount: 150000,
        expression: "150.000",
        note: "Dinner akhir pekan",
        category: "jajan",
        spentAt: "2026-10-17",
        createdAt: "2026-10-17T19:00:00.000Z",
      },
    ],
  },
];

export function LandingPage({
  onActivated,
  checkoutUrl = "https://lynk.id/soradev/bocor-halus",
  supportPhone = "0853-7331-3646",
  supportEmail = "admin@soradev.id",
}: LandingPageProps) {
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const isNarrowMobile = windowWidth < 380;

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>("privacy");

  // State simulator yang 100% tersinkronisasi (Real App Architecture)
  const [activeScenarioId, setActiveScenarioId] = useState<string>("dapur");
  const [simExpenses, setSimExpenses] = useState<Expense[]>(PRESET_SCENARIOS[0].expenses);
  const budgetLimit = 3000000; // Jatah Pokok Rp 3.000.000

  // State form catat pengeluaran baru di simulator
  const [simFormula, setSimFormula] = useState("15.000 + 35.000");
  const [simNote, setSimNote] = useState("Sayur & lauk pasar");
  const [simCategory, setSimCategory] = useState("dapur");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Perhitungan dinamis dari simExpenses (Single Source of Truth)
  const monthlyTotal = useMemo(
    () => simExpenses.reduce((sum, item) => sum + item.amount, 0),
    [simExpenses]
  );
  const microExpenses = useMemo(
    () => simExpenses.filter((item) => item.amount < 50000),
    [simExpenses]
  );
  const microTotal = useMemo(
    () => microExpenses.reduce((sum, item) => sum + item.amount, 0),
    [microExpenses]
  );
  const microCount = microExpenses.length;

  // Evaluasi kalkulator ekspresi langsung
  const evalResult = evalExpr(simFormula.trim());
  const isFormulaValid = evalResult !== null && evalResult > 0;

  // State FAQ Accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const selectScenario = (sc: PresetScenario) => {
    setActiveScenarioId(sc.id);
    setSimExpenses(sc.expenses);
    setToastMsg(`Skenario "${sc.title}" dimuat.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleReset = () => {
    setActiveScenarioId("dapur");
    setSimExpenses(PRESET_SCENARIOS[0].expenses);
    setSimFormula("15.000 + 35.000");
    setSimNote("Sayur & lauk pasar");
    setSimCategory("dapur");
    setToastMsg("Simulasi berhasil direset ke awal.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddPreset = (amount: number) => {
    setSimFormula(addPresetAmount(simFormula, amount));
  };

  const handleAddExpense = () => {
    if (!isFormulaValid || evalResult === null) return;
    const cat = getCategoryById(simCategory);
    const newExp: Expense = {
      id: "sim-" + Date.now(),
      amount: evalResult,
      expression: simFormula.trim(),
      note: simNote.trim() || cat.label,
      category: simCategory,
      spentAt: "2026-10-17",
      createdAt: new Date().toISOString(),
    };
    setSimExpenses([newExp, ...simExpenses]);
    setSimFormula("");
    setSimNote("");
    setActiveScenarioId("custom");
    setToastMsg(`+ ${formatRupiah(evalResult)} ditambahkan ke rincian & total!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDeleteExpense = (id: string) => {
    const target = simExpenses.find((e) => e.id === id);
    setSimExpenses(simExpenses.filter((e) => e.id !== id));
    setActiveScenarioId("custom");
    if (target) {
      setToastMsg(`- ${formatRupiah(target.amount)} dihapus dari rincian, sisa jatah bertambah!`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleOpenBuy = () => {
    if (Platform.OS === "web") {
      window.open(checkoutUrl, "_blank");
    } else {
      Linking.openURL(checkoutUrl).catch(() => {});
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      "Halo Tim Bocor Halus, saya ingin bertanya seputar lisensi dan aplikasi:"
    );
    const cleanPhone = supportPhone.replace(/[^0-9]/g, "");
    const formatted = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    Linking.openURL(`https://wa.me/${formatted}?text=${text}`).catch(() => {});
  };

  const openLegal = (tab: LegalTab) => {
    setLegalTab(tab);
    setLegalModalVisible(true);
  };

  const activeScenarioObj = PRESET_SCENARIOS.find((s) => s.id === activeScenarioId);
  const activeTip =
    activeScenarioObj?.tip ||
    "Transaksi berhasil diupdate! Angka pada TotalCard di atas dan rincian transaksi di bawah tersinkronisasi 100%.";

  return (
    <View style={styles.rootWrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP APP BAR */}
        <View style={[styles.topBar, isDesktop && styles.topBarDesktop]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Bocor Halus</Text>
            {!isNarrowMobile && (
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>
                  {isDesktop ? "Pencatat Belanja Harian" : "App"}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.keyEntryBtn}
            onPress={() => setShowLicenseModal(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Masukkan Kode Lisensi"
          >
            <Text style={styles.keyEntryBtnText}>
              {isDesktop ? "Punya Kode Lisensi?" : "Masukkan Kode"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. HERO SECTION DENGAN TWO-COLUMN DI DESKTOP */}
        <View style={[styles.heroContainer, isDesktop && styles.heroContainerDesktop]}>
          {/* Kolom Teks Hero */}
          <View style={[styles.heroTextCol, isDesktop && styles.heroTextColDesktop]}>
            <View style={styles.eyebrowChip}>
              <Text style={styles.eyebrowChipText}>
                BISA DI HP & LAPTOP • 100% PRIVAT LOKAL • BEBAS BIAYA BULANAN
              </Text>
            </View>

            <Text
              style={[
                styles.heroHeadline,
                isNarrowMobile && styles.heroHeadlineNarrow,
                isDesktop && styles.heroHeadlineDesktop,
              ]}
            >
              Gaji Baru Masuk, Tapi Akhir Bulan Bingung Uang Belanja Habis ke Mana?
            </Text>

            <Text style={[styles.heroBody, isDesktop && styles.heroBodyDesktop]}>
              Itu namanya <Text style={styles.heroHighlight}>"Bocor Halus"</Text> — pengeluaran kecil Rp 5.000, jajan kopi, parkir, dan ongkir yang tak pernah tercatat. Bocor Halus hadir sebagai aplikasi pencatat keuangan rumah tangga yang anti ribet: bisa dipasang langsung di layar HP (Android & iPhone) layaknya aplikasi biasa maupun dibuka di browser, langsung pakai tanpa perlu daftar akun.
            </Text>

            {/* CTA Group */}
            <View style={styles.heroCtaGroup}>
              <TouchableOpacity
                style={styles.mainCtaBtn}
                onPress={handleOpenBuy}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Beli Akses Seumur Hidup Rp 15.000"
              >
                <Text style={styles.mainCtaTitle}>Beli Akses Seumur Hidup — Rp 15.000</Text>
                <Text style={styles.mainCtaSub}>Bayar 1x Miliki Selamanya • Tanpa Biaya Bulanan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryCtaBtn}
                onPress={() => setShowLicenseModal(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Sudah Memiliki Lisensi Masukkan Kode"
              >
                <Text style={styles.secondaryCtaText}>Sudah Memiliki Lisensi? Masukkan Kode</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Kolom Showcase Interaktif (Simulator Nyata Bocor Halus) */}
          <View style={[styles.heroPreviewCol, isDesktop && styles.heroPreviewColDesktop]}>
            <View style={styles.phoneMockup}>
              {/* Top Status & Simulator Badge */}
              <View style={styles.phoneStatusBar}>
                <Text style={styles.phoneTime}>09:41</Text>
                <View style={styles.phoneSimBadge}>
                  <Text style={styles.phoneSimBadgeText}>SIMULATOR INTERAKTIF</Text>
                </View>
              </View>

              {/* Header App Asli */}
              <View style={styles.phoneAppHeader}>
                <View>
                  <Text style={styles.phoneAppTitle}>Bocor Halus</Text>
                  <Text style={styles.phoneAppSubtitle}>Oktober 2026</Text>
                </View>
                <View style={styles.phoneAvatarCircle}>
                  <Text style={styles.phoneAvatarText}>BH</Text>
                </View>
              </View>

              {/* Skenario Cepat Selector */}
              <View style={styles.scenarioRow}>
                {PRESET_SCENARIOS.map((sc) => {
                  const isActive = activeScenarioId === sc.id;
                  return (
                    <TouchableOpacity
                      key={sc.id}
                      style={[styles.scenarioChip, isActive && styles.scenarioChipActive]}
                      onPress={() => selectScenario(sc)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.scenarioChipText,
                          isActive && styles.scenarioChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {sc.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.scenarioChip, activeScenarioId === "reset" && styles.scenarioChipActive]}
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Text style={styles.scenarioChipText}>Reset</Text>
                </TouchableOpacity>
              </View>

              {/* Toast Feedback Notifikasi */}
              {toastMsg ? (
                <View style={styles.simToast}>
                  <Text style={styles.simToastText}>{toastMsg}</Text>
                </View>
              ) : (
                <View style={styles.simTipBox}>
                  <Text style={styles.simTipText}>{activeTip}</Text>
                </View>
              )}

              {/* TotalCard Komponen Asli Bocor Halus */}
              <TotalCard
                monthlyTotal={monthlyTotal}
                yearlyTotal={monthlyTotal + 12500000}
                month={10}
                year={2026}
                budgetLimit={budgetLimit}
                microTotal={microTotal}
                microCount={microCount}
                onPressMicroInsight={() => {
                  setToastMsg(`Bulan ini terdeteksi ${microCount} transaksi kecil bocor halus!`);
                  setTimeout(() => setToastMsg(null), 3000);
                }}
              />

              {/* Form Input Catat Pengeluaran Cepat (Sama dengan Tambah Screen Asli) */}
              <View style={styles.simFormCard}>
                <Text style={styles.simFormTitle}>✍️ CATAT TRANSAKSI BARU (SMART CALCULATOR)</Text>
                
                {/* Input Rumus / Nominal */}
                <TextInput
                  style={styles.simInput}
                  value={simFormula}
                  onChangeText={setSimFormula}
                  placeholder="Ketik rumus mis. 15.000 + 35.000"
                  placeholderTextColor={C.muted}
                />

                {/* Preset Chips Cepat */}
                <View style={styles.simPresetRow}>
                  {[10000, 20000, 50000, 100000].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      style={styles.simPresetChip}
                      onPress={() => handleAddPreset(amt)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.simPresetText}>+{amt / 1000}rb</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Live Hasil Ekspresi */}
                <View style={styles.simLiveCalcRow}>
                  <Text style={styles.simLiveCalcLabel}>Hasil Langsung:</Text>
                  <Text style={[styles.simLiveCalcValue, !isFormulaValid && { color: C.muted }]}>
                    {isFormulaValid ? formatRupiah(evalResult!) : "Ekspresi belum lengkap"}
                  </Text>
                </View>

                {/* Kategori Selector Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.simCatScroll}
                >
                  {CATEGORIES.slice(0, 5).map((cat) => {
                    const isSelected = simCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.simCatChip,
                          { backgroundColor: cat.bg },
                          isSelected && styles.simCatChipActive,
                        ]}
                        onPress={() => setSimCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.simCatEmoji}>{cat.emoji}</Text>
                        <Text style={[styles.simCatLabel, { color: cat.color }]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Input Catatan Singkat */}
                <TextInput
                  style={styles.simNoteInput}
                  value={simNote}
                  onChangeText={setSimNote}
                  placeholder="Catatan belanja (opsional)"
                  placeholderTextColor={C.muted}
                />

                {/* Tombol Simpan ke Simulasi */}
                <TouchableOpacity
                  style={[styles.simAddBtn, !isFormulaValid && styles.simAddBtnDisabled]}
                  onPress={handleAddExpense}
                  disabled={!isFormulaValid}
                  activeOpacity={0.8}
                >
                  <Text style={styles.simAddBtnText}>
                    + Catat & Sinkronkan ke Total
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Rincian Transaksi Nyata Skenario */}
              <View style={styles.simSectionHeader}>
                <Text style={styles.simSectionTitle}>
                  RINCIAN TRANSAKSI AKTIF ({simExpenses.length})
                </Text>
                <Text style={styles.simSectionSubtitle}>
                  Ketuk ✕ untuk menghapus
                </Text>
              </View>

              <View style={styles.simExpenseList}>
                {simExpenses.map((exp) => {
                  const cat = getCategoryById(exp.category);
                  const isFormula = exp.expression.includes("+") || exp.expression.includes("-");
                  return (
                    <View key={exp.id} style={styles.simExpenseItem}>
                      <View style={[styles.simEmojiBadge, { backgroundColor: cat.bg }]}>
                        <Text style={styles.simEmojiText}>{cat.emoji}</Text>
                      </View>
                      <View style={styles.simItemInfo}>
                        <Text style={styles.simItemNote} numberOfLines={1}>
                          {exp.note}
                        </Text>
                        <Text style={styles.simItemExpr} numberOfLines={1}>
                          {isFormula ? exp.expression : cat.label}
                        </Text>
                      </View>
                      <Text style={styles.simItemAmount}>
                        {formatRupiah(exp.amount)}
                      </Text>
                      <TouchableOpacity
                        style={styles.simDeleteBtn}
                        onPress={() => handleDeleteExpense(exp.id)}
                        activeOpacity={0.7}
                        accessibilityLabel="Hapus transaksi ini"
                      >
                        <Text style={styles.simDeleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Tab Bar Asli Bocor Halus */}
              <View style={styles.simBottomNav}>
                <View style={styles.simTabItem}>
                  <TabIcon name="beranda" color={C.greenDark} size={20} focused={true} />
                  <Text style={[styles.simTabLabel, styles.simTabLabelActive]}>Beranda</Text>
                </View>
                <View style={styles.simTabItem}>
                  <TabIcon name="catat" color={C.muted} size={20} focused={false} />
                  <Text style={styles.simTabLabel}>Catat</Text>
                </View>
                <View style={styles.simTabItem}>
                  <TabIcon name="rekap" color={C.muted} size={20} focused={false} />
                  <Text style={styles.simTabLabel}>Rekap</Text>
                </View>
                <View style={styles.simTabItem}>
                  <TabIcon name="pengaturan" color={C.muted} size={20} focused={false} />
                  <Text style={styles.simTabLabel}>Pengaturan</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. PERBANDINGAN REALISTIS (KENAPA BUKAN EXCEL / APLIKASI LAIN) */}
        <View style={[styles.sectionContainer, isDesktop && styles.sectionContainerDesktop]}>
          <Text style={styles.sectionEyebrow}>PERBANDINGAN NYATA</Text>
          <Text style={[styles.sectionHeading, isDesktop && styles.sectionHeadingDesktop]}>
            Kenapa Mencatat Keuangan Selalu Malas & Berhenti?
          </Text>

          <View style={[styles.compareGrid, isDesktop && styles.compareGridDesktop]}>
            {/* Card Aplikasi Lain */}
            <View style={[styles.compareCardOld, isDesktop && styles.compareCardDesktop]}>
              <Text style={styles.compareTitleOld}>Aplikasi Keuangan Biasa & Excel</Text>
              <Text style={styles.compareItemOld}>• Wajib daftar akun, isi nomor HP, email & password</Text>
              <Text style={styles.compareItemOld}>• Repot buka kalkulator dulu baru catat manual satu-satu</Text>
              <Text style={styles.compareItemOld}>• Data keuangan disimpan di server cloud pihak lain</Text>
              <Text style={styles.compareItemOld}>• Tagihan langganan bulanan yang terus memotong saldo</Text>
            </View>

            {/* Card Bocor Halus */}
            <View style={[styles.compareCardNew, isDesktop && styles.compareCardDesktop]}>
              <View style={styles.compareBadge}>
                <Text style={styles.compareBadgeText}>Solusi Bocor Halus</Text>
              </View>
              <Text style={styles.compareTitleNew}>Pencatat Keuangan Paling Praktis</Text>
              <Text style={styles.compareItemNew}>
                • <Text style={styles.boldText}>Bisa Jadi Aplikasi di HP:</Text> Pasang langsung ke layar utama HP Anda (Android & iPhone) tanpa unduh file berat, atau buka langsung di browser tanpa repot bikin akun.
              </Text>
              <Text style={styles.compareItemNew}>
                • <Text style={styles.boldText}>Smart Kalkulator:</Text> Ketik `15rb + 35rb` langsung terjumlah.
              </Text>
              <Text style={styles.compareItemNew}>
                • <Text style={styles.boldText}>100% Privat di HP:</Text> Data tersimpan lokal di perangkat Anda.
              </Text>
              <Text style={styles.compareItemNew}>
                • <Text style={styles.boldText}>Sekali Bayar Rp 15.000:</Text> Miliki seumur hidup tanpa bulanan.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. PENAWARAN HARGA & ALUR PEMBELIAN (SYARAT KYC DUITKU) */}
        <View style={[styles.pricingContainer, isDesktop && styles.pricingContainerDesktop]}>
          <View style={[styles.pricingCard, isDesktop && styles.pricingCardDesktop]}>
            <View style={styles.pricingBadge}>
              <Text style={styles.pricingBadgeText}>PENAWARAN RESMI</Text>
            </View>
            <Text style={styles.pricingTitle}>Lisensi Akses Seumur Hidup</Text>
            <Text style={styles.pricingSubtitle}>
              Bayar satu kali, nikmati selamanya tanpa biaya tambahan atau tagihan tersembunyi.
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceStrike}>Rp 50.000</Text>
              <View style={styles.priceMain}>
                <Text style={styles.priceCurrency}>Rp</Text>
                <Text style={styles.priceFigure}>15.000</Text>
                <Text style={styles.pricePeriod}>/ sekali bayar</Text>
              </View>
            </View>

            <View style={styles.featureList}>
              <Text style={styles.featureLine}>• 1 Kode Lisensi Digital Akses Selamanya</Text>
              <Text style={styles.featureLine}>• Smart Calculator Belanjaan Langsung</Text>
              <Text style={styles.featureLine}>• Pengatur Batas Sisa Jatah Belanja Harian</Text>
              <Text style={styles.featureLine}>• Rekap Bulanan Otomatis & Grafik Pengeluaran</Text>
              <Text style={styles.featureLine}>• Kunci Tambahan dengan PIN Keamanan</Text>
              <Text style={styles.featureLine}>• Bisa Dipasang Langsung di Layar HP (Android & iPhone)</Text>
              <Text style={styles.featureLine}>• Bantuan Customer Service via WhatsApp</Text>
            </View>

            {/* Tombol Aksi Utama Pembelian */}
            <TouchableOpacity
              style={styles.pricingBuyBtn}
              onPress={handleOpenBuy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Beli Lisensi Sekarang Rp 15.000"
            >
              <Text style={styles.pricingBuyBtnText}>Beli Lisensi Sekarang (Rp 15.000)</Text>
            </TouchableOpacity>

            <Text style={styles.paymentMethods}>
              Didukung QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay) & Transfer Bank
            </Text>
            <Text style={styles.paymentInstant}>
              Kode lisensi langsung diberikan otomatis setelah pembayaran berhasil.
            </Text>
          </View>
        </View>

        {/* 5. FAQ ACCORDION INTERAKTIF */}
        <View style={[styles.faqContainer, isDesktop && styles.faqContainerDesktop]}>
          <Text style={styles.sectionEyebrow}>TANYA JAWAB</Text>
          <Text style={[styles.sectionHeading, isDesktop && styles.sectionHeadingDesktop]}>
            Pertanyaan yang Sering Ditanyakan
          </Text>

          <View style={styles.faqList}>
            {[
              {
                q: "Apakah ada biaya langganan bulanan?",
                a: "Sama sekali tidak ada. Pembayaran Rp 15.000 adalah untuk akses seumur hidup (pay once, own forever). Tidak ada pemotongan saldo berkala.",
              },
              {
                q: "Bagaimana cara mengaktifkan setelah membeli?",
                a: 'Setelah pembayaran berhasil, Anda akan menerima 1 kode lisensi (contoh: BH-46LC-P9HY). Buka aplikasi Bocor Halus di HP atau browser, klik tombol "Masukkan Kode", masukkan kodenya, dan aplikasi langsung aktif selamanya.',
              },
              {
                q: "Apakah aplikasi ini bisa dipasang di HP seperti aplikasi biasa?",
                a: 'Bisa banget! Anda tidak perlu download aplikasi berat yang memakan memori HP. Cukup buka di browser HP Anda (Chrome di Android atau Safari di iPhone), lalu pilih opsi "Tambahkan ke Layar Utama" (Add to Home Screen). Ikon aplikasi Bocor Halus akan langsung muncul di layar HP Anda dan siap dibuka kapan saja seperti aplikasi biasa.',
              },
              {
                q: "Apakah data keuangan saya aman dan tetap ada setelah browser ditutup?",
                a: "Data transaksi disimpan secara lokal di memori browser/perangkat Anda (Local Storage / SQLite lokal), bukan di server luar. Data tetap tersimpan aman saat aplikasi/browser ditutup atau direfresh. Anda juga dapat mencadangkan (export backup) data kapan saja di menu Pengaturan.",
              },
              {
                q: "Bagaimana jika saya ganti HP atau menghapus data browser?",
                a: "Cukup simpan kode lisensi Anda. Kode tersebut dapat dimasukkan kembali di perangkat baru kapan saja untuk membuka akses penuh.",
              },
            ].map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.faqCard}
                  onPress={() => toggleFaq(idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.faqHeaderRow}>
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Text style={styles.faqToggleIcon}>{isOpen ? "−" : "+"}</Text>
                  </View>
                  {isOpen && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 6. FOOTER RESMI & LEGALITAS (SYARAT KYC DUITKU) */}
        <View style={styles.footerSection}>
          <View style={[styles.footerContent, isDesktop && styles.footerContentDesktop]}>
            {/* Kolom 1: Brand & Info */}
            <View style={[styles.footerCol, isDesktop && styles.footerColDesktop]}>
              <Text style={styles.footerBrand}>Bocor Halus</Text>
              <Text style={styles.footerTagline}>
                Aplikasi pencatat keuangan rumah tangga dan pengeluaran harian anti ribet (bisa dipasang di layar HP Android & iPhone). Dikembangkan oleh Soradev.
              </Text>
              <Text style={styles.footerCopyright}>
                © 2026 Bocor Halus App. All rights reserved.
              </Text>
            </View>

            {/* Kolom 2: Layanan Pelanggan */}
            <View style={[styles.footerCol, isDesktop && styles.footerColDesktop]}>
              <Text style={styles.footerColTitle}>Layanan Pelanggan & Bantuan</Text>
              <Text style={styles.footerText}>Email: {supportEmail}</Text>
              <TouchableOpacity onPress={handleOpenWhatsApp} activeOpacity={0.7}>
                <Text style={styles.footerWaLink}>WhatsApp CS: {supportPhone}</Text>
              </TouchableOpacity>
              <Text style={styles.footerHours}>Jam Operasional: Senin – Sabtu, 08:00 – 21:00 WIB</Text>
            </View>

            {/* Kolom 3: Informasi Legal */}
            <View style={[styles.footerCol, isDesktop && styles.footerColDesktop]}>
              <Text style={styles.footerColTitle}>Informasi Legal & Kebijakan</Text>
              <TouchableOpacity onPress={() => openLegal("privacy")}>
                <Text style={styles.legalLinkText}>• Kebijakan Privasi (Privacy Policy)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLegal("terms")}>
                <Text style={styles.legalLinkText}>• Syarat & Ketentuan Layanan (Terms)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLegal("refund")}>
                <Text style={styles.legalLinkText}>• Kebijakan Pengembalian Dana (Refund)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7. STICKY MOBILE CONVERSION BAR (SELALU DALAM JANGKAUAN JEMPOL) */}
      {!isDesktop && (
        <View style={styles.stickyMobileBar}>
          <View>
            <Text style={styles.stickyPriceLabel}>Akses Seumur Hidup</Text>
            <Text style={styles.stickyPriceValue}>Rp 15.000</Text>
          </View>
          <View style={styles.stickyActionGroup}>
            <TouchableOpacity
              style={styles.stickyBuyBtn}
              onPress={handleOpenBuy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Beli Akses Rp 15.000"
            >
              <Text style={styles.stickyBuyText}>Beli Akses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stickyKeyBtn}
              onPress={() => setShowLicenseModal(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Aktivasi Kode"
            >
              <Text style={styles.stickyKeyText}>Aktivasi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MODAL INPUT LISENSI */}
      <LicenseGateModal
        visible={showLicenseModal}
        onActivated={() => {
          setShowLicenseModal(false);
          onActivated();
        }}
        checkoutUrl={checkoutUrl}
        onClose={() => setShowLicenseModal(false)}
      />

      {/* MODAL LEGALITAS (PRIVACY, TERMS, REFUND) */}
      <LegalModal
        visible={legalModalVisible}
        initialTab={legalTab}
        onClose={() => setLegalModalVisible(false)}
        supportPhone={supportPhone}
        supportEmail={supportEmail}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: C.cream,
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor: C.cream,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90, // extra padding for sticky mobile bar
    maxWidth: 540,
    alignSelf: "center",
    width: "100%",
  },
  scrollContentDesktop: {
    maxWidth: 1080,
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* TOP BAR */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    width: "100%",
  },
  topBarDesktop: {
    paddingVertical: 16,
    marginBottom: 32,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.greenDark,
    letterSpacing: -0.5,
  },
  brandBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  brandBadgeText: {
    color: C.greenDark,
    fontSize: 11,
    fontWeight: "800",
  },
  keyEntryBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    flexShrink: 0,
  },
  keyEntryBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: C.ink,
  },

  /* HERO */
  heroContainer: {
    width: "100%",
    marginBottom: 24,
  },
  heroContainerDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 40,
    marginBottom: 48,
  },
  heroTextCol: {
    width: "100%",
    marginBottom: 20,
  },
  heroTextColDesktop: {
    flex: 1.1,
    marginBottom: 0,
    paddingTop: 8,
  },
  eyebrowChip: {
    backgroundColor: C.creamDark,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  eyebrowChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.inkLight,
    letterSpacing: 0.4,
  },
  heroHeadline: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  heroHeadlineNarrow: {
    fontSize: 20,
    lineHeight: 27,
  },
  heroHeadlineDesktop: {
    fontSize: 35,
    lineHeight: 45,
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  heroBody: {
    fontSize: 14,
    color: C.inkLight,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroBodyDesktop: {
    fontSize: 15.5,
    lineHeight: 25,
    marginBottom: 28,
  },
  heroHighlight: {
    fontWeight: "800",
    color: C.greenDark,
  },
  heroCtaGroup: {
    gap: 10,
    width: "100%",
  },
  mainCtaBtn: {
    backgroundColor: C.greenDark,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  mainCtaTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  mainCtaSub: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  secondaryCtaBtn: {
    backgroundColor: C.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryCtaText: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "700",
  },

  /* HERO PREVIEW COL */
  heroPreviewCol: {
    width: "100%",
  },
  heroPreviewColDesktop: {
    flex: 1,
  },
  phoneMockup: {
    backgroundColor: C.cream,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    width: "100%",
  },
  phoneStatusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: C.cream,
  },
  phoneTime: {
    fontSize: 11,
    fontWeight: "800",
    color: C.inkLight,
  },
  phoneSimBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phoneSimBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 0.4,
  },
  phoneAppHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cream,
  },
  phoneAppTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },
  phoneAppSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  phoneAvatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.greenSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
  },
  phoneAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
  },
  scenarioRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 6,
  },
  scenarioChip: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scenarioChipActive: {
    backgroundColor: C.greenDark,
    borderColor: C.greenDark,
  },
  scenarioChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.inkLight,
  },
  scenarioChipTextActive: {
    color: C.white,
  },
  simToast: {
    marginHorizontal: 14,
    marginBottom: 6,
    backgroundColor: C.greenDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  simToastText: {
    fontSize: 11,
    color: C.white,
    fontWeight: "700",
    textAlign: "center",
  },
  simTipBox: {
    marginHorizontal: 14,
    marginBottom: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  simTipText: {
    fontSize: 10.5,
    lineHeight: 15,
    color: "#92400E",
    fontWeight: "600",
  },
  simFormCard: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  simFormTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  simInput: {
    backgroundColor: C.cream,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
  },
  simPresetRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  simPresetChip: {
    backgroundColor: C.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  simPresetText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.greenDark,
  },
  simLiveCalcRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 4,
  },
  simLiveCalcLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  simLiveCalcValue: {
    fontSize: 13,
    fontWeight: "800",
    color: C.greenDark,
  },
  simCatScroll: {
    flexDirection: "row",
    marginVertical: 4,
  },
  simCatChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  simCatChipActive: {
    borderColor: C.greenDark,
    transform: [{ scale: 1.02 }],
  },
  simCatEmoji: {
    fontSize: 13,
    marginRight: 5,
  },
  simCatLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  simNoteInput: {
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: C.ink,
    marginTop: 6,
    marginBottom: 8,
  },
  simAddBtn: {
    backgroundColor: C.greenDark,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  simAddBtnDisabled: {
    backgroundColor: C.mutedBg,
  },
  simAddBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.white,
  },
  simSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  simSectionTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.4,
  },
  simSectionSubtitle: {
    fontSize: 10,
    fontWeight: "600",
    color: C.muted,
  },
  simExpenseList: {
    paddingHorizontal: 14,
    gap: 6,
    marginBottom: 12,
  },
  simExpenseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  simEmojiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  simEmojiText: {
    fontSize: 14,
  },
  simItemInfo: {
    flex: 1,
    paddingRight: 6,
  },
  simItemNote: {
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
  },
  simItemExpr: {
    fontSize: 10,
    color: C.muted,
    marginTop: 1,
  },
  simItemAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
  },
  simDeleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  simDeleteBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.danger,
    lineHeight: 14,
  },
  simBottomNav: {
    flexDirection: "row",
    backgroundColor: C.cream,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 6,
    paddingBottom: 8,
  },
  simTabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  simTabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: C.muted,
    marginTop: 2,
  },
  simTabLabelActive: {
    color: C.greenDark,
    fontWeight: "800",
  },

  /* SECTION COMPARISON */
  sectionContainer: {
    width: "100%",
    marginBottom: 28,
  },
  sectionContainerDesktop: {
    marginBottom: 48,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 19,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 16,
    lineHeight: 25,
  },
  sectionHeadingDesktop: {
    fontSize: 26,
    lineHeight: 34,
    marginBottom: 24,
  },
  compareGrid: {
    gap: 12,
    width: "100%",
  },
  compareGridDesktop: {
    flexDirection: "row",
    gap: 20,
  },
  compareCardOld: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    opacity: 0.9,
  },
  compareCardNew: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: C.greenDark,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  compareCardDesktop: {
    flex: 1,
    padding: 20,
  },
  compareTitleOld: {
    fontSize: 14,
    fontWeight: "800",
    color: C.muted,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  compareItemOld: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 18,
    marginBottom: 6,
  },
  compareBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  compareBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.greenDark,
  },
  compareTitleNew: {
    fontSize: 15,
    fontWeight: "900",
    color: C.ink,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  compareItemNew: {
    fontSize: 12.5,
    color: C.inkLight,
    lineHeight: 18,
    marginBottom: 6,
  },
  boldText: {
    fontWeight: "800",
    color: C.ink,
  },

  /* PRICING */
  pricingContainer: {
    width: "100%",
    marginBottom: 28,
    alignItems: "center",
  },
  pricingContainerDesktop: {
    marginBottom: 48,
  },
  pricingCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  pricingCardDesktop: {
    maxWidth: 640,
    padding: 32,
  },
  pricingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  pricingBadgeText: {
    color: "#92400E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pricingTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
  },
  pricingSubtitle: {
    fontSize: 12.5,
    color: C.muted,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 14,
  },
  priceRow: {
    alignItems: "center",
    marginBottom: 16,
  },
  priceStrike: {
    fontSize: 12,
    color: C.muted,
    textDecorationLine: "line-through",
  },
  priceMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: "800",
    color: C.greenDark,
  },
  priceFigure: {
    fontSize: 38,
    fontWeight: "900",
    color: C.greenDark,
    letterSpacing: -1,
  },
  pricePeriod: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
  },
  featureList: {
    width: "100%",
    gap: 7,
    marginBottom: 18,
  },
  featureLine: {
    fontSize: 12.5,
    color: C.inkLight,
    lineHeight: 18,
  },
  pricingBuyBtn: {
    width: "100%",
    backgroundColor: C.greenDark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  pricingBuyBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
  },
  paymentMethods: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    lineHeight: 16,
  },
  paymentInstant: {
    fontSize: 11,
    color: C.greenDark,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },

  /* FAQ ACCORDION */
  faqContainer: {
    width: "100%",
    marginBottom: 28,
  },
  faqContainerDesktop: {
    maxWidth: 760,
    alignSelf: "center",
    marginBottom: 48,
  },
  faqList: {
    gap: 10,
    width: "100%",
  },
  faqCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  faqHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: "800",
    color: C.ink,
    flex: 1,
    paddingRight: 12,
  },
  faqToggleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: C.greenDark,
  },
  faqAnswer: {
    fontSize: 12.5,
    color: C.inkLight,
    lineHeight: 19,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },

  /* FOOTER */
  footerSection: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 24,
    width: "100%",
  },
  footerContent: {
    width: "100%",
    gap: 20,
  },
  footerContentDesktop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 32,
  },
  footerCol: {
    width: "100%",
  },
  footerColDesktop: {
    flex: 1,
  },
  footerBrand: {
    fontSize: 17,
    fontWeight: "900",
    color: C.greenDark,
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 17,
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 11,
    color: C.muted,
  },
  footerColTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  footerText: {
    fontSize: 12,
    color: C.inkLight,
    marginBottom: 4,
  },
  footerWaLink: {
    fontSize: 12.5,
    color: C.greenDark,
    fontWeight: "800",
    marginBottom: 4,
  },
  footerHours: {
    fontSize: 10.5,
    color: C.muted,
  },
  legalLinkText: {
    fontSize: 12,
    color: C.inkLight,
    fontWeight: "600",
    marginBottom: 6,
  },

  /* STICKY BOTTOM MOBILE BAR */
  stickyMobileBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  stickyPriceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.muted,
  },
  stickyPriceValue: {
    fontSize: 16,
    fontWeight: "900",
    color: C.greenDark,
  },
  stickyActionGroup: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  stickyBuyBtn: {
    backgroundColor: C.greenDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  stickyBuyText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
  },
  stickyKeyBtn: {
    backgroundColor: C.cream,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  stickyKeyText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "700",
  },
});
