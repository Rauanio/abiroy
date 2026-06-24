// Маска телефона: поле хранит 10 цифр после префикса +7 (например +7 705 707 78 60).
// Если вставили код страны (7 или 8) — отбрасываем его.
document.querySelectorAll('input[type="tel"]').forEach((input) => {
  const format = (value) => {
    let digits = value.replace(/\D/g, "");
    if (digits.length > 10 && (digits[0] === "7" || digits[0] === "8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)]
      .filter(Boolean)
      .join(" ");
  };

  input.addEventListener("input", () => {
    input.value = format(input.value);
  });
});
