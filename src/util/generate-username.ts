export function generateRandomUsername(firstName: string, lastName: string): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000) // Generate a random 4-digit number`
    const baseUsername = `${firstName.toLowerCase()}${lastName.toLowerCase()}`
    return `${baseUsername}${randomSuffix}`
}
