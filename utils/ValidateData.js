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
        error: `Something suspicious was found in your note, please update your note to try and fix the problem`,
      };
    }
  }

  validateUsername(username) {
    if (typeof username !== string) {
      const type = typeof username;
      return {
        valid: false,
        text: username,
        error: `A username must be a string not a ${type}, please correct this issue before creating your new note`,
      };
    }
    if (username.length > 20) {
      return {
        valid: false,
        text: username,
        error: `Your password must be more than 8 characters and less then 20, your password was ${username.length} characters long`,
      };
    }
    if (username.length < 4) {
      return {
        valid: false,
        text: username,
        error: `Your password must be more than 8 characters and less then 20, your password was ${username.length} characters long`,
      };
    }
    return {valid: true} 
  }

  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!isValid) {
      const type = typeof email;
      return {
        valid: false,
        text: email,
        error: `Please input a valid email address`,
      };
    }
    return { valid: true };
  }

  validatePassword(password) {
    if (typeof password !== string) {
      const type = typeof password;
      return {
        valid: false,
        text: password,
        error: `Your password must be a string of text, your password is a ${type}`,
      };
    }
    if (password.length < 8) {
      return {
        valid: false,
        text: password,
        error: `Your password must be at least 8 characters long, you only input ${password.length} characters`,
      };
    }
    const passwordRegex =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?!.*(.).*\1).*$/;
    if (!passwordRegex.test(password)) {
      return {
        valid: false,
        text: password,
        error: `Your password must contain at least |||1. One lowercase character |||2. One uppercase character |||3. One special character |||4. One number |||5. And be at least 8 characters long`,
      };
    }
    return { valid: true };
  }

  validateString(text) {
    if (typeof text !== string) {
      const type = typeof string;
      return {
        valid: false,
        text: text,
        error: `This value must be a string  of text and instead you input a ${type}`,
      };
    }
    return { valid: true };
  }

  validateId(id) {
    if (typeof id !== Number) {
      const type = typeof id;
      return {
        valid: false,
        text: id,
        error: `Your ID must be a number and instead you input a ${type}`,
      };
    }
    return { valid: true };
  }

  validateArray(arr) {
    const allValidInputs = arr.every((bool) => bool.valid === true);
    if (!allValidInputs) {
      const invalidData = arr
        .map((obj) => (obj.valid === false ? obj : undefined))
        .find((obj) => obj !== undefined);
      return { valid: false, data: invalidData.text, error: invalidData.error };
    }
    return { valid: true };
  }
}

export default Validator;
