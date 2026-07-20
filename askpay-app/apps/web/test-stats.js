const { createPublicClient, http } = require('viem');
const { celo } = require('viem/chains');

async function test() {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org')
  });

  const contractAddress = '0x3c839797BA135457Eca83f8C20f2335A817899b5';
  console.log("Querying logs for address:", contractAddress);

  try {
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: {
        anonymous: false,
        inputs: [
          { indexed: true,  name: "payer",     type: "address"  },
          { indexed: false, name: "amount",    type: "uint256"  },
          { indexed: true,  name: "queryId",   type: "uint256"  },
          { indexed: false, name: "timestamp", type: "uint256"  },
        ],
        name: "QueryPaid",
        type: "event",
      },
      fromBlock: 0n,
      toBlock: 'latest'
    });
    console.log("Success! Logs length:", logs.length);
  } catch (err) {
    console.error("Error with fromBlock: 0n");
    console.error(err);
  }

  // Try fetching transaction list/block height
  try {
    const currentBlock = await publicClient.getBlockNumber();
    console.log("Current Celo mainnet block:", currentBlock.toString());
  } catch (err) {
    console.error("Error getting block number:", err);
  }
}

test();
