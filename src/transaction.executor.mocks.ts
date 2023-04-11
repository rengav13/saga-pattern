import { CompensationRule } from "./transaction.executor";
import { Transaction } from "./transactions/base.transaction";

export class FailToCommitTransaction implements Transaction {

    commit(context: any): Promise<any> {
        throw new Error('Fail to commit operation.');
    }

    onCommitFail(context: any): Promise<any> {
        return Promise.resolve(CompensationRule.COMPENSATE);
    }

    compensate(context: any): Promise<any> {
        return Promise.resolve();
    }
}

export class FailToCompensateTransaction implements Transaction {

    commit(context: any): Promise<any> {
        return Promise.resolve();
    }

    onCommitFail(context: any): Promise<any> {
        return Promise.resolve(CompensationRule.COMPENSATE);
    }

    compensate(context: any): Promise<any> {
        throw new Error('Fail to compensate.');
    }
}

export class FailWhenOnCommitFailIsCalledTransaction implements Transaction {

    commit(context: any): Promise<any> {
        throw new Error('Fail to commit operation.');
    }

    onCommitFail(context: any): Promise<any> {
        throw new Error('Fail on onCommitFail.');
    }

    compensate(context: any): Promise<any> {
        return Promise.resolve();
    }
}

export class FailToCommitButShouldNotCompensteTransaction implements Transaction {

    commit(context: any): Promise<any> {
        throw new Error('Fail to commit operation.');
    }

    onCommitFail(context: any): Promise<any> {
        return Promise.resolve(CompensationRule.NO_COMPENSATE);
    }

    compensate(context: any): Promise<any> {
        return Promise.resolve();
    }
}
