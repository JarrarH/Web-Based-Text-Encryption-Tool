// =========================================================
// CRYPTOLAB
// Frontend Application
// =========================================================


const $ = (id) =>
    document.getElementById(id);


// =========================================================
// ELEMENTS
// =========================================================

const plainText = $("plainText");
const algorithm = $("algorithm");
const secretKey = $("secretKey");

const encryptBtn = $("encryptBtn");
const decryptBtn = $("decryptBtn");

const cipherText = $("cipherText");

const copyBtn = $("copyBtn");
const downloadBtn = $("downloadBtn");
const clearBtn = $("clearBtn");

const message = $("message");

const keyTitle = $("keyTitle");
const keyStatus = $("keyStatus");
const keyHelp = $("keyHelp");

const charCount = $("charCount");
const wordCount = $("wordCount");

const outputLength = $("outputLength");
const formatInfo = $("formatInfo");

const algorithmInfo = $("algorithmInfo");
const operationStatus = $("operationStatus");
const analysisKeyStatus = $("analysisKeyStatus");
const analysisFormat = $("analysisFormat");

const keyStrengthContainer =
    $("keyStrengthContainer");

const keyStrengthText =
    $("keyStrengthText");

const keyStrengthBar =
    $("keyStrengthBar");

const keyRules =
    $("keyRules");

const caesarVisualizer =
    $("caesarVisualizer");

const originalAlphabet =
    $("originalAlphabet");

const shiftedAlphabet =
    $("shiftedAlphabet");

const caesarExample =
    $("caesarExample");

const saveSection =
    $("saveSection");

const saveTitle =
    $("saveTitle");

const saveBtn =
    $("saveBtn");

const savedSection =
    $("savedSection");

const savedMessages =
    $("savedMessages");

const refreshSavedBtn =
    $("refreshSavedBtn");

const operationHistory =
    $("operationHistory");

const clearHistoryBtn =
    $("clearHistoryBtn");


// =========================================================
// AUTH ELEMENTS
// =========================================================

const authBtn =
    $("authBtn");

const userPanel =
    $("userPanel");

const userName =
    $("userName");

const logoutBtn =
    $("logoutBtn");

const authModal =
    $("authModal");

const closeAuthBtn =
    $("closeAuthBtn");

const loginTab =
    $("loginTab");

const registerTab =
    $("registerTab");

const loginForm =
    $("loginForm");

const registerForm =
    $("registerForm");

const loginEmail =
    $("loginEmail");

const loginPassword =
    $("loginPassword");

const registerName =
    $("registerName");

const registerEmail =
    $("registerEmail");

const registerPassword =
    $("registerPassword");

const authMessage =
    $("authMessage");


const algorithmCards =
    document.querySelectorAll(
        ".algorithm-card"
    );


// =========================================================
// STATE
// =========================================================

let currentUser = null;

let history =
    JSON.parse(
        localStorage.getItem(
            "cryptolabHistory"
        ) || "[]"
    );


// =========================================================
// ALGORITHM INFORMATION
// =========================================================

const algorithms = {

    caesar: {

        name:
            "Caesar Cipher",

        needsKey:
            true,

        keyTitle:
            "Shift Value",

        placeholder:
            "Enter shift number, e.g. 3",

        help:
            "Caesar Cipher requires an integer shift such as 3.",

        format:
            "Text",

        encryptLabel:
            "Encrypt Text",

        decryptLabel:
            "Decrypt Text"
    },


    aes: {

        name:
            "AES-256",

        needsKey:
            true,

        keyTitle:
            "Secret Key",

        placeholder:
            "Enter a secret key",

        help:
            "AES-256 requires a secret key for encryption and decryption.",

        format:
            "Hex + IV",

        encryptLabel:
            "Encrypt Text",

        decryptLabel:
            "Decrypt Text"
    },


    base64: {

        name:
            "Base64",

        needsKey:
            false,

        keyTitle:
            "Secret Key / Shift",

        placeholder:
            "No key required",

        help:
            "Base64 is encoding and does not require a key.",

        format:
            "Base64",

        encryptLabel:
            "Encode Text",

        decryptLabel:
            "Decode Text"
    },


    sha256: {

        name:
            "SHA-256",

        needsKey:
            false,

        keyTitle:
            "Secret Key / Shift",

        placeholder:
            "No key required",

        help:
            "SHA-256 is a one-way hash and cannot be decrypted.",

        format:
            "64-Character Hex",

        encryptLabel:
            "Generate Hash",

        decryptLabel:
            "Cannot Decrypt"
    }
};


// =========================================================
// MESSAGE HELPERS
// =========================================================

function showMessage(
    text,
    type = "error"
) {

    message.classList.remove(
        "visible"
    );

    void message.offsetWidth;

    message.textContent =
        text;

    message.style.color =
        type === "success"
            ? "#4ade80"
            : "#ef6262";

    message.classList.add(
        "visible"
    );
}


function clearMessage() {

    message.textContent = "";

    message.classList.remove(
        "visible"
    );
}


// =========================================================
// TEXT STATS
// =========================================================

function updateStats() {

    const text =
        plainText.value;

    charCount.textContent =
        text.length;


    if (
        !text.trim()
    ) {

        wordCount.textContent =
            "0";

    } else {

        wordCount.textContent =
            text
                .trim()
                .split(/\s+/)
                .length;
    }


    outputLength.textContent =
        cipherText.value.length;


    const data =
        algorithms[
            algorithm.value
        ];


    if (
        data &&
        cipherText.value
    ) {

        formatInfo.textContent =
            `Format: ${data.format}`;

    } else {

        formatInfo.textContent =
            "Format: —";
    }
}


// =========================================================
// ACTIVE ALGORITHM CARD
// =========================================================

function updateCards() {

    algorithmCards.forEach(
        (card) => {

            card.classList.toggle(
                "active",

                card.dataset.algorithm ===
                    algorithm.value
            );
        }
    );
}


// =========================================================
// KEY STRENGTH
// =========================================================

function updateKeyStrength() {

    if (
        algorithm.value !==
        "aes"
    ) {

        keyStrengthContainer.classList.add(
            "hidden"
        );

        return;
    }


    keyStrengthContainer.classList.remove(
        "hidden"
    );


    const key =
        secretKey.value;


    if (
        !key
    ) {

        keyStrengthText.textContent =
            "No key";

        keyStrengthBar.style.width =
            "0%";

        keyRules.textContent =
            "Enter a secret key.";

        return;
    }


    let score =
        0;

    const rules =
        [];


    if (
        key.length >= 8
    ) {

        score +=
            20;

        rules.push(
            "Length ✓"
        );

    } else {

        rules.push(
            "Length ✗"
        );
    }


    if (
        key.length >= 12
    ) {

        score +=
            20;
    }


    if (
        /[A-Z]/.test(key)
    ) {

        score +=
            15;

        rules.push(
            "Uppercase ✓"
        );

    } else {

        rules.push(
            "Uppercase ✗"
        );
    }


    if (
        /[a-z]/.test(key)
    ) {

        score +=
            15;

        rules.push(
            "Lowercase ✓"
        );

    } else {

        rules.push(
            "Lowercase ✗"
        );
    }


    if (
        /\d/.test(key)
    ) {

        score +=
            15;

        rules.push(
            "Numbers ✓"
        );

    } else {

        rules.push(
            "Numbers ✗"
        );
    }


    if (
        /[^A-Za-z0-9]/.test(key)
    ) {

        score +=
            15;

        rules.push(
            "Symbols ✓"
        );

    } else {

        rules.push(
            "Symbols ✗"
        );
    }


    keyStrengthBar.style.width =
        `${Math.min(score, 100)}%`;


    if (
        score >= 85
    ) {

        keyStrengthText.textContent =
            "Strong";

        keyStrengthBar.style.background =
            "#22c77a";

    } else if (
        score >= 55
    ) {

        keyStrengthText.textContent =
            "Moderate";

        keyStrengthBar.style.background =
            "#d6a84b";

    } else {

        keyStrengthText.textContent =
            "Weak";

        keyStrengthBar.style.background =
            "#ef6262";
    }


    keyRules.textContent =
        rules.join(
            " • "
        );
}


// =========================================================
// CAESAR VISUALIZER
// =========================================================

function caesarPreview(
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
                                - 65
                                + shift
                            ) % 26
                            + 26
                        ) % 26 + 65
                    );
                }


                return char;
            }
        )
        .join("");
}


function updateCaesarVisualizer() {

    if (
        algorithm.value !==
        "caesar"
    ) {

        caesarVisualizer.classList.add(
            "hidden"
        );

        return;
    }


    caesarVisualizer.classList.remove(
        "hidden"
    );


    let shift =
        Number(
            secretKey.value
        );


    if (
        !Number.isInteger(
            shift
        )
    ) {

        shift =
            3;
    }


    shift =
        (
            (
                shift % 26
            ) + 26
        ) % 26;


    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


    originalAlphabet.textContent =
        alphabet;


    shiftedAlphabet.textContent =
        alphabet.slice(shift) +
        alphabet.slice(0, shift);


    caesarExample.textContent =
        `HELLO → ${caesarPreview(
            "HELLO",
            shift
        )}`;
}


// =========================================================
// KEY UI
// =========================================================

function updateKeyUI() {

    const selected =
        algorithm.value;


    const data =
        algorithms[selected];


    if (
        !data
    ) {

        secretKey.disabled =
            true;

        secretKey.value =
            "";

        secretKey.placeholder =
            "Select an algorithm first";

        keyTitle.textContent =
            "Secret Key / Shift";

        keyStatus.textContent =
            "SELECT ALGORITHM";

        keyHelp.textContent =
            "Select an algorithm to see the required input.";

        return;
    }


    secretKey.disabled =
        !data.needsKey;


    if (
        !data.needsKey
    ) {

        secretKey.value =
            "";
    }


    secretKey.placeholder =
        data.placeholder;


    keyTitle.textContent =
        data.keyTitle;


    keyStatus.textContent =
        data.needsKey
            ? "REQUIRED"
            : "NOT REQUIRED";


    keyHelp.textContent =
        data.help;
}


// =========================================================
// ANALYSIS
// =========================================================

function updateAnalysis() {

    const selected =
        algorithm.value;


    const data =
        algorithms[selected];


    if (
        !data
    ) {

        algorithmInfo.textContent =
            "—";

        operationStatus.textContent =
            "READY";

        analysisKeyStatus.textContent =
            "—";

        analysisFormat.textContent =
            "—";

        return;
    }


    algorithmInfo.textContent =
        data.name;


    analysisKeyStatus.textContent =
        data.needsKey
            ? "REQUIRED"
            : "NOT REQUIRED";


    analysisFormat.textContent =
        data.format;


    if (
        selected === "sha256"
    ) {

        operationStatus.textContent =
            "HASHING";

    } else if (
        selected === "base64"
    ) {

        operationStatus.textContent =
            "ENCODING";

    } else {

        operationStatus.textContent =
            "READY";
    }
}


// =========================================================
// BUTTONS
// =========================================================

function updateButtons() {

    const selected =
        algorithm.value;


    const data =
        algorithms[selected];


    if (
        !data
    ) {

        encryptBtn.textContent =
            "Encrypt / Process";

        decryptBtn.textContent =
            "Decrypt";

        decryptBtn.disabled =
            false;

        decryptBtn.style.opacity =
            "";

        return;
    }


    encryptBtn.textContent =
        data.encryptLabel;


    decryptBtn.textContent =
        data.decryptLabel;


    if (
        selected ===
        "sha256"
    ) {

        decryptBtn.disabled =
            true;

        decryptBtn.style.opacity =
            "0.45";

    } else {

        decryptBtn.disabled =
            false;

        decryptBtn.style.opacity =
            "";
    }
}


// =========================================================
// FULL UI UPDATE
// =========================================================

function updateUI() {

    updateCards();

    updateKeyUI();

    updateButtons();

    updateAnalysis();

    updateKeyStrength();

    updateCaesarVisualizer();

    updateStats();

    clearMessage();
}


// =========================================================
// API HELPER
// =========================================================

async function callAPI(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            options
        );


    let data =
        {};


    try {

        data =
            await response.json();

    } catch {

        data =
            {};
    }


    return {
        response,
        data
    };
}


// =========================================================
// RESULT ANIMATION
// =========================================================

function animateResult() {

    cipherText.classList.remove(
        "result-flash"
    );

    void cipherText.offsetWidth;

    cipherText.classList.add(
        "result-flash"
    );

    updateStats();
}


// =========================================================
// HISTORY
// =========================================================

function addHistory(
    operation,
    algorithmName,
    result
) {

    history.unshift({

        operation,

        algorithm:
            algorithms[
                algorithmName
            ]?.name ||
            algorithmName,

        preview:
            result.slice(
                0,
                80
            ),

        timestamp:
            new Date().toISOString()
    });


    history =
        history.slice(
            0,
            8
        );


    localStorage.setItem(
        "cryptolabHistory",
        JSON.stringify(
            history
        )
    );


    renderHistory();
}


function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


function renderHistory() {

    if (
        !history.length
    ) {

        operationHistory.innerHTML =
            `
            <div class="empty">
                No operations performed yet.
            </div>
            `;

        return;
    }


    operationHistory.innerHTML =
        "";


    history.forEach(
        (item) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-item";


            row.innerHTML =
                `
                <div class="history-line">
                    <strong>
                        ${escapeHtml(
                            item.operation
                        )}
                        •
                        ${escapeHtml(
                            item.algorithm
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            new Date(
                                item.timestamp
                            ).toLocaleString()
                        )}
                    </span>
                </div>

                <div class="history-line">
                    <span>
                        ${escapeHtml(
                            item.preview
                        )}
                    </span>
                </div>
                `;


            operationHistory.appendChild(
                row
            );
        }
    );
}


// =========================================================
// ALGORITHM CARD CLICK
// =========================================================

algorithmCards.forEach(
    (card) => {

        card.addEventListener(
            "click",
            () => {

                algorithm.value =
                    card.dataset.algorithm;

                updateUI();
            }
        );
    }
);


// =========================================================
// DROPDOWN
// =========================================================

algorithm.addEventListener(
    "change",
    updateUI
);


// =========================================================
// LIVE INPUT
// =========================================================

plainText.addEventListener(
    "input",
    updateStats
);


secretKey.addEventListener(
    "input",
    () => {

        updateKeyStrength();

        updateCaesarVisualizer();
    }
);


// =========================================================
// ENCRYPT
// =========================================================

encryptBtn.addEventListener(
    "click",
    async () => {

        const text =
            plainText.value.trim();

        const selected =
            algorithm.value;

        const key =
            secretKey.value.trim();


        if (
            !text
        ) {

            showMessage(
                "Please enter some text first."
            );

            return;
        }


        if (
            !selected
        ) {

            showMessage(
                "Please select an encryption algorithm."
            );

            return;
        }


        if (
            selected === "caesar" &&
            (
                key === "" ||
                !Number.isInteger(
                    Number(key)
                )
            )
        ) {

            showMessage(
                "Caesar Cipher requires an integer shift."
            );

            return;
        }


        if (
            selected === "aes" &&
            !key
        ) {

            showMessage(
                "AES-256 requires a secret key."
            );

            return;
        }


        try {

            encryptBtn.disabled =
                true;

            encryptBtn.textContent =
                "Processing...";


            const {
                response,
                data
            } =
                await callAPI(
                    "/api/encrypt",
                    {

                        method:
                            "POST",

                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            },

                        body:
                            JSON.stringify({

                                text,

                                algorithm:
                                    selected,

                                key
                            })
                    }
                );


            if (
                !response.ok
            ) {

                showMessage(
                    data.message ||
                    "Processing failed."
                );

                return;
            }


            cipherText.value =
                data.result;


            animateResult();


            operationStatus.textContent =
                selected === "sha256"
                    ? "HASHING"
                    : selected === "base64"
                        ? "ENCODING"
                        : "ENCRYPTING";


            if (
                selected === "sha256"
            ) {

                showMessage(
                    "SHA-256 hash generated successfully.",
                    "success"
                );

            } else if (
                selected === "base64"
            ) {

                showMessage(
                    "Text encoded successfully using Base64.",
                    "success"
                );

            } else {

                showMessage(
                    "Text encrypted successfully.",
                    "success"
                );
            }


            addHistory(
                selected === "sha256"
                    ? "Hash"
                    : selected === "base64"
                        ? "Encode"
                        : "Encrypt",

                selected,

                data.result
            );


        } catch (error) {

            console.error(
                error
            );

            showMessage(
                "Unable to connect to the server."
            );

        } finally {

            encryptBtn.disabled =
                false;

            updateButtons();
        }
    }
);


// =========================================================
// DECRYPT
// =========================================================

decryptBtn.addEventListener(
    "click",
    async () => {

        const selected =
            algorithm.value;

        const key =
            secretKey.value.trim();


        if (
            selected === "sha256"
        ) {

            showMessage(
                "SHA-256 is a one-way hash and cannot be decrypted."
            );

            return;
        }


        if (
            !selected
        ) {

            showMessage(
                "Please select an encryption algorithm."
            );

            return;
        }


        const text =
            cipherText.value.trim() ||
            plainText.value.trim();


        if (
            !text
        ) {

            showMessage(
                "Please enter or generate ciphertext first."
            );

            return;
        }


        if (
            selected === "caesar" &&
            (
                key === "" ||
                !Number.isInteger(
                    Number(key)
                )
            )
        ) {

            showMessage(
                "Caesar Cipher requires an integer shift."
            );

            return;
        }


        if (
            selected === "aes" &&
            !key
        ) {

            showMessage(
                "AES-256 requires a secret key."
            );

            return;
        }


        try {

            decryptBtn.disabled =
                true;

            decryptBtn.textContent =
                selected === "base64"
                    ? "Decoding..."
                    : "Decrypting...";


            const {
                response,
                data
            } =
                await callAPI(
                    "/api/decrypt",
                    {

                        method:
                            "POST",

                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            },

                        body:
                            JSON.stringify({

                                text,

                                algorithm:
                                    selected,

                                key
                            })
                    }
                );


            if (
                !response.ok
            ) {

                showMessage(
                    data.message ||
                    "Decryption failed."
                );

                return;
            }


            plainText.value =
                data.result;


            updateStats();


            operationStatus.textContent =
                selected === "base64"
                    ? "DECODED"
                    : "DECRYPTED";


            showMessage(
                selected === "base64"
                    ? "Text decoded successfully."
                    : "Text decrypted successfully.",
                "success"
            );


            addHistory(
                selected === "base64"
                    ? "Decode"
                    : "Decrypt",

                selected,

                data.result
            );


        } catch (error) {

            console.error(
                error
            );

            showMessage(
                "Unable to connect to the server."
            );

        } finally {

            decryptBtn.disabled =
                false;

            updateButtons();
        }
    }
);


// =========================================================
// COPY
// =========================================================

copyBtn.addEventListener(
    "click",
    async () => {

        const value =
            cipherText.value.trim();


        if (
            !value
        ) {

            showMessage(
                "There is no result to copy."
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                value
            );


            showMessage(
                "Result copied to clipboard.",
                "success"
            );

        } catch {

            showMessage(
                "Unable to copy the result."
            );
        }
    }
);


// =========================================================
// DOWNLOAD
// =========================================================

downloadBtn.addEventListener(
    "click",
    () => {

        const value =
            cipherText.value;


        if (
            !value.trim()
        ) {

            showMessage(
                "There is no result to download."
            );

            return;
        }


        const blob =
            new Blob(
                [value],
                {
                    type:
                        "text/plain"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            "cryptolab-result.txt";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        showMessage(
            "Result downloaded successfully.",
            "success"
        );
    }
);


// =========================================================
// CLEAR
// =========================================================

clearBtn.addEventListener(
    "click",
    () => {

        plainText.value =
            "";

        cipherText.value =
            "";

        algorithm.value =
            "";

        secretKey.value =
            "";

        saveTitle.value =
            "";

        updateUI();
    }
);


// =========================================================
// CLEAR HISTORY
// =========================================================

clearHistoryBtn.addEventListener(
    "click",
    () => {

        history =
            [];


        localStorage.removeItem(
            "cryptolabHistory"
        );


        renderHistory();


        showMessage(
            "Operation history cleared.",
            "success"
        );
    }
);


// =========================================================
// AUTH MODAL
// =========================================================

function openAuth() {

    authModal.classList.remove(
        "hidden"
    );

    showLogin();

    authMessage.textContent =
        "";
}


function closeAuth() {

    authModal.classList.add(
        "hidden"
    );
}


function showLogin() {

    loginForm.classList.remove(
        "hidden"
    );

    registerForm.classList.add(
        "hidden"
    );

    loginTab.classList.add(
        "active"
    );

    registerTab.classList.remove(
        "active"
    );
}


function showRegister() {

    loginForm.classList.add(
        "hidden"
    );

    registerForm.classList.remove(
        "hidden"
    );

    loginTab.classList.remove(
        "active"
    );

    registerTab.classList.add(
        "active"
    );
}


function showAuthMessage(
    text,
    type = "error"
) {

    authMessage.textContent =
        text;


    authMessage.style.color =
        type === "success"
            ? "#4ade80"
            : "#ef6262";
}


authBtn.addEventListener(
    "click",
    openAuth
);


closeAuthBtn.addEventListener(
    "click",
    closeAuth
);


loginTab.addEventListener(
    "click",
    showLogin
);


registerTab.addEventListener(
    "click",
    showRegister
);


authModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            authModal
        ) {

            closeAuth();
        }
    }
);


// =========================================================
// REGISTER
// =========================================================

registerForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            const email =
                registerEmail.value.trim();


            const {
                response,
                data
            } =
                await callAPI(
                    "/api/auth/register",
                    {

                        method:
                            "POST",

                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            },

                        body:
                            JSON.stringify({

                                name:
                                    registerName.value.trim(),

                                email,

                                password:
                                    registerPassword.value
                            })
                    }
                );


            if (
                !response.ok
            ) {

                showAuthMessage(
                    data.message ||
                    "Registration failed."
                );

                return;
            }


            registerForm.reset();


            showLogin();


            loginEmail.value =
                email;


            showAuthMessage(
                "Account created. You can now login.",
                "success"
            );


        } catch (error) {

            console.error(
                error
            );

            showAuthMessage(
                "Unable to connect to the server."
            );
        }
    }
);


// =========================================================
// LOGIN
// =========================================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            const {
                response,
                data
            } =
                await callAPI(
                    "/api/auth/login",
                    {

                        method:
                            "POST",

                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            },

                        body:
                            JSON.stringify({

                                email:
                                    loginEmail.value.trim(),

                                password:
                                    loginPassword.value
                            })
                    }
                );


            if (
                !response.ok
            ) {

                showAuthMessage(
                    data.message ||
                    "Login failed."
                );

                return;
            }


            currentUser =
                data.user;


            loginForm.reset();


            updateAuthUI();


            closeAuth();


            await loadSavedMessages();


            showMessage(
                `Welcome back, ${currentUser.name}.`,
                "success"
            );


        } catch (error) {

            console.error(
                error
            );

            showAuthMessage(
                "Unable to connect to the server."
            );
        }
    }
);


// =========================================================
// LOGOUT
// =========================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                "/api/auth/logout",
                {
                    method:
                        "POST"
                }
            );

        } catch (
            error
        ) {

            console.error(
                error
            );
        }


        currentUser =
            null;


        updateAuthUI();


        showMessage(
            "Logged out successfully.",
            "success"
        );
    }
);


// =========================================================
// AUTH UI
// =========================================================

function updateAuthUI() {

    if (
        currentUser
    ) {

        authBtn.classList.add(
            "hidden"
        );

        userPanel.classList.remove(
            "hidden"
        );


        userName.textContent =
            currentUser.name;


        saveSection.classList.remove(
            "hidden"
        );

        savedSection.classList.remove(
            "hidden"
        );


        loadSavedMessages();

    } else {

        authBtn.classList.remove(
            "hidden"
        );

        userPanel.classList.add(
            "hidden"
        );


        saveSection.classList.add(
            "hidden"
        );

        savedSection.classList.add(
            "hidden"
        );


        savedMessages.innerHTML =
            "";
    }
}


// =========================================================
// SESSION CHECK
// =========================================================

async function checkAuth() {

    try {

        const {
            data
        } =
            await callAPI(
                "/api/auth/me"
            );


        currentUser =
            data.loggedIn
                ? data.user
                : null;

    } catch {

        currentUser =
            null;
    }


    updateAuthUI();


    if (
        currentUser
    ) {

        await loadSavedMessages();
    }
}


// =========================================================
// SAVE RESULT
// =========================================================

saveBtn.addEventListener(
    "click",
    async () => {

        if (
            !currentUser
        ) {

            showMessage(
                "Please login before saving results."
            );

            return;
        }


        const result =
            cipherText.value.trim();


        if (
            !result
        ) {

            showMessage(
                "Generate a result before saving it."
            );

            return;
        }


        try {

            saveBtn.disabled =
                true;

            saveBtn.textContent =
                "Saving...";


            const {
                response,
                data
            } =
                await callAPI(
                    "/api/messages",
                    {

                        method:
                            "POST",

                        headers:
                            {
                                "Content-Type":
                                    "application/json"
                            },

                        body:
                            JSON.stringify({

                                title:
                                    saveTitle.value.trim() ||
                                    "Untitled Result",

                                algorithm:
                                    algorithm.value,

                                ciphertext:
                                    result
                            })
                    }
                );


            if (
                !response.ok
            ) {

                showMessage(
                    data.message ||
                    "Unable to save result."
                );

                return;
            }


            saveTitle.value =
                "";


            showMessage(
                "Result saved successfully.",
                "success"
            );


            await loadSavedMessages();


        } catch (error) {

            console.error(
                error
            );

            showMessage(
                "Unable to connect to the server."
            );

        } finally {

            saveBtn.disabled =
                false;

            saveBtn.textContent =
                "Save Result";
        }
    }
);


// =========================================================
// LOAD SAVED
// =========================================================

async function loadSavedMessages() {

    if (
        !currentUser
    ) {

        return;
    }


    try {

        const {
            response,
            data
        } =
            await callAPI(
                "/api/messages"
            );


        if (
            response.ok
        ) {

            renderSavedMessages(
                data.messages ||
                []
            );
        }

    } catch (
        error
    ) {

        console.error(
            error
        );
    }
}


// =========================================================
// RENDER SAVED
// =========================================================

function renderSavedMessages(
    items
) {

    if (
        !items.length
    ) {

        savedMessages.innerHTML =
            `
            <div class="empty">
                No saved messages yet.
            </div>
            `;

        return;
    }


    savedMessages.innerHTML =
        "";


    items.forEach(
        (item) => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "saved-item";


            wrapper.innerHTML =
                `
                <div class="saved-top">

                    <span class="saved-title">
                        ${escapeHtml(
                            item.title
                        )}
                    </span>

                    <span class="saved-meta">
                        ${escapeHtml(
                            algorithms[
                                item.algorithm
                            ]?.name ||
                            item.algorithm
                        )}

                        •

                        ${escapeHtml(
                            new Date(
                                item.createdAt
                            ).toLocaleString()
                        )}
                    </span>

                </div>


                <div class="saved-preview">
                    ${escapeHtml(
                        item.ciphertext
                    )}
                </div>


                <div class="saved-actions">

                    <button
                        type="button"
                        class="load"
                    >
                        Load
                    </button>


                    <button
                        type="button"
                        class="delete"
                    >
                        Delete
                    </button>

                </div>
                `;


            wrapper
                .querySelector(
                    ".load"
                )
                .addEventListener(
                    "click",
                    () => {

                        algorithm.value =
                            item.algorithm;


                        updateUI();


                        cipherText.value =
                            item.ciphertext;


                        animateResult();


                        window.scrollTo({

                            top: 0,

                            behavior:
                                "smooth"
                        });


                        showMessage(
                            "Saved result loaded.",
                            "success"
                        );
                    }
                );


            wrapper
                .querySelector(
                    ".delete"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteSavedMessage(
                            item.id
                        );
                    }
                );


            savedMessages.appendChild(
                wrapper
            );
        }
    );
}


// =========================================================
// DELETE SAVED
// =========================================================

async function deleteSavedMessage(
    id
) {

    try {

        const {
            response,
            data
        } =
            await callAPI(
                `/api/messages/${encodeURIComponent(id)}`,

                {
                    method:
                        "DELETE"
                }
            );


        if (
            !response.ok
        ) {

            showMessage(
                data.message ||
                "Unable to delete result."
            );

            return;
        }


        showMessage(
            "Saved result deleted.",
            "success"
        );


        await loadSavedMessages();


    } catch {

        showMessage(
            "Unable to connect to the server."
        );
    }
}


refreshSavedBtn.addEventListener(
    "click",
    loadSavedMessages
);


// =========================================================
// START
// =========================================================

updateUI();

renderHistory();

updateAuthUI();

checkAuth();