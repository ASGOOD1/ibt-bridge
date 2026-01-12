import React from "react";
import ReactDOM from "react-dom/client";
import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "@mysten/dapp-kit/dist/index.css";

// Configurare rețea locală Sui (implicit http://127.0.0.1:9000)
const { networkConfig } = createNetworkConfig({
    localnet: { url: getFullnodeUrl("localnet") },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            {/* Setăm defaultNetwork pe localnet pentru a se potrivi cu sui start */}
            <SuiClientProvider networks={networkConfig} defaultNetwork="localnet">
                <WalletProvider autoConnect>
                    <App />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    </React.StrictMode>
);