let current   = "0";
let previous  = null;
let operator  = null;
let overwrite = false;

let lastOperator = null; // son yapılan operator 
let lastOperand  = null; // son kullanılan ikinci sayı 

const displayEl = document.getElementById("display");

function updateDisplay() {
  displayEl.textContent = current;
}

function inputDigit(d) {
  if (overwrite) {
    current = String(d);
    overwrite = false;
  } else if (current === "0") {
    current = String(d);   
  } else {
    current += String(d);  
  }
  updateDisplay();
}

function inputDot() {
  if (overwrite) {
    current = "0.";
    overwrite = false;
    return updateDisplay();
  }
  if (!current.includes(".")) {
    current += ".";
    updateDisplay();
  }
}

function toggleSign() {
  if (current === "0") return;
  if (current.startsWith("-")) current = current.slice(1);
  else current = "-" + current;
  updateDisplay();
}

function percent() {
  const n = parseFloat(current);
  current = String(n / 100);
  updateDisplay();
}

function del() {
  if (overwrite) {
    current = "0";
    overwrite = false;
    return updateDisplay();
  }
  if (current.length <= 1 || (current.length === 2 && current.startsWith("-"))) {
    current = "0";
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay();
}


function clearAll() {
  current   = "0";
  previous  = null;
  operator  = null;
  overwrite = false;
  lastOperator = null;
  lastOperand  = null;
  updateDisplay();
}


function compute(a, b, op) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? "Error" : a / b;
    default:  return a;
  }
}

// Operatör seçildiğinde
function setOperator(op) {
  // Sonuçtan hemen sonra aynı operatöre basılırsa (örn: 2+2=4, sonra + => 6)
  if (overwrite && lastOperator === op && lastOperand !== null) {
    const a = parseFloat(current);
    const result = compute(a, lastOperand, op);

    current = String(trimResult(result));
    updateDisplay();

    previous  = parseFloat(current); // yeni previous: çıkan sonuç
    operator  = op;                  // aynı operatörle zincire devam
    // overwrite true kalsın: yeni digit gelirse ekran sıfırlansın
    return;
  }

  // Zincirleme hesap: 8 + 2 + 3 gibi; arada '=' yoksa önce mevcutu hesaplama
  if (operator && previous !== null && !overwrite) {
    evaluate();
  }

  operator  = op;
  previous  = parseFloat(current);
  overwrite = true; // bir sonraki digit yeni sayı başlatması
}

// Eşittir
function evaluate() {
  // Normal durum: operator + previous var
  if (operator !== null && previous !== null && !overwrite) {
    const a = previous;
    const b = parseFloat(current);
    const result = compute(a, b, operator);

    // "=" tekrarı ve "aynı operatörle devam" için kaydet
    lastOperator = operator;
    lastOperand  = b;

    current   = String(trimResult(result));
    previous  = null;
    operator  = null;
    overwrite = true;
    return updateDisplay();
  }

  // "=" tekrarı: (ör. 2+2= -> 4, "=" -> 6, "=" -> 8)
  if (operator === null && lastOperator && lastOperand !== null) {
    const a = parseFloat(current);
    const result = compute(a, lastOperand, lastOperator);

    current   = String(trimResult(result));
    overwrite = true;
    return updateDisplay();
  }
}

// Ondalık hataları düzelt
function trimResult(num) {
  if (typeof num !== "number" || !isFinite(num)) return num;
  return parseFloat(num.toFixed(10));
}

// --- Click events  ---
document.querySelector(".keys").addEventListener("click", (e) => {
  const t = e.target;
  if (!t || t.tagName !== "BUTTON") return;

  if (t.dataset.digit) return inputDigit(t.dataset.digit);
  if (t.dataset.dot)   return inputDot();
  if (t.dataset.op)    return setOperator(t.dataset.op);

  switch (t.dataset.action) {
    case "clear":   return clearAll();
    case "sign":    return toggleSign();
    case "percent": return percent();
    case "del":     return del();
    case "equal":   return evaluate();
  }
});

window.addEventListener("keydown", (e) => {
  const { key } = e;
  if (/\d/.test(key)) return inputDigit(key);
  if (key === "." || key === ",") return inputDot();
  if (["+", "-", "*", "/"].includes(key)) return setOperator(key);
  if (key === "Enter" || key === "=") return evaluate();
  if (key === "Backspace") return del();
  if (key === "Escape") return clearAll();
});


updateDisplay();
