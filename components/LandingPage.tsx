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
import { C } from "../constants/Colors";
import { LegalModal, LegalTab } from "./LegalModal";
import { LicenseGateModal } from "./LicenseGateModal";
import { formatRupiah } from "@/lib/format";
import { addPresetAmount } from "@/lib/expenseInput";

interface LandingPageProps {
  onActivated: () => void;
  checkoutUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
}

type ScenarioId = "dapur" | "bocor" | "kalap";

interface ScenarioPreset {
  id: ScenarioId;
  title: string;
  badge: string;
  formula: string;
  itemNames: { emoji: string; label: string }[];
  note: string;
}

const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "dapur",
    title: "Belanja Dapur",
    badge: "Terkendali",
    formula: "15000 + 35000 + 12000",
    itemNames: [
      { emoji: "🥬", label: "Sayur bayam & tempe" },
      { emoji: "🍗", label: "Ayam potong 1kg" },
      { emoji: "🌶️", label: "Cabai & bumbu dapur" },
    ],
    note: "Belanja dapur terencana rapi: jatah belanja masih sangat aman di atas 80%.",
  },
  {
    id: "bocor",
    title: "Jajan Bocor Halus",
    badge: "5x Transaksi <50k",
    formula: "18000 + 12000 + 22000 + 9000 + 2000",
    itemNames: [
      { emoji: "☕", label: "Es kopi susu kekinian" },
      { emoji: "🥟", label: "Gorengan & camilan sore" },
      { emoji: "🧋", label: "Boba milk tea anak" },
      { emoji: "🛵", label: "Ongkir selisih promo" },
      { emoji: "🅿️", label: "Parkir minimarket" },
    ],
    note: "Deteksi Bocor Halus aktif! 5 transaksi kecil di bawah 50rb memakan Rp 63.000 tanpa disadari.",
  },
  {
    id: "kalap",
    title: "Belanja Kalap",
    badge: "Over Budget",
    formula: "1850000 + 1200000 + 450000",
    itemNames: [
      { emoji: "🛒", label: "Belanja bulanan supermarket" },
      { emoji: "📺", label: "Elektronik & perabot rumah" },
      { emoji: "🍽️", label: "Makan malam keluarga" },
    ],
    note: "Overbudget! Pengeluaran melebihi batas jatah bulanan Rp 3.000.000.",
  },
];

const parseFormulaToItems = (formulaStr: string, activePreset: ScenarioPreset) => {
  const clean = formulaStr.replace(/[^\d+*.-]/g, "");
  const parts = clean
    .split("+")
    .map((p) => {
      const cleanNum = p.replace(/\./g, "").trim();
      const n = parseInt(cleanNum, 10);
      return isNaN(n) ? 0 : n;
    })
    .filter((n) => n > 0);

  if (parts.length === 0) return [];

  return parts.map((amt, idx) => {
    const presetItem = activePreset.itemNames[idx];
    return {
      id: `item-${idx}`,
      amount: amt,
      emoji: presetItem?.emoji || "📦",
      label: presetItem?.label || `Belanjaan #${idx + 1}`,
    };
  });
};

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

  // State Mini Simulator
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("dapur");
  const [simFormula, setSimFormula] = useState(SCENARIO_PRESETS[0].formula);
  const budgetLimit = 3000000; // Rp 3.000.000

  // State FAQ Accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const activePreset =
    SCENARIO_PRESETS.find((s) => s.id === activeScenarioId) || SCENARIO_PRESETS[0];

  const parsedItems = useMemo(
    () => parseFormulaToItems(simFormula, activePreset),
    [simFormula, activePreset]
  );

  const totalSpent = useMemo(
    () => parsedItems.reduce((sum, item) => sum + item.amount, 0),
    [parsedItems]
  );

  const sisaJatah = Math.max(0, budgetLimit - totalSpent);
  const ratio = Math.min(1.5, totalSpent / budgetLimit);
  const percentage = Math.round((totalSpent / budgetLimit) * 100);

  const microItems = useMemo(
    () => parsedItems.filter((item) => item.amount < 50000),
    [parsedItems]
  );
  const microTotal = useMemo(
    () => microItems.reduce((sum, item) => sum + item.amount, 0),
    [microItems]
  );

  // Status meter dinamis
  let statusBadge = "Optimal / Aman";
  let statusBadgeBg = "rgba(209, 250, 229, 0.25)";
  let statusBadgeText = C.greenSoft;
  let barColor = C.greenLight;

  if (totalSpent > budgetLimit) {
    statusBadge = "Over Budget";
    statusBadgeBg = "rgba(254, 226, 226, 0.3)";
    statusBadgeText = "#FECDD3";
    barColor = C.danger;
  } else if (ratio > 0.8) {
    statusBadge = "Waspada";
    statusBadgeBg = "rgba(254, 243, 199, 0.3)";
    statusBadgeText = "#FDE68A";
    barColor = C.warning;
  }

  const handleSelectScenario = (sc: ScenarioPreset) => {
    setActiveScenarioId(sc.id);
    setSimFormula(sc.formula);
  };

  const handleAddPreset = (amt: number) => {
    setSimFormula(addPresetAmount(simFormula, amt));
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
              Itu namanya <Text style={styles.heroHighlight}>"Bocor Halus"</Text> — jajan kopi, parkir, dan belanja receh yang diam-diam menguras gaji. Catat cepat langsung di HP Anda, tanpa repot daftar akun.
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

              {/* Trust Indicators (Human, Minimalist, No AI Pill Bubble) */}
              <View style={styles.heroTrustRow}>
                <Text style={styles.heroTrustItem}>100% Privat Lokal</Text>
                <Text style={styles.heroTrustDot}>•</Text>
                <Text style={styles.heroTrustItem}>Bisa di Layar HP</Text>
                <Text style={styles.heroTrustDot}>•</Text>
                <Text style={styles.heroTrustItem}>Bebas Biaya Bulanan</Text>
              </View>
            </View>
          </View>

          {/* Kolom Showcase Interaktif (Mini Simulator) - Double-Bezel Precision Instrument */}
          <View style={[styles.heroPreviewCol, isDesktop && styles.heroPreviewColDesktop]}>
            <View style={styles.miniSimOuter}>
              <View style={styles.miniSimCard}>
                {/* Header Mini Simulator */}
                <View style={styles.miniSimHeader}>
                  <View style={styles.miniSimTitleRow}>
                    <View style={styles.miniSimDot} />
                    <Text style={styles.miniSimTitle}>Simulator Bocor Halus</Text>
                  </View>
                  <View style={styles.miniSimBadge}>
                    <Text style={styles.miniSimBadgeText}>Interaktif</Text>
                  </View>
                </View>

                {/* Skenario Selector Tabs */}
                <View style={styles.miniSimTabRow}>
                  {SCENARIO_PRESETS.map((sc) => {
                    const isActive = activeScenarioId === sc.id;
                    return (
                      <TouchableOpacity
                        key={sc.id}
                        style={[styles.miniSimTab, isActive && styles.miniSimTabActive]}
                        onPress={() => handleSelectScenario(sc)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.miniSimTabText,
                            isActive && styles.miniSimTabTextActive,
                          ]}
                        >
                          {sc.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Card Ringkasan Jatah (Sleek Emerald Card) */}
                <View style={styles.miniBudgetCard}>
                  <View style={styles.miniBudgetTop}>
                    <View>
                      <Text style={styles.miniBudgetSub}>Sisa Jatah Bulanan</Text>
                      <Text style={styles.miniBudgetVal}>
                        {formatRupiah(sisaJatah)}
                      </Text>
                    </View>
                    <View style={[styles.miniStatusBadge, { backgroundColor: statusBadgeBg }]}>
                      <Text style={[styles.miniStatusText, { color: statusBadgeText }]}>
                        {statusBadge}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.miniProgressTrack}>
                    <View
                      style={[
                        styles.miniProgressBar,
                        {
                          width: `${Math.min(100, percentage)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.miniBudgetInfoRow}>
                    <Text style={styles.miniBudgetMeta}>
                      Jatah Pokok: {formatRupiah(budgetLimit)}
                    </Text>
                    <Text style={styles.miniBudgetSpent}>
                      Terpakai: {formatRupiah(totalSpent)} ({percentage}%)
                    </Text>
                  </View>

                  {/* Deteksi Bocor Halus Insight Badge */}
                  {microItems.length > 0 && (
                    <View style={styles.miniBocorBadge}>
                      <Text style={styles.miniBocorBadgeText}>
                        💡 Deteksi Bocor Halus: {microItems.length} transaksi kecil (&lt;50rb) total {formatRupiah(microTotal)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Formula Smart Calculator Input */}
                <View style={styles.miniCalcSection}>
                  <Text style={styles.miniCalcLabel}>
                    Formula Belanjaan (Bisa Diketik Langsung):
                  </Text>
                  <TextInput
                    style={styles.miniCalcInput}
                    value={simFormula}
                    onChangeText={setSimFormula}
                    placeholder="Mis. 15000 + 35000 + 12000"
                    placeholderTextColor={C.muted}
                  />

                  {/* Quick Preset Chips */}
                  <View style={styles.miniPresetRow}>
                    {[10000, 20000, 50000, 100000].map((amt) => (
                      <TouchableOpacity
                        key={amt}
                        style={styles.miniPresetChip}
                        onPress={() => handleAddPreset(amt)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.miniPresetText}>+{amt / 1000}rb</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rincian Transaksi Skenario (100% Sinkron) */}
                <View style={styles.miniRincianSection}>
                  <View style={styles.miniRincianHeader}>
                    <Text style={styles.miniRincianTitle}>
                      Rincian Simulasi ({parsedItems.length})
                    </Text>
                    <Text style={styles.miniRincianLiveTotal}>
                      Total: {formatRupiah(totalSpent)}
                    </Text>
                  </View>

                  <View style={styles.miniItemList}>
                    {parsedItems.map((item) => (
                      <View key={item.id} style={styles.miniItemRow}>
                        <Text style={styles.miniItemEmoji}>{item.emoji}</Text>
                        <Text style={styles.miniItemLabel} numberOfLines={1}>
                          {item.label}
                        </Text>
                        <Text style={styles.miniItemAmount}>
                          {formatRupiah(item.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Catatan Skenario */}
                <View style={styles.miniNoteBox}>
                  <Text style={styles.miniNoteText}>
                    {activePreset.note}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. PERBANDINGAN REALISTIS (KENAPA BUKAN EXCEL / APLIKASI LAIN) */}
        <View style={[styles.sectionContainer, isDesktop && styles.sectionContainerDesktop]}>
          <Text style={[styles.sectionHeading, isDesktop && styles.sectionHeadingDesktop]}>
            Kenapa Mencatat Keuangan Selalu Malas & Berhenti?
          </Text>

          <View style={[styles.compareGrid, isDesktop && styles.compareGridDesktop]}>
            {/* Card Aplikasi Lain */}
            <View style={[styles.compareCardOld, isDesktop && styles.compareCardDesktop]}>
              <Text style={styles.compareTitleOld}>Aplikasi Keuangan Biasa & Excel</Text>
              <View style={styles.compareList}>
                <View style={styles.compareItemRow}>
                  <Text style={styles.compareCrossIcon}>✕</Text>
                  <Text style={styles.compareItemOld}>Wajib daftar akun, isi nomor HP, email & password</Text>
                </View>
                <View style={styles.compareItemRow}>
                  <Text style={styles.compareCrossIcon}>✕</Text>
                  <Text style={styles.compareItemOld}>Repot buka kalkulator dulu baru catat manual satu-satu</Text>
                </View>
                <View style={styles.compareItemRow}>
                  <Text style={styles.compareCrossIcon}>✕</Text>
                  <Text style={styles.compareItemOld}>Data keuangan disimpan di server cloud pihak lain</Text>
                </View>
                <View style={styles.compareItemRow}>
                  <Text style={styles.compareCrossIcon}>✕</Text>
                  <Text style={styles.compareItemOld}>Tagihan langganan bulanan yang terus memotong saldo</Text>
                </View>
              </View>
            </View>

            {/* Card Bocor Halus - Double Bezel */}
            <View style={[styles.compareCardNewOuter, isDesktop && styles.compareCardDesktop]}>
              <View style={styles.compareCardNew}>
                <View style={styles.compareBadge}>
                  <Text style={styles.compareBadgeText}>Solusi Praktis</Text>
                </View>
                <Text style={styles.compareTitleNew}>Bocor Halus: Langsung Tanpa Ribet</Text>
                <View style={styles.compareList}>
                  <View style={styles.compareItemRow}>
                    <Text style={styles.compareCheckIcon}>✓</Text>
                    <Text style={styles.compareItemNew}>
                      <Text style={styles.boldText}>Bisa di Layar HP:</Text> Pasang langsung ke layar utama HP (Android & iPhone) tanpa unduh file berat atau daftar akun.
                    </Text>
                  </View>
                  <View style={styles.compareItemRow}>
                    <Text style={styles.compareCheckIcon}>✓</Text>
                    <Text style={styles.compareItemNew}>
                      <Text style={styles.boldText}>Smart Kalkulator:</Text> Ketik <Text style={styles.codeText}>15rb + 35rb</Text> langsung terjumlah otomatis.
                    </Text>
                  </View>
                  <View style={styles.compareItemRow}>
                    <Text style={styles.compareCheckIcon}>✓</Text>
                    <Text style={styles.compareItemNew}>
                      <Text style={styles.boldText}>📅 Kalender Pengeluaran:</Text> Pantau tanggal boros & rayakan hari hemat dalam kalender visual.
                    </Text>
                  </View>
                  <View style={styles.compareItemRow}>
                    <Text style={styles.compareCheckIcon}>✓</Text>
                    <Text style={styles.compareItemNew}>
                      <Text style={styles.boldText}>🐷 Celengan Target Impian:</Text> Alihkan uang jajan yang dihemat ke barang impian dengan 1-klik (+10rb, +20rb, +50rb).
                    </Text>
                  </View>
                  <View style={styles.compareItemRow}>
                    <Text style={styles.compareCheckIcon}>✓</Text>
                    <Text style={styles.compareItemNew}>
                      <Text style={styles.boldText}>100% Privat Lokal:</Text> Seluruh data transaksi tersimpan aman di HP Anda sendiri tanpa bikin akun.
                    </Text>
                  </View>
                  <View style={styles.compareItemRow}>
                    <Text style={styles.compareCheckIcon}>✓</Text>
                    <Text style={styles.compareItemNew}>
                      <Text style={styles.boldText}>Sekali Bayar Rp 15.000:</Text> Miliki seumur hidup tanpa biaya langganan bulanan.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 4. SHOWCASE FITUR UNGGULAN (KALENDER VISUAL & CELENGAN TARGET) */}
        <View style={[styles.sectionContainer, isDesktop && styles.sectionContainerDesktop]}>
          <Text style={[styles.sectionHeading, isDesktop && styles.sectionHeadingDesktop]}>
            Instrumen Cerdas untuk Menghentikan Bocor Halus
          </Text>

          <View style={[styles.spotlightGrid, isDesktop && styles.spotlightGridDesktop]}>
            {/* Card 1: Kalender Pengeluaran Visual */}
            <View style={[styles.spotlightCard, isDesktop && styles.spotlightCardDesktop]}>
              <View style={styles.spotlightHeader}>
                <View style={styles.spotlightEmojiBox}>
                  <Text style={styles.spotlightEmoji}>📅</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spotlightTitle}>Kalender Pengeluaran Visual</Text>
                  <Text style={styles.spotlightSub}>Peta Heatmap Transaksi Harian</Text>
                </View>
              </View>
              <Text style={styles.spotlightDesc}>
                Lihat langsung tanggal berapa saja belanja membengkak, hari mana terdeteksi jajan bocor halus (&lt;50rb), dan rayakan hari hemat tanpa belanja (No-Spend Day).
              </Text>

              {/* Mini Calendar Visual Box */}
              <View style={styles.miniCalBox}>
                <View style={styles.miniCalHeaderRow}>
                  {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                    <Text key={d} style={styles.miniCalHeadCell}>{d}</Text>
                  ))}
                </View>
                <View style={styles.miniCalGridRow}>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>10</Text><View style={styles.miniCalPillSafe}><Text style={styles.miniCalPillTextSafe}>25k</Text></View></View>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>11</Text><Text style={styles.miniCalStar}>✨</Text></View>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>12</Text><View style={styles.miniCalPillBocor}><Text style={styles.miniCalPillTextBocor}>💧 45k</Text></View></View>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>13</Text><Text style={styles.miniCalStar}>✨</Text></View>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>14</Text><View style={styles.miniCalPillSafe}><Text style={styles.miniCalPillTextSafe}>35k</Text></View></View>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>15</Text><View style={styles.miniCalPillHeavy}><Text style={styles.miniCalPillTextHeavy}>180k</Text></View></View>
                  <View style={styles.miniCalCell}><Text style={styles.miniCalDate}>16</Text><Text style={styles.miniCalStar}>✨</Text></View>
                </View>
              </View>
            </View>

            {/* Card 2: Celengan Target Impian */}
            <View style={[styles.spotlightCard, isDesktop && styles.spotlightCardDesktop]}>
              <View style={styles.spotlightHeader}>
                <View style={styles.spotlightEmojiBox}>
                  <Text style={styles.spotlightEmoji}>🐷</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spotlightTitle}>Celengan Target Impian</Text>
                  <Text style={styles.spotlightSub}>Alihkan Uang Jajan ke Tabungan</Text>
                </View>
              </View>
              <Text style={styles.spotlightDesc}>
                Berhasil menahan godaan jajan impulsif? Cukup 1 klik tombol cepat (+10rb, +20rb, +50rb), uang tersebut langsung terkumpul rapi di tabungan barang impian Anda.
              </Text>

              {/* Mini Saving Visual Box */}
              <View style={styles.miniSavingBox}>
                <View style={styles.miniSavingTopRow}>
                  <Text style={styles.miniSavingGoalName}>👟 Beli Sepatu Olahraga</Text>
                  <Text style={styles.miniSavingPct}>70%</Text>
                </View>
                <View style={styles.miniSavingTrack}>
                  <View style={[styles.miniSavingBar, { width: "70%" }]} />
                </View>
                <View style={styles.miniSavingAmountRow}>
                  <Text style={styles.miniSavingCurAmt}>Rp 350.000</Text>
                  <Text style={styles.miniSavingTargetAmt}>/ Rp 500.000</Text>
                </View>
                <View style={styles.miniSavingBtnRow}>
                  <View style={styles.miniSavingChip}><Text style={styles.miniSavingChipText}>+10rb</Text></View>
                  <View style={styles.miniSavingChip}><Text style={styles.miniSavingChipText}>+20rb</Text></View>
                  <View style={styles.miniSavingChip}><Text style={styles.miniSavingChipText}>+50rb</Text></View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 5. PENAWARAN HARGA & ALUR PEMBELIAN (SYARAT KYC DUITKU) */}
        <View style={[styles.pricingContainer, isDesktop && styles.pricingContainerDesktop]}>
          <View style={[styles.pricingOuter, isDesktop && styles.pricingOuterDesktop]}>
            <View style={styles.pricingCard}>
              <View style={styles.pricingBadge}>
                <Text style={styles.pricingBadgeText}>Akses Digital Permanen</Text>
              </View>
              <Text style={styles.pricingTitle}>Lisensi Akses Seumur Hidup</Text>
              <Text style={styles.pricingSubtitle}>
                Semua instrumen anti bocor halus disatukan dalam satu aplikasi praktis tanpa biaya bulanan.
              </Text>

              {/* Checklist Keunggulan Penuh */}
              <View style={styles.featureList}>
                {[
                  "Smart Calculator: Ketik belanjaan pasar langsung terjumlah",
                  "Detektor Otomatis Transaksi Bocor Halus (<50rb)",
                  "Pantau Batas & Sisa Jatah Belanja Harian Real-time",
                  "📅 Kalender Pengeluaran Visual: Deteksi tanggal jebol & hari hemat",
                  "🐷 Celengan Target Impian: Alihkan sisa jajan ke tabungan 1-klik",
                  "Rekap Pengeluaran Bulanan & Grafik Kategori Otomatis",
                  "100% Bebas Iklan Pop-up yang Mengganggu",
                  "100% Privat Lokal: Data di HP Anda Tanpa Bikin Akun",
                  "Sekali Bayar Miliki Selamanya (Tanpa Biaya Bulanan)",
                  "Bisa Dipasang Langsung di Layar HP (Android & iPhone)",
                ].map((feat, idx) => (
                  <View key={idx} style={styles.featureItemRow}>
                    <View style={styles.featureCheckBadge}>
                      <Text style={styles.featureCheckMark}>✓</Text>
                    </View>
                    <Text style={styles.featureLine}>{feat}</Text>
                  </View>
                ))}
              </View>

              {/* Price Reveal Box */}
              <View style={styles.priceRevealBox}>
                <View style={styles.priceMain}>
                  <Text style={styles.priceCurrency}>Rp</Text>
                  <Text style={styles.priceFigure}>15.000</Text>
                  <Text style={styles.pricePeriod}>/ bayar 1x selamanya</Text>
                </View>
                <View style={styles.priceCoffeeAnchor}>
                  <Text style={styles.priceCoffeeAnchorText}>
                    ☕ Cukup seharga 1 cup es kopi susu untuk bebas boros selamanya
                  </Text>
                </View>
              </View>

              {/* Tombol Aksi Utama Pembelian */}
              <TouchableOpacity
                style={styles.pricingBuyBtn}
                onPress={handleOpenBuy}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Beli Lisensi Sekarang Rp 15.000"
              >
                <Text style={styles.pricingBuyBtnText}>Beli Lisensi Sekarang — Rp 15.000</Text>
              </TouchableOpacity>

              <Text style={styles.paymentMethods}>
                Didukung QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay) & Transfer Bank
              </Text>
              <Text style={styles.paymentInstant}>
                Kode lisensi langsung diberikan otomatis setelah pembayaran berhasil.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. FAQ ACCORDION INTERAKTIF */}
        <View style={[styles.faqContainer, isDesktop && styles.faqContainerDesktop]}>
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
    ...Platform.select({ web: { cursor: "pointer" as any } }),
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
    justifyContent: "center",
    width: "100%",
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
    ...Platform.select({ web: { cursor: "pointer" as any } }),
  },
  mainCtaTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  mainCtaSub: {
    color: "#A7F3D0",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
    textAlign: "center",
  },
  secondaryCtaBtn: {
    backgroundColor: C.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({ web: { cursor: "pointer" as any } }),
  },
  secondaryCtaText: {
    color: C.ink,
    fontSize: 13.5,
    fontWeight: "700",
  },
  heroTrustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  heroTrustItem: {
    fontSize: 11.5,
    color: C.muted,
    fontWeight: "600",
  },
  heroTrustDot: {
    fontSize: 10,
    color: C.border,
  },

  /* HERO PREVIEW COL */
  heroPreviewCol: {
    width: "100%",
  },
  heroPreviewColDesktop: {
    flex: 1,
  },

  /* MINI SIMULATOR - DOUBLE BEZEL */
  miniSimOuter: {
    backgroundColor: "#F3EDE3",
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: "#E5DDD1",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  miniSimCard: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 16,
    width: "100%",
  },
  miniSimHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  miniSimTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniSimDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.greenLight,
  },
  miniSimTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: 0.3,
  },
  miniSimBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  miniSimBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.greenDark,
  },
  miniSimTabRow: {
    flexDirection: "row",
    backgroundColor: C.cream,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    gap: 4,
  },
  miniSimTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
    ...Platform.select({ web: { cursor: "pointer" as any } }),
  },
  miniSimTabActive: {
    backgroundColor: C.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  miniSimTabText: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
  },
  miniSimTabTextActive: {
    fontWeight: "800",
    color: C.greenDark,
  },
  miniBudgetCard: {
    backgroundColor: C.greenDark,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  miniBudgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  miniBudgetSub: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
  },
  miniBudgetVal: {
    fontSize: 22,
    fontWeight: "900",
    color: C.white,
    marginTop: 2,
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  miniProgressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginVertical: 10,
    overflow: "hidden",
  },
  miniProgressBar: {
    height: "100%",
    borderRadius: 3,
  },
  miniBudgetInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniBudgetMeta: {
    fontSize: 10.5,
    color: "rgba(255,255,255,0.75)",
  },
  miniBudgetSpent: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
  },
  miniBocorBadge: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  miniBocorBadgeText: {
    fontSize: 10.5,
    color: "#FDE68A",
    fontWeight: "700",
    lineHeight: 14,
  },
  miniCalcSection: {
    backgroundColor: C.cream,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  miniCalcLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 6,
  },
  miniCalcInput: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  miniPresetRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  miniPresetChip: {
    backgroundColor: C.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
    ...Platform.select({ web: { cursor: "pointer" as any } }),
  },
  miniPresetText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.greenDark,
  },
  miniRincianSection: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
    marginBottom: 8,
  },
  miniRincianHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  miniRincianTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: C.muted,
    letterSpacing: 0.3,
  },
  miniRincianLiveTotal: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.greenDark,
  },
  miniItemList: {
    gap: 4,
  },
  miniItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cream,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  miniItemEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  miniItemLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: C.ink,
    paddingRight: 6,
  },
  miniItemAmount: {
    fontSize: 11.5,
    fontWeight: "800",
    color: C.greenDark,
  },
  miniNoteBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  miniNoteText: {
    fontSize: 10.5,
    color: "#92400E",
    fontWeight: "600",
    lineHeight: 14,
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
    gap: 14,
    width: "100%",
  },
  compareGridDesktop: {
    flexDirection: "row",
    gap: 20,
  },
  compareCardOld: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  compareList: {
    gap: 10,
  },
  compareItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  compareCrossIcon: {
    fontSize: 13,
    fontWeight: "900",
    color: "#EF4444",
    lineHeight: 18,
  },
  compareCheckIcon: {
    fontSize: 14,
    fontWeight: "900",
    color: C.greenDark,
    lineHeight: 18,
  },
  compareCardNewOuter: {
    backgroundColor: "#ECFDF5",
    borderRadius: 22,
    padding: 4,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  compareCardNew: {
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  compareCardDesktop: {
    flex: 1,
  },
  compareTitleOld: {
    fontSize: 14,
    fontWeight: "800",
    color: C.muted,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  compareItemOld: {
    fontSize: 12.5,
    color: C.muted,
    lineHeight: 18,
    flex: 1,
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
    borderBottomColor: "#E2DDD6",
  },
  compareItemNew: {
    fontSize: 12.5,
    color: C.inkLight,
    lineHeight: 18,
    flex: 1,
  },
  boldText: {
    fontWeight: "800",
    color: C.ink,
  },
  codeText: {
    fontWeight: "700",
    color: C.greenDark,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },

  /* PRICING */
  pricingContainer: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
  },
  pricingContainerDesktop: {
    marginBottom: 56,
  },
  pricingOuter: {
    backgroundColor: "#F5EDE2",
    borderRadius: 26,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E5DDD1",
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  pricingOuterDesktop: {
    maxWidth: 640,
    alignSelf: "center",
  },
  pricingCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  pricingCardDesktop: {
    padding: 32,
  },
  pricingBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  pricingBadgeText: {
    color: C.greenDark,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pricingTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
  },
  pricingSubtitle: {
    fontSize: 12.5,
    color: C.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  featureList: {
    width: "100%",
    gap: 8,
    marginBottom: 20,
  },
  featureItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.greenSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureCheckMark: {
    fontSize: 12,
    fontWeight: "900",
    color: C.greenDark,
    lineHeight: 14,
  },
  featureLine: {
    fontSize: 12.5,
    color: C.inkLight,
    lineHeight: 18,
    flex: 1,
  },
  priceRevealBox: {
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
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
  priceCoffeeAnchor: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  priceCoffeeAnchorText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.greenDark,
    textAlign: "center",
  },
  pricingBuyBtn: {
    width: "100%",
    backgroundColor: C.greenDark,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
    ...Platform.select({ web: { cursor: "pointer" as any } }),
  },
  pricingBuyBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
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
    ...Platform.select({ web: { cursor: "pointer" as any } }),
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
    ...Platform.select({ web: { cursor: "pointer" as any } }),
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
    ...Platform.select({ web: { cursor: "pointer" as any } }),
  },
  stickyKeyText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  spotlightGrid: {
    flexDirection: "column",
    gap: 16,
  },
  spotlightGridDesktop: {
    flexDirection: "row",
    gap: 20,
  },
  spotlightCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    flex: 1,
    ...Platform.select({
      web: { boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)" },
      default: { elevation: 2 },
    }),
  },
  spotlightCardDesktop: {
    flex: 1,
  },
  spotlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  spotlightEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  spotlightEmoji: {
    fontSize: 22,
  },
  spotlightTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.2,
  },
  spotlightSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 1,
  },
  spotlightDesc: {
    fontSize: 13,
    color: C.inkLight,
    lineHeight: 19,
    marginBottom: 14,
  },
  miniCalBox: {
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniCalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  miniCalHeadCell: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    flex: 1,
    textAlign: "center",
  },
  miniCalGridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  miniCalCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 2,
  },
  miniCalDate: {
    fontSize: 11,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 4,
  },
  miniCalPillSafe: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniCalPillTextSafe: {
    fontSize: 9,
    fontWeight: "800",
    color: C.greenDark,
  },
  miniCalPillBocor: {
    backgroundColor: C.warningBg,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniCalPillTextBocor: {
    fontSize: 8.5,
    fontWeight: "800",
    color: C.warning,
  },
  miniCalPillHeavy: {
    backgroundColor: C.dangerBg,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniCalPillTextHeavy: {
    fontSize: 8.5,
    fontWeight: "800",
    color: C.danger,
  },
  miniCalStar: {
    fontSize: 10,
    lineHeight: 14,
  },
  miniSavingBox: {
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  miniSavingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  miniSavingGoalName: {
    fontSize: 13,
    fontWeight: "800",
    color: C.ink,
  },
  miniSavingPct: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
  },
  miniSavingTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: C.mutedBg,
    overflow: "hidden",
    marginBottom: 8,
  },
  miniSavingBar: {
    height: "100%",
    backgroundColor: C.greenLight,
    borderRadius: 4,
  },
  miniSavingAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 10,
  },
  miniSavingCurAmt: {
    fontSize: 15,
    fontWeight: "800",
    color: C.greenDark,
  },
  miniSavingTargetAmt: {
    fontSize: 12,
    color: C.muted,
  },
  miniSavingBtnRow: {
    flexDirection: "row",
    gap: 6,
  },
  miniSavingChip: {
    flex: 1,
    backgroundColor: C.greenSoft,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  miniSavingChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.greenDark,
  },
});
