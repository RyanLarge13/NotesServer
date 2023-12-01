class Validator {
  validateHtml(html) {
    return { valid: true };
  }
  validateString(text) {
    if (typeof text !== string) {
      return { valid: false, text: text };
    }
    return { valid: true };
  }
  validateId(id) {
    if (typeof id !== Number) {
      return { valid: false, text: id };
    }
    return { valid: true };
  }
  validateArray(arr) {
    const allValidInputs = arr.every((bool) => bool.valid === true);
    if (!allValidInputs) {
      const invalidData = arr
        .map((obj) => (obj.valid === false ? obj.text : undefined))
        .find((text) => text !== undefined);
      return { valid: false, data: invalidData };
    }
    return { valid: true };
  }
}

export default Validator;
