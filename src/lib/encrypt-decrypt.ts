import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

export function encrypt(text: string, secretKey: string): string {
    const iv = randomBytes(IV_LENGTH)
    const cipher = createCipheriv(ALGORITHM, Buffer.from(secretKey, 'hex'), iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    // We store the IV and AuthTag along with the encrypted text so we can decrypt it later
    return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(hash: string, secretKey: string): string {
    const [iv, authTag, encryptedText] = hash.split(':')

    const decipher = createDecipheriv(
        ALGORITHM,
        Buffer.from(secretKey, 'hex'),
        Buffer.from(iv, 'hex')
    )
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}
