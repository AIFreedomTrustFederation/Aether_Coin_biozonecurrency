import React, { useState } from 'react';
import { useQuantumBridge } from '../../../../utils/quantum-security/quantumBridge';
import { encryptData } from '../../../../server/crypto/quantum';

export function QuantumSecurePayment() {
    const secureChannel = useQuantumBridge();
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleSecurePayment = (amount: number, recipient: string) => {
        try {
            const encryptedAmount = encryptData(amount.toString());
            const encryptedRecipient = encryptData(recipient);

            secureChannel.sendPayment(encryptedAmount, encryptedRecipient);
            setStatusMessage('Payment successful!');
        } catch (error) {
            console.error('Secure payment failed', error);
            setStatusMessage('Payment failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Quantum Secure Payment</h2>
            <button onClick={() => handleSecurePayment(100, 'recipientAddress')}>
                Pay Securely
            </button>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
}