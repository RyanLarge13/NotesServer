import JSDOM from "jsdom";

class Validator {
  validateHtml(html) {
    try {
      new JSDOM(html);
      return { valid: true };
    } catch (err) {
      console.log(`Error in validating html: ${err}`);
      return {
        valid: false,
        text: html,
        type: "Invalid notes",
        validType: "Please edit your notes",
      };
    }
  }

  validateUsername(username) {
    if (typeof username !== string) {
      const type = typeof username;
      return { valid: false, text: username, type: type, validType: "string" };
    }
    if (username.length > 20) {
      return { valid: false, text: username, type: null, validType: null };
    }
    if (username.length < 4) {
      return { valid: false, text: username, type: null, validType: null };
    }
  }

  validateEmail() {}

  validatePassword() {}

  validateString(text) {
    if (typeof text !== string) {
      const type = typeof string;
      return { valid: false, text: text, type: type, validType: "string" };
    }
    return { valid: true };
  }

  validateId(id) {
    if (typeof id !== Number) {
      const type = typeof id;
      return { valid: false, text: id, type: type, validType: "number" };
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
