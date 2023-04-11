import { CompensationRule } from "../transaction.executor";
import { Transaction } from "./base.transaction";

export class ActionOneTransaction implements Transaction {

    commit(args: any): Promise<any> {
        console.log('commit action 1');
        return Promise.resolve();
    }

    onCommitFail(args: any): Promise<any> {
        console.log('commit fail on action 1');
        return Promise.resolve(CompensationRule.COMPENSATE);
    }

    compensate(args: any): Promise<any> {
        console.log('compensate action 1');
        return Promise.resolve();
    }

    toString() {
        return ActionOneTransaction.name;
    }
}