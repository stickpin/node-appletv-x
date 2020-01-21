"use strict";
const chacha = require("chacha-native");
const chacha20poly1305 = require("./chacha20poly1305");
const crypto = require("crypto");
const number_1 = require("./number");

function computePoly1305(cipherText, AAD, nonce, key) {
    if (AAD == null) {
        AAD = Buffer.alloc(0);
    }
    const msg = Buffer.concat([
        AAD,
        getPadding(AAD, 16),
        cipherText,
        getPadding(cipherText, 16),
        number_1.default.UInt53toBufferLE(AAD.length),
        number_1.default.UInt53toBufferLE(cipherText.length)
    ]);

    var cipherTextBuffer = Buffer.alloc(cipherText.length);

    var ctx = new chacha20poly1305.Chacha20Ctx();
    chacha20poly1305.chacha20_keysetup(ctx, key);
    chacha20poly1305.chacha20_ivsetup(ctx, nonce);

    var polyKey = Buffer.alloc(32);
    var zeros = Buffer.alloc(64);
    chacha20poly1305.chacha20_update(ctx, polyKey, zeros, zeros.length);
    var written = chacha20poly1305.chacha20_update(ctx, cipherTextBuffer, cipherText, cipherText.length);
    chacha20poly1305.chacha20_final(ctx, cipherTextBuffer.slice(written, cipherText.length));

    const hmac = chacha.createHmac;
    const hmacInstance = new hmac(polyKey);
    const computed_hmac = hmacInstance.update(msg).digest();

    return computed_hmac;

}

function verifyAndDecrypt(cipherText, mac, AAD, nonce, key) {
    const hmac = computePoly1305(cipherText, AAD, nonce, key);
    const matches = Buffer.compare(mac, hmac);
    if (matches === 0) {
        const cipher = new chacha.AeadLegacy(key, nonce);
        const encryptedText = Buffer.concat([cipher.update(cipherText), cipher.final()]);
        return encryptedText;
    }
    return null;
}

function encryptAndSeal(plainText, AAD, nonce, key) {
    const cipher = new chacha.AeadLegacy(key, nonce);
    const cipherText = Buffer.concat([cipher.update(plainText), cipher.final()]);
    const hmac = computePoly1305(cipherText, AAD, nonce, key);

    return [cipherText, hmac];
}

function getPadding(buffer, blockSize) {
    return buffer.length % blockSize === 0 ?
        Buffer.alloc(0) :
        Buffer.alloc(blockSize - (buffer.length % blockSize));
}

function HKDF(hashAlg, salt, ikm, info, size) {
    // create the hash alg to see if it exists and get its length
    var hash = crypto.createHash(hashAlg);
    var hashLength = hash.digest().length;
    // now we compute the PRK
    var hmac = crypto.createHmac(hashAlg, salt);
    hmac.update(ikm);
    var prk = hmac.digest();
    var prev = Buffer.alloc(0);
    var output;
    var buffers = [];
    var num_blocks = Math.ceil(size / hashLength);
    info = Buffer.from(info);
    for (var i = 0; i < num_blocks; i++) {
        var hmac = crypto.createHmac(hashAlg, prk);
        var input = Buffer.concat([
            prev,
            info,
            Buffer.from(String.fromCharCode(i + 1))
        ]);
        hmac.update(input);
        prev = hmac.digest();
        buffers.push(prev);
    }
    output = Buffer.concat(buffers, size);
    return output.slice(0, size);
}

exports.default = {
    encryptAndSeal,
    verifyAndDecrypt,
    HKDF
};