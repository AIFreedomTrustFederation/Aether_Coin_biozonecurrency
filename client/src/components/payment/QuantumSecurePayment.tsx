import { useQuantumBridge } from '../../../features/quantum-security/lib/quantumBridge';
import { encryptData, decryptData } from '../../../../server/crypto/quantum';

export function QuantumSecurePayment() {
  const secureChannel = useQuantumBridge();

  const handleSecurePayment = (amount: number, recipient: string) => {
    const encryptedAmount = encryptData(amount.toString());
    const encryptedRecipient = encryptData(recipient);

    secureChannel.sendPayment(encryptedAmount, encryptedRecipient);
  };
      
  return (
    <div>
      <h2>Quantum Secure Payment</h2>
      <button onClick={() => handleSecurePayment(100, 'recipientAddress')}>
        Pay Securely
      </button>
    </div>
  );
}
