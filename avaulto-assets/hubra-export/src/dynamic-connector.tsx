import { createDefaultAuthorizationCache, createDefaultChainSelector, registerMwa } from "@solana-mobile/wallet-standard-mobile";
import { DynamicContextProvider, DynamicWidget, overrideNetworkRpcUrl } from "@dynamic-labs/sdk-react-core";
import { SdkViewSectionType, SdkViewType } from "@dynamic-labs/sdk-api";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

registerMwa({
  appIdentity: {
    name: "Hubra",
    uri: window.location.origin,
    icon: "/images/app-icons/android-chrome-192x192.png",
  },
  chains: ["solana:mainnet"],
  chainSelector: createDefaultChainSelector(),
  authorizationCache: createDefaultAuthorizationCache(),
  onWalletNotFound: (mwa) => {
    console.log("Wallet not found", mwa);

    return Promise.resolve();
  }, //createDefaultWalletNotFoundHandler(),
  // remoteHostAuthority: 'https://hubra.app/login', // Include to enable remote connection option.
});

export function DynamicConnector({ children }: { children: React.ReactNode }) {
  const rpcUrlOverrides = {
    "101": import.meta.env.VITE_SOLANA_CLIENT_RPC
      ? [import.meta.env.VITE_SOLANA_CLIENT_RPC]
      : [],
  };
  const cssOverrides = `
 .social-sign-in{    display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;}
  .social-sign-in .icon-list-tile--children p {display: none;}
  .login-view__scroll__section{flex-direction: column; }
`;

  return (
    <DynamicContextProvider
      settings={{
        termsOfServiceUrl: "https://docs.hubra.app/legal/terms-and-conditions",
        logLevel: import.meta.env.MODE ? "DEBUG" : "MUTE",
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [SolanaWalletConnectors],
        cssOverrides,
        overrides: {
          views: [
            {
              type: SdkViewType.Login,
              sections: [
                {
                  type: SdkViewSectionType.Email,
                },
                {
                  type: SdkViewSectionType.Social,
                  defaultItem: "google",
                },
                {
                  type: SdkViewSectionType.Separator,
                  label: "Link an external wallet is available after login",
                },
                // {
                //   type: SdkViewSectionType.Wallet,
                //   defaultItem: "solana",
                // },
              ],
            },
          ],
          solNetworks: (networks) => overrideNetworkRpcUrl(networks, rpcUrlOverrides),
        },
      }}
      theme="auto">
      {children}
      <DynamicWidget />
    </DynamicContextProvider>
  );
}
