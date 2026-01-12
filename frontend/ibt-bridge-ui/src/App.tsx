import { useState } from "react";
import { ethers } from "ethers";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

// --- CONFIG ETHEREUM (ANVIL) ---
const ETH_TOKEN_ADDRESS = "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f";
const ETH_PRIV_KEY = "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97";
const IBT_ABI = ["function burn(uint256 amount) public"];

// --- CONFIG SUI (LOCAL) ---
const SUI_PACKAGE_ID = "0x9eb54b5a16c67b20a8488dfd9e92dcd00fbda594795383c48c309c4a463ef0c0";
const SUI_TREASURY_CAP = "0xcc8d4467090223584d51af6c790a6fc52ce805b42108978537053f608dca0371";
// Pune aici cheia ta suiprivkey... (Bech32)
const SUI_PRIV_KEY = "suiprivkey1qrzjaxvdl04hw68kxqhfeh4j6ykjq9dseznuazpn8qjk9nknk04u6fnyn0x";

export default function App() {
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("Pregătit");

    const suiClient = new SuiClient({ url: getFullnodeUrl("localnet") });

    const handleBridge = async () => {
        if (!amount) return alert("Introdu suma");

        try {
            // 1. BURN PE ETHEREUM (LOCAL ANVIL)
            setStatus("Pas 1: Burn pe Ethereum...");
            const ethProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
            const ethWallet = new ethers.Wallet(ETH_PRIV_KEY, ethProvider);
            const ethContract = new ethers.Contract(ETH_TOKEN_ADDRESS, IBT_ABI, ethWallet);

            const ethTx = await ethContract.burn(ethers.parseUnits(amount, 18));
            await ethTx.wait();
            console.log("Ethereum Burn confirmat:", ethTx.hash);

            // 2. MINT PE SUI (LOCAL NODE)
            setStatus("Pas 2: Mint pe Sui...");

            // Decodăm cheia fără a folosi modulul 'buffer' din Node.js
            const { secretKey } = decodeSuiPrivateKey(SUI_PRIV_KEY);
            const keypair = Ed25519Keypair.fromSecretKey(secretKey);

            const tx = new Transaction();
            tx.moveCall({
                target: `${SUI_PACKAGE_ID}::ibt::mint`,
                arguments: [
                    tx.object(SUI_TREASURY_CAP),
                    tx.pure.u64(amount),
                    tx.pure.address(keypair.toSuiAddress()),
                ],
            });

            const result = await suiClient.signAndExecuteTransaction({
                signer: keypair,
                transaction: tx,
            });

            setStatus(`Succes! Digest Sui: ${result.digest.slice(0, 10)}`);
            alert("Bridge ETH -> Sui completat cu succes!");
        } catch (e: any) {
            console.error(e);
            setStatus(`Eroare: ${e.message}`);
        }
    };

    return (
        <div style={{ padding: "50px", fontFamily: "monospace", textAlign: "center" }}>
            <h2>IBT Bridge Automatizat (Localnet)</h2>
            <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "30px", borderRadius: "10px" }}>
                <p>Status: <strong>{status}</strong></p>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Suma de transferat"
                    style={{ padding: "10px", fontSize: "16px" }}
                />
                <button
                    onClick={handleBridge}
                    style={{ padding: "10px 20px", marginLeft: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
                >
                    Execută Bridge
                </button>
            </div>
            <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
                <p>Ethereum: Anvil (8545)</p>
                <p>Sui: Localnet (9000)</p>
            </div>
        </div>
    );
}