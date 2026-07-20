const { createPublicClient, http } = require('viem');
const { celo } = require('viem/chains');
const { getContractEventsInChunks } = require('./src/lib/contracts');

async function test() {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org')
  });

  const PAY_PER_QUERY_ABI = [
    {
      anonymous: false,
      inputs: [
        { indexed: true,  name: "payer",     type: "address"  },
        { indexed: false, name: "amount",    type: "uint256"  },
        { indexed: true,  name: "queryId",   type: "uint256"  },
        { indexed: false, name: "timestamp", type: "uint256"  },
      ],
      name: "QueryPaid",
      type: "event",
    }
  ];

  const contractAddress = '0x3c839797BA135457Eca83f8C20f2335A817899b5';
  
  try {
    const logs = await getContractEventsInChunks(publicClient, {
      address: contractAddress,
      abi: PAY_PER_QUERY_ABI,
      eventName: "QueryPaid",
      fromBlock: 72201630n,
      toBlock: 'latest'
    });
    console.log(`Success! Total logs length: ${logs.length}`);
  } catch (err) {
    console.error("Failed to run chunked logs fetch:", err);
  }
}

test();
