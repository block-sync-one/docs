import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isSolanaWallet } from '@dynamic-labs/solana';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Modal,
  Button,
  TextField,
  Input,
  Label,
  FieldError,
  Description,
  Spinner,
} from '@heroui/react';
import './TransferModal.css';

interface TransferModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenBalance?: string;
  tokenDecimals?: number;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

const TransferModal = ({
  isOpen,
  onOpenChange,
  tokenAddress,
  tokenSymbol = 'SOL',
  tokenBalance,
  tokenDecimals = 9,
}: TransferModalProps) => {
  const { primaryWallet } = useDynamicContext();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isNativeSOL = !tokenAddress || tokenAddress === 'native' || tokenAddress === '11111111111111111111111111111111';

  const validateRecipientAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const validateAmount = (amountStr: string): boolean => {
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) return false;
    if (tokenBalance) {
      const balance = parseFloat(tokenBalance);
      return num <= balance;
    }
    return true;
  };

  const isRecipientInvalid = recipientAddress.length > 0 && !validateRecipientAddress(recipientAddress);
  const isAmountInvalid = amount.length > 0 && !validateAmount(amount);

  const handleTransfer = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('No Solana wallet connected');
      return;
    }

    if (!validateRecipientAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return;
    }

    if (!validateAmount(amount)) {
      setError('Invalid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const connection: Connection = await primaryWallet.getConnection();
      const fromKey = new PublicKey(primaryWallet.address);
      const toKey = new PublicKey(recipientAddress);

      let instructions = [];

      if (isNativeSOL) {
        // Native SOL transfer
        const amountInLamports = Math.round(parseFloat(amount) * LAMPORTS_PER_SOL);
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: fromKey,
            lamports: amountInLamports,
            toPubkey: toKey,
          })
        );
      } else {
        // SPL Token transfer
        const mintPublicKey = new PublicKey(tokenAddress!);
        const decimals = tokenDecimals || 9;
        const transferAmount = parseFloat(amount);
        const tokenOwner = await connection.getAccountInfo(mintPublicKey);
        console.log('tokenOwner', tokenOwner);

   console.log("Detected token program:", tokenOwner?.owner.toString());
        // Get associated token addresses
        const fromTokenAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          fromKey,
          false,
          tokenOwner?.owner
        );

        const toTokenAddress = await getAssociatedTokenAddress(
          mintPublicKey,
          toKey,
          false,
          tokenOwner?.owner
        );

        // Check if sender has a token account
        try {
          await getAccount(connection, fromTokenAddress, 'confirmed', tokenOwner?.owner);
        } catch (err) {
          throw new Error('You do not have a token account for this token. Please ensure you have a balance.');
        }

        // Check if recipient has a token account, create it if not
        try {
          await getAccount(connection, toTokenAddress, 'confirmed', tokenOwner?.owner);
        } catch {
          // Recipient doesn't have a token account, create it
          instructions.push(
            createAssociatedTokenAccountInstruction(
              fromKey, // payer
              toTokenAddress, // associatedToken
              toKey, // owner
              mintPublicKey, // mint
              tokenOwner?.owner
            )
          );
        }

        // Create transfer checked instruction (validates amount and decimals)
        instructions.push(
          createTransferCheckedInstruction(
            fromTokenAddress, // source
            mintPublicKey, // mint
            toTokenAddress, // destination
            fromKey, // authority
            BigInt(Math.round(transferAmount * Math.pow(10, decimals))), // amount in smallest unit
            decimals, // decimals
            [], // multiSigners
            tokenOwner?.owner // programId
          )
        );
      }

      const blockhash = await connection.getLatestBlockhash();

      // Create v0 compatible message
      const messageV0 = new TransactionMessage({
        instructions,
        payerKey: fromKey,
        recentBlockhash: blockhash.blockhash,
      }).compileToV0Message();

      const transferTransaction = new VersionedTransaction(messageV0);

      const signer = await primaryWallet.getSigner();

      const res = await signer.signAndSendTransaction(transferTransaction);

      const signature = typeof res === 'string' ? res : res.signature;
      const explorerUrl = `https://solscan.io/tx/${signature}?cluster=${connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet'}`;

      setSuccess(`Transaction successful! View on Solscan: ${explorerUrl}`);
      
      // Reset form after successful transfer
      setTimeout(() => {
        setRecipientAddress('');
        setAmount('');
        setSuccess(null);
        onOpenChange(false);
      }, 3000);
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err?.message || 'Failed to send transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setRecipientAddress('');
      setAmount('');
      setError(null);
      setSuccess(null);
      onOpenChange(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-md">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>Transfer {tokenSymbol}</Modal.Heading>
            {tokenBalance && (
              <p className="text-sm text-muted mt-1">
                Available: {tokenBalance} {tokenSymbol}
              </p>
            )}
          </Modal.Header>
          <Modal.Body className="p-6">
            <div className="transfer-form">
              <TextField
                className="w-full"
                isRequired
                isInvalid={isRecipientInvalid}
                value={recipientAddress}
                onChange={setRecipientAddress}
                isDisabled={isLoading}
              >
                <Label>Recipient Address</Label>
                <Input
                  placeholder="Enter Solana wallet address"
                  value={recipientAddress}
                />
                {isRecipientInvalid && (
                  <FieldError>Please enter a valid Solana address</FieldError>
                )}
                <Description>
                  Enter the recipient's Solana wallet address
                </Description>
              </TextField>

              <TextField
                className="w-full"
                isRequired
                isInvalid={isAmountInvalid}
                value={amount}
                onChange={setAmount}
                isDisabled={isLoading}
              >
                <Label>Amount ({tokenSymbol})</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step={isNativeSOL ? "0.000000001" : `0.${'0'.repeat(tokenDecimals - 1)}1`}
                  value={amount}
                />
                {isAmountInvalid && (
                  <FieldError>
                    {amount && parseFloat(amount) <= 0
                      ? 'Amount must be greater than 0'
                      : 'Amount exceeds available balance'}
                  </FieldError>
                )}
                {tokenBalance && (
                  <Description>
                    Maximum: {tokenBalance} {tokenSymbol}
                  </Description>
                )}
              </TextField>

              {error && (
                <div className="transfer-error">
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="transfer-success">
                  <p>{success}</p>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onPress={handleClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onPress={handleTransfer}
              isPending={isLoading}
              isDisabled={
                isLoading ||
                !recipientAddress ||
                !amount ||
                isRecipientInvalid ||
                isAmountInvalid
              }
            >
              {isLoading ? (
                <>
                  <Spinner color="current" size="sm" />
                  Sending...
                </>
              ) : (
                'Transfer'
              )}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default TransferModal;
