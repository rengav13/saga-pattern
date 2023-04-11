import { Transaction } from "./transactions/base.transaction";

export enum OperationStatus {
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE',
    INCONSISTENCY = 'INCONSISTENCY'
}

export enum CompensationRule {
    COMPENSATE,
    NO_COMPENSATE
}

export type Event = {
    status: OperationStatus,
    operation: string,
    result: any,
    compensations?: Event[]
}

export class TransactionExecutor {
    private transactions: Transaction[];

    constructor(transactions?: Transaction[]) {
        this.transactions = transactions ?? [];
    }

    public async commit(context: any): Promise<Event[]> {
        const events = [];

        for (let index = 0; index < this.transactions.length; index++) {
            try {
                const result = await this.transactions[index].commit(context);
                events.push({
                    operation: this.transactions[index].toString(),
                    result,
                    status: OperationStatus.SUCCESS
                });
            } catch (error: any) {
                context = { error, ...context };
                await this.handleOnCommitFail(index, events, context);
                break;
            }
        }

        return events;
    }

    private async handleOnCommitFail(index: number, events: Event[], context: any) {
        const { error } = context;
        try {
            const compensate = await this.transactions[index].onCommitFail(context);
            if (compensate === CompensationRule.COMPENSATE) {
                const compensationEvents = await this.compensate(this.transactions.slice(0, index), context)
                events.push({
                    operation: this.transactions[index].toString(),
                    compensations: compensationEvents,
                    result: error,
                    status: OperationStatus.FAILURE
                });
            } else {
                events.push({
                    operation: this.transactions[index].toString(),
                    compensations: [],
                    result: error,
                    status: OperationStatus.FAILURE

                });
            }
        } catch (error) {
            events.push({
                operation: this.transactions[index].toString(),
                compensations: [],
                result: error,
                status: OperationStatus.INCONSISTENCY

            });
        }
    }

    private async compensate(sagas: Transaction[], context: any): Promise<any> {
        const events = [];

        for (let index = 0; index < sagas.length; index++) { // edge cases must be tested
            try {
                const result = await sagas[index].compensate(context); // if the order of execution does not matter, promises can be used
                events.push({
                    operation: this.transactions[index].toString(),
                    result,
                    status: OperationStatus.SUCCESS
                });
            } catch (err: any) {
                // Something really bad happened, we must save the state along with as MUCH information as possible
                // a notification can be sent to slack
                // system is in an inconsitent state
                events.push({
                    operation: this.transactions[index].toString(),
                    result: err.message,
                    status: OperationStatus.INCONSISTENCY
                })
            }
        }

        return events;
    }
}
