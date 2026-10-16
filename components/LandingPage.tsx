import React, { useState, useEffect, useRef } from "react";
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
  Animated,
} from "react-native";
import { C } from "../constants/Colors";
import { LegalModal, LegalTab } from "./LegalModal";
import { LicenseGateModal } from "./LicenseGateModal";

interface LandingPageProps {
  onActivated: () => void;
  checkoutUrl?: string;
  supportPhone?: string;
  supportEmail?: string;
}

type ScenarioType = "pasar" | "bocor" | "kalap";

interface ScenarioData {
  id: ScenarioType;
  title: string;
  subtitle: string;
  formula: string;
  items: { category: string; expr: string; amount: number }[];
  note: string;
}

const SCENARIOS: ScenarioData[] = [
  {
    id: "pasar",
    title: "Belanja Pasar",
    subtitle: "Kebutuhan Pokok Terkendali",
    formula: "15000 + 35000 + 12000",
    items: [
      { category: "Belanja Dapur", expr: "Sayur bayam & tempe (15k)", amount: 15000 },
      { category: "Belanja Dapur", expr: "Ayam potong 1kg (35k)", amount: 35000 },
      { category: "Bumbu & Cabai", expr: "Cabai rawit & bawang (12k)", amount: 12000 },
    ],
    note: "Belanja dapur terencana rapi. Sisa jatah harian masih sangat aman.",
  },
  {
    id: "bocor",
    title: "Bocor Halus",
    subtitle: "Jajan Receh Tanpa Sadar",
    formula: "18000 + 12000 + 22000 + 9000 + 2000",
    items: [
      { category: "Jajan & Kopi", expr: "Es kopi susu kekinian", amount: 18000 },
      { category: "Camilan Sore", expr: "Gorengan & tahu renyah", amount: 12000 },
      { category: "Minuman Anak", expr: "Boba milk tea", amount: 22000 },
      { category: "Ongkir Promo", expr: "Ongkir selisih promo", amount: 9000 },
      { category: "Parkir Motor", expr: "Parkir 1x minimarket", amount: 2000 },
    ],
    note: "Waspada! 5 transaksi kecil di bawah 25 ribu telah memakan Rp 63.000 tanpa Anda sadari.",
  },
  {
    id: "kalap",
    title: "Belanja Kalap",
    subtitle: "Over-Budget Minimarket",
    formula: "45000 + 55000 + 25000",
    items: [
      { category: "Kebutuhan Anak", expr: "Popok celana sachet (45k)", amount: 45000 },
      { category: "Peralatan Rumah", expr: "Deterjen & sabun cuci (55k)", amount: 55000 },
      { category: "Camilan Tambahan", expr: "Snack & es krim (25k)", amount: 25000 },
    ],
    note: "Pengeluaran melebihi batas jatah Rp 25.000. Rekap bulanan otomatis memberi sinyal penghematan.",
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

  // State skenario interaktif
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("pasar");
  const [simFormula, setSimFormula] = useState(SCENARIOS[0].formula);

  // Animasi progress bar & counter
  const progressAnim = useRef(new Animated.Value(0.62)).current;

  // State FAQ Accordion
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const calculateSimTotal = (formula: string): number => {
    try {
      const clean = formula.replace(/[^\d+*.-]/g, "");
      const parts = clean.split("+").map((p) => parseInt(p.trim(), 10) || 0);
      return parts.reduce((a, b) => a + b, 0);
    } catch {
      return 62000;
    }
  };

  const simTotal = calculateSimTotal(simFormula);
  const dailyBudget = 100000;
  const remainingBudget = Math.max(0, dailyBudget - simTotal);
  const budgetRatio = Math.min(1.5, simTotal / dailyBudget);
  const progressPercent = Math.min(100, Math.round(budgetRatio * 100));

  // Animasi saat formula berubah
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: Math.min(1, budgetRatio),
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [simFormula, budgetRatio]);

  const selectScenario = (sc: ScenarioData) => {
    setActiveScenario(sc.id);
    setSimFormula(sc.formula);
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

  // Status meter dinamis
  let statusBadgeBg = "#DCFCE7";
  let statusBadgeText = C.greenDark;
  let statusLabel = "Optimal / Aman";
  let barColor = C.greenLight;

  if (simTotal > dailyBudget) {
    statusBadgeBg = "#FFE4E6";
    statusBadgeText = C.danger;
    statusLabel = "Over Budget";
    barColor = C.danger;
  } else if (budgetRatio > 0.6) {
    statusBadgeBg = "#FEF3C7";
    statusBadgeText = "#92400E";
    statusLabel = "Waspada Bocor";
    barColor = C.warning;
  }

  const currentScenarioData =
    SCENARIOS.find((s) => s.id === activeScenario) || SCENARIOS[0];

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
                BEBAS LANGGANAN BULANAN • 100% PRIVAT DI HP ANDA
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
              Itu namanya <Text style={styles.heroHighlight}>"Bocor Halus"</Text> — pengeluaran kecil Rp 5.000, jajan kopi, parkir, dan ongkir yang tak pernah tercatat. Bocor Halus hadir sebagai pencatat keuangan rumah tangga yang anti ribet: buka langsung ketik layaknya kalkulator belanjaan.
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

          {/* Kolom Showcase Interaktif (Motion & Live Feedback) */}
          <View style={[styles.heroPreviewCol, isDesktop && styles.heroPreviewColDesktop]}>
            <View style={styles.appCardPreview}>
              {/* Header Preview */}
              <View style={styles.previewHeader}>
                <View style={styles.previewDotRow}>
                  <View style={[styles.previewDot, { backgroundColor: "#EF4444" }]} />
                  <View style={[styles.previewDot, { backgroundColor: "#F59E0B" }]} />
                  <View style={[styles.previewDot, { backgroundColor: "#10B981" }]} />
                </View>
                <Text style={styles.previewHeaderLabel}>Simulator Nyata Bocor Halus</Text>
              </View>

              {/* Skenario Selector Tabs */}
              <View style={styles.scenarioTabRow}>
                {SCENARIOS.map((sc) => {
                  const isActive = activeScenario === sc.id;
                  return (
                    <TouchableOpacity
                      key={sc.id}
                      style={[styles.scenarioTab, isActive && styles.scenarioTabActive]}
                      onPress={() => selectScenario(sc)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.scenarioTabText,
                          isActive && styles.scenarioTabTextActive,
                        ]}
                      >
                        {sc.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Meter Sisa Jatah Belanja (Animated Spring) */}
              <View style={styles.totalCardMock}>
                <View style={styles.totalCardTop}>
                  <View>
                    <Text style={styles.totalCardSubLabel}>SISA JATAH BELANJA HARI INI</Text>
                    <Text style={styles.totalCardAmount}>
                      Rp {remainingBudget.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusBadgeBg }]}>
                    <Text style={[styles.statusPillText, { color: statusBadgeText }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Animated Progress Bar */}
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        backgroundColor: barColor,
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>

                <View style={styles.meterDetailsRow}>
                  <Text style={styles.totalCardDetails}>
                    Jatah: Rp {dailyBudget.toLocaleString("id-ID")}
                  </Text>
                  <Text style={[styles.totalCardDetails, { fontWeight: "700" }]}>
                    Belanja: Rp {simTotal.toLocaleString("id-ID")} ({progressPercent}%)
                  </Text>
                </View>
              </View>

              {/* Live Calculator Input Bar */}
              <View style={styles.calcWidget}>
                <Text style={styles.calcWidgetLabel}>Formula Belanjaan (Bisa Diketik Langsung):</Text>
                <TextInput
                  style={styles.calcWidgetInput}
                  value={simFormula}
                  onChangeText={setSimFormula}
                  placeholder="15000 + 35000 + 8000"
                  placeholderTextColor={C.muted}
                />

                <View style={styles.calcWidgetResultRow}>
                  <Text style={styles.calcWidgetResultLabel}>Hasil Perhitungan Instan:</Text>
                  <Text style={styles.calcWidgetResultValue}>
                    Rp {simTotal.toLocaleString("id-ID")}
                  </Text>
                </View>

                {/* Insight Catatan Dinamis */}
                <View style={styles.insightBox}>
                  <Text style={styles.insightText}>
                    {currentScenarioData.note}
                  </Text>
                </View>
              </View>

              {/* Item Transaksi Terakhir Nyata */}
              <View style={styles.recentSampleBox}>
                <Text style={styles.recentSampleTitle}>Rincian Transaksi Skenario:</Text>
                {currentScenarioData.items.map((item, idx) => (
                  <View key={idx} style={styles.sampleRow}>
                    <View style={styles.sampleCol}>
                      <Text style={styles.sampleCategory}>{item.category}</Text>
                      <Text style={styles.sampleExpr}>{item.expr}</Text>
                    </View>
                    <Text style={styles.sampleAmount}>
                      Rp {item.amount.toLocaleString("id-ID")}
                    </Text>
                  </View>
                ))}
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
                • <Text style={styles.boldText}>Tanpa Akun & Password:</Text> Buka web langsung pakai seketika.
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
              <Text style={styles.featureLine}>• Bisa dipasang di Layar Utama HP (PWA)</Text>
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
                a: 'Setelah pembayaran berhasil, Anda akan menerima 1 kode lisensi (contoh: BH-46LC-P9HY). Buka web ini, klik tombol "Masukkan Kode", masukkan kodenya, dan aplikasi langsung aktif selamanya.',
              },
              {
                q: "Apakah data keuangan saya aman dan tetap ada setelah browser ditutup?",
                a: "Data transaksi disimpan secara lokal di memori browser/perangkat Anda (Local Storage / SQLite lokal), bukan di server luar. Data tetap tersimpan aman saat browser ditutup atau direfresh. Anda juga dapat mencadangkan (export backup) data kapan saja di menu Pengaturan.",
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
                Aplikasi web pencatat keuangan rumah tangga dan pengeluaran harian anti ribet. Dikembangkan oleh Soradev.
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
  appCardPreview: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  previewDotRow: {
    flexDirection: "row",
    gap: 5,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewHeaderLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.muted,
  },

  /* SCENARIO TABS */
  scenarioTabRow: {
    flexDirection: "row",
    backgroundColor: C.cream,
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    gap: 4,
  },
  scenarioTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 8,
  },
  scenarioTabActive: {
    backgroundColor: C.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  scenarioTabText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: C.muted,
  },
  scenarioTabTextActive: {
    fontWeight: "800",
    color: C.greenDark,
  },

  /* TOTAL CARD MOCK */
  totalCardMock: {
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 12,
  },
  totalCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  totalCardSubLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 0.5,
  },
  totalCardAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: C.greenDark,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 7,
    backgroundColor: "#DCFCE7",
    borderRadius: 4,
    marginVertical: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  meterDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalCardDetails: {
    fontSize: 10.5,
    color: C.muted,
  },

  /* CALC WIDGET */
  calcWidget: {
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 12,
  },
  calcWidgetLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 6,
  },
  calcWidgetInput: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13.5,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 8,
  },
  calcWidgetResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  calcWidgetResultLabel: {
    fontSize: 11.5,
    color: C.muted,
    fontWeight: "600",
  },
  calcWidgetResultValue: {
    fontSize: 14,
    fontWeight: "900",
    color: C.greenDark,
  },
  insightBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  insightText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#92400E",
    fontWeight: "600",
  },

  /* RECENT SAMPLE BOX */
  recentSampleBox: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    gap: 6,
  },
  recentSampleTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.muted,
    marginBottom: 2,
  },
  sampleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.cream,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  sampleCol: {
    flex: 1,
    paddingRight: 8,
  },
  sampleCategory: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.ink,
  },
  sampleExpr: {
    fontSize: 10,
    color: C.muted,
  },
  sampleAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
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
