import { createPublicClient, http, PublicClient } from "viem";

class ChainCommunicator {
  provider: PublicClient | null;
  constructor() {
    this.provider = null;
  }

  init(url: string) {
    if (!this.provider) {
      this.provider = createPublicClient({
        transport: http(url),
      });
    }
  }

  getProvider() {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }
    return this.provider;
  }
}

export const chainCommunicator = new ChainCommunicator();
