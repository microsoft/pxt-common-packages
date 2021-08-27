#include "pxt.h"
#include "mbedtls/sha256.h"

// https://eprint.iacr.org/2012/156.pdf - in case more hash functions are needed

namespace crypto {

/*
 * Compute cryptographic SHA256 hash of the concatenation of buffers. Returns 32-byte buffer.
 */
//% promise
Buffer _sha256(RefCollection *buffers) {
    mbedtls_sha256_context sha256_ctx;
    uint8_t output[32];

    auto bufs = buffers->getData();
    auto len = buffers->length();

    mbedtls_sha256_init(&sha256_ctx);
    mbedtls_sha256_starts_ret(&sha256_ctx, false);

    while (len--) {
        if (BoxedBuffer::isInstance(*bufs)) {
            auto buf = (BoxedBuffer *)*bufs;
            mbedtls_sha256_update_ret(&sha256_ctx, buf->data, buf->length);
        }
        bufs++;
    }

    mbedtls_sha256_finish_ret(&sha256_ctx, output);

    return mkBuffer(output, sizeof(output));
}

} // namespace crypto