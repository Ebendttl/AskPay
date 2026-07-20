import { createPublicClient, http } from 'viem';
import { celo } from 'viem/chains';
import { getContractEventsInChunks, PAY_PER_QUERY_ABI } from './src/lib/contracts';

async function test() {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org')
  });

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
