import React, { Component, ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { C } from "@/constants/Colors";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Unhandled Error Boundary catch:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Terjadi Kesalahan Aplikasi</Text>
          <Text style={styles.subtitle}>
            Aplikasi mengalami kendala yang tidak terduga.
          </Text>
          {this.state.error?.message ? (
            <Text style={styles.errMsg}>{this.state.error.message}</Text>
          ) : null}
          <Pressable style={styles.btn} onPress={this.handleReset}>
            <Text style={styles.btnText}>Muat Ulang Tampilan</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.cream,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
    textAlign: "center",
  },
  errMsg: {
    fontSize: 12,
    color: C.danger,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
  },
  btn: {
    backgroundColor: C.greenDark,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
