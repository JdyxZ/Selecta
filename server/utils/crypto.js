/***************** PASSWORK SECURITY AND CHECKINGS *****************/

const bcrypt = require('bcryptjs');

const CRYPTO =
{
    main_regex: /(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&\.\*])[A-Za-z\d@$!%*#?&\.\*]{8,}/,
    length_regex: /.{8,}/,
    lowercase_regex: /[a-z]+/,
    uppercase_regex: /[A-Z]+/,
    digits_regex: /\d+/,
    special_characters_regex: /[@$!%*#?&\.\*]+/,
    negative_regex: /(?![A-Za-z\d@$!%*#?&\.\*]).+/,

    check: function(password)
    {
        if(!this.length_regex.test(password)) return ["ERROR", "Password must contain at least 8 characters"];
        if(!this.lowercase_regex.test(password)) return ["ERROR", "Password must contain at least one lowercase letter"];
        if(!this.uppercase_regex.test(password)) return ["ERROR", "Password must contain at least one uppercase letter"];
        if(!this.digits_regex.test(password)) return ["ERROR", "Password must contain at least one digit"];
        if(!this.special_characters_regex.test(password)) return ["ERROR", "Password must contain at least one special character ('@', '$', '!', '%', '*', '#', '?', '&', '.', '*')"];
        if(this.negative_regex.test(password)) return ["ERROR", "Password contains not allowed characters"];
        if(this.main_regex.test(password)) return ["OK", "Password is correct"];
        
        return ["ERROR", "ERROR: Try with a different password"];
    },
    
    encrypt: async function(password)
    {
        // const salt = await bcrypt.genSalt(10);
        const salt = "$2a$10$lrXlguYU3Bg5TlgsgcgugO";
        const hashed_password = await bcrypt.hash(password, salt);
        return hashed_password;
    },

    match: async function(password, hashed_password)
    {
        const result = await bcrypt.compare(password, hashed_password);
        return result;
    }
}

module.exports = CRYPTO;