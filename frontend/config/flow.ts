import * as fcl from "@onflow/fcl";

const flowNetwork = process.env.NEXT_PUBLIC_FLOW_NETWORK || "emulator";
const accessNode = process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE || "http://localhost:8888";
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xf8d6e0586b0a20c7";

const networkConfigs: Record<string, Record<string, string>> = {
  emulator: {
    "accessNode.api": accessNode,
    "discovery.wallet": "http://localhost:8701/fcl/authn",
    "flow.network": "emulator",
  },
  testnet: {
    "accessNode.api": "https://rest-testnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
    "flow.network": "testnet",
  },
  mainnet: {
    "accessNode.api": "https://rest-mainnet.onflow.org",
    "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
    "flow.network": "mainnet",
  },
};

export function configureFlow() {
  const config = networkConfigs[flowNetwork] || networkConfigs.emulator;
  fcl.config(config);
}

export { fcl, flowNetwork, contractAddress };
