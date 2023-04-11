import { CompensationRule } from "../transaction.executor";
import { Transaction } from "./base.transaction";

export class ActionTwoTransaction implements Transaction {
    
    commit(args: any): Promise<any> {
        console.log('commit action 2');
        return Promise.resolve();
    }

    onCommitFail(args: any): Promise<any> {
        console.log('commit fail on action 2');
        return Promise.resolve(CompensationRule.COMPENSATE);
    }
    
    compensate(args: any): Promise<any> {
        console.log('compensate action 2');
        return Promise.resolve();
    }

    toString() {
        return ActionTwoTransaction.name;
    }
}
