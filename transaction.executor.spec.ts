import { Event, OperationStatus, TransactionExecutor } from "./transaction.executor";
import { FailToCommitButShouldNotCompensteTransaction, FailToCommitTransaction, FailToCompensateTransaction, FailWhenOnCommitFailIsCalledTransaction } from "./transaction.executor.mocks";
import { ActionOneTransaction } from "./transactions/action-one.transaction";
import { ActionThreeTransaction } from "./transactions/action-three.transaction";
import { ActionTwoTransaction } from "./transactions/action-two.transaction";
import { Transaction } from "./transactions/base.transaction";

describe('Distributed transactions', () => {

    it.each([
        null,
        undefined,
        []
    ])('should not fail when no transaction is used %p', async (param: any) => {
        const context: any = 'my context';

        const results = await new TransactionExecutor(param).commit(context);

        expect(results).toHaveLength(0);
    });

    it('should execute all the transactions successfully', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new ActionOneTransaction(),
            new ActionTwoTransaction(),
            new ActionThreeTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
            expectSuccess(result, transactions[index]);
        });
    });

    it('should fail on first operation and execute no compensation action', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new FailToCommitTransaction(),
            new ActionTwoTransaction(),
            new ActionThreeTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(1);
        results.forEach((result, index) => {
            expectFailure(result, transactions[index]);
        });
    });

    it('should fail on the second operation and execute one compensation action', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new ActionOneTransaction(),
            new FailToCommitTransaction(),
            new ActionOneTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(2);
        expectSuccess(results[0], transactions[0]);
        expectFailure(results[1], transactions[1]);

        expect(results[1].compensations).toHaveLength(1);
        expectSuccess(results[1].compensations![0], transactions[0]);
    });

    it('should fail on the third operation and compensate all previous commits', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new ActionOneTransaction(),
            new ActionTwoTransaction(),
            new FailToCommitTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(3);
        expectSuccess(results[0], transactions[0]);
        expectSuccess(results[1], transactions[1]);
        expectFailure(results[2], transactions[2]);

        const compensations = results[2].compensations!;

        expect(compensations).toHaveLength(2);
        expectSuccess(compensations![0], transactions[0]);
        expectSuccess(compensations![1], transactions[1]);
    });

    it('should fail on the third operation and fail to compensate one of the previous operations', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new ActionOneTransaction(),
            new FailToCompensateTransaction(),
            new FailToCommitTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(3);
        expectSuccess(results[0], transactions[0]);
        expectSuccess(results[1], transactions[1]);
        expectFailure(results[2], transactions[2]);

        const compensations = results[2].compensations!;

        expect(compensations).toHaveLength(2);
        expectSuccess(compensations![0], transactions[0]);
        expectInconsistency(compensations![1], transactions[1]);
    });

    it('should fail on the third operation and should not compensate any of the previous operations', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new ActionOneTransaction(),
            new ActionTwoTransaction(),
            new FailToCommitButShouldNotCompensteTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(3);
        expectSuccess(results[0], transactions[0]);
        expectSuccess(results[1], transactions[1]);
        expectFailure(results[2], transactions[2]);

        const compensations = results[2].compensations!;

        expect(compensations).toHaveLength(0);
    });

    it('should fail on the third operation and the onCommitFail step', async () => {
        const context: any = 'my context';

        const transactions: Transaction[] = [
            new ActionOneTransaction(),
            new ActionTwoTransaction(),
            new FailWhenOnCommitFailIsCalledTransaction()
        ];

        const results = await new TransactionExecutor(transactions).commit(context);

        expect(results).toHaveLength(3);
        expectSuccess(results[0], transactions[0]);
        expectSuccess(results[1], transactions[1]);
        expectInconsistency(results[2], transactions[2]);

        const compensations = results[2].compensations!;

        expect(compensations).toHaveLength(0);
    });
});

function expectSuccess(result: Event, saga: Transaction) {
    expect(result.status).toBe(OperationStatus.SUCCESS);
    expect(result.operation).toBe(saga.toString());
}

function expectFailure(result: Event, saga: Transaction) {
    expect(result.status).toBe(OperationStatus.FAILURE);
    expect(result.operation).toBe(saga.toString());
}

function expectInconsistency(result: Event, transaction: Transaction) {
    expect(result.status).toBe(OperationStatus.INCONSISTENCY);
    expect(result.operation).toBe(transaction.toString());
}