import { useState } from 'react';
import { useDynamicContext, useTokenBalances } from "@dynamic-labs/sdk-react-core";
import { Button, Spinner } from "@heroui/react";
import TransferModal from './TransferModal';
import './Balances.css';

const Balances = () => {
  const { primaryWallet } = useDynamicContext();
  const { tokenBalances, isLoading, isError, error } = useTokenBalances();
  const [selectedToken, setSelectedToken] = useState<{
    address: string;
    symbol: string;
    balance: string;
    decimals?: number;
  } | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const handleTransfer = (token: typeof tokenBalances[0]) => {
    setSelectedToken({
      address: token.address,
      symbol: token.symbol,
      balance: String(token.balance),
      decimals: token.decimals,
    });
    setIsTransferModalOpen(true);
  };

  if (!primaryWallet) return <div className="balances-empty">No wallet connected</div>;

  if (isLoading) {
    return (
      <div className="balances-loading">
        <Spinner size="lg" />
        <p>Loading balances...</p>
      </div>
    );
  }

  if (isError) {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error && typeof error === 'object' && 'message' in error
      ? (error as { message: string }).message
      : 'Unknown error';
    return (
      <div className="balances-error">
        <p>Error loading balances: {errorMessage}</p>
      </div>
    );
  }

  if (!tokenBalances || tokenBalances.length === 0) {
    return (
      <div className="balances-empty">
        <p>No token balances found</p>
      </div>
    );
  }

  return (
    <>
      <div className="balances-container">
        <h2 className="balances-title">Your Assets</h2>
        <div className="balances-list">
          {tokenBalances.map((token) => (
            <div key={token.address} className="balance-row">
              {token.logoURI && (
                <img 
                  src={token.logoURI} 
                  alt={token.symbol} 
                  className="token-logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <div className="token-info">
                <div className="token-name">{token.name}</div>
                <div className="token-symbol">{token.symbol}</div>
              </div>
              <div className="balance-amount">
                <span className="balance-value">{String(token.balance)}</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onPress={() => handleTransfer(token)}
                className="transfer-button"
              >
                Transfer
              </Button>
            </div>
          ))}
        </div>
      </div>

      {selectedToken && (
        <TransferModal
          isOpen={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
          tokenAddress={selectedToken.address}
          tokenSymbol={selectedToken.symbol}
          tokenBalance={selectedToken.balance}
          tokenDecimals={selectedToken.decimals}
        />
      )}
    </>
  );
};

export default Balances;
