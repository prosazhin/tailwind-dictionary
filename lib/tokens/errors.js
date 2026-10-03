// Общий модуль: одинаковый в tailwind-dictionary/lib/tokens и mixin-dictionary/lib/tokens.
// Меняешь здесь — скопируй в другой пакет.

// Ошибка во входных данных (конфиг, токены). CLI печатает её одной строкой, без стектрейса.
class DictionaryError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DictionaryError';
    this.isDictionaryError = true;
  }
}

export { DictionaryError };
