import {
  useDynamicContext,
  useIsLoggedIn,
  useEmbeddedReveal,
  useEmbeddedWallet,
} from '@dynamic-labs/sdk-react-core'
import { Button, Card } from '@heroui/react'
import Balances from './Balances'
import './App.css'

function App() {
  const { handleLogOut, primaryWallet,setShowAuthFlow } = useDynamicContext()
  const isLoggedIn = useIsLoggedIn()
  const { initExportProcess } = useEmbeddedReveal()
  const { userHasEmbeddedWallet } = useEmbeddedWallet()


  const handleOpenExportKeys = () => {
    // Only allow export for embedded wallets
    if (userHasEmbeddedWallet()) {
      initExportProcess()
    } else {
      alert('Export keys is only available for embedded wallets created with Dynamic.')
    }
  }

  const handleLogout = () => {
    handleLogOut()
  }

  return (
    <div className="app-container">
      <div className="content">
        <div className="logo-container">
          <img src="/logo.svg" alt="Hubra Logo" className="logo" />
        </div>
        <h1>Hubra v1 Old wallet Export</h1>
        
        {!isLoggedIn ? (
           <Button 
           size="lg"
           variant="primary"
           fullWidth
           onPress={() => setShowAuthFlow(true)}
         >
           Connect Wallet
         </Button>
        ) : (
          <>
            <Card className="actions-card">
              <Card.Header>
                <div className="user-info">
                  <div className="status-indicator">
                    <span className="status-dot"></span>
                    <Card.Title>Wallet Connected</Card.Title>
                  </div>
                  {primaryWallet?.address && (
                    <div className="wallet-address-container">
                      <p className="wallet-address">
                        {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          window.open(`https://solscan.io/address/${primaryWallet.address}`, '_blank')
                        }}
                      >
                        View on Solscan
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Content>
                <div className="buttons">
                  <Button 
                    size="lg"
                    variant="primary"
                    fullWidth
                    isDisabled={!userHasEmbeddedWallet()}
                    onPress={handleOpenExportKeys}
                  >
                    Export Keys
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="danger"
                    fullWidth
                    onPress={handleLogout}
                  >
                    Log Out
                  </Button>
                </div>

                {!userHasEmbeddedWallet() && (
                  <p className="hint">
                    Export Keys is only available for embedded wallets. Link an embedded wallet to use this feature.
                  </p>
                )}
              </Card.Content>
            </Card>
            
            <Balances />
          </>
        )}
      </div>
    </div>
  )
}

export default App
