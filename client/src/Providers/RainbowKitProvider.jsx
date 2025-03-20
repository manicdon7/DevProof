import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { coreDao } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { UserProvider } from "../../context";

const coreDaoTestnet = {
  id: 1114,
  name: "TCORE2",
  network: "tCORE2",
  iconUrl: "/core.png",
  iconBackground: "#fff",
  nativeCurrency: {
    name: "Test Core",
    symbol: "tCORE2",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.test2.btcs.network"] },
    public: { http: ["https://rpc.test2.btcs.network"] },
  },
  blockExplorers: {
    default: {
      name: "TCore Explorer",
      url: "https://scan.test2.btcs.network",
    },
  },
  testnet: true,
};

const config = getDefaultConfig({
  appName: "DevProof",
  projectId: import.meta.env.VITE_RAINBOWKIT_PROJECT_ID,
  chains: [coreDao, coreDaoTestnet],
  ssr: false,
});

const queryClient = new QueryClient();

export function RainbowKitProviderWrapper({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          <UserProvider>{children}</UserProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
