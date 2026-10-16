import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  TextInput,
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

export function LandingPage({
  onActivated,
  checkoutUrl = "https://lynk.id/soradev/bocor-halus",
  supportPhone = "0853-7331-3646",
  supportEmail = "andrewchivas.ar@gmail.com",
}: LandingPageProps) {
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>("privacy");

  // State simulasi kalkulator cerdas di mobile
  const [simFormula, setSimFormula] = useState("15000 + 35000 + 8000");

  const calculateSimTotal = (formula: string): number => {
    try {
      const clean = formula.replace(/[^\d+*.-]/g, "");
      const parts = clean.split("+").map((p) => parseInt(p.trim(), 10) || 0);
      return parts.reduce((a, b) => a + b, 0);
    } catch {
      return 58000;
    }
  };

  const simTotal = calculateSimTotal(simFormula);
  const dailyBudget = 100000;
  const remainingBudget = Math.max(0, dailyBudget - simTotal);

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. MOBILE TOP APP BAR */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Bocor Halus</Text>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>App</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.keyEntryBtn}
            onPress={() => setShowLicenseModal(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Masukkan Kode Lisensi"
          >
            <Text style={styles.keyEntryBtnText}>Punya Lisensi?</Text>
          </TouchableOpacity>
        </View>

        {/* 2. MOBILE HERO: PAIN POINT & VALUE PROPOSITION */}
        <View style={styles.heroCard}>
          <View style={styles.eyebrowChip}>
            <Text style={styles.eyebrowChipText}>✨ SEKALI BELI • BEBAS LANGGANAN</Text>
          </View>

          <Text style={styles.heroHeadline}>
            Stop Uang Belanja Cepat Habis Tanpa Tahu ke Mana.
          </Text>

          <Text style={styles.heroBody}>
            Bunda sering kaget saldo menipis? Itu namanya <Text style={styles.heroHighlight}>"Bocor Halus"</Text> — jajan receh, parkir, dan ongkir 10 ribuan yang tak tercatat tapi totalnya ratusan ribu.
          </Text>

          {/* CTA UTAMA MOBILE */}
          <TouchableOpacity
            style={styles.mainCtaBtn}
            onPress={handleOpenBuy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Beli Akses Seumur Hidup Rp 15.000"
          >
            <Text style={styles.mainCtaTitle}>Beli Akses Seumur Hidup — Rp 15.000</Text>
            <Text style={styles.mainCtaSub}>Bayar 1x Pakai Selamanya • Tanpa Biaya Bulanan</Text>
          </TouchableOpacity>
        </View>

        {/* 3. INTERACTIVE SIMULATOR (MOBILE-SIZED CALCULATOR SHOWCASE) */}
        <View style={styles.simCard}>
          <View style={styles.simHeader}>
            <Text style={styles.simHeaderTitle}>Coba Cara Kerjanya Langsung 👇</Text>
            <Text style={styles.simHeaderSub}>Ketik hitungan pasar layaknya kalkulator biasa</Text>
          </View>

          {/* Sisa Jatah Belanja Meter */}
          <View style={styles.meterBox}>
            <View style={styles.meterTop}>
              <Text style={styles.meterLabel}>SISA JATAH HARI INI</Text>
              <View style={styles.meterStatus}>
                <Text style={styles.meterStatusText}>Aman</Text>
              </View>
            </View>
            <Text style={styles.meterAmount}>Rp {remainingBudget.toLocaleString("id-ID")}</Text>
            <Text style={styles.meterDetails}>
              Jatah: Rp {dailyBudget.toLocaleString("id-ID")} • Belanja: Rp {simTotal.toLocaleString("id-ID")}
            </Text>
          </View>

          {/* Interactive Input */}
          <View style={styles.inputCard}>
            <Text style={styles.inputCardLabel}>Ketik formula pengeluaran:</Text>
            <TextInput
              style={styles.formulaInput}
              value={simFormula}
              onChangeText={setSimFormula}
              placeholder="15000 + 25000 + 8000"
              placeholderTextColor={C.muted}
            />

            <View style={styles.formulaResultBar}>
              <Text style={styles.formulaResultLabel}>Otomatis Terhitung:</Text>
              <Text style={styles.formulaResultValue}>Rp {simTotal.toLocaleString("id-ID")}</Text>
            </View>

            {/* Quick Tap Presets */}
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setSimFormula("15000 + 35000 + 8000")}
              >
                <Text style={styles.presetChipText}>🛒 Sayur & Ayam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setSimFormula("18000 + 5000 + 4000")}
              >
                <Text style={styles.presetChipText}>☕ Kopi & Jajan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetChip}
                onPress={() => setSimFormula("45000 + 12000")}
              >
                <Text style={styles.presetChipText}>🍼 Popok & Susu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. PERBANDINGAN: KENAPA BUKAN EXCEL / APLIKASI LAIN */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeaderTag}>PERBANDINGAN NYATA</Text>
          <Text style={styles.sectionTitle}>Kenapa Mencatat Keuangan Selalu Malas & Berhenti?</Text>

          <View style={styles.compareStack}>
            {/* Aplikasi Lain */}
            <View style={styles.compareCardOld}>
              <Text style={styles.compareTitleOld}>Aplikasi Keuangan Biasa & Excel</Text>
              <Text style={styles.compareItemOld}>✕ Wajib daftar akun, isi nomor HP, email & password</Text>
              <Text style={styles.compareItemOld}>✕ Repot buka kalkulator dulu baru catat satu-satu</Text>
              <Text style={styles.compareItemOld}>✕ Data keuangan disimpan di server cloud luar</Text>
              <Text style={styles.compareItemOld}>✕ Langganan bulanan mahal yang terus memotong saldo</Text>
            </View>

            {/* Bocor Halus */}
            <View style={styles.compareCardNew}>
              <View style={styles.compareBadge}>
                <Text style={styles.compareBadgeText}>Solusi Bocor Halus</Text>
              </View>
              <Text style={styles.compareTitleNew}>Pencatat Keuangan Paling Cepat</Text>
              <Text style={styles.compareItemNew}>✓ <Text style={styles.bold}>Tanpa Akun & Password:</Text> Buka web langsung pakai</Text>
              <Text style={styles.compareItemNew}>✓ <Text style={styles.bold}>Smart Kalkulator:</Text> Ketik `15rb + 35rb` langsung terjumlah</Text>
              <Text style={styles.compareItemNew}>✓ <Text style={styles.bold}>100% Privat di HP:</Text> Data tersimpan lokal di perangkat</Text>
              <Text style={styles.compareItemNew}>✓ <Text style={styles.bold}>Sekali Bayar Rp 15.000:</Text> Miliki seumur hidup tanpa bulanan</Text>
            </View>
          </View>
        </View>

        {/* 5. PAKET PENAWARAN & TRANSPARANSI HARGA (SYARAT KYC DUITKU) */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingBadge}>
            <Text style={styles.pricingBadgeText}>PENAWARAN RESMI</Text>
          </View>
          <Text style={styles.pricingPlanName}>Lisensi Akses Seumur Hidup</Text>
          <Text style={styles.pricingPlanSub}>Beli sekali, gunakan selamanya tanpa biaya tambahan.</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceStrike}>Rp 50.000</Text>
            <View style={styles.priceBig}>
              <Text style={styles.priceCur}>Rp</Text>
              <Text style={styles.priceNum}>15.000</Text>
            </View>
          </View>

          <View style={styles.featureList}>
            <Text style={styles.featureLine}>✓ 1 Kode Lisensi Digital Akses Selamanya</Text>
            <Text style={styles.featureLine}>✓ Smart Calculator Belanjaan Langsung</Text>
            <Text style={styles.featureLine}>✓ Pengatur Batas Sisa Jatah Belanja Harian</Text>
            <Text style={styles.featureLine}>✓ Rekap Bulanan Otomatis & Grafik Pengeluaran</Text>
            <Text style={styles.featureLine}>✓ Kunci Tambahan dengan PIN Keamanan</Text>
            <Text style={styles.featureLine}>✓ Bisa dipasang di Layar Utama HP (PWA)</Text>
            <Text style={styles.featureLine}>✓ Bantuan Customer Service via WhatsApp</Text>
          </View>

          <TouchableOpacity
            style={styles.pricingBuyBtn}
            onPress={handleOpenBuy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Beli Sekarang Rp 15.000"
          >
            <Text style={styles.pricingBuyBtnText}>Beli Lisensi Sekarang (Rp 15.000)</Text>
          </TouchableOpacity>

          <Text style={styles.paymentMethods}>
            Metode Pembayaran: QRIS (BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay) & Virtual Account
          </Text>
          <Text style={styles.paymentInstant}>
            ⚡ Kode lisensi langsung diberikan otomatis setelah pembayaran berhasil.
          </Text>
        </View>

        {/* 6. FAQ RINGKAS MOBILE */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionHeaderTag}>TANYA JAWAB</Text>
          <Text style={styles.sectionTitle}>Pertanyaan Populer</Text>

          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Apakah ada biaya bulanan lagi?</Text>
            <Text style={styles.faqA}>Tidak ada. Cukup bayar Rp 15.000 sekali, Anda memiliki akses penuh selamanya.</Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Apakah data belanjaan saya bisa diintip orang?</Text>
            <Text style={styles.faqA}>Tidak bisa. Aplikasi tidak mengirim catatan belanjaan ke server cloud. Semua catatan 100% tersimpan di HP Anda sendiri.</Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Bagaimana jika saya ganti HP?</Text>
            <Text style={styles.faqA}>Simpan kode lisensi Anda. Kode tersebut bisa dimasukkan kembali di perangkat baru Anda kapan saja.</Text>
          </View>
        </View>

        {/* 7. FOOTER RESMI & LEGALITAS (SYARAT DUITKU) */}
        <View style={styles.mobileFooter}>
          <Text style={styles.footerBrand}>Bocor Halus</Text>
          <Text style={styles.footerTagline}>
            Aplikasi web pencatat keuangan rumah tangga anti ribet. Dikembangkan oleh Sora Dev (Andrew Chivas Arsenal Rico).
          </Text>

          {/* Kontak Bantuan */}
          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>LAYANAN PELANGGAN RESMI</Text>
            <Text style={styles.contactItem}>Email: {supportEmail}</Text>
            <TouchableOpacity onPress={handleOpenWhatsApp} activeOpacity={0.7}>
              <Text style={styles.contactWa}>💬 WhatsApp CS: {supportPhone}</Text>
            </TouchableOpacity>
            <Text style={styles.contactHours}>Jam Operasional: Senin – Sabtu, 08:00 – 21:00 WIB</Text>
          </View>

          {/* Tautan Regulasi Legal */}
          <View style={styles.legalLinksRow}>
            <TouchableOpacity onPress={() => openLegal("privacy")}>
              <Text style={styles.legalLinkText}>Kebijakan Privasi</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => openLegal("terms")}>
              <Text style={styles.legalLinkText}>Syarat & Ketentuan</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => openLegal("refund")}>
              <Text style={styles.legalLinkText}>Kebijakan Refund</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.copyright}>© 2026 Bocor Halus App. All rights reserved.</Text>
        </View>
      </ScrollView>

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

      {/* MODAL LEGALITAS */}
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
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    maxWidth: 480, // Mobile-first ideal reading width
    backgroundColor: C.cream,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* TOP BAR */
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: C.greenDark,
    letterSpacing: -0.5,
  },
  brandBadge: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  brandBadgeText: {
    color: C.greenDark,
    fontSize: 10,
    fontWeight: "800",
  },
  keyEntryBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  keyEntryBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
  },

  /* HERO */
  heroCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  eyebrowChip: {
    backgroundColor: C.creamDark,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  eyebrowChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: C.inkLight,
    letterSpacing: 0.3,
  },
  heroHeadline: {
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  heroBody: {
    fontSize: 13.5,
    color: C.inkLight,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroHighlight: {
    fontWeight: "800",
    color: C.greenDark,
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

  /* SIMULATOR */
  simCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  simHeader: {
    marginBottom: 12,
  },
  simHeaderTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
  },
  simHeaderSub: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  meterBox: {
    backgroundColor: "#F0FDF4",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 12,
  },
  meterTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meterLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 0.5,
  },
  meterStatus: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  meterStatusText: {
    color: C.greenDark,
    fontSize: 10,
    fontWeight: "800",
  },
  meterAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: C.greenDark,
    marginTop: 2,
  },
  meterDetails: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },
  inputCard: {
    backgroundColor: C.cream,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputCardLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 6,
  },
  formulaInput: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 8,
  },
  formulaResultBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 8,
  },
  formulaResultLabel: {
    fontSize: 12,
    color: C.muted,
    fontWeight: "600",
  },
  formulaResultValue: {
    fontSize: 14,
    fontWeight: "900",
    color: C.greenDark,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  presetChip: {
    backgroundColor: C.white,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.border,
  },
  presetChipText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.inkLight,
  },

  /* COMPARISON */
  sectionBox: {
    marginBottom: 16,
  },
  sectionHeaderTag: {
    fontSize: 10.5,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 14,
    lineHeight: 24,
  },
  compareStack: {
    gap: 12,
  },
  compareCardOld: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    opacity: 0.85,
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
  compareCardNew: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: C.greenDark,
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
  bold: {
    fontWeight: "800",
    color: C.ink,
  },

  /* PRICING */
  pricingCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    alignItems: "center",
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
  pricingPlanName: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    textAlign: "center",
  },
  pricingPlanSub: {
    fontSize: 12,
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
  priceBig: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  priceCur: {
    fontSize: 16,
    fontWeight: "800",
    color: C.greenDark,
  },
  priceNum: {
    fontSize: 38,
    fontWeight: "900",
    color: C.greenDark,
    letterSpacing: -1,
  },
  featureList: {
    width: "100%",
    gap: 8,
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
    fontSize: 14.5,
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

  /* FAQ */
  faqSection: {
    marginBottom: 20,
  },
  faqCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  faqQ: {
    fontSize: 13.5,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
  },
  faqA: {
    fontSize: 12,
    color: C.inkLight,
    lineHeight: 18,
  },

  /* FOOTER */
  mobileFooter: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 24,
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: "900",
    color: C.greenDark,
    marginBottom: 4,
  },
  footerTagline: {
    fontSize: 11.5,
    color: C.muted,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 16,
  },
  contactBox: {
    width: "100%",
    backgroundColor: C.creamDark,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  contactTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  contactItem: {
    fontSize: 12,
    color: C.inkLight,
    marginBottom: 4,
  },
  contactWa: {
    fontSize: 12.5,
    color: C.greenDark,
    fontWeight: "800",
    marginBottom: 4,
  },
  contactHours: {
    fontSize: 10.5,
    color: C.muted,
  },
  legalLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  legalLinkText: {
    fontSize: 11.5,
    color: C.inkLight,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  legalDot: {
    fontSize: 11,
    color: C.muted,
  },
  copyright: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
  },
});
