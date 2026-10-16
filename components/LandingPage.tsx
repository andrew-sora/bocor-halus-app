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
  useWindowDimensions,
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
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;
  const isNarrowMobile = windowWidth < 380;

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>("privacy");

  // State simulasi interaktif kalkulator belanjaan asli Bocor Halus
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
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. RESPONSIVE TOP APP BAR */}
        <View style={[styles.topBar, isDesktop && styles.topBarDesktop]}>
          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Bocor Halus</Text>
            {/* Sembunyikan badge panjang di layar HP sempit agar tombol aktivasi tidak terpotong */}
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

        {/* 2. RESPONSIVE HERO SECTION */}
        <View style={[styles.heroContainer, isDesktop && styles.heroContainerDesktop]}>
          {/* Kolom Kiri / Teks Utama */}
          <View style={[styles.heroTextCol, isDesktop && styles.heroTextColDesktop]}>
            <View style={styles.eyebrowChip}>
              <Text style={styles.eyebrowChipText}>
                BEBAS LANGGANAN BULANAN • 100% PRIVAT DI HP ANDA
              </Text>
            </View>

            {/* Headline Wajib yang Dipertahankan */}
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

          {/* Kolom Kanan / Preview UI Produk Autentik */}
          <View style={[styles.heroPreviewCol, isDesktop && styles.heroPreviewColDesktop]}>
            <View style={styles.appCardPreview}>
              {/* Card Header Simulasi UI Nyata */}
              <View style={styles.previewHeader}>
                <View style={styles.previewDotRow}>
                  <View style={[styles.previewDot, { backgroundColor: "#EF4444" }]} />
                  <View style={[styles.previewDot, { backgroundColor: "#F59E0B" }]} />
                  <View style={[styles.previewDot, { backgroundColor: "#10B981" }]} />
                </View>
                <Text style={styles.previewHeaderLabel}>Tampilan Nyata Aplikasi</Text>
              </View>

              {/* Komponen TotalCard Asli: Sisa Jatah Belanja */}
              <View style={styles.totalCardMock}>
                <View style={styles.totalCardTop}>
                  <View>
                    <Text style={styles.totalCardSubLabel}>SISA JATAH BELANJA HARI INI</Text>
                    <Text style={styles.totalCardAmount}>
                      Rp {remainingBudget.toLocaleString("id-ID")}
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>Optimal / Aman</Text>
                  </View>
                </View>
                {/* Progress Bar Sisa Jatah */}
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, Math.round((simTotal / dailyBudget) * 100))}%` },
                    ]}
                  />
                </View>
                <Text style={styles.totalCardDetails}>
                  Batas Harian: Rp {dailyBudget.toLocaleString("id-ID")} • Terpakai: Rp {simTotal.toLocaleString("id-ID")}
                </Text>
              </View>

              {/* Komponen Input Kalkulator Nyata (Fitur Inti Aplikasi) */}
              <View style={styles.calcWidget}>
                <Text style={styles.calcWidgetLabel}>Smart Kalkulator Belanja Pasar:</Text>
                <TextInput
                  style={styles.calcWidgetInput}
                  value={simFormula}
                  onChangeText={setSimFormula}
                  placeholder="15000 + 35000 + 8000"
                  placeholderTextColor={C.muted}
                />

                <View style={styles.calcWidgetResultRow}>
                  <Text style={styles.calcWidgetResultLabel}>Hasil Perhitungan Langsung:</Text>
                  <Text style={styles.calcWidgetResultValue}>Rp {simTotal.toLocaleString("id-ID")}</Text>
                </View>

                {/* Preset Tombol Belanja Cepat */}
                <View style={styles.presetChipRow}>
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => setSimFormula("15000 + 35000 + 8000")}
                  >
                    <Text style={styles.presetChipText}>Sayur & Ayam</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => setSimFormula("18000 + 5000 + 4000")}
                  >
                    <Text style={styles.presetChipText}>Kopi & Jajan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => setSimFormula("45000 + 12000")}
                  >
                    <Text style={styles.presetChipText}>Popok & Susu</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Item Transaksi Terakhir Nyata */}
              <View style={styles.recentSampleBox}>
                <Text style={styles.recentSampleTitle}>Contoh Transaksi Tersimpan:</Text>
                <View style={styles.sampleRow}>
                  <View style={styles.sampleCol}>
                    <Text style={styles.sampleCategory}>Belanja Dapur</Text>
                    <Text style={styles.sampleExpr}>15.000 + 35.000 + 8.000</Text>
                  </View>
                  <Text style={styles.sampleAmount}>Rp 58.000</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. PERBANDINGAN JUJUR (REALITY CHECK) */}
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
              <Text style={styles.compareItemOld}>• Data keuangan disimpan di server cloud luar</Text>
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

        {/* 5. FAQ (PERTANYAAN UMUM & TRANSPARANSI DATA) */}
        <View style={[styles.faqContainer, isDesktop && styles.faqContainerDesktop]}>
          <Text style={styles.sectionEyebrow}>TANYA JAWAB</Text>
          <Text style={[styles.sectionHeading, isDesktop && styles.sectionHeadingDesktop]}>
            Pertanyaan yang Sering Ditanyakan
          </Text>

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
                Setelah pembayaran berhasil, Anda akan menerima 1 kode lisensi (contoh: BH-46LC-P9HY). Buka web ini, klik tombol "Masukkan Kode", masukkan kodenya, dan aplikasi langsung aktif selamanya.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Apakah data keuangan saya aman dan tetap ada setelah browser ditutup?</Text>
              <Text style={styles.faqAnswer}>
                Data transaksi disimpan secara lokal di memori browser/perangkat Anda (Local Storage / SQLite lokal), bukan di server luar. Data tetap tersimpan aman saat browser ditutup atau direfresh. Anda juga dapat mencadangkan (export backup) data kapan saja di menu Pengaturan.
              </Text>
            </View>

            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Bagaimana jika saya ganti HP atau menghapus data browser?</Text>
              <Text style={styles.faqAnswer}>
                Cukup simpan kode lisensi Anda. Kode tersebut dapat dimasukkan kembali di perangkat baru kapan saja untuk membuka akses penuh.
              </Text>
            </View>
          </View>
        </View>

        {/* 6. FOOTER RESMI & LEGALITAS (SYARAT KYC DUITKU) */}
        <View style={styles.footerSection}>
          <View style={[styles.footerContent, isDesktop && styles.footerContentDesktop]}>
            {/* Kolom 1: Brand & Info */}
            <View style={[styles.footerCol, isDesktop && styles.footerColDesktop]}>
              <Text style={styles.footerBrand}>Bocor Halus</Text>
              <Text style={styles.footerTagline}>
                Aplikasi web pencatat keuangan rumah tangga dan pengeluaran harian anti ribet. Dikembangkan oleh Sora Dev (Andrew Chivas Arsenal Rico).
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
    paddingBottom: 40,
    maxWidth: 540,
    alignSelf: "center",
    width: "100%",
  },
  scrollContentDesktop: {
    maxWidth: 1080,
    paddingHorizontal: 32,
    paddingTop: 20,
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
    marginBottom: 12,
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
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    color: C.greenDark,
    fontSize: 10.5,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#DCFCE7",
    borderRadius: 3,
    marginVertical: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: C.greenLight,
    borderRadius: 3,
  },
  totalCardDetails: {
    fontSize: 11,
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
    fontSize: 14,
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
    fontSize: 13.5,
    fontWeight: "900",
    color: C.greenDark,
  },
  presetChipRow: {
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

  /* RECENT SAMPLE BOX */
  recentSampleBox: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
  },
  recentSampleTitle: {
    fontSize: 10.5,
    fontWeight: "700",
    color: C.muted,
    marginBottom: 6,
  },
  sampleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.cream,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  sampleEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  sampleCol: {
    flex: 1,
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
    fontSize: 12.5,
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

  /* FAQ */
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
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  faqQuestion: {
    fontSize: 13.5,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 12,
    color: C.inkLight,
    lineHeight: 18,
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
});
