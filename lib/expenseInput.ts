// lib/expenseInput.ts
// Helper fungsi murni untuk manipulasi string input dan kursor kalkulator

export function addPresetAmount(current: string, amount: number): string {
  if (!current.trim()) {
    return String(amount);
  }
  return `${current}+${amount}`;
}

export function insertChar(
  current: string,
  char: string,
  selStart: number,
  selEnd: number
): { newValue: string; newPos: number } {
  const before = current.slice(0, selStart);
  const after = current.slice(selEnd);
  const newValue = before + char + after;
  const newPos = selStart + char.length;
  return { newValue, newPos };
}

export function backspaceChar(
  current: string,
  selStart: number,
  selEnd: number
): { newValue: string; newPos: number } {
  if (selStart !== selEnd) {
    const before = current.slice(0, selStart);
    const after = current.slice(selEnd);
    return { newValue: before + after, newPos: selStart };
  }
  if (selStart > 0) {
    const before = current.slice(0, selStart - 1);
    const after = current.slice(selStart);
    return { newValue: before + after, newPos: before.length };
  }
  return { newValue: current, newPos: 0 };
}
