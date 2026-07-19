import { describe, it, expect, vi } from 'vitest';
import { verifyPayment, PaymentVerificationError } from '../src/index';
import { parseEventLogs, Address, Hash } from 'viem';

vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    parseEventLogs: vi.fn(),
  };
});

describe('verifyPayment', () => {
  const mockPublicClient = {
    getTransactionReceipt: vi.fn(),
  };

  const expectedReceiver: Address = '0x1234567890123456789012345678901234567890';
  const txHash: Hash = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
  const expectedPayer: Address = '0xpayer00000000000000000000000000000000000';

  it('throws an error if receipt is not found', async () => {
    mockPublicClient.getTransactionReceipt.mockRejectedValueOnce(new Error('not found'));
    
    await expect(verifyPayment({
      publicClient: mockPublicClient,
      txHash,
      expectedReceiver,
    })).rejects.toThrowError(PaymentVerificationError);
  });

  it('throws an error if transaction failed', async () => {
    mockPublicClient.getTransactionReceipt.mockResolvedValueOnce({
      status: 'reverted',
    });
    
    await expect(verifyPayment({
      publicClient: mockPublicClient,
      txHash,
      expectedReceiver,
    })).rejects.toThrowError(PaymentVerificationError);
  });

  it('verifies a custom event successfully', async () => {
    const mockReceipt = {
      status: 'success',
      to: expectedReceiver,
      from: expectedPayer,
      logs: [],
      blockNumber: 1234n,
    };
    mockPublicClient.getTransactionReceipt.mockResolvedValueOnce(mockReceipt);

    const mockParsedLog = {
      args: {
        payer: expectedPayer,
        amount: 50n,
      }
    };
    vi.mocked(parseEventLogs).mockReturnValueOnce([mockParsedLog as any]);

    const result = await verifyPayment({
      publicClient: mockPublicClient,
      txHash,
      expectedReceiver,
      customEvent: {
        abi: [],
        eventName: 'QueryPaid',
      }
    });

    expect(result.success).toBe(true);
    expect(result.amount).toBe(50n);
    expect(result.payer).toBe(expectedPayer);
  });
});
