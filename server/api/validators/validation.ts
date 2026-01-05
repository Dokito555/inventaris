export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password: string): {
    valid: boolean;
    message?: string;
} {
    if (password.length < 8) {
        return { valid: false, message: "password must be at least 8 characters" };
    }
    return { valid: true };
}

export function validatePhoneNumber(phoneNumber: string): boolean {
    const idPhoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
    return idPhoneRegex.test(phoneNumber)
}