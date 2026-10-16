import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { C } from "../constants/Colors";

export type LegalTab = "privacy" | "terms" | "refund";

interface LegalModalProps {
  visible: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
  supportPhone?: string;
  supportEmail?: string;
}

export function LegalModal({
  visible,
  initialTab = "privacy",
  onClose,
  supportPhone = "0853-7331-3646",
  supportEmail = "andrewchivas.ar@gmail.com",
}: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brandTitle}>Bocor Halus</Text>
              <Text style={styles.headerSubtitle}>Informasi Legal & Ketentuan Penggunaan</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Tutup Modal"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "privacy" && styles.tabBtnActive]}
              onPress={() => setActiveTab("privacy")}
            >
              <Text style={[styles.tabText, activeTab === "privacy" && styles.tabTextActive]}>
                Kebijakan Privasi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "terms" && styles.tabBtnActive]}
              onPress={() => setActiveTab("terms")}
            >
              <Text style={[styles.tabText, activeTab === "terms" && styles.tabTextActive]}>
                Syarat & Ketentuan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === "refund" && styles.tabBtnActive]}
              onPress={() => setActiveTab("refund")}
            >
              <Text style={[styles.tabText, activeTab === "refund" && styles.tabTextActive]}>
                Kebijakan Refund
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Body */}
          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {activeTab === "privacy" && (
              <View>
                <Text style={styles.sectionHeading}>Kebijakan Privasi (Privacy Policy)</Text>
                <Text style={styles.dateLabel}>Pembaruan Terakhir: Oktober 2026</Text>

                <Text style={styles.paragraph}>
                  Bocor Halus berkomitmen penuh melindungi privasi keuangan pengguna. Kami merancang aplikasi ini dengan prinsip <Text style={styles.boldText}>Local-First & Zero-Knowledge Architecture</Text>, yang berarti data keuangan Anda adalah milik pribadi Anda seutuhnya.
                </Text>

                <Text style={styles.subHeading}>1. Penyimpanan Data 100% Lokal</Text>
                <Text style={styles.paragraph}>
                  Seluruh catatan belanjaan harian, rincian anggaran, kalkulasi "bocor halus", serta PIN keamanan hanya tersimpan secara lokal di perangkat Anda (menggunakan teknologi IndexedDB / SQLite lokal). Kami tidak mengunggah atau menyimpan catatan transaksi Anda ke server cloud eksternal manapun.
                </Text>

                <Text style={styles.subHeading}>2. Tanpa Pengumpulan Data Sensitif</Text>
                <Text style={styles.paragraph}>
                  Aplikasi tidak memerlukan registrasi akun, tidak meminta nomor kartu debit/kredit, rekening bank, maupun data kredensial finansial apapun.
                </Text>

                <Text style={styles.subHeading}>3. Verifikasi Lisensi</Text>
                <Text style={styles.paragraph}>
                  Pengecekan kode lisensi dilakukan secara offline dengan algoritma matematis terenkripsi di sisi klien (client-side checksum validation), sehingga identitas penggunaan tetap terlindungi dan anonim.
                </Text>

                <Text style={styles.subHeading}>4. Kendali Penuh Pengguna</Text>
                <Text style={styles.paragraph}>
                  Pengguna memiliki wewenang penuh untuk mereset atau menghapus seluruh catatan transaksi kapan saja melalui menu Pengaturan di aplikasi.
                </Text>
              </View>
            )}

            {activeTab === "terms" && (
              <View>
                <Text style={styles.sectionHeading}>Syarat & Ketentuan Layanan (Terms)</Text>
                <Text style={styles.dateLabel}>Pembaruan Terakhir: Oktober 2026</Text>

                <Text style={styles.paragraph}>
                  Dengan membeli lisensi dan/atau menggunakan aplikasi web Bocor Halus, Anda menyetujui ketentuan berikut:
                </Text>

                <Text style={styles.subHeading}>1. Lisensi Akses Seumur Hidup (Lifetime License)</Text>
                <Text style={styles.paragraph}>
                  Satu kode lisensi memberikan hak akses penuh seumur hidup untuk penggunaan personal pada perangkat Anda. Tidak ada pungutan biaya langganan bulanan maupun tahunan tersembunyi.
                </Text>

                <Text style={styles.subHeading}>2. Penggunaan yang Wajar</Text>
                <Text style={styles.paragraph}>
                  Kode lisensi ditujukan untuk pemakaian pribadi atau keluarga inti dan tidak diperkenankan untuk diperjualbelikan kembali (resale) secara massal tanpa persetujuan resmi dari pihak pengembang.
                </Text>

                <Text style={styles.subHeading}>3. Pembaruan & Fitur</Text>
                <Text style={styles.paragraph}>
                  Pemegang lisensi berhak mendapatkan pembaruan aplikasi, perbaikan performa, dan fitur-fitur baru secara gratis selama siklus hidup produk.
                </Text>

                <Text style={styles.subHeading}>4. Batasan Tanggung Jawab</Text>
                <Text style={styles.paragraph}>
                  Bocor Halus adalah perangkat lunak bantu pencatat anggaran mandiri. Keputusan alokasi keuangan rumah tangga tetap menjadi tanggung jawab pribadi masing-masing pengguna.
                </Text>
              </View>
            )}

            {activeTab === "refund" && (
              <View>
                <Text style={styles.sectionHeading}>Kebijakan Garansi & Pengembalian Dana</Text>
                <Text style={styles.dateLabel}>Pembaruan Terakhir: Oktober 2026</Text>

                <Text style={styles.paragraph}>
                  Kami menjamin setiap transaksi lisensi Bocor Halus aman, transparan, dan dapat dipertanggungjawabkan:
                </Text>

                <Text style={styles.subHeading}>1. Garansi Aktivasi 100% Valid</Text>
                <Text style={styles.paragraph}>
                  Setiap kode lisensi yang diterbitkan melalui saluran pembayaran resmi telah melalui uji matematis sistem. Apabila Anda mengalami kendala aktivasi, tim Customer Service kami siap membantu atau memberikan kode pengganti instan dalam waktu maksimal 1x24 jam kerja.
                </Text>

                <Text style={styles.subHeading}>2. Syarat Pengembalian Dana (Refund)</Text>
                <Text style={styles.paragraph}>
                  Karena produk ini berbentuk software/lisensi digital instan, pengembalian dana penuh (100% Refund) berlaku apabila:
                </Text>
                <Text style={styles.bulletItem}>• Kode lisensi yang Anda terima tidak dapat diaktivasi dan tim kami gagal menyelesaikan kendala tersebut dalam 3x24 jam.</Text>
                <Text style={styles.bulletItem}>• Terjadi transaksi ganda (terdebet dua kali) untuk pembelian satu lisensi.</Text>

                <Text style={styles.subHeading}>3. Saluran Bantuan Pelanggan</Text>
                <Text style={styles.paragraph}>
                  Untuk klaim garansi, pertanyaan lisensi, atau kendala aktivasi, silakan hubungi tim kami via:
                </Text>
                <Text style={styles.contactItem}>• Email: {supportEmail}</Text>
                <Text style={styles.contactItem}>• WhatsApp CS: {supportPhone}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Close */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.understandBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.understandBtnText}>Saya Mengerti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: C.white,
    borderRadius: 20,
    width: "100%",
    maxWidth: 620,
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.greenDark,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.creamDark,
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: C.inkLight,
    fontWeight: "600",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: C.cream,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginRight: 6,
  },
  tabBtnActive: {
    borderBottomColor: C.greenDark,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.muted,
  },
  tabTextActive: {
    color: C.greenDark,
    fontWeight: "700",
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: C.ink,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  dateLabel: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 16,
    fontWeight: "500",
  },
  subHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13.5,
    lineHeight: 21,
    color: C.inkLight,
    marginBottom: 10,
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 20,
    color: C.inkLight,
    paddingLeft: 8,
    marginBottom: 6,
  },
  contactItem: {
    fontSize: 13.5,
    lineHeight: 22,
    color: C.greenDark,
    fontWeight: "600",
    marginTop: 4,
  },
  boldText: {
    fontWeight: "700",
    color: C.ink,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.cream,
    alignItems: "flex-end",
  },
  understandBtn: {
    backgroundColor: C.greenDark,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  understandBtnText: {
    color: C.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
