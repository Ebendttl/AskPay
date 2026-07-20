const { createPublicClient, http } = require('viem');
const { celo } = require('viem/chains');

const rpcProviders = [
  'https://forno.celo.org',
  'https://rpc.ankr.com/celo',
  'https://1rpc.io/celo',
  'https://celo.drpc.org',
  'https://celo-mainnet.gateway.pokt.network/v1/lb/62c0e7b75b9e0f003b123456'
];

async function testProvider(rpcUrl) {
  console.log(`Testing RPC: ${rpcUrl}`);
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(rpcUrl)
  });

  const contractAddress = '0x3c839797BA135457Eca83f8C20f2335A817899b5';
  
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
      fromBlock: 72201638n,
      toBlock: 'latest'
    });
    console.log(`  => SUCCESS! Logs length: ${logs.length}`);
    return true;
  } catch (err) {
    console.log(`  => FAILED: ${err.message || err.details || err}`);
    return false;
  }
}

async function run() {
  for (const rpc of rpcProviders) {
    await testProvider(rpc);
  }
}

run();
