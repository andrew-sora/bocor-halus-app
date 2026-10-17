import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Expense, SavingGoal } from "@/lib/db";
import {
  listRecent,
  totalByMonth,
  totalByYear,
  getMicroExpensesSummary,
  listMicroExpenses,
  getBudgetLimit,
  setBudgetLimit,
  hasBudgetLimitSet,
  getMonthlyExtraBudget,
  getSavingGoals,
  saveSavingGoal,
  addSavingsDeposit,
  deleteSavingGoal,
} from "@/lib/db";
import { TotalCard } from "@/components/TotalCard";
import { SavingGoalCard } from "@/components/SavingGoalCard";
import { SavingGoalModal } from "@/components/SavingGoalModal";
import { ExpenseRow } from "@/components/ExpenseRow";
import { BudgetOnboardingModal } from "@/components/BudgetOnboardingModal";
import { MicroExpensesModal } from "@/components/MicroExpensesModal";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";
import { strings } from "@/constants/strings";
import { formatTanggalId, currentYearMonth, namaBulan } from "@/lib/date";
import { C } from "@/constants/Colors";

type Section = { title: string; data: Expense[] };

export default function BerandaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [yearlyTotal, setYearlyTotal] = useState(0);
  const [budgetLimit, setBudgetLimitState] = useState(3000000);
  const [extraBudget, setExtraBudget] = useState(0);
  const [microSummary, setMicroSummary] = useState({ total: 0, count: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMicroModal, setShowMicroModal] = useState(false);
  const [microExpensesList, setMicroExpensesList] = useState<Expense[]>([]);

  // Celengan Target State
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [showSavingModal, setShowSavingModal] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const ym = currentYearMonth();

  const load = useCallback(async () => {
    const [exps, mt, yt, micro, bLimit, hasLimit, extra, goals] = await Promise.all([
      listRecent(100),
      totalByMonth(ym),
      totalByYear(currentYear),
      getMicroExpensesSummary(ym),
      getBudgetLimit(),
      hasBudgetLimitSet(),
      getMonthlyExtraBudget(ym),
      getSavingGoals(),
    ]);
    setExpenses(exps);
    setMonthlyTotal(mt);
    setYearlyTotal(yt);
    setMicroSummary(micro);
    setBudgetLimitState(bLimit);
    setExtraBudget(extra);
    setSavingGoals(goals);
    if (goals.length > 0) {
      setActiveGoalId((prev) => prev ?? goals[0].id);
    }
    if (!hasLimit) {
      setShowOnboarding(true);
    }
  }, [ym, currentYear]);

  const handleSaveInitialBudget = async (newBudget: number) => {
    await setBudgetLimit(newBudget);
    setBudgetLimitState(newBudget);
    setShowOnboarding(false);
  };

  const handleOpenMicroModal = useCallback(async () => {
    const list = await listMicroExpenses(ym);
    setMicroExpensesList(list);
    setShowMicroModal(true);
  }, [ym]);

  const activeGoal = useMemo(() => {
    return savingGoals.find((g) => g.id === activeGoalId) || savingGoals[0] || null;
  }, [savingGoals, activeGoalId]);

  const handleQuickDeposit = async (amount: number) => {
    if (!activeGoal) {
      setShowSavingModal(true);
      return;
    }
    await addSavingsDeposit(activeGoal.id, amount);
    const updated = await getSavingGoals();
    setSavingGoals(updated);
  };

  const handleSaveGoal = async (data: {
    id?: string;
    title: string;
    targetAmount: number;
    emoji: string;
  }) => {
    const saved = await saveSavingGoal(data);
    const updated = await getSavingGoals();
    setSavingGoals(updated);
    setActiveGoalId(saved.id);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteSavingGoal(goalId);
    const updated = await getSavingGoals();
    setSavingGoals(updated);
    if (activeGoalId === goalId) {
      setActiveGoalId(updated[0]?.id || null);
    }
  };

  const handleDepositOrWithdraw = async (goalId: string, amount: number) => {
    await addSavingsDeposit(goalId, amount);
    const updated = await getSavingGoals();
    setSavingGoals(updated);
  };

  useFocusEffect(
    useCallback(() => {
      load().catch(console.error);
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load().catch(console.error);
    setRefreshing(false);
  }, [load]);

  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const exp of expenses) {
      const list = map.get(exp.spentAt) ?? [];
      list.push(exp);
      map.set(exp.spentAt, list);
    }
    return Array.from(map.entries()).map(([date, data]) => ({ title: date, data }));
  }, [expenses]);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.greenDark}
          />
        }
        ListHeaderComponent={
          <>
            <PwaInstallBanner />
            <TotalCard
              monthlyTotal={monthlyTotal}
              yearlyTotal={yearlyTotal}
              month={currentMonth}
              year={currentYear}
              budgetLimit={budgetLimit + extraBudget}
              extraBudget={extraBudget}
              microTotal={microSummary.total}
              microCount={microSummary.count}
              onPressMicroInsight={handleOpenMicroModal}
            />
            <SavingGoalCard
              goal={activeGoal}
              onQuickDeposit={handleQuickDeposit}
              onOpenManageModal={() => setShowSavingModal(true)}
              onCreateNewGoal={() => setShowSavingModal(true)}
            />
          </>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {formatTanggalId(section.title)}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <ExpenseRow
            expense={item}
            onPress={() =>
              router.push({ pathname: "/tambah", params: { id: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIconText}>📋</Text>
            </View>
            <Text style={styles.emptyTitle}>{strings.belumAdaData}</Text>
            <Text style={styles.emptySubtitle}>{strings.belumAdaDataDetail}</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      />

      <BudgetOnboardingModal
        visible={showOnboarding}
        onSave={handleSaveInitialBudget}
        onDismiss={() => handleSaveInitialBudget(3000000)}
      />

      <MicroExpensesModal
        visible={showMicroModal}
        onClose={() => setShowMicroModal(false)}
        monthName={namaBulan(currentMonth)}
        microTotal={microSummary.total}
        microCount={microSummary.count}
        expenses={microExpensesList}
        onSelectExpense={(id) => {
          setShowMicroModal(false);
          router.push({ pathname: "/tambah", params: { id } });
        }}
      />

      <SavingGoalModal
        visible={showSavingModal}
        onClose={() => setShowSavingModal(false)}
        goals={savingGoals}
        activeGoalId={activeGoal?.id || null}
        onSelectActiveGoal={(id) => {
          setActiveGoalId(id);
          setShowSavingModal(false);
        }}
        onSaveGoal={handleSaveGoal}
        onDeleteGoal={handleDeleteGoal}
        onDepositOrWithdraw={handleDepositOrWithdraw}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  sectionHeader: {
    backgroundColor: C.cream,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  emptyCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.cream,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyIconText: {
    fontSize: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
  },
});
