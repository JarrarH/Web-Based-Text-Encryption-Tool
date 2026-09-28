// =========================================================
// CRYPTOLAB SERVER
// Web-Based Text Encryption & Authentication
// =========================================================

const express =
    require("express");

const session =
    require("express-session");

const bcrypt =
    require("bcryptjs");

const crypto =
    require("crypto");

const fs =
    require("fs");

const path =
    require("path");


const app =
    express();


const PORT =
    process.env.PORT || 3000;


// =========================================================
// STORAGE
// =========================================================

const storageDir =
    path.join(
        __dirname,
        "storage"
    );


const usersFile =
    path.join(
        storageDir,
        "users.json"
    );


const messagesFile =
    path.join(
        storageDir,
        "messages.json"
    );


function ensureStorage() {

    if (
        !fs.existsSync(
            storageDir
        )
    ) {

        fs.mkdirSync(
            storageDir,
            {
                recursive:
                    true
            }
        );
    }


    if (
        !fs.existsSync(
            usersFile
        )
    ) {

        fs.writeFileSync(
            usersFile,
            "[]",
            "utf8"
        );
    }


    if (
        !fs.existsSync(
            messagesFile
        )
    ) {

        fs.writeFileSync(
            messagesFile,
            "[]",
            "utf8"
        );
    }
}


ensureStorage();


// =========================================================
// JSON HELPERS
// =========================================================

function readJson(
    filePath
) {

    try {

        return JSON.parse(
            fs.readFileSync(
                filePath,
                "utf8"
            )
        );

    } catch (
        error
    ) {

        console.error(
            "JSON read error:",
            error
        );

        return [];
    }
}


function writeJson(
    filePath,
    data
) {

    fs.writeFileSync(
        filePath,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );
}


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(
    express.json({
        limit:
            "1mb"
    })
);


// IMPORTANT:
// Block storage BEFORE static serving.
app.use(
    "/storage",
    (_req, res) => {

        return res
            .status(403)
            .json({

                success:
                    false,

                message:
                    "Direct storage access is not allowed."
            });
    }
);


// Serve HTML/CSS/JS
app.use(
    express.static(
        __dirname,
        {
            index:
                false
        }
    )
);


// Sessions
app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
            "cryptolab-local-session-secret-change-me",

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            httpOnly:
                true,

            sameSite:
                "lax",

            secure:
                false,

            maxAge:
                1000 *
                60 *
                60 *
                4
        }

    })
);


// =========================================================
// CRYPTO FUNCTIONS
// =========================================================


// -----------------------------
// Caesar Cipher
// -----------------------------

function caesarEncrypt(
    text,
    shift
) {

    return text

        .split("")

        .map(
            (char) => {

                if (
                    char >= "A" &&
                    char <= "Z"
                ) {

                    return String.fromCharCode(

                        (
                            (
                                char.charCodeAt(0)
                                -
                                65
                                +
                                shift
                            )
                            %
                            26
                            +
                            26
                        )
                        %
                        26
                        +
                        65
                    );
                }


                if (
                    char >= "a" &&
                    char <= "z"
                ) {

                    return String.fromCharCode(

                        (
                            (
                                char.charCodeAt(0)
                                -
                                97
                                +
                                shift
                            )
                            %
                            26
                            +
                            26
                        )
                        %
                        26
                        +
                        97
                    );
                }


                return char;
            }
        )

        .join("");
}


function caesarDecrypt(
    text,
    shift
) {

    return caesarEncrypt(
        text,
        -shift
    );
}


// -----------------------------
// Base64
// -----------------------------

function base64Encrypt(
    text
) {

    return Buffer
        .from(
            text,
            "utf8"
        )
        .toString(
            "base64"
        );
}


function base64Decrypt(
    text
) {

    const value =
        text.trim();


    const regex =
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;


    if (
        !regex.test(
            value
        )
    ) {

        throw new Error(
            "Invalid Base64 ciphertext."
        );
    }


    return Buffer
        .from(
            value,
            "base64"
        )
        .toString(
            "utf8"
        );
}


// -----------------------------
// AES-256-CBC
// -----------------------------

function createAESKey(
    password
) {

    return crypto

        .createHash(
            "sha256"
        )

        .update(
            password,
            "utf8"
        )

        .digest();
}


function aesEncrypt(
    text,
    password
) {

    if (
        typeof password !==
            "string"
        ||
        !password.trim()
    ) {

        throw new Error(
            "AES-256 requires a secret key."
        );
    }


    const key =
        createAESKey(
            password
        );


    const iv =
        crypto.randomBytes(
            16
        );


    const cipher =
        crypto.createCipheriv(
            "aes-256-cbc",
            key,
            iv
        );


    let encrypted =
        cipher.update(
            text,
            "utf8",
            "hex"
        );


    encrypted +=
        cipher.final(
            "hex"
        );


    return (
        `${iv.toString(
            "hex"
        )}:${encrypted}`
    );
}


function aesDecrypt(
    data,
    password
) {

    if (
        typeof password !==
            "string"
        ||
        !password.trim()
    ) {

        throw new Error(
            "AES-256 requires a secret key."
        );
    }


    const parts =
        data
            .trim()
            .split(":");


    if (
        parts.length !==
        2
    ) {

        throw new Error(
            "Invalid AES ciphertext format."
        );
    }


    const ivHex =
        parts[0];


    const cipherHex =
        parts[1];


    if (
        !/^[0-9a-fA-F]{32}$/
            .test(ivHex)
    ) {

        throw new Error(
            "Invalid AES initialization vector."
        );
    }


    if (
        !cipherHex
        ||
        !/^[0-9a-fA-F]+$/
            .test(cipherHex)
        ||
        cipherHex.length %
            32 !==
            0
    ) {

        throw new Error(
            "Invalid AES ciphertext."
        );
    }


    const key =
        createAESKey(
            password
        );


    const iv =
        Buffer.from(
            ivHex,
            "hex"
        );


    const decipher =
        crypto.createDecipheriv(
            "aes-256-cbc",
            key,
            iv
        );


    let decrypted =
        decipher.update(
            cipherHex,
            "hex",
            "utf8"
        );


    decrypted +=
        decipher.final(
            "utf8"
        );


    return decrypted;
}


// -----------------------------
// SHA-256
// -----------------------------

function sha256(
    text
) {

    return crypto

        .createHash(
            "sha256"
        )

        .update(
            text,
            "utf8"
        )

        .digest(
            "hex"
        );
}


// =========================================================
// AUTH HELPERS
// =========================================================

function requireLogin(
    req,
    res,
    next
) {

    if (
        !req.session ||
        !req.session.userId
    ) {

        return res
            .status(401)
            .json({

                success:
                    false,

                message:
                    "Please login first."
            });
    }


    next();
}


function publicUser(
    user
) {

    return {

        id:
            user.id,

        name:
            user.name,

        email:
            user.email
    };
}


// =========================================================
// REGISTER
// =========================================================

app.post(
    "/api/auth/register",

    async (
        req,
        res
    ) => {

        try {

            const {
                name,
                email,
                password
            } =
                req.body;


            if (
                typeof name !==
                    "string"
                ||
                !name.trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please enter your name."
                    });
            }


            if (
                typeof email !==
                    "string"
                ||
                !email.trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please enter your email."
                    });
            }


            if (
                typeof password !==
                    "string"
                ||
                password.length <
                    6
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Password must contain at least 6 characters."
                    });
            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const users =
                readJson(
                    usersFile
                );


            const exists =
                users.some(
                    (user) =>
                        user.email ===
                        normalizedEmail
                );


            if (
                exists
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "An account with this email already exists."
                    });
            }


            const passwordHash =
                await bcrypt.hash(
                    password,
                    12
                );


            const user = {

                id:
                    crypto.randomUUID(),

                name:
                    name.trim(),

                email:
                    normalizedEmail,

                passwordHash,

                createdAt:
                    new Date()
                        .toISOString()
            };


            users.push(
                user
            );


            writeJson(
                usersFile,
                users
            );


            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Account created successfully."
                });

        } catch (
            error
        ) {

            console.error(
                "Register error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Registration failed."
                });
        }
    }
);


// =========================================================
// LOGIN
// =========================================================

app.post(
    "/api/auth/login",

    async (
        req,
        res
    ) => {

        try {

            const {
                email,
                password
            } =
                req.body;


            if (
                typeof email !==
                    "string"
                ||
                !email.trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please enter your email."
                    });
            }


            if (
                typeof password !==
                    "string"
                ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please enter your password."
                    });
            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const users =
                readJson(
                    usersFile
                );


            const user =
                users.find(
                    (item) =>
                        item.email ===
                        normalizedEmail
                );


            if (
                !user
            ) {

                return res
                    .status(401)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid email or password."
                    });
            }


            const matches =
                await bcrypt.compare(
                    password,
                    user.passwordHash
                );


            if (
                !matches
            ) {

                return res
                    .status(401)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid email or password."
                    });
            }


            req.session.userId =
                user.id;


            return res.json({

                success:
                    true,

                message:
                    "Login successful.",

                user:
                    publicUser(
                        user
                    )
            });

        } catch (
            error
        ) {

            console.error(
                "Login error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Login failed."
                });
        }
    }
);


// =========================================================
// CURRENT USER
// =========================================================

app.get(
    "/api/auth/me",

    (
        req,
        res
    ) => {

        if (
            !req.session ||
            !req.session.userId
        ) {

            return res.json({

                success:
                    true,

                loggedIn:
                    false
            });
        }


        const users =
            readJson(
                usersFile
            );


        const user =
            users.find(
                (item) =>
                    item.id ===
                    req.session.userId
            );


        if (
            !user
        ) {

            req.session.destroy(
                () => {}
            );


            return res.json({

                success:
                    true,

                loggedIn:
                    false
            });
        }


        return res.json({

            success:
                true,

            loggedIn:
                true,

            user:
                publicUser(
                    user
                )
        });
    }
);


// =========================================================
// LOGOUT
// =========================================================

app.post(
    "/api/auth/logout",

    (
        req,
        res
    ) => {

        req.session.destroy(
            (error) => {

                if (
                    error
                ) {

                    return res
                        .status(500)
                        .json({

                            success:
                                false,

                            message:
                                "Logout failed."
                        });
                }


                res.clearCookie(
                    "connect.sid"
                );


                return res.json({

                    success:
                        true,

                    message:
                        "Logged out successfully."
                });
            }
        );
    }
);


// =========================================================
// ENCRYPT API
// =========================================================

app.post(
    "/api/encrypt",

    (
        req,
        res
    ) => {

        try {

            const {
                text,
                algorithm,
                key
            } =
                req.body;


            if (
                typeof text !==
                    "string"
                ||
                !text.trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please enter some text first."
                    });
            }


            if (
                typeof algorithm !==
                    "string"
                ||
                !algorithm
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please select an encryption algorithm."
                    });
            }


            let result;


            switch (
                algorithm
            ) {


                case "caesar": {

                    if (
                        typeof key !==
                            "string"
                        ||
                        !key.trim()
                        ||
                        !Number.isInteger(
                            Number(key)
                        )
                    ) {

                        return res
                            .status(400)
                            .json({

                                success:
                                    false,

                                message:
                                    "Caesar Cipher requires an integer shift."
                            });
                    }


                    result =
                        caesarEncrypt(
                            text,
                            Number(key)
                        );


                    break;
                }


                case "aes": {

                    result =
                        aesEncrypt(
                            text,
                            key
                        );


                    break;
                }


                case "base64": {

                    result =
                        base64Encrypt(
                            text
                        );


                    break;
                }


                case "sha256": {

                    result =
                        sha256(
                            text
                        );


                    break;
                }


                default: {

                    return res
                        .status(400)
                        .json({

                            success:
                                false,

                            message:
                                "Invalid encryption algorithm selected."
                        });
                }
            }


            return res.json({

                success:
                    true,

                algorithm,

                result
            });

        } catch (
            error
        ) {

            console.error(
                "Encryption error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        error.message ||
                        "Encryption failed."
                });
        }
    }
);


// =========================================================
// DECRYPT API
// =========================================================

app.post(
    "/api/decrypt",

    (
        req,
        res
    ) => {

        try {

            const {
                text,
                algorithm,
                key
            } =
                req.body;


            if (
                typeof text !==
                    "string"
                ||
                !text.trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please enter ciphertext first."
                    });
            }


            if (
                typeof algorithm !==
                    "string"
                ||
                !algorithm
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please select an encryption algorithm."
                    });
            }


            if (
                algorithm ===
                "sha256"
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "SHA-256 is a one-way hash and cannot be decrypted."
                    });
            }


            let result;


            switch (
                algorithm
            ) {


                case "caesar": {

                    if (
                        typeof key !==
                            "string"
                        ||
                        !key.trim()
                        ||
                        !Number.isInteger(
                            Number(key)
                        )
                    ) {

                        return res
                            .status(400)
                            .json({

                                success:
                                    false,

                                message:
                                    "Caesar Cipher requires an integer shift."
                            });
                    }


                    result =
                        caesarDecrypt(
                            text,
                            Number(key)
                        );


                    break;
                }


                case "aes": {

                    result =
                        aesDecrypt(
                            text,
                            key
                        );


                    break;
                }


                case "base64": {

                    result =
                        base64Decrypt(
                            text
                        );


                    break;
                }


                default: {

                    return res
                        .status(400)
                        .json({

                            success:
                                false,

                            message:
                                "Invalid encryption algorithm selected."
                        });
                }
            }


            return res.json({

                success:
                    true,

                algorithm,

                result
            });

        } catch (
            error
        ) {

            console.error(
                "Decryption error:",
                error
            );


            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Decryption failed. Check the ciphertext and secret key."
                });
        }
    }
);


// =========================================================
// SAVE MESSAGE
// =========================================================

app.post(
    "/api/messages",

    requireLogin,

    (
        req,
        res
    ) => {

        try {

            const {
                title,
                algorithm,
                ciphertext
            } =
                req.body;


            if (
                typeof algorithm !==
                    "string"
                ||
                !algorithm
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Algorithm is required."
                    });
            }


            if (
                typeof ciphertext !==
                    "string"
                ||
                !ciphertext
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Result is required."
                    });
            }


            const messages =
                readJson(
                    messagesFile
                );


            const saved = {

                id:
                    crypto.randomUUID(),

                userId:
                    req.session.userId,

                title:
                    typeof title ===
                        "string"
                    &&
                    title.trim()
                        ? title.trim()
                        : "Untitled Result",

                algorithm,

                ciphertext,

                createdAt:
                    new Date()
                        .toISOString()
            };


            messages.push(
                saved
            );


            writeJson(
                messagesFile,
                messages
            );


            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Result saved successfully.",

                    savedMessage:
                        saved
                });

        } catch (
            error
        ) {

            console.error(
                "Save error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to save result."
                });
        }
    }
);


// =========================================================
// LOAD SAVED MESSAGES
// =========================================================

app.get(
    "/api/messages",

    requireLogin,

    (
        req,
        res
    ) => {

        try {

            const messages =
                readJson(
                    messagesFile
                )
                .filter(
                    (item) =>
                        item.userId ===
                        req.session.userId
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.createdAt
                        )
                        -
                        new Date(
                            a.createdAt
                        )
                );


            return res.json({

                success:
                    true,

                messages
            });

        } catch (
            error
        ) {

            console.error(
                "Load messages error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to load saved results."
                });
        }
    }
);


// =========================================================
// DELETE SAVED MESSAGE
// =========================================================

app.delete(
    "/api/messages/:id",

    requireLogin,

    (
        req,
        res
    ) => {

        try {

            const messages =
                readJson(
                    messagesFile
                );


            const exists =
                messages.some(
                    (item) =>
                        item.id ===
                        req.params.id
                        &&
                        item.userId ===
                        req.session.userId
                );


            if (
                !exists
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Saved result not found."
                    });
            }


            const updated =
                messages.filter(
                    (item) =>
                        !(
                            item.id ===
                                req.params.id
                            &&
                            item.userId ===
                                req.session.userId
                        )
                );


            writeJson(
                messagesFile,
                updated
            );


            return res.json({

                success:
                    true,

                message:
                    "Saved result deleted."
            });

        } catch (
            error
        ) {

            console.error(
                "Delete error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to delete result."
                });
        }
    }
);


// =========================================================
// HOME
// =========================================================

app.get(
    "/",

    (
        _req,
        res
    ) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );
    }
);


// =========================================================
// START SERVER
// =========================================================

app.listen(
    PORT,

    () => {

        console.log(
            `CRYPTOLAB server running at http://localhost:${PORT}`
        );
    }
);