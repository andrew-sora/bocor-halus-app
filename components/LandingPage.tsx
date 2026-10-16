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

  // State untuk mini interactive calculator demo di Hero
  const [simFormula, setSimFormula] = useState("25000 + 15000 + 8000");
  const [simNote, setSimNote] = useState("Belanja Sayur, Telur & Bumbu Pasar");

  // Hitung total simulasi sederhana
  const calculateSimTotal = (formula: string): number => {
    try {
      const clean = formula.replace(/[^\d+*.-]/g, "");
      const parts = clean.split("+").map((p) => parseInt(p.trim(), 10) || 0);
      return parts.reduce((a, b) => a + b, 0);
    } catch {
      return 48000;
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
      "Halo Tim Bocor Halus, saya ingin bertanya seputar lisensi dan fitur aplikasi:"
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
    <ScrollView style={styles.pageOuter} contentContainerStyle={styles.pageContainer}>
      {/* 1. TOP NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <Text style={styles.brandName}>Bocor Halus</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>Pencatat Belanja Harian</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.navSecondaryBtn}
          onPress={() => setShowLicenseModal(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Masukkan Kode Lisensi"
        >
          <Text style={styles.navSecondaryText}>Punya Kode? Buka App</Text>
        </TouchableOpacity>
      </View>

      {/* 2. HERO SECTION */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.heroEyebrow}>
            <Text style={styles.eyebrowText}>BEBAS LANGGANAN BULANAN • 100% PRIVAT DI HP ANDA</Text>
          </View>

          <Text style={styles.heroHeadline}>
            Gaji Baru Masuk, Tapi Akhir Bulan Bingung Uang Belanja Habis ke Mana?
          </Text>

          <Text style={styles.heroSubheadline}>
            Itu namanya <Text style={styles.highlightText}>"Bocor Halus"</Text> — pengeluaran kecil Rp 5.000, jajan kopi, parkir, dan ongkir yang tak pernah tercatat. Bocor Halus hadir sebagai pencatat keuangan rumah tangga yang anti ribet: buka langsung ketik layaknya kalkulator belanjaan.
          </Text>

          {/* CTA Group */}
          <View style={styles.heroCtaGroup}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={handleOpenBuy}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Beli Akses Seumur Hidup Rp 15.000"
            >
              <Text style={styles.heroPrimaryBtnText}>Beli Akses Seumur Hidup — Rp 15.000</Text>
              <Text style={styles.heroPrimarySubtext}>Sekali Bayar • Miliki Selamanya Tanpa Langganan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => setShowLicenseModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroSecondaryBtnText}>Sudah Memiliki Lisensi? Masukkan Kode</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. INTERACTIVE PRODUCT SHOWCASE (REAL INTERFACE DEMO, NO SLOP) */}
        <View style={styles.demoCardWrapper}>
          <View style={styles.demoHeader}>
            <View style={styles.demoDots}>
              <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
              <View style={[styles.dot, { backgroundColor: "#F59E0B" }]} />
              <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
            </View>
            <Text style={styles.demoTitle}>Simulasi Nyata Cara Kerja Aplikasi</Text>
          </View>

          <View style={styles.demoBody}>
            {/* Sisa Jatah Belanja Card */}
            <View style={styles.budgetGaugeCard}>
              <View style={styles.gaugeRow}>
                <View>
                  <Text style={styles.gaugeLabel}>SISA JATAH BELANJA HARI INI</Text>
                  <Text style={styles.gaugeValue}>Rp {remainingBudget.toLocaleString("id-ID")}</Text>
                </View>
                <View style={styles.gaugeStatusBadge}>
                  <Text style={styles.gaugeStatusText}>Aman</Text>
                </View>
              </View>
              <Text style={styles.gaugeSub}>Batas harian: Rp {dailyBudget.toLocaleString("id-ID")} • Terpakai: Rp {simTotal.toLocaleString("id-ID")}</Text>
            </View>

            {/* Smart Calculator Input Box */}
            <View style={styles.calcBox}>
              <Text style={styles.calcBoxLabel}>Ketik formula belanja pasar langsung:</Text>
              
              <View style={styles.calcInputRow}>
                <TextInput
                  style={styles.calcInput}
                  value={simFormula}
                  onChangeText={setSimFormula}
                  placeholder="misal: 15000 + 25000 + 8000"
                  placeholderTextColor={C.muted}
                />
              </View>

              <View style={styles.calcResultRow}>
                <Text style={styles.calcResultLabel}>Hasil Perhitungan:</Text>
                <Text style={styles.calcResultAmount}>Rp {simTotal.toLocaleString("id-ID")}</Text>
              </View>

              {/* Preset Buttons for Quick Demo */}
              <View style={styles.presetButtonsRow}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    setSimFormula("15000 + 35000 + 12000");
                    setSimNote("Belanja Sayur, Daging & Cabai");
                  }}
                >
                  <Text style={styles.presetChipText}>🛒 Belanja Pasar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    setSimFormula("18000 + 22000 + 5000");
                    setSimNote("Jajan Kopi & Gorengan Sore");
                  }}
                >
                  <Text style={styles.presetChipText}>☕ Jajan Sore</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    setSimFormula("45000 + 15000");
                    setSimNote("Susu Bayi & Popok Minimarket");
                  }}
                >
                  <Text style={styles.presetChipText}>🍼 Kebutuhan Anak</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.calcFootnote}>
                ✨ Tidak perlu buka kalkulator terpisah. Tulis pengeluaran belanja seperti mencatat di kertas, sistem menghitung otomatis!
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 4. REALITY CHECK: MENGAPA BUKAN EXCEL ATAU APLIKASI BIASA */}
      <View style={styles.comparisonSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTag}>PERBANDINGAN JUJUR</Text>
          <Text style={styles.sectionTitle}>Kenapa Mencatat Keuangan Sering Gagal?</Text>
          <Text style={styles.sectionSubtitle}>
            Karena aplikasi di luar sana terlalu rumit, minta login akun, atau menuntut isi form panjang setiap kali cuma beli jajan Rp 5.000.
          </Text>
        </View>

        <View style={styles.comparisonGrid}>
          {/* Card Aplikasi Lain */}
          <View style={styles.comparisonCardOld}>
            <Text style={styles.cardHeaderOld}>Aplikasi Keuangan Biasa & Excel</Text>
            <View style={styles.compItem}>
              <Text style={styles.compCross}>✕</Text>
              <Text style={styles.compTextOld}>Harus daftar akun, isi email, nomor HP, & ingat password.</Text>
            </View>
            <View style={styles.compItem}>
              <Text style={styles.compCross}>✕</Text>
              <Text style={styles.compTextOld}>Buka kalkulator terpisah dulu sebelum bisa input angka belanjaan.</Text>
            </View>
            <View style={styles.compItem}>
              <Text style={styles.compCross}>✕</Text>
              <Text style={styles.compTextOld}>Data keuangan pribadi Anda disimpan di server cloud pihak lain.</Text>
            </View>
            <View style={styles.compItem}>
              <Text style={styles.compCross}>✕</Text>
              <Text style={styles.compTextOld}>Model langganan bulanan mahal yang terus memotong saldo rekening.</Text>
            </View>
          </View>

          {/* Card Bocor Halus */}
          <View style={styles.comparisonCardNew}>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>Solusi Bocor Halus</Text>
            </View>
            <Text style={styles.cardHeaderNew}>Pencatat Keuangan Paling Sederhana</Text>
            
            <View style={styles.compItem}>
              <Text style={styles.compCheck}>✓</Text>
              <Text style={styles.compTextNew}><Text style={styles.boldText}>Tanpa Akun & Tanpa Login:</Text> Buka aplikasi langsung ketik pengeluaran seketika.</Text>
            </View>
            <View style={styles.compItem}>
              <Text style={styles.compCheck}>✓</Text>
              <Text style={styles.compTextNew}><Text style={styles.boldText}>Smart Formula Input:</Text> Ketik hitungan pasar langsung (misal: 15.000 + 35.000).</Text>
            </View>
            <View style={styles.compItem}>
              <Text style={styles.compCheck}>✓</Text>
              <Text style={styles.compTextNew}><Text style={styles.boldText}>100% Privat di HP:</Text> Data tersimpan di perangkat lokal Anda, nol risiko bocor.</Text>
            </View>
            <View style={styles.compItem}>
              <Text style={styles.compCheck}>✓</Text>
              <Text style={styles.compTextNew}><Text style={styles.boldText}>Beli Sekali Rp 15.000:</Text> Miliki seumur hidup tanpa tagihan per bulan selamanya.</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 5. PRICING & OFFER SECTION (TRANSPARAN UNTUK PENGGUNA & VERIFIKASI DUITKU) */}
      <View style={styles.pricingSection}>
        <View style={styles.pricingCard}>
          <View style={styles.pricingTop}>
            <View style={styles.pricePill}>
              <Text style={styles.pricePillText}>AKSES PENUH SEUMUR HIDUP</Text>
            </View>
            <Text style={styles.pricingTitle}>Investasi Sekali, Tenang Selamanya</Text>
            <Text style={styles.pricingDesc}>
              Bebaskan diri dari stres keuangan rumah tangga dengan alat yang praktis dan tidak merepotkan.
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.priceOriginal}>Rp 50.000</Text>
              <View style={styles.priceMainRow}>
                <Text style={styles.currencySymbol}>Rp</Text>
                <Text style={styles.priceFigure}>15.000</Text>
                <Text style={styles.priceType}>/ sekali bayar</Text>
              </View>
            </View>
          </View>

          <View style={styles.pricingFeatures}>
            <Text style={styles.featureTitle}>Apa Saja yang Anda Dapatkan?</Text>
            <Text style={styles.featureItem}>✓ 1 Kode Lisensi Digital Akses Selamanya</Text>
            <Text style={styles.featureItem}>✓ Smart Calculator Belanjaan Langsung</Text>
            <Text style={styles.featureItem}>✓ Pengatur Batas Sisa Jatah Belanja Harian</Text>
            <Text style={styles.featureItem}>✓ Rekap Bulanan Otomatis & Grafik Pengeluaran</Text>
            <Text style={styles.featureItem}>✓ Kunci Keamanan Tambahan dengan PIN Pribadi</Text>
            <Text style={styles.featureItem}>✓ Bisa dipasang di Homescreen Android & iPhone (PWA)</Text>
            <Text style={styles.featureItem}>✓ Pembaruan Fitur Berkala Tanpa Biaya Tambahan</Text>
          </View>

          <TouchableOpacity
            style={styles.pricingBuyBtn}
            onPress={handleOpenBuy}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Beli Lisensi Sekarang Rp 15.000"
          >
            <Text style={styles.pricingBuyBtnText}>Beli Lisensi Sekarang (Rp 15.000)</Text>
          </TouchableOpacity>

          <View style={styles.paymentInfoRow}>
            <Text style={styles.paymentMethodLabel}>
              Pembayaran Didukung: QRIS (BCA, Mandiri, BRI, GoPay, OVO, Dana, ShopeePay) & Transfer Bank
            </Text>
            <Text style={styles.paymentInstantLabel}>
              ⚡ Kode lisensi langsung diberikan otomatis di layar setelah pembayaran berhasil.
            </Text>
          </View>
        </View>
      </View>

      {/* 6. FAQ (PERTANYAAN SERING DIAJUKAN) */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTag}>TANYA JAWAB</Text>
        <Text style={styles.sectionTitle}>Pertanyaan yang Sering Ditanyakan</Text>

        <View style={styles.faqList}>
          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Apakah ada biaya langganan bulanan?</Text>
            <Text style={styles.faqAnswer}>
              Sama sekali tidak ada. Pembayaran Rp 15.000 adalah untuk akses seumur hidup (pay once, own forever). Tidak ada pemotongan saldo berkala.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Bagaimana cara mengaktifkan setelah membeli?</Text>
            <Text style={styles.faqAnswer}>
              Setelah pembayaran berhasil, Anda akan menerima 1 kode lisensi (contoh: BH-46LC-P9HY). Cukup buka web ini, klik tombol "Punya Kode? Buka App", masukkan kodenya, dan aplikasi langsung aktif selamanya.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <Text style={styles.faqQuestion}>Apakah data keuangan saya aman?</Text>
            <Text style={styles.faqAnswer}>
              Sangat aman. Aplikasi tidak memerlukan registrasi akun dan tidak mengirimkan catatan keuangan Anda ke server cloud eksternal. Semua data tersimpan 100% di browser/perangkat Anda sendiri.
            </Text>
          </View>
        </View>
      </View>

      {/* 7. FOOTER & LEGALITAS (SYARAT KYC DUITKU & TRUST) */}
      <View style={styles.footer}>
        <View style={styles.footerMain}>
          <View style={styles.footerColBrand}>
            <Text style={styles.footerBrandName}>Bocor Halus</Text>
            <Text style={styles.footerBrandDesc}>
              Aplikasi web pencatat keuangan rumah tangga dan pengeluaran harian anti ribet. Dikembangkan oleh Sora Dev (Andrew Chivas Arsenal Rico).
            </Text>
            <Text style={styles.footerCopyright}>
              © 2026 Bocor Halus App. Hak cipta dilindungi undang-undang.
            </Text>
          </View>

          <View style={styles.footerColContact}>
            <Text style={styles.footerColTitle}>Layanan Pelanggan & Bantuan</Text>
            <Text style={styles.footerContactItem}>Email: {supportEmail}</Text>
            <TouchableOpacity onPress={handleOpenWhatsApp} activeOpacity={0.7}>
              <Text style={styles.footerWaLink}>💬 WhatsApp CS: {supportPhone}</Text>
            </TouchableOpacity>
            <Text style={styles.footerHours}>Jam Operasional: Senin – Sabtu, 08:00 – 21:00 WIB</Text>
          </View>

          <View style={styles.footerColLegal}>
            <Text style={styles.footerColTitle}>Informasi Legal & Kebijakan</Text>
            <TouchableOpacity onPress={() => openLegal("privacy")}>
              <Text style={styles.legalLink}>• Kebijakan Privasi (Privacy Policy)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLegal("terms")}>
              <Text style={styles.legalLink}>• Syarat & Ketentuan Layanan (Terms)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openLegal("refund")}>
              <Text style={styles.legalLink}>• Kebijakan Pengembalian Dana (Refund)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MODAL POPUPS */}
      <LicenseGateModal
        visible={showLicenseModal}
        onActivated={() => {
          setShowLicenseModal(false);
          onActivated();
        }}
        checkoutUrl={checkoutUrl}
        onClose={() => setShowLicenseModal(false)}
      />

      <LegalModal
        visible={legalModalVisible}
        initialTab={legalTab}
        onClose={() => setLegalModalVisible(false)}
        supportPhone={supportPhone}
        supportEmail={supportEmail}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageOuter: {
    flex: 1,
    backgroundColor: C.cream,
  },
  pageContainer: {
    paddingBottom: 40,
  },
  /* NAVBAR */
  navbar: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  navBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandName: {
    fontSize: 20,
    fontWeight: "900",
    color: C.greenDark,
    letterSpacing: -0.5,
  },
  badgePill: {
    backgroundColor: C.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: C.greenDark,
    fontSize: 11,
    fontWeight: "700",
  },
  navSecondaryBtn: {
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  navSecondaryText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: "700",
  },

  /* HERO */
  heroSection: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 48,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 40,
  },
  heroContent: {
    flex: 1,
    minWidth: 320,
    maxWidth: 580,
  },
  heroEyebrow: {
    backgroundColor: C.creamDark,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  eyebrowText: {
    color: C.inkLight,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroHeadline: {
    fontSize: Platform.OS === "web" ? 38 : 28,
    fontWeight: "900",
    color: C.ink,
    lineHeight: Platform.OS === "web" ? 48 : 36,
    letterSpacing: -0.8,
    marginBottom: 16,
  },
  heroSubheadline: {
    fontSize: 16,
    color: C.inkLight,
    lineHeight: 25,
    marginBottom: 28,
  },
  highlightText: {
    fontWeight: "800",
    color: C.greenDark,
  },
  heroCtaGroup: {
    gap: 12,
  },
  heroPrimaryBtn: {
    backgroundColor: C.greenDark,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  heroPrimaryBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  heroPrimarySubtext: {
    color: "#A7F3D0",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "500",
  },
  heroSecondaryBtn: {
    backgroundColor: C.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  heroSecondaryBtnText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "700",
  },

  /* INTERACTIVE DEMO CARD */
  demoCardWrapper: {
    flex: 1,
    minWidth: 320,
    maxWidth: 440,
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    overflow: "hidden",
  },
  demoHeader: {
    backgroundColor: C.creamDark,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  demoDots: {
    flexDirection: "row",
    gap: 6,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.inkLight,
  },
  demoBody: {
    padding: 20,
    gap: 16,
  },
  budgetGaugeCard: {
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  gaugeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 0.5,
  },
  gaugeValue: {
    fontSize: 24,
    fontWeight: "900",
    color: C.greenDark,
    marginTop: 2,
  },
  gaugeStatusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gaugeStatusText: {
    color: C.greenDark,
    fontSize: 11,
    fontWeight: "800",
  },
  gaugeSub: {
    fontSize: 11,
    color: C.muted,
    marginTop: 6,
  },
  calcBox: {
    backgroundColor: C.cream,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  calcBoxLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 8,
  },
  calcInputRow: {
    marginBottom: 10,
  },
  calcInput: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: "700",
    color: C.ink,
  },
  calcResultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2DDD6",
    marginBottom: 12,
  },
  calcResultLabel: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "600",
  },
  calcResultAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: C.greenDark,
  },
  presetButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  presetChip: {
    backgroundColor: C.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.inkLight,
  },
  calcFootnote: {
    fontSize: 11,
    color: C.muted,
    lineHeight: 16,
    fontStyle: "italic",
  },

  /* COMPARISON SECTION */
  comparisonSection: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  sectionHeader: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 36,
  },
  sectionTag: {
    fontSize: 12,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: 1,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: Platform.OS === "web" ? 30 : 24,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 15,
    color: C.muted,
    maxWidth: 620,
    textAlign: "center",
    lineHeight: 22,
  },
  comparisonGrid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: 20,
  },
  comparisonCardOld: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    opacity: 0.9,
  },
  cardHeaderOld: {
    fontSize: 16,
    fontWeight: "800",
    color: C.muted,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  comparisonCardNew: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: C.greenDark,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  newBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  newBadgeText: {
    color: C.greenDark,
    fontSize: 11,
    fontWeight: "800",
  },
  cardHeaderNew: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  compItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  compCross: {
    color: C.danger,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  compCheck: {
    color: C.greenDark,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
  },
  compTextOld: {
    flex: 1,
    fontSize: 13.5,
    color: C.muted,
    lineHeight: 20,
  },
  compTextNew: {
    flex: 1,
    fontSize: 14,
    color: C.inkLight,
    lineHeight: 21,
  },
  boldText: {
    fontWeight: "700",
    color: C.ink,
  },

  /* PRICING */
  pricingSection: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  pricingCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: Platform.OS === "web" ? 36 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  pricingTop: {
    alignItems: "center",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 24,
    marginBottom: 24,
  },
  pricePill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  pricePillText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  pricingDesc: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    maxWidth: 500,
    marginBottom: 20,
  },
  priceContainer: {
    alignItems: "center",
  },
  priceOriginal: {
    fontSize: 14,
    color: C.muted,
    textDecorationLine: "line-through",
  },
  priceMainRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "800",
    color: C.greenDark,
  },
  priceFigure: {
    fontSize: 48,
    fontWeight: "900",
    color: C.greenDark,
    letterSpacing: -1,
  },
  priceType: {
    fontSize: 13,
    color: C.muted,
    fontWeight: "600",
  },
  pricingFeatures: {
    gap: 10,
    marginBottom: 28,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 6,
  },
  featureItem: {
    fontSize: 13.5,
    color: C.inkLight,
    lineHeight: 20,
  },
  pricingBuyBtn: {
    backgroundColor: C.greenDark,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  pricingBuyBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: "800",
  },
  paymentInfoRow: {
    alignItems: "center",
    gap: 4,
  },
  paymentMethodLabel: {
    fontSize: 11.5,
    color: C.muted,
    textAlign: "center",
  },
  paymentInstantLabel: {
    fontSize: 11.5,
    color: C.greenDark,
    fontWeight: "700",
    textAlign: "center",
  },

  /* FAQ */
  faqSection: {
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  faqList: {
    marginTop: 20,
    gap: 14,
  },
  faqCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13.5,
    color: C.inkLight,
    lineHeight: 20,
  },

  /* FOOTER */
  footer: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.creamDark,
    paddingTop: 40,
    paddingBottom: 20,
    marginTop: 30,
  },
  footerMain: {
    maxWidth: 1100,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 20,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 30,
  },
  footerColBrand: {
    flex: 1.2,
    minWidth: 260,
  },
  footerBrandName: {
    fontSize: 18,
    fontWeight: "900",
    color: C.greenDark,
    marginBottom: 8,
  },
  footerBrandDesc: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 19,
    marginBottom: 14,
  },
  footerCopyright: {
    fontSize: 11.5,
    color: C.muted,
  },
  footerColContact: {
    flex: 1,
    minWidth: 240,
  },
  footerColTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  footerContactItem: {
    fontSize: 13,
    color: C.inkLight,
    marginBottom: 6,
  },
  footerWaLink: {
    fontSize: 13,
    color: C.greenDark,
    fontWeight: "700",
    marginBottom: 6,
  },
  footerHours: {
    fontSize: 11.5,
    color: C.muted,
    marginTop: 4,
  },
  footerColLegal: {
    flex: 1,
    minWidth: 220,
  },
  legalLink: {
    fontSize: 13,
    color: C.inkLight,
    marginBottom: 8,
    fontWeight: "500",
  },
});
