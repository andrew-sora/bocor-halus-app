// lib/evalExpr.ts
// Evaluasi ekspresi kalkulator format angka Indonesia (titik = ribuan, koma = desimal)
// DILARANG menggunakan eval() atau new Function()

export function evalExpr(input: string): number | null {
  const s = input
    .replace(/\s/g, "")
    .replace(/[x×]/gi, "*")
    .replace(/[÷:]/g, "/");
  if (!s || !/^[\d.,+\-*/()]+$/.test(s)) return null;

  const tokens = s.match(/\d+(?:\.\d{3})*(?:,\d+)?|[+\-*/()]/g);
  if (!tokens || tokens.join("") !== s) return null; // ada karakter yang lolos tokenisasi

  let i = 0;
  const toNum = (t: string) => parseFloat(t.replace(/\./g, "").replace(",", "."));

  const expr = (): number => {
    let v = term();
    while (tokens[i] === "+" || tokens[i] === "-") {
      const op = tokens[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const term = (): number => {
    let v = factor();
    while (tokens[i] === "*" || tokens[i] === "/") {
      const op = tokens[i++];
      const r = factor();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  };
  const factor = (): number => {
    const t = tokens[i++];
    if (t === "-") return -factor();
    if (t === "(") {
      const v = expr();
      if (tokens[i++] !== ")") throw new Error("paren");
      return v;
    }
    if (!t || !/^\d/.test(t)) throw new Error("token");
    return toNum(t);
  };

  try {
    const v = expr();
    return i === tokens.length && Number.isFinite(v) ? Math.round(v) : null;
  } catch {
    return null;
  }
}
